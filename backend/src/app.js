const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./features/auth/auth.routes");
const adminRoutes = require("./features/admin/admin.routes");
const productRoutes = require("./features/products/product.routes");
const orderRoutes = require("./features/orders/order.routes");
const paymentRoutes = require("./features/payments/payment.routes");
const httpCache = require("./common/middleware/httpCache");

const app = express();

// middleware
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      process.env.CLIENT_URL,
    ].filter(Boolean),
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(httpCache);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/", (req, res) => {
  res.send("API running");
});

app.get("/home", (req, res) => {
  res.send("Welcome to the Dropshipping API");
});

module.exports = app;

