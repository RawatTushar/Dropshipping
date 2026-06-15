const isProd = process.env.NODE_ENV === "production";

function notFoundHandler(req, res, next) {
  const err = new Error(`Not Found - ${req.originalUrl}`);
  err.status = 404;
  next(err);
}

function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log the error (can be replaced with a proper logger)
  if (!isProd) {
    console.error(err);
  } else {
    // in production, log minimal info
    console.error(`${status} - ${message}`);
  }

  const payload = { ok: false, status, message };
  if (!isProd && err.stack) payload.stack = err.stack;

  res.status(status).json(payload);
}

module.exports = { notFoundHandler, errorHandler };
