const FarmerProfile = require("../models/FarmerProfile");
const Role = require("../models/Role");
const { ROLES } = require("../config/constants");

const createFarmerProfile = async (user, data) => {
  const role = await Role.findById(user.roleId);

  if (!role || role.name !== ROLES.FARMER) {
    const error = new Error(
      "Only FARMER users can create a farmer profile"
    );

    error.statusCode = 403;
    throw error;
  }

  const existingProfile = await FarmerProfile.findOne({
    userId: user._id
  });

  if (existingProfile) {
    const error = new Error(
      "Farmer profile already exists"
    );

    error.statusCode = 409;
    throw error;
  }

  // farmerCode generation will be handled here

  const profile = await FarmerProfile.create({
    userId: user._id,
    ...data
  });

  return profile;
};