import type { Session } from "../session";
import { appShell } from "./appshell";

export function activityPage(session: Session): Response {
	return appShell(session, {
		title: "SapphireVault — Activity",
		active: "activity",
		content: `
		<style>
			.page-hd { margin-bottom: 1.5rem; }
			.page-title { font-size: 1.45rem; font-weight: 900; letter-spacing: -.025em; }
			.page-sub { color: #7A7A92; font-size: .85rem; margin-top: .2rem; }
			.coming-card {
				border: 1px dashed #2A2A3C; border-radius: 1.25rem;
				background: rgba(22,22,32,.5); padding: 4rem 2rem;
				text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem;
			}
			.coming-icon { font-size: 3.5rem; opacity: .5; }
			.coming-title { font-size: 1.15rem; font-weight: 800; letter-spacing: -.02em; color: #C4C4D4; }
			.coming-sub { color: #5A5A72; font-size: .88rem; max-width: 38ch; line-height: 1.65; }
			.preview-log { width: 100%; max-width: 520px; margin-top: .5rem; border: 1px solid #2A2A3C; border-radius: .85rem; overflow: hidden; }
			.log-hd { padding: .65rem 1rem; background: rgba(15,15,19,.7); border-bottom: 1px solid #2A2A3C; font-size: .72rem; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: #4A4A62; }
			.log-row { display: flex; align-items: center; gap: .75rem; padding: .7rem 1rem; border-bottom: 1px solid #1A1A2A; font-size: .82rem; color: #5A5A72; }
			.log-row:last-child { border-bottom: none; }
			.log-dot { width: 8px; height: 8px; border-radius: 999px; flex-shrink: 0; }
			.log-time { margin-left: auto; font-size: .72rem; }
		</style>

		<div class="page-hd">
			<div class="page-title">Activity</div>
			<div class="page-sub">A log of all actions across your vault</div>
		</div>

		<div class="coming-card">
			<div class="coming-icon">◷</div>
			<div class="coming-title">Activity log — coming soon</div>
			<div class="coming-sub">Track every upload, download, deletion, and password change with timestamps and details.</div>

			<div class="preview-log">
				<div class="log-hd">Preview · Recent events</div>
				<div class="log-row"><div class="log-dot" style="background:#34D399;"></div> Uploaded "photo.jpg"<div class="log-time">2m ago</div></div>
				<div class="log-row"><div class="log-dot" style="background:#6C63FF;"></div> Vault encrypted & saved<div class="log-time">1h ago</div></div>
				<div class="log-row"><div class="log-dot" style="background:#FBB040;"></div> Downloaded "report.pdf"<div class="log-time">3h ago</div></div>
				<div class="log-row"><div class="log-dot" style="background:#F87171;"></div> Deleted "old-backup.zip"<div class="log-time">1d ago</div></div>
				<div class="log-row"><div class="log-dot" style="background:#34D399;"></div> Uploaded "video.mp4"<div class="log-time">2d ago</div></div>
			</div>
		</div>
		`,
	});
}
