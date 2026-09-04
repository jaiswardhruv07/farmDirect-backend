const { connectDB, disconnectDB } = require("./db");
const seedRBAC = require("./seed");

const run = async () => {
  try {
    await connectDB();

    await seedRBAC();

    await disconnectDB();

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);

    await disconnectDB();

    process.exit(1);
  }
};

run();