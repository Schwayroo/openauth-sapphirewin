-- Migration number: 0002    Platform tables
-- Add profile fields and role to user
ALTER TABLE user ADD COLUMN username TEXT UNIQUE;
ALTER TABLE user ADD COLUMN avatar_url TEXT;
ALTER TABLE user ADD COLUMN role TEXT NOT NULL DEFAULT 'member';
ALTER TABLE user ADD COLUMN bio TEXT;

-- Set initial admin
UPDATE user SET role = 'admin' WHERE email = 'schwayro25@gmail.com';

-- Products table
CREATE TABLE IF NOT EXISTS product (
    id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
    seller_id TEXT NOT NULL REFERENCES user(id),
    title TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    images TEXT NOT NULL DEFAULT '[]',
    category TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Forum posts
CREATE TABLE IF NOT EXISTS forum_post (
    id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
    author_id TEXT NOT NULL REFERENCES user(id),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    category TEXT,
    pinned INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Forum replies
CREATE TABLE IF NOT EXISTS forum_reply (
    id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
    post_id TEXT NOT NULL REFERENCES forum_post(id),
    author_id TEXT NOT NULL REFERENCES user(id),
    body TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
