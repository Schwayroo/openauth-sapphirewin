-- Migration number: 0006    User settings (telegram mirror)

CREATE TABLE IF NOT EXISTS user_settings (
  owner_id TEXT PRIMARY KEY NOT NULL REFERENCES user(id),
  telegram_mirror_enabled INTEGER NOT NULL DEFAULT 0,
  telegram_chat_id TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
