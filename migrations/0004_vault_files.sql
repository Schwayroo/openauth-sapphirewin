-- Migration number: 0004    Vault files + password vault

-- Files stored in R2, metadata in D1
CREATE TABLE IF NOT EXISTS vault_file (
    id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
    owner_id TEXT NOT NULL REFERENCES user(id),

    r2_key TEXT NOT NULL,

    file_name TEXT NOT NULL,
    mime_type TEXT,
    size_bytes INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS vault_file_owner_id_idx ON vault_file(owner_id);
CREATE INDEX IF NOT EXISTS vault_file_created_at_idx ON vault_file(created_at);

-- Zero-knowledge password vault: store encrypted blob + params
CREATE TABLE IF NOT EXISTS password_vault (
    owner_id TEXT PRIMARY KEY NOT NULL REFERENCES user(id),

    -- base64 or json string produced by client
    vault_blob TEXT NOT NULL,

    -- key-derivation parameters (client defined)
    kdf TEXT NOT NULL,          -- e.g. "argon2id" | "scrypt"
    kdf_params TEXT NOT NULL,   -- JSON

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
