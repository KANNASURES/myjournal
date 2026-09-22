/* ═══════════════════════════════════════════════════════════
   LUMIO — JOURNAL MODEL
   All database queries for journal_entries table.
═══════════════════════════════════════════════════════════ */

const { pool } = require('../config/db');

const JournalModel = {

  /* ─────────────────────────────────────────────────────────
     getAll
     Returns paginated entries for a user.
     Supports filtering by mood and tag search.
  ───────────────────────────────────────────────────────── */
  async getAll(userId, { mood, tag, search, sort, page, limit }) {
    const offset = (page - 1) * limit;

    // Build WHERE clause dynamically
    let where  = 'WHERE user_id = ?';
    const params = [userId];

    if (mood && mood !== 'all') {
      where += ' AND mood = ?';
      params.push(mood);
    }

    if (tag && tag !== 'all') {
      where += ' AND tags LIKE ?';
      params.push('%' + tag + '%');
    }

    if (search) {
      where += ' AND (title LIKE ? OR content LIKE ?)';
      params.push('%' + search + '%', '%' + search + '%');
    }

    // Sort order
    const orderMap = {
      newest:   'entry_date DESC, created_at DESC',
      oldest:   'entry_date ASC,  created_at ASC',
      longest:  'word_count DESC',
      shortest: 'word_count ASC'
    };
    const orderBy = orderMap[sort] || orderMap.newest;

    // Get total count for pagination
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM journal_entries ${where}`,
      params
    );
    const total = countRows[0].total;

    // Get paginated entries
    const [rows] = await pool.execute(
      `SELECT
         id,
         title,
         content,
         mood,
         tags,
         photo_url,
         word_count,
         entry_date,
         created_at,
         updated_at
       FROM journal_entries
       ${where}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return {
      entries: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore:    offset + rows.length < total
      }
    };
  },

  /* ─────────────────────────────────────────────────────────
     getById
     Gets a single entry — verifies it belongs to the user.
  ───────────────────────────────────────────────────────── */
  async getById(id, userId) {
    const [rows] = await pool.execute(
      `SELECT
         id,
         user_id,
         title,
         content,
         mood,
         tags,
         photo_url,
         word_count,
         entry_date,
         created_at,
         updated_at
       FROM journal_entries
       WHERE id = ? AND user_id = ?
       LIMIT 1`,
      [id, userId]
    );
    return rows[0] || null;
  },

  /* ─────────────────────────────────────────────────────────
     create
     Inserts a new journal entry.
  ───────────────────────────────────────────────────────── */
  async create(userId, { title, content, mood, tags, photoUrl, entryDate }) {
    // Count words in content (strip HTML tags first)
    const plainText = content.replace(/<[^>]*>/g, ' ');
    const wordCount = plainText.trim()
      ? plainText.trim().split(/\s+/).filter(Boolean).length
      : 0;

    const [result] = await pool.execute(
      `INSERT INTO journal_entries
         (user_id, title, content, mood, tags, photo_url, word_count, entry_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        title.trim(),
        content,
        mood || 'okay',
        tags   || null,
        photoUrl || null,
        wordCount,
        entryDate || new Date().toISOString().split('T')[0]
      ]
    );

    return result.insertId;
  },

  /* ─────────────────────────────────────────────────────────
     update
     Updates an existing entry — verifies ownership.
  ───────────────────────────────────────────────────────── */
  async update(id, userId, { title, content, mood, tags, photoUrl, entryDate }) {
    const plainText = content.replace(/<[^>]*>/g, ' ');
    const wordCount = plainText.trim()
      ? plainText.trim().split(/\s+/).filter(Boolean).length
      : 0;

    const [result] = await pool.execute(
      `UPDATE journal_entries
       SET title      = ?,
           content    = ?,
           mood       = ?,
           tags       = ?,
           photo_url  = ?,
           word_count = ?,
           entry_date = ?
       WHERE id = ? AND user_id = ?`,
      [
        title.trim(),
        content,
        mood || 'okay',
        tags || null,
        photoUrl || null,
        wordCount,
        entryDate,
        id,
        userId
      ]
    );

    return result.affectedRows > 0;
  },

  /* ─────────────────────────────────────────────────────────
     delete
     Deletes one entry — verifies ownership.
  ───────────────────────────────────────────────────────── */
  async delete(id, userId) {
    const [result] = await pool.execute(
      `DELETE FROM journal_entries
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    return result.affectedRows > 0;
  },

  /* ─────────────────────────────────────────────────────────
     getCalendarDates
     Returns all dates that have entries for a given month.
     Used to render dots on the calendar widget.
  ───────────────────────────────────────────────────────── */
  async getCalendarDates(userId, year, month) {
    const [rows] = await pool.execute(
      `SELECT
         DAY(entry_date)  AS day,
         mood
       FROM journal_entries
       WHERE user_id = ?
         AND YEAR(entry_date)  = ?
         AND MONTH(entry_date) = ?
       ORDER BY entry_date ASC`,
      [userId, year, month]
    );
    return rows;
  },

  /* ─────────────────────────────────────────────────────────
     getMoodStats
     Returns mood distribution for the current month.
     Used on dashboard stats panel.
  ───────────────────────────────────────────────────────── */
  async getMoodStats(userId) {
    const [rows] = await pool.execute(
      `SELECT
         mood,
         COUNT(*) AS count
       FROM journal_entries
       WHERE user_id = ?
         AND MONTH(entry_date) = MONTH(CURDATE())
         AND YEAR(entry_date)  = YEAR(CURDATE())
       GROUP BY mood
       ORDER BY count DESC`,
      [userId]
    );
    return rows;
  }

};

module.exports = JournalModel;