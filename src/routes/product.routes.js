const express = require("express");

const router = express.Router();

const productController = require("../controllers/product.controller");

const authenticate = require("../middlewares/auth.middleware");

const { requireRole } = require("../middlewares/rbac.middleware");

const validate = require("../middlewares/validation.middleware");

const { ROLES } = require("../config/constants");

const {
  createProductSchema,
  updateProductSchema
} = require("../schemas/product.schema");

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get publicly available products
 *     description: Returns only active and approved products available on the marketplace.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search products by name.
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [VEGETABLE, FRUIT, GRAIN, PULSE, SPICE, OTHER]
 *       - in: query
 *         name: sellerType
 *         schema:
 *           type: string
 *           enum: [FARMER, FPO]
 *       - in: query
 *         name: organic
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *       500:
 *         description: Server error
 */
router.get("/", productController.getPublicProducts);

/*
|--------------------------------------------------------------------------
| Farmer / FPO Routes
|--------------------------------------------------------------------------
*/

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Submit a product for approval
 *     description: Allows an authenticated Farmer or FPO to submit a product for Admin approval.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreateRequest'
 *     responses:
 *       201:
 *         description: Product submitted successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Farmer or FPO role required
 */
router.post(
  "/",
  authenticate,
  requireRole(ROLES.FARMER, ROLES.FPO),
  validate(createProductSchema),
  productController.createProduct
);

/**
 * @swagger
 * /api/products/my:
 *   get:
 *     summary: Get my products
 *     description: Returns products belonging to the authenticated Farmer or FPO.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING_APPROVAL, ACTIVE, REJECTED, INACTIVE]
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Farmer or FPO role required
 */
router.get(
  "/my",
  authenticate,
  requireRole(ROLES.FARMER, ROLES.FPO),
  productController.getMyProducts
);

/**
 * @swagger
 * /api/products/my/{id}:
 *   get:
 *     summary: Get my product
 *     description: Returns a product belonging to the authenticated Farmer or FPO.
 *     tags:
 *       - Products
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
 *         description: Product fetched successfully
 *       404:
 *         description: Product not found
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Farmer or FPO role required
 */
router.get(
  "/my/:id",
  authenticate,
  requireRole(ROLES.FARMER, ROLES.FPO),
  productController.getMyProductById
);

/**
 * @swagger
 * /api/products/my/{id}:
 *   patch:
 *     summary: Update my product
 *     description: Updates a product owned by the authenticated Farmer or FPO.
 *     tags:
 *       - Products
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
 *             $ref: '#/components/schemas/ProductUpdateRequest'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Product not found
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Farmer or FPO role required
 */
router.patch(
  "/my/:id",
  authenticate,
  requireRole(ROLES.FARMER, ROLES.FPO),
  validate(updateProductSchema),
  productController.updateMyProduct
);

/**
 * @swagger
 * /api/products/my/{id}:
 *   delete:
 *     summary: Delete my product
 *     description: Deletes a product owned by the authenticated Farmer or FPO.
 *     tags:
 *       - Products
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
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Farmer or FPO role required
 */
router.delete(
  "/my/:id",
  authenticate,
  requireRole(ROLES.FARMER, ROLES.FPO),
  productController.deleteMyProduct
);

/*
|--------------------------------------------------------------------------
| Public Product Details
|--------------------------------------------------------------------------
|
| Keep this AFTER /my routes so "my" is not interpreted as a product ID.
|--------------------------------------------------------------------------
*/

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a public product
 *     description: Returns an active product available on the marketplace.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product fetched successfully
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 */
router.get("/:id", productController.getPublicProductById);

module.exports = router;
