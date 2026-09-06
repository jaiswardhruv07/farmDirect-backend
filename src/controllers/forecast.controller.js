const forecastService = require("../services/forecast.service");

/*
|--------------------------------------------------------------------------
| Generate Demand Forecast
|--------------------------------------------------------------------------
*/

const generateDemandForecast = async (req, res, next) => {
  try {
    const result = await forecastService.generateDemandForecast();

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Forecasts
|--------------------------------------------------------------------------
*/

const getForecasts = async (req, res, next) => {
  try {
    const forecasts = await forecastService.getForecasts({
      forecastDate: req.query.forecastDate,
      product: req.query.product,
      location: req.query.location
    });

    return res.status(200).json({
      success: true,
      data: {
        forecasts
      }
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Latest Forecast
|--------------------------------------------------------------------------
*/

const getLatestForecasts = async (req, res, next) => {
  try {
    const forecasts = await forecastService.getLatestForecasts();

    return res.status(200).json({
      success: true,
      data: {
        forecasts
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateDemandForecast,
  getForecasts,
  getLatestForecasts
};
