const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    isEmailConfirmed: { type: Boolean, default: false },
    emailConfirmationToken: { type: String },
    emailConfirmationExpires: { type: Date },
    loginOtpHash: { type: String },
    loginOtpExpires: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
