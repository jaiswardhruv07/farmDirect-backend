const express = require("express");

const {
  createUserByAdmin
} = require("../controllers/auth.controller");

const authenticate = require("../middlewares/auth.middleware");

const {
  requirePermissions
} = require("../middlewares/rbac.middleware");

const validate = require("../middlewares/validation.middleware");

const {
  adminCreateUserSchema
} = require("../schemas/auth.schema");

const PERMISSIONS = require("../enums/permission.enum");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Admin User Onboarding
|--------------------------------------------------------------------------
*/

router.post(
  "/users",
  authenticate,
  requirePermissions(PERMISSIONS.USER_CREATE),
  validate(adminCreateUserSchema),
  createUserByAdmin
);

module.exports = router;