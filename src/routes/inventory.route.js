const express = require("express");

const authenticate = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/rbac.middleware");
const validate = require("../middlewares/validation.middleware");

const { ROLES } = require("../config/constants");

const {
  createInventorySchema,
  updateInventorySchema,
  stockAdjustmentSchema
} = require("../schemas/inventory.schema");

const inventoryController = require("../controllers/inventory.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory management APIs
 */

/*
 * All seller inventory routes require authentication
 * and are restricted to Farmer/FPO users.
 */
router.use(
  authenticate,
  requireRole(ROLES.FARMER, ROLES.FPO)
);


/**
 * @swagger
 * /api/inventory:
 *   post:
 *     summary: Create inventory
 *     description: Create inventory for an active product owned by the authenticated Farmer/FPO.
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InventoryCreateRequest'
 *     responses:
 *       201:
 *         description: Inventory created successfully
 *       400:
 *         description: Invalid request or inactive product
 *       403:
 *         description: User does not own the product
 *       409:
 *         description: Inventory already exists for the product
 */
router.post(
  "/",
  validate(createInventorySchema),
  inventoryController.createInventory
);


/**
 * @swagger
 * /api/inventory/my:
 *   get:
 *     summary: Get my inventory
 *     description: Get inventory for products owned by the authenticated Farmer/FPO.
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory fetched successfully
 */
router.get(
  "/my",
  inventoryController.getMyInventory
);


/**
 * @swagger
 * /api/inventory/my/{id}:
 *   get:
 *     summary: Get my inventory item
 *     description: Get a specific inventory record owned by the authenticated Farmer/FPO.
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
 *       403:
 *         description: User does not own the inventory
 *       404:
 *         description: Inventory not found
 */
router.get(
  "/my/:id",
  inventoryController.getMyInventoryById
);


/**
 * @swagger
 * /api/inventory/my/{id}:
 *   patch:
 *     summary: Update my inventory
 *     description: Update total stock or low-stock threshold for an owned inventory record.
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
 *             $ref: '#/components/schemas/InventoryUpdateRequest'
 *     responses:
 *       200:
 *         description: Inventory updated successfully
 *       400:
 *         description: Invalid stock values
 *       403:
 *         description: User does not own the inventory
 *       404:
 *         description: Inventory not found
 */
router.patch(
  "/my/:id",
  validate(updateInventorySchema),
  inventoryController.updateMyInventory
);


/**
 * @swagger
 * /api/inventory/my/{id}/stock:
 *   patch:
 *     summary: Adjust my stock
 *     description: Add or remove physical stock from an owned inventory record.
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
 *             $ref: '#/components/schemas/StockAdjustmentRequest'
 *     responses:
 *       200:
 *         description: Stock adjusted successfully
 *       400:
 *         description: Invalid stock operation or quantity
 *       403:
 *         description: User does not own the inventory
 *       404:
 *         description: Inventory not found
 */
router.patch(
  "/my/:id/stock",
  validate(stockAdjustmentSchema),
  inventoryController.adjustMyStock
);


module.exports = router;