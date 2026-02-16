import type { Env } from "./db";

export type VaultFileRow = {
	id: string;
	owner_id: string;
	r2_key: string;
	file_name: string;
	mime_type: string | null;
	size_bytes: number;
	created_at: string;
};

export async function listVaultFiles(env: Env, ownerId: string) {
	const res = await env.AUTH_DB.prepare(
		"SELECT id, owner_id, r2_key, file_name, mime_type, size_bytes, created_at FROM vault_file WHERE owner_id = ? ORDER BY created_at DESC",
	)
		.bind(ownerId)
		.all<VaultFileRow>();
	return res.results;
}

export async function getVaultFile(env: Env, id: string, ownerId: string) {
	return env.AUTH_DB.prepare(
		"SELECT id, owner_id, r2_key, file_name, mime_type, size_bytes, created_at FROM vault_file WHERE id = ? AND owner_id = ?",
	)
		.bind(id, ownerId)
		.first<VaultFileRow>();
}

export async function createVaultFile(env: Env, input: { ownerId: string; r2Key: string; fileName: string; mimeType: string | null; sizeBytes: number }) {
	const res = await env.AUTH_DB.prepare(
		"INSERT INTO vault_file (owner_id, r2_key, file_name, mime_type, size_bytes) VALUES (?, ?, ?, ?, ?) RETURNING id",
	)
		.bind(input.ownerId, input.r2Key, input.fileName, input.mimeType, input.sizeBytes)
		.first<{ id: string }>();
	if (!res?.id) throw new Error("Failed to insert vault_file");
	return res.id;
}

export function guessPreviewKind(mime: string | null, fileName: string): "image" | "video" | "audio" | "text" | "other" {
	const m = (mime ?? "").toLowerCase();
	if (m.startsWith("image/")) return "image";
	if (m.startsWith("video/")) return "video";
	if (m.startsWith("audio/")) return "audio";
	if (m.startsWith("text/")) return "text";
	const ext = fileName.toLowerCase().split(".").pop() ?? "";
	if (["png", "jpg", "jpeg", "gif", "webp", "avif", "bmp", "svg"].includes(ext)) return "image";
	if (["mp4", "webm", "mov", "m4v", "mkv"].includes(ext)) return "video";
	if (["mp3", "wav", "ogg", "m4a"].includes(ext)) return "audio";
	if (["txt", "md", "json", "log"].includes(ext)) return "text";
	return "other";
}
