const express = require("express");

const {
  register,
  login,
  getCurrentUser
} = require("../controllers/auth.controller");

const authenticate = require("../middlewares/auth.middleware");

const validate = require("../middlewares/validation.middleware");

const { registerSchema, loginSchema } = require("../schemas/auth.schema");

const router = express.Router();

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

router.get("/me", authenticate, getCurrentUser);

module.exports = router;
