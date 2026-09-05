const productService = require("../services/product.service");

/*
|--------------------------------------------------------------------------
| Public Marketplace
|--------------------------------------------------------------------------
*/

/**
 * Get publicly available products.
 */
const getPublicProducts = async (req, res) => {
  try {
    const products = await productService.getPublicProducts(req.query);

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: {
        products
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get a single publicly available product.
 */
const getPublicProductById = async (req, res) => {
  try {
    const product = await productService.getPublicProductById(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: {
        product
      }
    });
  } catch (error) {
    const statusCode = error.message === "Product not found" ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| Farmer / FPO
|--------------------------------------------------------------------------
*/

/**
 * Create a product as the authenticated Farmer/FPO.
 */
const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.user, req.body);

    return res.status(201).json({
      success: true,
      message: "Product submitted successfully and is pending admin approval",
      data: {
        product
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get products belonging to the authenticated Farmer/FPO.
 */
const getMyProducts = async (req, res) => {
  try {
    const products = await productService.getMyProducts(req.user, req.query);

    return res.status(200).json({
      success: true,
      message: "Your products fetched successfully",
      data: {
        products
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get one product belonging to the authenticated Farmer/FPO.
 */
const getMyProductById = async (req, res) => {
  try {
    const product = await productService.getMyProductById(
      req.user,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: {
        product
      }
    });
  } catch (error) {
    const statusCode = error.message === "Product not found" ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update a Farmer/FPO-owned product.
 */
const updateMyProduct = async (req, res) => {
  try {
    const product = await productService.updateMyProduct(
      req.user,
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: {
        product
      }
    });
  } catch (error) {
    const statusCode = error.message === "Product not found" ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete a Farmer/FPO-owned product.
 */
const deleteMyProduct = async (req, res) => {
  try {
    await productService.deleteMyProduct(req.user, req.params.id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    const statusCode = error.message === "Product not found" ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| Admin
|--------------------------------------------------------------------------
*/

/**
 * Admin creates a product on behalf of a Farmer/FPO.
 */
const adminCreateProduct = async (req, res) => {
  try {
    const product = await productService.adminCreateProduct(req.user, req.body);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: {
        product
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get products for Admin dashboard.
 */
const getAdminProducts = async (req, res) => {
  try {
    const products = await productService.getAdminProducts(req.user, req.query);

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: {
        products
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get a single product as Admin.
 */
const getAdminProductById = async (req, res) => {
  try {
    const product = await productService.getAdminProductById(
      req.user,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: {
        product
      }
    });
  } catch (error) {
    const statusCode = error.message === "Product not found" ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update any product as Admin.
 */
const adminUpdateProduct = async (req, res) => {
  try {
    const product = await productService.adminUpdateProduct(
      req.user,
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: {
        product
      }
    });
  } catch (error) {
    const statusCode = error.message === "Product not found" ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete any product as Admin.
 */
const adminDeleteProduct = async (req, res) => {
  try {
    await productService.adminDeleteProduct(req.user, req.params.id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    const statusCode = error.message === "Product not found" ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get products waiting for approval.
 */
const getPendingProducts = async (req, res) => {
  try {
    const products = await productService.getPendingProducts(req.user);

    return res.status(200).json({
      success: true,
      message: "Pending products fetched successfully",
      data: {
        products
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Approve a product.
 */
const approveProduct = async (req, res) => {
  try {
    const product = await productService.approveProduct(
      req.user,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Product approved successfully",
      data: {
        product
      }
    });
  } catch (error) {
    const statusCode = error.message === "Product not found" ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Reject a product.
 */
const rejectProduct = async (req, res) => {
  try {
    const product = await productService.rejectProduct(
      req.user,
      req.params.id,
      req.body.rejectionReason
    );

    return res.status(200).json({
      success: true,
      message: "Product rejected successfully",
      data: {
        product
      }
    });
  } catch (error) {
    const statusCode = error.message === "Product not found" ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  // Public
  getPublicProducts,
  getPublicProductById,

  // Farmer / FPO
  createProduct,
  getMyProducts,
  getMyProductById,
  updateMyProduct,
  deleteMyProduct,

  // Admin
  adminCreateProduct,
  getAdminProducts,
  getAdminProductById,
  adminUpdateProduct,
  adminDeleteProduct,
  getPendingProducts,
  approveProduct,
  rejectProduct
};
