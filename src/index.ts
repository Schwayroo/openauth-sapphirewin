import { issuer } from "@openauthjs/openauth";
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

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);
		if (url.pathname === "/") {
			url.searchParams.set("redirect_uri", url.origin + "/callback");
			url.searchParams.set("client_id", "your-client-id");
			url.searchParams.set("response_type", "code");
			url.pathname = "/authorize";
			return Response.redirect(url.toString());
		} else if (url.pathname === "/callback") {
			return Response.json({
				message: "OAuth flow complete!",
				params: Object.fromEntries(url.searchParams.entries()),
			});
		}

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
