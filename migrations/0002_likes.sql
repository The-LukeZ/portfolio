-- One row per liked post per device. Deleted on unlike.
CREATE TABLE likes (
  slug TEXT NOT NULL,
  device_id TEXT NOT NULL,
  -- Keyed hash of the client IP, salted per UTC day (see src/lib/server/feed/likes.ts). Never the raw IP.
  ip_hash TEXT NOT NULL,
  -- UTC YYYY-MM-DD of the like, for the per-IP daily cap.
  day TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (slug, device_id)
);
CREATE INDEX likes_ip_day ON likes (slug, ip_hash, day);
