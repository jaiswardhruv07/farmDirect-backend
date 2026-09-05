const mongoose = require("mongoose");

const User = require("../models/User");
const Role = require("../models/Role");
const Product = require("../models/Product");
const Inventory = require("../models/Inventory");
const Order = require("../models/Order");
const FpoMember = require("../models/FpoMember");

const FarmerProfile = require("../models/FarmerProfile");
const FpoProfile = require("../models/FpoProfile");

const {
  ROLES
} = require("../config/constants");

const {
  PRODUCT_STATUS
} = require("../enums/product.enum");

const {
  ORDER_STATUS,
  BUYER_TYPE
} = require("../enums/order.enum");

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

const getUserRole = (user) => {
  if (!user || !user.roleId) {
    return null;
  }

  return user.roleId.name;
};

const ensureRole = (user, ...allowedRoles) => {
  const role = getUserRole(user);

  if (!allowedRoles.includes(role)) {
    throw createServiceError(
      "You do not have permission to access this dashboard",
      403
    );
  }

  return role;
};

const toNumber = (value) => {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value.toString());
};

/*
|--------------------------------------------------------------------------
| Role IDs
|--------------------------------------------------------------------------
|
| User.roleId references the Role collection.
| We resolve role IDs once instead of querying Role repeatedly.
|--------------------------------------------------------------------------
*/

const getRoleIds = async () => {
  const roles = await Role.find({
    name: {
      $in: [
        ROLES.FARMER,
        ROLES.CONSUMER,
        ROLES.BULK_BUYER,
        ROLES.FPO,
        ROLES.LOGISTICS,
        ROLES.GOVERNMENT_OFFICER
      ]
    }
  })
    .select("_id name")
    .lean();

  return roles.reduce((result, role) => {
    result[role.name] = role._id;
    return result;
  }, {});
};

/*
|--------------------------------------------------------------------------
| Order Helpers
|--------------------------------------------------------------------------
*/

const getOrderStatusCounts = async (match) => {
  const results = await Order.aggregate([
    {
      $match: match
    },

    {
      $group: {
        _id: "$status",
        count: {
          $sum: 1
        }
      }
    }
  ]);

  const counts = {
    pending: 0,
    confirmed: 0,
    processing: 0,
    readyForDispatch: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    failed: 0
  };

  const statusMap = {
    [ORDER_STATUS.PENDING]: "pending",
    [ORDER_STATUS.CONFIRMED]: "confirmed",
    [ORDER_STATUS.PROCESSING]: "processing",
    [ORDER_STATUS.READY_FOR_DISPATCH]: "readyForDispatch",
    [ORDER_STATUS.SHIPPED]: "shipped",
    [ORDER_STATUS.DELIVERED]: "delivered",
    [ORDER_STATUS.CANCELLED]: "cancelled",
    [ORDER_STATUS.FAILED]: "failed"
  };

  for (const result of results) {
    const key = statusMap[result._id];

    if (key) {
      counts[key] = result.count;
    }
  }

  return counts;
};

const getTotalFromStatusCounts = (counts) => {
  return Object.values(counts).reduce(
    (total, count) => total + count,
    0
  );
};

const getRecentOrders = async (match, limit = 5) => {
  const orders = await Order.find(match)
    .sort({ createdAt: -1 })
    .limit(limit)
    .select(
      "orderNumber buyerId buyerType items totalAmount status createdAt"
    )
    .lean();

  return orders.map((order) => ({
    orderNumber: order.orderNumber,

    buyerId: order.buyerId,

    buyerType: order.buyerType,

    itemCount: Array.isArray(order.items)
      ? order.items.length
      : 0,

    totalAmount: toNumber(order.totalAmount),

    status: order.status,

    createdAt: order.createdAt
  }));
};

/*
|--------------------------------------------------------------------------
| Sales / Spending Helpers
|--------------------------------------------------------------------------
*/

const getCompletedOrderSales = async () => {
  const result = await Order.aggregate([
    {
      $match: {
        status: ORDER_STATUS.DELIVERED
      }
    },

    {
      $group: {
        _id: null,

        total: {
          $sum: "$totalAmount"
        }
      }
    }
  ]);

  return result.length
    ? toNumber(result[0].total)
    : 0;
};

const getSellerSales = async (
  sellerType,
  sellerId
) => {
  const result = await Order.aggregate([
    {
      $unwind: "$items"
    },

    {
      $match: {
        status: ORDER_STATUS.DELIVERED,

        "items.sellerType": sellerType,

        "items.sellerId": sellerId
      }
    },

    {
      $group: {
        _id: null,

        total: {
          $sum: "$items.subtotal"
        }
      }
    }
  ]);

  return result.length
    ? toNumber(result[0].total)
    : 0;
};

const getBuyerSpending = async (buyerId) => {
  const result = await Order.aggregate([
    {
      $match: {
        buyerId,

        status: ORDER_STATUS.DELIVERED
      }
    },

    {
      $group: {
        _id: null,

        total: {
          $sum: "$totalAmount"
        }
      }
    }
  ]);

  return result.length
    ? toNumber(result[0].total)
    : 0;
};

const getBuyerProcurement = async (buyerId) => {
  const result = await Order.aggregate([
    {
      $match: {
        buyerId,

        buyerType: BUYER_TYPE.BULK_BUYER,

        status: ORDER_STATUS.DELIVERED
      }
    },

    {
      $unwind: "$items"
    },

    {
      $group: {
        _id: null,

        totalQuantity: {
          $sum: "$items.quantity"
        },

        totalAmount: {
          $sum: "$items.subtotal"
        }
      }
    }
  ]);

  if (!result.length) {
    return {
      totalQuantity: 0,
      totalAmount: 0
    };
  }

  return {
    totalQuantity: result[0].totalQuantity,

    totalAmount: toNumber(
      result[0].totalAmount
    )
  };
};

/*
|--------------------------------------------------------------------------
| Inventory Helpers
|--------------------------------------------------------------------------
*/

const getInventoryStats = async (productIds) => {
  if (!productIds.length) {
    return {
      totalItems: 0,
      availableStock: 0
    };
  }

  const result = await Inventory.aggregate([
    {
      $match: {
        productId: {
          $in: productIds
        }
      }
    },

    {
      $group: {
        _id: null,

        totalItems: {
          $sum: 1
        },

        availableStock: {
          $sum: {
            $subtract: [
              "$totalStock",
              "$reservedStock"
            ]
          }
        }
      }
    }
  ]);

  if (!result.length) {
    return {
      totalItems: 0,
      availableStock: 0
    };
  }

  return {
    totalItems: result[0].totalItems,

    availableStock: toNumber(
      result[0].availableStock
    )
  };
};

const getLowStockCount = async (productIds) => {
  if (!productIds.length) {
    return 0;
  }

  return Inventory.countDocuments({
    productId: {
      $in: productIds
    },

    $expr: {
      $lte: [
        {
          $subtract: [
            "$totalStock",
            "$reservedStock"
          ]
        },

        "$lowStockThreshold"
      ]
    }
  });
};

/*
|--------------------------------------------------------------------------
| ADMIN DASHBOARD
|--------------------------------------------------------------------------
*/

const getAdminDashboard = async () => {
  const roleIds = await getRoleIds();

  const [
    totalUsers,

    totalFarmers,
    totalConsumers,
    totalBulkBuyers,
    totalFpos,
    totalLogisticsPartners,
    totalGovernmentOfficers,

    totalProducts,
    activeProducts,
    pendingProductApprovals,
    inactiveProducts,

    totalOrders,
    completedOrders,

    totalSales,

    lowStockItems,

    orderStatusCounts,

    recentOrders
  ] = await Promise.all([
    User.countDocuments(),

    User.countDocuments({
      roleId: roleIds[ROLES.FARMER]
    }),

    User.countDocuments({
      roleId: roleIds[ROLES.CONSUMER]
    }),

    User.countDocuments({
      roleId: roleIds[ROLES.BULK_BUYER]
    }),

    User.countDocuments({
      roleId: roleIds[ROLES.FPO]
    }),

    User.countDocuments({
      roleId: roleIds[ROLES.LOGISTICS]
    }),

    User.countDocuments({
      roleId: roleIds[ROLES.GOVERNMENT_OFFICER]
    }),

    Product.countDocuments(),

    Product.countDocuments({
      status: PRODUCT_STATUS.ACTIVE
    }),

    Product.countDocuments({
      status: PRODUCT_STATUS.PENDING_APPROVAL
    }),

    Product.countDocuments({
      status: PRODUCT_STATUS.INACTIVE
    }),

    Order.countDocuments(),

    Order.countDocuments({
      status: ORDER_STATUS.DELIVERED
    }),

    getCompletedOrderSales(),

    Inventory.countDocuments({
      $expr: {
        $lte: [
          {
            $subtract: [
              "$totalStock",
              "$reservedStock"
            ]
          },

          "$lowStockThreshold"
        ]
      }
    }),

    getOrderStatusCounts({}),

    getRecentOrders({})
  ]);

  const activeOrders =
    orderStatusCounts.pending +
    orderStatusCounts.confirmed +
    orderStatusCounts.processing +
    orderStatusCounts.readyForDispatch +
    orderStatusCounts.shipped;

  return {
    role: ROLES.ADMIN,

    dashboard: {
      summary: {
        totalUsers,

        totalFarmers,
        totalConsumers,
        totalBulkBuyers,
        totalFpos,
        totalLogisticsPartners,
        totalGovernmentOfficers,

        totalProducts,
        activeProducts,
        pendingProductApprovals,

        totalOrders,
        activeOrders,
        completedOrders,

        totalSales,

        /*
         * Logistics data will be populated when the
         * Logistics module is implemented.
         */
        activeShipments: 0
      },

      products: {
        pendingApproval: pendingProductApprovals,

        active: activeProducts,

        inactive: inactiveProducts
      },

      orders: orderStatusCounts,

      inventory: {
        lowStockItems
      },

      recentOrders,

      logistics: {
        pendingJobs: 0,
        activeShipments: 0,
        deliveredShipments: 0
      }
    }
  };
};

/*
|--------------------------------------------------------------------------
| FARMER DASHBOARD
|--------------------------------------------------------------------------
*/

const getFarmerDashboard = async (user) => {
  ensureRole(user, ROLES.FARMER);

  const farmerProfile = await FarmerProfile.findOne({
    userId: user._id
  })
    .select("_id")
    .lean();

  if (!farmerProfile) {
    throw createServiceError(
      "Farmer profile not found",
      404
    );
  }

  const productMatch = {
    sellerType: "FARMER",
    sellerId: farmerProfile._id
  };

  const products = await Product.find(productMatch)
    .select("_id")
    .lean();

  const productIds = products.map(
    (product) => product._id
  );

  const orderMatch = {
    "items.sellerType": "FARMER",
    "items.sellerId": farmerProfile._id
  };

  const [
    totalProducts,
    activeProducts,
    pendingProducts,
    rejectedProducts,
    inactiveProducts,

    inventory,
    lowStockItems,

    orderStatusCounts,

    totalSales,

    recentOrders
  ] = await Promise.all([
    Product.countDocuments(productMatch),

    Product.countDocuments({
      ...productMatch,
      status: PRODUCT_STATUS.ACTIVE
    }),

    Product.countDocuments({
      ...productMatch,
      status: PRODUCT_STATUS.PENDING_APPROVAL
    }),

    Product.countDocuments({
      ...productMatch,
      status: PRODUCT_STATUS.REJECTED
    }),

    Product.countDocuments({
      ...productMatch,
      status: PRODUCT_STATUS.INACTIVE
    }),

    getInventoryStats(productIds),

    getLowStockCount(productIds),

    getOrderStatusCounts(orderMatch),

    getSellerSales(
      "FARMER",
      farmerProfile._id
    ),

    getRecentOrders(orderMatch)
  ]);

  return {
    role: ROLES.FARMER,

    dashboard: {
      summary: {
        totalProducts,

        activeProducts,

        pendingProducts,

        availableStock:
          inventory.availableStock,

        lowStockItems,

        pendingOrders:
          orderStatusCounts.pending,

        processingOrders:
          orderStatusCounts.processing,

        completedOrders:
          orderStatusCounts.delivered,

        totalSales
      },

      products: {
        active: activeProducts,

        pendingApproval: pendingProducts,

        rejected: rejectedProducts,

        inactive: inactiveProducts
      },

      inventory: {
        totalItems:
          inventory.totalItems,

        availableStock:
          inventory.availableStock,

        lowStockItems
      },

      orders: orderStatusCounts,

      recentOrders,

      sales: {
        totalSales
      }
    }
  };
};

/*
|--------------------------------------------------------------------------
| CONSUMER DASHBOARD
|--------------------------------------------------------------------------
*/

const getConsumerDashboard = async (user) => {
  ensureRole(user, ROLES.CONSUMER);

  const orderMatch = {
    buyerId: user._id,

    buyerType: BUYER_TYPE.CONSUMER
  };

  const [
    totalOrders,
    activeOrders,
    completedOrders,
    totalSpent,

    orderStatusCounts,

    recentOrders
  ] = await Promise.all([
    Order.countDocuments(orderMatch),

    Order.countDocuments({
      ...orderMatch,

      status: {
        $in: [
          ORDER_STATUS.PENDING,
          ORDER_STATUS.CONFIRMED,
          ORDER_STATUS.PROCESSING,
          ORDER_STATUS.READY_FOR_DISPATCH,
          ORDER_STATUS.SHIPPED
        ]
      }
    }),

    Order.countDocuments({
      ...orderMatch,

      status: ORDER_STATUS.DELIVERED
    }),

    getBuyerSpending(user._id),

    getOrderStatusCounts(orderMatch),

    getRecentOrders(orderMatch)
  ]);

  return {
    role: ROLES.CONSUMER,

    dashboard: {
      summary: {
        totalOrders,

        activeOrders,

        completedOrders,

        totalSpent
      },

      orders: orderStatusCounts,

      recentOrders
    }
  };
};

/*
|--------------------------------------------------------------------------
| BULK BUYER DASHBOARD
|--------------------------------------------------------------------------
*/

const getBulkBuyerDashboard = async (user) => {
  ensureRole(user, ROLES.BULK_BUYER);

  const orderMatch = {
    buyerId: user._id,

    buyerType: BUYER_TYPE.BULK_BUYER
  };

  const [
    totalOrders,
    activeOrders,
    completedOrders,
    pendingOrders,

    procurement,

    orderStatusCounts,

    recentOrders
  ] = await Promise.all([
    Order.countDocuments(orderMatch),

    Order.countDocuments({
      ...orderMatch,

      status: {
        $in: [
          ORDER_STATUS.PENDING,
          ORDER_STATUS.CONFIRMED,
          ORDER_STATUS.PROCESSING,
          ORDER_STATUS.READY_FOR_DISPATCH,
          ORDER_STATUS.SHIPPED
        ]
      }
    }),

    Order.countDocuments({
      ...orderMatch,

      status: ORDER_STATUS.DELIVERED
    }),

    Order.countDocuments({
      ...orderMatch,

      status: ORDER_STATUS.PENDING
    }),

    getBuyerProcurement(user._id),

    getOrderStatusCounts(orderMatch),

    getRecentOrders(orderMatch)
  ]);

  return {
    role: ROLES.BULK_BUYER,

    dashboard: {
      summary: {
        totalOrders,

        activeOrders,

        completedOrders,

        pendingOrders,

        totalProcurement:
          procurement.totalQuantity,

        totalSpending:
          procurement.totalAmount
      },

      orders: orderStatusCounts,

      recentOrders,

      procurement
    }
  };
};

/*
|--------------------------------------------------------------------------
| FPO DASHBOARD
|--------------------------------------------------------------------------
*/

const getFpoDashboard = async (user) => {
  ensureRole(user, ROLES.FPO);

  const fpoProfile = await FpoProfile.findOne({
    userId: user._id
  })
    .select("_id")
    .lean();

  if (!fpoProfile) {
    throw createServiceError(
      "FPO profile not found",
      404
    );
  }

  const productMatch = {
    sellerType: "FPO",
    sellerId: fpoProfile._id
  };

  const products = await Product.find(productMatch)
    .select("_id")
    .lean();

  const productIds = products.map(
    (product) => product._id
  );

  const orderMatch = {
    "items.sellerType": "FPO",
    "items.sellerId": fpoProfile._id
  };

  const [
    totalMembers,

    totalProducts,
    activeProducts,
    pendingApproval,
    inactiveProducts,

    inventory,
    lowStockItems,

    orderStatusCounts,

    totalSales,

    recentOrders
  ] = await Promise.all([
    FpoMember.countDocuments({
      fpoId: fpoProfile._id
    }),

    Product.countDocuments(productMatch),

    Product.countDocuments({
      ...productMatch,
      status: PRODUCT_STATUS.ACTIVE
    }),

    Product.countDocuments({
      ...productMatch,
      status: PRODUCT_STATUS.PENDING_APPROVAL
    }),

    Product.countDocuments({
      ...productMatch,
      status: PRODUCT_STATUS.INACTIVE
    }),

    getInventoryStats(productIds),

    getLowStockCount(productIds),

    getOrderStatusCounts(orderMatch),

    getSellerSales(
      "FPO",
      fpoProfile._id
    ),

    getRecentOrders(orderMatch)
  ]);

  return {
    role: ROLES.FPO,

    dashboard: {
      summary: {
        totalMembers,

        /*
         * Active-member count will be added once the finalized
         * FpoMember membership-status field is used by the
         * membership APIs.
         */
        activeMembers: totalMembers,

        totalProducts,

        activeProducts,

        availableStock:
          inventory.availableStock,

        lowStockItems,

        totalOrders:
          getTotalFromStatusCounts(
            orderStatusCounts
          ),

        completedOrders:
          orderStatusCounts.delivered,

        totalSales
      },

      members: {
        total: totalMembers,

        active: totalMembers
      },

      products: {
        active: activeProducts,

        pendingApproval,

        inactive: inactiveProducts
      },

      inventory: {
        totalItems:
          inventory.totalItems,

        availableStock:
          inventory.availableStock,

        lowStockItems
      },

      orders: orderStatusCounts,

      recentOrders,

      sales: {
        totalSales
      }
    }
  };
};

/*
|--------------------------------------------------------------------------
| GOVERNMENT DASHBOARD
|--------------------------------------------------------------------------
*/

const getGovernmentDashboard = async (user) => {
  ensureRole(
    user,
    ROLES.GOVERNMENT_OFFICER
  );

  const roleIds = await getRoleIds();

  const [
    totalFarmers,
    totalFpos,

    verifiedFarmers,
    verifiedFpos,

    totalProducts,
    activeProducts,

    totalOrders,
    completedOrders,

    marketplaceVolume
  ] = await Promise.all([
    User.countDocuments({
      roleId: roleIds[ROLES.FARMER]
    }),

    User.countDocuments({
      roleId: roleIds[ROLES.FPO]
    }),

    FarmerProfile.countDocuments({
      "verification.status": "VERIFIED"
    }),

    FpoProfile.countDocuments({
      "verification.status": "VERIFIED"
    }),

    Product.countDocuments(),

    Product.countDocuments({
      status: PRODUCT_STATUS.ACTIVE
    }),

    Order.countDocuments(),

    Order.countDocuments({
      status: ORDER_STATUS.DELIVERED
    }),

    getCompletedOrderSales()
  ]);

  return {
    role: ROLES.GOVERNMENT_OFFICER,

    dashboard: {
      summary: {
        totalFarmers,

        totalFpos,

        totalProducts,

        activeProducts,

        totalOrders,

        completedOrders,

        marketplaceVolume
      },

      farmers: {
        total: totalFarmers,

        verified: verifiedFarmers
      },

      fpos: {
        total: totalFpos,

        verified: verifiedFpos
      },

      marketplace: {
        totalProducts,

        activeProducts,

        totalOrders,

        completedOrders,

        totalTransactionValue:
          marketplaceVolume
      },

      demand: {
        available: false,

        forecasts: []
      }
    }
  };
};

/*
|--------------------------------------------------------------------------
| MAIN DASHBOARD ENTRY POINT
|--------------------------------------------------------------------------
*/

const getMyDashboard = async (user) => {
  const role = getUserRole(user);

  switch (role) {
    case ROLES.ADMIN:
      return getAdminDashboard();

    case ROLES.FARMER:
      return getFarmerDashboard(user);

    case ROLES.CONSUMER:
      return getConsumerDashboard(user);

    case ROLES.BULK_BUYER:
      return getBulkBuyerDashboard(user);

    case ROLES.FPO:
      return getFpoDashboard(user);

    case ROLES.GOVERNMENT_OFFICER:
      return getGovernmentDashboard(user);

    case ROLES.LOGISTICS:
      throw createServiceError(
        "Logistics dashboard is pending logistics module integration",
        501
      );

    default:
      throw createServiceError(
        "Unsupported dashboard role",
        403
      );
  }
};

module.exports = {
  getMyDashboard,

  getAdminDashboard,
  getFarmerDashboard,
  getConsumerDashboard,
  getBulkBuyerDashboard,
  getFpoDashboard,
  getGovernmentDashboard
};