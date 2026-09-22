/* ═══════════════════════════════════════════════════════════
   LUMIO — USER MODEL
   All database queries related to the users table.
   MAANG practice: keep SQL out of controllers —
   controllers call model functions, models talk to DB.
═══════════════════════════════════════════════════════════ */

const { pool } = require('../config/db');

const UserModel = {

  /* ─────────────────────────────────────────────────────────
     findByEmail
     Used during login and registration to check if
     an account already exists with that email.
  ───────────────────────────────────────────────────────── */
  async findByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT
         id,
         name,
         email,
         password_hash,
         bio,
         journal_name,
         avatar_url,
         streak_count,
         last_entry_at,
         created_at
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email.toLowerCase().trim()]
    );
    return rows[0] || null;
  },

  /* ─────────────────────────────────────────────────────────
     findById
     Used by the auth middleware to load the current user
     from the JWT payload.
  ───────────────────────────────────────────────────────── */
  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT
         id,
         name,
         email,
         bio,
         journal_name,
         avatar_url,
         streak_count,
         last_entry_at,
         created_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  /* ─────────────────────────────────────────────────────────
     create
     Inserts a new user row and returns the new user's id.
  ───────────────────────────────────────────────────────── */
  async create({ name, email, passwordHash }) {
    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password_hash)
       VALUES (?, ?, ?)`,
      [
        name.trim(),
        email.toLowerCase().trim(),
        passwordHash
      ]
    );
    return result.insertId;
  },

  /* ─────────────────────────────────────────────────────────
     updateProfile
     Updates name, bio, and journal_name for a user.
  ───────────────────────────────────────────────────────── */
  async updateProfile(id, { name, bio, journalName }) {
    const [result] = await pool.execute(
      `UPDATE users
       SET name         = ?,
           bio          = ?,
           journal_name = ?
       WHERE id = ?`,
      [name, bio || null, journalName || 'My Lumio Journal', id]
    );
    return result.affectedRows > 0;
  },

  /* ─────────────────────────────────────────────────────────
     updatePassword
     Replaces the password hash for a user.
  ───────────────────────────────────────────────────────── */
  async updatePassword(id, newPasswordHash) {
    const [result] = await pool.execute(
      `UPDATE users
       SET password_hash = ?
       WHERE id = ?`,
      [newPasswordHash, id]
    );
    return result.affectedRows > 0;
  },

  /* ─────────────────────────────────────────────────────────
     updateStreak
     Called every time a user saves a journal entry.
     Increments streak if they wrote yesterday,
     resets to 1 if they missed a day.
  ───────────────────────────────────────────────────────── */
  async updateStreak(id) {
    // Get current streak and last_entry_at
    const [rows] = await pool.execute(
      `SELECT streak_count, last_entry_at FROM users WHERE id = ?`,
      [id]
    );
    if (!rows[0]) return;

    const { streak_count, last_entry_at } = rows[0];
    const today     = new Date();
    today.setHours(0, 0, 0, 0);

    const lastEntry = last_entry_at ? new Date(last_entry_at) : null;
    if (lastEntry) lastEntry.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak;

    if (!lastEntry) {
      // First entry ever
      newStreak = 1;
    } else if (lastEntry.getTime() === today.getTime()) {
      // Already wrote today — keep streak
      newStreak = streak_count;
    } else if (lastEntry.getTime() === yesterday.getTime()) {
      // Wrote yesterday — increment streak
      newStreak = streak_count + 1;
    } else {
      // Missed a day — reset streak
      newStreak = 1;
    }

    await pool.execute(
      `UPDATE users
       SET streak_count  = ?,
           last_entry_at = CURDATE()
       WHERE id = ?`,
      [newStreak, id]
    );

    return newStreak;
  },

  /* ─────────────────────────────────────────────────────────
     deleteAccount
     Hard-deletes the user row.
     CASCADE on journal_entries handles entry deletion.
  ───────────────────────────────────────────────────────── */
  async deleteAccount(id) {
    const [result] = await pool.execute(
      `DELETE FROM users WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  },

  /* ─────────────────────────────────────────────────────────
     getStats
     Returns aggregate stats for the dashboard.
  ───────────────────────────────────────────────────────── */
  async getStats(userId) {
    const [rows] = await pool.execute(
      `SELECT
         COUNT(*)            AS total_entries,
         COALESCE(SUM(word_count), 0) AS total_words,
         MAX(entry_date)     AS last_entry_date
       FROM journal_entries
       WHERE user_id = ?`,
      [userId]
    );
    return rows[0];
  }

};

module.exports = UserModel;