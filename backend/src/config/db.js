const { Sequelize } = require("sequelize");

// Initialize Sequelize with PostgreSQL
const sequelize = new Sequelize(
  process.env.POSTGRES_URL || process.env.DATABASE_URL,
  {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected successfully");
    return sequelize;
  } catch (err) {
    console.error("❌ PostgreSQL connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = { connectDB, sequelize };