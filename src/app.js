const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const profileRoutes = require("./routes/profile.routes");

const productRoutes = require("./routes/product.routes");
const adminProductRoutes = require("./routes/admin.product.routes");

const inventoryRoutes = require("./routes/inventory.routes");
const adminInventoryRoutes = require("./routes/admin.inventory.routes");

const orderRoutes = require("./routes/order.routes");
const adminOrderRoutes = require("./routes/admin.order.routes");

const env = require("./config/env");
const { API_PREFIX, APP_NAME } = require("./config/constants");

const app = express();

/*
|--------------------------------------------------------------------------
| Security Middleware
|--------------------------------------------------------------------------
*/

app.use(helmet());

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true
  })
);

/*
|--------------------------------------------------------------------------
| Rate Limiting
|--------------------------------------------------------------------------
*/

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later."
  }
});

app.use(API_PREFIX, apiLimiter);

/*
|--------------------------------------------------------------------------
| Request Parsing
|--------------------------------------------------------------------------
*/

app.use(express.json({ limit: "2mb" }));

app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| Logging
|--------------------------------------------------------------------------
*/

if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

/*
|--------------------------------------------------------------------------
| API Documentation
|--------------------------------------------------------------------------
*/

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: "FarmDirect API Documentation"
  })
);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check API health
 *     description: Returns the current health and runtime status of the FarmDirect API.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API is healthy and running
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
 *                   example: FarmDirect API is running
 *                 environment:
 *                   type: string
 *                   example: development
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get(`${API_PREFIX}/health`, (req, res) => {
  res.status(200).json({
    success: true,
    message: `${APP_NAME} API is running`,
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

/*
|--------------------------------------------------------------------------
| Root Route
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: `${APP_NAME} backend is running`
  });
});

/*
|--------------------------------------------------------------------------
| Auth Handler
|--------------------------------------------------------------------------
*/

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);

/*
|--------------------------------------------------------------------------
| Porfile Handler
|--------------------------------------------------------------------------
*/
app.use("/api/profiles", profileRoutes);
/*
|--------------------------------------------------------------------------
| Product Handler
|--------------------------------------------------------------------------
*/
app.use("/api/products", productRoutes);
app.use("/api/admin/products", adminProductRoutes);
/*
|--------------------------------------------------------------------------
| Inventory Handler
|--------------------------------------------------------------------------
*/
app.use("/api/inventory", inventoryRoutes);
app.use("/api/admin/inventory", adminInventoryRoutes);
/*
|--------------------------------------------------------------------------
| Order Handler
|--------------------------------------------------------------------------
*/
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use((err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Internal server error"
  });
});

module.exports = app;
