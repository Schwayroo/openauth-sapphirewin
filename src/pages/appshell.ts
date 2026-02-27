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

const ICONS: Record<Tab, string> = {
	dashboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
	files:     `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>`,
	photos:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`,
	passwords: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`,
	shared:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
	activity:  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
	favorites: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
	trash:     `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>`,
	settings:  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
};

const TAB_META: Record<Tab, { label: string; href: string }> = {
	dashboard: { label: "Dashboard",  href: "/dashboard" },
	files:     { label: "Files",      href: "/vault" },
	photos:    { label: "Photos",     href: "/photos" },
	passwords: { label: "Passwords",  href: "/passwords" },
	shared:    { label: "Shared",     href: "/shared" },
	activity:  { label: "Activity",   href: "/activity" },
	favorites: { label: "Favorites",  href: "/favorites" },
	trash:     { label: "Trash",      href: "/trash" },
	settings:  { label: "Settings",   href: "/profile" },
};

const SEARCH_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
const UPLOAD_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`;
const PLUS_ICON   = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;

export function appShell(session: Session, opts: { title: string; active: Tab; content: string }): Response {
	const mainNav: Tab[] = ["dashboard", "files", "photos", "passwords", "shared"];
	const bottomNav: Tab[] = ["activity", "favorites", "trash", "settings"];

	const renderLinks = (tabs: Tab[]) =>
		tabs.map((k) => {
			const t = TAB_META[k];
			const isActive = k === opts.active;
			return `<a class="slink${isActive ? " active" : ""}" href="${t.href}">
				<span class="slink-icon">${ICONS[k]}</span>
				<span class="slink-lbl">${t.label}</span>
			</a>`;
		}).join("");

	const avatarInitial = (session.email ?? "U")[0].toUpperCase();

	return layout({
		title: opts.title,
		session,
		active: "dashboard",
		content: `
			<style>
				:root { --sbw: 248px; }
				/* ── App Grid ── */
				.appgrid {
					display: grid;
					grid-template-columns: var(--sbw) 1fr;
					gap: 1.25rem;
					align-items: start;
					min-height: calc(100vh - 64px);
				}
				@media (max-width: 1000px) { .appgrid { grid-template-columns: 1fr; } }

				/* ── Sidebar ── */
				.sidebar {
					position: sticky; top: 80px;
					height: calc(100vh - 96px);
					border: 1px solid #2A2A3C;
					border-radius: 1.1rem;
					background: rgba(20,20,30,.7);
					backdrop-filter: blur(8px);
					display: flex; flex-direction: column;
					overflow: hidden;
				}
				@media (max-width: 1000px) {
					.sidebar { position: relative; top: 0; height: auto; }
					.sbnav { display: grid !important; grid-template-columns: repeat(5, 1fr); }
					.slink-lbl { display: none; }
					.sb-bottom { display: none; }
					.sb-user { display: none; }
				}

				/* Sidebar header */
				.sb-head {
					padding: 1rem 1rem .75rem;
					border-bottom: 1px solid #1E1E2E;
					display: flex; align-items: center; gap: .6rem;
				}
				.sb-logo { width: 30px; height: 30px; object-fit: contain; }
				.sb-brand { font-weight: 900; font-size: .95rem; letter-spacing: -.02em; color: #6C63FF; }
				.sb-brand span { color: #E4E4ED; }
				.sb-tagline { font-size: .7rem; color: #5A5A72; margin-top: .05rem; }

				/* Sidebar nav */
				.sbnav { padding: .5rem; display: flex; flex-direction: column; gap: .18rem; flex: 1; overflow-y: auto; }
				.sbnav::-webkit-scrollbar { width: 3px; }
				.sbnav::-webkit-scrollbar-thumb { background: #2A2A3C; border-radius: 2px; }

				.slink {
					display: flex; align-items: center; gap: .7rem;
					padding: .58rem .75rem; border-radius: .75rem;
					text-decoration: none; color: #7A7A92;
					border: 1px solid transparent;
					transition: all .14s ease; font-size: .875rem; font-weight: 500;
				}
				.slink:hover { background: rgba(255,255,255,.04); border-color: #2A2A3C; color: #C4C4D4; transform: translateX(2px); }
				.slink.active { background: rgba(108,99,255,.12); border-color: rgba(108,99,255,.3); color: #E4E4ED; }
				.slink-icon {
					width: 30px; height: 30px; border-radius: .55rem;
					display: flex; align-items: center; justify-content: center;
					background: rgba(15,15,19,.6); border: 1px solid #252535;
					flex-shrink: 0; transition: all .14s ease;
				}
				.slink.active .slink-icon { background: rgba(108,99,255,.18); border-color: rgba(108,99,255,.35); color: #A7A7FF; }

				/* Section separator */
				.sb-sep { height: 1px; background: #1E1E2E; margin: .35rem .5rem; }

				/* Sidebar bottom */
				.sb-bottom { padding: .5rem; border-top: 1px solid #1E1E2E; display: flex; flex-direction: column; gap: .18rem; }
				.sb-user {
					display: flex; align-items: center; gap: .65rem;
					padding: .6rem .75rem; border-radius: .75rem;
					background: rgba(15,15,19,.5); border: 1px solid #1E1E2E;
					margin: .5rem;
				}
				.sb-avatar {
					width: 30px; height: 30px; border-radius: 999px;
					background: linear-gradient(135deg, #6C63FF, #a78bfa);
					display: flex; align-items: center; justify-content: center;
					font-size: .8rem; font-weight: 700; color: white; flex-shrink: 0;
				}
				.sb-user-info { min-width: 0; flex: 1; }
				.sb-user-name { font-size: .8rem; font-weight: 600; color: #C4C4D4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
				.sb-user-role { font-size: .7rem; color: #5A5A72; }

				/* ── Main column ── */
				.maincol { display: flex; flex-direction: column; gap: 1rem; min-width: 0; }

				/* ── Top bar ── */
				.topbar {
					display: flex; justify-content: space-between; align-items: center;
					gap: .75rem; flex-wrap: wrap;
				}
				.search-box {
					flex: 1 1 280px; display: flex; align-items: center; gap: .6rem;
					padding: .58rem .85rem; border-radius: .8rem;
					border: 1px solid #2A2A3C; background: rgba(15,15,19,.6);
					transition: border-color .15s, box-shadow .15s;
				}
				.search-box:focus-within { border-color: rgba(108,99,255,.5); box-shadow: 0 0 0 3px rgba(108,99,255,.1); }
				.search-box input { width: 100%; background: transparent; border: none; outline: none; color: #E4E4ED; font-size: .88rem; }
				.search-box input::placeholder { color: #4A4A62; }
				.search-icon { color: #4A4A62; flex-shrink: 0; display: flex; }
				.kbd {
					font-family: ui-monospace, monospace; font-size: .72rem;
					padding: .1rem .38rem; border-radius: .4rem;
					border: 1px solid #2A2A3C; background: rgba(255,255,255,.03); color: #4A4A62;
					flex-shrink: 0;
				}
				.topbar-actions { display: flex; gap: .5rem; flex-shrink: 0; }
			</style>

			<div class="appgrid">
				<!-- ─── Sidebar ─── -->
				<aside class="sidebar">
					<div class="sb-head">
						<img src="/logo.webp" alt="logo" class="sb-logo" />
						<div>
							<div class="sb-brand">Sapphire<span>Vault</span></div>
							<div class="sb-tagline">Secure storage</div>
						</div>
					</div>

					<nav class="sbnav">
						${renderLinks(mainNav)}
						<div class="sb-sep"></div>
						${renderLinks(bottomNav)}
					</nav>

					<div class="sb-user">
						<div class="sb-avatar">${avatarInitial}</div>
						<div class="sb-user-info">
							<div class="sb-user-name">${session.username ?? session.email.split("@")[0]}</div>
							<div class="sb-user-role">${session.role}</div>
						</div>
					</div>
				</aside>

				<!-- ─── Main column ─── -->
				<section class="maincol">
					<div class="topbar">
						<div class="search-box">
							<span class="search-icon">${SEARCH_ICON}</span>
							<input placeholder="Search files, passwords…" disabled title="Search coming soon" />
							<span class="kbd">⌘K</span>
						</div>
						<div class="topbar-actions">
							<a class="btn" href="/vault">${UPLOAD_ICON} Upload</a>
							<a class="btn btn-primary" href="/passwords">${PLUS_ICON} New password</a>
						</div>
					</div>

					${opts.content}
				</section>
			</div>
		`,
	});
}
