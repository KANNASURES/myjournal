/* ═══════════════════════════════════════════════════════════
   LUMIO — JOURNAL ROUTES
   All routes protected — valid JWT required.

   GET    /api/journal              → all entries (paginated)
   POST   /api/journal              → create entry
   GET    /api/journal/calendar     → calendar dates
   GET    /api/journal/mood-stats   → mood distribution
   GET    /api/journal/:id          → single entry
   PUT    /api/journal/:id          → update entry
   DELETE /api/journal/:id          → delete entry

   IMPORTANT: static routes (/calendar, /mood-stats)
   must be defined BEFORE dynamic routes (/:id)
   otherwise Express matches "calendar" as an id.
═══════════════════════════════════════════════════════════ */

const express  = require('express');
const router   = express.Router();
const {
  getAllEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
  getCalendar,
  getMoodStats
} = require('../controllers/journal.controller');
const { protect } = require('../middleware/auth.middleware');

/* ── All journal routes require authentication ── */
router.use(protect);

/* ── Collection routes ── */
router.get('/',            getAllEntries);
router.post('/',           createEntry);

/* ── Static named routes (before /:id) ── */
router.get('/calendar',    getCalendar);
router.get('/mood-stats',  getMoodStats);

/* ── Single entry routes ── */
router.get('/:id',         getEntry);
router.put('/:id',         updateEntry);
router.delete('/:id',      deleteEntry);

module.exports = router;