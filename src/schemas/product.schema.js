const Joi = require("joi");

const {
  PRODUCT_SELLER_TYPE,
  PRODUCT_CATEGORY,
  PRODUCT_UNIT,
  PRODUCT_QUALITY_GRADE
} = require("../enums/product.enum");

/*
 * Common product fields
 *
 * These are fields that describe the actual product.
 * Seller identity and approval fields are intentionally excluded.
 */
const productFields = {
  name: Joi.string().trim().min(2).max(150).required(),

  category: Joi.string()
    .valid(...Object.values(PRODUCT_CATEGORY))
    .required(),

  variety: Joi.string().trim().max(100).allow("", null),

  description: Joi.string().trim().max(1000).allow("", null),

  unit: Joi.string()
    .valid(...Object.values(PRODUCT_UNIT))
    .required(),

  pricePerUnit: Joi.number().min(0).required(),

  minimumOrderQuantity: Joi.number().greater(0).required(),

  images: Joi.array().items(Joi.string().trim().uri()).max(10).default([]),

  qualityGrade: Joi.string()
    .valid(...Object.values(PRODUCT_QUALITY_GRADE))
    .required(),

  organic: Joi.boolean().default(false),

  harvestDate: Joi.date().iso().max("now").allow(null)
};

/*
 * Farmer/FPO product creation
 *
 * sellerType is determined from the authenticated user.
 * sellerId is also determined by the backend.
 */
const createProductSchema = Joi.object(productFields).required().unknown(false);

/*
 * Updating a Farmer/FPO product
 *
 * All product fields are optional during PATCH.
 */
const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150),

  category: Joi.string().valid(...Object.values(PRODUCT_CATEGORY)),

  variety: Joi.string().trim().max(100).allow("", null),

  description: Joi.string().trim().max(1000).allow("", null),

  unit: Joi.string().valid(...Object.values(PRODUCT_UNIT)),

  pricePerUnit: Joi.number().min(0),

  minimumOrderQuantity: Joi.number().greater(0),

  images: Joi.array().items(Joi.string().trim().uri()).max(10),

  qualityGrade: Joi.string().valid(...Object.values(PRODUCT_QUALITY_GRADE)),

  organic: Joi.boolean(),

  harvestDate: Joi.date().iso().max("now").allow(null)
})
  .min(1)
  .unknown(false);

/*
 * Admin product creation
 *
 * Admin must specify which Farmer/FPO owns the product.
 */
const adminCreateProductSchema = Joi.object({
  sellerType: Joi.string()
    .valid(...Object.values(PRODUCT_SELLER_TYPE))
    .required(),

  sellerId: Joi.string().hex().length(24).required(),

  ...productFields
}).unknown(false);

/*
 * Admin product update
 */
const adminUpdateProductSchema = Joi.object({
  sellerType: Joi.string().valid(...Object.values(PRODUCT_SELLER_TYPE)),

  sellerId: Joi.string().hex().length(24),

  name: Joi.string().trim().min(2).max(150),

  category: Joi.string().valid(...Object.values(PRODUCT_CATEGORY)),

  variety: Joi.string().trim().max(100).allow("", null),

  description: Joi.string().trim().max(1000).allow("", null),

  unit: Joi.string().valid(...Object.values(PRODUCT_UNIT)),

  pricePerUnit: Joi.number().min(0),

  minimumOrderQuantity: Joi.number().greater(0),

  images: Joi.array().items(Joi.string().trim().uri()).max(10),

  qualityGrade: Joi.string().valid(...Object.values(PRODUCT_QUALITY_GRADE)),

  organic: Joi.boolean(),

  harvestDate: Joi.date().iso().max("now").allow(null),

  status: Joi.string().valid("ACTIVE", "INACTIVE")
})
  .min(1)
  .unknown(false);

/*
 * Admin rejection request
 */
const rejectProductSchema = Joi.object({
  rejectionReason: Joi.string().trim().min(1).max(500).required()
}).unknown(false);

module.exports = {
  createProductSchema,
  updateProductSchema,
  adminCreateProductSchema,
  adminUpdateProductSchema,
  rejectProductSchema
};
