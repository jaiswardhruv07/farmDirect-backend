const mongoose = require("mongoose");

const demandHistorySchema = new mongoose.Schema(
  {
    /*
     * Date on which the demand was recorded.
     */
    date: {
      type: Date,
      required: true,
      index: true
    },

    /*
     * Product name used by the forecasting model.
     *
     * This matches the product identity used in
     * the trained XGBoost model.
     */
    product: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    /*
     * Product category used by the forecasting model.
     */
    category: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    /*
     * Demand location.
     */
    location: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    /*
     * Actual recorded demand in kilograms.
     */
    demandKg: {
      type: Number,
      required: true,
      min: 0
    },

    /*
     * Festival indicator.
     *
     * 0 = normal day
     * 1 = festival day
     *
     * This is retained because the FastAPI request schema
     * expects this field.
     */
    festival: {
      type: Number,
      required: true,
      enum: [0, 1],
      default: 0
    }
  },
  {
    timestamps: true,
    collection: "demand_histories"
  }
);

/*
|--------------------------------------------------------------------------
| Query Index
|--------------------------------------------------------------------------
|
| Forecast generation needs the latest historical records for
| every product-location series.
|--------------------------------------------------------------------------
*/
demandHistorySchema.index({
  product: 1,
  location: 1,
  date: -1
});

/*
|--------------------------------------------------------------------------
| Date / Location Lookup
|--------------------------------------------------------------------------
*/
demandHistorySchema.index({
  date: -1,
  location: 1
});

/*
|--------------------------------------------------------------------------
| Prevent duplicate historical records
|--------------------------------------------------------------------------
|
| A product-location pair should have one demand observation
| for a given date.
|--------------------------------------------------------------------------
*/
demandHistorySchema.index(
  {
    product: 1,
    location: 1,
    date: 1
  },
  {
    unique: true
  }
);

const DemandHistory = mongoose.model("DemandHistory", demandHistorySchema);

module.exports = DemandHistory;
