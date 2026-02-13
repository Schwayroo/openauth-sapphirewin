import { issuer } from "@openauthjs/openauth";
import { createClient } from "@openauthjs/openauth/client";
import { CloudflareStorage } from "@openauthjs/openauth/storage/cloudflare";
import { PasswordProvider } from "@openauthjs/openauth/provider/password";
import { PasswordUI } from "@openauthjs/openauth/ui/password";
import { createSubjects } from "@openauthjs/openauth/subject";
import { object, string } from "valibot";

const subjects = createSubjects({
	user: object({
		id: string(),
	}),
});

function homePage(email: string, userId: string): Response {
	const html = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>SapphireAuth — Dashboard</title>
	<link rel="icon" href="https://workers.cloudflare.com//favicon.ico" />
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
		.nav-user {
			font-size: 0.875rem;
			color: #7A7A92;
		}
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
		.btn-primary {
			background: #6C63FF;
			color: #FFF;
		}
		.btn-primary:hover { background: #5B52E0; }
		.btn-ghost {
			background: transparent;
			color: #7A7A92;
			border: 1px solid #2A2A3C;
		}
		.btn-ghost:hover { color: #E4E4ED; border-color: #3A3A4C; }
		main {
			flex: 1;
			display: flex;
			justify-content: center;
			padding: 3rem 2rem;
		}
		.dashboard {
			max-width: 640px;
			width: 100%;
		}
		.welcome {
			margin-bottom: 2rem;
		}
		.welcome h1 {
			font-size: 1.75rem;
			font-weight: 700;
			margin-bottom: 0.5rem;
		}
		.welcome p {
			color: #7A7A92;
			font-size: 0.95rem;
		}
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
		.info-label {
			font-size: 0.875rem;
			color: #7A7A92;
		}
		.info-value {
			font-size: 0.875rem;
			font-weight: 500;
			color: #E4E4ED;
		}
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
		.status-dot {
			width: 6px;
			height: 6px;
			border-radius: 50%;
			background: #34D399;
		}
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
		<a href="/" class="nav-brand">Sapphire<span>Auth</span></a>
		<div class="nav-actions">
			<span class="nav-user">${email}</span>
			<a href="/" class="btn btn-ghost">Log out</a>
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
		.error-box {
			text-align: center;
			max-width: 400px;
		}
		.error-box h1 {
			font-size: 1.5rem;
			margin-bottom: 0.75rem;
			color: #F87171;
		}
		.error-box p {
			color: #7A7A92;
			margin-bottom: 1.5rem;
		}
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

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		// Home — redirect to auth flow
		if (url.pathname === "/") {
			url.searchParams.set("redirect_uri", url.origin + "/callback");
			url.searchParams.set("client_id", "your-client-id");
			url.searchParams.set("response_type", "code");
			url.pathname = "/authorize";
			return Response.redirect(url.toString());
		}

		// Callback — exchange code, look up user, render dashboard
		if (url.pathname === "/callback") {
			const code = url.searchParams.get("code");
			if (!code) {
				return errorPage("No authorization code received.");
			}

			try {
				const client = createClient({
					clientID: "your-client-id",
					issuer: url.origin,
				});

				const exchanged = await client.exchange(
					code,
					url.origin + "/callback",
				);
				if (exchanged.err) {
					return errorPage("Invalid or expired authorization code.");
				}

				const verified = await client.verify(
					subjects,
					exchanged.tokens.access,
				);
				if (verified.err) {
					return errorPage("Could not verify your session.");
				}

				const userId = verified.subject.properties.id;
				const user = await env.AUTH_DB.prepare(
					"SELECT email FROM user WHERE id = ?",
				)
					.bind(userId)
					.first<{ email: string }>();

				if (!user) {
					return errorPage("User not found.");
				}

				return homePage(user.email, userId);
			} catch (e) {
				console.error("Callback error:", e);
				return errorPage("Authentication failed. Please try again.");
			}
		}

		// Everything else — OpenAuth issuer handles /authorize, /register, /change, etc.
		return issuer({
			storage: CloudflareStorage({
				namespace: env.AUTH_STORAGE,
			}),
			subjects,
			providers: {
				password: PasswordProvider(
					PasswordUI({
						sendCode: async (email, code) => {
							console.log(`Sending code ${code} to ${email}`);
						},
						copy: {
							input_code: "Code (check Worker logs)",
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
				favicon: "https://workers.cloudflare.com//favicon.ico",
				logo: {
					dark: "https://imagedelivery.net/wSMYJvS3Xw-n339CbDyDIA/db1e5c92-d3a6-4ea9-3e72-155844211f00/public",
					light: "https://imagedelivery.net/wSMYJvS3Xw-n339CbDyDIA/fa5a3023-7da9-466b-98a7-4ce01ee6c700/public",
				},
			},
			success: async (ctx, value) => {
				return ctx.subject("user", {
					id: await getOrCreateUser(env, value.email),
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
