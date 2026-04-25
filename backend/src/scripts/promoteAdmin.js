require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const email = process.argv[2] || "tusharrawatdpss1@gmail.com";

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    const r = await User.updateOne({ email }, { $set: { isAdmin: true } });
    if (r.matchedCount === 0) {
      console.error("No user found with email:", email);
      process.exit(1);
    }
    console.log("Updated isAdmin=true for:", email, "(modified:", r.modifiedCount, ")");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
