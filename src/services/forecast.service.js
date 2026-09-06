const axios = require("axios");

const DemandHistory = require("../models/DemandHistory");
const DemandForecast = require("../models/DemandForecast");

const env = require("../config/env");

const HISTORY_DAYS = 35;
const EXPECTED_SERIES_COUNT = 50;
const ML_MODEL_VERSION = "xgboost-final-v1";

/*
|--------------------------------------------------------------------------
| Service Error Helper
|--------------------------------------------------------------------------
*/

const createServiceError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  return error;
};

/*
|--------------------------------------------------------------------------
| Date Helpers
|--------------------------------------------------------------------------
*/

/*
 * Normalize a Date to UTC midnight.
 *
 * This prevents time-of-day differences from causing
 * incorrect date comparisons.
 */
const normalizeDate = (date) => {
  const normalized = new Date(date);

  normalized.setUTCHours(0, 0, 0, 0);

  return normalized;
};

/*
 * Get the date N days before the supplied date.
 */
const subtractDays = (date, days) => {
  const result = new Date(date);

  result.setUTCDate(result.getUTCDate() - days);

  return result;
};

/*
|--------------------------------------------------------------------------
| Historical Demand
|--------------------------------------------------------------------------
*/

/*
 * Get the latest historical date available in MongoDB.
 */
const getLatestHistoricalDate = async () => {
  const latest = await DemandHistory.findOne()
    .sort({ date: -1 })
    .select("date")
    .lean();

  if (!latest) {
    throw createServiceError("No historical demand data is available", 404);
  }

  return normalizeDate(latest.date);
};

/*
 * Fetch the historical demand required by the ML service.
 *
 * The current ML inference pipeline uses 35 days of historical
 * records for all 50 product-location series.
 */
const getHistoricalDemand = async () => {
  const latestDate = await getLatestHistoricalDate();

  const startDate = subtractDays(latestDate, HISTORY_DAYS - 1);

  const records = await DemandHistory.find({
    date: {
      $gte: startDate,
      $lte: latestDate
    }
  })
    .select("date product category location demandKg festival")
    .sort({
      product: 1,
      location: 1,
      date: 1
    })
    .lean();

  return {
    records,
    latestDate,
    startDate
  };
};

/*
|--------------------------------------------------------------------------
| Historical Data Validation
|--------------------------------------------------------------------------
*/

const validateHistoricalDemand = (records, startDate, latestDate) => {
  if (!records.length) {
    throw createServiceError("No historical demand records were found", 404);
  }

  /*
   * Every product-location series should have exactly
   * HISTORY_DAYS observations.
   */
  const seriesMap = new Map();

  for (const record of records) {
    const key = `${record.product}::${record.location}`;

    if (!seriesMap.has(key)) {
      seriesMap.set(key, []);
    }

    seriesMap.get(key).push(record);
  }

  if (seriesMap.size !== EXPECTED_SERIES_COUNT) {
    throw createServiceError(
      `Expected ${EXPECTED_SERIES_COUNT} product-location series, found ${seriesMap.size}`,
      422
    );
  }

  for (const [seriesKey, seriesRecords] of seriesMap.entries()) {
    if (seriesRecords.length !== HISTORY_DAYS) {
      throw createServiceError(
        `Incomplete historical data for ${seriesKey}. Expected ${HISTORY_DAYS} records, found ${seriesRecords.length}`,
        422
      );
    }

    const dates = seriesRecords
      .map((record) => normalizeDate(record.date).getTime())
      .sort((a, b) => a - b);

    /*
     * Ensure dates are consecutive.
     */
    for (let i = 1; i < dates.length; i += 1) {
      const difference = (dates[i] - dates[i - 1]) / (24 * 60 * 60 * 1000);

      if (difference !== 1) {
        throw createServiceError(
          `Historical demand contains a date gap for ${seriesKey}`,
          422
        );
      }
    }

    /*
     * Ensure the series covers the expected date window.
     */
    if (dates[0] !== startDate.getTime()) {
      throw createServiceError(
        `Historical data for ${seriesKey} does not start at the expected date`,
        422
      );
    }

    if (dates[dates.length - 1] !== latestDate.getTime()) {
      throw createServiceError(
        `Historical data for ${seriesKey} does not end at the latest historical date`,
        422
      );
    }
  }
};

/*
|--------------------------------------------------------------------------
| FastAPI Request Transformation
|--------------------------------------------------------------------------
*/

const buildMlRequest = (records) => {
  return {
    historical_data: records.map((record) => ({
      date: normalizeDate(record.date).toISOString().slice(0, 10),

      product: record.product,

      category: record.category,

      location: record.location,

      demand_kg: Number(record.demandKg),

      festival: Number(record.festival)
    }))
  };
};

/*
|--------------------------------------------------------------------------
| FastAPI Communication
|--------------------------------------------------------------------------
*/

const requestForecastFromMlService = async (records) => {
  const url = `${env.ML_SERVICE_URL}/api/v1/forecast/demand`;

  let response;

  try {
    response = await axios.post(url, buildMlRequest(records), {
      timeout: 30000,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    /*
     * Keep the internal Axios error out of the API response.
     */
    if (error.response) {
      throw createServiceError(
        "Demand forecasting service returned an error",
        502
      );
    }

    if (error.code === "ECONNABORTED") {
      throw createServiceError("Demand forecasting service timed out", 504);
    }

    throw createServiceError("Demand forecasting service is unavailable", 503);
  }

  if (!response.data || !Array.isArray(response.data.forecasts)) {
    throw createServiceError(
      "Invalid response received from demand forecasting service",
      502
    );
  }

  return response.data.forecasts;
};

/*
|--------------------------------------------------------------------------
| Forecast Validation
|--------------------------------------------------------------------------
*/

const validateForecastResponse = (forecasts, latestDate) => {
  if (forecasts.length !== EXPECTED_SERIES_COUNT) {
    throw createServiceError(
      `Expected ${EXPECTED_SERIES_COUNT} forecasts, received ${forecasts.length}`,
      502
    );
  }

  const expectedForecastDate = new Date(latestDate);

  expectedForecastDate.setUTCDate(expectedForecastDate.getUTCDate() + 1);

  expectedForecastDate.setUTCHours(0, 0, 0, 0);

  const seriesKeys = new Set();

  for (const forecast of forecasts) {
    if (
      !forecast.product ||
      !forecast.category ||
      !forecast.location ||
      !forecast.forecast_date
    ) {
      throw createServiceError(
        "Forecast service returned an incomplete forecast record",
        502
      );
    }

    const predictedDemand = Number(forecast.predicted_demand_kg);

    if (!Number.isFinite(predictedDemand) || predictedDemand < 0) {
      throw createServiceError(
        `Invalid predicted demand for ${forecast.product} - ${forecast.location}`,
        502
      );
    }

    const forecastDate = normalizeDate(forecast.forecast_date);

    if (forecastDate.getTime() !== expectedForecastDate.getTime()) {
      throw createServiceError(
        `Unexpected forecast date for ${forecast.product} - ${forecast.location}`,
        502
      );
    }

    const seriesKey = `${forecast.product}::${forecast.location}`;

    if (seriesKeys.has(seriesKey)) {
      throw createServiceError(
        `Duplicate forecast returned for ${seriesKey}`,
        502
      );
    }

    seriesKeys.add(seriesKey);
  }

  return expectedForecastDate;
};

/*
|--------------------------------------------------------------------------
| Save Forecasts
|--------------------------------------------------------------------------
*/

const saveForecasts = async (forecasts, forecastDate) => {
  const operations = forecasts.map((forecast) => ({
    updateOne: {
      filter: {
        product: forecast.product,
        location: forecast.location,
        forecastDate
      },

      update: {
        $set: {
          product: forecast.product,
          category: forecast.category,
          location: forecast.location,
          forecastDate,

          predictedDemandKg: Number(forecast.predicted_demand_kg),

          modelVersion: ML_MODEL_VERSION,

          generatedAt: new Date()
        }
      },

      upsert: true
    }
  }));

  if (!operations.length) {
    return [];
  }

  await DemandForecast.bulkWrite(operations);

  return DemandForecast.find({
    forecastDate
  })
    .sort({
      product: 1,
      location: 1
    })
    .lean();
};

/*
|--------------------------------------------------------------------------
| GENERATE DEMAND FORECAST
|--------------------------------------------------------------------------
*/

const generateDemandForecast = async () => {
  /*
   * 1. Get historical demand.
   */
  const { records, startDate, latestDate } = await getHistoricalDemand();

  /*
   * 2. Validate the historical dataset before
   *    sending anything to the ML service.
   */
  validateHistoricalDemand(records, startDate, latestDate);

  /*
   * 3. Ask the FastAPI/XGBoost service for predictions.
   */
  const forecasts = await requestForecastFromMlService(records);

  /*
   * 4. Validate ML output.
   */
  const forecastDate = validateForecastResponse(forecasts, latestDate);

  /*
   * 5. Upsert forecasts into MongoDB.
   */
  const savedForecasts = await saveForecasts(forecasts, forecastDate);

  return {
    forecastDate,

    historicalWindow: {
      startDate,
      endDate: latestDate,
      days: HISTORY_DAYS
    },

    seriesCount: savedForecasts.length,

    modelVersion: ML_MODEL_VERSION,

    forecasts: savedForecasts
  };
};

/*
|--------------------------------------------------------------------------
| GET STORED FORECASTS
|--------------------------------------------------------------------------
*/

const getForecasts = async (filters = {}) => {
  const query = {};

  if (filters.forecastDate) {
    const forecastDate = normalizeDate(filters.forecastDate);

    query.forecastDate = forecastDate;
  }

  if (filters.product) {
    query.product = filters.product;
  }

  if (filters.location) {
    query.location = filters.location;
  }

  return DemandForecast.find(query)
    .sort({
      forecastDate: -1,
      product: 1,
      location: 1
    })
    .lean();
};

/*
|--------------------------------------------------------------------------
| GET LATEST FORECASTS
|--------------------------------------------------------------------------
*/

const getLatestForecasts = async () => {
  const latest = await DemandForecast.findOne()
    .sort({
      forecastDate: -1
    })
    .select("forecastDate")
    .lean();

  if (!latest) {
    return [];
  }

  return DemandForecast.find({
    forecastDate: latest.forecastDate
  })
    .sort({
      product: 1,
      location: 1
    })
    .lean();
};

module.exports = {
  generateDemandForecast,
  getForecasts,
  getLatestForecasts
};
