import type { Session } from "../session";
import { appShell } from "./appshell";

export function sharedPage(session: Session): Response {
	return appShell(session, {
		title: "SapphireVault — Shared",
		active: "shared",
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
			.coming-sub { color: #5A5A72; font-size: .88rem; max-width: 36ch; line-height: 1.65; }
			.feature-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: .85rem; margin-top: 1.5rem; width: 100%; }
			.feature-item {
				border: 1px solid #2A2A3C; border-radius: .95rem;
				background: rgba(15,15,19,.6); padding: 1rem;
				display: flex; align-items: flex-start; gap: .7rem;
			}
			.feature-icon { font-size: 1.2rem; flex-shrink: 0; }
			.feature-text strong { display: block; font-size: .85rem; font-weight: 700; margin-bottom: .2rem; }
			.feature-text span { font-size: .78rem; color: #5A5A72; line-height: 1.45; }
		</style>

		<div class="page-hd">
			<div class="page-title">Shared</div>
			<div class="page-sub">Files and items shared with you or by you</div>
		</div>

		<div class="coming-card">
			<div class="coming-icon">↗</div>
			<div class="coming-title">Shared files — coming soon</div>
			<div class="coming-sub">Share files and folders with others via secure links. Control access, set expiry, and revoke at any time.</div>

			<div class="feature-list">
				<div class="feature-item">
					<div class="feature-icon">🔗</div>
					<div class="feature-text"><strong>Shareable links</strong><span>Generate time-limited links with optional password protection</span></div>
				</div>
				<div class="feature-item">
					<div class="feature-icon">👥</div>
					<div class="feature-text"><strong>Share with users</strong><span>Share directly with other SapphireVault users</span></div>
				</div>
				<div class="feature-item">
					<div class="feature-icon">⏱</div>
					<div class="feature-text"><strong>Expiry control</strong><span>Set links to expire after a time or number of views</span></div>
				</div>
				<div class="feature-item">
					<div class="feature-icon">🛡</div>
					<div class="feature-text"><strong>Access revocation</strong><span>Revoke any shared link instantly from your dashboard</span></div>
				</div>
			</div>
		</div>
		`,
	});
}
