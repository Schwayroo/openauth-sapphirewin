-- Migration number: 0008    Photo folders (nested, with file-to-folder assignment)

CREATE TABLE IF NOT EXISTS photo_folder (
    id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
    owner_id TEXT NOT NULL REFERENCES user(id),
    name TEXT NOT NULL,
    parent_id TEXT REFERENCES photo_folder(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS photo_folder_owner_idx  ON photo_folder(owner_id);
CREATE INDEX IF NOT EXISTS photo_folder_parent_idx ON photo_folder(parent_id);

-- Add folder assignment to vault files (images + videos)
ALTER TABLE vault_file ADD COLUMN folder_id TEXT REFERENCES photo_folder(id) ON DELETE SET NULL;
