const mongoose = require("mongoose");

const Inventory = require("../models/Inventory");
const Product = require("../models/Product");
const FarmerProfile = require("../models/FarmerProfile");
const FpoProfile = require("../models/FpoProfile");

const { ROLES } = require("../config/constants");
const {
  PRODUCT_SELLER_TYPE,
  PRODUCT_STATUS
} = require("../enums/product.enum");
const { INVENTORY_STOCK_OPERATION } = require("../enums/inventory.enum");

/*
 * Get authenticated user's role.
 *
 * authenticate middleware populates:
 * req.user.roleId.name
 */
const getUserRole = (user) => {
  if (!user || !user.roleId) {
    return null;
  }

  return user.roleId.name;
};

/*
 * Ensure user has one of the allowed roles.
 */
const ensureRole = (user, ...allowedRoles) => {
  const role = getUserRole(user);

  if (!allowedRoles.includes(role)) {
    const error = new Error("You do not have access to this resource");
    error.statusCode = 403;
    throw error;
  }
};

/*
 * Validate MongoDB ObjectId.
 */
const validateObjectId = (id, fieldName = "id") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(`Invalid ${fieldName}`);
    error.statusCode = 400;
    throw error;
  }
};

/*
 * Get seller profile belonging to the authenticated user.
 */
const getSellerProfile = async (userId, sellerType) => {
  let profile;

  if (sellerType === PRODUCT_SELLER_TYPE.FARMER) {
    profile = await FarmerProfile.findOne({
      userId
    });
  }

  if (sellerType === PRODUCT_SELLER_TYPE.FPO) {
    profile = await FpoProfile.findOne({
      userId
    });
  }

  if (!profile) {
    const error = new Error("Seller profile not found");
    error.statusCode = 404;
    throw error;
  }

  return profile;
};

/*
 * Find the seller profile referenced by a product.
 */
const getProductSellerProfile = async (product) => {
  if (product.sellerType === PRODUCT_SELLER_TYPE.FARMER) {
    return FarmerProfile.findById(product.sellerId);
  }

  if (product.sellerType === PRODUCT_SELLER_TYPE.FPO) {
    return FpoProfile.findById(product.sellerId);
  }

  return null;
};

/*
 * Get a product and verify that it is suitable for inventory.
 */
const getActiveProduct = async (productId) => {
  validateObjectId(productId, "productId");

  const product = await Product.findById(productId);

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  if (product.status !== PRODUCT_STATUS.ACTIVE) {
    const error = new Error(
      "Inventory can only be created for an active product"
    );
    error.statusCode = 400;
    throw error;
  }

  return product;
};

/*
 * Verify that the authenticated seller owns the product.
 */
const ensureProductOwnership = async (product, user) => {
  const role = getUserRole(user);

  let sellerType;

  if (role === ROLES.FARMER) {
    sellerType = PRODUCT_SELLER_TYPE.FARMER;
  } else if (role === ROLES.FPO) {
    sellerType = PRODUCT_SELLER_TYPE.FPO;
  } else {
    const error = new Error("Only farmers and FPOs can manage their inventory");
    error.statusCode = 403;
    throw error;
  }

  const profile = await getSellerProfile(user._id, sellerType);

  if (product.sellerType !== sellerType) {
    const error = new Error(
      "You do not have access to this product's inventory"
    );
    error.statusCode = 403;
    throw error;
  }

  if (product.sellerId.toString() !== profile._id.toString()) {
    const error = new Error(
      "You do not have access to this product's inventory"
    );
    error.statusCode = 403;
    throw error;
  }

  return profile;
};

/*
 * Validate total stock against existing reserved stock.
 */
const validateTotalStock = (totalStock, reservedStock) => {
  if (totalStock < reservedStock) {
    const error = new Error("Total stock cannot be less than reserved stock");
    error.statusCode = 400;
    throw error;
  }
};

/*
 * Create inventory for Farmer/FPO.
 */
const createInventory = async (user, data) => {
  ensureRole(user, ROLES.FARMER, ROLES.FPO);

  const product = await getActiveProduct(data.productId);

  await ensureProductOwnership(product, user);

  const existingInventory = await Inventory.findOne({
    productId: product._id
  });

  if (existingInventory) {
    const error = new Error("Inventory already exists for this product");
    error.statusCode = 409;
    throw error;
  }

  const inventory = await Inventory.create({
    productId: product._id,
    unit: product.unit,
    totalStock: data.totalStock,
    reservedStock: 0,
    lowStockThreshold: data.lowStockThreshold ?? 0,
    lastUpdatedBy: user._id
  });

  return inventory;
};

/*
 * Get all inventory belonging to the authenticated Farmer/FPO.
 */
const getMyInventory = async (user) => {
  ensureRole(user, ROLES.FARMER, ROLES.FPO);

  const sellerType =
    getUserRole(user) === ROLES.FARMER
      ? PRODUCT_SELLER_TYPE.FARMER
      : PRODUCT_SELLER_TYPE.FPO;

  const profile = await getSellerProfile(user._id, sellerType);

  return Inventory.find({
    productId: {
      $in: await Product.find({
        sellerType,
        sellerId: profile._id
      }).distinct("_id")
    }
  })
    .populate({
      path: "productId",
      select:
        "name category variety unit pricePerUnit qualityGrade organic status sellerType sellerId"
    })
    .populate({
      path: "lastUpdatedBy",
      select: "firstName lastName email"
    })
    .sort({ updatedAt: -1 });
};

/*
 * Get one inventory record belonging to the authenticated seller.
 */
const getMyInventoryById = async (user, inventoryId) => {
  ensureRole(user, ROLES.FARMER, ROLES.FPO);

  validateObjectId(inventoryId, "inventoryId");

  const inventory = await Inventory.findById(inventoryId).populate({
    path: "productId",
    select:
      "name category variety unit pricePerUnit qualityGrade organic status sellerType sellerId"
  });

  if (!inventory) {
    const error = new Error("Inventory not found");
    error.statusCode = 404;
    throw error;
  }

  await ensureProductOwnership(inventory.productId, user);

  return inventory;
};

/*
 * Update inventory configuration.
 *
 * Sellers can modify:
 * - totalStock
 * - lowStockThreshold
 *
 * They cannot directly modify reservedStock.
 */
const updateMyInventory = async (user, inventoryId, data) => {
  ensureRole(user, ROLES.FARMER, ROLES.FPO);

  validateObjectId(inventoryId, "inventoryId");

  const inventory = await Inventory.findById(inventoryId);

  if (!inventory) {
    const error = new Error("Inventory not found");
    error.statusCode = 404;
    throw error;
  }

  const product = await Product.findById(inventory.productId);

  if (!product) {
    const error = new Error("Associated product not found");
    error.statusCode = 404;
    throw error;
  }

  await ensureProductOwnership(product, user);

  if (data.totalStock !== undefined) {
    validateTotalStock(data.totalStock, inventory.reservedStock);

    inventory.totalStock = data.totalStock;
  }

  if (data.lowStockThreshold !== undefined) {
    inventory.lowStockThreshold = data.lowStockThreshold;
  }

  inventory.lastUpdatedBy = user._id;

  await inventory.save();

  return inventory;
};

/*
 * Manual stock adjustment.
 *
 * ADD:
 *   totalStock += quantity
 *
 * REMOVE:
 *   totalStock -= quantity
 *
 * Reserved stock remains untouched.
 */
const adjustMyStock = async (user, inventoryId, operation, quantity) => {
  ensureRole(user, ROLES.FARMER, ROLES.FPO);

  validateObjectId(inventoryId, "inventoryId");

  if (!Object.values(INVENTORY_STOCK_OPERATION).includes(operation)) {
    const error = new Error("Invalid stock operation");
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    const error = new Error("Quantity must be greater than zero");
    error.statusCode = 400;
    throw error;
  }

  const inventory = await Inventory.findById(inventoryId);

  if (!inventory) {
    const error = new Error("Inventory not found");
    error.statusCode = 404;
    throw error;
  }

  const product = await Product.findById(inventory.productId);

  if (!product) {
    const error = new Error("Associated product not found");
    error.statusCode = 404;
    throw error;
  }

  await ensureProductOwnership(product, user);

  let newTotalStock;

  if (operation === INVENTORY_STOCK_OPERATION.ADD) {
    newTotalStock = inventory.totalStock + quantity;
  } else {
    newTotalStock = inventory.totalStock - quantity;
  }

  validateTotalStock(newTotalStock, inventory.reservedStock);

  inventory.totalStock = newTotalStock;
  inventory.lastUpdatedBy = user._id;

  await inventory.save();

  return inventory;
};

/*
 * ADMIN
 *
 * Create inventory for an active Farmer/FPO product.
 */
const adminCreateInventory = async (user, data) => {
  ensureRole(user, ROLES.ADMIN);

  const product = await getActiveProduct(data.productId);

  if (
    ![PRODUCT_SELLER_TYPE.FARMER, PRODUCT_SELLER_TYPE.FPO].includes(
      product.sellerType
    )
  ) {
    const error = new Error(
      "Inventory can only be created for Farmer or FPO products"
    );
    error.statusCode = 400;
    throw error;
  }

  const sellerProfile = await getProductSellerProfile(product);

  if (!sellerProfile) {
    const error = new Error("Product seller profile not found");
    error.statusCode = 404;
    throw error;
  }

  const existingInventory = await Inventory.findOne({
    productId: product._id
  });

  if (existingInventory) {
    const error = new Error("Inventory already exists for this product");
    error.statusCode = 409;
    throw error;
  }

  const inventory = await Inventory.create({
    productId: product._id,
    unit: product.unit,
    totalStock: data.totalStock,
    reservedStock: 0,
    lowStockThreshold: data.lowStockThreshold ?? 0,
    lastUpdatedBy: user._id
  });

  return inventory;
};

/*
 * ADMIN
 *
 * Get all inventory.
 */
const getAdminInventory = async (user, filters = {}) => {
  ensureRole(user, ROLES.ADMIN);

  const query = {};

  if (filters.lowStock === "true") {
    /*
     * availableStock = totalStock - reservedStock
     *
     * MongoDB expression:
     * totalStock - reservedStock <= lowStockThreshold
     */
    query.$expr = {
      $lte: [
        {
          $subtract: ["$totalStock", "$reservedStock"]
        },
        "$lowStockThreshold"
      ]
    };
  }

  const inventory = await Inventory.find(query)
    .populate({
      path: "productId",
      select:
        "name category variety unit pricePerUnit qualityGrade organic status sellerType sellerId"
    })
    .populate({
      path: "lastUpdatedBy",
      select: "firstName lastName email"
    })
    .sort({ updatedAt: -1 });

  return inventory;
};

/*
 * ADMIN
 *
 * Get one inventory record.
 */
const getAdminInventoryById = async (user, inventoryId) => {
  ensureRole(user, ROLES.ADMIN);

  validateObjectId(inventoryId, "inventoryId");

  const inventory = await Inventory.findById(inventoryId)
    .populate({
      path: "productId",
      select:
        "name category variety unit pricePerUnit qualityGrade organic status sellerType sellerId"
    })
    .populate({
      path: "lastUpdatedBy",
      select: "firstName lastName email"
    });

  if (!inventory) {
    const error = new Error("Inventory not found");
    error.statusCode = 404;
    throw error;
  }

  return inventory;
};

/*
 * ADMIN
 *
 * Update inventory configuration.
 */
const adminUpdateInventory = async (user, inventoryId, data) => {
  ensureRole(user, ROLES.ADMIN);

  validateObjectId(inventoryId, "inventoryId");

  const inventory = await Inventory.findById(inventoryId);

  if (!inventory) {
    const error = new Error("Inventory not found");
    error.statusCode = 404;
    throw error;
  }

  if (data.totalStock !== undefined) {
    validateTotalStock(data.totalStock, inventory.reservedStock);

    inventory.totalStock = data.totalStock;
  }

  if (data.lowStockThreshold !== undefined) {
    inventory.lowStockThreshold = data.lowStockThreshold;
  }

  inventory.lastUpdatedBy = user._id;

  await inventory.save();

  return inventory;
};

/*
 * ADMIN
 *
 * Manual stock adjustment.
 */
const adminAdjustStock = async (user, inventoryId, operation, quantity) => {
  ensureRole(user, ROLES.ADMIN);

  validateObjectId(inventoryId, "inventoryId");

  if (!Object.values(INVENTORY_STOCK_OPERATION).includes(operation)) {
    const error = new Error("Invalid stock operation");
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    const error = new Error("Quantity must be greater than zero");
    error.statusCode = 400;
    throw error;
  }

  const inventory = await Inventory.findById(inventoryId);

  if (!inventory) {
    const error = new Error("Inventory not found");
    error.statusCode = 404;
    throw error;
  }

  let newTotalStock;

  if (operation === INVENTORY_STOCK_OPERATION.ADD) {
    newTotalStock = inventory.totalStock + quantity;
  } else {
    newTotalStock = inventory.totalStock - quantity;
  }

  validateTotalStock(newTotalStock, inventory.reservedStock);

  inventory.totalStock = newTotalStock;
  inventory.lastUpdatedBy = user._id;

  await inventory.save();

  return inventory;
};

/*
 * INTERNAL ORDER OPERATIONS
 *
 * These are intentionally not exposed through routes.
 *
 * They will be used by the Order module later.
 */

/*
 * Reserve stock for an order.
 *
 * Uses an atomic conditional update so two simultaneous
 * requests cannot reserve more stock than is available.
 */
const reserveStock = async (productId, quantity, session = null) => {
  validateObjectId(productId, "productId");

  if (!Number.isFinite(quantity) || quantity <= 0) {
    const error = new Error("Quantity must be greater than zero");
    error.statusCode = 400;
    throw error;
  }

  const options = session ? { session, new: true } : { new: true };

  const inventory = await Inventory.findOneAndUpdate(
    {
      productId,
      $expr: {
        $gte: [
          {
            $subtract: ["$totalStock", "$reservedStock"]
          },
          quantity
        ]
      }
    },
    {
      $inc: {
        reservedStock: quantity
      }
    },
    options
  );

  if (!inventory) {
    const error = new Error("Insufficient available stock");
    error.statusCode = 409;
    throw error;
  }

  return inventory;
};

/*
 * Release previously reserved stock.
 */
const releaseReservedStock = async (productId, quantity, session = null) => {
  validateObjectId(productId, "productId");

  if (!Number.isFinite(quantity) || quantity <= 0) {
    const error = new Error("Quantity must be greater than zero");
    error.statusCode = 400;
    throw error;
  }

  const options = session ? { session, new: true } : { new: true };

  const inventory = await Inventory.findOneAndUpdate(
    {
      productId,
      reservedStock: { $gte: quantity }
    },
    {
      $inc: {
        reservedStock: -quantity
      }
    },
    options
  );

  if (!inventory) {
    const error = new Error("Unable to release the requested reserved stock");
    error.statusCode = 409;
    throw error;
  }

  return inventory;
};

/*
 * Consume reserved stock after successful order completion.
 *
 * Example:
 *
 * totalStock = 500
 * reservedStock = 100
 *
 * consume 100
 *
 * totalStock = 400
 * reservedStock = 0
 */
const consumeReservedStock = async (productId, quantity, session = null) => {
  validateObjectId(productId, "productId");

  if (!Number.isFinite(quantity) || quantity <= 0) {
    const error = new Error("Quantity must be greater than zero");
    error.statusCode = 400;
    throw error;
  }

  const options = session ? { session, new: true } : { new: true };

  const inventory = await Inventory.findOneAndUpdate(
    {
      productId,
      reservedStock: { $gte: quantity },
      totalStock: { $gte: quantity }
    },
    {
      $inc: {
        totalStock: -quantity,
        reservedStock: -quantity
      }
    },
    options
  );

  if (!inventory) {
    const error = new Error("Unable to consume the requested reserved stock");
    error.statusCode = 409;
    throw error;
  }

  return inventory;
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
  adminAdjustStock,

  reserveStock,
  releaseReservedStock,
  consumeReservedStock
};
