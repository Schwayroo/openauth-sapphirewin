import type { Env } from "./db";

export type PasswordVaultRow = {
	owner_id: string;
	vault_blob: string;
	kdf: string;
	kdf_params: string;
	updated_at: string;
};

export async function getPasswordVault(env: Env, ownerId: string) {
	return env.AUTH_DB.prepare(
		"SELECT owner_id, vault_blob, kdf, kdf_params, updated_at FROM password_vault WHERE owner_id = ?",
	)
		.bind(ownerId)
		.first<PasswordVaultRow>();
}

export async function upsertPasswordVault(env: Env, input: { ownerId: string; vaultBlob: string; kdf: string; kdfParams: string }) {
	// D1/SQLite supports UPSERT
	await env.AUTH_DB.prepare(
		"INSERT INTO password_vault (owner_id, vault_blob, kdf, kdf_params, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(owner_id) DO UPDATE SET vault_blob=excluded.vault_blob, kdf=excluded.kdf, kdf_params=excluded.kdf_params, updated_at=CURRENT_TIMESTAMP",
	)
		.bind(input.ownerId, input.vaultBlob, input.kdf, input.kdfParams)
		.run();
}
