const express = require("express");

const {
  createFarmer
} = require("../controllers/profile.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post(
  "/farmer",
  authMiddleware,
  createFarmer
);

module.exports = router;