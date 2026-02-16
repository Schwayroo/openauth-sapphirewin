import type { Session } from "../session";
import { layout } from "./layout";
import { guessPreviewKind, type VaultFileRow } from "../vault";

function formatBytes(n: number) {
	if (!Number.isFinite(n) || n < 0) return "-";
	const units = ["B", "KB", "MB", "GB", "TB"];
	let u = 0;
	let v = n;
	while (v >= 1024 && u < units.length - 1) {
		v /= 1024;
		u++;
	}
	return `${v.toFixed(u === 0 ? 0 : 1)} ${units[u]}`;
}

function fileIcon(kind: string) {
	if (kind === "image") return "🖼️";
	if (kind === "video") return "🎞️";
	if (kind === "audio") return "🎵";
	if (kind === "text") return "📄";
	return "📦";
}

export function vaultListPage(session: Session, files: VaultFileRow[]): Response {
	const cards = files
		.map((f) => {
			const kind = guessPreviewKind(f.mime_type, f.file_name);
			return `
			<a class="filecard" href="/vault/${f.id}">
				<div class="filecard-top">
					<div class="fileicon">${fileIcon(kind)}</div>
					<div class="filemeta">
						<div class="filename">${f.file_name}</div>
						<div class="small">${f.mime_type ?? "unknown"} · ${formatBytes(f.size_bytes)}</div>
					</div>
				</div>
				<div class="small" style="margin-top:.75rem;">Uploaded ${new Date(f.created_at).toLocaleString()}</div>
			</a>
		`;
		})
		.join("");

	return layout({
		title: "SapphireVault — Vault",
		session,
		active: "vault" as any,
		content: `
			<style>
				.vaultbar { display:flex; gap:.75rem; align-items:center; justify-content:space-between; flex-wrap:wrap; }
				.drop { border:1px dashed #3A3A4C; border-radius:1rem; padding:1rem; background: rgba(255,255,255,.02); transition: border-color .15s ease, background .15s ease; }
				.drop:hover { border-color: rgba(108,99,255,.55); background: rgba(108,99,255,.06); }
				.filegrid { display:grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap:1rem; }
				.filecard { display:block; text-decoration:none; border:1px solid #2A2A3C; border-radius:1rem; padding:1rem; background: rgba(26,26,36,.65); transition: transform .14s ease, border-color .14s ease, background .14s ease; }
				.filecard:hover { transform: translateY(-2px); border-color: rgba(108,99,255,.45); background: rgba(26,26,36,.85); }
				.filecard-top { display:flex; gap:.75rem; align-items:center; }
				.fileicon { width:42px; height:42px; display:grid; place-items:center; border-radius:14px; background: rgba(108,99,255,.12); border:1px solid rgba(108,99,255,.20); }
				.filename { font-weight:700; color:#E4E4ED; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width: 180px; }
				.filemeta { min-width:0; }
			</style>

			<div class="card">
				<div class="vaultbar">
					<div>
						<div class="h1" style="margin-bottom:.25rem;">Vault</div>
						<div class="small">Private files (R2). Image/video previews supported.</div>
					</div>
					<div class="row">
						<a class="btn" href="/dashboard">Home</a>
					</div>
				</div>

				<div class="drop" style="margin-top:1rem;">
					<form method="POST" action="/vault/upload" enctype="multipart/form-data" class="row" style="justify-content:space-between;">
						<div style="flex: 1 1 360px;">
							<label class="label" for="file">Upload</label>
							<input class="input" id="file" name="file" type="file" required />
							<div class="small" style="margin-top:.5rem;">Tip: keep files under Worker limits (we’ll add multipart later).</div>
						</div>
						<div style="display:flex; align-items:end;">
							<button class="btn btn-primary" type="submit">Upload</button>
						</div>
					</form>
				</div>
			</div>

			<div style="margin-top:1rem;" class="filegrid">
				${cards || `<div class="card"><div style="font-weight:700; margin-bottom:.35rem;">No files yet</div><div class="small">Upload your first file above.</div></div>`}
			</div>
		`,
	});
}

export function vaultPreviewPage(session: Session, f: VaultFileRow, previewUrl: string): Response {
	const kind = guessPreviewKind(f.mime_type, f.file_name);

	let preview = `<div class="small">No preview available for this file type.</div>`;
	if (kind === "image") {
		preview = `<img src="${previewUrl}" alt="${f.file_name}" style="width:100%; max-height:70vh; object-fit:contain; border-radius:1rem; border:1px solid #2A2A3C; background:#0F0F13;" />`;
	} else if (kind === "video") {
		preview = `<video src="${previewUrl}" controls style="width:100%; max-height:70vh; border-radius:1rem; border:1px solid #2A2A3C; background:#0F0F13;"></video>`;
	} else if (kind === "audio") {
		preview = `<audio src="${previewUrl}" controls style="width:100%;"></audio>`;
	}

	return layout({
		title: `SapphireVault — ${f.file_name}`,
		session,
		active: "vault" as any,
		content: `
			<div class="card">
				<div class="row" style="justify-content:space-between;">
					<div style="min-width:0;">
						<div class="h1" style="margin-bottom:.25rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${f.file_name}</div>
						<div class="small">${f.mime_type ?? "(unknown type)"} · ${formatBytes(f.size_bytes)} · ${new Date(f.created_at).toLocaleString()}</div>
					</div>
					<div class="row">
						<a class="btn" href="/vault">Back</a>
						<form method="POST" action="/vault/${f.id}/delete" onsubmit="return confirm('Delete this file? This cannot be undone.');" style="display:inline;">
							<button class="btn" type="submit">Delete</button>
						</form>
						<a class="btn btn-primary" href="/vault/${f.id}/download">Download</a>
					</div>
				</div>
			</div>

			<div class="card" style="margin-top:1rem;">${preview}</div>
		`,
	});
}
