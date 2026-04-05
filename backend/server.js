require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const dns = require("dns");
const setupDNS = () => {
  dns.setServers(["1.1.1.1", "8.8.8.8"]); // Cloudflare + Google
};


const app = express();

// middleware
app.use(cors());
app.use(express.json());

// Set up DNS
setupDNS();

// DB connect
connectDB();

// routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

app.get("/", (req, res) => {
  res.send("API running");
});

app.get("/home", (req, res) => {
  res.send("Welcome to the Dropshipping API");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(
    "Auth OTP routes: POST /api/auth/login-otp/send | POST /api/auth/login-otp/verify"
  );
});

module.exports = setupDNS;