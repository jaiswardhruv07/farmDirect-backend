const mongoose = require("mongoose");

const verificationSchema = require("../schemas/common/Verification");

const governmentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },

    department: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },

    designation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },

    officerCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      index: true
    },

    jurisdiction: {
      state: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
      },

      district: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
      }
    },

    verification: {
      type: verificationSchema,
      default: () => ({})
    }
  },
  {
    timestamps: true,
    collection: "government_profiles"
  }
);

const GovernmentProfile = mongoose.model(
  "GovernmentProfile",
  governmentProfileSchema
);

module.exports = GovernmentProfile;
