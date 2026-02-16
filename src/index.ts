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
import { profilePage } from "./pages/profile";
import { adminUsersPage } from "./pages/admin";
import { vaultListPage, vaultPreviewPage } from "./pages/vault";
import { createVaultFile, getVaultFile, listVaultFiles } from "./vault";

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

		if (url.pathname === "/") return Response.redirect(url.origin + "/dashboard", 302);

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

			// Optional Telegram mirror (feature-flag)
			if ((env.TELEGRAM_MIRROR_ENABLED ?? "false") === "true" && env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
				ctx.waitUntil(mirrorToTelegram(env, file));
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

		// Dashboard
		if (url.pathname === "/dashboard") {
			const session = await getSessionFromRequest(request, COOKIE_SECRET);
			if (!session) return redirectToLogin(url);
			const fresh = await refreshSessionFromDb(env, session);
			return dashboardPage(fresh);
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
			return profilePage(fresh, user);
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
				title: "SapphireAuth",
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

async function mirrorToTelegram(env: Env, file: File) {
	try {
		const form = new FormData();
		form.set("chat_id", env.TELEGRAM_CHAT_ID!);
		form.set("document", file, file.name);
		await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN!}/sendDocument`, {
			method: "POST",
			body: form,
		});
	} catch (e) {
		console.error("Telegram mirror failed", e);
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
