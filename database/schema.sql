-- ═══════════════════════════════════════════════════════════
-- LUMIO DATABASE SCHEMA
-- Run this file once to set up the entire database.
-- MAANG practice: schema files are version-controlled
-- and always reproducible from scratch.
-- ═══════════════════════════════════════════════════════════

-- ─── Create and select database ──────────────────────────
CREATE DATABASE IF NOT EXISTS lumio_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE lumio_db;

-- ─── Drop tables if re-running (order matters for FKs) ───
DROP TABLE IF EXISTS journal_entries;
DROP TABLE IF EXISTS users;

-- ═══════════════════════════════════════════════════════════
-- TABLE: users
-- Stores all registered accounts.
-- ═══════════════════════════════════════════════════════════
CREATE TABLE users (
  id            INT           NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  bio           VARCHAR(200)  DEFAULT NULL,
  journal_name  VARCHAR(100)  DEFAULT 'My Lumio Journal',
  avatar_url    VARCHAR(500)  DEFAULT NULL,
  streak_count  INT           DEFAULT 0,
  last_entry_at DATE          DEFAULT NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════
-- TABLE: journal_entries
-- Every journal entry belongs to one user (user_id FK).
-- ═══════════════════════════════════════════════════════════
CREATE TABLE journal_entries (
  id          INT           NOT NULL AUTO_INCREMENT,
  user_id     INT           NOT NULL,
  title       VARCHAR(200)  NOT NULL,
  content     LONGTEXT      NOT NULL,
  mood        ENUM(
                'awful','bad','okay','good','great'
              )             DEFAULT 'okay',
  tags        VARCHAR(500)  DEFAULT NULL,
  photo_url   VARCHAR(500)  DEFAULT NULL,
  word_count  INT           DEFAULT 0,
  entry_date  DATE          NOT NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  -- Foreign key: if user is deleted, delete their entries too
  CONSTRAINT fk_entries_user
    FOREIGN KEY (user_id)
    REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  -- Index for fast lookup by user
  INDEX idx_entries_user_id   (user_id),

  -- Index for date-based queries (calendar, recent entries)
  INDEX idx_entries_date      (entry_date DESC),

  -- Composite index: user + date (most common query pattern)
  INDEX idx_entries_user_date (user_id, entry_date DESC),

  -- Index for mood filtering
  INDEX idx_entries_mood      (user_id, mood)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════
-- VERIFY: Show what was created
-- ═══════════════════════════════════════════════════════════
SHOW TABLES;
DESCRIBE users;
DESCRIBE journal_entries;