const mongoose = require("mongoose");

const verificationSchema = require("../schemas/common/Verification");

const logisticsProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },

    partnerType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },

    contactNumber: {
      type: String,
      required: true,
      match: /^[6-9][0-9]{9}$/
    },

    serviceAreas: {
      type: [String],
      required: true,
      validate: {
        validator: function (value) {
          return value.length > 0;
        },
        message: "At least one service area is required"
      }
    },

    verification: {
      type: verificationSchema,
      default: () => ({})
    }
  },
  {
    timestamps: true,
    collection: "logistics_profiles"
  }
);

const LogisticsProfile = mongoose.model(
  "LogisticsProfile",
  logisticsProfileSchema
);

module.exports = LogisticsProfile;
