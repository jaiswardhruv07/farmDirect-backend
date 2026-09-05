const mongoose = require("mongoose");

const geoPointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point"
    },

    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function (value) {
          return (
            value.length === 2 &&
            value[0] >= -180 &&
            value[0] <= 180 &&
            value[1] >= -90 &&
            value[1] <= 90
          );
        },
        message: "Coordinates must be [longitude, latitude]"
      }
    }
  },
  {
    _id: false
  }
);

module.exports = geoPointSchema;
