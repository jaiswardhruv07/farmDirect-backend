const orderService = require("../services/order.service");

/*
|--------------------------------------------------------------------------
| Buyer Controllers
|--------------------------------------------------------------------------
*/

const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.user, req.body);

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order
    });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const result = await orderService.getMyOrders(req.user, req.query);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getMyOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getMyOrderById(req.user, req.params.id);

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

const cancelMyOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(
      req.user,
      req.params.id,
      req.body.reason
    );

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Admin Controllers
|--------------------------------------------------------------------------
*/

const getAdminOrders = async (req, res, next) => {
  try {
    const result = await orderService.getAdminOrders(req.query);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getAdminOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getAdminOrderById(req.params.id);

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(
      req.user,
      req.params.id,
      req.body.status
    );

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order
    });
  } catch (error) {
    next(error);
  }
};

const cancelAdminOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(
      req.user,
      req.params.id,
      req.body.reason
    );

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getMyOrderById,
  cancelMyOrder,

  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  cancelAdminOrder
};
