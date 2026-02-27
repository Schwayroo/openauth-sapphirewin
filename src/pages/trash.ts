import type { Session } from "../session";
import { appShell } from "./appshell";

export function trashPage(session: Session): Response {
	return appShell(session, {
		title: "SapphireVault — Trash",
		active: "trash",
		content: `
		<style>
			.page-hd { margin-bottom: 1.5rem; }
			.page-title { font-size: 1.45rem; font-weight: 900; letter-spacing: -.025em; }
			.page-sub { color: #7A7A92; font-size: .85rem; margin-top: .2rem; }
			.coming-card {
				border: 1px dashed rgba(248,113,113,.2); border-radius: 1.25rem;
				background: rgba(248,113,113,.03); padding: 4rem 2rem;
				text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem;
			}
			.coming-icon { font-size: 3.5rem; opacity: .5; }
			.coming-title { font-size: 1.15rem; font-weight: 800; letter-spacing: -.02em; color: #C4C4D4; }
			.coming-sub { color: #5A5A72; font-size: .88rem; max-width: 40ch; line-height: 1.65; }
			.trash-features { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: .85rem; margin-top: .5rem; width: 100%; }
			.trash-feature {
				border: 1px solid rgba(248,113,113,.15); border-radius: .85rem;
				background: rgba(248,113,113,.04); padding: .95rem;
				text-align: left; display: flex; gap: .65rem;
			}
			.tf-icon { font-size: 1.1rem; flex-shrink: 0; }
			.tf-text strong { display: block; font-size: .82rem; font-weight: 700; margin-bottom: .18rem; color: #C4C4D4; }
			.tf-text span { font-size: .75rem; color: #5A5A72; line-height: 1.45; }
			.note {
				border: 1px solid rgba(248,113,113,.2); border-radius: .75rem;
				background: rgba(248,113,113,.05); padding: .75rem 1rem;
				font-size: .82rem; color: #F87171; display: flex; gap: .5rem; align-items: flex-start;
				margin-top: .5rem; width: 100%;
			}
		</style>

		<div class="page-hd">
			<div class="page-title">Trash</div>
			<div class="page-sub">Deleted files are permanently removed immediately</div>
		</div>

		<div class="coming-card">
			<div class="coming-icon">🗑</div>
			<div class="coming-title">Trash bin — coming soon</div>
			<div class="coming-sub">Deleted files will move here first. Restore them within 30 days, or permanently purge them when you're ready.</div>

			<div class="note">
				⚠️ Currently, file deletion is permanent and immediate. Trash / recovery is coming in a future update.
			</div>

			<div class="trash-features">
				<div class="trash-feature">
					<div class="tf-icon">♻️</div>
					<div class="tf-text"><strong>30-day recovery</strong><span>Restore any deleted file within 30 days of deletion</span></div>
				</div>
				<div class="trash-feature">
					<div class="tf-icon">🔥</div>
					<div class="tf-text"><strong>Permanent purge</strong><span>Clear the trash bin to free up storage space</span></div>
				</div>
				<div class="trash-feature">
					<div class="tf-icon">🔍</div>
					<div class="tf-text"><strong>Search deleted files</strong><span>Find specific files in trash by name or type</span></div>
				</div>
			</div>
		</div>
		`,
	});
}
