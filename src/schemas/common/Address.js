const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
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
      maxlength: 200
    },

    village: {
      type: String,
      trim: true,
      maxlength: 100
    },

    city: {
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
  {
    _id: false
  }
);

module.exports = addressSchema;
