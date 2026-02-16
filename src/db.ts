export type Env = {
	AUTH_DB: D1Database;
	AUTH_STORAGE: KVNamespace;
	// R2 bucket binding (wrangler)
	R2_VAULT: R2Bucket;

	RESEND_API_KEY: string;
	RESEND_FROM: string;
	CANONICAL_HOST?: string;

	// Optional: Telegram upload mirror (user-provided bot token)
	TELEGRAM_MIRROR_ENABLED?: string; // "true" | "false"
};

export async function getUserById(env: Env, id: string) {
	return env.AUTH_DB.prepare("SELECT id, email, created_at, role, username, avatar_url FROM user WHERE id = ?")
		.bind(id)
		.first<{ id: string; email: string; created_at: string; role: string; username: string | null; avatar_url: string | null }>();
}

export async function listUsers(env: Env) {
	const res = await env.AUTH_DB.prepare("SELECT id, email, created_at, role, username FROM user ORDER BY created_at DESC").all<{
		id: string;
		email: string;
		created_at: string;
		role: string;
		username: string | null;
	}>();
	return res.results;
}

export async function setUserRole(env: Env, userId: string, role: string) {
	return env.AUTH_DB.prepare("UPDATE user SET role = ? WHERE id = ?").bind(role, userId).run();
}
