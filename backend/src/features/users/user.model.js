/**
 * @swagger
 * /test:
 *   get:
 *     summary: Test endpoint
 *     responses:
 *       200:
 *         description: OK
 */
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, default: "" },
    isAdmin: { type: Boolean, default: false },
    isEmailConfirmed: { type: Boolean, default: false },
    emailConfirmationToken: { type: String },
    emailConfirmationExpires: { type: Date },
    loginOtpHash: { type: String },
    loginOtpExpires: { type: Date },
    magicLoginTokenHash: { type: String },
    magicLoginExpires: { type: Date },
    googleId: { type: String },
    /** Per-user catalog signals for personalized recommendations (capped in controller). */
    productSignals: {
      recentlyViewed: [
        {
          product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
          at: { type: Date, default: Date.now },
        },
      ],
      cartAdds: [
        {
          product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
          at: { type: Date, default: Date.now },
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
