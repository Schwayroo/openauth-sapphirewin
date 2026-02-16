import type { Session } from "../session";

const COLORS = {
	bg: "#0F0F13",
	card: "#1A1A24",
	border: "#2A2A3C",
	borderSoft: "#1E1E2E",
	accent: "#6C63FF",
	accentHover: "#5B52E0",
	text: "#E4E4ED",
	muted: "#7A7A92",
};

export function layout(opts: {
	title: string;
	session: Session | null;
	active?: "dashboard" | "vault" | "profile" | "admin";
	content: string;
}): Response {
	const { title, session, active, content } = opts;

	const navLink = (href: string, label: string, key?: string) => {
		const isActive = key && active === key;
		const style = isActive
			? `background:${COLORS.card}; border-color:${COLORS.border}; color:${COLORS.text};`
			: "";
		return `<a class="nav-link" href="${href}" style="${style}">${label}</a>`;
	};

	const adminLink = session?.role === "admin" ? navLink("/admin", "Admin", "admin") : "";

	const html = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>${title}</title>
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
	<style>
		*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
		:root { color-scheme: dark; }
		body { font-family: 'Inter', system-ui, sans-serif; background: radial-gradient(1200px 600px at 20% -10%, rgba(108,99,255,.20), transparent 60%), radial-gradient(900px 500px at 80% 0%, rgba(108,99,255,.10), transparent 60%), ${COLORS.bg}; color: ${COLORS.text}; min-height: 100vh; }
		nav { position:sticky; top:0; z-index:10; backdrop-filter: blur(10px); display:flex; justify-content:space-between; align-items:center; padding: 1rem 2rem; border-bottom: 1px solid ${COLORS.borderSoft}; background: rgba(19,19,26,.75); }
		.nav-brand { font-size:1.25rem; font-weight:700; color:${COLORS.accent}; text-decoration:none; }
		.nav-brand span { color:${COLORS.text}; }
		.nav-left { display:flex; align-items:center; gap:.75rem; }
		.nav-right { display:flex; align-items:center; gap:.75rem; }
		.nav-link { display:inline-flex; align-items:center; padding:.45rem .9rem; border-radius:.75rem; border:1px solid ${COLORS.border}; text-decoration:none; font-size:.875rem; color:${COLORS.muted}; transition: transform .12s ease, border-color .12s ease, background .12s ease, color .12s ease; }
		.nav-link:hover { border-color:#3A3A4C; color:${COLORS.text}; background: rgba(255,255,255,.03); transform: translateY(-1px); }
		.badge { padding:.2rem .55rem; border-radius:999px; font-size:.75rem; border:1px solid ${COLORS.border}; color:${COLORS.muted}; }
		main { display:flex; justify-content:center; padding: 2.5rem 1.25rem; }
		.container { width:100%; max-width: 1120px; }
		.card { background: linear-gradient(180deg, rgba(26,26,36,.92), rgba(26,26,36,.72)); border:1px solid ${COLORS.border}; border-radius:1rem; padding:1.25rem; box-shadow: 0 12px 40px rgba(0,0,0,.35); animation: cardIn .25s ease-out; }
		@keyframes cardIn { from { transform: translateY(6px); opacity: .0; } to { transform: translateY(0); opacity: 1; } }
		.h1 { font-size: 1.6rem; font-weight:700; margin-bottom:.5rem; }
		.p { color:${COLORS.muted}; margin-bottom:1.25rem; }
		.grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap:1rem; }
		.input, textarea { width:100%; padding:.75rem 1rem; border-radius:.75rem; border:1px solid ${COLORS.border}; background:${COLORS.bg}; color:${COLORS.text}; }
		textarea { min-height: 160px; resize: vertical; }
		.input:focus, textarea:focus { outline:none; border-color:${COLORS.accent}; box-shadow: 0 0 0 3px rgba(108,99,255,.15); }
		.label { display:block; font-size:.85rem; color:${COLORS.muted}; margin:.9rem 0 .4rem; }
		.btn { display:inline-flex; align-items:center; gap:.5rem; padding:.55rem 1.05rem; border-radius:.75rem; border:1px solid ${COLORS.border}; background:transparent; color:${COLORS.muted}; text-decoration:none; cursor:pointer; font-weight:600; font-size:.9rem; transition: transform .12s ease, border-color .12s ease, background .12s ease, color .12s ease; }
		.btn:hover { border-color:#3A3A4C; color:${COLORS.text}; background: rgba(255,255,255,.03); transform: translateY(-1px); }
		.btn:active { transform: translateY(0px) scale(.99); }
		.btn-primary { background:${COLORS.accent}; border-color:${COLORS.accent}; color:white; }
		.btn-primary:hover { background:${COLORS.accentHover}; border-color:${COLORS.accentHover}; }
		.row { display:flex; gap:.75rem; flex-wrap:wrap; align-items:center; }
		table { width:100%; border-collapse: collapse; }
		th, td { text-align:left; padding:.65rem .5rem; border-bottom:1px solid #22222F; font-size:.9rem; }
		th { color:${COLORS.muted}; font-size:.8rem; text-transform: uppercase; letter-spacing:.06em; }
		.small { color:${COLORS.muted}; font-size:.85rem; }
	</style>
</head>
<body>
	<nav>
		<div class="nav-left">
			<a href="/dashboard" class="nav-brand">Sapphire<span>Auth</span></a>
			${navLink("/dashboard", "Dashboard", "dashboard")}
			${navLink("/vault", "Files", "vault")}
			${navLink("/passwords", "Passwords", "vault")}
			${session ? navLink("/profile", "Profile", "profile") : ""}
			${adminLink}
		</div>
		<div class="nav-right">
			${session ? `<span class="badge">${session.email} · ${session.role}</span><a class="nav-link" href="/logout">Log out</a>` : `<a class="nav-link" href="/dashboard">Log in</a>`}
		</div>
	</nav>
	<main>
		<div class="container">${content}</div>
	</main>
</body>
</html>`;

	return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
