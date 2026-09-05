const Joi = require("joi");

const { ORDER_STATUS } = require("../enums/order.enum");

const orderItemCreateSchema = Joi.object({
  productId: Joi.string().hex().length(24).required(),

  quantity: Joi.number()
    .greater(0)
    .required()
}).unknown(false);

const orderAddressSchema = Joi.object({
  addressLine1: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .required(),

  addressLine2: Joi.string()
    .trim()
    .max(200)
    .allow("", null)
    .default(null),

  village: Joi.string()
    .trim()
    .max(100)
    .allow("", null)
    .default(null),

  city: Joi.string()
    .trim()
    .max(100)
    .allow("", null)
    .default(null),

  district: Joi.string()
    .trim()
    .max(100)
    .required(),

  state: Joi.string()
    .trim()
    .max(100)
    .required(),

  pincode: Joi.string()
    .pattern(/^[1-9][0-9]{5}$/)
    .required()
}).unknown(false);

const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(orderItemCreateSchema)
    .min(1)
    .required(),

  deliveryAddress: orderAddressSchema.required()
}).unknown(false);

const cancelOrderSchema = Joi.object({
  reason: Joi.string()
    .trim()
    .max(500)
    .allow("", null)
    .default(null)
}).unknown(false);

const adminStatusUpdateSchema = Joi.object({
  status: Joi.string()
    .valid(
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.PROCESSING,
      ORDER_STATUS.READY_FOR_DISPATCH,
      ORDER_STATUS.SHIPPED,
      ORDER_STATUS.DELIVERED,
      ORDER_STATUS.FAILED
    )
    .required()
}).unknown(false);

const adminCancelOrderSchema = Joi.object({
  reason: Joi.string()
    .trim()
    .max(500)
    .allow("", null)
    .default(null)
}).unknown(false);

module.exports = {
  createOrderSchema,
  cancelOrderSchema,
  adminStatusUpdateSchema,
  adminCancelOrderSchema
};