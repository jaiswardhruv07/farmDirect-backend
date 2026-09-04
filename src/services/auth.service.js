const User = require("../models/User");
const Role = require("../models/Role");

const { generateAccessToken } = require("../utils/auth");
const { ROLES, USER_STATUS } = require("../config/constants");

/*
|--------------------------------------------------------------------------
| Helper: Find Role
|--------------------------------------------------------------------------
*/

const getRoleById = async (roleId) => {
  const role = await Role.findById(roleId);

  if (!role) {
    const error = new Error("Invalid role");
    error.statusCode = 400;
    throw error;
  }

  return role;
};

/*
|--------------------------------------------------------------------------
| Helper: Check Duplicate User
|--------------------------------------------------------------------------
*/

const ensureUserDoesNotExist = async (email, phone) => {
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
};

/*
|--------------------------------------------------------------------------
| Public Registration
|
| Allowed:
| - FARMER
| - CONSUMER
|--------------------------------------------------------------------------
*/

const registerUser = async ({
  firstName,
  lastName,
  email,
  phone,
  password,
  roleId
}) => {
  const role = await getRoleById(roleId);

  const allowedPublicRoles = [ROLES.FARMER, ROLES.CONSUMER];

  if (!allowedPublicRoles.includes(role.name)) {
    const error = new Error(
      "Public registration is only available for FARMER and CONSUMER roles"
    );

    error.statusCode = 403;

    throw error;
  }

  await ensureUserDoesNotExist(email, phone);

  const passwordHash = await User.hashPassword(password);

  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    phone,
    passwordHash,
    roleId: role._id,
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
      role: role.name,
      status: user.status
    },
    token
  };
};

/*
|--------------------------------------------------------------------------
| Admin Onboarding
|
| Admin can create:
| - BULK_BUYER
| - FPO
| - LOGISTICS
| - GOVERNMENT_OFFICER
|
|--------------------------------------------------------------------------
*/

const adminCreateUser = async ({
  firstName,
  lastName,
  email,
  phone,
  password,
  roleId
}) => {
  const role = await getRoleById(roleId);

  const allowedAdminRoles = [
    ROLES.BULK_BUYER,
    ROLES.FPO,
    ROLES.LOGISTICS,
    ROLES.GOVERNMENT_OFFICER
  ];

  if (!allowedAdminRoles.includes(role.name)) {
    const error = new Error(
      "This role cannot be created through admin onboarding"
    );

    error.statusCode = 400;

    throw error;
  }

  await ensureUserDoesNotExist(email, phone);

  const passwordHash = await User.hashPassword(password);

  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    phone,
    passwordHash,
    roleId: role._id,
    status: USER_STATUS.ACTIVE
  });

  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    roleId: user.roleId,
    role: role.name,
    status: user.status
  };
};

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

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

  await user.populate({
    path: "roleId",
    populate: {
      path: "permissionIds"
    }
  });

  const token = generateAccessToken(user);

  return {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      roleId: user.roleId._id,
      role: user.roleId.name,
      status: user.status,
      permissions: user.roleId.permissionIds.map(
        (permission) => permission.name
      )
    },
    token
  };
};

module.exports = {
  registerUser,
  adminCreateUser,
  loginUser
};
