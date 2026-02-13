import type { Env } from "./db";
import { getSessionFromRequest } from "./session";

export function requireRole(session: { role: string } | null, roles: string[]) {
	if (!session) return false;
	return roles.includes(session.role);
}

export async function requireAuth(request: Request, cookieSecret: string) {
	return getSessionFromRequest(request, cookieSecret);
}

export function redirectToLogin(url: URL) {
	const loginUrl = new URL(url.origin + "/authorize");
	loginUrl.searchParams.set("redirect_uri", url.origin + "/callback");
	loginUrl.searchParams.set("client_id", "sapphireauth");
	loginUrl.searchParams.set("response_type", "code");
	return Response.redirect(loginUrl.toString(), 302);
}

export async function refreshSessionFromDb(env: Env, session: { userId: string; email: string; role: string; username: string | null }) {
	const user = await env.AUTH_DB.prepare("SELECT role, username FROM user WHERE id = ?")
		.bind(session.userId)
		.first<{ role: string; username: string | null }>();
	return {
		...session,
		role: user?.role ?? session.role,
		username: user?.username ?? session.username,
	};
}
