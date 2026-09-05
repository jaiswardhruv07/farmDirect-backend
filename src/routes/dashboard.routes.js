const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/auth.middleware");

const dashboardController = require("../controllers/dashboard.controller");

/**
 * @swagger
 * /api/dashboard/me:
 *   get:
 *     summary: Get the dashboard for the authenticated user
 *     description: Returns a role-specific dashboard based on the authenticated user's role.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard retrieved successfully
 *       401:
 *         description: Authentication token is missing, invalid or expired
 *       403:
 *         description: User does not have access to a dashboard
 *       501:
 *         description: Dashboard functionality is not yet implemented for the user's role
 */
router.get("/me", authenticate, dashboardController.getMyDashboard);

module.exports = router;
