-- Migration number: 0003    Products, forum, and admin helpers

-- Products table
CREATE TABLE IF NOT EXISTS product (
    id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
    seller_id TEXT NOT NULL REFERENCES user(id),
    title TEXT NOT NULL,
    description TEXT,
    price_cents INTEGER NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    image_urls TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS product_seller_id_idx ON product(seller_id);
CREATE INDEX IF NOT EXISTS product_created_at_idx ON product(created_at);

-- Forum posts
CREATE TABLE IF NOT EXISTS forum_post (
    id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
    author_id TEXT NOT NULL REFERENCES user(id),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS forum_post_created_at_idx ON forum_post(created_at);
CREATE INDEX IF NOT EXISTS forum_post_author_id_idx ON forum_post(author_id);

-- Forum replies
CREATE TABLE IF NOT EXISTS forum_reply (
    id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
    post_id TEXT NOT NULL REFERENCES forum_post(id),
    author_id TEXT NOT NULL REFERENCES user(id),
    body TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS forum_reply_post_id_idx ON forum_reply(post_id);
CREATE INDEX IF NOT EXISTS forum_reply_author_id_idx ON forum_reply(author_id);
