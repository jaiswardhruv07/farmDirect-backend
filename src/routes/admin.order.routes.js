const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const { requireRole } = require("../middlewares/rbac.middleware");

const {
  ROLES
} = require("../config/constants");

const {
  adminStatusUpdateSchema,
  adminCancelOrderSchema
} = require("../schemas/order.schema");

const orderController = require("../controllers/order.controller");

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: buyerId
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       403:
 *         description: Admin access required
 */
router.get(
  "/",
  authenticate,
  requireRole(ROLES.ADMIN),
  orderController.getAdminOrders
);

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   get:
 *     summary: Get any order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *       404:
 *         description: Order not found
 */
router.get(
  "/:id",
  authenticate,
  requireRole(ROLES.ADMIN),
  orderController.getAdminOrderById
);

/**
 * @swagger
 * /api/admin/orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminOrderStatusUpdateRequest'
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid status transition
 */
router.patch(
  "/:id/status",
  authenticate,
  requireRole(ROLES.ADMIN),
  validate(adminStatusUpdateSchema),
  orderController.updateOrderStatus
);

/**
 * @swagger
 * /api/admin/orders/{id}/cancel:
 *   patch:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CancelOrderRequest'
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       400:
 *         description: Order cannot be cancelled
 */
router.patch(
  "/:id/cancel",
  authenticate,
  requireRole(ROLES.ADMIN),
  validate(adminCancelOrderSchema),
  orderController.cancelAdminOrder
);

module.exports = router;