const User = require("../models/User");
const Role = require("../models/Role");

const { ROLES, USER_STATUS } = require("./constants");

const seedAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;

  const adminPhone = process.env.ADMIN_PHONE;

  const adminPassword = process.env.ADMIN_PASSWORD;

  const adminFirstName =
    process.env.ADMIN_FIRST_NAME || "System";

  const adminLastName =
    process.env.ADMIN_LAST_NAME || "Administrator";

  if (!adminEmail || !adminPhone || !adminPassword) {
    throw new Error(
      "ADMIN_EMAIL, ADMIN_PHONE and ADMIN_PASSWORD are required"
    );
  }

  const adminRole = await Role.findOne({
    name: ROLES.ADMIN
  });

  if (!adminRole) {
    throw new Error(
      "ADMIN role not found. Run npm run seed first."
    );
  }

  const existingAdmin = await User.findOne({
    email: adminEmail.toLowerCase()
  });

  if (existingAdmin) {
    console.log("Admin user already exists");

    return;
  }

  const passwordHash = await User.hashPassword(
    adminPassword
  );

  await User.create({
    firstName: adminFirstName,
    lastName: adminLastName,
    email: adminEmail.toLowerCase(),
    phone: adminPhone,
    passwordHash,
    roleId: adminRole._id,
    status: USER_STATUS.ACTIVE,
    isEmailVerified: true,
    isPhoneVerified: true
  });

  console.log("Initial admin user created");
};

module.exports = seedAdmin;