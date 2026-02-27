import type { Session } from "../session";
import { appShell } from "./appshell";
import type { VaultFileRow } from "../vault";

function escapeHtml(s: string) {
	return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}

export function photosPage(session: Session, files: VaultFileRow[]): Response {
	const items = files.map((f) => {
		const isVideo = (f.mime_type ?? "").toLowerCase().startsWith("video/");
		const thumb = `/vault/${f.id}/thumb`;
		const name = escapeHtml(f.file_name);
		return `
		<a class="ph-item" href="/vault/${f.id}" title="${name}" data-type="${isVideo ? "video" : "photo"}">
			<div class="ph-thumb">
				${isVideo
					? `<video src="${thumb}" muted playsinline preload="metadata"></video><div class="ph-video-badge">▶</div>`
					: `<img src="${thumb}" loading="lazy" alt="${name}" />`
				}
				<div class="ph-overlay">
					<div class="ph-name">${name}</div>
				</div>
			</div>
		</a>`;
	}).join("");

	const imageCount = files.filter(f => !(f.mime_type ?? "").startsWith("video/")).length;
	const videoCount = files.filter(f => (f.mime_type ?? "").startsWith("video/")).length;

	return appShell(session, {
		title: "SapphireVault — Photos",
		active: "photos",
		content: `
		<style>
			.page-hd { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: .75rem; margin-bottom: 1rem; }
			.page-title { font-size: 1.45rem; font-weight: 900; letter-spacing: -.025em; }
			.page-sub { color: #7A7A92; font-size: .85rem; margin-top: .2rem; }
			.filter-bar { display: flex; gap: .5rem; flex-wrap: wrap; margin-bottom: 1rem; }
			.filter-btn {
				padding: .35rem .8rem; border-radius: 999px;
				border: 1px solid #2A2A3C; background: transparent;
				color: #7A7A92; font-size: .8rem; font-weight: 500; cursor: pointer;
				transition: all .14s ease;
			}
			.filter-btn:hover, .filter-btn.active { border-color: rgba(108,99,255,.45); background: rgba(108,99,255,.1); color: #C4C4D4; }
			.ph-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: .85rem; }
			.ph-item {
				display: block; text-decoration: none;
				border: 1px solid #2A2A3C; border-radius: .95rem;
				overflow: hidden; background: rgba(15,15,19,.7);
				transition: transform .15s ease, border-color .15s ease, box-shadow .15s ease;
				aspect-ratio: 1; position: relative;
			}
			.ph-item:hover { transform: scale(1.03); border-color: rgba(108,99,255,.5); box-shadow: 0 12px 30px rgba(0,0,0,.4); }
			.ph-thumb { width: 100%; height: 100%; position: relative; }
			.ph-thumb img, .ph-thumb video { width: 100%; height: 100%; object-fit: cover; display: block; }
			.ph-video-badge {
				position: absolute; top: .5rem; right: .5rem;
				width: 26px; height: 26px; border-radius: 999px;
				background: rgba(0,0,0,.65); display: flex; align-items: center; justify-content: center;
				color: white; font-size: .65rem;
			}
			.ph-overlay {
				position: absolute; inset: 0;
				background: linear-gradient(to top, rgba(0,0,0,.7), transparent 45%);
				opacity: 0; transition: opacity .18s ease;
				display: flex; align-items: flex-end; padding: .65rem .7rem;
			}
			.ph-item:hover .ph-overlay { opacity: 1; }
			.ph-name { font-size: .75rem; font-weight: 600; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
			.empty-state {
				text-align: center; padding: 4rem 1rem; color: #4A4A62;
				border: 1px dashed #2A2A3C; border-radius: 1.1rem;
			}
			.empty-state-icon { font-size: 3.5rem; margin-bottom: 1rem; opacity: .45; }
			.empty-state h3 { font-size: 1.05rem; font-weight: 700; color: #7A7A92; margin-bottom: .5rem; }
			.empty-state p { font-size: .85rem; margin-bottom: 1.25rem; }
		</style>

		<div class="page-hd">
			<div>
				<div class="page-title">Photos</div>
				<div class="page-sub">${imageCount} photo${imageCount !== 1 ? "s" : ""}${videoCount > 0 ? ` · ${videoCount} video${videoCount !== 1 ? "s" : ""}` : ""} · Private gallery</div>
			</div>
			<a class="btn btn-primary" href="/vault">Upload photo</a>
		</div>

		${files.length > 0 ? `
		<div class="filter-bar">
			<button class="filter-btn active" data-type="all">All (${files.length})</button>
			${imageCount > 0 ? `<button class="filter-btn" data-type="photo">Photos (${imageCount})</button>` : ""}
			${videoCount > 0 ? `<button class="filter-btn" data-type="video">Videos (${videoCount})</button>` : ""}
		</div>` : ""}

		<div class="ph-grid" id="phGrid">
			${items || `
			<div class="empty-state" style="grid-column:1/-1;">
				<div class="empty-state-icon">🖼</div>
				<h3>No photos yet</h3>
				<p>Upload images from the Files page to see them here.</p>
				<a class="btn btn-primary" href="/vault">Go to Files →</a>
			</div>`}
		</div>

		<script>
			document.querySelectorAll('.filter-btn').forEach(btn => {
				btn.addEventListener('click', () => {
					document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
					btn.classList.add('active');
					const type = btn.dataset.type;
					document.querySelectorAll('.ph-item').forEach(item => {
						item.style.display = (type === 'all' || item.dataset.type === type) ? '' : 'none';
					});
				});
			});
		</script>
		`,
	});
}
