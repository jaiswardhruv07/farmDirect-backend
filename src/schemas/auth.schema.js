const Joi = require("joi");

const registerSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),

  lastName: Joi.string().trim().min(1).max(50).required(),

  email: Joi.string().trim().lowercase().email().max(100).required(),

  phone: Joi.string()
    .pattern(/^[6-9][0-9]{9}$/)
    .required(),

  password: Joi.string().min(8).max(72).required(),

  roleId: Joi.string().hex().length(24).required()
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),

  password: Joi.string().required()
});

module.exports = {
  registerSchema,
  loginSchema
};
