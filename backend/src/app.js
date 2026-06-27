const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { createCorsOptions } = require("./common/corsOrigins");
const { apiLimiter } = require("./common/middleware/rateLimiter");
const {authLimiter} = require("./common/middleware/rateLimiter");
const {registerLimiter}= require("./common/middleware/rateLimiter");
const {client,httpRequests,httpDuration} = require("./common/metrices/metrices");
const authRoutes = require("./features/auth/auth.routes");
const adminRoutes = require("./features/admin/admin.routes");
const productRoutes = require("./features/products/product.routes");
const orderRoutes = require("./features/orders/order.routes");
const paymentRoutes = require("./features/payments/payment.routes");
const { sessionMiddleware } = require("./common/auth/session");
const { notFoundHandler, errorHandler } = require("./common/middleware/errorHandler");
const mountSwagger = require("./common/docs/swagger");

const app = express();

app.set("trust proxy", 1);

// middleware
app.use(cors(createCorsOptions()));
app.use(express.json());
app.use(cookieParser());
app.use(sessionMiddleware);

app.use((req, res, next) => {
  const end = httpDuration.startTimer();

  res.on("finish", () => {
    httpRequests.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode,
    });

    end({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode,
    });

    console.log({
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
    });
  });

  next();
});

// API docs (Swagger)
mountSwagger(app);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/auth/login", authLimiter);
app.use("/api", apiLimiter);
app.use("/api/auth/register", registerLimiter);
app.get(["/api", "/api/"], (req, res) => {
  res.json({
    ok: true,
    message: "Dropshipping API",
    endpoints: {
      health: "GET /api/health",
      auth: "POST /api/auth/login",
      products: "GET /api/products",
      orders: "GET /api/orders (auth required)",
    },
  });
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});
app.get("/api/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});
app.get("/", (req, res) => {
  res.send("API running");
});

app.get("/home", (req, res) => {
  res.send("Welcome to the Dropshipping API");
});

// 404 handler and centralized error handler
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
