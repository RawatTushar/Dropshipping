const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
    },
    paymentMethod: {
      type: DataTypes.STRING(100),
      field: "payment_method",
    },
    itemsPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: "items_price",
    },
    shippingPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: "shipping_price",
    },
    taxPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: "tax_price",
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: "total_price",
    },
    shippingAddress: {
      type: DataTypes.TEXT,
      field: "shipping_address",
    },
    shippingCity: {
      type: DataTypes.STRING(255),
      field: "shipping_city",
    },
    shippingPostalCode: {
      type: DataTypes.STRING(50),
      field: "shipping_postal_code",
    },
    shippingCountry: {
      type: DataTypes.STRING(255),
      field: "shipping_country",
    },
    isPaid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_paid",
    },
    paidAt: {
      type: DataTypes.DATE,
      field: "paid_at",
    },
    stripeSessionId: {
      type: DataTypes.STRING(255),
      unique: true,
      field: "stripe_session_id",
    },
    isDelivered: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_delivered",
    },
    deliveredAt: {
      type: DataTypes.DATE,
      field: "delivered_at",
    },
  },
  {
    tableName: "orders",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Order;
