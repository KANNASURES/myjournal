/* ═══════════════════════════════════════════════════════════
   LUMIO — AUTH ROUTES
   POST /api/auth/register
   POST /api/auth/login
   GET  /api/auth/me
═══════════════════════════════════════════════════════════ */

const express = require('express');
const router  = express.Router();

// Placeholder — full implementation in Phase 11
router.get('/ping', function (req, res) {
  res.json({ success: true, message: 'Auth routes active' });
});

module.exports = router;