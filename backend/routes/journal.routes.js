/* ═══════════════════════════════════════════════════════════
   LUMIO — JOURNAL ROUTES
   GET    /api/journal
   POST   /api/journal
   GET    /api/journal/:id
   PUT    /api/journal/:id
   DELETE /api/journal/:id
═══════════════════════════════════════════════════════════ */

const express = require('express');
const router  = express.Router();

// Placeholder — full implementation in Phase 12
router.get('/ping', function (req, res) {
  res.json({ success: true, message: 'Journal routes active' });
});

module.exports = router;