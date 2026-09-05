const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const { requireRole } = require("../middlewares/rbac.middleware");

const {
  ROLES
} = require("../config/constants");

const {
  createOrderSchema,
  cancelOrderSchema
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
  requireRole(
    ROLES.CONSUMER,
    ROLES.BULK_BUYER
  ),
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
  requireRole(
    ROLES.CONSUMER,
    ROLES.BULK_BUYER
  ),
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
  requireRole(
    ROLES.CONSUMER,
    ROLES.BULK_BUYER
  ),
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
  requireRole(
    ROLES.CONSUMER,
    ROLES.BULK_BUYER
  ),
  validate(cancelOrderSchema),
  orderController.cancelMyOrder
);

module.exports = router;