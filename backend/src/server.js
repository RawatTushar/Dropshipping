require("dotenv").config();
const connectDB = require("./config/db");
const setupDNS = require("./config/dns");
const app = require("./app");

setupDNS();
connectDB();

const PORT = process.env.PORT;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(
    "Auth OTP routes: POST /api/auth/login-otp/send | POST /api/auth/login-otp/verify"
  );
});

