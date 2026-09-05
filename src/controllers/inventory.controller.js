const inventoryService = require("../services/inventory.service");

/*
 * Farmer / FPO
 * Create inventory for their own product.
 */
const createInventory = async (req, res, next) => {
  try {
    const inventory = await inventoryService.createInventory(
      req.user,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Inventory created successfully",
      data: {
        inventory
      }
    });
  } catch (error) {
    next(error);
  }
};


/*
 * Farmer / FPO
 * Get all inventory belonging to the authenticated seller.
 */
const getMyInventory = async (req, res, next) => {
  try {
    const inventory = await inventoryService.getMyInventory(
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Inventory fetched successfully",
      data: {
        inventory
      }
    });
  } catch (error) {
    next(error);
  }
};


/*
 * Farmer / FPO
 * Get one inventory record belonging to the authenticated seller.
 */
const getMyInventoryById = async (req, res, next) => {
  try {
    const inventory =
      await inventoryService.getMyInventoryById(
        req.user,
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message: "Inventory fetched successfully",
      data: {
        inventory
      }
    });
  } catch (error) {
    next(error);
  }
};


/*
 * Farmer / FPO
 * Update inventory configuration.
 */
const updateMyInventory = async (req, res, next) => {
  try {
    const inventory =
      await inventoryService.updateMyInventory(
        req.user,
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: "Inventory updated successfully",
      data: {
        inventory
      }
    });
  } catch (error) {
    next(error);
  }
};


/*
 * Farmer / FPO
 * Add or remove physical stock.
 */
const adjustMyStock = async (req, res, next) => {
  try {
    const inventory =
      await inventoryService.adjustMyStock(
        req.user,
        req.params.id,
        req.body.operation,
        req.body.quantity
      );

    return res.status(200).json({
      success: true,
      message: "Stock adjusted successfully",
      data: {
        inventory
      }
    });
  } catch (error) {
    next(error);
  }
};


/*
 * Admin
 * Create inventory for a Farmer/FPO product.
 */
const adminCreateInventory = async (req, res, next) => {
  try {
    const inventory =
      await inventoryService.adminCreateInventory(
        req.user,
        req.body
      );

    return res.status(201).json({
      success: true,
      message: "Inventory created successfully",
      data: {
        inventory
      }
    });
  } catch (error) {
    next(error);
  }
};


/*
 * Admin
 * Get all inventory.
 */
const getAdminInventory = async (req, res, next) => {
  try {
    const inventory =
      await inventoryService.getAdminInventory(
        req.user,
        req.query
      );

    return res.status(200).json({
      success: true,
      message: "Inventory fetched successfully",
      data: {
        inventory
      }
    });
  } catch (error) {
    next(error);
  }
};


/*
 * Admin
 * Get one inventory record.
 */
const getAdminInventoryById = async (req, res, next) => {
  try {
    const inventory =
      await inventoryService.getAdminInventoryById(
        req.user,
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message: "Inventory fetched successfully",
      data: {
        inventory
      }
    });
  } catch (error) {
    next(error);
  }
};


/*
 * Admin
 * Update inventory configuration.
 */
const adminUpdateInventory = async (req, res, next) => {
  try {
    const inventory =
      await inventoryService.adminUpdateInventory(
        req.user,
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: "Inventory updated successfully",
      data: {
        inventory
      }
    });
  } catch (error) {
    next(error);
  }
};


/*
 * Admin
 * Add or remove physical stock.
 */
const adminAdjustStock = async (req, res, next) => {
  try {
    const inventory =
      await inventoryService.adminAdjustStock(
        req.user,
        req.params.id,
        req.body.operation,
        req.body.quantity
      );

    return res.status(200).json({
      success: true,
      message: "Stock adjusted successfully",
      data: {
        inventory
      }
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createInventory,
  getMyInventory,
  getMyInventoryById,
  updateMyInventory,
  adjustMyStock,

  adminCreateInventory,
  getAdminInventory,
  getAdminInventoryById,
  adminUpdateInventory,
  adminAdjustStock
};