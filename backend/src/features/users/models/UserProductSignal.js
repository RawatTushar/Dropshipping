const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const UserProductSignal = sequelize.define(
  "UserProductSignal",
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
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "product_id",
    },
    signalType: {
      type: DataTypes.ENUM("recentlyViewed", "cartAdds"),
      allowNull: false,
      field: "signal_type",
    },
  },
  {
    tableName: "user_product_signals",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    underscored: true,
  }
);

module.exports = UserProductSignal;
