/* ═══════════════════════════════════════════════════════════
   LUMIO — AUTH ROUTES
   POST /api/auth/register  → register new user
   POST /api/auth/login     → login + get token
   GET  /api/auth/me        → get current user (protected)
═══════════════════════════════════════════════════════════ */

const express    = require('express');
const router     = express.Router();
const { register, login, getMe } = require('../controllers/auth.controller');
const { protect }                = require('../middleware/auth.middleware');

/* ── Public routes (no token needed) ── */
router.post('/register', register);
router.post('/login',    login);

/* ── Protected route (token required) ── */
router.get('/me', protect, getMe);

module.exports = router;