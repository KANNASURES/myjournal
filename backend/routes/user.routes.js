/* ═══════════════════════════════════════════════════════════
   LUMIO — USER ROUTES
   All routes protected — valid JWT required.

   GET    /api/user/profile  → get profile + stats
   PUT    /api/user/profile  → update profile
   PUT    /api/user/password → change password
   DELETE /api/user/account  → delete account
═══════════════════════════════════════════════════════════ */

const express  = require('express');
const router   = express.Router();
const {
  getProfile,
  updateProfile,
  updatePassword,
  deleteAccount
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

/* ── All user routes require authentication ── */
router.use(protect);

router.get('/profile',    getProfile);
router.put('/profile',    updateProfile);
router.put('/password',   updatePassword);
router.delete('/account', deleteAccount);

module.exports = router;