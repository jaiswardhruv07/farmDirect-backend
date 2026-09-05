const mongoose = require("mongoose");

const addressSchema = require("../schemas/common/Address");
const verificationSchema = require("../schemas/common/Verification");

const { BUYER_BUSINESS_TYPE } = require("../enums/profile.enum");

const BUYER_BUSINESS_TYPES = [
  "HOTEL",
  "RESTAURANT",
  "RETAILER",
  "WHOLESALER",
  "PROCESSOR",
  "CATERER",
  "INSTITUTION",
  "OTHER"
];

const buyerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },

    businessName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },

    businessType: {
      type: String,
      enum: Object.values(BUYER_BUSINESS_TYPE),
      required: true
    },

    businessRegistrationNumber: {
      type: String,
      trim: true,
      maxlength: 100
    },

    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      match: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/
    },

    contactPerson: {
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
      },

      phone: {
        type: String,
        required: true,
        match: /^[6-9][0-9]{9}$/
      }
    },

    businessAddress: {
      type: addressSchema,
      required: true
    },

    verification: {
      type: verificationSchema,
      default: () => ({})
    }
  },
  {
    timestamps: true,
    collection: "buyer_profiles"
  }
);

const BuyerProfile = mongoose.model("BuyerProfile", buyerProfileSchema);

module.exports = BuyerProfile;
