const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { createCorsOptions } = require("./common/corsOrigins");

const authRoutes = require("./features/auth/auth.routes");
const adminRoutes = require("./features/admin/admin.routes");
const productRoutes = require("./features/products/product.routes");
const orderRoutes = require("./features/orders/order.routes");
const paymentRoutes = require("./features/payments/payment.routes");
const httpCache = require("./common/middleware/httpCache");

const app = express();

app.set("trust proxy", 1);

// middleware
app.use(cors(createCorsOptions()));
app.use(express.json());
app.use(cookieParser());
app.use(httpCache);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

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

app.get("/", (req, res) => {
  res.send("API running");
});

app.get("/home", (req, res) => {
  res.send("Welcome to the Dropshipping API");
});

module.exports = app;

