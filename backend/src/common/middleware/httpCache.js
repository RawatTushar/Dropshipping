/**
 * Sets Cache-Control for GET responses so browsers can reuse catalog data safely.
 * Mutations always use no-store.
 */
function httpCache(req, res, next) {
  if (req.method !== "GET") {
    res.setHeader("Cache-Control", "no-store");
    return next();
  }

  const path = req.originalUrl.split("?")[0];

  // Catalog must stay fresh when admin updates price/stock
  if (path === "/api/products") {
    res.setHeader("Cache-Control", "private, no-cache, must-revalidate");
  } else if (/^\/api\/products\/[a-f\d]{24}$/i.test(path)) {
    res.setHeader("Cache-Control", "private, no-cache, must-revalidate");
  } else if (/\/recommendations$/.test(path)) {
    res.setHeader("Cache-Control", "private, max-age=60");
  } else if (path.startsWith("/api/orders")) {
    res.setHeader("Cache-Control", "private, max-age=30, must-revalidate");
  } else if (path === "/api/payments/config") {
    res.setHeader("Cache-Control", "private, max-age=300");
  } else if (path.startsWith("/api/auth")) {
    res.setHeader("Cache-Control", "no-store");
  } else {
    res.setHeader("Cache-Control", "no-store");
  }

  return next();
}

module.exports = httpCache;
