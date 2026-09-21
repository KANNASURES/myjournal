/* ═══════════════════════════════════════════════════════════
   LUMIO — USER ROUTES
   GET   /api/user/profile
   PUT   /api/user/profile
   PUT   /api/user/password
   DELETE /api/user/account
═══════════════════════════════════════════════════════════ */

const express = require('express');
const router  = express.Router();

// Placeholder — full implementation in Phase 13
router.get('/ping', function (req, res) {
  res.json({ success: true, message: 'User routes active' });
});

module.exports = router;