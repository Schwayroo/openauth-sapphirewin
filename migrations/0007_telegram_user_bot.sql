-- Migration number: 0007    Telegram per-user bot settings

ALTER TABLE user_settings ADD COLUMN telegram_bot_token TEXT;
