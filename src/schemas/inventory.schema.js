const Joi = require("joi");

const { INVENTORY_STOCK_OPERATION } = require("../enums/inventory.enum");

/*
 * Farmer / FPO
 * Create inventory for their own ACTIVE product.
 *
 * System-controlled fields such as:
 * - unit
 * - reservedStock
 * - lastUpdatedBy
 *
 * are intentionally excluded.
 */
const createInventorySchema = Joi.object({
  productId: Joi.string().hex().length(24).required(),

  totalStock: Joi.number().min(0).required(),

  lowStockThreshold: Joi.number().min(0).default(0)
}).unknown(false);

/*
 * Farmer / FPO inventory update.
 *
 * reservedStock cannot be modified manually.
 */
const updateInventorySchema = Joi.object({
  totalStock: Joi.number().min(0),

  lowStockThreshold: Joi.number().min(0)
})
  .min(1)
  .unknown(false);

/*
 * Manual stock adjustment.
 *
 * ADD:
 *   increases totalStock
 *
 * REMOVE:
 *   decreases totalStock
 *
 * reservedStock is not directly modified through this API.
 */
const stockAdjustmentSchema = Joi.object({
  operation: Joi.string()
    .valid(...Object.values(INVENTORY_STOCK_OPERATION))
    .required(),

  quantity: Joi.number().greater(0).required()
}).unknown(false);

/*
 * Admin inventory creation.
 *
 * Admin also does not provide:
 * - unit
 * - reservedStock
 * - lastUpdatedBy
 */
const adminCreateInventorySchema = Joi.object({
  productId: Joi.string().hex().length(24).required(),

  totalStock: Joi.number().min(0).required(),

  lowStockThreshold: Joi.number().min(0).default(0)
}).unknown(false);

/*
 * Admin inventory update.
 */
const adminUpdateInventorySchema = Joi.object({
  totalStock: Joi.number().min(0),

  lowStockThreshold: Joi.number().min(0)
})
  .min(1)
  .unknown(false);

/*
 * Admin stock adjustment.
 *
 * Uses the same ADD / REMOVE operation as sellers.
 */
const adminStockAdjustmentSchema = Joi.object({
  operation: Joi.string()
    .valid(...Object.values(INVENTORY_STOCK_OPERATION))
    .required(),

  quantity: Joi.number().greater(0).required()
}).unknown(false);

module.exports = {
  createInventorySchema,
  updateInventorySchema,
  stockAdjustmentSchema,
  adminCreateInventorySchema,
  adminUpdateInventorySchema,
  adminStockAdjustmentSchema
};
