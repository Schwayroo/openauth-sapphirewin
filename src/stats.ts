import type { Env } from "./db";

export async function getDashboardStats(env: Env, ownerId: string) {
	const fileCountRow = await env.AUTH_DB.prepare("SELECT COUNT(1) as c FROM vault_file WHERE owner_id = ?")
		.bind(ownerId)
		.first<{ c: number }>();

	const recentUploadsRow = await env.AUTH_DB.prepare(
		"SELECT COUNT(1) as c FROM vault_file WHERE owner_id = ? AND created_at >= datetime('now','-7 day')",
	)
		.bind(ownerId)
		.first<{ c: number }>();

	const hasVaultRow = await env.AUTH_DB.prepare("SELECT 1 as x FROM password_vault WHERE owner_id = ?")
		.bind(ownerId)
		.first<{ x: number }>();

	return {
		fileCount: fileCountRow?.c ?? 0,
		recentUploads: recentUploadsRow?.c ?? 0,
		hasVault: !!hasVaultRow,
	};
}
