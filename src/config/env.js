const dotenv = require("dotenv");

dotenv.config();

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",

  PORT: Number(process.env.PORT) || 5000,

  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/agri_marketplace",

  JWT_SECRET: process.env.JWT_SECRET || "change_this_secret",

  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000"
};

module.exports = env;
