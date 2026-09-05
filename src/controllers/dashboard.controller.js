const User = require("../models/User");
const Role = require("../models/Role");
const Product = require("../models/Product");
const Inventory = require("../models/Inventory");
const Order = require("../models/Order");
const FpoMember = require("../models/FpoMember");

const FarmerProfile = require("../models/FarmerProfile");
const FpoProfile = require("../models/FpoProfile");

const { ROLES } = require("../config/constants");

const { PRODUCT_STATUS } = require("../enums/product.enum");

const { ORDER_STATUS, BUYER_TYPE } = require("../enums/order.enum");
const dashboardService = require("../services/dashboard.service");

/*
|--------------------------------------------------------------------------
| Get Current User Dashboard
|--------------------------------------------------------------------------
*/

const getMyDashboard = async (req, res, next) => {
  try {
    const dashboard = await dashboardService.getMyDashboard(req.user);

    return res.status(200).json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyDashboard
};
