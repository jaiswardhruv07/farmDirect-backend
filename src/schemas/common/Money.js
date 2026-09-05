const mongoose = require("mongoose");

const moneySchema = new mongoose.Schema(
  {
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      enum: ["INR"],
      default: "INR"
    }
  },
  {
    _id: false
  }
);

module.exports = moneySchema;
