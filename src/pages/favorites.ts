import type { Session } from "../session";
import { appShell } from "./appshell";

export function favoritesPage(session: Session): Response {
	return appShell(session, {
		title: "SapphireVault — Favorites",
		active: "favorites",
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
			.fav-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: .85rem; width: 100%; margin-top: .5rem; }
			.fav-placeholder {
				aspect-ratio: 1; border: 1px solid #2A2A3C; border-radius: .85rem;
				background: rgba(15,15,19,.5); display: flex; flex-direction: column;
				align-items: center; justify-content: center; gap: .4rem;
				font-size: 1.75rem; color: #3A3A4C;
			}
			.fav-placeholder span { font-size: .72rem; color: #3A3A4C; }
		</style>

		<div class="page-hd">
			<div class="page-title">Favorites</div>
			<div class="page-sub">Your starred files and passwords</div>
		</div>

		<div class="coming-card">
			<div class="coming-icon">★</div>
			<div class="coming-title">Favorites — coming soon</div>
			<div class="coming-sub">Star any file or password entry to add it here for quick access. Keep your most important items one click away.</div>

			<div class="fav-grid">
				<div class="fav-placeholder">🖼<span>Photo</span></div>
				<div class="fav-placeholder">📄<span>Document</span></div>
				<div class="fav-placeholder">🔑<span>Password</span></div>
				<div class="fav-placeholder">🎞<span>Video</span></div>
			</div>
		</div>
		`,
	});
}
