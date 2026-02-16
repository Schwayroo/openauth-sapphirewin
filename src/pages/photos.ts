import type { Session } from "../session";
import { appShell } from "./appshell";
import type { VaultFileRow } from "../vault";

export function photosPage(session: Session, files: VaultFileRow[]): Response {
	const items = files
		.map((f) => {
			const thumb = `/vault/${f.id}/thumb`;
			const isVideo = (f.mime_type ?? "").toLowerCase().startsWith("video/");
			return `
			<a class="ph" href="/vault/${f.id}" title="${f.file_name}">
				${isVideo ? `<video src="${thumb}" muted playsinline preload="metadata"></video>` : `<img src="${thumb}" loading="lazy" alt="" />`}
				<div class="cap">${f.file_name}</div>
			</a>
		`;
		})
		.join("");

	return appShell(session, {
		title: "SapphireVault — Photos",
		active: "photos",
		content: `
			<style>
				.gallery { border:1px solid #2A2A3C; border-radius: 1.25rem; background: rgba(26,26,36,.45); padding: 1.15rem; }
				.gallery h1 { font-size: 1.1rem; margin-bottom: .25rem; }
				.gallery .sub { color:#A7A7BD; margin-bottom: 1rem; }
				.grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 1rem; }
				.ph { border:1px solid #2A2A3C; border-radius: 1rem; overflow:hidden; background: rgba(15,15,19,.55); text-decoration:none; color:#E4E4ED; transition: transform .14s ease, border-color .14s ease, background .14s ease; }
				.ph:hover { transform: translateY(-2px); border-color: rgba(108,99,255,.45); background: rgba(15,15,19,.75); }
				.ph img, .ph video { width:100%; height: 160px; object-fit: cover; display:block; background:#0F0F13; }
				.cap { padding: .7rem .8rem; font-weight: 700; white-space: nowrap; overflow:hidden; text-overflow:ellipsis; }
			</style>

			<div class="gallery">
				<h1>Photos</h1>
				<div class="sub">Gallery view of your image/video uploads. (Timeline/albums coming next.)</div>
				<div class="grid">
					${items || `<div class="small" style="color:#A7A7BD;">No photos/videos yet. Upload in Files.</div>`}
				</div>
			</div>
		`,
	});
}
