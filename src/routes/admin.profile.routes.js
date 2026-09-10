const express = require("express");

const {
  getPendingProfilesController,
  approveProfileController,
  rejectProfileController
} = require("../controllers/profile.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Admin Profile Verification Routes
|--------------------------------------------------------------------------
*/

/**
 * @swagger
 * /api/admin/profiles/pending:
 *   get:
 *     summary: Get pending profiles
 *     description: |
 *       Retrieves all pending farmer, bulk buyer, FPO and government
 *       officer profiles that require administrative verification.
 *
 *       Only ADMIN users can access this endpoint.
 *
 *       The returned profiles are ordered by creation date, with the
 *       newest profiles appearing first.
 *     tags:
 *       - Admin Profiles
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
router.get("/pending", authMiddleware, getPendingProfilesController);

/**
 * @swagger
 * /api/admin/profiles/{profileType}/{profileId}/approve:
 *   patch:
 *     summary: Approve a profile
 *     description: |
 *       Approves a pending farmer, bulk buyer, FPO or government officer
 *       profile.
 *
 *       The verification status is changed from PENDING to VERIFIED.
 *       The ID of the approving administrator and the approval timestamp
 *       are recorded automatically.
 *
 *       The client does not need to send a request body.
 *
 *       Only ADMIN users can perform this operation.
 *     tags:
 *       - Admin Profiles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileType
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - farmer
 *             - bulk-buyer
 *             - fpo
 *             - government
 *
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *           format: object-id
 *           example: 68c8f3a1234567890abcdef1
 *
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
  "/:profileType/:profileId/approve",
  authMiddleware,
  approveProfileController
);

/**
 * @swagger
 * /api/admin/profiles/{profileType}/{profileId}/reject:
 *   patch:
 *     summary: Reject a profile
 *     description: |
 *       Rejects a pending farmer, bulk buyer, FPO or government officer
 *       profile.
 *
 *       The verification status is changed from PENDING to REJECTED.
 *       The ID of the rejecting administrator, rejection timestamp and
 *       rejection reason are recorded automatically.
 *
 *       A rejection reason is required and cannot exceed 500 characters.
 *
 *       Only ADMIN users can perform this operation.
 *     tags:
 *       - Admin Profiles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileType
 *         required: true
 *         description: Type of profile being rejected.
 *         schema:
 *           type: string
 *           enum:
 *             - farmer
 *             - bulk-buyer
 *             - fpo
 *             - government
 *
 *       - in: path
 *         name: profileId
 *         required: true
 *         description: MongoDB ObjectId of the profile.
 *         schema:
 *           type: string
 *           format: object-id
 *           example: 68c8f3a1234567890abcdef1
 *
 *     requestBody:
 *       required: true
 *       description: Reason for rejecting the profile.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rejectionReason
 *             properties:
 *               rejectionReason:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 example: GST details could not be verified.
 *
 *     responses:
 *       200:
 *         description: Profile rejected successfully
 *       400:
 *         description: Invalid profile ID, profile type, or missing/invalid rejection reason
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
  "/:profileType/:profileId/reject",
  authMiddleware,
  rejectProfileController
);

module.exports = router;
