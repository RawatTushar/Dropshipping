const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "",
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_admin",
    },
    isEmailConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_email_confirmed",
    },
    emailConfirmationToken: {
      type: DataTypes.TEXT,
      field: "email_confirmation_token",
    },
    emailConfirmationExpires: {
      type: DataTypes.DATE,
      field: "email_confirmation_expires",
    },
    loginOtpHash: {
      type: DataTypes.TEXT,
      field: "login_otp_hash",
    },
    loginOtpExpires: {
      type: DataTypes.DATE,
      field: "login_otp_expires",
    },
    magicLoginTokenHash: {
      type: DataTypes.TEXT,
      field: "magic_login_token_hash",
    },
    magicLoginExpires: {
      type: DataTypes.DATE,
      field: "magic_login_expires",
    },
    googleId: {
      type: DataTypes.STRING(255),
      field: "google_id",
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
  }
);

module.exports = User;
