CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  mime TEXT DEFAULT '',
  size INTEGER NOT NULL,
  file_id TEXT NOT NULL,
  message_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  drive_file_id TEXT
);
CREATE INDEX IF NOT EXISTS idx_files_created ON files (id DESC);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
