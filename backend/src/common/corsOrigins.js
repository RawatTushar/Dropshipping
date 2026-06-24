/** Build allowed browser origins (scheme + host + port only — no URL paths). */
function buildAllowedOrigins() {
  const raw = [
    process.env.FRONTEND_URL,
    process.env.CLIENT_URL,
    process.env.CORS_ORIGIN,
    "http://localhost",
    "http://localhost:5173",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://127.0.0.1",
    "http://localhost:4000"
  ];

  const origins = new Set();
  for (const entry of raw) {
    if (!entry) continue;
    try {
      origins.add(new URL(entry).origin);
    } catch {
      const trimmed = String(entry).replace(/\/$/, "");
      if (trimmed) origins.add(trimmed);
    }
  }
  return [...origins];
}

function createCorsOptions() {
  const allowed = buildAllowedOrigins();

  return {
    origin(origin, callback) {
      // Same-origin or server-to-server (no Origin header)
      if (!origin) return callback(null, true);
      if (allowed.includes(origin)) return callback(null, true);
      console.warn("[cors] blocked origin:", origin, "| allowed:", allowed.join(", "));
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  };
}

module.exports = { buildAllowedOrigins, createCorsOptions };
