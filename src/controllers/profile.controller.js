const {
  createFarmerProfile
} = require("../services/profile.service");

const createFarmer = async (req, res, next) => {
  try {
    const profile = await createFarmerProfile(
      req.user,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Farmer profile created successfully",
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFarmer
};