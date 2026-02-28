import { issuer } from "@openauthjs/openauth";
import { CloudflareStorage } from "@openauthjs/openauth/storage/cloudflare";
import { PasswordProvider } from "@openauthjs/openauth/provider/password";
import { PasswordUI } from "@openauthjs/openauth/ui/password";
import { createSubjects } from "@openauthjs/openauth/subject";
import { object, string } from "valibot";

import type { Env } from "./db";
import { getUserById, listUsers, setUserRole } from "./db";
import { errorPage } from "./pages/error";
import { dashboardPage } from "./pages/dashboard";
import { getDashboardStats } from "./stats";
import { homePage } from "./pages/home";
import { profilePage } from "./pages/profile";
import { getUserSettings, updateUserSettings } from "./settings";
import { adminUsersPage } from "./pages/admin";
import { vaultListPage, vaultPreviewPage } from "./pages/vault";
import { passwordsPage } from "./pages/passwords";
import { photosPage } from "./pages/photos";
import { telegramPage } from "./pages/telegram";
import { sharedPage } from "./pages/shared";
import { activityPage } from "./pages/activity";
import { favoritesPage } from "./pages/favorites";
import { trashPage } from "./pages/trash";
import { getPasswordVault, upsertPasswordVault } from "./passwords";
import {
	createVaultFile, deleteVaultFile, getVaultFile,
	listMediaFiles, listVaultFiles, listImageFiles,
	listMediaFilesInFolder, listPhotoFolders, getAllPhotoFolders,
	getPhotoFolder, createPhotoFolder, deletePhotoFolder,
	getFolderBreadcrumb, moveVaultFileToFolder,
} from "./vault";

import { makeSessionCookie, getSessionFromRequest, clearSessionCookie } from "./session";
import { redirectToLogin, refreshSessionFromDb, requireRole } from "./authz";
import { canonicalize, getCanonicalHost } from "./canonical";

const subjects = createSubjects({
	user: object({
		id: string(),
		role: string(),
		username: string(),
	}),
});

const COOKIE_SECRET = "sapphireauth-session-secret-key-2024";

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);
		const canon = canonicalize(url, env);
		if (canon) return canon;

		if (url.pathname === "/") {
			const session = await getSessionFromRequest(request, COOKIE_SECRET);
			if (session) return Response.redirect(url.origin + "/dashboard", 302);
			return homePage();
		}

		// Vault (files)
		if (url.pathname === "/vault") {
			const session = await getSessionFromRequest(request, COOKIE_SECRET);
			if (!session) return redirectToLogin(url);
			const fresh = await refreshSessionFromDb(env, session);
			const files = await listVaultFiles(env, fresh.userId);
			return vaultListPage(fresh, files);
		}

		if (url.pathname === "/vault/upload") {
			const session = await getSessionFromRequest(request, COOKIE_SECRET);
			if (!session) return redirectToLogin(url);
			const fresh = await refreshSessionFromDb(env, session);
			if (request.method !== "POST") return errorPage("Invalid method");

			const form = await request.formData();
			const file = form.get("file");
			if (!(file instanceof File)) return errorPage("Missing file");

			// NOTE: Workers have memory limits; for large files, we should switch to multipart upload.
			const buf = await file.arrayBuffer();
			const r2Key = `${fresh.userId}/${crypto.randomUUID()}-${file.name}`;
			await env.R2_VAULT.put(r2Key, buf, {
				httpMetadata: { contentType: file.type || undefined },
			});

			const id = await createVaultFile(env, {
				ownerId: fresh.userId,
				r2Key,
				fileName: file.name,
				mimeType: file.type || null,
				sizeBytes: file.size,
			});

			// Telegram mirror — photos only (images, not videos), per-user opt-in
			if ((env.TELEGRAM_MIRROR_ENABLED ?? "false") === "true") {
				const isPhoto = (file.type ?? "").toLowerCase().startsWith("image/");
				if (isPhoto) {
					const settings = await getUserSettings(env, fresh.userId);
					if (settings.telegram_mirror_enabled && settings.telegram_chat_id && settings.telegram_bot_token) {
						ctx.waitUntil(mirrorPhotoToTelegram(settings.telegram_bot_token, settings.telegram_chat_id, file));
					}
				}
			}

			return Response.redirect(url.origin + `/vault/${id}`, 302);
		}

		const vaultPreviewMatch = url.pathname.match(/^\/vault\/([a-f0-9]+)$/);
		if (vaultPreviewMatch) {
			const session = await getSessionFromRequest(request, COOKIE_SECRET);
			if (!session) return redirectToLogin(url);
			const fresh = await refreshSessionFromDb(env, session);
			const id = vaultPreviewMatch[1];
			const f = await getVaultFile(env, id, fresh.userId);
			if (!f) return errorPage("File not found");
			return vaultPreviewPage(fresh, f, `/vault/${id}/raw`);
		}

		const vaultDeleteMatch = url.pathname.match(/^\/vault\/([a-f0-9]+)\/delete$/);
		if (vaultDeleteMatch) {
			const session = await getSessionFromRequest(request, COOKIE_SECRET);
			if (!session) return redirectToLogin(url);
			const fresh = await refreshSessionFromDb(env, session);
			if (request.method !== "POST") return errorPage("Invalid method");
			const id = vaultDeleteMatch[1];

			// Delete metadata row (returns r2_key if it existed and belonged to user)
			const deleted = await deleteVaultFile(env, id, fresh.userId);
			if (!deleted?.r2_key) return errorPage("File not found");

			// Best-effort delete the object from R2
			ctx.waitUntil(env.R2_VAULT.delete(deleted.r2_key));
			return Response.redirect(url.origin + "/vault", 302);
		}

		const vaultDownloadMatch = url.pathname.match(/^\/vault\/([a-f0-9]+)\/download$/);
		if (vaultDownloadMatch) {
			const session = await getSessionFromRequest(request, COOKIE_SECRET);
			if (!session) return redirectToLogin(url);
			const fresh = await refreshSessionFromDb(env, session);
			const id = vaultDownloadMatch[1];
			const f = await getVaultFile(env, id, fresh.userId);
			if (!f) return errorPage("File not found");
			const obj = await env.R2_VAULT.get(f.r2_key);
			if (!obj) return errorPage("File missing from storage");
			return new Response(obj.body, {
				headers: {
					"Content-Type": f.mime_type ?? "application/octet-stream",
					"Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(f.file_name)}`,
				},
			});
		}

		const vaultThumbMatch = url.pathname.match(/^\/vault\/([a-f0-9]+)\/thumb$/);
		if (vaultThumbMatch) {
			const session = await getSessionFromRequest(request, COOKIE_SECRET);
			if (!session) return redirectToLogin(url);
			const fresh = await refreshSessionFromDb(env, session);
			const id = vaultThumbMatch[1];
			const f = await getVaultFile(env, id, fresh.userId);
			if (!f) return errorPage("File not found");
			const obj = await env.R2_VAULT.get(f.r2_key);
			if (!obj) return errorPage("File missing from storage");
			return new Response(obj.body, {
				headers: {
					"Content-Type": f.mime_type ?? "application/octet-stream",
					"Cache-Control": "private, max-age=0",
				},
			});
		}

		const vaultRawMatch = url.pathname.match(/^\/vault\/([a-f0-9]+)\/raw$/);
		if (vaultRawMatch) {
			const session = await getSessionFromRequest(request, COOKIE_SECRET);
			if (!session) return redirectToLogin(url);
			const fresh = await refreshSessionFromDb(env, session);
			const id = vaultRawMatch[1];
			const f = await getVaultFile(env, id, fresh.userId);
			if (!f) return errorPage("File not found");
			const obj = await env.R2_VAULT.get(f.r2_key);
			if (!obj) return errorPage("File missing from storage");
			return new Response(obj.body, {
				headers: {
					"Content-Type": f.mime_type ?? "application/octet-stream",
					"Cache-Control": "private, max-age=0",
				},
			});
		}

		if (url.pathname === "/photos") {
			const session = await getSessionFromRequest(request, COOKIE_SECRET);
			if (!session) return redirectToLogin(url);
			const fresh = await refreshSessionFromDb(env, session);
			const [files, folders, allFolders] = await Promise.all([
				listMediaFilesInFolder(env, fresh.userId, null),
				listPhotoFolders(env, fresh.userId, null),
				getAllPhotoFolders(env, fresh.userId),
			]);
			return photosPage(fresh, { files, folders, currentFolder: null, breadcrumbs: [], allFolders });
		}

		// Create photo folder
		if (url.pathname === "/photos/folders" && request.method === "POST") {
			const session = await getSessionFromRequest(request, COOKIE_SECRET);
			if (!session) return redirectToLogin(url);
			const fresh = await refreshSessionFromDb(env, session);
			const form = await request.formData();
			const name = String(form.get("name") ?? "").trim();
			const parentId = String(form.get("parent_id") ?? "").trim() || null;
			const redirect = String(form.get("redirect") ?? "/photos");
			if (!name) return errorPage("Folder name required");
			await createPhotoFolder(env, { ownerId: fresh.userId, name, parentId });
			return Response.redirect(url.origin + redirect, 302);
		}

		// Move photo to folder
		if (url.pathname === "/photos/move" && request.method === "POST") {
			const session = await getSessionFromRequest(request, COOKIE_SECRET);
			if (!session) return redirectToLogin(url);
			const fresh = await refreshSessionFromDb(env, session);
			const form = await request.formData();
			const fileId = String(form.get("file_id") ?? "").trim();
			const folderId = String(form.get("folder_id") ?? "").trim() || null;
			const redirect = String(form.get("redirect") ?? "/photos");
			if (!fileId) return errorPage("Missing file_id");
			await moveVaultFileToFolder(env, fileId, fresh.userId, folderId);
			return Response.redirect(url.origin + redirect, 302);
		}

		// Photo folder view
		const photoFolderMatch = url.pathname.match(/^\/photos\/folder\/([a-zA-Z0-9]+)$/);
		if (photoFolderMatch) {
			const session = await getSessionFromRequest(request, COOKIE_SECRET);
			if (!session) return redirectToLogin(url);
			const fresh = await refreshSessionFromDb(env, session);
			const folderId = photoFolderMatch[1];
			const [currentFolder, files, folders, allFolders, breadcrumbs] = await Promise.all([
				getPhotoFolder(env, folderId, fresh.userId),
				listMediaFilesInFolder(env, fresh.userId, folderId),
				listPhotoFolders(env, fresh.userId, folderId),
				getAllPhotoFolders(env, fresh.userId),
				getFolderBreadcrumb(env, folderId, fresh.userId),
			]);
			if (!currentFolder) return errorPage("Folder not found");
			return photosPage(fresh, { files, folders, currentFolder, breadcrumbs, allFolders });
		}

		// Delete photo folder
		const photoFolderDeleteMatch = url.pathname.match(/^\/photos\/folder\/([a-zA-Z0-9]+)\/delete$/);
		if (photoFolderDeleteMatch && request.method === "POST") {
			const session = await getSessionFromRequest(request, COOKIE_SECRET);
			if (!session) return redirectToLogin(url);
			const fresh = await refreshSessionFromDb(env, session);
			const folderId = photoFolderDeleteMatch[1];
			await deletePhotoFolder(env, folderId, fresh.userId);
			return Response.redirect(url.origin + "/photos", 302);
		}

		// Telegram page
		if (url.pathname === "/telegram") {
			const session = await getSessionFromRequest(request, COOKIE_SECRET);
			if (!session) return redirectToLogin(url);
			const fresh = await refreshSessionFromDb(env, session);
			const [images, settings] = await Promise.all([
				listImageFiles(env, fresh.userId),
				getUserSettings(env, fresh.userId),
			]);
			return telegramPage(fresh, {
				images,
				hasBotConfig: !!(settings.telegram_bot_token && settings.telegram_chat_id),
				botToken: settings.telegram_bot_token ?? null,
				chatId: settings.telegram_chat_id ?? null,
				telegramEnabled: !!settings.telegram_mirror_enabled,
			});
		}

		// Telegram send selected photos
		if (url.pathname === "/telegram/send" && request.method === "POST") {
			const session = await getSessionFromRequest(request, COOKIE_SECRET);
			if (!session) return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: { "Content-Type": "application/json" } });
			const fresh = await refreshSessionFromDb(env, session);
			const settings = await getUserSettings(env, fresh.userId);
			if (!settings.telegram_bot_token || !settings.telegram_chat_id) {
				return new Response(JSON.stringify({ error: "Telegram not configured" }), { status: 400, headers: { "Content-Type": "application/json" } });
			}
			const body = await request.json<{ fileIds?: string[] }>();
			const fileIds = Array.isArray(body?.fileIds) ? body.fileIds.slice(0, 20) : [];
			if (!fileIds.length) return new Response(JSON.stringify({ error: "No files selected" }), { status: 400, headers: { "Content-Type": "application/json" } });

			let sent = 0;
			const errors: string[] = [];
			for (const id of fileIds) {
				const f = await getVaultFile(env, id, fresh.userId);
				if (!f || !(f.mime_type ?? "").startsWith("image/")) continue;
				const obj = await env.R2_VAULT.get(f.r2_key);
				if (!obj) continue;
				const blob = await obj.arrayBuffer();
				const file = new File([blob], f.file_name, { type: f.mime_type ?? "image/jpeg" });
				try {
					await mirrorPhotoToTelegram(settings.telegram_bot_token, settings.telegram_chat_id, file);
					sent++;
				} catch (e) {
					errors.push(f.file_name);
				}
			}
			return new Response(JSON.stringify({ sent, errors }), { headers: { "Content-Type": "application/json" } });
		}

		if (url.pathname === "/shared") {
			const session = await getSessionFromRequest(request, COOKIE_SECRET);
			if (!session) return redirectToLogin(url);
			const fresh = await refreshSessionFromDb(env, session);
			return sharedPage(fresh);
		}

		if (url.pathname === "/activity") {
			const session = await getSessionFromRequest(request, COOKIE_SECRET);
			if (!session) return redirectToLogin(url);
			const fresh = await refreshSessionFromDb(env, session);
			return activityPage(fresh);
		}

		if (url.pathname === "/favorites") {
			const session = await getSessionFromRequest(request, COOKIE_SECRET);
			if (!session) return redirectToLogin(url);
			const fresh = await refreshSessionFromDb(env, session);
			return favoritesPage(fresh);
		}

		if (url.pathname === "/trash") {
			const session = await getSessionFromRequest(request, COOKIE_SECRET);
			if (!session) return redirectToLogin(url);
			const fresh = await refreshSessionFromDb(env, session);
			return trashPage(fresh);
		}

		// Password vault
		if (url.pathname === "/passwords") {
			const session = await getSessionFromRequest(request, COOKIE_SECRET);
			if (!session) return redirectToLogin(url);
			const fresh = await refreshSessionFromDb(env, session);

			if (request.method === "POST") {
				const body = await request.json<any>();
				if (!body?.ct || !body?.salt || !body?.iv || !body?.kdf || !body?.kdf_params) return errorPage("Bad request");
				await upsertPasswordVault(env, {
					ownerId: fresh.userId,
					vaultBlob: JSON.stringify(body),
					kdf: String(body.kdf),
					kdfParams: JSON.stringify(body.kdf_params),
				});
				return new Response("ok");
			}

			const existing = await getPasswordVault(env, fresh.userId);
			return passwordsPage(fresh, {
				hasVault: !!existing,
				updatedAt: existing?.updated_at,
				kdf: existing?.kdf,
			});
		}

		if (url.pathname === "/passwords/data") {
			const session = await getSessionFromRequest(request, COOKIE_SECRET);
			if (!session) return redirectToLogin(url);
			const fresh = await refreshSessionFromDb(env, session);
			const existing = await getPasswordVault(env, fresh.userId);
			if (!existing) return new Response("No vault", { status: 404 });
			return new Response(existing.vault_blob, { headers: { "Content-Type": "application/json" } });
		}

		// Dashboard
		if (url.pathname === "/dashboard") {
			const session = await getSessionFromRequest(request, COOKIE_SECRET);
			if (!session) return redirectToLogin(url);
			const fresh = await refreshSessionFromDb(env, session);
			const stats = await getDashboardStats(env, fresh.userId);
			return dashboardPage(fresh, stats);
		}

		// Profile
		if (url.pathname === "/profile") {
			const session = await getSessionFromRequest(request, COOKIE_SECRET);
			if (!session) return Response.redirect(url.origin + "/dashboard", 302);
			const fresh = await refreshSessionFromDb(env, session);

			if (request.method === "POST") {
				const form = await request.formData();
				const username = String(form.get("username") ?? "").trim();
				const avatarUrl = String(form.get("avatar_url") ?? "").trim();

				if (username && !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
					return errorPage("Username must be 3-20 characters: letters, numbers, underscore.");
				}
				if (avatarUrl && !/^https?:\/\//.test(avatarUrl)) {
					return errorPage("Avatar URL must start with http:// or https://");
				}

				try {
					await env.AUTH_DB.prepare(
						"UPDATE user SET username = COALESCE(NULLIF(?, ''), username), avatar_url = COALESCE(NULLIF(?, ''), avatar_url) WHERE id = ?",
					)
						.bind(username, avatarUrl, fresh.userId)
						.run();
				} catch (e) {
					console.error("Profile update error", e);
					return errorPage("That username might already be taken.");
				}

				return Response.redirect(url.origin + "/profile", 302);
			}

			const user = await getUserById(env, fresh.userId);
			if (!user) return errorPage("User not found.");
			const settings = await getUserSettings(env, fresh.userId);
			return profilePage(fresh, user, settings);
		}

		if (url.pathname === "/profile/telegram") {
			const session = await getSessionFromRequest(request, COOKIE_SECRET);
			if (!session) return redirectToLogin(url);
			const fresh = await refreshSessionFromDb(env, session);
			if (request.method !== "POST") return errorPage("Invalid method");

			const form = await request.formData();
			const enabled = String(form.get("telegram_enabled") ?? "0") === "1" ? 1 : 0;
			const chatId = String(form.get("telegram_chat_id") ?? "").trim();
			const botToken = String(form.get("telegram_bot_token") ?? "").trim();

			await updateUserSettings(env, fresh.userId, {
				telegram_mirror_enabled: enabled,
				telegram_chat_id: chatId || null,
				telegram_bot_token: botToken || null,
			});

			return Response.redirect(url.origin + "/profile", 302);
		}

		// Logout
		if (url.pathname === "/logout") {
			const domain = getCanonicalHost(env) ?? undefined;
			return new Response(null, {
				status: 302,
				headers: {
					Location: url.origin + "/",
					"Set-Cookie": clearSessionCookie({ domain }),
				},
			});
		}

		// Admin
		if (url.pathname === "/admin") {
			const session = await getSessionFromRequest(request, COOKIE_SECRET);
			if (!session) return redirectToLogin(url);
			const fresh = await refreshSessionFromDb(env, session);
			if (!requireRole(fresh, ["admin"])) return errorPage("Admin only");
			const users = await listUsers(env);
			return adminUsersPage(fresh, users);
		}

		const adminRoleMatch = url.pathname.match(/^\/admin\/users\/([a-f0-9]+)\/role$/);
		if (adminRoleMatch) {
			const session = await getSessionFromRequest(request, COOKIE_SECRET);
			if (!session) return redirectToLogin(url);
			const fresh = await refreshSessionFromDb(env, session);
			if (!requireRole(fresh, ["admin"])) return errorPage("Admin only");
			if (request.method !== "POST") return errorPage("Invalid method");

			const userId = adminRoleMatch[1];
			const form = await request.formData();
			const role = String(form.get("role") ?? "member");
			if (!["member", "moderator", "admin"].includes(role)) return errorPage("Invalid role");
			await setUserRole(env, userId, role);
			return Response.redirect(url.origin + "/admin", 302);
		}

		// Everything else — OpenAuth issuer
		const auth = issuer({
			storage: CloudflareStorage({ namespace: env.AUTH_STORAGE }),
			subjects,
			providers: {
				password: PasswordProvider(
					PasswordUI({
						sendCode: async (email, code) => {
							const res = await fetch("https://api.resend.com/emails", {
								method: "POST",
								headers: {
									Authorization: `Bearer ${env.RESEND_API_KEY}`,
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									from: env.RESEND_FROM,
									to: [email],
									subject: `Your SapphireAuth verification code: ${code}`,
									html: `<div style="font-family: 'Inter', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem; background: #0F0F13; color: #E4E4ED; border-radius: 1rem;">
										<h2 style="color: #6C63FF; margin-bottom: 0.5rem;">SapphireAuth</h2>
										<p style="color: #7A7A92; margin-bottom: 1.5rem;">Here's your verification code:</p>
										<div style="background: #1A1A24; border: 1px solid #2A2A3C; border-radius: 0.75rem; padding: 1.25rem; text-align: center; margin-bottom: 1.5rem;">
											<span style="font-size: 2rem; font-weight: 700; letter-spacing: 0.3em; color: #E4E4ED;">${code}</span>
										</div>
										<p style="color: #5A5A72; font-size: 0.85rem;">This code expires in 24 hours. If you didn't request this, you can ignore this email.</p>
									</div>`,
								}),
							});
							if (!res.ok) {
								const err = await res.text();
								console.error(`Resend error: ${err}`);
								throw new Error("Failed to send verification email");
							}
							console.log(`Verification code sent to ${email}`);
						},
						copy: {
							input_code: "Enter the code sent to your email",
							register_title: "Create your account",
							register_description: "Sign up with your email",
							login_title: "Welcome back",
							login_description: "Sign in to your account",
						},
					}),
				),
			},
			theme: {
				title: "SapphireVault",
				radius: "lg",
				primary: { dark: "#6C63FF", light: "#4F46E5" },
				background: { dark: "#0F0F13", light: "#F9FAFB" },
				font: { family: "Inter, system-ui, sans-serif" },
			},
			success: async (response, value, req) => {
				const email = (value as any).email as string;
				const userId = await getOrCreateUser(env, email);
				const user = await env.AUTH_DB.prepare("SELECT role, username FROM user WHERE id = ?")
					.bind(userId)
					.first<{ role: string; username: string | null }>();

				const cookie = await makeSessionCookie(
					{
						userId,
						email,
						role: user?.role ?? "member",
						username: user?.username ?? null,
					},
					COOKIE_SECRET,
					{ domain: getCanonicalHost(env) ?? undefined },
				);

				return new Response(null, {
					status: 302,
					headers: {
						Location: "/dashboard",
						"Set-Cookie": cookie,
					},
				});
			},
		});
		return auth.fetch(request, env, ctx);
	},
};

async function mirrorPhotoToTelegram(botToken: string, chatId: string, file: File) {
	try {
		const form = new FormData();
		form.set("chat_id", chatId);
		// sendPhoto for images — faster, displays inline in Telegram
		form.set("photo", file, file.name);
		const res = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
			method: "POST",
			body: form,
		});
		if (!res.ok) {
			// Fallback to sendDocument if sendPhoto fails (e.g. file too large)
			const form2 = new FormData();
			form2.set("chat_id", chatId);
			form2.set("document", file, file.name);
			await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
				method: "POST",
				body: form2,
			});
		}
	} catch (e) {
		console.error("Telegram photo mirror failed", e);
	}
}

async function getOrCreateUser(env: Env, email: string): Promise<string> {
	const existing = await env.AUTH_DB.prepare("SELECT id FROM user WHERE email = ?")
		.bind(email)
		.first<{ id: string }>();
	if (existing?.id) return existing.id;

	const res = await env.AUTH_DB.prepare("INSERT INTO user (email) VALUES (?) RETURNING id")
		.bind(email)
		.first<{ id: string }>();
	if (!res?.id) throw new Error("Failed to create user");
	return res.id;
}
