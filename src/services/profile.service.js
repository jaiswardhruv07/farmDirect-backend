const mongoose = require("mongoose");

const { PROFILE_VERIFICATION_STATUS } = require("../enums/profile.enum");

const FarmerProfile = require("../models/FarmerProfile");
const BuyerProfile = require("../models/BuyerProfile");
const FpoProfile = require("../models/FpoProfile");
const LogisticsProfile = require("../models/LogisticsProfile");
const GovernmentProfile = require("../models/GovernmentProfile");

const User = require("../models/User");
const Role = require("../models/Role");

const { ROLES } = require("../config/constants");

/*
|--------------------------------------------------------------------------
| Common Helpers
|--------------------------------------------------------------------------
*/

const getUserRole = async (user) => {
  const role = await Role.findById(user.roleId);

  if (!role) {
    const error = new Error("User role not found");
    error.statusCode = 403;
    throw error;
  }

  return role.name;
};

const ensureRole = async (user, allowedRole, message) => {
  const roleName = await getUserRole(user);

  if (roleName !== allowedRole) {
    const error = new Error(message);
    error.statusCode = 403;
    throw error;
  }
};

const ensureAdmin = async (user) => {
  await ensureRole(
    user,
    ROLES.ADMIN,
    "Only ADMIN users can perform this operation"
  );
};

const getTargetUser = async (userId) => {
  const targetUser = await User.findById(userId).select("roleId");

  if (!targetUser) {
    const error = new Error("Target user not found");
    error.statusCode = 404;
    throw error;
  }

  const targetRole = await Role.findById(targetUser.roleId);

  if (!targetRole) {
    const error = new Error("Target user role not found");
    error.statusCode = 400;
    throw error;
  }

  return {
    user: targetUser,
    role: targetRole.name
  };
};

const validateAdminTargetUser = async (userId, expectedRole, roleLabel) => {
  if (!userId) {
    const error = new Error("Target userId is required");
    error.statusCode = 400;
    throw error;
  }

  const target = await getTargetUser(userId);

  if (target.role !== expectedRole) {
    const error = new Error(`Target user must have the ${roleLabel} role`);

    error.statusCode = 400;
    throw error;
  }

  return target.user;
};

/*
|--------------------------------------------------------------------------
| Profile Code Generation
|--------------------------------------------------------------------------
|
| Codes are system-generated and are never accepted from the client.
|
| Examples:
| FARM-000001
| FPO-000001
| OFF-000001
|--------------------------------------------------------------------------
*/

const generateNextCode = async (Model, field, prefix) => {
  const latestProfile = await Model.findOne({
    [field]: new RegExp(`^${prefix}-[0-9]+$`, "i")
  })
    .sort({ [field]: -1 })
    .select(field);

  let nextNumber = 1;

  if (latestProfile && latestProfile[field]) {
    const parts = latestProfile[field].split("-");
    const currentNumber = parseInt(parts[1], 10);

    if (!Number.isNaN(currentNumber)) {
      nextNumber = currentNumber + 1;
    }
  }

  return `${prefix}-${String(nextNumber).padStart(6, "0")}`;
};

const ADMIN_PROFILE_MODELS = {
  farmer: FarmerProfile,
  "bulk-buyer": BuyerProfile,
  fpo: FpoProfile,
  government: GovernmentProfile
};

const getAdminProfileModel = (profileType) => {
  const Model = ADMIN_PROFILE_MODELS[profileType];

  if (!Model) {
    const error = new Error(
      "Profile type must be farmer, bulk-buyer, fpo, or government"
    );
    error.statusCode = 400;
    throw error;
  }

  return Model;
};

const validateProfileId = (profileId) => {
  if (!mongoose.isValidObjectId(profileId)) {
    const error = new Error("Invalid profile ID");
    error.statusCode = 400;
    throw error;
  }
};
/**
 * Get all pending profiles.
 *
 * Only ADMIN users can perform this operation.
 *
 * Returns pending:
 * - Farmer profiles
 * - Bulk buyer profiles
 * - FPO profiles
 * - Government officer profiles
 */

const getPendingProfiles = async (user) => {
  await ensureAdmin(user);

  const pendingProfiles = [];

  for (const [profileType, Model] of Object.entries(ADMIN_PROFILE_MODELS)) {
    const profiles = await Model.find({
      $or: [
        { "verification.status": "PENDING" },
        { "verification.status": { $exists: false } }
      ]
    })
      .populate("userId", "firstName lastName email phone")
      .lean();

    pendingProfiles.push(
      ...profiles.map((profile) => ({
        ...profile,
        profileType
      }))
    );
  }

  return pendingProfiles.sort(
    (left, right) => right.createdAt.getTime() - left.createdAt.getTime()
  );
};
/**
 * Approve a pending profile.
 *
 * Only ADMIN users can perform this operation.
 *
 * The operation is atomic:
 * the profile is updated only when its current verification
 * status is PENDING.
 */
const approveProfile = async (user, profileType, profileId) => {
  await ensureAdmin(user);
  validateProfileId(profileId);

  const Model = getAdminProfileModel(profileType);
  const profile = await Model.findOneAndUpdate(
    {
      _id: profileId,
      $or: [
        { "verification.status": "PENDING" },
        { "verification.status": { $exists: false } }
      ]
    },
    {
      $set: {
        "verification.status": "VERIFIED",
        "verification.verifiedBy": user._id,
        "verification.verifiedAt": new Date(),
        "verification.rejectionReason": undefined
      }
    },
    { new: true, runValidators: true }
  ).populate("userId", "firstName lastName email phone");

  if (!profile) {
    const existingProfile = await Model.findById(profileId).select(
      "verification.status"
    );

    const error = new Error(
      existingProfile
        ? "Profile is already processed and is not pending"
        : "Profile not found"
    );
    error.statusCode = existingProfile ? 409 : 404;
    throw error;
  }

  return profile;
};
/**
 * Reject a pending profile.
 *
 * Only ADMIN users can perform this operation.
 *
 * A rejection reason is mandatory.
 *
 * The operation is atomic:
 * the profile is updated only when its current verification
 * status is PENDING.
 */
const rejectProfile = async (user, profileType, profileId, rejectionReason) => {
  await ensureAdmin(user);
  validateProfileId(profileId);

  if (
    typeof rejectionReason !== "string" ||
    !rejectionReason.trim() ||
    rejectionReason.trim().length > 500
  ) {
    const error = new Error(
      "A rejection reason is required and must be 500 characters or fewer"
    );
    error.statusCode = 400;
    throw error;
  }

  const Model = getAdminProfileModel(profileType);
  const profile = await Model.findOneAndUpdate(
    {
      _id: profileId,
      $or: [
        { "verification.status": "PENDING" },
        { "verification.status": { $exists: false } }
      ]
    },
    {
      $set: {
        "verification.status": "REJECTED",
        "verification.verifiedBy": user._id,
        "verification.verifiedAt": new Date(),
        "verification.rejectionReason": rejectionReason.trim()
      }
    },
    { new: true, runValidators: true }
  ).populate("userId", "firstName lastName email phone");

  if (!profile) {
    const existingProfile = await Model.findById(profileId).select(
      "verification.status"
    );

    const error = new Error(
      existingProfile
        ? "Profile is already processed and is not pending"
        : "Profile not found"
    );
    error.statusCode = existingProfile ? 409 : 404;
    throw error;
  }

  return profile;
};

/*
|--------------------------------------------------------------------------
| Farmer Profile
|--------------------------------------------------------------------------
*/

/**
 * Create farmer profile for authenticated FARMER
 */
const createFarmerProfile = async (user, data) => {
  await ensureRole(
    user,
    ROLES.FARMER,
    "Only FARMER users can create a farmer profile"
  );

  const existingProfile = await FarmerProfile.findOne({
    userId: user._id
  });

  if (existingProfile) {
    const error = new Error("Farmer profile already exists");
    error.statusCode = 409;
    throw error;
  }

  const farmerCode = await generateNextCode(
    FarmerProfile,
    "farmerCode",
    "FARM"
  );

  const profileData = {
    ...data,
    userId: user._id,
    farmerCode
  };

  // Never allow client to control verification.
  delete profileData.verification;

  const profile = await FarmerProfile.create(profileData);

  return profile;
};

/**
 * Get farmer profile of authenticated FARMER
 */
const getMyFarmerProfile = async (user) => {
  await ensureRole(
    user,
    ROLES.FARMER,
    "Only FARMER users can access a farmer profile"
  );

  const profile = await FarmerProfile.findOne({
    userId: user._id
  });

  if (!profile) {
    const error = new Error("Farmer profile not found");
    error.statusCode = 404;
    throw error;
  }

  return profile;
};

/**
 * Update farmer profile of authenticated FARMER
 */
const updateMyFarmerProfile = async (user, data) => {
  await ensureRole(
    user,
    ROLES.FARMER,
    "Only FARMER users can update a farmer profile"
  );

  const allowedFields = ["farmDetails", "location", "bankDetails"];

  const updateData = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  const profile = await FarmerProfile.findOneAndUpdate(
    {
      userId: user._id
    },
    {
      $set: updateData
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!profile) {
    const error = new Error("Farmer profile not found");
    error.statusCode = 404;
    throw error;
  }

  return profile;
};

/*
|--------------------------------------------------------------------------
| Buyer Profile
|--------------------------------------------------------------------------
*/

/**
 * Create buyer profile for authenticated BULK_BUYER
 */
const createBuyerProfile = async (user, data) => {
  await ensureRole(
    user,
    ROLES.BULK_BUYER,
    "Only BULK_BUYER users can create a buyer profile"
  );

  const existingProfile = await BuyerProfile.findOne({
    userId: user._id
  });

  if (existingProfile) {
    const error = new Error("Buyer profile already exists");
    error.statusCode = 409;
    throw error;
  }

  const profileData = {
    ...data,
    userId: user._id
  };

  delete profileData.verification;

  const profile = await BuyerProfile.create(profileData);

  return profile;
};

/**
 * Get buyer profile of authenticated BULK_BUYER
 */
const getMyBuyerProfile = async (user) => {
  await ensureRole(
    user,
    ROLES.BULK_BUYER,
    "Only BULK_BUYER users can access a buyer profile"
  );

  const profile = await BuyerProfile.findOne({
    userId: user._id
  });

  if (!profile) {
    const error = new Error("Buyer profile not found");
    error.statusCode = 404;
    throw error;
  }

  return profile;
};

/**
 * Update buyer profile of authenticated BULK_BUYER
 */
const updateMyBuyerProfile = async (user, data) => {
  await ensureRole(
    user,
    ROLES.BULK_BUYER,
    "Only BULK_BUYER users can update a buyer profile"
  );

  const allowedFields = [
    "businessName",
    "businessType",
    "businessRegistrationNumber",
    "gstNumber",
    "contactPerson",
    "businessAddress"
  ];

  const updateData = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  const profile = await BuyerProfile.findOneAndUpdate(
    {
      userId: user._id
    },
    {
      $set: updateData
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!profile) {
    const error = new Error("Buyer profile not found");
    error.statusCode = 404;
    throw error;
  }

  return profile;
};

/*
|--------------------------------------------------------------------------
| FPO Profile
|--------------------------------------------------------------------------
*/

/**
 * Create FPO profile.
 *
 * Only ADMIN can create it.
 * The target user must already have the FPO role.
 */
const createFpoProfile = async (user, data) => {
  await ensureAdmin(user);

  const targetUser = await validateAdminTargetUser(
    data.userId,
    ROLES.FPO,
    "FPO"
  );

  const existingProfile = await FpoProfile.findOne({
    userId: targetUser._id
  });

  if (existingProfile) {
    const error = new Error("FPO profile already exists");
    error.statusCode = 409;
    throw error;
  }

  const fpoCode = await generateNextCode(FpoProfile, "fpoCode", "FPO");

  const profileData = {
    ...data,
    userId: targetUser._id,
    fpoCode
  };

  delete profileData.verification;

  const profile = await FpoProfile.create(profileData);

  return profile;
};

/**
 * Get FPO profile of authenticated FPO user
 */
const getMyFpoProfile = async (user) => {
  await ensureRole(user, ROLES.FPO, "Only FPO users can access an FPO profile");

  const profile = await FpoProfile.findOne({
    userId: user._id
  });

  if (!profile) {
    const error = new Error("FPO profile not found");
    error.statusCode = 404;
    throw error;
  }

  return profile;
};

/**
 * Update FPO profile of authenticated FPO user
 */
const updateMyFpoProfile = async (user, data) => {
  await ensureRole(user, ROLES.FPO, "Only FPO users can update an FPO profile");

  const allowedFields = [
    "organizationName",
    "registrationNumber",
    "registrationType",
    "contactDetails",
    "address"
  ];

  const updateData = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  const profile = await FpoProfile.findOneAndUpdate(
    {
      userId: user._id
    },
    {
      $set: updateData
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!profile) {
    const error = new Error("FPO profile not found");
    error.statusCode = 404;
    throw error;
  }

  return profile;
};

/*
|--------------------------------------------------------------------------
| Logistics Profile
|--------------------------------------------------------------------------
*/

/**
 * Create logistics profile.
 *
 * Only ADMIN can create it.
 * The target user must already have the LOGISTICS role.
 */
const createLogisticsProfile = async (user, data) => {
  await ensureAdmin(user);

  const targetUser = await validateAdminTargetUser(
    data.userId,
    ROLES.LOGISTICS,
    "LOGISTICS"
  );

  const existingProfile = await LogisticsProfile.findOne({
    userId: targetUser._id
  });

  if (existingProfile) {
    const error = new Error("Logistics profile already exists");

    error.statusCode = 409;
    throw error;
  }

  const profileData = {
    ...data,
    userId: targetUser._id
  };

  delete profileData.verification;

  const profile = await LogisticsProfile.create(profileData);

  return profile;
};

/**
 * Get logistics profile of authenticated LOGISTICS user
 */
const getMyLogisticsProfile = async (user) => {
  await ensureRole(
    user,
    ROLES.LOGISTICS,
    "Only LOGISTICS users can access a logistics profile"
  );

  const profile = await LogisticsProfile.findOne({
    userId: user._id
  });

  if (!profile) {
    const error = new Error("Logistics profile not found");
    error.statusCode = 404;
    throw error;
  }

  return profile;
};

/**
 * Update logistics profile of authenticated LOGISTICS user
 */
const updateMyLogisticsProfile = async (user, data) => {
  await ensureRole(
    user,
    ROLES.LOGISTICS,
    "Only LOGISTICS users can update a logistics profile"
  );

  const allowedFields = [
    "partnerType",
    "companyName",
    "contactNumber",
    "serviceAreas"
  ];

  const updateData = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  const profile = await LogisticsProfile.findOneAndUpdate(
    {
      userId: user._id
    },
    {
      $set: updateData
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!profile) {
    const error = new Error("Logistics profile not found");
    error.statusCode = 404;
    throw error;
  }

  return profile;
};

/*
|--------------------------------------------------------------------------
| Government Profile
|--------------------------------------------------------------------------
*/

/**
 * Create government profile.
 *
 * Only ADMIN can create it.
 * The target user must already have the GOVERNMENT_OFFICER role.
 */
const createGovernmentProfile = async (user, data) => {
  await ensureAdmin(user);

  const targetUser = await validateAdminTargetUser(
    data.userId,
    ROLES.GOVERNMENT_OFFICER,
    "GOVERNMENT_OFFICER"
  );

  const existingProfile = await GovernmentProfile.findOne({
    userId: targetUser._id
  });

  if (existingProfile) {
    const error = new Error("Government profile already exists");

    error.statusCode = 409;
    throw error;
  }

  const officerCode = await generateNextCode(
    GovernmentProfile,
    "officerCode",
    "OFF"
  );

  const profileData = {
    ...data,
    userId: targetUser._id,
    officerCode
  };

  delete profileData.verification;

  const profile = await GovernmentProfile.create(profileData);

  return profile;
};

/**
 * Get government profile of authenticated GOVERNMENT_OFFICER
 */
const getMyGovernmentProfile = async (user) => {
  await ensureRole(
    user,
    ROLES.GOVERNMENT_OFFICER,
    "Only GOVERNMENT_OFFICER users can access a government profile"
  );

  const profile = await GovernmentProfile.findOne({
    userId: user._id
  });

  if (!profile) {
    const error = new Error("Government profile not found");
    error.statusCode = 404;
    throw error;
  }

  return profile;
};

/**
 * Update government profile of authenticated GOVERNMENT_OFFICER
 */
const updateMyGovernmentProfile = async (user, data) => {
  await ensureRole(
    user,
    ROLES.GOVERNMENT_OFFICER,
    "Only GOVERNMENT_OFFICER users can update a government profile"
  );

  const allowedFields = ["department", "designation", "jurisdiction"];

  const updateData = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  const profile = await GovernmentProfile.findOneAndUpdate(
    {
      userId: user._id
    },
    {
      $set: updateData
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!profile) {
    const error = new Error("Government profile not found");
    error.statusCode = 404;
    throw error;
  }

  return profile;
};
/*
|--------------------------------------------------------------------------
| Admin Profile Verification
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Supported Admin Profile Types
|--------------------------------------------------------------------------
|
| These are the profile types that require admin verification.
|
| Logistics is intentionally excluded because the current requirement
| only includes:
|
| - FARMER
| - BULK_BUYER
| - FPO
| - GOVERNMENT_OFFICER
|
|--------------------------------------------------------------------------
*/

// const approveProfile = async (user, profileType, profileId) => {
//   await ensureAdmin(user);

//   /*
//   |--------------------------------------------------------------------------
//   | Validate profile ID
//   |--------------------------------------------------------------------------
//   */

//   if (!mongoose.Types.ObjectId.isValid(profileId)) {
//     const error = new Error("Invalid profile ID");
//     error.statusCode = 400;
//     throw error;
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | Validate profile type
//   |--------------------------------------------------------------------------
//   */

//   const config = ADMIN_PROFILE_MODELS[profileType];

//   if (!config) {
//     const error = new Error(
//       "Invalid profile type. Supported types are farmer, bulk-buyer, fpo and government"
//     );

//     error.statusCode = 400;

//     throw error;
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | Approve only PENDING profiles
//   |--------------------------------------------------------------------------
//   |
//   | This condition is important.
//   |
//   | If two admins attempt to approve the same profile at the same time,
//   | only one of them will successfully update the document.
//   |
//   |--------------------------------------------------------------------------
//   */

//   const profile = await config.Model.findOneAndUpdate(
//     {
//       _id: profileId,
//       "verification.status": PROFILE_VERIFICATION_STATUS.PENDING
//     },
//     {
//       $set: {
//         "verification.status": PROFILE_VERIFICATION_STATUS.VERIFIED,
//         "verification.verifiedBy": user._id,
//         "verification.verifiedAt": new Date()
//       },

//       $unset: {
//         "verification.rejectionReason": 1
//       }
//     },
//     {
//       new: true,
//       runValidators: true
//     }
//   ).populate({
//     path: "userId",
//     select: "firstName lastName email phone roleId"
//   });

//   /*
//   |--------------------------------------------------------------------------
//   | Profile not updated
//   |--------------------------------------------------------------------------
//   */

//   if (!profile) {
//     const existingProfile = await config.Model.findById(profileId)
//       .select("verification.status")
//       .lean();

//     /*
//     |--------------------------------------------------------------------------
//     | Profile doesn't exist
//     |--------------------------------------------------------------------------
//     */

//     if (!existingProfile) {
//       const error = new Error("Profile not found");
//       error.statusCode = 404;

//       throw error;
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | Profile exists but is not pending
//     |--------------------------------------------------------------------------
//     */

//     const currentStatus = existingProfile.verification?.status || "UNKNOWN";

//     const error = new Error(
//       `Profile cannot be approved because its current verification status is ${currentStatus}`
//     );

//     error.statusCode = 409;

//     throw error;
//   }

//   return {
//     profileType,
//     profile
//   };
// };

// const rejectProfile = async (user, profileType, profileId, rejectionReason) => {
//   await ensureAdmin(user);

//   /*
//   |--------------------------------------------------------------------------
//   | Validate profile ID
//   |--------------------------------------------------------------------------
//   */

//   if (!mongoose.Types.ObjectId.isValid(profileId)) {
//     const error = new Error("Invalid profile ID");
//     error.statusCode = 400;

//     throw error;
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | Validate profile type
//   |--------------------------------------------------------------------------
//   */

//   const config = ADMIN_PROFILE_MODELS[profileType];

//   if (!config) {
//     const error = new Error(
//       "Invalid profile type. Supported types are farmer, bulk-buyer, fpo and government"
//     );

//     error.statusCode = 400;

//     throw error;
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | Validate rejection reason
//   |--------------------------------------------------------------------------
//   */

//   if (typeof rejectionReason !== "string" || !rejectionReason.trim()) {
//     const error = new Error("Rejection reason is required");
//     error.statusCode = 400;

//     throw error;
//   }

//   const trimmedReason = rejectionReason.trim();

//   if (trimmedReason.length > 500) {
//     const error = new Error("Rejection reason cannot exceed 500 characters");

//     error.statusCode = 400;

//     throw error;
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | Reject only PENDING profiles
//   |--------------------------------------------------------------------------
//   */

//   const profile = await config.Model.findOneAndUpdate(
//     {
//       _id: profileId,
//       "verification.status": PROFILE_VERIFICATION_STATUS.PENDING
//     },
//     {
//       $set: {
//         "verification.status": PROFILE_VERIFICATION_STATUS.REJECTED,
//         "verification.verifiedBy": user._id,
//         "verification.verifiedAt": new Date(),
//         "verification.rejectionReason": trimmedReason
//       }
//     },
//     {
//       new: true,
//       runValidators: true
//     }
//   ).populate({
//     path: "userId",
//     select: "firstName lastName email phone roleId"
//   });

//   /*
//   |--------------------------------------------------------------------------
//   | Profile not updated
//   |--------------------------------------------------------------------------
//   */

//   if (!profile) {
//     const existingProfile = await config.Model.findById(profileId)
//       .select("verification.status")
//       .lean();

//     /*
//     |--------------------------------------------------------------------------
//     | Profile doesn't exist
//     |--------------------------------------------------------------------------
//     */

//     if (!existingProfile) {
//       const error = new Error("Profile not found");
//       error.statusCode = 404;

//       throw error;
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | Profile exists but is not pending
//     |--------------------------------------------------------------------------
//     */

//     const currentStatus = existingProfile.verification?.status || "UNKNOWN";

//     const error = new Error(
//       `Profile cannot be rejected because its current verification status is ${currentStatus}`
//     );

//     error.statusCode = 409;

//     throw error;
//   }

//   return {
//     profileType,
//     profile
//   };
// };
/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
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

  // Admin Profile Verification
  getPendingProfiles,
  approveProfile,
  rejectProfile
};
