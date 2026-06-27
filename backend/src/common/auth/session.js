const session = require("express-session");
const PostgreSQLStore = require("connect-pg-simple")(session);
const { Pool } = require("pg");
const { sequelize } = require("../../config/db");

const SESSION_SECRET = process.env.SESSION_SECRET || process.env.JWT_SECRET;

if (!SESSION_SECRET) {
  console.error("❌ SESSION_SECRET or JWT_SECRET is required in backend env");
}

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: process.env.POSTGRES_SSL !== "false"
    ? { rejectUnauthorized: false }
    : false,
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 30000,
});

const ensureSessionTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS session (
        sid varchar NOT NULL,
        sess json NOT NULL,
        expire timestamp(6) NOT NULL,
        CONSTRAINT session_pkey PRIMARY KEY (sid)
      );
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_session_expire ON session (expire)');
    console.log('✅ session table ready');
  } catch (err) {
    console.error('❌ Failed to create session table:', err.message);
  }
};

ensureSessionTable();

const sessionMiddleware = session({
  store: new PostgreSQLStore({
    pool: pool,
    tableName: "session",
    pruneSessionInterval: 60 * 60,
  }),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  },
});

module.exports = { sessionMiddleware };
