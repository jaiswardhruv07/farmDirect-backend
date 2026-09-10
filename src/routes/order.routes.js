const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const { requireRole } = require("../middlewares/rbac.middleware");

const { ROLES } = require("../config/constants");

const {
  createOrderSchema,
  cancelOrderSchema,
  sellerStatusUpdateSchema
} = require("../schemas/order.schema");

const orderController = require("../controllers/order.controller");

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid request or insufficient stock
 *       401:
 *         description: Authentication required
 *       403:
 *         description: User is not allowed to place orders
 */
router.post(
  "/",
  authenticate,
  requireRole(ROLES.CONSUMER, ROLES.BULK_BUYER),
  validate(createOrderSchema),
  orderController.createOrder
);

/**
 * @swagger
 * /api/orders/my:
 *   get:
 *     summary: Get current user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - PENDING
 *             - CONFIRMED
 *             - PROCESSING
 *             - READY_FOR_DISPATCH
 *             - SHIPPED
 *             - DELIVERED
 *             - CANCELLED
 *             - FAILED
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
 *       401:
 *         description: Authentication required
 */
router.get(
  "/my",
  authenticate,
  requireRole(ROLES.CONSUMER, ROLES.BULK_BUYER),
  orderController.getMyOrders
);

/**
 * @swagger
 * /api/orders/my/{id}:
 *   get:
 *     summary: Get current user's order by ID
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
  "/my/:id",
  authenticate,
  requireRole(ROLES.CONSUMER, ROLES.BULK_BUYER),
  orderController.getMyOrderById
);

/**
 * @swagger
 * /api/orders/my/{id}/cancel:
 *   patch:
 *     summary: Cancel current user's order
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
 *       404:
 *         description: Order not found
 */
router.patch(
  "/my/:id/cancel",
  authenticate,
  requireRole(ROLES.CONSUMER, ROLES.BULK_BUYER),
  validate(cancelOrderSchema),
  orderController.cancelMyOrder
);

/**
 * @swagger
 * /api/orders/seller:
 *   get:
 *     summary: Get orders containing the seller's products
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller orders retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Farmer or FPO role required
 */
router.get(
  "/seller",
  authenticate,
  requireRole(ROLES.FARMER, ROLES.FPO),
  orderController.getSellerOrders
);

/**
 * @swagger
 * /api/orders/seller/{id}/status:
 *   patch:
 *     summary: Update a seller order status
 *     tags:
 *       - Orders
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
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - CONFIRMED
 *                   - PROCESSING
 *                   - READY_FOR_DISPATCH
 *                   - SHIPPED
 *     responses:
 *       200:
 *         description: Seller order status updated successfully
 *       400:
 *         description: Invalid status transition
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Farmer or FPO role required
 *       404:
 *         description: Seller order not found
 */
router.patch(
  "/seller/:id/status",
  authenticate,
  requireRole(ROLES.FARMER, ROLES.FPO),
  validate(sellerStatusUpdateSchema),
  orderController.updateSellerOrderStatus
);

module.exports = router;
