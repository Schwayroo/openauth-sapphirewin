import type { Env } from "./db";

export type VaultFileRow = {
	id: string;
	owner_id: string;
	r2_key: string;
	file_name: string;
	mime_type: string | null;
	size_bytes: number;
	created_at: string;
	folder_id: string | null;
};

export type PhotoFolderRow = {
	id: string;
	owner_id: string;
	name: string;
	parent_id: string | null;
	created_at: string;
};

const FILE_COLS = "id, owner_id, r2_key, file_name, mime_type, size_bytes, created_at, folder_id";

export async function listVaultFiles(env: Env, ownerId: string) {
	const res = await env.AUTH_DB.prepare(
		`SELECT ${FILE_COLS} FROM vault_file WHERE owner_id = ? ORDER BY created_at DESC`,
	).bind(ownerId).all<VaultFileRow>();
	return res.results;
}

/** All media (images + videos) regardless of folder */
export async function listMediaFiles(env: Env, ownerId: string) {
	const res = await env.AUTH_DB.prepare(
		`SELECT ${FILE_COLS} FROM vault_file WHERE owner_id = ? AND (mime_type LIKE 'image/%' OR mime_type LIKE 'video/%') ORDER BY created_at DESC`,
	).bind(ownerId).all<VaultFileRow>();
	return res.results;
}

/** Images/videos in a specific folder (null = root) */
export async function listMediaFilesInFolder(env: Env, ownerId: string, folderId: string | null) {
	const res = folderId
		? await env.AUTH_DB.prepare(
			`SELECT ${FILE_COLS} FROM vault_file WHERE owner_id = ? AND folder_id = ? AND (mime_type LIKE 'image/%' OR mime_type LIKE 'video/%') ORDER BY created_at DESC`,
		).bind(ownerId, folderId).all<VaultFileRow>()
		: await env.AUTH_DB.prepare(
			`SELECT ${FILE_COLS} FROM vault_file WHERE owner_id = ? AND folder_id IS NULL AND (mime_type LIKE 'image/%' OR mime_type LIKE 'video/%') ORDER BY created_at DESC`,
		).bind(ownerId).all<VaultFileRow>();
	return res.results;
}

/** Images only (no videos) — used for Telegram send */
export async function listImageFiles(env: Env, ownerId: string) {
	const res = await env.AUTH_DB.prepare(
		`SELECT ${FILE_COLS} FROM vault_file WHERE owner_id = ? AND mime_type LIKE 'image/%' ORDER BY created_at DESC`,
	).bind(ownerId).all<VaultFileRow>();
	return res.results;
}

export async function getVaultFile(env: Env, id: string, ownerId: string) {
	return env.AUTH_DB.prepare(
		`SELECT ${FILE_COLS} FROM vault_file WHERE id = ? AND owner_id = ?`,
	).bind(id, ownerId).first<VaultFileRow>();
}

export async function createVaultFile(env: Env, input: { ownerId: string; r2Key: string; fileName: string; mimeType: string | null; sizeBytes: number }) {
	const res = await env.AUTH_DB.prepare(
		"INSERT INTO vault_file (owner_id, r2_key, file_name, mime_type, size_bytes) VALUES (?, ?, ?, ?, ?) RETURNING id",
	).bind(input.ownerId, input.r2Key, input.fileName, input.mimeType, input.sizeBytes).first<{ id: string }>();
	if (!res?.id) throw new Error("Failed to insert vault_file");
	return res.id;
}

export async function deleteVaultFile(env: Env, id: string, ownerId: string) {
	return env.AUTH_DB.prepare("DELETE FROM vault_file WHERE id = ? AND owner_id = ? RETURNING r2_key")
		.bind(id, ownerId).first<{ r2_key: string }>();
}

export async function moveVaultFileToFolder(env: Env, fileId: string, ownerId: string, folderId: string | null) {
	await env.AUTH_DB.prepare(
		"UPDATE vault_file SET folder_id = ? WHERE id = ? AND owner_id = ?",
	).bind(folderId, fileId, ownerId).run();
}

// ─── Photo Folders ─────────────────────────────────────────────────────────

export async function listPhotoFolders(env: Env, ownerId: string, parentId: string | null) {
	const res = parentId
		? await env.AUTH_DB.prepare(
			"SELECT id, owner_id, name, parent_id, created_at FROM photo_folder WHERE owner_id = ? AND parent_id = ? ORDER BY name ASC",
		).bind(ownerId, parentId).all<PhotoFolderRow>()
		: await env.AUTH_DB.prepare(
			"SELECT id, owner_id, name, parent_id, created_at FROM photo_folder WHERE owner_id = ? AND parent_id IS NULL ORDER BY name ASC",
		).bind(ownerId).all<PhotoFolderRow>();
	return res.results;
}

export async function getAllPhotoFolders(env: Env, ownerId: string) {
	const res = await env.AUTH_DB.prepare(
		"SELECT id, owner_id, name, parent_id, created_at FROM photo_folder WHERE owner_id = ? ORDER BY name ASC",
	).bind(ownerId).all<PhotoFolderRow>();
	return res.results;
}

export async function getPhotoFolder(env: Env, id: string, ownerId: string) {
	return env.AUTH_DB.prepare(
		"SELECT id, owner_id, name, parent_id, created_at FROM photo_folder WHERE id = ? AND owner_id = ?",
	).bind(id, ownerId).first<PhotoFolderRow>();
}

export async function createPhotoFolder(env: Env, { ownerId, name, parentId }: { ownerId: string; name: string; parentId: string | null }) {
	const res = await env.AUTH_DB.prepare(
		"INSERT INTO photo_folder (owner_id, name, parent_id) VALUES (?, ?, ?) RETURNING id",
	).bind(ownerId, name, parentId).first<{ id: string }>();
	if (!res?.id) throw new Error("Failed to create folder");
	return res.id;
}

export async function deletePhotoFolder(env: Env, id: string, ownerId: string) {
	// Move photos in this folder to root
	await env.AUTH_DB.prepare("UPDATE vault_file SET folder_id = NULL WHERE folder_id = ? AND owner_id = ?").bind(id, ownerId).run();
	// Move sub-folders to root
	await env.AUTH_DB.prepare("UPDATE photo_folder SET parent_id = NULL WHERE parent_id = ? AND owner_id = ?").bind(id, ownerId).run();
	// Delete the folder
	await env.AUTH_DB.prepare("DELETE FROM photo_folder WHERE id = ? AND owner_id = ?").bind(id, ownerId).run();
}

/** Walk parents to build breadcrumb from root → current folder */
export async function getFolderBreadcrumb(env: Env, folderId: string, ownerId: string): Promise<PhotoFolderRow[]> {
	const crumbs: PhotoFolderRow[] = [];
	let currentId: string | null = folderId;
	for (let i = 0; i < 20 && currentId; i++) {
		const folder = await getPhotoFolder(env, currentId, ownerId);
		if (!folder) break;
		crumbs.unshift(folder);
		currentId = folder.parent_id;
	}
	return crumbs;
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
