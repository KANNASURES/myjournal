/* ═══════════════════════════════════════════════════════════
   LUMIO — EXPRESS APP SETUP
   Registers all middleware and routes.
   Kept separate from server.js so it can be
   imported in tests without starting the HTTP server.
═══════════════════════════════════════════════════════════ */

const express  = require('express');
const cors     = require('cors');
const config   = require('./config/config');
const { notFound, errorHandler } = require('./middleware/error.middleware');

// Route imports (we will create these next)
const authRoutes    = require('./routes/auth.routes');
const journalRoutes = require('./routes/journal.routes');
const userRoutes    = require('./routes/user.routes');

const app = express();

/* ─── CORS ───────────────────────────────────────────────── */
// Allow requests from our frontend (Live Server URL)
app.use(cors({
  origin: [
    config.cors.clientUrl,
    'http://localhost:5500',
    'http://127.0.0.1:5500'
  ],
  methods:          ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders:   ['Content-Type', 'Authorization'],
  credentials:      true
}));

/* ─── BODY PARSERS ───────────────────────────────────────── */
app.use(express.json({ limit: '10mb' }));           // parse JSON bodies
app.use(express.urlencoded({ extended: true }));    // parse form data

/* ─── REQUEST LOGGER (Development only) ─────────────────── */
if (config.server.isDev) {
  app.use(function (req, res, next) {
    console.log(`  → ${req.method} ${req.originalUrl}`);
    next();
  });
}

/* ─── HEALTH CHECK ───────────────────────────────────────── */
// Simple endpoint to verify the server is running
app.get('/api/health', function (req, res) {
  res.json({
    success: true,
    message: 'Lumio API is running',
    version: '1.0.0',
    environment: config.server.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

/* ─── ROUTES ─────────────────────────────────────────────── */
app.use('/api/auth',    authRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/user',    userRoutes);

/* ─── ERROR HANDLERS (must be last) ─────────────────────── */
app.use(notFound);
app.use(errorHandler);

module.exports = app;