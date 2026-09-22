/* ═══════════════════════════════════════════════════════════
   LUMIO — JOURNAL CONTROLLER
   Handles all journal entry operations.
   Every route here requires a valid JWT (protect middleware).
═══════════════════════════════════════════════════════════ */

const JournalModel = require('../models/journal.model');
const UserModel    = require('../models/user.model');

/* ═══════════════════════════════════════════════════════════
   GET /api/journal
   Query params: mood, tag, search, sort, page, limit
   Returns paginated entries for the logged-in user.
═══════════════════════════════════════════════════════════ */
async function getAllEntries(req, res, next) {
  try {
    const userId = req.user.id;

    // Read and sanitize query params
    const options = {
      mood:   req.query.mood   || 'all',
      tag:    req.query.tag    || 'all',
      search: req.query.search || '',
      sort:   req.query.sort   || 'newest',
      page:   Math.max(1, parseInt(req.query.page,  10) || 1),
      limit:  Math.min(20, parseInt(req.query.limit, 10) || 10)
    };

    const result = await JournalModel.getAll(userId, options);

    return res.status(200).json({
      success: true,
      ...result
    });

  } catch (err) {
    next(err);
  }
}

/* ═══════════════════════════════════════════════════════════
   GET /api/journal/:id
   Returns one entry by ID — must belong to logged-in user.
═══════════════════════════════════════════════════════════ */
async function getEntry(req, res, next) {
  try {
    const userId  = req.user.id;
    const entryId = parseInt(req.params.id, 10);

    if (!entryId || isNaN(entryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid entry ID.'
      });
    }

    const entry = await JournalModel.getById(entryId, userId);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found.'
      });
    }

    return res.status(200).json({
      success: true,
      entry
    });

  } catch (err) {
    next(err);
  }
}

/* ═══════════════════════════════════════════════════════════
   POST /api/journal
   Body: { title, content, mood, tags, photoUrl, entryDate }
   Creates a new journal entry.
═══════════════════════════════════════════════════════════ */
async function createEntry(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      title,
      content,
      mood,
      tags,
      photoUrl,
      entryDate
    } = req.body;

    /* ── Validate required fields ── */
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Entry title is required.'
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Entry content is required.'
      });
    }

    if (title.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Title must be under 200 characters.'
      });
    }

    /* ── Validate mood value ── */
    const validMoods = ['awful', 'bad', 'okay', 'good', 'great'];
    if (mood && !validMoods.includes(mood)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mood value.'
      });
    }

    /* ── Validate date format ── */
    const dateToUse = entryDate || new Date().toISOString().split('T')[0];
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateToUse)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD.'
      });
    }

    /* ── Create the entry ── */
    const newEntryId = await JournalModel.create(userId, {
      title,
      content,
      mood:      mood      || 'okay',
      tags:      tags      || null,
      photoUrl:  photoUrl  || null,
      entryDate: dateToUse
    });

    /* ── Update user streak ── */
    const newStreak = await UserModel.updateStreak(userId);

    /* ── Fetch the newly created entry ── */
    const newEntry = await JournalModel.getById(newEntryId, userId);

    return res.status(201).json({
      success: true,
      message: 'Entry saved successfully.',
      entry:   newEntry,
      streak:  newStreak
    });

  } catch (err) {
    next(err);
  }
}

/* ═══════════════════════════════════════════════════════════
   PUT /api/journal/:id
   Body: { title, content, mood, tags, photoUrl, entryDate }
   Updates an existing entry — must belong to logged-in user.
═══════════════════════════════════════════════════════════ */
async function updateEntry(req, res, next) {
  try {
    const userId  = req.user.id;
    const entryId = parseInt(req.params.id, 10);

    if (!entryId || isNaN(entryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid entry ID.'
      });
    }

    /* ── Check entry exists and belongs to user ── */
    const existing = await JournalModel.getById(entryId, userId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found.'
      });
    }

    const {
      title,
      content,
      mood,
      tags,
      photoUrl,
      entryDate
    } = req.body;

    /* ── Validate ── */
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Entry title is required.'
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Entry content is required.'
      });
    }

    const validMoods = ['awful', 'bad', 'okay', 'good', 'great'];
    if (mood && !validMoods.includes(mood)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mood value.'
      });
    }

    /* ── Update ── */
    await JournalModel.update(entryId, userId, {
      title,
      content,
      mood:      mood      || existing.mood,
      tags:      tags      || existing.tags,
      photoUrl:  photoUrl  || existing.photo_url,
      entryDate: entryDate || existing.entry_date
    });

    /* ── Return updated entry ── */
    const updatedEntry = await JournalModel.getById(entryId, userId);

    return res.status(200).json({
      success: true,
      message: 'Entry updated successfully.',
      entry:   updatedEntry
    });

  } catch (err) {
    next(err);
  }
}

/* ═══════════════════════════════════════════════════════════
   DELETE /api/journal/:id
   Deletes one entry — must belong to logged-in user.
═══════════════════════════════════════════════════════════ */
async function deleteEntry(req, res, next) {
  try {
    const userId  = req.user.id;
    const entryId = parseInt(req.params.id, 10);

    if (!entryId || isNaN(entryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid entry ID.'
      });
    }

    /* ── Check entry exists ── */
    const existing = await JournalModel.getById(entryId, userId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found or already deleted.'
      });
    }

    await JournalModel.delete(entryId, userId);

    return res.status(200).json({
      success: true,
      message: 'Entry deleted successfully.',
      deletedId: entryId
    });

  } catch (err) {
    next(err);
  }
}

/* ═══════════════════════════════════════════════════════════
   GET /api/journal/calendar?year=2026&month=9
   Returns days in a month that have entries.
   Used by the dashboard calendar widget.
═══════════════════════════════════════════════════════════ */
async function getCalendar(req, res, next) {
  try {
    const userId = req.user.id;
    const now    = new Date();

    const year  = parseInt(req.query.year,  10) || now.getFullYear();
    const month = parseInt(req.query.month, 10) || (now.getMonth() + 1);

    if (month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        message: 'Month must be between 1 and 12.'
      });
    }

    const dates = await JournalModel.getCalendarDates(userId, year, month);

    return res.status(200).json({
      success: true,
      year,
      month,
      dates
    });

  } catch (err) {
    next(err);
  }
}

/* ═══════════════════════════════════════════════════════════
   GET /api/journal/mood-stats
   Returns mood distribution for current month.
   Used on dashboard.
═══════════════════════════════════════════════════════════ */
async function getMoodStats(req, res, next) {
  try {
    const userId = req.user.id;
    const stats  = await JournalModel.getMoodStats(userId);

    /* ── Find dominant mood ── */
    const dominantMood = stats.length > 0 ? stats[0].mood : 'okay';

    const moodEmojis = {
      awful: '😞',
      bad:   '😕',
      okay:  '😌',
      good:  '😊',
      great: '🤩'
    };

    return res.status(200).json({
      success: true,
      dominantMood,
      dominantEmoji: moodEmojis[dominantMood] || '😌',
      distribution:  stats
    });

  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
  getCalendar,
  getMoodStats
};