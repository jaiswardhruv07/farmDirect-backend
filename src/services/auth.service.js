const User = require("../models/User");
const Role = require("../models/Role");

const { generateAccessToken } = require("../utils/auth");
const { USER_STATUS } = require("../config/constants");

const registerUser = async ({
  firstName,
  lastName,
  email,
  phone,
  password,
  roleId
}) => {
  const existingEmail = await User.findOne({
    email: email.toLowerCase()
  });

  if (existingEmail) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  const existingPhone = await User.findOne({ phone });

  if (existingPhone) {
    const error = new Error("Phone number is already registered");
    error.statusCode = 409;
    throw error;
  }

  const role = await Role.findById(roleId);

  if (!role) {
    const error = new Error("Invalid role");
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await User.hashPassword(password);

  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    phone,
    passwordHash,
    roleId,
    status: USER_STATUS.ACTIVE
  });

  const token = generateAccessToken(user);

  return {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      roleId: user.roleId,
      status: user.status
    },
    token
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({
    email: email.toLowerCase()
  }).select("+passwordHash");

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    const error = new Error("User account is not active");
    error.statusCode = 403;
    throw error;
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateAccessToken(user);

  await user.populate({
    path: "roleId",
    populate: {
      path: "permissionIds"
    }
  });

  return {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.roleId.name,
      status: user.status
    },
    token
  };
};

module.exports = {
  registerUser,
  loginUser
};
