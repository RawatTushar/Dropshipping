const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "order_id",
    },
    productId: {
      type: DataTypes.UUID,
      field: "product_id",
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    image: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "order_items",
    timestamps: false,
    underscored: true,
  }
);

module.exports = OrderItem;
