import type { Session } from "../session";
import { appShell } from "./appshell";

export function dashboardPage(session: Session, stats: { fileCount: number; recentUploads: number; hasVault: boolean }): Response {
	const greeting = (() => {
		const h = new Date().getUTCHours();
		if (h < 12) return "Good morning";
		if (h < 18) return "Good afternoon";
		return "Good evening";
	})();

	const displayName = session.username ?? session.email.split("@")[0];

	return appShell(session, {
		title: "SapphireVault — Dashboard",
		active: "dashboard",
		content: `
		<style>
			/* ── Greeting ── */
			.greeting { margin-bottom: 1.25rem; }
			.greeting-line { font-size: 1.55rem; font-weight: 900; letter-spacing: -.03em; }
			.greeting-sub { color: #7A7A92; margin-top: .25rem; font-size: .9rem; }

			/* ── KPI grid ── */
			.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
			@media (max-width: 900px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
			@media (max-width: 500px)  { .kpi-grid { grid-template-columns: 1fr; } }
			.kpi {
				border: 1px solid #2A2A3C; border-radius: 1.1rem;
				background: linear-gradient(145deg, rgba(26,26,36,.95), rgba(20,20,30,.85));
				padding: 1.15rem 1.2rem;
				transition: transform .15s ease, border-color .15s ease;
			}
			.kpi:hover { transform: translateY(-2px); border-color: rgba(108,99,255,.35); }
			.kpi-icon {
				width: 36px; height: 36px; border-radius: .7rem;
				display: flex; align-items: center; justify-content: center;
				font-size: 1rem; margin-bottom: .85rem;
			}
			.kpi-n { font-size: 1.8rem; font-weight: 900; letter-spacing: -.03em; line-height: 1; margin-bottom: .3rem; }
			.kpi-l { color: #7A7A92; font-size: .8rem; font-weight: 500; }
			.kpi-delta { display: inline-flex; align-items: center; gap: .25rem; font-size: .75rem; margin-top: .4rem; padding: .18rem .45rem; border-radius: 999px; }
			.delta-up   { background: rgba(52,211,153,.1); color: #34D399; border: 1px solid rgba(52,211,153,.2); }
			.delta-info { background: rgba(108,99,255,.1); color: #A7A7FF; border: 1px solid rgba(108,99,255,.2); }
			.delta-ok   { background: rgba(245,158,11,.1); color: #FBB040; border: 1px solid rgba(245,158,11,.2); }
			.delta-none { background: rgba(122,122,146,.08); color: #7A7A92; border: 1px solid #2A2A3C; }

			/* ── Two-col layout ── */
			.dash-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
			@media (max-width: 700px) { .dash-cols { grid-template-columns: 1fr; } }

			/* ── Section cards ── */
			.sec-card { border: 1px solid #2A2A3C; border-radius: 1.1rem; background: rgba(22,22,32,.8); padding: 1.2rem; }
			.sec-card-hd { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
			.sec-card-title { font-size: .95rem; font-weight: 700; letter-spacing: -.01em; }
			.sec-card-link { font-size: .8rem; color: #6C63FF; text-decoration: none; }
			.sec-card-link:hover { text-decoration: underline; }

			/* ── Quick actions ── */
			.qa-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .65rem; }
			.qa {
				display: flex; align-items: center; gap: .7rem;
				padding: .8rem .9rem; border-radius: .85rem;
				border: 1px solid #2A2A3C; background: rgba(15,15,19,.5);
				text-decoration: none; color: #C4C4D4; font-weight: 600; font-size: .85rem;
				transition: all .15s ease;
			}
			.qa:hover { border-color: rgba(108,99,255,.45); background: rgba(108,99,255,.07); color: #E4E4ED; transform: translateY(-1px); }
			.qa-icon {
				width: 34px; height: 34px; border-radius: .6rem;
				display: flex; align-items: center; justify-content: center;
				background: rgba(108,99,255,.12); border: 1px solid rgba(108,99,255,.2);
				font-size: 1rem; flex-shrink: 0;
			}

			/* ── Activity placeholder ── */
			.act-empty {
				display: flex; flex-direction: column; align-items: center;
				padding: 2rem 1rem; color: #4A4A62; text-align: center; gap: .5rem;
			}
			.act-empty-icon { font-size: 2rem; opacity: .5; }
			.act-item {
				display: flex; align-items: center; gap: .75rem;
				padding: .7rem 0; border-bottom: 1px solid #1A1A2A; font-size: .875rem;
			}
			.act-item:last-child { border-bottom: none; }
			.act-dot {
				width: 8px; height: 8px; border-radius: 999px;
				background: #6C63FF; flex-shrink: 0;
			}
			.act-text { flex: 1; color: #C4C4D4; }
			.act-time { color: #4A4A62; font-size: .78rem; white-space: nowrap; }

			/* ── Storage bar ── */
			.storage-bar-wrap { margin-top: .75rem; }
			.storage-label { display: flex; justify-content: space-between; font-size: .78rem; color: #7A7A92; margin-bottom: .45rem; }
			.storage-bar { height: 6px; border-radius: 999px; background: #1E1E2E; overflow: hidden; }
			.storage-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #6C63FF, #a78bfa); transition: width .8s ease; }
		</style>

		<!-- ─── Greeting ─── -->
		<div class="greeting">
			<div class="greeting-line">${greeting}, ${displayName} 👋</div>
			<div class="greeting-sub">Here's what's going on with your vault today.</div>
		</div>

		<!-- ─── KPIs ─── -->
		<div class="kpi-grid">
			<div class="kpi">
				<div class="kpi-icon" style="background:rgba(108,99,255,.12);border:1px solid rgba(108,99,255,.22);">📁</div>
				<div class="kpi-n">${stats.fileCount}</div>
				<div class="kpi-l">Files stored</div>
				<div class="kpi-delta delta-info">total</div>
			</div>
			<div class="kpi">
				<div class="kpi-icon" style="background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.2);">⬆</div>
				<div class="kpi-n">${stats.recentUploads}</div>
				<div class="kpi-l">Uploads this week</div>
				<div class="kpi-delta ${stats.recentUploads > 0 ? "delta-up" : "delta-none"}">${stats.recentUploads > 0 ? "↑ active" : "none yet"}</div>
			</div>
			<div class="kpi">
				<div class="kpi-icon" style="background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.2);">🔒</div>
				<div class="kpi-n">${stats.hasVault ? "On" : "Off"}</div>
				<div class="kpi-l">Password vault</div>
				<div class="kpi-delta ${stats.hasVault ? "delta-ok" : "delta-none"}">${stats.hasVault ? "encrypted" : "not set up"}</div>
			</div>
			<div class="kpi">
				<div class="kpi-icon" style="background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.22);">🛡</div>
				<div class="kpi-n">Private</div>
				<div class="kpi-l">Access level</div>
				<div class="kpi-delta delta-info">per-user</div>
			</div>
		</div>

		<!-- ─── Two-col section ─── -->
		<div class="dash-cols">
			<!-- Quick actions -->
			<div class="sec-card">
				<div class="sec-card-hd">
					<div class="sec-card-title">Quick actions</div>
				</div>
				<div class="qa-grid">
					<a class="qa" href="/vault">
						<div class="qa-icon">📤</div> Upload file
					</a>
					<a class="qa" href="/passwords">
						<div class="qa-icon">🔑</div> Passwords
					</a>
					<a class="qa" href="/photos">
						<div class="qa-icon">🖼</div> Photos
					</a>
					<a class="qa" href="/profile">
						<div class="qa-icon">⚙</div> Settings
					</a>
					<a class="qa" href="/shared">
						<div class="qa-icon">↗</div> Shared
					</a>
					<a class="qa" href="/favorites">
						<div class="qa-icon">⭐</div> Favorites
					</a>
				</div>
			</div>

			<!-- Storage + recent activity -->
			<div style="display:flex;flex-direction:column;gap:1rem;">
				<div class="sec-card">
					<div class="sec-card-hd">
						<div class="sec-card-title">Storage</div>
						<a class="sec-card-link" href="/vault">View all →</a>
					</div>
					<div class="storage-bar-wrap">
						<div class="storage-label">
							<span>${stats.fileCount} file${stats.fileCount !== 1 ? "s" : ""}</span>
							<span>Cloudflare R2</span>
						</div>
						<div class="storage-bar">
							<div class="storage-fill" style="width:${Math.min(stats.fileCount * 4, 85)}%;"></div>
						</div>
					</div>
				</div>

				<div class="sec-card" style="flex:1;">
					<div class="sec-card-hd">
						<div class="sec-card-title">Recent activity</div>
						<a class="sec-card-link" href="/activity">View all →</a>
					</div>
					${stats.recentUploads > 0
						? `<div class="act-item"><div class="act-dot"></div><div class="act-text">You uploaded ${stats.recentUploads} file${stats.recentUploads !== 1 ? "s" : ""} this week</div><div class="act-time">7d</div></div>`
						: `<div class="act-empty"><div class="act-empty-icon">◷</div><div>No recent activity</div><div style="font-size:.78rem;color:#4A4A62;">Upload a file to get started</div></div>`
					}
				</div>
			</div>
		</div>

		<!-- ─── Vault status ─── -->
		${!stats.hasVault ? `
		<div style="border:1px solid rgba(108,99,255,.3);border-radius:1.1rem;background:rgba(108,99,255,.06);padding:1.2rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;">
			<div>
				<div style="font-weight:700;margin-bottom:.25rem;">🔒 Set up your password vault</div>
				<div style="color:#7A7A92;font-size:.85rem;">Store all your passwords encrypted with zero-knowledge AES-256 encryption.</div>
			</div>
			<a class="btn btn-primary" href="/passwords">Set up vault →</a>
		</div>
		` : ""}
		`,
	});
}
