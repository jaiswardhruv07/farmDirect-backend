const mongoose = require("mongoose");

const verificationSchema = require("../schemas/common/Verification");

const fpoProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },

    fpoCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },

    organizationName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },

    registrationNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    registrationType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },

    contactDetails: {
      phone: {
        type: String,
        required: true,
        match: /^[6-9][0-9]{9}$/
      },

      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      }
    },

    address: {
      village: {
        type: String,
        trim: true,
        maxlength: 100
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

    verification: {
      type: verificationSchema,
      default: () => ({})
    }
  },
  {
    timestamps: true,
    collection: "fpo_profiles"
  }
);

const FpoProfile = mongoose.model("FpoProfile", fpoProfileSchema);

module.exports = FpoProfile;
