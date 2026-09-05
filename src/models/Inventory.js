const mongoose = require("mongoose");

const {
  INVENTORY_STOCK_OPERATION
} = require("../enums/inventory.enum");

const inventorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
      index: true
    },

    unit: {
      type: String,
      required: true,
      trim: true
    },

    totalStock: {
      type: Number,
      required: true,
      min: 0
    },

    reservedStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    lowStockThreshold: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  },
  {
    timestamps: true,
    collection: "inventory"
  }
);

/*
 * Reserved stock must never exceed total stock.
 */
inventorySchema.pre("validate", function (next) {
  if (this.reservedStock > this.totalStock) {
    return next(
      new Error("Reserved stock cannot exceed total stock")
    );
  }

  next();
});

/*
 * Virtual available stock.
 *
 * availableStock = totalStock - reservedStock
 */
inventorySchema.virtual("availableStock").get(function () {
  return this.totalStock - this.reservedStock;
});

/*
 * Virtual low-stock indicator.
 */
inventorySchema.virtual("isLowStock").get(function () {
  return this.availableStock <= this.lowStockThreshold;
});

/*
 * Include virtuals when converting documents to JSON.
 */
inventorySchema.set("toJSON", {
  virtuals: true
});

inventorySchema.set("toObject", {
  virtuals: true
});

/*
 * Useful query indexes.
 */
inventorySchema.index({
  totalStock: 1,
  reservedStock: 1
});

inventorySchema.index({
  lastUpdatedBy: 1,
  updatedAt: -1
});

const Inventory = mongoose.model("Inventory", inventorySchema);

module.exports = Inventory;