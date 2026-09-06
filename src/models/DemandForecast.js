const mongoose = require("mongoose");

const demandForecastSchema = new mongoose.Schema(
  {
    /*
     * Product identity used by the demand forecasting model.
     */
    product: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    /*
     * Product category used by the ML model.
     */
    category: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    /*
     * Geographic demand location.
     *
     * This is intentionally a string because the current
     * ML dataset/model uses location names directly.
     */
    location: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    /*
     * Date for which the demand is being forecast.
     *
     * Example:
     * forecastDate = 2026-09-01
     */
    forecastDate: {
      type: Date,
      required: true,
      index: true
    },

    /*
     * XGBoost predicted demand in kilograms.
     */
    predictedDemandKg: {
      type: Number,
      required: true,
      min: 0
    },

    /*
     * Version/name of the ML model that generated
     * this prediction.
     *
     * Useful when the model is retrained later.
     */
    modelVersion: {
      type: String,
      required: true,
      trim: true,
      default: "xgboost-final-v1"
    },

    /*
     * Timestamp indicating when this forecast was generated.
     */
    generatedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true,
    collection: "demand_forecasts"
  }
);

/*
|--------------------------------------------------------------------------
| Forecast Uniqueness
|--------------------------------------------------------------------------
|
| There should be only one forecast for a particular:
|
| product + location + forecastDate
|
| If we regenerate the same day's forecast, the service
| can update the existing document instead of creating
| duplicates.
|--------------------------------------------------------------------------
*/
demandForecastSchema.index(
  {
    product: 1,
    location: 1,
    forecastDate: 1
  },
  {
    unique: true
  }
);

/*
|--------------------------------------------------------------------------
| Forecast Lookup
|--------------------------------------------------------------------------
*/
demandForecastSchema.index({
  forecastDate: 1,
  location: 1
});

demandForecastSchema.index({
  forecastDate: 1,
  product: 1
});

const DemandForecast = mongoose.model("DemandForecast", demandForecastSchema);

module.exports = DemandForecast;
