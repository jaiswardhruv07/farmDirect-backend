const mongoose = require("mongoose");

const Order = require("../models/Order");
const Product = require("../models/Product");

const { ORDER_STATUS, BUYER_TYPE } = require("../enums/order.enum");

const { PRODUCT_STATUS } = require("../enums/product.enum");

const { ROLES } = require("../config/constants");

const {
  reserveStock,
  releaseReservedStock,
  consumeReservedStock
} = require("./inventory.service");

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const createServiceError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateObjectId = (id, fieldName = "ID") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createServiceError(`Invalid ${fieldName}`, 400);
  }
};

const getUserRole = (user) => {
  if (!user || !user.roleId) {
    return null;
  }

  return user.roleId.name;
};

const ensureBuyerRole = (user) => {
  const role = getUserRole(user);

  if (![ROLES.CONSUMER, ROLES.BULK_BUYER].includes(role)) {
    throw createServiceError(
      "Only consumers and bulk buyers can place orders",
      403
    );
  }

  return role;
};

const ensureAdmin = (user) => {
  if (getUserRole(user) !== ROLES.ADMIN) {
    throw createServiceError(
      "Only administrators can perform this action",
      403
    );
  }
};

const mapBuyerType = (role) => {
  if (role === ROLES.CONSUMER) {
    return BUYER_TYPE.CONSUMER;
  }

  if (role === ROLES.BULK_BUYER) {
    return BUYER_TYPE.BULK_BUYER;
  }

  throw createServiceError("Invalid buyer role", 403);
};

const generateOrderNumber = () => {
  const date = new Date();

  const datePart =
    `${date.getFullYear()}` +
    `${String(date.getMonth() + 1).padStart(2, "0")}` +
    `${String(date.getDate()).padStart(2, "0")}`;

  const randomPart = new mongoose.Types.ObjectId()
    .toString()
    .slice(-6)
    .toUpperCase();

  return `FD-${datePart}-${randomPart}`;
};

const decimalToNumber = (value) => {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value.toString());
};

const calculateSubtotal = (pricePerUnit, quantity) => {
  return (decimalToNumber(pricePerUnit) * quantity).toFixed(2);
};

const calculateTotal = (items) => {
  return items
    .reduce((total, item) => total + decimalToNumber(item.subtotal), 0)
    .toFixed(2);
};

/*
|--------------------------------------------------------------------------
| Order Status Transitions
|--------------------------------------------------------------------------
*/

const VALID_STATUS_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.FAILED],

  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.FAILED],

  [ORDER_STATUS.PROCESSING]: [
    ORDER_STATUS.READY_FOR_DISPATCH,
    ORDER_STATUS.FAILED
  ],

  [ORDER_STATUS.READY_FOR_DISPATCH]: [
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.FAILED
  ],

  [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.FAILED],

  [ORDER_STATUS.DELIVERED]: [],

  [ORDER_STATUS.CANCELLED]: [],

  [ORDER_STATUS.FAILED]: []
};

const ensureValidStatusTransition = (currentStatus, newStatus) => {
  const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];

  if (!allowedTransitions.includes(newStatus)) {
    throw createServiceError(
      `Invalid order status transition from ${currentStatus} to ${newStatus}`,
      400
    );
  }
};

/*
|--------------------------------------------------------------------------
| Create Order
|--------------------------------------------------------------------------
*/

const createOrder = async (user, payload) => {
  const buyerRole = ensureBuyerRole(user);

  const { items, deliveryAddress } = payload;

  if (!Array.isArray(items) || items.length === 0) {
    throw createServiceError("Order must contain at least one item", 400);
  }

  /*
   * Prevent the same product from appearing multiple times.
   * This simplifies inventory reservation and keeps one snapshot
   * per product in the order.
   */
  const productIds = items.map((item) => item.productId);

  const uniqueProductIds = new Set(productIds.map((id) => id.toString()));

  if (uniqueProductIds.size !== productIds.length) {
    throw createServiceError(
      "The same product cannot appear multiple times in an order",
      400
    );
  }

  for (const productId of productIds) {
    validateObjectId(productId, "product ID");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    /*
     * Fetch all products in one query.
     * Product information is read from the database rather than
     * trusted from the client request.
     */
    const products = await Product.find({
      _id: { $in: productIds },
      status: PRODUCT_STATUS.ACTIVE
    }).session(session);

    if (products.length !== productIds.length) {
      throw createServiceError(
        "One or more products are unavailable or inactive",
        400
      );
    }

    const productMap = new Map(
      products.map((product) => [product._id.toString(), product])
    );

    const orderItems = [];

    for (const requestedItem of items) {
      const product = productMap.get(requestedItem.productId.toString());

      if (!product) {
        throw createServiceError(
          `Product ${requestedItem.productId} is unavailable`,
          400
        );
      }

      const quantity = Number(requestedItem.quantity);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw createServiceError(
          `Invalid quantity for product ${product.name}`,
          400
        );
      }

      /*
       * Enforce minimum order quantity defined by seller.
       */
      if (quantity < product.minimumOrderQuantity) {
        throw createServiceError(
          `Minimum order quantity for ${product.name} is ${product.minimumOrderQuantity} ${product.unit}`,
          400
        );
      }

      /*
       * Reserve inventory atomically.
       *
       * IMPORTANT:
       * reserveStock() must receive the transaction session so
       * inventory reservation and order creation are atomic.
       */
      await reserveStock(product._id, quantity, session);

      const subtotal = calculateSubtotal(product.pricePerUnit, quantity);

      orderItems.push({
        productId: product._id,
        sellerType: product.sellerType,
        sellerId: product.sellerId,

        /*
         * Snapshot product information at purchase time.
         */
        productName: product.name,
        unit: product.unit,

        quantity,

        pricePerUnit: product.pricePerUnit,

        subtotal
      });
    }

    const totalAmount = calculateTotal(orderItems);

    const order = new Order({
      orderNumber: generateOrderNumber(),

      buyerId: user._id,
      buyerType: mapBuyerType(buyerRole),

      items: orderItems,

      deliveryAddress,

      totalAmount,

      currency: "INR",

      status: ORDER_STATUS.PENDING,

      paymentStatus: "PENDING"
    });

    await order.save({ session });

    await session.commitTransaction();

    return await Order.findById(order._id);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

/*
|--------------------------------------------------------------------------
| Buyer: Get My Orders
|--------------------------------------------------------------------------
*/

const getMyOrders = async (user, filters = {}) => {
  ensureBuyerRole(user);

  const query = {
    buyerId: user._id
  };

  if (filters.status) {
    if (!Object.values(ORDER_STATUS).includes(filters.status)) {
      throw createServiceError("Invalid order status", 400);
    }

    query.status = filters.status;
  }

  const page = Math.max(Number(filters.page) || 1, 1);

  const limit = Math.min(Math.max(Number(filters.limit) || 10, 1), 100);

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),

    Order.countDocuments(query)
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/*
|--------------------------------------------------------------------------
| Buyer: Get My Order By ID
|--------------------------------------------------------------------------
*/

const getMyOrderById = async (user, orderId) => {
  ensureBuyerRole(user);

  validateObjectId(orderId, "order ID");

  const order = await Order.findOne({
    _id: orderId,
    buyerId: user._id
  });

  if (!order) {
    throw createServiceError("Order not found", 404);
  }

  return order;
};

/*
|--------------------------------------------------------------------------
| Cancel Order
|--------------------------------------------------------------------------
*/

const cancelOrder = async (user, orderId, reason = null) => {
  const role = getUserRole(user);

  const isBuyer = role === ROLES.CONSUMER || role === ROLES.BULK_BUYER;

  const isAdmin = role === ROLES.ADMIN;

  if (!isBuyer && !isAdmin) {
    throw createServiceError(
      "You do not have permission to cancel orders",
      403
    );
  }

  validateObjectId(orderId, "order ID");

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const query = {
      _id: orderId
    };

    /*
     * Buyers can cancel only their own orders.
     * Admin can cancel any eligible order.
     */
    if (isBuyer) {
      query.buyerId = user._id;
    }

    const order = await Order.findOne(query).session(session);

    if (!order) {
      throw createServiceError("Order not found", 404);
    }

    /*
     * Cancellation is allowed only before processing.
     */
    if (
      order.status !== ORDER_STATUS.PENDING &&
      order.status !== ORDER_STATUS.CONFIRMED
    ) {
      throw createServiceError(
        `Order cannot be cancelled when its status is ${order.status}`,
        400
      );
    }

    /*
     * Release every reserved inventory item.
     */
    for (const item of order.items) {
      await releaseReservedStock(item.productId, item.quantity, session);
    }

    order.status = ORDER_STATUS.CANCELLED;

    order.cancellation = {
      cancelledBy: user._id,
      cancelledAt: new Date(),
      reason: reason || null
    };

    await order.save({ session });

    await session.commitTransaction();

    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

/*
|--------------------------------------------------------------------------
| Admin: Get Orders
|--------------------------------------------------------------------------
*/

const getAdminOrders = async (filters = {}) => {
  const query = {};

  if (filters.status) {
    if (!Object.values(ORDER_STATUS).includes(filters.status)) {
      throw createServiceError("Invalid order status", 400);
    }

    query.status = filters.status;
  }

  if (filters.buyerId) {
    validateObjectId(filters.buyerId, "buyer ID");
    query.buyerId = filters.buyerId;
  }

  const page = Math.max(Number(filters.page) || 1, 1);

  const limit = Math.min(Math.max(Number(filters.limit) || 10, 1), 100);

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),

    Order.countDocuments(query)
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/*
|--------------------------------------------------------------------------
| Admin: Get Order By ID
|--------------------------------------------------------------------------
*/

const getAdminOrderById = async (orderId) => {
  validateObjectId(orderId, "order ID");

  const order = await Order.findById(orderId);

  if (!order) {
    throw createServiceError("Order not found", 404);
  }

  return order;
};

/*
|--------------------------------------------------------------------------
| Admin: Update Order Status
|--------------------------------------------------------------------------
*/

const updateOrderStatus = async (user, orderId, newStatus) => {
  ensureAdmin(user);

  validateObjectId(orderId, "order ID");

  if (!Object.values(ORDER_STATUS).includes(newStatus)) {
    throw createServiceError("Invalid order status", 400);
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const order = await Order.findById(orderId).session(session);

    if (!order) {
      throw createServiceError("Order not found", 404);
    }

    ensureValidStatusTransition(order.status, newStatus);

    /*
     * When an order is delivered, the reserved inventory
     * becomes consumed stock.
     */
    if (newStatus === ORDER_STATUS.DELIVERED) {
      for (const item of order.items) {
        await consumeReservedStock(item.productId, item.quantity, session);
      }
    }

    /*
     * If an order fails before stock is consumed,
     * release its reservations.
     */
    if (newStatus === ORDER_STATUS.FAILED) {
      for (const item of order.items) {
        await releaseReservedStock(item.productId, item.quantity, session);
      }
    }

    order.status = newStatus;

    await order.save({ session });

    await session.commitTransaction();

    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

module.exports = {
  createOrder,

  getMyOrders,
  getMyOrderById,

  cancelOrder,

  getAdminOrders,
  getAdminOrderById,

  updateOrderStatus
};
