
const mongoose = require("mongoose");

const Product = require("../models/Product");
const FarmerProfile = require("../models/FarmerProfile");
const FpoProfile = require("../models/FpoProfile");

const {
  PRODUCT_SELLER_TYPE,
  PRODUCT_STATUS,
  PRODUCT_APPROVAL_STATUS
} = require("../enums/product.enum");

const {
  ROLES
} = require("../config/constants");

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

/**
 * Get the role name from req.user.
 *
 * The authentication middleware is expected to attach the authenticated
 * user's role information to req.user.
 */
const getUserRole = (user) => {
  if (!user || !user.roleId) {
    return null;
  }

  return user.roleId.name;
};

/**
 * Ensure the authenticated user has one of the allowed roles.
 */
const ensureRole = (user, allowedRoles) => {
  const role = getUserRole(user);

  if (!role || !allowedRoles.includes(role)) {
    throw new Error("You are not authorized to perform this action");
  }

  return role;
};

/**
 * Convert an incoming ID into a valid ObjectId.
 */
const validateObjectId = (id, fieldName = "ID") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${fieldName}`);
  }

  return new mongoose.Types.ObjectId(id);
};

/**
 * Get the seller profile associated with the authenticated user.
 *
 * FARMER -> FarmerProfile
 * FPO    -> FpoProfile
 */
const getSellerProfile = async (userId, sellerType) => {
  const userObjectId = validateObjectId(userId, "user ID");

  let profile;

  if (sellerType === PRODUCT_SELLER_TYPE.FARMER) {
    profile = await FarmerProfile.findOne({
      userId: userObjectId
    });
  } else if (sellerType === PRODUCT_SELLER_TYPE.FPO) {
    profile = await FpoProfile.findOne({
      userId: userObjectId
    });
  } else {
    throw new Error("Invalid seller type");
  }

  if (!profile) {
    throw new Error(
      `${sellerType} profile must be created before creating a product`
    );
  }

  return profile;
};

/**
 * Verify that an explicitly supplied seller profile exists.
 *
 * Used when Admin creates a product on behalf of a Farmer/FPO.
 */
const getSellerProfileById = async (sellerType, sellerId) => {
  const sellerObjectId = validateObjectId(sellerId, "seller ID");

  let profile;

  if (sellerType === PRODUCT_SELLER_TYPE.FARMER) {
    profile = await FarmerProfile.findById(sellerObjectId);
  } else if (sellerType === PRODUCT_SELLER_TYPE.FPO) {
    profile = await FpoProfile.findById(sellerObjectId);
  } else {
    throw new Error("Invalid seller type");
  }

  if (!profile) {
    throw new Error(`${sellerType} seller profile not found`);
  }

  return profile;
};

/**
 * Prevent clients from modifying system-controlled fields.
 *
 * These fields are never accepted from Farmer/FPO requests.
 */
const sanitizeSellerProductData = (data) => {
  const productData = { ...data };

  delete productData.sellerType;
  delete productData.sellerId;
  delete productData.status;
  delete productData.approval;

  return productData;
};

/*
|--------------------------------------------------------------------------
| Farmer / FPO Product Operations
|--------------------------------------------------------------------------
*/

/**
 * Create a product as the authenticated Farmer/FPO.
 *
 * Newly submitted products always require Admin approval.
 */
const createProduct = async (user, data) => {
  const sellerType = ensureRole(user, 
    [
    USER_ROLE.FARMER,
    USER_ROLE.FPO
  ]);

  const normalizedSellerType =
    sellerType === USER_ROLE.FARMER
      ? PRODUCT_SELLER_TYPE.FARMER
      : PRODUCT_SELLER_TYPE.FPO;

  const sellerProfile = await getSellerProfile(
    user.id || user._id,
    normalizedSellerType
  );

  const productData = sanitizeSellerProductData(data);

  const product = await Product.create({
    ...productData,

    sellerType: normalizedSellerType,
    sellerId: sellerProfile._id,

    status: PRODUCT_STATUS.PENDING_APPROVAL,

    approval: {
      status: PRODUCT_APPROVAL_STATUS.PENDING,
      reviewedBy: null,
      reviewedAt: null,
      rejectionReason: null
    }
  });

  return product;
};

/**
 * Get all products owned by the authenticated Farmer/FPO.
 */
const getMyProducts = async (user, filters = {}) => {
  const sellerType = ensureRole(user, [
    USER_ROLE.FARMER,
    USER_ROLE.FPO
  ]);

  const normalizedSellerType =
    sellerType === USER_ROLE.FARMER
      ? PRODUCT_SELLER_TYPE.FARMER
      : PRODUCT_SELLER_TYPE.FPO;

  const sellerProfile = await getSellerProfile(
    user.id || user._id,
    normalizedSellerType
  );

  const query = {
    sellerType: normalizedSellerType,
    sellerId: sellerProfile._id
  };

  /*
   * Optional status filtering.
   */
  if (filters.status) {
    query.status = filters.status;
  }

  return Product.find(query).sort({
    createdAt: -1
  });
};

/**
 * Get one product owned by the authenticated Farmer/FPO.
 */
const getMyProductById = async (user, productId) => {
  const sellerType = ensureRole(user, [
    USER_ROLE.FARMER,
    USER_ROLE.FPO
  ]);

  const normalizedSellerType =
    sellerType === USER_ROLE.FARMER
      ? PRODUCT_SELLER_TYPE.FARMER
      : PRODUCT_SELLER_TYPE.FPO;

  const sellerProfile = await getSellerProfile(
    user.id || user._id,
    normalizedSellerType
  );

  const productObjectId = validateObjectId(
    productId,
    "product ID"
  );

  const product = await Product.findOne({
    _id: productObjectId,
    sellerType: normalizedSellerType,
    sellerId: sellerProfile._id
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};

/**
 * Update a product owned by the authenticated Farmer/FPO.
 *
 * A Farmer/FPO cannot directly approve a product.
 *
 * If a rejected product is edited and resubmitted, it goes back to
 * PENDING_APPROVAL.
 */
const updateMyProduct = async (user, productId, data) => {
  const product = await getMyProductById(user, productId);

  const productData = sanitizeSellerProductData(data);

  Object.assign(product, productData);

  /*
   * If a rejected product is modified, require fresh approval.
   */
  if (product.status === PRODUCT_STATUS.REJECTED) {
    product.status = PRODUCT_STATUS.PENDING_APPROVAL;

    product.approval.status = PRODUCT_APPROVAL_STATUS.PENDING;
    product.approval.reviewedBy = null;
    product.approval.reviewedAt = null;
    product.approval.rejectionReason = null;
  }

  await product.save();

  return product;
};

/**
 * Delete a product owned by the authenticated Farmer/FPO.
 *
 * For the MVP, deletion is implemented as a hard delete.
 */
const deleteMyProduct = async (user, productId) => {
  const product = await getMyProductById(user, productId);

  await Product.deleteOne({
    _id: product._id
  });

  return product;
};

/*
|--------------------------------------------------------------------------
| Public Marketplace
|--------------------------------------------------------------------------
*/

/**
 * Get publicly visible products.
 *
 * Only ACTIVE products can appear in the marketplace.
 */
const getPublicProducts = async (filters = {}) => {
  const query = {
    status: PRODUCT_STATUS.ACTIVE
  };

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.sellerType) {
    query.sellerType = filters.sellerType;
  }

  if (filters.organic !== undefined) {
    query.organic = filters.organic;
  }

  if (filters.search) {
    query.name = {
      $regex: filters.search,
      $options: "i"
    };
  }

  return Product.find(query)
    .sort({
      createdAt: -1
    })
    .limit(100);
};

/**
 * Get a single publicly visible product.
 */
const getPublicProductById = async (productId) => {
  const productObjectId = validateObjectId(
    productId,
    "product ID"
  );

  const product = await Product.findOne({
    _id: productObjectId,
    status: PRODUCT_STATUS.ACTIVE
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};

/*
|--------------------------------------------------------------------------
| Admin Operations
|--------------------------------------------------------------------------
*/

/**
 * Admin creates a product on behalf of a Farmer/FPO.
 *
 * Admin-created products are automatically approved.
 */
const adminCreateProduct = async (user, data) => {
  ensureRole(user, [USER_ROLE.ADMIN]);

  const sellerType = data.sellerType;
  const sellerId = data.sellerId;

  const sellerProfile = await getSellerProfileById(
    sellerType,
    sellerId
  );

  const productData = sanitizeSellerProductData(data);

  const product = await Product.create({
    ...productData,

    sellerType,
    sellerId: sellerProfile._id,

    status: PRODUCT_STATUS.ACTIVE,

    approval: {
      status: PRODUCT_APPROVAL_STATUS.APPROVED,
      reviewedBy: user.id || user._id,
      reviewedAt: new Date(),
      rejectionReason: null
    }
  });

  return product;
};

/**
 * Get products from the Admin dashboard.
 */
const getAdminProducts = async (user, filters = {}) => {
  ensureRole(user, [USER_ROLE.ADMIN]);

  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.sellerType) {
    query.sellerType = filters.sellerType;
  }

  if (filters.category) {
    query.category = filters.category;
  }

  return Product.find(query)
    .sort({
      createdAt: -1
    })
    .limit(100);
};

/**
 * Get any product for Admin.
 */
const getAdminProductById = async (user, productId) => {
  ensureRole(user, [USER_ROLE.ADMIN]);

  const productObjectId = validateObjectId(
    productId,
    "product ID"
  );

  const product = await Product.findById(productObjectId);

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};

/**
 * Update any product as Admin.
 */
const adminUpdateProduct = async (user, productId, data) => {
  ensureRole(user, [USER_ROLE.ADMIN]);

  const productObjectId = validateObjectId(
    productId,
    "product ID"
  );

  const product = await Product.findById(productObjectId);

  if (!product) {
    throw new Error("Product not found");
  }

  /*
   * If Admin changes seller information, verify the new seller.
   */
  if (data.sellerType || data.sellerId) {
    const sellerType =
      data.sellerType || product.sellerType;

    const sellerId =
      data.sellerId || product.sellerId;

    const sellerProfile = await getSellerProfileById(
      sellerType,
      sellerId
    );

    product.sellerType = sellerType;
    product.sellerId = sellerProfile._id;
  }

  /*
   * Seller information is handled separately above.
   */
  const productData = { ...data };

  delete productData.sellerType;
  delete productData.sellerId;
  delete productData.approval;

  Object.assign(product, productData);

  /*
   * Admin updates keep the product operationally valid.
   *
   * An Admin may explicitly set ACTIVE or INACTIVE.
   */
  if (data.status) {
    product.status = data.status;
  }

  await product.save();

  return product;
};

/**
 * Delete any product as Admin.
 */
const adminDeleteProduct = async (user, productId) => {
  ensureRole(user, [USER_ROLE.ADMIN]);

  const productObjectId = validateObjectId(
    productId,
    "product ID"
  );

  const product = await Product.findById(productObjectId);

  if (!product) {
    throw new Error("Product not found");
  }

  await Product.deleteOne({
    _id: product._id
  });

  return product;
};

/**
 * Get products waiting for Admin approval.
 */
const getPendingProducts = async (user) => {
  ensureRole(user, [USER_ROLE.ADMIN]);

  return Product.find({
    status: PRODUCT_STATUS.PENDING_APPROVAL,
    "approval.status": PRODUCT_APPROVAL_STATUS.PENDING
  }).sort({
    createdAt: 1
  });
};

/**
 * Approve a pending product.
 */
const approveProduct = async (user, productId) => {
  ensureRole(user, [USER_ROLE.ADMIN]);

  const productObjectId = validateObjectId(
    productId,
    "product ID"
  );

  const product = await Product.findById(productObjectId);

  if (!product) {
    throw new Error("Product not found");
  }

  if (
    product.status !== PRODUCT_STATUS.PENDING_APPROVAL ||
    product.approval.status !== PRODUCT_APPROVAL_STATUS.PENDING
  ) {
    throw new Error("Only pending products can be approved");
  }

  product.status = PRODUCT_STATUS.ACTIVE;

  product.approval.status =
    PRODUCT_APPROVAL_STATUS.APPROVED;

  product.approval.reviewedBy =
    user.id || user._id;

  product.approval.reviewedAt = new Date();

  product.approval.rejectionReason = null;

  await product.save();

  return product;
};

/**
 * Reject a pending product.
 */
const rejectProduct = async (
  user,
  productId,
  rejectionReason
) => {
  ensureRole(user, [USER_ROLE.ADMIN]);

  const productObjectId = validateObjectId(
    productId,
    "product ID"
  );

  const product = await Product.findById(productObjectId);

  if (!product) {
    throw new Error("Product not found");
  }

  if (
    product.status !== PRODUCT_STATUS.PENDING_APPROVAL ||
    product.approval.status !== PRODUCT_APPROVAL_STATUS.PENDING
  ) {
    throw new Error("Only pending products can be rejected");
  }

  product.status = PRODUCT_STATUS.REJECTED;

  product.approval.status =
    PRODUCT_APPROVAL_STATUS.REJECTED;

  product.approval.reviewedBy =
    user.id || user._id;

  product.approval.reviewedAt = new Date();

  product.approval.rejectionReason =
    rejectionReason;

  await product.save();

  return product;
};

module.exports = {
  createProduct,
  getMyProducts,
  getMyProductById,
  updateMyProduct,
  deleteMyProduct,

  getPublicProducts,
  getPublicProductById,

  adminCreateProduct,
  getAdminProducts,
  getAdminProductById,
  adminUpdateProduct,
  adminDeleteProduct,

  getPendingProducts,
  approveProduct,
  rejectProduct
};

