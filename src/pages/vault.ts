import type { Session } from "../session";
import { appShell } from "./appshell";
import { layout } from "./layout";
import { guessPreviewKind, type VaultFileRow } from "../vault";

function formatBytes(n: number) {
	if (!Number.isFinite(n) || n < 0) return "-";
	const units = ["B", "KB", "MB", "GB", "TB"];
	let u = 0; let v = n;
	while (v >= 1024 && u < units.length - 1) { v /= 1024; u++; }
	return `${v.toFixed(u === 0 ? 0 : 1)} ${units[u]}`;
}

function fileIcon(kind: string) {
	if (kind === "image") return "🖼";
	if (kind === "video") return "🎞";
	if (kind === "audio") return "🎵";
	if (kind === "text")  return "📄";
	return "📦";
}

function fileBadgeColor(kind: string) {
	if (kind === "image") return "rgba(108,99,255,.15)";
	if (kind === "video") return "rgba(59,130,246,.15)";
	if (kind === "audio") return "rgba(52,211,153,.12)";
	if (kind === "text")  return "rgba(245,158,11,.12)";
	return "rgba(122,122,146,.1)";
}

function esc(s: string) {
	return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}

export function vaultListPage(session: Session, files: VaultFileRow[]): Response {
	const cards = files.map((f) => {
		const kind = guessPreviewKind(f.mime_type, f.file_name);
		const name = esc(f.file_name);
		const thumb = (kind === "image" || kind === "video") ? `/vault/${f.id}/thumb` : "";
		const ext = f.file_name.split(".").pop()?.toUpperCase() ?? "FILE";
		return `
		<a class="filecard" href="/vault/${f.id}" data-name="${name.toLowerCase()}" data-kind="${kind}" aria-label="${name}">
			<div class="fc-thumb" style="background:${fileBadgeColor(kind)};">
				${thumb
					? (kind === "image"
						? `<img src="${thumb}" alt="" loading="lazy" />`
						: `<video src="${thumb}" muted playsinline preload="metadata"></video>`)
					: `<span class="fc-icon">${fileIcon(kind)}</span>`}
				<span class="fc-ext">${ext}</span>
			</div>
			<div class="fc-meta">
				<div class="fc-name">${name}</div>
				<div class="fc-info">${formatBytes(f.size_bytes)}</div>
			</div>
		</a>`;
	}).join("");

	return appShell(session, {
		title: "SapphireVault — Files",
		active: "files",
		content: `
		<style>
			.page-hd { display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:.75rem; margin-bottom:1rem; }
			.page-title { font-size:1.45rem; font-weight:900; letter-spacing:-.025em; }
			.page-sub { color:#7A7A92; font-size:.85rem; margin-top:.2rem; }

			/* ── Upload zone (FIXED: button outside the file-input area) ── */
			.upload-wrap { border:2px dashed #2A2A3C; border-radius:1.1rem; background:rgba(15,15,19,.5); transition:all .2s ease; }
			.upload-wrap.drag { border-color:rgba(108,99,255,.6); background:rgba(108,99,255,.06); }
			.upload-zone {
				padding:1.4rem 1.25rem; cursor:pointer;
				display:flex; align-items:center; gap:1rem; flex-wrap:wrap;
			}
			.upload-icon { font-size:2rem; flex-shrink:0; pointer-events:none; }
			.upload-text { pointer-events:none; }
			.upload-text strong { display:block; font-size:.95rem; font-weight:700; margin-bottom:.2rem; }
			.upload-text span { color:#7A7A92; font-size:.82rem; }
			.upload-bar {
				display:flex; align-items:center; justify-content:space-between;
				padding:.65rem 1.25rem; border-top:1px solid #1E1E2E;
				background:rgba(10,10,16,.4);
			}
			#selectedName { font-size:.82rem; color:#7A7A92; }
			#selectedName.ready { color:#A7A7FF; }

			/* ── Search bar results count ── */
			.search-count { font-size:.8rem; color:#5A5A72; margin-bottom:.75rem; }

			/* ── File grid ── */
			.filegrid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:1rem; }
			.filecard {
				display:block; text-decoration:none;
				border:1px solid #2A2A3C; border-radius:1rem;
				overflow:hidden; background:rgba(20,20,30,.8);
				transition:transform .14s ease, border-color .14s ease, box-shadow .14s ease;
			}
			.filecard:hover { transform:translateY(-3px); border-color:rgba(108,99,255,.45); box-shadow:0 12px 30px rgba(0,0,0,.35); }
			.fc-thumb {
				height:140px; display:flex; align-items:center; justify-content:center;
				position:relative; overflow:hidden; background:rgba(15,15,19,.7);
			}
			.fc-thumb img, .fc-thumb video { width:100%; height:100%; object-fit:cover; display:block; }
			.fc-icon { font-size:2.2rem; }
			.fc-ext {
				position:absolute; bottom:.5rem; right:.5rem;
				font-size:.65rem; font-weight:700; padding:.15rem .4rem;
				border-radius:.35rem; background:rgba(0,0,0,.6); color:#C4C4D4; letter-spacing:.04em;
			}
			.fc-meta { padding:.8rem .9rem; }
			.fc-name { font-weight:700; color:#E4E4ED; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:.875rem; }
			.fc-info { color:#5A5A72; font-size:.75rem; margin-top:.18rem; }

			.empty-state { text-align:center; padding:3.5rem 1rem; color:#4A4A62; border:1px dashed #2A2A3C; border-radius:1.1rem; }
			.empty-state-icon { font-size:3rem; margin-bottom:1rem; opacity:.5; }
			.empty-state h3 { font-size:1.05rem; font-weight:700; color:#7A7A92; margin-bottom:.4rem; }
			.empty-state p { font-size:.85rem; }

			.filter-bar { display:flex; gap:.5rem; flex-wrap:wrap; margin-bottom:1rem; }
			.filter-btn {
				padding:.35rem .8rem; border-radius:999px; border:1px solid #2A2A3C;
				background:transparent; color:#7A7A92; font-size:.8rem; font-weight:500; cursor:pointer; transition:all .14s ease;
			}
			.filter-btn:hover, .filter-btn.active { border-color:rgba(108,99,255,.45); background:rgba(108,99,255,.1); color:#C4C4D4; }

			.no-results { display:none; grid-column:1/-1; text-align:center; padding:2.5rem; color:#4A4A62; }
			.no-results.show { display:block; }
		</style>

		<div class="page-hd">
			<div>
				<div class="page-title">Files</div>
				<div class="page-sub" id="fileCount">${files.length} file${files.length !== 1 ? "s" : ""} · Private Cloudflare R2 storage</div>
			</div>
		</div>

		<!-- ─── Upload zone (FIXED) ─── -->
		<form method="POST" action="/vault/upload" enctype="multipart/form-data" id="uploadForm">
			<!-- File input is hidden — zone click triggers it, button does NOT overlap it -->
			<input type="file" name="file" id="fileInput" style="display:none;" required />

			<div class="upload-wrap" id="uploadWrap">
				<!-- Clickable zone — calls input.click() via JS -->
				<div class="upload-zone" id="dropZone">
					<div class="upload-icon">📤</div>
					<div class="upload-text">
						<strong id="dropLabel">Drop a file here or click to browse</strong>
						<span>Any file type · Stored privately on Cloudflare R2</span>
					</div>
				</div>
				<!-- Action bar sits below the zone, completely separate from input -->
				<div class="upload-bar">
					<span id="selectedName">No file selected</span>
					<button class="btn btn-primary" type="submit" id="uploadBtn">Upload</button>
				</div>
			</div>
		</form>

		<!-- ─── Filter bar ─── -->
		${files.length > 0 ? `
		<div class="filter-bar">
			<button class="filter-btn active" data-kind="all">All (${files.length})</button>
			<button class="filter-btn" data-kind="image">Images</button>
			<button class="filter-btn" data-kind="video">Videos</button>
			<button class="filter-btn" data-kind="audio">Audio</button>
			<button class="filter-btn" data-kind="text">Documents</button>
		</div>` : ""}

		<div id="searchCount" class="search-count" style="display:none;"></div>

		<!-- ─── File grid ─── -->
		<div class="filegrid" id="fileGrid">
			${cards || `<div class="empty-state"><div class="empty-state-icon">📁</div><h3>No files yet</h3><p>Upload your first file above to get started.</p></div>`}
			<div class="no-results" id="noResults">No files match your search.</div>
		</div>

		<script>
		(function() {
			const form     = document.getElementById('uploadForm');
			const input    = document.getElementById('fileInput');
			const btn      = document.getElementById('uploadBtn');
			const zone     = document.getElementById('dropZone');
			const wrap     = document.getElementById('uploadWrap');
			const selName  = document.getElementById('selectedName');
			const dropLbl  = document.getElementById('dropLabel');

			// Click on zone → open file picker
			zone.addEventListener('click', () => input.click());

			// File selected → update UI then AUTO-SUBMIT
			input.addEventListener('change', () => {
				if (!input.files[0]) return;
				const name = input.files[0].name;
				const short = name.length > 35 ? name.slice(0, 35) + '…' : name;
				selName.textContent = short;
				selName.classList.add('ready');
				dropLbl.textContent = 'Ready to upload: ' + short;
				btn.textContent = 'Uploading…';
				btn.disabled = true;
				form.submit();
			});

			// Drag & drop
			['dragenter','dragover'].forEach(ev => zone.addEventListener(ev, e => {
				e.preventDefault(); wrap.classList.add('drag');
			}));
			['dragleave','drop'].forEach(ev => wrap.addEventListener(ev, e => {
				e.preventDefault(); wrap.classList.remove('drag');
			}));
			zone.addEventListener('drop', e => {
				if (!e.dataTransfer?.files[0]) return;
				const dt = new DataTransfer();
				dt.items.add(e.dataTransfer.files[0]);
				input.files = dt.files;
				input.dispatchEvent(new Event('change'));
			});

			// Filter buttons
			document.querySelectorAll('.filter-btn').forEach(b => {
				b.addEventListener('click', () => {
					document.querySelectorAll('.filter-btn').forEach(x => x.classList.remove('active'));
					b.classList.add('active');
					filterCards(b.dataset.kind, window._searchQuery || '');
				});
			});

			// Search integration
			let activeKind = 'all';
			window._searchQuery = '';

			window.applySearch = function(q) {
				window._searchQuery = q;
				const kind = document.querySelector('.filter-btn.active')?.dataset.kind || 'all';
				filterCards(kind, q);
			};

			function filterCards(kind, q) {
				activeKind = kind;
				const cards = document.querySelectorAll('.filecard');
				let visible = 0;
				const lower = q.toLowerCase();
				cards.forEach(c => {
					const matchKind = kind === 'all' || c.dataset.kind === kind;
					const matchQ    = !q || c.dataset.name.includes(lower);
					const show = matchKind && matchQ;
					c.style.display = show ? '' : 'none';
					if (show) visible++;
				});
				const noRes = document.getElementById('noResults');
				const cnt   = document.getElementById('searchCount');
				noRes.classList.toggle('show', visible === 0 && cards.length > 0);
				if (q) {
					cnt.style.display = '';
					cnt.textContent = visible + ' of ${files.length} file${files.length !== 1 ? "s" : ""} match "' + q + '"';
				} else {
					cnt.style.display = 'none';
				}
			}
		})();
		</script>
		`,
	});
}

export function vaultPreviewPage(session: Session, f: VaultFileRow, previewUrl: string): Response {
	const kind = guessPreviewKind(f.mime_type, f.file_name);
	const name = esc(f.file_name);

	let preview = `<div style="text-align:center;padding:3rem;color:#4A4A62;"><div style="font-size:3rem;margin-bottom:1rem;">📦</div><p>No preview available for this file type.</p></div>`;
	if (kind === "image") {
		preview = `<img src="${previewUrl}" alt="${name}" style="max-width:100%;max-height:72vh;object-fit:contain;border-radius:.85rem;display:block;margin:0 auto;" />`;
	} else if (kind === "video") {
		preview = `<video src="${previewUrl}" controls style="width:100%;max-height:72vh;border-radius:.85rem;background:#0F0F13;" preload="metadata"></video>`;
	} else if (kind === "audio") {
		preview = `<div style="padding:2rem;text-align:center;"><div style="font-size:3rem;margin-bottom:1.5rem;">🎵</div><audio src="${previewUrl}" controls style="width:100%;max-width:480px;"></audio></div>`;
	}

	return layout({
		title: `SapphireVault — ${name}`,
		session,
		active: "vault",
		content: `
		<style>
			.preview-page { display:grid; gap:1rem; max-width:900px; margin:0 auto; }
			.preview-title { font-size:1.35rem; font-weight:900; letter-spacing:-.025em; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
			.preview-meta { color:#7A7A92; font-size:.82rem; margin-top:.25rem; }
			.preview-actions { display:flex; gap:.5rem; flex-shrink:0; flex-wrap:wrap; }
			.preview-body {
				border:1px solid #2A2A3C; border-radius:1.1rem;
				background:rgba(15,15,19,.85); overflow:hidden;
				padding:1.25rem; min-height:300px;
				display:flex; align-items:center; justify-content:center;
			}
			.preview-body img, .preview-body video { max-width:100%; }
		</style>

		<div class="preview-page">
			<div><a href="/vault" style="color:#6C63FF;text-decoration:none;font-size:.85rem;">← Back to Files</a></div>

			<div class="card" style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;flex-wrap:wrap;">
				<div style="min-width:0;flex:1;">
					<div class="preview-title">${name}</div>
					<div class="preview-meta">${esc(f.mime_type ?? "unknown")} · ${formatBytes(f.size_bytes)} · ${new Date(f.created_at).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}</div>
				</div>
				<div class="preview-actions">
					<a class="btn" href="/vault">Back</a>
					<a class="btn btn-primary" href="/vault/${f.id}/download">⬇ Download</a>
					<form method="POST" action="/vault/${f.id}/delete" onsubmit="return confirm('Delete this file? This cannot be undone.');" style="display:inline;">
						<button class="btn btn-danger" type="submit">🗑 Delete</button>
					</form>
				</div>
			</div>

			<div class="preview-body">${preview}</div>

			<div class="card" style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;justify-content:space-between;">
				<div>
					<div style="font-size:.78rem;color:#5A5A72;text-transform:uppercase;letter-spacing:.07em;font-weight:600;margin-bottom:.3rem;">File details</div>
					<div style="display:flex;gap:1.5rem;flex-wrap:wrap;font-size:.85rem;">
						<div><span style="color:#7A7A92;">Type:</span> ${esc(f.mime_type ?? "unknown")}</div>
						<div><span style="color:#7A7A92;">Size:</span> ${formatBytes(f.size_bytes)}</div>
						<div><span style="color:#7A7A92;">Uploaded:</span> ${new Date(f.created_at).toLocaleString()}</div>
					</div>
				</div>
				<a class="btn btn-primary" href="/vault/${f.id}/download">Download</a>
			</div>
		</div>
		`,
	});
}
