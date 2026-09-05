const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING"
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    verifiedAt: {
      type: Date
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  {
    _id: false
  }
);

module.exports = verificationSchema;
