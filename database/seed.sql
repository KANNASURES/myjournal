-- ═══════════════════════════════════════════════════════════
-- LUMIO — SEED DATA
-- Creates one test user and sample journal entries.
-- Use this to test the app during development.
-- MAANG practice: seed files let any developer
-- get a working local environment in minutes.
-- ═══════════════════════════════════════════════════════════

USE lumio_db;

-- ─── Clear existing seed data ────────────────────────────
DELETE FROM journal_entries WHERE user_id = 1;
DELETE FROM users           WHERE id      = 1;

-- ════════════════════════════════════════════════════════
-- TEST USER
-- Email:    kanna@lumio.dev
-- Password: Test@1234
-- The password_hash below is bcrypt hash of "Test@1234"
-- with salt rounds = 10. Generated with bcryptjs.
-- ════════════════════════════════════════════════════════
INSERT INTO users (
  id,
  name,
  email,
  password_hash,
  bio,
  journal_name,
  streak_count,
  last_entry_at
) VALUES (
  1,
  'KANNASURESH',
  'kanna@lumio.dev',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Writing my story, one day at a time. 🌙',
  'My Lumio Journal',
  21,
  CURDATE()
);

-- ════════════════════════════════════════════════════════
-- SAMPLE JOURNAL ENTRIES (6 entries)
-- ════════════════════════════════════════════════════════
INSERT INTO journal_entries (
  user_id, title, content, mood, tags,
  word_count, entry_date
) VALUES

(1,
 'Today was quiet and golden',
 'Woke up to soft rain. Made chai, opened the window, and just listened. There is something beautiful about doing nothing perfectly. The kind of morning that asks nothing of you — just to be present in it. I sat there for almost an hour, watching the drops trace lines down the glass. Did not check my phone. Did not think about tomorrow. Just existed in that quiet, golden space between sleep and the day.',
 'okay',
 'peaceful,morning,gratitude',
 72,
 DATE_SUB(CURDATE(), INTERVAL 1 DAY)),

(1,
 'Finally shipped the feature!',
 'Three weeks of debugging and it is finally live. The team celebrated with dinner at that little place near the office. Felt genuinely proud of what we built together — not just the code, but the process. The pair sessions, the late Slack threads, the tiny wins along the way. Shipping something real is its own kind of joy. Different from finishing a task. It lands differently. I want to remember this feeling.',
 'great',
 'achievement,work,team',
 88,
 DATE_SUB(CURDATE(), INTERVAL 2 DAY)),

(1,
 'Not every day has to be perfect',
 'Felt off today. Could not focus, kept second-guessing everything. Maybe rest is the answer. Maybe I am just human and that is enough. Some days the words do not come easy. Some days you just sit with yourself and that has to count for something too. Going to sleep early and try again tomorrow.',
 'bad',
 'reflection,honesty',
 62,
 DATE_SUB(CURDATE(), INTERVAL 3 DAY)),

(1,
 'Small joys of a Thursday morning',
 'The coffee was perfect. The traffic was surprisingly kind. Someone held the elevator. Small things — but I noticed all of them today. That is progress for me. I used to move through days without registering the texture of them. Now I catch the little moments. The way the light hit the office window at 9AM. The message from an old friend out of nowhere. Life is made of these.',
 'good',
 'gratitude,morning,mindfulness',
 82,
 DATE_SUB(CURDATE(), INTERVAL 4 DAY)),

(1,
 'Road trip to Coorg with family',
 'Seven hours in the car, terrible playlist choices, two wrong turns — and yet arriving felt like the best thing this year. The air there is different. Cooler, heavier, smelling of coffee and rain. We stayed in a tiny homestay run by a couple who had been there for 30 years. They cooked us dinner and told us stories about the land. I did not want to come back. Part of me is still there.',
 'great',
 'travel,family,memory',
 95,
 DATE_SUB(CURDATE(), INTERVAL 5 DAY)),

(1,
 'Learning to slow down at work',
 'Finished all tasks by 5PM and just sat there, not knowing what to do with free time. Maybe that is the real project to work on. The discomfort of stillness. I have been so wired to produce that pausing feels like failure. It is not. Rest is productive. White space is design. I am going to practice this.',
 'okay',
 'reflection,work,growth',
 65,
 DATE_SUB(CURDATE(), INTERVAL 6 DAY));

-- ─── Verify seed data ────────────────────────────────────
SELECT
  id,
  name,
  email,
  streak_count,
  created_at
FROM users;

SELECT
  id,
  user_id,
  title,
  mood,
  tags,
  word_count,
  entry_date
FROM journal_entries
ORDER BY entry_date DESC;