const express = require("express");

const { createUserByAdmin } = require("../controllers/auth.controller");
const {
  getPendingAdminProfiles,
  approveAdminProfile,
  rejectAdminProfile
} = require("../controllers/profile.controller");

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

/**
 * @swagger
 * /api/admin/profiles/pending:
 *   get:
 *     summary: Get pending profiles
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending profiles retrieved successfully
 *       401:
 *         description: Authentication required or invalid token
 *       403:
 *         description: Only ADMIN users can perform this operation
 *       500:
 *         description: Internal server error
 */
router.get("/profiles/pending", authenticate, getPendingAdminProfiles);

/**
 * @swagger
 * /api/admin/profiles/{profileType}/{profileId}/approve:
 *   patch:
 *     summary: Approve a pending profile
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [farmer, bulk-buyer, fpo, government]
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profile approved successfully
 *       400:
 *         description: Invalid profile ID or profile type
 *       401:
 *         description: Authentication required or invalid token
 *       403:
 *         description: Only ADMIN users can perform this operation
 *       404:
 *         description: Profile not found
 *       409:
 *         description: Profile is already processed and is not pending
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/profiles/:profileType/:profileId/approve",
  authenticate,
  approveAdminProfile
);

/**
 * @swagger
 * /api/admin/profiles/{profileType}/{profileId}/reject:
 *   patch:
 *     summary: Reject a pending profile
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [farmer, bulk-buyer, fpo, government]
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rejectionReason]
 *             properties:
 *               rejectionReason:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Profile rejected successfully
 *       400:
 *         description: Invalid profile ID, profile type, or rejection reason
 *       401:
 *         description: Authentication required or invalid token
 *       403:
 *         description: Only ADMIN users can perform this operation
 *       404:
 *         description: Profile not found
 *       409:
 *         description: Profile is already processed and is not pending
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/profiles/:profileType/:profileId/reject",
  authenticate,
  rejectAdminProfile
);

module.exports = router;
