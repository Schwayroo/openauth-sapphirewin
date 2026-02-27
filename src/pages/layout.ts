import type { Session } from "../session";

export function layout(opts: {
	title: string;
	session: Session | null;
	active?: "dashboard" | "vault" | "profile" | "admin";
	content: string;
	variant?: "app" | "marketing";
}): Response {
	const { title, session, active, content, variant = "app" } = opts;

	const navLink = (href: string, label: string, key?: string) => {
		const isActive = key && active === key;
		const style = isActive ? `background:rgba(108,99,255,.12);border-color:rgba(108,99,255,.35);color:#E4E4ED;` : "";
		return `<a class="nav-link" href="${href}" style="${style}">${label}</a>`;
	};

	const adminLink = session?.role === "admin" ? navLink("/admin", "Admin", "admin") : "";

	const html = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>${title}</title>
	<link rel="icon" href="/logo.webp" type="image/webp" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
	<style>
		*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
		:root {
			color-scheme: dark;
			--bg: #0F0F13;
			--card: #1A1A24;
			--border: #2A2A3C;
			--border-soft: #1E1E2E;
			--accent: #6C63FF;
			--accent-h: #5B52E0;
			--text: #E4E4ED;
			--muted: #7A7A92;
			--muted-light: #A7A7BD;
			--danger: #F87171;
			--success: #34D399;
		}
		body {
			font-family: 'Inter', system-ui, sans-serif;
			background: radial-gradient(1200px 600px at 20% -10%, rgba(108,99,255,.18), transparent 60%),
						radial-gradient(900px 500px at 80% 0%, rgba(108,99,255,.08), transparent 60%),
						var(--bg);
			color: var(--text);
			min-height: 100vh;
		}
		/* ── Top Nav ── */
		nav.topnav {
			position: sticky; top: 0; z-index: 50;
			backdrop-filter: blur(12px) saturate(1.5);
			display: flex; justify-content: space-between; align-items: center;
			padding: .7rem 1.5rem;
			border-bottom: 1px solid var(--border-soft);
			background: rgba(15,15,19,.8);
		}
		.nav-brand {
			display: flex; align-items: center; gap: .6rem;
			text-decoration: none; font-size: 1.1rem; font-weight: 800; letter-spacing: -.02em;
		}
		.nav-brand img { width: 32px; height: 32px; object-fit: contain; }
		.nav-brand-text { color: var(--accent); }
		.nav-brand-text span { color: var(--text); }
		.nav-left { display: flex; align-items: center; gap: .5rem; }
		.nav-right { display: flex; align-items: center; gap: .5rem; }
		.nav-link {
			display: inline-flex; align-items: center; padding: .42rem .85rem;
			border-radius: .65rem; border: 1px solid var(--border);
			text-decoration: none; font-size: .85rem; color: var(--muted);
			transition: all .15s ease;
		}
		.nav-link:hover { border-color: #3A3A4C; color: var(--text); background: rgba(255,255,255,.04); transform: translateY(-1px); }
		.badge {
			padding: .22rem .6rem; border-radius: 999px; font-size: .75rem;
			border: 1px solid var(--border); color: var(--muted);
			max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
		}
		/* ── Main ── */
		main { display: flex; justify-content: center; padding: ${variant === "marketing" ? "0 1.25rem 4rem" : "2rem 1.25rem"}; }
		.container { width: 100%; max-width: 1140px; }
		/* ── Cards ── */
		.card {
			background: linear-gradient(180deg, rgba(26,26,36,.95), rgba(22,22,32,.85));
			border: 1px solid var(--border); border-radius: 1.1rem; padding: 1.4rem;
			box-shadow: 0 8px 32px rgba(0,0,0,.3);
			animation: cardIn .2s ease-out;
		}
		@keyframes cardIn { from { transform: translateY(5px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
		/* ── Typography ── */
		.h1 { font-size: 1.5rem; font-weight: 800; letter-spacing: -.025em; margin-bottom: .4rem; }
		.h2 { font-size: 1.1rem; font-weight: 700; letter-spacing: -.015em; margin-bottom: .35rem; }
		.p { color: var(--muted-light); line-height: 1.65; margin-bottom: 1rem; }
		.small { color: var(--muted); font-size: .82rem; line-height: 1.5; }
		/* ── Layout helpers ── */
		.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
		.row { display: flex; gap: .65rem; flex-wrap: wrap; align-items: center; }
		/* ── Form controls ── */
		.label { display: block; font-size: .82rem; font-weight: 500; color: var(--muted-light); margin: .85rem 0 .35rem; }
		.input {
			width: 100%; padding: .72rem .95rem; border-radius: .72rem;
			border: 1px solid var(--border); background: rgba(15,15,19,.7);
			color: var(--text); font-family: inherit; font-size: .9rem;
			transition: border-color .15s, box-shadow .15s;
		}
		.input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(108,99,255,.15); }
		textarea.input { min-height: 160px; resize: vertical; }
		select.input { cursor: pointer; }
		/* ── Buttons ── */
		.btn {
			display: inline-flex; align-items: center; gap: .45rem;
			padding: .55rem 1.1rem; border-radius: .72rem;
			border: 1px solid var(--border); background: transparent;
			color: var(--muted); text-decoration: none; cursor: pointer;
			font-weight: 600; font-size: .88rem; font-family: inherit;
			transition: all .15s ease; white-space: nowrap;
		}
		.btn:hover { border-color: #3A3A4C; color: var(--text); background: rgba(255,255,255,.04); transform: translateY(-1px); }
		.btn:active { transform: translateY(0) scale(.99); }
		.btn-primary { background: var(--accent); border-color: var(--accent); color: white; }
		.btn-primary:hover { background: var(--accent-h); border-color: var(--accent-h); color: white; }
		.btn-danger { background: rgba(248,113,113,.12); border-color: rgba(248,113,113,.35); color: var(--danger); }
		.btn-danger:hover { background: rgba(248,113,113,.2); border-color: rgba(248,113,113,.5); }
		.btn-sm { padding: .38rem .75rem; font-size: .8rem; border-radius: .55rem; }
		/* ── Table ── */
		table { width: 100%; border-collapse: collapse; }
		th, td { text-align: left; padding: .7rem .6rem; border-bottom: 1px solid var(--border-soft); font-size: .88rem; }
		th { color: var(--muted); font-size: .75rem; text-transform: uppercase; letter-spacing: .07em; font-weight: 600; }
		/* ── Alerts ── */
		.alert { padding: .75rem 1rem; border-radius: .72rem; font-size: .88rem; }
		.alert-success { background: rgba(52,211,153,.08); border: 1px solid rgba(52,211,153,.25); color: #34D399; }
		.alert-error { background: rgba(248,113,113,.08); border: 1px solid rgba(248,113,113,.25); color: #F87171; }
		.alert-info { background: rgba(108,99,255,.08); border: 1px solid rgba(108,99,255,.25); color: #A7A7BD; }
		/* ── Divider ── */
		.divider { border: none; border-top: 1px solid var(--border); margin: 1.25rem 0; }
	</style>
</head>
<body>
	${variant === "marketing" ? "" : `
	<nav class="topnav">
		<div class="nav-left">
			<a href="/" class="nav-brand">
				<img src="/logo.webp" alt="SapphireVault logo" />
				<span class="nav-brand-text">Sapphire<span>Vault</span></span>
			</a>
		</div>
		<div class="nav-right">
			${adminLink}
			${session
				? `<span class="badge">${session.email}</span><a class="nav-link" href="/logout">Log out</a>`
				: `<a class="nav-link" href="/dashboard">Log in</a>`
			}
		</div>
	</nav>
	`}
	<main>
		<div class="container">${content}</div>
	</main>
</body>
</html>`;

	return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
