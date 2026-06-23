const { Sequelize } = require("sequelize");

const connectionUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!connectionUrl) {
  console.error("❌ POSTGRES_URL or DATABASE_URL is required in backend env");
}

const useSsl = process.env.POSTGRES_SSL !== "false";

// Initialize Sequelize with PostgreSQL
const sequelize = new Sequelize(connectionUrl, {
  dialect: "postgres",
  logging: false,
  dialectOptions: useSsl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

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