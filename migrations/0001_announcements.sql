-- Tracks which feed posts were announced to Discord. One row per slug, never deleted.
CREATE TABLE announcements (
  slug TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('sent', 'skipped', 'pending', 'given_up')),
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  updated_at TEXT NOT NULL
);
