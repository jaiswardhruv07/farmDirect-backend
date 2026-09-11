const {
  getPendingProfiles,
  approveProfile,
  rejectProfile,

  // Farmer
  createFarmerProfile,
  getMyFarmerProfile,
  updateMyFarmerProfile,

  // Buyer
  createBuyerProfile,
  getMyBuyerProfile,
  updateMyBuyerProfile,

  // FPO
  createFpoProfile,
  getMyFpoProfile,
  updateMyFpoProfile,

  // Logistics
  createLogisticsProfile,
  getMyLogisticsProfile,
  updateMyLogisticsProfile,

  // Government
  createGovernmentProfile,
  getMyGovernmentProfile,
  updateMyGovernmentProfile,

  // Admin
  getPendingProfiles,
  approveProfile,
  rejectProfile
} = require("../services/profile.service");

const getPendingAdminProfiles = async (req, res, next) => {
  try {
    const profiles = await getPendingProfiles(req.user);

    res.status(200).json({
      success: true,
      message: "Pending profiles retrieved successfully",
      data: { profiles }
    });
  } catch (error) {
    next(error);
  }
};

const approveAdminProfile = async (req, res, next) => {
  try {
    const profile = await approveProfile(
      req.user,
      req.params.profileType,
      req.params.profileId
    );

    res.status(200).json({
      success: true,
      message: "Profile approved successfully",
      data: { profile }
    });
  } catch (error) {
    next(error);
  }
};

const rejectAdminProfile = async (req, res, next) => {
  try {
    const profile = await rejectProfile(
      req.user,
      req.params.profileType,
      req.params.profileId,
      req.body.rejectionReason
    );

    res.status(200).json({
      success: true,
      message: "Profile rejected successfully",
      data: { profile }
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Farmer
|--------------------------------------------------------------------------
*/

const createFarmer = async (req, res, next) => {
  try {
    const profile = await createFarmerProfile(req.user, req.body);

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

const getFarmerProfile = async (req, res, next) => {
  try {
    const profile = await getMyFarmerProfile(req.user);

    res.status(200).json({
      success: true,
      message: "Farmer profile retrieved successfully",
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateFarmerProfile = async (req, res, next) => {
  try {
    const profile = await updateMyFarmerProfile(req.user, req.body);

    res.status(200).json({
      success: true,
      message: "Farmer profile updated successfully",
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Buyer
|--------------------------------------------------------------------------
*/

const createBuyer = async (req, res, next) => {
  try {
    const profile = await createBuyerProfile(req.user, req.body);

    res.status(201).json({
      success: true,
      message: "Buyer profile created successfully",
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

const getBuyerProfile = async (req, res, next) => {
  try {
    const profile = await getMyBuyerProfile(req.user);

    res.status(200).json({
      success: true,
      message: "Buyer profile retrieved successfully",
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateBuyerProfile = async (req, res, next) => {
  try {
    const profile = await updateMyBuyerProfile(req.user, req.body);

    res.status(200).json({
      success: true,
      message: "Buyer profile updated successfully",
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| FPO
|--------------------------------------------------------------------------
*/

const createFpo = async (req, res, next) => {
  try {
    const profile = await createFpoProfile(req.user, req.body);

    res.status(201).json({
      success: true,
      message: "FPO profile created successfully",
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

const getFpoProfile = async (req, res, next) => {
  try {
    const profile = await getMyFpoProfile(req.user);

    res.status(200).json({
      success: true,
      message: "FPO profile retrieved successfully",
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateFpoProfile = async (req, res, next) => {
  try {
    const profile = await updateMyFpoProfile(req.user, req.body);

    res.status(200).json({
      success: true,
      message: "FPO profile updated successfully",
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Logistics
|--------------------------------------------------------------------------
*/

const createLogistics = async (req, res, next) => {
  try {
    const profile = await createLogisticsProfile(req.user, req.body);

    res.status(201).json({
      success: true,
      message: "Logistics profile created successfully",
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

const getLogisticsProfile = async (req, res, next) => {
  try {
    const profile = await getMyLogisticsProfile(req.user);

    res.status(200).json({
      success: true,
      message: "Logistics profile retrieved successfully",
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateLogisticsProfile = async (req, res, next) => {
  try {
    const profile = await updateMyLogisticsProfile(req.user, req.body);

    res.status(200).json({
      success: true,
      message: "Logistics profile updated successfully",
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Government
|--------------------------------------------------------------------------
*/

const createGovernment = async (req, res, next) => {
  try {
    const profile = await createGovernmentProfile(req.user, req.body);

    res.status(201).json({
      success: true,
      message: "Government profile created successfully",
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

const getGovernmentProfile = async (req, res, next) => {
  try {
    const profile = await getMyGovernmentProfile(req.user);

    res.status(200).json({
      success: true,
      message: "Government profile retrieved successfully",
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateGovernmentProfile = async (req, res, next) => {
  try {
    const profile = await updateMyGovernmentProfile(req.user, req.body);

    res.status(200).json({
      success: true,
      message: "Government profile updated successfully",
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Admin Profile Verification
|--------------------------------------------------------------------------
*/

const getPendingProfilesController = async (req, res, next) => {
  try {
    const profiles = await getPendingProfiles(req.user);

    res.status(200).json({
      success: true,
      message: "Pending profiles retrieved successfully",
      data: {
        profiles,
        count: profiles.length
      }
    });
  } catch (error) {
    next(error);
  }
};

const approveProfileController = async (req, res, next) => {
  try {
    const { profileType, profileId } = req.params;

    const result = await approveProfile(req.user, profileType, profileId);

    res.status(200).json({
      success: true,
      message: "Profile approved successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const rejectProfileController = async (req, res, next) => {
  try {
    const { profileType, profileId } = req.params;
    const { rejectionReason } = req.body;

    const result = await rejectProfile(
      req.user,
      profileType,
      profileId,
      rejectionReason
    );

    res.status(200).json({
      success: true,
      message: "Profile rejected successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  getPendingAdminProfiles,
  approveAdminProfile,
  rejectAdminProfile,

  // Farmer
  createFarmer,
  getFarmerProfile,
  updateFarmerProfile,

  // Buyer
  createBuyer,
  getBuyerProfile,
  updateBuyerProfile,

  // FPO
  createFpo,
  getFpoProfile,
  updateFpoProfile,

  // Logistics
  createLogistics,
  getLogisticsProfile,
  updateLogisticsProfile,

  // Government
  createGovernment,
  getGovernmentProfile,
  updateGovernmentProfile,

  // Admin
  getPendingProfilesController,
  approveProfileController,
  rejectProfileController
};
