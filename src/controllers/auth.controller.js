const {
  registerUser,
  adminCreateUser,
  loginUser
} = require("../services/auth.service");

/*
|--------------------------------------------------------------------------
| Public Registration
|--------------------------------------------------------------------------
*/

const register = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Admin User Creation
|--------------------------------------------------------------------------
*/

const createUserByAdmin = async (req, res, next) => {
  try {
    const user = await adminCreateUser(req.body);

    res.status(201).json({
      success: true,
      message: "User onboarded successfully",
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Current User
|--------------------------------------------------------------------------
*/

const getCurrentUser = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      phone: req.user.phone,
      status: req.user.status,
      roleId: req.user.roleId._id,
      role: req.user.roleId.name,
      permissions: req.user.roleId.permissionIds.map(
        (permission) => permission.name
      )
    }
  });
};

module.exports = {
  register,
  createUserByAdmin,
  login,
  getCurrentUser
};