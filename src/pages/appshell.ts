import type { Session } from "../session";
import { layout } from "./layout";

type Tab =
	| "dashboard"
	| "files"
	| "photos"
	| "passwords"
	| "shared"
	| "activity"
	| "favorites"
	| "trash"
	| "settings";

const TAB_META: Record<Tab, { label: string; href: string; icon: string }> = {
	dashboard: { label: "Dashboard", href: "/dashboard", icon: "⌂" },
	files: { label: "Files", href: "/vault", icon: "⧉" },
	photos: { label: "Photos", href: "/photos", icon: "▦" },
	passwords: { label: "Passwords", href: "/passwords", icon: "⚷" },
	shared: { label: "Shared", href: "/shared", icon: "⇄" },
	activity: { label: "Activity", href: "/activity", icon: "◷" },
	favorites: { label: "Favorites", href: "/favorites", icon: "★" },
	trash: { label: "Trash", href: "/trash", icon: "⌫" },
	settings: { label: "Settings", href: "/profile", icon: "⚙" },
};

export function appShell(session: Session, opts: { title: string; active: Tab; content: string }): Response {
	const links = (Object.keys(TAB_META) as Tab[])
		.map((k) => {
			const t = TAB_META[k];
			const active = k === opts.active;
			return `<a class="slink ${active ? "active" : ""}" href="${t.href}"><span class="ico">${t.icon}</span><span class="lbl">${t.label}</span></a>`;
		})
		.join("");

	return layout({
		title: opts.title,
		session,
		active: "dashboard",
		content: `
			<style>
				:root { --sbw: 270px; }
				.appgrid { display:grid; grid-template-columns: var(--sbw) 1fr; gap: 1.25rem; align-items:start; }
				@media (max-width: 980px){ .appgrid { grid-template-columns: 1fr; } }

				.sidebar { position: sticky; top: 84px; height: calc(100vh - 110px); border:1px solid #2A2A3C; border-radius: 1.25rem; background: rgba(26,26,36,.55); overflow:hidden; }
				@media (max-width: 980px){
					.sidebar { position: relative; top: 0; height: auto; }
					.sbnav { grid-template-columns: 1fr 1fr; }
					.slink { justify-content:center; }
					.lbl { display:none; }
				}
				.sbhead { padding: 1.1rem 1.1rem .8rem; border-bottom:1px solid #1E1E2E; }
				.brand { font-weight: 900; letter-spacing: -.02em; }
				.brand small { display:block; color:#7A7A92; font-weight:600; margin-top:.25rem; }
				.sbnav { padding: .65rem; display:grid; gap:.25rem; }
				.slink { display:flex; align-items:center; gap:.8rem; padding:.65rem .75rem; border-radius: .95rem; text-decoration:none; color:#A7A7BD; border:1px solid transparent; transition: background .14s ease, border-color .14s ease, transform .14s ease, color .14s ease; }
				.slink:hover { background: rgba(255,255,255,.03); border-color:#2A2A3C; color:#E4E4ED; transform: translateY(-1px); }
				.slink.active { background: rgba(108,99,255,.14); border-color: rgba(108,99,255,.35); color:#E4E4ED; }
				.ico { width: 24px; height: 24px; display:grid; place-items:center; border-radius: 10px; background: rgba(15,15,19,.6); border: 1px solid #2A2A3C; color:#E4E4ED; font-size: .9rem; }
				.slink.active .ico { background: rgba(108,99,255,.18); border-color: rgba(108,99,255,.35); }
				@media (max-width: 980px){ .sidebar { position:relative; top:0; height:auto; } }

				.maincol { display:grid; gap: 1rem; }
				.topbar { display:flex; justify-content:space-between; align-items:center; gap: .75rem; flex-wrap:wrap; }
				.search { flex: 1 1 320px; display:flex; align-items:center; gap:.6rem; padding:.65rem .8rem; border-radius:1rem; border:1px solid #2A2A3C; background: rgba(15,15,19,.55); }
				.search input { width:100%; background:transparent; border:none; outline:none; color:#E4E4ED; font-size:.95rem; }
				.kbd { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size:.8rem; padding:.12rem .42rem; border-radius:.55rem; border:1px solid #2A2A3C; background: rgba(255,255,255,.03); color:#A7A7BD; }
			</style>

			<div class="appgrid">
				<aside class="sidebar">
					<div class="sbhead">
						<div class="brand">SapphireVault<small>Secure storage</small></div>
					</div>
					<nav class="sbnav">${links}</nav>
				</aside>

				<section class="maincol">
					<div class="topbar">
						<div class="search" title="Search (coming soon)">
							<span style="opacity:.8">⌕</span>
							<input placeholder="Search files & passwords…" disabled />
							<span class="kbd">⌘K</span>
						</div>
						<div class="row">
							<a class="btn" href="/vault">Upload</a>
							<a class="btn btn-primary" href="/passwords">Add password</a>
						</div>
					</div>

					${opts.content}
				</section>
			</div>
		`,
	});
}
