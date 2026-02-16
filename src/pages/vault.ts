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

export function vaultListPage(session: Session, files: VaultFileRow[]): Response {
	const rows = files
		.map((f) => {
			const kind = guessPreviewKind(f.mime_type, f.file_name);
			const badge = kind === "image" ? "Image" : kind === "video" ? "Video" : kind === "audio" ? "Audio" : kind === "text" ? "Text" : "File";
			return `
			<tr>
				<td style="font-weight:700;">${f.file_name}</td>
				<td class="small">${badge}</td>
				<td class="small">${formatBytes(f.size_bytes)}</td>
				<td class="small">${new Date(f.created_at).toLocaleString()}</td>
				<td>
					<a class="btn" href="/vault/${f.id}">Preview</a>
					<a class="btn" href="/vault/${f.id}/download">Download</a>
				</td>
			</tr>
		`;
		})
		.join("");

	return layout({
		title: "SapphireVault — Files",
		session,
		active: "vault" as any,
		content: `
			<div class="card">
				<div class="h1">Vault</div>
				<div class="p">Upload files. Previews supported for images + video. (Private per-user.)</div>

				<form method="POST" action="/vault/upload" enctype="multipart/form-data">
					<label class="label" for="file">Choose a file</label>
					<input class="input" id="file" name="file" type="file" required />
					<div style="margin-top:1rem;" class="row">
						<button class="btn btn-primary" type="submit">Upload</button>
					</div>
				</form>
			</div>

			<div class="card" style="margin-top:1rem;">
				<table>
					<thead>
						<tr><th>Name</th><th>Type</th><th>Size</th><th>Uploaded</th><th></th></tr>
					</thead>
					<tbody>
						${rows || `<tr><td colspan="5" class="small">No files yet.</td></tr>`}
					</tbody>
				</table>
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
					<div>
						<div class="h1" style="margin-bottom:.25rem;">${f.file_name}</div>
						<div class="small">${f.mime_type ?? "(unknown type)"} · ${formatBytes(f.size_bytes)} · ${new Date(f.created_at).toLocaleString()}</div>
					</div>
					<div class="row">
						<a class="btn" href="/vault">Back</a>
						<a class="btn btn-primary" href="/vault/${f.id}/download">Download</a>
					</div>
				</div>
			</div>

			<div class="card" style="margin-top:1rem;">${preview}</div>
		`,
	});
}
