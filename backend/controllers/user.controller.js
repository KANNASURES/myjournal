/* ═══════════════════════════════════════════════════════════
   LUMIO — USER CONTROLLER
   Handles profile update, password change, account delete.
═══════════════════════════════════════════════════════════ */

const bcrypt    = require('bcryptjs');
const UserModel = require('../models/user.model');

/* ═══════════════════════════════════════════════════════════
   GET /api/user/profile
   Returns full profile + stats for logged-in user.
═══════════════════════════════════════════════════════════ */
async function getProfile(req, res, next) {
  try {
    const user = await UserModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const stats = await UserModel.getStats(user.id);

    return res.status(200).json({
      success: true,
      user: {
        id:          user.id,
        name:        user.name,
        email:       user.email,
        bio:         user.bio,
        journalName: user.journal_name,
        avatarUrl:   user.avatar_url,
        streakCount: user.streak_count,
        lastEntryAt: user.last_entry_at,
        createdAt:   user.created_at
      },
      stats: {
        totalEntries:  stats.total_entries,
        totalWords:    stats.total_words,
        lastEntryDate: stats.last_entry_date
      }
    });

  } catch (err) {
    next(err);
  }
}

/* ═══════════════════════════════════════════════════════════
   PUT /api/user/profile
   Body: { name, bio, journalName }
   Updates profile fields for logged-in user.
═══════════════════════════════════════════════════════════ */
async function updateProfile(req, res, next) {
  try {
    const { name, bio, journalName } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required.'
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters.'
      });
    }

    if (bio && bio.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Bio must be under 200 characters.'
      });
    }

    await UserModel.updateProfile(req.user.id, {
      name:        name.trim(),
      bio:         bio         || null,
      journalName: journalName || 'My Lumio Journal'
    });

    const updatedUser = await UserModel.findById(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id:          updatedUser.id,
        name:        updatedUser.name,
        email:       updatedUser.email,
        bio:         updatedUser.bio,
        journalName: updatedUser.journal_name
      }
    });

  } catch (err) {
    next(err);
  }
}

/* ═══════════════════════════════════════════════════════════
   PUT /api/user/password
   Body: { currentPassword, newPassword }
   Changes password for logged-in user.
═══════════════════════════════════════════════════════════ */
async function updatePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new password are required.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters.'
      });
    }

    /* ── Get user with password hash ── */
    const user = await UserModel.findByEmail(req.user.email);

    /* ── Verify current password ── */
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    /* ── Hash new password ── */
    const newHash = await bcrypt.hash(newPassword, 10);
    await UserModel.updatePassword(req.user.id, newHash);

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.'
    });

  } catch (err) {
    next(err);
  }
}

/* ═══════════════════════════════════════════════════════════
   DELETE /api/user/account
   Body: { password }
   Permanently deletes account — requires password confirm.
═══════════════════════════════════════════════════════════ */
async function deleteAccount(req, res, next) {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please confirm your password to delete your account.'
      });
    }

    /* ── Verify password before deletion ── */
    const user    = await UserModel.findByEmail(req.user.email);
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Account not deleted.'
      });
    }

    await UserModel.deleteAccount(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Account permanently deleted.'
    });

  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  deleteAccount
};