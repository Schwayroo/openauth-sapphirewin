import type { Env } from "./db";

export type UserSettings = {
	owner_id: string;
	telegram_mirror_enabled: number;
	telegram_chat_id: string | null;
	telegram_bot_token: string | null;
};

export async function getUserSettings(env: Env, ownerId: string): Promise<UserSettings> {
	const existing = await env.AUTH_DB.prepare(
		"SELECT owner_id, telegram_mirror_enabled, telegram_chat_id, telegram_bot_token FROM user_settings WHERE owner_id = ?",
	)
		.bind(ownerId)
		.first<UserSettings>();

	if (existing) return existing;

	await env.AUTH_DB.prepare("INSERT INTO user_settings (owner_id) VALUES (?)").bind(ownerId).run();

	return {
		owner_id: ownerId,
		telegram_mirror_enabled: 0,
		telegram_chat_id: null,
		telegram_bot_token: null,
	};
}

export async function updateUserSettings(
	env: Env,
	ownerId: string,
	patch: { telegram_mirror_enabled?: number; telegram_chat_id?: string | null; telegram_bot_token?: string | null },
) {
	const current = await getUserSettings(env, ownerId);
	const enabled = patch.telegram_mirror_enabled ?? current.telegram_mirror_enabled;
	const chatId = patch.telegram_chat_id !== undefined ? patch.telegram_chat_id : current.telegram_chat_id;
	const token = patch.telegram_bot_token !== undefined ? patch.telegram_bot_token : current.telegram_bot_token;

	await env.AUTH_DB.prepare(
		"UPDATE user_settings SET telegram_mirror_enabled = ?, telegram_chat_id = ?, telegram_bot_token = ?, updated_at = CURRENT_TIMESTAMP WHERE owner_id = ?",
	)
		.bind(enabled, chatId, token, ownerId)
		.run();
}
