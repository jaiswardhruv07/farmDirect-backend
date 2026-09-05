const express = require("express");

const {
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
  updateGovernmentProfile
} = require("../controllers/profile.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Farmer Profile Routes
|--------------------------------------------------------------------------
*/

// Create own farmer profile
router.post("/farmer", authMiddleware, createFarmer);

// Get own farmer profile
router.get("/farmer/me", authMiddleware, getFarmerProfile);

// Update own farmer profile
router.patch("/farmer/me", authMiddleware, updateFarmerProfile);

/*
|--------------------------------------------------------------------------
| Buyer Profile Routes
|--------------------------------------------------------------------------
*/

// Create own buyer profile
router.post("/buyer", authMiddleware, createBuyer);

// Get own buyer profile
router.get("/buyer/me", authMiddleware, getBuyerProfile);

// Update own buyer profile
router.patch("/buyer/me", authMiddleware, updateBuyerProfile);

/*
|--------------------------------------------------------------------------
| FPO Profile Routes
|--------------------------------------------------------------------------
*/

// Admin creates FPO profile for an existing FPO user
router.post("/fpo", authMiddleware, createFpo);

// FPO user gets own profile
router.get("/fpo/me", authMiddleware, getFpoProfile);

// FPO user updates own profile
router.patch("/fpo/me", authMiddleware, updateFpoProfile);

/*
|--------------------------------------------------------------------------
| Logistics Profile Routes
|--------------------------------------------------------------------------
*/

// Admin creates logistics profile for an existing LOGISTICS user
router.post("/logistics", authMiddleware, createLogistics);

// Logistics user gets own profile
router.get("/logistics/me", authMiddleware, getLogisticsProfile);

// Logistics user updates own profile
router.patch("/logistics/me", authMiddleware, updateLogisticsProfile);

/*
|--------------------------------------------------------------------------
| Government Profile Routes
|--------------------------------------------------------------------------
*/

// Admin creates government profile for an existing GOVERNMENT_OFFICER user
router.post("/government", authMiddleware, createGovernment);

// Government officer gets own profile
router.get("/government/me", authMiddleware, getGovernmentProfile);

// Government officer updates own profile
router.patch("/government/me", authMiddleware, updateGovernmentProfile);

module.exports = router;
