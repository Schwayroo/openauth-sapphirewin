import type { Session } from "../session";
import { appShell } from "./appshell";

export function dashboardPage(session: Session, stats: { fileCount: number; recentUploads: number; hasVault: boolean }): Response {
	return appShell(session, {
		title: "SapphireVault — Dashboard",
		active: "dashboard",
		content: `
			<style>
				.kpis { display:grid; grid-template-columns: repeat(12, 1fr); gap: 1rem; }
				.kpi { grid-column: span 3; border:1px solid #2A2A3C; border-radius: 1.25rem; background: rgba(26,26,36,.55); padding: 1.05rem; }
				.kpi .n { font-weight: 900; font-size: 1.35rem; letter-spacing:-.02em; }
				.kpi .l { color:#A7A7BD; margin-top:.2rem; }
				@media (max-width: 980px){ .kpi { grid-column: span 6; } }
				@media (max-width: 560px){ .kpi { grid-column: span 12; } }
				.section { border:1px solid #2A2A3C; border-radius:1.25rem; background: rgba(26,26,36,.45); padding: 1.15rem; }
				.section h2 { font-size:1rem; margin-bottom:.65rem; }
				.empty { color:#A7A7BD; }
			</style>

			<div class="kpis">
				<div class="kpi"><div class="n">${stats.fileCount}</div><div class="l">Files stored</div></div>
				<div class="kpi"><div class="n">${stats.recentUploads}</div><div class="l">Uploads (7d)</div></div>
				<div class="kpi"><div class="n">${stats.hasVault ? "Yes" : "No"}</div><div class="l">Password vault</div></div>
				<div class="kpi"><div class="n">Private</div><div class="l">Per-user access</div></div>
			</div>

			<div class="section" style="margin-top:1rem;">
				<h2>Quick actions</h2>
				<div class="row">
					<a class="btn btn-primary" href="/vault">Upload file</a>
					<a class="btn" href="/passwords">Open passwords</a>
					<a class="btn" href="/profile">Settings</a>
				</div>
			</div>

			<div class="section" style="margin-top:1rem;">
				<h2>Recent activity</h2>
				<div class="empty">Coming next: recent uploads, deletes, password edits.</div>
			</div>
		`,
	});
}
