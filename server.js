const app = require("./src/app");
const env = require("./src/config/env");
const { connectDB } = require("./src/config/db");

const startServer = async () => {
  try {
    await connectDB();

    app.listen(env.PORT, () => {
      console.log(`FarmDirect server running on http://localhost:${env.PORT}`);

      console.log(`Health check: http://localhost:${env.PORT}/api/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
