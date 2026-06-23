require("dotenv").config();
const { connectDB, sequelize } = require("./config/db");
const setupDNS = require("./config/dns");
const app = require("./app");
const models = require("./models"); // Load all models and associations

setupDNS();

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDB();
    // MongoDB removed from runtime: backend now uses PostgreSQL/Sequelize
    
    // Sync models with database (creates tables if they don't exist)
    await sequelize.sync({ alter: false });
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(
        "Auth OTP routes: POST /api/auth/login-otp/send | POST /api/auth/login-otp/verify"
      );
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();

