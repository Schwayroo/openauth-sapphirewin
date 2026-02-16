import type { Session } from "../session";
import { layout } from "./layout";

export function passwordsPage(session: Session, existing: { hasVault: boolean; updatedAt?: string; kdf?: string } = { hasVault: false }): Response {
	return layout({
		title: "SapphireVault — Passwords",
		session,
		active: "vault" as any,
		content: `
			<style>
				.kbd { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size:.85rem; padding:.15rem .45rem; border-radius:.5rem; border:1px solid #2A2A3C; background: rgba(255,255,255,.03); }
				textarea.input { min-height: 160px; resize: vertical; }
			</style>

			<div class="grid">
				<div class="card">
					<div class="h1">Password Vault</div>
					<div class="p">Zero-knowledge: encryption happens in your browser. Server stores only encrypted data.</div>

					<div class="small">Status: ${existing.hasVault ? `Saved (updated ${existing.updatedAt})` : "No vault saved yet"}</div>
					<div class="small">KDF: ${existing.kdf ?? "-"}</div>

					<hr style="border:none;border-top:1px solid #2A2A3C;margin:1rem 0;" />

					<form id="vaultForm">
						<label class="label" for="master">Master password</label>
						<input class="input" id="master" type="password" autocomplete="current-password" placeholder="Master password" required />
						<div class="small" style="margin-top:.5rem;">We never send this to the server.</div>

						<label class="label" for="data" style="margin-top:1rem;">Vault entries (JSON)</label>
						<textarea class="input" id="data" placeholder='[{"site":"example.com","username":"me","password":"secret","notes":"..."}]'></textarea>

						<div class="row" style="margin-top:1rem;">
							<button class="btn btn-primary" type="submit">Encrypt + Save</button>
							<button class="btn" type="button" id="loadBtn">Load + Decrypt</button>
						</div>
					</form>

					<div id="msg" class="small" style="margin-top:1rem;"></div>
				</div>

				<div class="card">
					<div class="h1">How it works</div>
					<div class="p">Client derives a key using <span class="kbd">PBKDF2</span> and encrypts with <span class="kbd">AES-GCM</span>. We store:</div>
					<ul style="margin-left:1.1rem; color:#7A7A92;">
						<li>salt</li>
						<li>iv</li>
						<li>ciphertext</li>
						<li>kdf params</li>
					</ul>
					<div class="small">Next upgrade: Argon2id via WASM + better UX (folders, search, copy buttons).</div>
				</div>
			</div>

			<script>
				const enc = new TextEncoder();
				const dec = new TextDecoder();
				function b64(u8){ return btoa(String.fromCharCode(...u8)); }
				function ub64(s){ return Uint8Array.from(atob(s), c=>c.charCodeAt(0)); }

				async function deriveKey(master, salt, iterations){
					const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(master), 'PBKDF2', false, ['deriveKey']);
					return crypto.subtle.deriveKey(
						{ name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
						keyMaterial,
						{ name: 'AES-GCM', length: 256 },
						false,
						['encrypt','decrypt']
					);
				}

				async function encryptVault(master, plaintext){
					const salt = crypto.getRandomValues(new Uint8Array(16));
					const iv = crypto.getRandomValues(new Uint8Array(12));
					const iterations = 210000;
					const key = await deriveKey(master, salt, iterations);
					const ct = await crypto.subtle.encrypt({ name:'AES-GCM', iv }, key, enc.encode(plaintext));
					return {
						kdf: 'pbkdf2-sha256',
						kdf_params: { iterations },
						salt: b64(salt),
						iv: b64(iv),
						ct: b64(new Uint8Array(ct))
					};
				}

				async function decryptVault(master, blob){
					const salt = ub64(blob.salt);
					const iv = ub64(blob.iv);
					const iterations = blob.kdf_params?.iterations;
					const key = await deriveKey(master, salt, iterations);
					const pt = await crypto.subtle.decrypt({ name:'AES-GCM', iv }, key, ub64(blob.ct));
					return dec.decode(pt);
				}

				const msg = document.getElementById('msg');
				const form = document.getElementById('vaultForm');
				const loadBtn = document.getElementById('loadBtn');

				form.addEventListener('submit', async (e)=>{
					e.preventDefault();
					msg.textContent='Encrypting...';
					const master = document.getElementById('master').value;
					const data = document.getElementById('data').value || '[]';
					try { JSON.parse(data); } catch { msg.textContent='Invalid JSON.'; return; }
					const blob = await encryptVault(master, data);
					msg.textContent='Saving...';
					const res = await fetch('/passwords', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(blob) });
					msg.textContent = res.ok ? 'Saved.' : ('Save failed: ' + await res.text());
				});

				loadBtn.addEventListener('click', async ()=>{
					msg.textContent='Loading...';
					const master = document.getElementById('master').value;
					const res = await fetch('/passwords/data');
					if (!res.ok) { msg.textContent = 'Load failed: ' + await res.text(); return; }
					const blob = await res.json();
					try {
						const plaintext = await decryptVault(master, blob);
						document.getElementById('data').value = plaintext;
						msg.textContent='Decrypted.';
					} catch(e){
						msg.textContent='Decrypt failed (wrong password or corrupted vault).';
					}
				});
			</script>
		`,
	});
}
