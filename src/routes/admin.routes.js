const express = require("express");

const { createUserByAdmin } = require("../controllers/auth.controller");

const authenticate = require("../middlewares/auth.middleware");

const { requirePermissions } = require("../middlewares/rbac.middleware");

const validate = require("../middlewares/validation.middleware");

const { adminCreateUserSchema } = require("../schemas/auth.schema");

const PERMISSIONS = require("../enums/permission.enum");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Admin User Onboarding
|--------------------------------------------------------------------------
*/

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Create a user through admin onboarding
 *     description: Allows an authorized administrator to onboard Bulk Buyers, FPOs, Logistics users and Government Officers.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminCreateUserRequest'
 *     responses:
 *       201:
 *         description: User onboarded successfully
 *       400:
 *         description: Invalid role or request data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: User does not have USER_CREATE permission
 *       409:
 *         description: Email or phone number already registered
 */
router.post(
  "/users",
  authenticate,
  requirePermissions(PERMISSIONS.USER_CREATE),
  validate(adminCreateUserSchema),
  createUserByAdmin
);

module.exports = router;
