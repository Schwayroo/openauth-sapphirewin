export function getCanonicalHost(env: any): string | null {
	// Optional: set CANONICAL_HOST in wrangler secrets/vars. Example: sapphirelol.com
	return (env && (env.CANONICAL_HOST as string | undefined)) || null;
}

export function canonicalize(url: URL, env: any): Response | null {
	const canonicalHost = getCanonicalHost(env);
	if (!canonicalHost) return null;

	if (url.host !== canonicalHost) {
		const next = new URL(url.toString());
		next.host = canonicalHost;
		next.protocol = "https:";
		return Response.redirect(next.toString(), 301);
	}
	return null;
}
