const mongoose = require("mongoose");

const {
  PRODUCT_SELLER_TYPE,
  PRODUCT_CATEGORY,
  PRODUCT_UNIT,
  PRODUCT_QUALITY_GRADE,
  PRODUCT_STATUS,
  PRODUCT_APPROVAL_STATUS
} = require("../enums/product.enum");

const productSchema = new mongoose.Schema(
  {
    /*
     * Seller
     * Product belongs to either a Farmer or an FPO.
     *
     * sellerId points to:
     * - FarmerProfile when sellerType = FARMER
     * - FpoProfile when sellerType = FPO
     */
    sellerType: {
      type: String,
      enum: Object.values(PRODUCT_SELLER_TYPE),
      required: true,
      index: true
    },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },

    /*
     * Basic Product Information
     */
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
      index: true
    },

    category: {
      type: String,
      enum: Object.values(PRODUCT_CATEGORY),
      required: true,
      index: true
    },

    variety: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null
    },

    /*
     * Pricing and Order Rules
     */
    unit: {
      type: String,
      enum: Object.values(PRODUCT_UNIT),
      required: true
    },

    pricePerUnit: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: 0
    },

    minimumOrderQuantity: {
      type: Number,
      required: true,
      min: 0.01
    },

    /*
     * Product Images
     *
     * For MVP these are stored as URLs.
     * Actual image storage can be integrated later.
     */
    images: {
      type: [String],
      default: []
    },

    /*
     * Quality and Production Information
     */
    qualityGrade: {
      type: String,
      enum: Object.values(PRODUCT_QUALITY_GRADE),
      required: true
    },

    organic: {
      type: Boolean,
      default: false,
      index: true
    },

    harvestDate: {
      type: Date,
      default: null
    },

    /*
     * Product Lifecycle Status
     *
     * PENDING_APPROVAL
     *   Farmer/FPO submitted product
     *
     * ACTIVE
     *   Approved and publicly available
     *
     * REJECTED
     *   Admin rejected the product
     *
     * INACTIVE
     *   Previously approved product disabled
     */
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.PENDING_APPROVAL,
      index: true
    },

    /*
     * Administrative Approval Information
     */
    approval: {
      status: {
        type: String,
        enum: Object.values(PRODUCT_APPROVAL_STATUS),
        default: PRODUCT_APPROVAL_STATUS.PENDING
      },

      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
      },

      reviewedAt: {
        type: Date,
        default: null
      },

      rejectionReason: {
        type: String,
        trim: true,
        maxlength: 500,
        default: null
      }
    }
  },
  {
    timestamps: true,
    collection: "products"
  }
);

/*
 * Seller lookup
 */
productSchema.index({
  sellerType: 1,
  sellerId: 1
});

/*
 * Marketplace filtering
 */
productSchema.index({
  category: 1,
  status: 1
});

/*
 * Marketplace search/filter
 */
productSchema.index({
  name: 1,
  category: 1,
  status: 1
});

/*
 * Organic product filtering
 */
productSchema.index({
  organic: 1,
  status: 1
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;