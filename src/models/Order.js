const mongoose = require("mongoose");

const {
  ORDER_STATUS,
  PAYMENT_STATUS,
  BUYER_TYPE
} = require("../enums/order.enum");

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    sellerType: {
      type: String,
      enum: ["FARMER", "FPO"],
      required: true
    },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    productName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },

    unit: {
      type: String,
      required: true,
      trim: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 0.01
    },

    pricePerUnit: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: 0
    },

    subtotal: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: 0
    }
  },
  {
    _id: true
  }
);

const orderAddressSchema = new mongoose.Schema(
  {
    addressLine1: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },

    addressLine2: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null
    },

    village: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null
    },

    city: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null
    },

    district: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    state: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    pincode: {
      type: String,
      required: true,
      match: /^[1-9][0-9]{5}$/
    }
  },
  {
    _id: false
  }
);

const cancellationSchema = new mongoose.Schema(
  {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    cancelledAt: {
      type: Date,
      default: null
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null
    }
  },
  {
    _id: false
  }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },

    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    buyerType: {
      type: String,
      enum: Object.values(BUYER_TYPE),
      required: true,
      index: true
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: "Order must contain at least one item"
      }
    },

    deliveryAddress: {
      type: orderAddressSchema,
      required: true
    },

    totalAmount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      required: true,
      enum: ["INR"],
      default: "INR"
    },

    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true
    },

    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      index: true
    },

    cancellation: {
      type: cancellationSchema,
      default: null
    }
  },
  {
    timestamps: true,
    collection: "orders"
  }
);

/*
 * Buyer order history.
 */
orderSchema.index({
  buyerId: 1,
  createdAt: -1
});

/*
 * Admin order filtering.
 */
orderSchema.index({
  status: 1,
  createdAt: -1
});

/*
 * Product-based order lookup.
 */
orderSchema.index({
  "items.productId": 1
});

/*
 * Seller-related order lookup.
 */
orderSchema.index({
  "items.sellerId": 1,
  createdAt: -1
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;