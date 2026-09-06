const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/rbac.middleware");

const forecastController = require("../controllers/forecast.controller");

const { ROLES } = require("../config/constants");

/*
|--------------------------------------------------------------------------
| Generate Demand Forecast
|--------------------------------------------------------------------------
*/

/**
 * @swagger
 * /api/forecast/generate:
 *   post:
 *     summary: Generate next-day demand forecast
 *     description: Generates demand forecasts using historical demand stored in MongoDB and the XGBoost forecasting service.
 *     tags:
 *       - Forecast
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Demand forecast generated successfully
 *       401:
 *         description: Authentication token is missing, invalid or expired
 *       403:
 *         description: User does not have permission to generate forecasts
 *       422:
 *         description: Historical demand data is incomplete or invalid
 *       502:
 *         description: Invalid response from the ML forecasting service
 *       503:
 *         description: ML forecasting service is unavailable
 *       504:
 *         description: ML forecasting service timed out
 */
router.post(
  "/generate",
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.GOVERNMENT_OFFICER),
  forecastController.generateDemandForecast
);

/*
|--------------------------------------------------------------------------
| Get Forecasts
|--------------------------------------------------------------------------
*/

/**
 * @swagger
 * /api/forecast:
 *   get:
 *     summary: Get demand forecasts
 *     description: Returns stored demand forecasts with optional filtering by forecast date, product and location.
 *     tags:
 *       - Forecast
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: forecastDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Forecast date in YYYY-MM-DD format
 *       - in: query
 *         name: product
 *         schema:
 *           type: string
 *         description: Product name
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Demand location
 *     responses:
 *       200:
 *         description: Forecasts retrieved successfully
 *       401:
 *         description: Authentication token is missing, invalid or expired
 */
router.get("/", authenticate, forecastController.getForecasts);

/*
|--------------------------------------------------------------------------
| Get Latest Forecasts
|--------------------------------------------------------------------------
*/

/**
 * @swagger
 * /api/forecast/latest:
 *   get:
 *     summary: Get latest demand forecasts
 *     description: Returns all stored forecasts for the latest forecast date.
 *     tags:
 *       - Forecast
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Latest forecasts retrieved successfully
 *       401:
 *         description: Authentication token is missing, invalid or expired
 */
router.get("/latest", authenticate, forecastController.getLatestForecasts);

module.exports = router;
