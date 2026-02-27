import type { Session } from "../session";
import { appShell } from "./appshell";

export function passwordsPage(session: Session, existing: { hasVault: boolean; updatedAt?: string; kdf?: string } = { hasVault: false }): Response {
	return appShell(session, {
		title: "SapphireVault — Passwords",
		active: "passwords",
		content: `
		<style>
			/* ── Page header ── */
			.page-hd { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: .75rem; margin-bottom: 1rem; }
			.page-title { font-size: 1.45rem; font-weight: 900; letter-spacing: -.025em; }
			.page-sub { color: #7A7A92; font-size: .85rem; margin-top: .2rem; }

			/* ── Vault status badge ── */
			.vault-status {
				display: inline-flex; align-items: center; gap: .45rem;
				padding: .3rem .8rem; border-radius: 999px; font-size: .8rem; font-weight: 600;
			}
			.vs-active { background: rgba(52,211,153,.1); border: 1px solid rgba(52,211,153,.25); color: #34D399; }
			.vs-empty  { background: rgba(122,122,146,.08); border: 1px solid #2A2A3C; color: #7A7A92; }
			.vs-dot { width: 7px; height: 7px; border-radius: 999px; background: currentColor; }

			/* ── Two-col layout ── */
			.pw-cols { display: grid; grid-template-columns: 1fr 380px; gap: 1rem; align-items: start; }
			@media (max-width: 860px) { .pw-cols { grid-template-columns: 1fr; } }

			/* ── Vault card ── */
			.vault-card { border: 1px solid #2A2A3C; border-radius: 1.1rem; background: rgba(22,22,32,.8); overflow: hidden; }
			.vault-card-hd { padding: 1.15rem 1.25rem; border-bottom: 1px solid #1E1E2E; display: flex; align-items: center; justify-content: space-between; gap: .75rem; flex-wrap: wrap; }
			.vault-card-title { font-size: 1rem; font-weight: 700; }
			.vault-card-body { padding: 1.25rem; }

			/* ── Entry list ── */
			.entry-list { display: grid; gap: .6rem; }
			.entry {
				border: 1px solid #2A2A3C; border-radius: .85rem;
				background: rgba(15,15,19,.6); overflow: hidden;
				transition: border-color .15s ease;
			}
			.entry:hover { border-color: rgba(108,99,255,.35); }
			.entry-hd {
				display: flex; align-items: center; gap: .75rem;
				padding: .8rem 1rem; cursor: pointer;
			}
			.entry-favicon {
				width: 32px; height: 32px; border-radius: .5rem;
				background: rgba(108,99,255,.15); border: 1px solid rgba(108,99,255,.2);
				display: flex; align-items: center; justify-content: center;
				font-size: .85rem; flex-shrink: 0; font-weight: 700; color: #A7A7FF;
			}
			.entry-site { font-size: .9rem; font-weight: 700; color: #E4E4ED; }
			.entry-user { font-size: .78rem; color: #7A7A92; margin-top: .08rem; }
			.entry-actions { margin-left: auto; display: flex; gap: .4rem; flex-shrink: 0; }
			.copy-btn {
				padding: .28rem .65rem; border-radius: .5rem;
				border: 1px solid rgba(108,99,255,.3); background: rgba(108,99,255,.08);
				color: #A7A7FF; font-size: .75rem; font-weight: 600; cursor: pointer;
				transition: all .12s ease;
			}
			.copy-btn:hover { background: rgba(108,99,255,.18); border-color: rgba(108,99,255,.5); }
			.copy-btn.copied { background: rgba(52,211,153,.1); border-color: rgba(52,211,153,.3); color: #34D399; }
			.entry-pw { display: flex; align-items: center; gap: .5rem; padding: 0 1rem .75rem; }
			.pw-dots { font-size: .85rem; letter-spacing: .12em; color: #4A4A62; flex: 1; }
			.show-pw-btn {
				background: transparent; border: none; cursor: pointer;
				color: #5A5A72; font-size: .8rem; padding: .2rem .4rem;
				border-radius: .4rem; transition: color .12s ease;
			}
			.show-pw-btn:hover { color: #A7A7BD; }

			/* ── Master password section ── */
			.master-section { border: 1px solid #2A2A3C; border-radius: 1.1rem; background: rgba(22,22,32,.8); padding: 1.25rem; }
			.master-hd { font-size: 1rem; font-weight: 700; margin-bottom: .5rem; }
			.master-sub { color: #7A7A92; font-size: .82rem; margin-bottom: 1rem; line-height: 1.5; }
			.pw-input-wrap { position: relative; }
			.pw-input-wrap .input { padding-right: 3rem; }
			.pw-eye {
				position: absolute; right: .85rem; top: 50%; transform: translateY(-50%);
				background: transparent; border: none; cursor: pointer; color: #5A5A72;
				font-size: .9rem; padding: .25rem;
			}
			.pw-eye:hover { color: #A7A7BD; }

			/* ── Add entry form ── */
			.add-form { border: 1px solid rgba(108,99,255,.25); border-radius: .85rem; background: rgba(108,99,255,.04); padding: 1rem; }
			.add-form-title { font-size: .9rem; font-weight: 700; margin-bottom: .85rem; color: #A7A7FF; }
			.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: .65rem; }
			@media (max-width: 500px) { .form-row { grid-template-columns: 1fr; } }

			/* ── Info card ── */
			.info-card { border: 1px solid #2A2A3C; border-radius: 1.1rem; background: rgba(22,22,32,.8); padding: 1.25rem; }
			.info-card-title { font-size: .9rem; font-weight: 700; margin-bottom: .75rem; }
			.info-row { display: flex; align-items: flex-start; gap: .65rem; padding: .55rem 0; border-bottom: 1px solid #1A1A2A; }
			.info-row:last-child { border-bottom: none; }
			.info-icon { font-size: 1rem; flex-shrink: 0; margin-top: .05rem; }
			.info-text { font-size: .82rem; color: #A7A7BD; line-height: 1.5; }
			.info-text strong { color: #E4E4ED; display: block; margin-bottom: .15rem; }

			/* ── Status / feedback ── */
			#vaultMsg {
				margin-top: .85rem; padding: .65rem .9rem; border-radius: .72rem;
				font-size: .85rem; display: none;
			}
			#vaultMsg.show { display: block; }

			/* ── Separator ── */
			.or-sep { display: flex; align-items: center; gap: .75rem; margin: 1rem 0; color: #3A3A4C; font-size: .8rem; }
			.or-sep::before, .or-sep::after { content: ''; flex: 1; height: 1px; background: #2A2A3C; }
		</style>

		<!-- ─── Header ─── -->
		<div class="page-hd">
			<div>
				<div class="page-title">Passwords</div>
				<div class="page-sub">Zero-knowledge encrypted vault · AES-GCM 256-bit</div>
			</div>
			<div class="vault-status ${existing.hasVault ? "vs-active" : "vs-empty"}">
				<span class="vs-dot"></span>
				${existing.hasVault ? `Vault saved${existing.updatedAt ? ` · ${new Date(existing.updatedAt).toLocaleDateString()}` : ""}` : "No vault yet"}
			</div>
		</div>

		<div class="pw-cols">
			<!-- ─── Left: Vault entries ─── -->
			<div style="display:flex;flex-direction:column;gap:1rem;">

				<!-- Entry list (populated by JS after decrypt) -->
				<div class="vault-card">
					<div class="vault-card-hd">
						<div class="vault-card-title">Vault entries</div>
						<div style="display:flex;gap:.5rem;">
							<button class="btn btn-sm" id="addEntryToggle">+ Add entry</button>
							<button class="btn btn-sm btn-primary" id="saveVaultBtn" style="display:none;">Save vault</button>
						</div>
					</div>
					<div class="vault-card-body">
						<!-- Add entry form (hidden by default) -->
						<div class="add-form" id="addForm" style="display:none;margin-bottom:1rem;">
							<div class="add-form-title">New password entry</div>
							<div class="form-row">
								<div>
									<label class="label" for="newSite">Website / App</label>
									<input class="input" id="newSite" placeholder="github.com" />
								</div>
								<div>
									<label class="label" for="newUsername">Username / Email</label>
									<input class="input" id="newUsername" placeholder="you@example.com" />
								</div>
							</div>
							<div style="margin-top:.65rem;">
								<label class="label" for="newPassword">Password</label>
								<div class="pw-input-wrap">
									<input class="input" id="newPassword" type="password" placeholder="Enter password" />
									<button class="pw-eye" type="button" onclick="togglePw('newPassword',this)">👁</button>
								</div>
							</div>
							<div style="margin-top:.65rem;">
								<label class="label" for="newNotes">Notes (optional)</label>
								<input class="input" id="newNotes" placeholder="2FA backup codes, etc." />
							</div>
							<div style="display:flex;gap:.5rem;margin-top:1rem;">
								<button class="btn btn-primary btn-sm" id="addEntryBtn">Add to vault</button>
								<button class="btn btn-sm" id="cancelEntry">Cancel</button>
							</div>
						</div>

						<!-- Live entry list -->
						<div class="entry-list" id="entryList">
							<div id="lockedNotice" style="text-align:center;padding:2.5rem 1rem;color:#4A4A62;">
								<div style="font-size:2.5rem;margin-bottom:.85rem;">🔒</div>
								<div style="font-weight:700;color:#7A7A92;margin-bottom:.35rem;">Vault is locked</div>
								<div style="font-size:.82rem;">Enter your master password and click <strong>Unlock vault</strong> to view entries.</div>
							</div>
						</div>
					</div>
				</div>

			</div>

			<!-- ─── Right: Master password + info ─── -->
			<div style="display:flex;flex-direction:column;gap:1rem;">

				<div class="master-section">
					<div class="master-hd">🔐 Master password</div>
					<div class="master-sub">Used to encrypt/decrypt locally. Never sent to the server.</div>

					<label class="label" for="masterPw">Master password</label>
					<div class="pw-input-wrap">
						<input class="input" id="masterPw" type="password" placeholder="Your master password" autocomplete="current-password" />
						<button class="pw-eye" type="button" onclick="togglePw('masterPw',this)">👁</button>
					</div>

					<div style="display:grid;gap:.5rem;margin-top:1rem;">
						<button class="btn btn-primary" id="unlockBtn">Unlock vault</button>
						<div class="or-sep">or</div>
						<button class="btn" id="saveBtn">Encrypt + save</button>
					</div>

					<div id="vaultMsg"></div>
				</div>

				<div class="info-card">
					<div class="info-card-title">How it works</div>
					<div class="info-row">
						<div class="info-icon">🔑</div>
						<div class="info-text"><strong>Client-side key derivation</strong>Your master password derives a key via PBKDF2 (210,000 iterations, SHA-256).</div>
					</div>
					<div class="info-row">
						<div class="info-icon">🛡</div>
						<div class="info-text"><strong>AES-GCM 256-bit encryption</strong>Your entries are encrypted in the browser before being sent.</div>
					</div>
					<div class="info-row">
						<div class="info-icon">📦</div>
						<div class="info-text"><strong>Only ciphertext stored</strong>We store: salt, IV, ciphertext, and KDF params — never your password or plain entries.</div>
					</div>
					<div class="info-row">
						<div class="info-icon">🌐</div>
						<div class="info-text"><strong>Zero-knowledge</strong>Even we can't read your vault without your master password.</div>
					</div>
				</div>

			</div>
		</div>

		<script>
		(() => {
			const enc = new TextEncoder();
			const dec = new TextDecoder();
			const b64 = u8 => btoa(String.fromCharCode(...u8));
			const ub64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

			let vaultEntries = [];
			let vaultUnlocked = false;

			async function deriveKey(master, salt, iterations) {
				const km = await crypto.subtle.importKey('raw', enc.encode(master), 'PBKDF2', false, ['deriveKey']);
				return crypto.subtle.deriveKey(
					{ name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
					km, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
				);
			}

			async function encryptVault(master, plaintext) {
				const salt = crypto.getRandomValues(new Uint8Array(16));
				const iv   = crypto.getRandomValues(new Uint8Array(12));
				const iterations = 210000;
				const key  = await deriveKey(master, salt, iterations);
				const ct   = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext));
				return { kdf: 'pbkdf2-sha256', kdf_params: { iterations }, salt: b64(salt), iv: b64(iv), ct: b64(new Uint8Array(ct)) };
			}

			async function decryptVault(master, blob) {
				const key = await deriveKey(master, ub64(blob.salt), blob.kdf_params?.iterations);
				const pt  = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ub64(blob.iv) }, key, ub64(blob.ct));
				return dec.decode(pt);
			}

			function showMsg(text, type) {
				const el = document.getElementById('vaultMsg');
				el.textContent = text;
				el.className = 'show ' + (type === 'ok' ? 'alert alert-success' : type === 'err' ? 'alert alert-error' : 'alert alert-info');
			}

			function renderEntries() {
				const list = document.getElementById('entryList');
				document.getElementById('lockedNotice').style.display = vaultEntries.length > 0 || vaultUnlocked ? 'none' : '';
				const cards = vaultEntries.map((e, i) => {
					const initial = (e.site || '?')[0].toUpperCase();
					return \`<div class="entry">
						<div class="entry-hd">
							<div class="entry-favicon">\${initial}</div>
							<div>
								<div class="entry-site">\${escHtml(e.site || '')}</div>
								<div class="entry-user">\${escHtml(e.username || '')}</div>
							</div>
							<div class="entry-actions">
								<button class="copy-btn" onclick="copyPw(\${i}, this)">Copy PW</button>
								<button class="copy-btn" style="border-color:#2A2A3C;background:rgba(248,113,113,.06);color:#F87171;" onclick="deleteEntry(\${i})">✕</button>
							</div>
						</div>
						<div class="entry-pw">
							<div class="pw-dots" id="pw-\${i}">••••••••</div>
							<button class="show-pw-btn" onclick="toggleEntry(\${i})">Show</button>
						</div>
					</div>\`;
				}).join('');
				list.innerHTML = (cards || (vaultUnlocked ? '<div style="text-align:center;padding:2rem;color:#4A4A62;"><div style="font-size:2rem;margin-bottom:.5rem;">✅</div><div>Vault is empty. Add your first entry above.</div></div>' : '')) + (document.getElementById('lockedNotice')?.outerHTML || '');
				if (!vaultUnlocked && vaultEntries.length === 0) {
					list.innerHTML = document.getElementById('lockedNotice') ? '' : '<div id="lockedNotice" style="text-align:center;padding:2.5rem 1rem;color:#4A4A62;"><div style="font-size:2.5rem;margin-bottom:.85rem;">🔒</div><div style="font-weight:700;color:#7A7A92;margin-bottom:.35rem;">Vault is locked</div><div style="font-size:.82rem;">Enter your master password and click <strong>Unlock vault</strong> to view entries.</div></div>';
				}
			}

			function escHtml(s) {
				return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
			}

			window.toggleEntry = function(i) {
				const el = document.getElementById('pw-' + i);
				const pw = vaultEntries[i]?.password || '';
				el.textContent = el.textContent === '••••••••' ? pw : '••••••••';
			};

			window.copyPw = function(i, btn) {
				navigator.clipboard.writeText(vaultEntries[i]?.password || '').then(() => {
					btn.textContent = 'Copied!'; btn.classList.add('copied');
					setTimeout(() => { btn.textContent = 'Copy PW'; btn.classList.remove('copied'); }, 1800);
				});
			};

			window.deleteEntry = function(i) {
				if (!confirm('Remove this entry from the vault?')) return;
				vaultEntries.splice(i, 1);
				renderEntries();
				document.getElementById('saveVaultBtn').style.display = '';
			};

			window.togglePw = function(id, btn) {
				const input = document.getElementById(id);
				if (input.type === 'password') { input.type = 'text'; btn.textContent = '🙈'; }
				else { input.type = 'password'; btn.textContent = '👁'; }
			};

			// Unlock vault
			document.getElementById('unlockBtn').addEventListener('click', async () => {
				const master = document.getElementById('masterPw').value;
				if (!master) { showMsg('Enter your master password first.', 'err'); return; }
				showMsg('Loading & decrypting…', 'info');
				try {
					const res = await fetch('/passwords/data');
					if (!res.ok) { showMsg('No vault found. Create one by adding entries and saving.', 'err'); return; }
					const blob = await res.json();
					const pt = await decryptVault(master, blob);
					vaultEntries = JSON.parse(pt);
					vaultUnlocked = true;
					renderEntries();
					document.getElementById('saveVaultBtn').style.display = 'none';
					showMsg('Vault unlocked — ' + vaultEntries.length + ' entries loaded.', 'ok');
				} catch (e) {
					showMsg('Wrong master password or corrupted vault.', 'err');
				}
			});

			// Save vault
			document.getElementById('saveBtn').addEventListener('click', async () => {
				const master = document.getElementById('masterPw').value;
				if (!master) { showMsg('Enter your master password first.', 'err'); return; }
				showMsg('Encrypting…', 'info');
				try {
					const blob = await encryptVault(master, JSON.stringify(vaultEntries));
					showMsg('Saving…', 'info');
					const res = await fetch('/passwords', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(blob) });
					if (res.ok) { showMsg('Vault saved successfully.', 'ok'); document.getElementById('saveVaultBtn').style.display = 'none'; }
					else showMsg('Save failed: ' + await res.text(), 'err');
				} catch (e) { showMsg('Encryption error: ' + e.message, 'err'); }
			});

			// Save via header button
			document.getElementById('saveVaultBtn').addEventListener('click', () => {
				document.getElementById('saveBtn').click();
			});

			// Add entry toggle
			document.getElementById('addEntryToggle').addEventListener('click', () => {
				const form = document.getElementById('addForm');
				form.style.display = form.style.display === 'none' ? '' : 'none';
			});
			document.getElementById('cancelEntry').addEventListener('click', () => {
				document.getElementById('addForm').style.display = 'none';
			});

			// Add entry
			document.getElementById('addEntryBtn').addEventListener('click', () => {
				const site     = document.getElementById('newSite').value.trim();
				const username = document.getElementById('newUsername').value.trim();
				const password = document.getElementById('newPassword').value;
				const notes    = document.getElementById('newNotes').value.trim();
				if (!site || !password) { showMsg('Site and password are required.', 'err'); return; }
				vaultEntries.push({ site, username, password, notes });
				renderEntries();
				document.getElementById('addForm').style.display = 'none';
				document.getElementById('newSite').value = '';
				document.getElementById('newUsername').value = '';
				document.getElementById('newPassword').value = '';
				document.getElementById('newNotes').value = '';
				document.getElementById('saveVaultBtn').style.display = '';
				showMsg('Entry added. Click "Save vault" to encrypt and store.', 'info');
			});

		})();
		</script>
		`,
	});
}
