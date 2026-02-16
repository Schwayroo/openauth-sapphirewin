export type Env = {
	AUTH_DB: D1Database;
	AUTH_STORAGE: KVNamespace;
	// R2 bucket binding (wrangler)
	R2_VAULT: R2Bucket;

	RESEND_API_KEY: string;
	RESEND_FROM: string;
	CANONICAL_HOST?: string;

	// Optional: Telegram upload mirror
	TELEGRAM_BOT_TOKEN?: string;
	TELEGRAM_CHAT_ID?: string;
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

export async function createProduct(env: Env, sellerId: string, input: { title: string; description: string; priceCents: number; currency: string; imageUrls: string[] }) {
	return env.AUTH_DB.prepare(
		"INSERT INTO product (seller_id, title, description, price_cents, currency, image_urls) VALUES (?, ?, ?, ?, ?, ?)",
	)
		.bind(sellerId, input.title, input.description, input.priceCents, input.currency, JSON.stringify(input.imageUrls))
		.run();
}

export async function listProducts(env: Env) {
	const res = await env.AUTH_DB.prepare(
		"SELECT p.id, p.title, p.price_cents, p.currency, p.image_urls, COALESCE(u.username, u.email) as seller_name FROM product p JOIN user u ON u.id = p.seller_id WHERE p.status = 'active' ORDER BY p.created_at DESC",
	).all<{ id: string; title: string; price_cents: number; currency: string; image_urls: string; seller_name: string }>();
	return res.results;
}

export async function getProduct(env: Env, id: string) {
	return env.AUTH_DB.prepare(
		"SELECT p.id, p.title, p.description, p.price_cents, p.currency, p.image_urls, p.seller_id, COALESCE(u.username, u.email) as seller_name FROM product p JOIN user u ON u.id = p.seller_id WHERE p.id = ?",
	)
		.bind(id)
		.first<{ id: string; title: string; description: string | null; price_cents: number; currency: string; image_urls: string; seller_id: string; seller_name: string }>();
}

export async function updateProduct(env: Env, id: string, input: { title: string; description: string; priceCents: number; currency: string; imageUrls: string[] }) {
	return env.AUTH_DB.prepare(
		"UPDATE product SET title = ?, description = ?, price_cents = ?, currency = ?, image_urls = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
	)
		.bind(input.title, input.description, input.priceCents, input.currency, JSON.stringify(input.imageUrls), id)
		.run();
}

export async function listForumPosts(env: Env) {
	const res = await env.AUTH_DB.prepare(
		"SELECT p.id, p.title, p.created_at, COALESCE(u.username, u.email) as author_name, (SELECT COUNT(1) FROM forum_reply r WHERE r.post_id = p.id) as reply_count FROM forum_post p JOIN user u ON u.id = p.author_id ORDER BY p.created_at DESC",
	).all<{ id: string; title: string; created_at: string; author_name: string; reply_count: number }>();
	return res.results;
}

export async function createForumPost(env: Env, authorId: string, title: string, body: string) {
	return env.AUTH_DB.prepare("INSERT INTO forum_post (author_id, title, body) VALUES (?, ?, ?)")
		.bind(authorId, title, body)
		.run();
}

export async function getForumPost(env: Env, postId: string) {
	return env.AUTH_DB.prepare(
		"SELECT p.id, p.title, p.body, p.created_at, p.author_id, COALESCE(u.username, u.email) as author_name FROM forum_post p JOIN user u ON u.id = p.author_id WHERE p.id = ?",
	)
		.bind(postId)
		.first<{ id: string; title: string; body: string; created_at: string; author_id: string; author_name: string }>();
}

export async function listForumReplies(env: Env, postId: string) {
	const res = await env.AUTH_DB.prepare(
		"SELECT r.id, r.body, r.created_at, COALESCE(u.username, u.email) as author_name FROM forum_reply r JOIN user u ON u.id = r.author_id WHERE r.post_id = ? ORDER BY r.created_at ASC",
	)
		.bind(postId)
		.all<{ id: string; body: string; created_at: string; author_name: string }>();
	return res.results;
}

export async function addForumReply(env: Env, postId: string, authorId: string, body: string) {
	return env.AUTH_DB.prepare("INSERT INTO forum_reply (post_id, author_id, body) VALUES (?, ?, ?)")
		.bind(postId, authorId, body)
		.run();
}

export async function deleteForumPost(env: Env, postId: string) {
	// delete replies first for FK safety
	await env.AUTH_DB.prepare("DELETE FROM forum_reply WHERE post_id = ?").bind(postId).run();
	return env.AUTH_DB.prepare("DELETE FROM forum_post WHERE id = ?").bind(postId).run();
}
