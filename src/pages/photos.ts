import type { Session } from "../session";
import { appShell } from "./appshell";
import type { VaultFileRow, PhotoFolderRow } from "../vault";

function escapeHtml(s: string) {
	return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}

export interface PhotosPageOpts {
	files: VaultFileRow[];
	folders: PhotoFolderRow[];
	currentFolder: PhotoFolderRow | null;
	breadcrumbs: PhotoFolderRow[];
	allFolders: PhotoFolderRow[];
}

export function photosPage(session: Session, opts: PhotosPageOpts): Response {
	const { files, folders, currentFolder, breadcrumbs, allFolders } = opts;

	const imageCount = files.filter(f => !(f.mime_type ?? "").startsWith("video/")).length;
	const videoCount = files.filter(f => (f.mime_type ?? "").startsWith("video/")).length;

	// Build breadcrumb HTML
	const crumbHtml = breadcrumbs.length > 0 ? `
		<nav class="breadcrumb" aria-label="Folder path">
			<a href="/photos" class="crumb-link">Photos</a>
			${breadcrumbs.map((c, i) => `
				<span class="crumb-sep">›</span>
				${i < breadcrumbs.length - 1
					? `<a href="/photos/folder/${c.id}" class="crumb-link">${escapeHtml(c.name)}</a>`
					: `<span class="crumb-current">${escapeHtml(c.name)}</span>`
				}
			`).join("")}
		</nav>` : `<nav class="breadcrumb"><span class="crumb-current">Photos</span></nav>`;

	// Folder options for "move" dropdowns (flat list for select)
	const folderOptions = [
		`<option value="">— Root (no folder) —</option>`,
		...allFolders.map(f => `<option value="${f.id}">${escapeHtml(f.name)}</option>`),
	].join("");

	// Folder grid cards
	const folderCards = folders.map(f => `
		<div class="ph-folder-card" data-name="${escapeHtml(f.name.toLowerCase())}">
			<a href="/photos/folder/${f.id}" class="folder-link">
				<div class="folder-icon">
					<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
						<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
					</svg>
				</div>
				<div class="folder-name">${escapeHtml(f.name)}</div>
			</a>
			<div class="folder-actions">
				<form method="POST" action="/photos/folder/${f.id}/delete" onsubmit="return confirm('Delete folder? Photos inside will move to root.')">
					<button type="submit" class="folder-del-btn" title="Delete folder">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
							<path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
						</svg>
					</button>
				</form>
			</div>
		</div>`).join("");

	// Photo / video grid items
	const photoItems = files.map(f => {
		const isVideo = (f.mime_type ?? "").toLowerCase().startsWith("video/");
		const name = escapeHtml(f.file_name);
		return `
		<div class="ph-item" data-name="${escapeHtml(f.file_name.toLowerCase())}" data-type="${isVideo ? "video" : "photo"}">
			<a href="/vault/${f.id}" class="ph-thumb-link">
				<div class="ph-thumb">
					${isVideo
						? `<video src="/vault/${f.id}/thumb" muted playsinline preload="metadata"></video><div class="ph-video-badge">▶</div>`
						: `<img src="/vault/${f.id}/thumb" loading="lazy" alt="${name}" />`
					}
					<div class="ph-overlay">
						<div class="ph-name">${name}</div>
					</div>
				</div>
			</a>
			<div class="ph-footer">
				<form method="POST" action="/photos/move" class="move-form">
					<input type="hidden" name="file_id" value="${f.id}" />
					<input type="hidden" name="redirect" value="${currentFolder ? `/photos/folder/${currentFolder.id}` : "/photos"}" />
					<select name="folder_id" class="move-select" onchange="this.form.submit()" title="Move to folder">
						${folderOptions.replace(`value="${f.folder_id ?? ''}"`, `value="${f.folder_id ?? ''}" selected`)}
					</select>
				</form>
			</div>
		</div>`;
	}).join("");

	const hasContent = folders.length > 0 || files.length > 0;

	return appShell(session, {
		title: "SapphireVault — Photos",
		active: "photos",
		content: `
		<style>
			.page-hd { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: .75rem; margin-bottom: 1rem; }
			.page-title { font-size: 1.45rem; font-weight: 900; letter-spacing: -.025em; }
			.page-sub { color: #7A7A92; font-size: .85rem; margin-top: .2rem; }

			/* Breadcrumb */
			.breadcrumb { display: flex; align-items: center; gap: .35rem; font-size: .82rem; color: #7A7A92; margin-bottom: 1rem; flex-wrap: wrap; }
			.crumb-link { color: #6C63FF; text-decoration: none; } .crumb-link:hover { text-decoration: underline; }
			.crumb-sep { color: #3A3A52; }
			.crumb-current { color: #C4C4D4; font-weight: 600; }

			/* New folder form */
			.new-folder-bar { display: flex; gap: .5rem; align-items: center; margin-bottom: 1.25rem; }
			.new-folder-bar .input { flex: 1; max-width: 240px; font-size: .85rem; padding: .45rem .75rem; }
			.new-folder-toggle { background: none; border: 1px dashed #3A3A52; color: #7A7A92; padding: .4rem .85rem; border-radius: .55rem; font-size: .82rem; cursor: pointer; transition: all .14s; }
			.new-folder-toggle:hover { border-color: rgba(108,99,255,.5); color: #C4C4D4; }
			#newFolderForm { display: none; }
			#newFolderForm.open { display: flex; }

			/* Filter bar */
			.filter-bar { display: flex; gap: .5rem; flex-wrap: wrap; margin-bottom: 1rem; }
			.filter-btn { padding: .35rem .8rem; border-radius: 999px; border: 1px solid #2A2A3C; background: transparent; color: #7A7A92; font-size: .8rem; font-weight: 500; cursor: pointer; transition: all .14s ease; }
			.filter-btn:hover, .filter-btn.active { border-color: rgba(108,99,255,.45); background: rgba(108,99,255,.1); color: #C4C4D4; }

			/* Grid — folders first, then photos */
			.ph-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: .85rem; }

			/* Folder cards */
			.ph-folder-card {
				border: 1px solid #2A2A3C; border-radius: .95rem;
				background: rgba(20,20,28,.8); overflow: hidden;
				transition: transform .15s ease, border-color .15s ease, box-shadow .15s ease;
				position: relative;
			}
			.ph-folder-card:hover { transform: scale(1.02); border-color: rgba(108,99,255,.4); box-shadow: 0 8px 24px rgba(0,0,0,.35); }
			.folder-link { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.4rem 1rem .9rem; text-decoration: none; gap: .5rem; }
			.folder-icon { color: #6C63FF; opacity: .85; }
			.folder-name { font-size: .8rem; font-weight: 600; color: #C4C4D4; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
			.folder-actions { position: absolute; top: .45rem; right: .45rem; opacity: 0; transition: opacity .15s; }
			.ph-folder-card:hover .folder-actions { opacity: 1; }
			.folder-del-btn { background: rgba(239,68,68,.15); border: 1px solid rgba(239,68,68,.3); color: #f87171; border-radius: .4rem; padding: .25rem .3rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .14s; }
			.folder-del-btn:hover { background: rgba(239,68,68,.3); }

			/* Photo items */
			.ph-item {
				border: 1px solid #2A2A3C; border-radius: .95rem;
				overflow: hidden; background: rgba(15,15,19,.7);
				transition: transform .15s ease, border-color .15s ease, box-shadow .15s ease;
				position: relative; display: flex; flex-direction: column;
			}
			.ph-item:hover { transform: scale(1.02); border-color: rgba(108,99,255,.5); box-shadow: 0 12px 30px rgba(0,0,0,.4); }
			.ph-thumb-link { display: block; aspect-ratio: 1; text-decoration: none; }
			.ph-thumb { width: 100%; height: 100%; position: relative; }
			.ph-thumb img, .ph-thumb video { width: 100%; height: 100%; object-fit: cover; display: block; }
			.ph-video-badge { position: absolute; top: .5rem; right: .5rem; width: 26px; height: 26px; border-radius: 999px; background: rgba(0,0,0,.65); display: flex; align-items: center; justify-content: center; color: white; font-size: .65rem; }
			.ph-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.7), transparent 45%); opacity: 0; transition: opacity .18s ease; display: flex; align-items: flex-end; padding: .65rem .7rem; }
			.ph-item:hover .ph-overlay { opacity: 1; }
			.ph-name { font-size: .75rem; font-weight: 600; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

			/* Move-to-folder footer */
			.ph-footer { padding: .35rem .5rem; border-top: 1px solid #1E1E2C; }
			.move-select { width: 100%; background: #1A1A24; border: 1px solid #2A2A3C; color: #9A9AB2; border-radius: .4rem; font-size: .72rem; padding: .2rem .35rem; cursor: pointer; }
			.move-select:focus { outline: none; border-color: rgba(108,99,255,.5); }

			/* Empty state */
			.empty-state { text-align: center; padding: 4rem 1rem; color: #4A4A62; border: 1px dashed #2A2A3C; border-radius: 1.1rem; grid-column: 1/-1; }
			.empty-state-icon { font-size: 3.5rem; margin-bottom: 1rem; opacity: .45; }
			.empty-state h3 { font-size: 1.05rem; font-weight: 700; color: #7A7A92; margin-bottom: .5rem; }
			.empty-state p { font-size: .85rem; margin-bottom: 1.25rem; }

			/* Search match counter */
			#searchCount { font-size: .8rem; color: #7A7A92; margin-bottom: .65rem; min-height: 1.2em; }
		</style>

		<div class="page-hd">
			<div>
				<div class="page-title">Photos</div>
				<div class="page-sub">${imageCount} photo${imageCount !== 1 ? "s" : ""}${videoCount > 0 ? ` · ${videoCount} video${videoCount !== 1 ? "s" : ""}` : ""}${currentFolder ? ` · ${escapeHtml(currentFolder.name)}` : " · Private gallery"}</div>
			</div>
			<a class="btn btn-primary" href="/vault">Upload photo</a>
		</div>

		${crumbHtml}

		<!-- New folder form -->
		<div class="new-folder-bar">
			<button class="new-folder-toggle" type="button" onclick="toggleNewFolder(this)">+ New folder</button>
			<form id="newFolderForm" method="POST" action="/photos/folders">
				<input type="hidden" name="parent_id" value="${currentFolder?.id ?? ""}" />
				<input type="hidden" name="redirect" value="${currentFolder ? `/photos/folder/${currentFolder.id}` : "/photos"}" />
				<input class="input" name="name" placeholder="Folder name" required maxlength="80" autocomplete="off" />
				<button class="btn btn-primary btn-sm" type="submit" style="margin-left:.4rem;">Create</button>
				<button class="btn btn-sm" type="button" onclick="toggleNewFolder(null)" style="margin-left:.25rem;">Cancel</button>
			</form>
		</div>

		${hasContent ? `
		<div class="filter-bar" id="filterBar">
			<button class="filter-btn active" data-type="all">All (${folders.length + files.length})</button>
			${folders.length > 0 ? `<button class="filter-btn" data-type="folder">Folders (${folders.length})</button>` : ""}
			${imageCount > 0 ? `<button class="filter-btn" data-type="photo">Photos (${imageCount})</button>` : ""}
			${videoCount > 0 ? `<button class="filter-btn" data-type="video">Videos (${videoCount})</button>` : ""}
		</div>` : ""}

		<div id="searchCount"></div>

		<div class="ph-grid" id="phGrid">
			${folderCards}
			${photoItems}
			${!hasContent ? `
			<div class="empty-state">
				<div class="empty-state-icon">🖼</div>
				<h3>${currentFolder ? "This folder is empty" : "No photos yet"}</h3>
				<p>${currentFolder ? "Upload images from the Files page, then move them here." : "Upload images from the Files page to see them here."}</p>
				<a class="btn btn-primary" href="/vault">Go to Files →</a>
			</div>` : ""}
		</div>

		<script>
			// New folder toggle
			function toggleNewFolder(btn) {
				const form = document.getElementById('newFolderForm');
				const isOpen = form.classList.toggle('open');
				if (isOpen) { form.querySelector('input[name=name]').focus(); }
			}

			// Type filter buttons
			document.querySelectorAll('.filter-btn').forEach(btn => {
				btn.addEventListener('click', () => {
					document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
					btn.classList.add('active');
					applyFilter(btn.dataset.type, document.getElementById('globalSearch')?.value.trim() ?? '');
				});
			});

			function applyFilter(type, query) {
				const q = query.toLowerCase();
				let shown = 0, total = 0;
				document.querySelectorAll('.ph-folder-card, .ph-item').forEach(el => {
					const itemType = el.classList.contains('ph-folder-card') ? 'folder' : el.dataset.type;
					const nameMatch = !q || el.dataset.name?.includes(q);
					const typeMatch = type === 'all' || itemType === type;
					const vis = nameMatch && typeMatch;
					el.style.display = vis ? '' : 'none';
					total++;
					if (vis) shown++;
				});
				const ctr = document.getElementById('searchCount');
				if (q && ctr) ctr.textContent = shown === total ? '' : shown + ' of ' + total + ' items match';
				else if (ctr) ctr.textContent = '';
			}

			// Global search integration
			window.applySearch = function(q) {
				const activeType = document.querySelector('.filter-btn.active')?.dataset?.type ?? 'all';
				applyFilter(activeType, q);
			};
		</script>
		`,
	});
}
