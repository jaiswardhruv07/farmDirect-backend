
const express = require("express");

const router = express.Router();

const productController = require("../controllers/product.controller");

const authenticate =
  require("../middlewares/auth.middleware");

const {
  requireRole
} = require("../middlewares/rbac.middleware");

const validate =
  require("../middlewares/validation.middleware");




const {
  ROLES
} = require("../config/constants");

const {
  adminCreateProductSchema,
  adminUpdateProductSchema,
  rejectProductSchema
} = require("../schemas/product.schema");

/*
|--------------------------------------------------------------------------
| Admin Product Routes
|--------------------------------------------------------------------------
*/

router.use(
  authenticate,
  requireRole(ROLES.ADMIN)
);

/*
|--------------------------------------------------------------------------
| Create Product
|--------------------------------------------------------------------------
*/

/**
 * @swagger
 * /api/admin/products:
 *   post:
 *     summary: Create a product on behalf of a Farmer or FPO
 *     description: Creates an approved and active product for an existing Farmer or FPO seller.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminProductCreateRequest'
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 */
router.post(
  "/",
  validate(adminCreateProductSchema),
  productController.adminCreateProduct
);

/*
|--------------------------------------------------------------------------
| Get All Products
|--------------------------------------------------------------------------
*/

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     summary: Get all products
 *     description: Returns products for the Admin dashboard.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING_APPROVAL, ACTIVE, REJECTED, INACTIVE]
 *       - in: query
 *         name: sellerType
 *         schema:
 *           type: string
 *           enum: [FARMER, FPO]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [VEGETABLE, FRUIT, GRAIN, PULSE, SPICE, OTHER]
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 */
router.get(
  "/",
  productController.getAdminProducts
);

/*
|--------------------------------------------------------------------------
| Pending Products
|--------------------------------------------------------------------------
|
| IMPORTANT: This route must appear before /:id.
|--------------------------------------------------------------------------
*/

/**
 * @swagger
 * /api/admin/products/pending:
 *   get:
 *     summary: Get products pending approval
 *     description: Returns all Farmer/FPO products waiting for Admin review.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending products fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 */
router.get(
  "/pending",
  productController.getPendingProducts
);

/*
|--------------------------------------------------------------------------
| Approve / Reject
|--------------------------------------------------------------------------
*/

/**
 * @swagger
 * /api/admin/products/{id}/approve:
 *   patch:
 *     summary: Approve a product
 *     description: Approves a pending product and makes it visible on the public marketplace.
 *     tags:
 *       - Admin
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
 *         description: Product approved successfully
 *       400:
 *         description: Product is not pending approval
 *       404:
 *         description: Product not found
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 */
router.patch(
  "/:id/approve",
  productController.approveProduct
);

/**
 * @swagger
 * /api/admin/products/{id}/reject:
 *   patch:
 *     summary: Reject a product
 *     description: Rejects a pending product. A rejection reason is required.
 *     tags:
 *       - Admin
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
 *             $ref: '#/components/schemas/ProductRejectRequest'
 *     responses:
 *       200:
 *         description: Product rejected successfully
 *       400:
 *         description: Invalid request or product is not pending
 *       404:
 *         description: Product not found
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 */
router.patch(
  "/:id/reject",
  validate(rejectProductSchema),
  productController.rejectProduct
);

/*
|--------------------------------------------------------------------------
| Get Product
|--------------------------------------------------------------------------
*/

/**
 * @swagger
 * /api/admin/products/{id}:
 *   get:
 *     summary: Get a product as Admin
 *     description: Returns any product regardless of its current status.
 *     tags:
 *       - Admin
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
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 */
router.get(
  "/:id",
  productController.getAdminProductById
);

/*
|--------------------------------------------------------------------------
| Update Product
|--------------------------------------------------------------------------
*/

/**
 * @swagger
 * /api/admin/products/{id}:
 *   patch:
 *     summary: Update a product as Admin
 *     description: Allows Admin to update product information, seller assignment, or operational status.
 *     tags:
 *       - Admin
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
 *             $ref: '#/components/schemas/AdminProductUpdateRequest'
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
 *         description: Admin role required
 */
router.patch(
  "/:id",
  validate(adminUpdateProductSchema),
  productController.adminUpdateProduct
);

/*
|--------------------------------------------------------------------------
| Delete Product
|--------------------------------------------------------------------------
*/

/**
 * @swagger
 * /api/admin/products/{id}:
 *   delete:
 *     summary: Delete a product as Admin
 *     description: Allows Admin to delete any product.
 *     tags:
 *       - Admin
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
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 */
router.delete(
  "/:id",
  productController.adminDeleteProduct
);

module.exports = router;

