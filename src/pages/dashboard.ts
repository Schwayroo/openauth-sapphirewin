import type { Session } from "../session";
import { layout } from "./layout";

export function dashboardPage(session: Session): Response {
	return layout({
		title: "SapphireVault — Home",
		session,
		active: "dashboard",
		content: `
			<div class="card">
				<div class="h1">SapphireVault</div>
				<div class="p">Private, encrypted vault for passwords + files.</div>
				<div class="row">
					<a class="btn btn-primary" href="/vault">Open Vault</a>
					<a class="btn" href="/profile">Account</a>
				</div>
			</div>

			<div class="grid" style="margin-top:1rem;">
				<div class="card">
					<div style="font-weight:700; margin-bottom:.35rem;">Files</div>
					<div class="small">Upload, preview, download. (R2-backed)</div>
				</div>
				<div class="card">
					<div style="font-weight:700; margin-bottom:.35rem;">Passwords</div>
					<div class="small">Zero-knowledge vault (client-side encryption). Next step: UI + crypto.</div>
				</div>
				<div class="card">
					<div style="font-weight:700; margin-bottom:.35rem;">Telegram mirror (optional)</div>
					<div class="small">When enabled, uploads can be forwarded by bot.</div>
				</div>
			</div>
		`,
	});
}
