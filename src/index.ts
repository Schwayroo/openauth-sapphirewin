import { issuer } from "@openauthjs/openauth";
import { CloudflareStorage } from "@openauthjs/openauth/storage/cloudflare";
import { PasswordProvider } from "@openauthjs/openauth/provider/password";
import { PasswordUI } from "@openauthjs/openauth/ui/password";
import { createSubjects } from "@openauthjs/openauth/subject";
import { object, string } from "valibot";

const subjects = createSubjects({
	user: object({
		id: string(),
		role: string(),
		username: string(),
	}),
});

// Simple HMAC-based signing for session cookies
async function sign(data: string, secret: string): Promise<string> {
	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
	const sigHex = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
	return `${data}.${sigHex}`;
}

async function verify(cookie: string, secret: string): Promise<string | null> {
	const lastDot = cookie.lastIndexOf(".");
	if (lastDot === -1) return null;
	const data = cookie.slice(0, lastDot);
	const expected = await sign(data, secret);
	if (expected !== cookie) return null;
	return data;
}

function parseCookies(header: string | null): Record<string, string> {
	if (!header) return {};
	return Object.fromEntries(
		header.split(";").map((c) => {
			const [k, ...v] = c.trim().split("=");
			return [k, v.join("=")];
		}),
	);
}

function homePage(email: string, userId: string, role: string, username: string | null, avatarUrl: string | null): Response {
	const html = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>SapphireAuth — Dashboard</title>
	<link rel="icon" href="https://files.catbox.moe/2kxof5.webp" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
	<style>
		*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
		body {
			font-family: 'Inter', system-ui, sans-serif;
			background: #0F0F13;
			color: #E4E4ED;
			min-height: 100vh;
			display: flex;
			flex-direction: column;
		}
		nav {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 1rem 2rem;
			border-bottom: 1px solid #1E1E2E;
			background: #13131A;
		}
		.nav-brand {
			font-size: 1.25rem;
			font-weight: 700;
			color: #6C63FF;
			text-decoration: none;
		}
		.nav-brand span { color: #E4E4ED; }
		.nav-actions { display: flex; align-items: center; gap: 1rem; }
		.nav-user { font-size: 0.875rem; color: #7A7A92; }
		.btn {
			display: inline-flex;
			align-items: center;
			gap: 0.5rem;
			padding: 0.5rem 1.25rem;
			border-radius: 0.75rem;
			font-size: 0.875rem;
			font-weight: 500;
			text-decoration: none;
			border: none;
			cursor: pointer;
			transition: all 0.15s ease;
		}
		.btn-primary { background: #6C63FF; color: #FFF; }
		.btn-primary:hover { background: #5B52E0; }
		.btn-ghost { background: transparent; color: #7A7A92; border: 1px solid #2A2A3C; }
		.btn-ghost:hover { color: #E4E4ED; border-color: #3A3A4C; }
		main {
			flex: 1;
			display: flex;
			justify-content: center;
			padding: 3rem 2rem;
		}
		.dashboard { max-width: 640px; width: 100%; }
		.welcome { margin-bottom: 2rem; }
		.welcome h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem; }
		.welcome p { color: #7A7A92; font-size: 0.95rem; }
		.card {
			background: #1A1A24;
			border: 1px solid #2A2A3C;
			border-radius: 1rem;
			padding: 1.5rem;
			margin-bottom: 1rem;
		}
		.card-header {
			font-size: 0.75rem;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 0.05em;
			color: #5A5A72;
			margin-bottom: 1rem;
		}
		.info-row {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 0.75rem 0;
			border-bottom: 1px solid #22222F;
		}
		.info-row:last-child { border-bottom: none; }
		.info-label { font-size: 0.875rem; color: #7A7A92; }
		.info-value { font-size: 0.875rem; font-weight: 500; color: #E4E4ED; }
		.status-badge {
			display: inline-flex;
			align-items: center;
			gap: 0.375rem;
			padding: 0.25rem 0.75rem;
			border-radius: 100px;
			font-size: 0.75rem;
			font-weight: 600;
			background: rgba(52, 211, 153, 0.1);
			color: #34D399;
		}
		.status-dot { width: 6px; height: 6px; border-radius: 50%; background: #34D399; }
		footer {
			text-align: center;
			padding: 1.5rem;
			color: #3A3A4C;
			font-size: 0.75rem;
			border-top: 1px solid #1E1E2E;
		}
		footer a { color: #5A5A72; text-decoration: none; }
		footer a:hover { color: #8B83FF; }
	</style>
</head>
<body>
	<nav>
		<a href="/dashboard" class="nav-brand">Sapphire<span>Auth</span></a>
		<div class="nav-actions">
			<a href="/profile" class="btn btn-ghost">Profile</a>
			<span class="nav-user">${email} · ${role}</span>
			<a href="/logout" class="btn btn-ghost">Log out</a>
		</div>
	</nav>
	<main>
		<div class="dashboard">
			<div class="welcome">
				<h1>Welcome back 👋</h1>
				<p>You're authenticated and ready to go.</p>
			</div>
			<div class="card">
				<div class="card-header">Account</div>
				<div class="info-row">
					<span class="info-label">Email</span>
					<span class="info-value">${email}</span>
				</div>
				<div class="info-row">
					<span class="info-label">Role</span>
					<span class="info-value">${role}</span>
				</div>
				<div class="info-row">
					<span class="info-label">Username</span>
					<span class="info-value">${username ?? "(not set)"}</span>
				</div>
				<div class="info-row">
					<span class="info-label">Avatar</span>
					<span class="info-value">${avatarUrl ? `<a href="${avatarUrl}" target="_blank" style="color:#8B83FF; text-decoration:none;">View</a>` : "(not set)"}</span>
				</div>
				<div class="info-row">
					<span class="info-label">User ID</span>
					<span class="info-value" style="font-family: monospace; font-size: 0.8rem;">${userId}</span>
				</div>
				<div class="info-row">
					<span class="info-label">Status</span>
					<span class="status-badge"><span class="status-dot"></span>Authenticated</span>
				</div>
			</div>
			<div class="card">
				<div class="card-header">Quick Actions</div>
				<div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
					<a href="/profile" class="btn btn-ghost">Edit Profile</a>
					<a href="/authorize/password/change" class="btn btn-ghost">Change Password</a>
				</div>
			</div>
		</div>
	</main>
	<footer>
		Powered by <a href="https://openauth.js.org" target="_blank">OpenAuth</a> &middot; SapphireAuth
	</footer>
</body>
</html>`;
	return new Response(html, {
		headers: { "Content-Type": "text/html; charset=utf-8" },
	});
}

function errorPage(message: string): Response {
	const html = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>SapphireAuth — Error</title>
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
	<style>
		body {
			font-family: 'Inter', system-ui, sans-serif;
			background: #0F0F13;
			color: #E4E4ED;
			min-height: 100vh;
			display: flex;
			align-items: center;
			justify-content: center;
		}
		.error-box { text-align: center; max-width: 400px; }
		.error-box h1 { font-size: 1.5rem; margin-bottom: 0.75rem; color: #F87171; }
		.error-box p { color: #7A7A92; margin-bottom: 1.5rem; }
		.error-box a {
			display: inline-block;
			padding: 0.5rem 1.5rem;
			background: #6C63FF;
			color: #FFF;
			border-radius: 0.75rem;
			text-decoration: none;
			font-weight: 500;
		}
		.error-box a:hover { background: #5B52E0; }
	</style>
</head>
<body>
	<div class="error-box">
		<h1>Something went wrong</h1>
		<p>${message}</p>
		<a href="/">Try again</a>
	</div>
</body>
</html>`;
	return new Response(html, {
		status: 400,
		headers: { "Content-Type": "text/html; charset=utf-8" },
	});
}

// Use a consistent secret derived from KV namespace ID for cookie signing
const COOKIE_SECRET = "sapphireauth-session-secret-key-2024";

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		// Landing — redirect to login
		if (url.pathname === "/") {
			return Response.redirect(url.origin + "/dashboard", 302);
		}

		// Dashboard — show home page if authenticated, redirect to login if not
		if (url.pathname === "/dashboard") {
			const cookies = parseCookies(request.headers.get("cookie"));
			const sessionCookie = cookies["sapphire_session"];
			if (!sessionCookie) {
				const loginUrl = new URL(url.origin + "/authorize");
				loginUrl.searchParams.set("redirect_uri", url.origin + "/callback");
				loginUrl.searchParams.set("client_id", "sapphireauth");
				loginUrl.searchParams.set("response_type", "code");
				return Response.redirect(loginUrl.toString(), 302);
			}

			const data = await verify(decodeURIComponent(sessionCookie), COOKIE_SECRET);
			if (!data) {
				// Invalid cookie — clear it and redirect to login
				const loginUrl = new URL(url.origin + "/authorize");
				loginUrl.searchParams.set("redirect_uri", url.origin + "/callback");
				loginUrl.searchParams.set("client_id", "sapphireauth");
				loginUrl.searchParams.set("response_type", "code");
				return new Response(null, {
					status: 302,
					headers: {
						Location: loginUrl.toString(),
						"Set-Cookie": "sapphire_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax",
					},
				});
			}

			const { userId, email } = JSON.parse(data);

			const user = await env.AUTH_DB.prepare(
				"SELECT role, username, avatar_url FROM user WHERE id = ?",
			)
				.bind(userId)
				.first<{ role: string; username: string | null; avatar_url: string | null }>();

			if (!user) return errorPage("User not found.");

			return homePage(email, userId, user.role, user.username, user.avatar_url);
		}

		// Profile (GET = show form, POST = update)
		if (url.pathname === "/profile") {
			const cookies = parseCookies(request.headers.get("cookie"));
			const sessionCookie = cookies["sapphire_session"];
			if (!sessionCookie) return Response.redirect(url.origin + "/dashboard", 302);
			const data = await verify(decodeURIComponent(sessionCookie), COOKIE_SECRET);
			if (!data) return Response.redirect(url.origin + "/dashboard", 302);
			const { userId, email } = JSON.parse(data) as { userId: string; email: string };

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
						.bind(username, avatarUrl, userId)
						.run();
				} catch (e) {
					console.error("Profile update error", e);
					return errorPage("That username might already be taken.");
				}

				return Response.redirect(url.origin + "/profile", 302);
			}

			const user = await env.AUTH_DB.prepare(
				"SELECT role, username, avatar_url FROM user WHERE id = ?",
			)
				.bind(userId)
				.first<{ role: string; username: string | null; avatar_url: string | null }>();
			if (!user) return errorPage("User not found.");

			const html = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>SapphireAuth — Profile</title>
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
	<style>
		*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
		body { font-family: 'Inter', system-ui, sans-serif; background: #0F0F13; color: #E4E4ED; min-height:100vh; }
		nav { display:flex; justify-content:space-between; align-items:center; padding:1rem 2rem; border-bottom:1px solid #1E1E2E; background:#13131A; }
		.nav-brand { font-size:1.25rem; font-weight:700; color:#6C63FF; text-decoration:none; }
		.nav-brand span{ color:#E4E4ED; }
		.nav-actions{ display:flex; align-items:center; gap:1rem; }
		.nav-user{ font-size:0.875rem; color:#7A7A92; }
		.btn{ display:inline-flex; align-items:center; gap:.5rem; padding:.5rem 1.25rem; border-radius:.75rem; font-size:.875rem; font-weight:500; text-decoration:none; border:1px solid #2A2A3C; background:transparent; color:#7A7A92; cursor:pointer; }
		.btn:hover{ color:#E4E4ED; border-color:#3A3A4C; }
		main{ display:flex; justify-content:center; padding:3rem 2rem; }
		.card{ max-width:640px; width:100%; background:#1A1A24; border:1px solid #2A2A3C; border-radius:1rem; padding:1.5rem; }
		h1{ font-size:1.5rem; margin-bottom:.5rem; }
		p{ color:#7A7A92; margin-bottom:1.5rem; }
		label{ display:block; font-size:.85rem; color:#7A7A92; margin-bottom:.4rem; }
		input{ width:100%; padding:.75rem 1rem; border-radius:.75rem; border:1px solid #2A2A3C; background:#0F0F13; color:#E4E4ED; margin-bottom:1rem; }
		input:focus{ outline:none; border-color:#6C63FF; box-shadow:0 0 0 3px rgba(108,99,255,.15); }
		.save{ background:#6C63FF; border:none; color:#fff; }
		.save:hover{ background:#5B52E0; }
		.avatar{ width:64px; height:64px; border-radius:999px; border:1px solid #2A2A3C; object-fit:cover; background:#0F0F13; }
	</style>
</head>
<body>
	<nav>
		<a href="/dashboard" class="nav-brand">Sapphire<span>Auth</span></a>
		<div class="nav-actions">
			<a href="/dashboard" class="btn">Dashboard</a>
			<span class="nav-user">${email} · ${user.role}</span>
			<a href="/logout" class="btn">Log out</a>
		</div>
	</nav>
	<main>
		<div class="card">
			<h1>Your Profile</h1>
			<p>Set a username and an avatar. (For now: paste an image URL.)</p>
			<div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.25rem;">
				<img class="avatar" src="${user.avatar_url ?? "https://www.gravatar.com/avatar/?d=mp"}" alt="avatar" />
				<div>
					<div style="font-weight:600;">${user.username ?? "(no username yet)"}</div>
					<div style="color:#7A7A92; font-size:.85rem;">Role: ${user.role}</div>
				</div>
			</div>
			<form method="POST" action="/profile">
				<label for="username">Username</label>
				<input id="username" name="username" placeholder="ex: Chris_Dev" value="${user.username ?? ""}" />

				<label for="avatar_url">Profile picture URL</label>
				<input id="avatar_url" name="avatar_url" placeholder="https://..." value="${user.avatar_url ?? ""}" />

				<button class="btn save" type="submit">Save</button>
			</form>
		</div>
	</main>
</body>
</html>`;
			return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
		}

		// Logout — clear cookie and redirect
		if (url.pathname === "/logout") {
			return new Response(null, {
				status: 302,
				headers: {
					Location: url.origin + "/",
					"Set-Cookie": "sapphire_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax",
				},
			});
		}

		// Callback — the OAuth redirect comes here, but we handle the actual
		// session creation in the success callback below via cookie
		if (url.pathname === "/callback") {
			// If we get here with a code, something went wrong — the success
			// handler should have already redirected with a cookie.
			// This is a fallback.
			return Response.redirect(url.origin + "/dashboard", 302);
		}

		// Everything else — OpenAuth issuer
		return issuer({
			storage: CloudflareStorage({
				namespace: env.AUTH_STORAGE,
			}),
			subjects,
			providers: {
				password: PasswordProvider(
					PasswordUI({
						sendCode: async (email, code) => {
							const res = await fetch("https://api.resend.com/emails", {
								method: "POST",
								headers: {
									"Authorization": `Bearer ${env.RESEND_API_KEY}`,
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									from: env.RESEND_FROM,
									to: [email],
									subject: `Your SapphireAuth verification code: ${code}`,
									html: `
										<div style="font-family: 'Inter', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem; background: #0F0F13; color: #E4E4ED; border-radius: 1rem;">
											<h2 style="color: #6C63FF; margin-bottom: 0.5rem;">SapphireAuth</h2>
											<p style="color: #7A7A92; margin-bottom: 1.5rem;">Here's your verification code:</p>
											<div style="background: #1A1A24; border: 1px solid #2A2A3C; border-radius: 0.75rem; padding: 1.25rem; text-align: center; margin-bottom: 1.5rem;">
												<span style="font-size: 2rem; font-weight: 700; letter-spacing: 0.3em; color: #E4E4ED;">${code}</span>
											</div>
											<p style="color: #5A5A72; font-size: 0.85rem;">This code expires in 24 hours. If you didn't request this, you can ignore this email.</p>
										</div>
									`,
								}),
							});
							if (!res.ok) {
								const err = await res.text();
								console.error(`Resend error: ${err}`);
								throw new Error(`Failed to send verification email`);
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
				primary: {
					dark: "#6C63FF",
					light: "#4F46E5",
				},
				background: {
					dark: "#0F0F13",
					light: "#F9FAFB",
				},
				font: {
					family: "Inter, system-ui, sans-serif",
				},
				css: `
					@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

					@media (prefers-color-scheme: dark) {
						[data-component="root"] {
							background: #0F0F13 !important;
						}
						[data-component="input"] {
							background: #1A1A24 !important;
							border-color: #2A2A3C !important;
							color: #E4E4ED !important;
						}
						[data-component="input"]:focus {
							border-color: #6C63FF !important;
							box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.15) !important;
						}
						[data-component="input"]::placeholder {
							color: #5A5A72 !important;
						}
						[data-component="button"] {
							background: #6C63FF !important;
							color: #FFFFFF !important;
							font-weight: 600 !important;
						}
						[data-component="button"]:hover {
							background: #5B52E0 !important;
						}
						[data-component="form"] {
							color: #E4E4ED !important;
						}
						[data-component="link"] {
							color: #8B83FF !important;
						}
						[data-component="link"]:hover {
							color: #A9A3FF !important;
						}
						[data-component="form-footer"] {
							color: #7A7A92 !important;
						}
					}
				`,
				favicon: "https://files.catbox.moe/2kxof5.webp",
				logo: {
					dark: "https://files.catbox.moe/2kxof5.webp",
					light: "https://files.catbox.moe/2kxof5.webp",
				},
			},
			success: async (_ctx, value) => {
				const userId = await getOrCreateUser(env, value.email);
				const user = await env.AUTH_DB.prepare(
					"SELECT role, username FROM user WHERE id = ?",
				)
					.bind(userId)
					.first<{ role: string; username: string | null }>();

				// Create a signed session cookie and redirect to dashboard
				const sessionData = JSON.stringify({
					userId,
					email: value.email,
					role: user?.role ?? "member",
					username: user?.username ?? null,
				});
				const signed = await sign(sessionData, COOKIE_SECRET);

				return new Response(null, {
					status: 302,
					headers: {
						Location: "/dashboard",
						"Set-Cookie": `sapphire_session=${encodeURIComponent(signed)}; Path=/; Max-Age=86400; HttpOnly; Secure; SameSite=Lax`,
					},
				});
			},
		}).fetch(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;

async function getOrCreateUser(env: Env, email: string): Promise<string> {
	const result = await env.AUTH_DB.prepare(
		`
		INSERT INTO user (email)
		VALUES (?)
		ON CONFLICT (email) DO UPDATE SET email = email
		RETURNING id;
		`,
	)
		.bind(email)
		.first<{ id: string }>();
	if (!result) {
		throw new Error(`Unable to process user: ${email}`);
	}
	console.log(`Found or created user ${result.id} with email ${email}`);
	return result.id;
}
