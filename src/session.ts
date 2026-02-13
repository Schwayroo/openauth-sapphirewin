export type Session = {
	userId: string;
	email: string;
	role: string;
	username: string | null;
};

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

export function parseCookies(header: string | null): Record<string, string> {
	if (!header) return {};
	return Object.fromEntries(
		header.split(";").map((c) => {
			const [k, ...v] = c.trim().split("=");
			return [k, v.join("=")];
		}),
	);
}

export async function getSessionFromRequest(request: Request, cookieSecret: string): Promise<Session | null> {
	const cookies = parseCookies(request.headers.get("cookie"));
	const sessionCookie = cookies["sapphire_session"];
	if (!sessionCookie) return null;
	const data = await verify(decodeURIComponent(sessionCookie), cookieSecret);
	if (!data) return null;
	return JSON.parse(data) as Session;
}

export async function makeSessionCookie(session: Session, cookieSecret: string): Promise<string> {
	const sessionData = JSON.stringify(session);
	const signed = await sign(sessionData, cookieSecret);
	return `sapphire_session=${encodeURIComponent(signed)}; Path=/; Max-Age=86400; HttpOnly; Secure; SameSite=Lax`;
}
