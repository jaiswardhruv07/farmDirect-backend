const express = require("express");

const authenticate = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/rbac.middleware");
const validate = require("../middlewares/validation.middleware");

const { ROLES } = require("../config/constants");

const {
  adminCreateInventorySchema,
  adminUpdateInventorySchema,
  adminStockAdjustmentSchema
} = require("../schemas/inventory.schema");

const inventoryController = require("../controllers/inventory.controller");

const router = express.Router();

/*
 * All Admin inventory routes require authentication
 * and ADMIN role.
 */
router.use(
  authenticate,
  requireRole(ROLES.ADMIN)
);


/**
 * @swagger
 * /api/admin/inventory:
 *   post:
 *     summary: Create inventory
 *     description: Create inventory for an active Farmer/FPO product.
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminInventoryCreateRequest'
 *     responses:
 *       201:
 *         description: Inventory created successfully
 *       400:
 *         description: Invalid product or stock values
 *       404:
 *         description: Product or seller profile not found
 *       409:
 *         description: Inventory already exists
 */
router.post(
  "/",
  validate(adminCreateInventorySchema),
  inventoryController.adminCreateInventory
);


/**
 * @swagger
 * /api/admin/inventory:
 *   get:
 *     summary: Get all inventory
 *     description: Get all inventory records. Use lowStock=true to filter low-stock inventory.
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lowStock
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Return only inventory where available stock is at or below the configured threshold.
 *     responses:
 *       200:
 *         description: Inventory fetched successfully
 */
router.get(
  "/",
  inventoryController.getAdminInventory
);


/**
 * @swagger
 * /api/admin/inventory/{id}:
 *   get:
 *     summary: Get inventory item
 *     description: Get a specific inventory record.
 *     tags: [Inventory]
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
 *         description: Inventory fetched successfully
 *       404:
 *         description: Inventory not found
 */
router.get(
  "/:id",
  inventoryController.getAdminInventoryById
);


/**
 * @swagger
 * /api/admin/inventory/{id}:
 *   patch:
 *     summary: Update inventory
 *     description: Update total stock or low-stock threshold.
 *     tags: [Inventory]
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
 *             $ref: '#/components/schemas/AdminInventoryUpdateRequest'
 *     responses:
 *       200:
 *         description: Inventory updated successfully
 *       400:
 *         description: Invalid stock values
 *       404:
 *         description: Inventory not found
 */
router.patch(
  "/:id",
  validate(adminUpdateInventorySchema),
  inventoryController.adminUpdateInventory
);


/**
 * @swagger
 * /api/admin/inventory/{id}/stock:
 *   patch:
 *     summary: Adjust inventory stock
 *     description: Add or remove physical stock.
 *     tags: [Inventory]
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
 *             $ref: '#/components/schemas/AdminStockAdjustmentRequest'
 *     responses:
 *       200:
 *         description: Stock adjusted successfully
 *       400:
 *         description: Invalid stock operation or quantity
 *       404:
 *         description: Inventory not found
 */
router.patch(
  "/:id/stock",
  validate(adminStockAdjustmentSchema),
  inventoryController.adminAdjustStock
);


module.exports = router;