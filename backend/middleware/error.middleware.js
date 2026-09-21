/* ═══════════════════════════════════════════════════════════
   LUMIO — GLOBAL ERROR HANDLER MIDDLEWARE
   Catches any error thrown with next(err) in route handlers.
   Returns a clean JSON error response.
   MAANG practice: centralise all error handling — never
   write res.status(500) scattered across route files.
═══════════════════════════════════════════════════════════ */

const config = require('../config/config');

/* ─── 404 Handler ────────────────────────────────────────── */
function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

/* ─── Global Error Handler ───────────────────────────────── */
function errorHandler(err, req, res, next) {
  // Default to 500 if no status set
  const statusCode = err.status || err.statusCode || 500;

  // Log full error in development
  if (config.server.isDev) {
    console.error(`\n✗ ERROR [${statusCode}]: ${err.message}`);
    if (err.stack) console.error(err.stack);
  }

  // Standard JSON error response
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    // Only show stack trace in development
    ...(config.server.isDev && { stack: err.stack })
  });
}

module.exports = { notFound, errorHandler };