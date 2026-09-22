/* ═══════════════════════════════════════════════════════════
   LUMIO — AUTH CONTROLLER
   Handles register, login, and getMe logic.
   Controllers: receive req, call model, return res.
   They never write SQL directly.
═══════════════════════════════════════════════════════════ */

const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const config    = require('../config/config');

/* ─────────────────────────────────────────────────────────
   HELPER — generate JWT token for a user
───────────────────────────────────────────────────────── */
function generateToken(user) {
  return jwt.sign(
    {
      id:    user.id,
      name:  user.name,
      email: user.email
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

/* ═══════════════════════════════════════════════════════════
   POST /api/auth/register
   Body: { name, email, password }
═══════════════════════════════════════════════════════════ */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    /* ── 1. Validate input ── */
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required.'
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters.'
      });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters.'
      });
    }

    /* ── 2. Check if email already registered ── */
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    /* ── 3. Hash the password ── */
    // saltRounds = 10 is the industry standard balance
    // of security vs performance
    const saltRounds   = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    /* ── 4. Create user in database ── */
    const newUserId = await UserModel.create({
      name,
      email,
      passwordHash
    });

    /* ── 5. Fetch the new user ── */
    const newUser = await UserModel.findById(newUserId);

    /* ── 6. Generate JWT ── */
    const token = generateToken(newUser);

    /* ── 7. Return success ── */
    return res.status(201).json({
      success: true,
      message: 'Account created successfully. Welcome to Lumio!',
      token,
      user: {
        id:           newUser.id,
        name:         newUser.name,
        email:        newUser.email,
        journalName:  newUser.journal_name,
        streakCount:  newUser.streak_count,
        createdAt:    newUser.created_at
      }
    });

  } catch (err) {
    next(err);
  }
}

/* ═══════════════════════════════════════════════════════════
   POST /api/auth/login
   Body: { email, password }
═══════════════════════════════════════════════════════════ */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    /* ── 1. Validate input ── */
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    /* ── 2. Find user by email ── */
    const user = await UserModel.findByEmail(email);

    /* ── 3. Check user exists AND password matches ──
       IMPORTANT: we give the same error message for both
       "user not found" and "wrong password" — this prevents
       attackers from knowing which emails are registered.
       This is called "security through ambiguity" and is
       standard in all major auth systems.
    ── */
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    /* ── 4. Generate JWT ── */
    const token = generateToken(user);

    /* ── 5. Return success with token and user data ── */
    return res.status(200).json({
      success: true,
      message: 'Signed in successfully.',
      token,
      user: {
        id:           user.id,
        name:         user.name,
        email:        user.email,
        bio:          user.bio,
        journalName:  user.journal_name,
        avatarUrl:    user.avatar_url,
        streakCount:  user.streak_count,
        lastEntryAt:  user.last_entry_at,
        createdAt:    user.created_at
      }
    });

  } catch (err) {
    next(err);
  }
}

/* ═══════════════════════════════════════════════════════════
   GET /api/auth/me
   Header: Authorization: Bearer <token>
   Returns the currently logged-in user's profile.
═══════════════════════════════════════════════════════════ */
async function getMe(req, res, next) {
  try {
    /* ── req.user is set by the protect middleware ── */
    const user = await UserModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    /* ── Get stats alongside profile ── */
    const stats = await UserModel.getStats(user.id);

    return res.status(200).json({
      success: true,
      user: {
        id:           user.id,
        name:         user.name,
        email:        user.email,
        bio:          user.bio,
        journalName:  user.journal_name,
        avatarUrl:    user.avatar_url,
        streakCount:  user.streak_count,
        lastEntryAt:  user.last_entry_at,
        createdAt:    user.created_at
      },
      stats: {
        totalEntries: stats.total_entries,
        totalWords:   stats.total_words,
        lastEntryDate: stats.last_entry_date
      }
    });

  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe };