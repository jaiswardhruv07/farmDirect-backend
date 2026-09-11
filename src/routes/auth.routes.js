const express = require("express");

const {
  register,
  login,
  getRoles,
  getCurrentUser
} = require("../controllers/auth.controller");

const authenticate = require("../middlewares/auth.middleware");

const validate = require("../middlewares/validation.middleware");

const { registerSchema, loginSchema } = require("../schemas/auth.schema");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public Authentication Routes
|--------------------------------------------------------------------------
*/

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a Farmer or Consumer
 *     description: Public registration is allowed only for FARMER and CONSUMER roles.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid request data
 *       403:
 *         description: Requested role is not allowed for public registration
 *       409:
 *         description: Email or phone number already registered
 */
router.post("/register", validate(registerSchema), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login
 *     description: Authenticate a registered FarmDirect user and receive a JWT access token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: User account is not active
 */
router.post("/login", validate(loginSchema), login);

/**
 * @swagger
 * /api/auth/roles:
 *   get:
 *     summary: Get public registration roles
 *     description: Returns the Farmer and Consumer roles available for public registration.
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Public roles returned successfully
 */
router.get("/roles", getRoles);

/*
|--------------------------------------------------------------------------
| Authenticated User
|--------------------------------------------------------------------------
*/

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     description: Returns the profile, role and permissions of the currently authenticated user.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user returned successfully
 *       401:
 *         description: Authentication token is missing, invalid or expired
 *       403:
 *         description: User account is not active
 */
router.get("/me", authenticate, getCurrentUser);

module.exports = router;
