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

/**
 * @swagger
 * /api/profiles/farmer:
 *   post:
 *     summary: Create farmer profile
 *     description: |
 *       Creates a farmer profile for the currently authenticated FARMER user.
 *       The user ID is obtained from the JWT token and cannot be supplied
 *       by the client.
 *
 *       A unique farmer code is generated automatically by the system.
 *     tags:
 *       - Profiles
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Farmer profile information
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FarmerProfileCreateRequest'
 *     responses:
 *       201:
 *         description: Farmer profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Farmer profile created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile:
 *                       $ref: '#/components/schemas/FarmerProfile'
 *
 *       400:
 *         description: Invalid farmer profile data
 *
 *       401:
 *         description: Authentication required or invalid token
 *
 *       403:
 *         description: Only FARMER users can create a farmer profile
 *
 *       409:
 *         description: Farmer profile already exists
 *
 *       500:
 *         description: Internal server error
 */
router.post("/farmer", authMiddleware, createFarmer);

/**
 * @swagger
 * /api/profiles/farmer/me:
 *   get:
 *     summary: Get my farmer profile
 *     description: |
 *       Retrieves the farmer profile belonging to the currently
 *       authenticated FARMER user.
 *     tags:
 *       - Profiles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Farmer profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Farmer profile retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile:
 *                       $ref: '#/components/schemas/FarmerProfile'
 *
 *       401:
 *         description: Authentication required or invalid token
 *
 *       403:
 *         description: Only FARMER users can access a farmer profile
 *
 *       404:
 *         description: Farmer profile not found
 *
 *       500:
 *         description: Internal server error
 */
router.get("/farmer/me", authMiddleware, getFarmerProfile);

/**
 * @swagger
 * /api/profiles/farmer/me:
 *   patch:
 *     summary: Update my farmer profile
 *     description: |
 *       Updates the profile belonging to the currently authenticated
 *       FARMER user.
 *
 *       The user ID, farmer code and verification information are controlled
 *       by the system and cannot be modified through this endpoint.
 *     tags:
 *       - Profiles
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Farmer profile fields to update
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               farmDetails:
 *                 type: object
 *                 properties:
 *                   totalLandArea:
 *                     type: number
 *                     minimum: 0
 *                     example: 5.5
 *                   landUnit:
 *                     type: string
 *                     enum:
 *                       - ACRE
 *                       - HECTARE
 *                     example: ACRE
 *                   ownershipType:
 *                     type: string
 *                     enum:
 *                       - OWNED
 *                       - LEASED
 *                       - SHARED
 *                     example: OWNED
 *
 *               location:
 *                 $ref: '#/components/schemas/FarmerLocation'
 *
 *               bankDetails:
 *                 type: object
 *                 properties:
 *                   accountHolderName:
 *                     type: string
 *                     example: Ramesh Patil
 *                   accountNumber:
 *                     type: string
 *                     example: "1234567890"
 *                   ifsc:
 *                     type: string
 *                     example: SBIN0001234
 *
 *     responses:
 *       200:
 *         description: Farmer profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Farmer profile updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile:
 *                       $ref: '#/components/schemas/FarmerProfile'
 *
 *       400:
 *         description: Invalid farmer profile data
 *
 *       401:
 *         description: Authentication required or invalid token
 *
 *       403:
 *         description: Only FARMER users can update a farmer profile
 *
 *       404:
 *         description: Farmer profile not found
 *
 *       500:
 *         description: Internal server error
 */
router.patch("/farmer/me", authMiddleware, updateFarmerProfile);

/*
|--------------------------------------------------------------------------
| Buyer Profile Routes
|--------------------------------------------------------------------------
*/

/**
 * @swagger
 * /api/profiles/buyer:
 *   post:
 *     summary: Create buyer profile
 *     description: |
 *       Creates a buyer profile for the currently authenticated
 *       BULK_BUYER user.
 *
 *       The user ID is obtained from the JWT token and cannot be supplied
 *       by the client.
 *     tags:
 *       - Profiles
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Buyer business profile information
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BuyerProfileCreateRequest'
 *     responses:
 *       201:
 *         description: Buyer profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Buyer profile created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile:
 *                       $ref: '#/components/schemas/BuyerProfile'
 *
 *       400:
 *         description: Invalid buyer profile data
 *
 *       401:
 *         description: Authentication required or invalid token
 *
 *       403:
 *         description: Only BULK_BUYER users can create a buyer profile
 *
 *       409:
 *         description: Buyer profile already exists
 *
 *       500:
 *         description: Internal server error
 */
router.post("/buyer", authMiddleware, createBuyer);

/**
 * @swagger
 * /api/profiles/buyer/me:
 *   get:
 *     summary: Get my buyer profile
 *     description: |
 *       Retrieves the buyer profile belonging to the currently
 *       authenticated BULK_BUYER user.
 *     tags:
 *       - Profiles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Buyer profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Buyer profile retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile:
 *                       $ref: '#/components/schemas/BuyerProfile'
 *
 *       401:
 *         description: Authentication required or invalid token
 *
 *       403:
 *         description: Only BULK_BUYER users can access a buyer profile
 *
 *       404:
 *         description: Buyer profile not found
 *
 *       500:
 *         description: Internal server error
 */
router.get("/buyer/me", authMiddleware, getBuyerProfile);

/**
 * @swagger
 * /api/profiles/buyer/me:
 *   patch:
 *     summary: Update my buyer profile
 *     description: |
 *       Updates the buyer profile belonging to the currently authenticated
 *       BULK_BUYER user.
 *
 *       The user ID and verification information cannot be modified through
 *       this endpoint.
 *     tags:
 *       - Profiles
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Buyer profile fields to update
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessName:
 *                 type: string
 *                 maxLength: 150
 *                 example: Fresh Harvest Foods
 *
 *               businessType:
 *                 type: string
 *                 enum:
 *                   - HOTEL
 *                   - RESTAURANT
 *                   - RETAILER
 *                   - WHOLESALER
 *                   - PROCESSOR
 *                   - CATERER
 *                   - INSTITUTION
 *                   - OTHER
 *                 example: WHOLESALER
 *
 *               businessRegistrationNumber:
 *                 type: string
 *                 maxLength: 100
 *                 example: REG-123456
 *
 *               gstNumber:
 *                 type: string
 *                 example: 27ABCDE1234F1Z5
 *
 *               contactPerson:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: Rahul Sharma
 *                   phone:
 *                     type: string
 *                     pattern: '^[6-9][0-9]{9}$'
 *                     example: "9876543210"
 *
 *               businessAddress:
 *                 $ref: '#/components/schemas/Address'
 *
 *     responses:
 *       200:
 *         description: Buyer profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Buyer profile updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile:
 *                       $ref: '#/components/schemas/BuyerProfile'
 *
 *       400:
 *         description: Invalid buyer profile data
 *
 *       401:
 *         description: Authentication required or invalid token
 *
 *       403:
 *         description: Only BULK_BUYER users can update a buyer profile
 *
 *       404:
 *         description: Buyer profile not found
 *
 *       500:
 *         description: Internal server error
 */
router.patch("/buyer/me", authMiddleware, updateBuyerProfile);

/*
|--------------------------------------------------------------------------
| FPO Profile Routes
|--------------------------------------------------------------------------
*/

/**
 * @swagger
 * /api/profiles/fpo:
 *   post:
 *     summary: Create FPO profile
 *     description: |
 *       Creates an FPO profile for an existing FPO user.
 *
 *       This endpoint can only be used by an ADMIN. The target user must
 *       already exist and must have the FPO role.
 *
 *       The FPO code is generated automatically by the system.
 *     tags:
 *       - Profiles
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: FPO profile information
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FpoProfileCreateRequest'
 *     responses:
 *       201:
 *         description: FPO profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: FPO profile created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile:
 *                       $ref: '#/components/schemas/FpoProfile'
 *
 *       400:
 *         description: Invalid target user, target user does not have the FPO role, or invalid profile data
 *
 *       401:
 *         description: Authentication required or invalid token
 *
 *       403:
 *         description: Only ADMIN users can create an FPO profile
 *
 *       404:
 *         description: Target user not found
 *
 *       409:
 *         description: FPO profile already exists
 *
 *       500:
 *         description: Internal server error
 */
router.post("/fpo", authMiddleware, createFpo);

/**
 * @swagger
 * /api/profiles/fpo/me:
 *   get:
 *     summary: Get my FPO profile
 *     description: |
 *       Retrieves the FPO profile belonging to the currently authenticated
 *       FPO user.
 *     tags:
 *       - Profiles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: FPO profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: FPO profile retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile:
 *                       $ref: '#/components/schemas/FpoProfile'
 *
 *       401:
 *         description: Authentication required or invalid token
 *
 *       403:
 *         description: Only FPO users can access an FPO profile
 *
 *       404:
 *         description: FPO profile not found
 *
 *       500:
 *         description: Internal server error
 */
router.get("/fpo/me", authMiddleware, getFpoProfile);

/**
 * @swagger
 * /api/profiles/fpo/me:
 *   patch:
 *     summary: Update my FPO profile
 *     description: |
 *       Updates the FPO profile belonging to the currently authenticated
 *       FPO user.
 *
 *       The user ID, FPO code and verification information cannot be modified
 *       through this endpoint.
 *     tags:
 *       - Profiles
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: FPO profile fields to update
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organizationName:
 *                 type: string
 *                 maxLength: 200
 *                 example: Pune Farmers Producer Organization
 *
 *               registrationNumber:
 *                 type: string
 *                 maxLength: 100
 *                 example: FPO-REG-12345
 *
 *               registrationType:
 *                 type: string
 *                 maxLength: 50
 *                 example: FPO
 *
 *               contactDetails:
 *                 type: object
 *                 properties:
 *                   phone:
 *                     type: string
 *                     example: "9876543210"
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: fpo@example.com
 *
 *               address:
 *                 type: object
 *                 properties:
 *                   village:
 *                     type: string
 *                     example: Wagholi
 *                   district:
 *                     type: string
 *                     example: Pune
 *                   state:
 *                     type: string
 *                     example: Maharashtra
 *                   pincode:
 *                     type: string
 *                     pattern: '^[1-9][0-9]{5}$'
 *                     example: "411057"
 *
 *     responses:
 *       200:
 *         description: FPO profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: FPO profile updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile:
 *                       $ref: '#/components/schemas/FpoProfile'
 *
 *       400:
 *         description: Invalid FPO profile data
 *
 *       401:
 *         description: Authentication required or invalid token
 *
 *       403:
 *         description: Only FPO users can update an FPO profile
 *
 *       404:
 *         description: FPO profile not found
 *
 *       500:
 *         description: Internal server error
 */
router.patch("/fpo/me", authMiddleware, updateFpoProfile);

/*
|--------------------------------------------------------------------------
| Logistics Profile Routes
|--------------------------------------------------------------------------
*/

/**
 * @swagger
 * /api/profiles/logistics:
 *   post:
 *     summary: Create logistics profile
 *     description: |
 *       Creates a logistics profile for an existing LOGISTICS user.
 *
 *       This endpoint can only be used by an ADMIN. The target user must
 *       already exist and must have the LOGISTICS role.
 *     tags:
 *       - Profiles
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Logistics profile information
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogisticsProfileCreateRequest'
 *     responses:
 *       201:
 *         description: Logistics profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logistics profile created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile:
 *                       $ref: '#/components/schemas/LogisticsProfile'
 *
 *       400:
 *         description: Invalid target user, target user does not have the LOGISTICS role, or invalid profile data
 *
 *       401:
 *         description: Authentication required or invalid token
 *
 *       403:
 *         description: Only ADMIN users can create a logistics profile
 *
 *       404:
 *         description: Target user not found
 *
 *       409:
 *         description: Logistics profile already exists
 *
 *       500:
 *         description: Internal server error
 */
router.post("/logistics", authMiddleware, createLogistics);

/**
 * @swagger
 * /api/profiles/logistics/me:
 *   get:
 *     summary: Get my logistics profile
 *     description: |
 *       Retrieves the logistics profile belonging to the currently
 *       authenticated LOGISTICS user.
 *     tags:
 *       - Profiles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logistics profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logistics profile retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile:
 *                       $ref: '#/components/schemas/LogisticsProfile'
 *
 *       401:
 *         description: Authentication required or invalid token
 *
 *       403:
 *         description: Only LOGISTICS users can access a logistics profile
 *
 *       404:
 *         description: Logistics profile not found
 *
 *       500:
 *         description: Internal server error
 */
router.get("/logistics/me", authMiddleware, getLogisticsProfile);

/**
 * @swagger
 * /api/profiles/logistics/me:
 *   patch:
 *     summary: Update my logistics profile
 *     description: |
 *       Updates the logistics profile belonging to the currently
 *       authenticated LOGISTICS user.
 *
 *       The user ID and verification information cannot be modified
 *       through this endpoint.
 *     tags:
 *       - Profiles
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Logistics profile fields to update
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               partnerType:
 *                 type: string
 *                 maxLength: 50
 *                 example: LOGISTICS_PARTNER
 *
 *               companyName:
 *                 type: string
 *                 maxLength: 150
 *                 example: ABC Logistics
 *
 *               contactNumber:
 *                 type: string
 *                 pattern: '^[6-9][0-9]{9}$'
 *                 example: "9876543210"
 *
 *               serviceAreas:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: string
 *                 example:
 *                   - Pune
 *                   - Mumbai
 *                   - Nashik
 *
 *     responses:
 *       200:
 *         description: Logistics profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logistics profile updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile:
 *                       $ref: '#/components/schemas/LogisticsProfile'
 *
 *       400:
 *         description: Invalid logistics profile data
 *
 *       401:
 *         description: Authentication required or invalid token
 *
 *       403:
 *         description: Only LOGISTICS users can update a logistics profile
 *
 *       404:
 *         description: Logistics profile not found
 *
 *       500:
 *         description: Internal server error
 */
router.patch("/logistics/me", authMiddleware, updateLogisticsProfile);

/*
|--------------------------------------------------------------------------
| Government Profile Routes
|--------------------------------------------------------------------------
*/

/**
 * @swagger
 * /api/profiles/government:
 *   post:
 *     summary: Create government officer profile
 *     description: |
 *       Creates a government officer profile for an existing
 *       GOVERNMENT_OFFICER user.
 *
 *       This endpoint can only be used by an ADMIN. The target user must
 *       already exist and must have the GOVERNMENT_OFFICER role.
 *
 *       The officer code is generated automatically by the system.
 *     tags:
 *       - Profiles
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Government officer profile information
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - department
 *               - designation
 *               - jurisdiction
 *             properties:
 *               userId:
 *                 type: string
 *                 format: object-id
 *                 description: Existing user ID of the government officer.
 *                 example: 66c8f3a1234567890abcdef1
 *
 *               department:
 *                 type: string
 *                 maxLength: 150
 *                 example: Agriculture Department
 *
 *               designation:
 *                 type: string
 *                 maxLength: 150
 *                 example: District Agriculture Officer
 *
 *               jurisdiction:
 *                 type: object
 *                 required:
 *                   - state
 *                   - district
 *                 properties:
 *                   state:
 *                     type: string
 *                     example: Maharashtra
 *                   district:
 *                     type: string
 *                     example: Pune
 *
 *     responses:
 *       201:
 *         description: Government profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Government profile created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile:
 *                       $ref: '#/components/schemas/GovernmentProfile'
 *
 *       400:
 *         description: Invalid target user, target user does not have the GOVERNMENT_OFFICER role, or invalid profile data
 *
 *       401:
 *         description: Authentication required or invalid token
 *
 *       403:
 *         description: Only ADMIN users can create a government profile
 *
 *       404:
 *         description: Target user not found
 *
 *       409:
 *         description: Government profile already exists
 *
 *       500:
 *         description: Internal server error
 */
router.post("/government", authMiddleware, createGovernment);

/**
 * @swagger
 * /api/profiles/government/me:
 *   get:
 *     summary: Get my government profile
 *     description: |
 *       Retrieves the government officer profile belonging to the
 *       currently authenticated GOVERNMENT_OFFICER user.
 *     tags:
 *       - Profiles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Government profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Government profile retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile:
 *                       $ref: '#/components/schemas/GovernmentProfile'
 *
 *       401:
 *         description: Authentication required or invalid token
 *
 *       403:
 *         description: Only GOVERNMENT_OFFICER users can access a government profile
 *
 *       404:
 *         description: Government profile not found
 *
 *       500:
 *         description: Internal server error
 */
router.get("/government/me", authMiddleware, getGovernmentProfile);

/**
 * @swagger
 * /api/profiles/government/me:
 *   patch:
 *     summary: Update my government profile
 *     description: |
 *       Updates the government officer profile belonging to the currently
 *       authenticated GOVERNMENT_OFFICER user.
 *
 *       The user ID, officer code and verification information cannot be
 *       modified through this endpoint.
 *     tags:
 *       - Profiles
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Government profile fields to update
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               department:
 *                 type: string
 *                 maxLength: 150
 *                 example: Agriculture Department
 *
 *               designation:
 *                 type: string
 *                 maxLength: 150
 *                 example: District Agriculture Officer
 *
 *               jurisdiction:
 *                 type: object
 *                 properties:
 *                   state:
 *                     type: string
 *                     example: Maharashtra
 *                   district:
 *                     type: string
 *                     example: Pune
 *
 *     responses:
 *       200:
 *         description: Government profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Government profile updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile:
 *                       $ref: '#/components/schemas/GovernmentProfile'
 *
 *       400:
 *         description: Invalid government profile data
 *
 *       401:
 *         description: Authentication required or invalid token
 *
 *       403:
 *         description: Only GOVERNMENT_OFFICER users can update a government profile
 *
 *       404:
 *         description: Government profile not found
 *
 *       500:
 *         description: Internal server error
 */
router.patch("/government/me", authMiddleware, updateGovernmentProfile);

module.exports = router;
