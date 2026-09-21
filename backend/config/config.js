/* ═══════════════════════════════════════════════════════════
   LUMIO — APP CONFIGURATION
   Reads from .env and exports a clean config object.
   MAANG practice: never read process.env directly in
   route files — always import from config.
═══════════════════════════════════════════════════════════ */

require('dotenv').config();

const config = {
  server: {
    port:     parseInt(process.env.PORT, 10) || 5000,
    nodeEnv:  process.env.NODE_ENV || 'development',
    isDev:    process.env.NODE_ENV !== 'production'
  },

  db: {
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT, 10) || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    name:     process.env.DB_NAME     || 'lumio_db'
  },

  jwt: {
    secret:    process.env.JWT_SECRET    || 'fallback_secret_change_this',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  cors: {
    clientUrl: process.env.CLIENT_URL || 'http://127.0.0.1:5500'
  }
};

module.exports = config;