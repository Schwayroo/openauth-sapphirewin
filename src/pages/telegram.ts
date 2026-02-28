import type { Session } from "../session";
import { appShell } from "./appshell";
import type { VaultFileRow } from "../vault";

function escapeHtml(s: string) {
	return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}

export interface TelegramPageOpts {
	images: VaultFileRow[];
	hasBotConfig: boolean;
	botToken: string | null;
	chatId: string | null;
	telegramEnabled: boolean;
}

export function telegramPage(session: Session, opts: TelegramPageOpts): Response {
	const { images, hasBotConfig, botToken, chatId, telegramEnabled } = opts;

	const photoItems = images.map(f => {
		const name = escapeHtml(f.file_name);
		return `
		<div class="tg-item" data-name="${escapeHtml(f.file_name.toLowerCase())}" data-id="${f.id}">
			<label class="tg-label">
				<input type="checkbox" class="tg-check" value="${f.id}" />
				<div class="tg-thumb">
					<img src="/vault/${f.id}/thumb" loading="lazy" alt="${name}" />
					<div class="tg-check-overlay">
						<svg class="check-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="20 6 9 17 4 12"/>
						</svg>
					</div>
				</div>
				<div class="tg-name">${name}</div>
			</label>
		</div>`;
	}).join("");

	return appShell(session, {
		title: "SapphireVault — Telegram",
		active: "telegram",
		content: `
		<style>
			.page-hd { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: .75rem; margin-bottom: 1.25rem; }
			.page-title { font-size: 1.45rem; font-weight: 900; letter-spacing: -.025em; }
			.page-sub { color: #7A7A92; font-size: .85rem; margin-top: .2rem; }

			/* Config accordion */
			.config-accordion { border: 1px solid #2A2A3C; border-radius: 1rem; margin-bottom: 1.25rem; overflow: hidden; }
			.config-header { display: flex; align-items: center; justify-content: space-between; padding: .85rem 1.1rem; cursor: pointer; background: rgba(20,20,30,.6); user-select: none; }
			.config-header:hover { background: rgba(108,99,255,.06); }
			.config-header-left { display: flex; align-items: center; gap: .65rem; }
			.config-status { display: inline-flex; align-items: center; gap: .3rem; font-size: .75rem; padding: .2rem .55rem; border-radius: 999px; font-weight: 600; }
			.config-status.ok { background: rgba(16,185,129,.12); color: #34d399; border: 1px solid rgba(16,185,129,.25); }
			.config-status.missing { background: rgba(239,68,68,.1); color: #f87171; border: 1px solid rgba(239,68,68,.2); }
			.config-arrow { color: #7A7A92; font-size: .8rem; transition: transform .2s; }
			.config-accordion.open .config-arrow { transform: rotate(180deg); }
			.config-body { display: none; padding: 1.1rem; border-top: 1px solid #2A2A3C; background: rgba(15,15,20,.5); }
			.config-accordion.open .config-body { display: block; }
			.config-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
			@media(max-width:520px) { .config-grid { grid-template-columns: 1fr; } }

			/* Selection toolbar */
			.tg-toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .75rem; margin-bottom: 1rem; padding: .75rem 1rem; background: rgba(20,20,30,.6); border: 1px solid #2A2A3C; border-radius: .85rem; }
			.tg-toolbar-left { display: flex; align-items: center; gap: .85rem; }
			#selectAllBtn { background: none; border: 1px solid #3A3A52; color: #9A9AB2; padding: .3rem .75rem; border-radius: .5rem; font-size: .8rem; cursor: pointer; transition: all .14s; }
			#selectAllBtn:hover { border-color: rgba(108,99,255,.5); color: #C4C4D4; }
			#selectedCount { font-size: .82rem; color: #7A7A92; }
			#sendBtn {
				display: flex; align-items: center; gap: .45rem;
				background: linear-gradient(135deg, #229ED9 0%, #1a7fb5 100%);
				border: none; color: white; font-weight: 700; font-size: .88rem;
				padding: .55rem 1.15rem; border-radius: .65rem; cursor: pointer;
				transition: opacity .15s, transform .1s; box-shadow: 0 4px 14px rgba(34,158,217,.35);
			}
			#sendBtn:hover { opacity: .9; transform: translateY(-1px); }
			#sendBtn:disabled { opacity: .45; cursor: not-allowed; transform: none; }
			#sendBtn svg { flex-shrink: 0; }

			/* Photo grid */
			.tg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(155px, 1fr)); gap: .75rem; }
			.tg-item { position: relative; }
			.tg-label { display: block; cursor: pointer; }
			.tg-check { position: absolute; opacity: 0; pointer-events: none; }
			.tg-thumb {
				aspect-ratio: 1; border: 2px solid #2A2A3C; border-radius: .85rem; overflow: hidden;
				position: relative; transition: border-color .15s, box-shadow .15s;
				background: #0F0F18;
			}
			.tg-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
			.tg-check-overlay {
				position: absolute; inset: 0; background: rgba(108,99,255,.25);
				display: flex; align-items: center; justify-content: center;
				opacity: 0; transition: opacity .15s;
				border-radius: .75rem;
			}
			.check-icon { color: white; filter: drop-shadow(0 0 4px rgba(0,0,0,.8)); }
			.tg-check:checked ~ .tg-thumb { border-color: #6C63FF; box-shadow: 0 0 0 3px rgba(108,99,255,.25); }
			.tg-check:checked ~ .tg-thumb .tg-check-overlay { opacity: 1; }
			.tg-name { font-size: .72rem; color: #7A7A92; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center; margin-top: .35rem; padding: 0 .2rem; }

			/* Send progress overlay */
			#sendOverlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 999; align-items: center; justify-content: center; }
			#sendOverlay.show { display: flex; }
			.send-modal { background: #1A1A24; border: 1px solid #2A2A3C; border-radius: 1.2rem; padding: 2rem 2.5rem; text-align: center; max-width: 340px; width: 90%; }
			.send-spinner { width: 44px; height: 44px; border: 3px solid rgba(108,99,255,.2); border-top-color: #6C63FF; border-radius: 50%; animation: spin .8s linear infinite; margin: 0 auto 1rem; }
			@keyframes spin { to { transform: rotate(360deg); } }
			.send-modal h3 { font-size: 1rem; font-weight: 700; color: #E4E4ED; margin-bottom: .4rem; }
			.send-modal p { font-size: .83rem; color: #7A7A92; }

			/* Result toast */
			#toast { position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%); padding: .65rem 1.25rem; border-radius: .7rem; font-size: .86rem; font-weight: 600; z-index: 1000; opacity: 0; transition: opacity .3s; pointer-events: none; }
			#toast.show { opacity: 1; }
			#toast.success { background: rgba(16,185,129,.9); color: white; }
			#toast.error { background: rgba(239,68,68,.9); color: white; }

			/* Empty */
			.empty-state { text-align: center; padding: 4rem 1rem; color: #4A4A62; border: 1px dashed #2A2A3C; border-radius: 1.1rem; }
			.empty-state-icon { font-size: 3rem; margin-bottom: 1rem; opacity: .45; }
			.empty-state h3 { font-size: 1.05rem; font-weight: 700; color: #7A7A92; margin-bottom: .5rem; }
			.empty-state p { font-size: .85rem; margin-bottom: 1.25rem; }

			/* Search count */
			#searchCount { font-size: .8rem; color: #7A7A92; margin-bottom: .65rem; min-height: 1.2em; }
		</style>

		<div class="page-hd">
			<div>
				<div class="page-title">Telegram Send</div>
				<div class="page-sub">Select photos to send to your Telegram chat · ${images.length} image${images.length !== 1 ? "s" : ""} available</div>
			</div>
		</div>

		<!-- Bot config accordion -->
		<div class="config-accordion" id="configAccordion">
			<div class="config-header" onclick="this.parentElement.classList.toggle('open')">
				<div class="config-header-left">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
						<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
					</svg>
					<span style="font-weight:600;font-size:.9rem;">Bot Configuration</span>
					<span class="config-status ${hasBotConfig ? "ok" : "missing"}">${hasBotConfig ? "✓ Connected" : "⚠ Not set up"}</span>
				</div>
				<span class="config-arrow">▼</span>
			</div>
			<div class="config-body">
				<form method="POST" action="/profile/telegram">
					<div class="config-grid">
						<div>
							<label class="label" style="margin-bottom:.35rem;">Bot Token</label>
							<input class="input" name="telegram_bot_token" type="password" placeholder="123456:ABC-…" value="${botToken ? escapeHtml(botToken) : ""}" autocomplete="off" />
						</div>
						<div>
							<label class="label" style="margin-bottom:.35rem;">Chat ID</label>
							<input class="input" name="telegram_chat_id" placeholder="-100123456789" value="${chatId ? escapeHtml(chatId) : ""}" autocomplete="off" />
						</div>
					</div>
					<div style="margin-top:.85rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
						<label style="display:flex;align-items:center;gap:.45rem;font-size:.85rem;color:#C4C4D4;cursor:pointer;">
							<input type="checkbox" name="telegram_enabled" value="1" ${telegramEnabled ? "checked" : ""} style="accent-color:#6C63FF;" />
							Auto-mirror new uploads to Telegram
						</label>
						<button class="btn btn-primary btn-sm" type="submit">Save settings</button>
					</div>
					<p style="font-size:.75rem;color:#5A5A72;margin-top:.65rem;">
						Need help? <a href="https://core.telegram.org/bots#botfather" target="_blank" rel="noopener" style="color:#6C63FF;">Create a bot via BotFather</a>, then add it to your channel/group and get the Chat ID.
					</p>
				</form>
			</div>
		</div>

		${!hasBotConfig ? `
		<div class="alert-info" style="margin-bottom:1.25rem;">
			Configure your Telegram bot above before sending photos.
		</div>` : ""}

		${images.length > 0 ? `
		<!-- Selection toolbar -->
		<div class="tg-toolbar">
			<div class="tg-toolbar-left">
				<button id="selectAllBtn" type="button">Select all</button>
				<span id="selectedCount">0 selected</span>
			</div>
			<button id="sendBtn" type="button" disabled>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
				</svg>
				Send to Telegram
			</button>
		</div>

		<div id="searchCount"></div>

		<div class="tg-grid" id="tgGrid">
			${photoItems}
		</div>` : `
		<div class="empty-state">
			<div class="empty-state-icon">📷</div>
			<h3>No photos available</h3>
			<p>Upload images from the Files page first.</p>
			<a class="btn btn-primary" href="/vault">Go to Files →</a>
		</div>`}

		<!-- Send progress overlay -->
		<div id="sendOverlay">
			<div class="send-modal">
				<div class="send-spinner"></div>
				<h3>Sending photos…</h3>
				<p id="sendProgress">Preparing…</p>
			</div>
		</div>

		<div id="toast"></div>

		<script>
		(function() {
			const grid = document.getElementById('tgGrid');
			const sendBtn = document.getElementById('sendBtn');
			const selectAllBtn = document.getElementById('selectAllBtn');
			const countEl = document.getElementById('selectedCount');
			const overlay = document.getElementById('sendOverlay');
			const progressEl = document.getElementById('sendProgress');
			const toast = document.getElementById('toast');
			if (!grid) return;

			let allSelected = false;

			function getChecked() {
				return [...grid.querySelectorAll('.tg-check:checked')].map(el => el.value);
			}

			function updateToolbar() {
				const checked = getChecked();
				const n = checked.length;
				countEl.textContent = n === 0 ? '0 selected' : n + ' selected';
				sendBtn.disabled = n === 0 ${!hasBotConfig ? "|| true" : ""};
				const total = grid.querySelectorAll('.tg-check:not([style*="display:none"])').length;
				allSelected = n === total && total > 0;
				selectAllBtn.textContent = allSelected ? 'Deselect all' : 'Select all';
			}

			grid.addEventListener('change', updateToolbar);

			selectAllBtn.addEventListener('click', () => {
				const checks = [...grid.querySelectorAll('.tg-item:not([style*="display:none"]) .tg-check')];
				const shouldSelect = !allSelected;
				checks.forEach(c => { c.checked = shouldSelect; });
				updateToolbar();
			});

			function showToast(msg, type) {
				toast.textContent = msg;
				toast.className = 'show ' + type;
				setTimeout(() => { toast.className = ''; }, 3500);
			}

			sendBtn.addEventListener('click', async () => {
				const ids = getChecked();
				if (!ids.length) return;
				overlay.classList.add('show');
				progressEl.textContent = 'Sending ' + ids.length + ' photo' + (ids.length > 1 ? 's' : '') + '…';
				try {
					const res = await fetch('/telegram/send', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ fileIds: ids }),
					});
					const data = await res.json().catch(() => ({}));
					overlay.classList.remove('show');
					if (res.ok) {
						showToast('✓ ' + (data.sent ?? ids.length) + ' photo' + (ids.length > 1 ? 's' : '') + ' sent!', 'success');
						// deselect all
						grid.querySelectorAll('.tg-check').forEach(c => { c.checked = false; });
						updateToolbar();
					} else {
						showToast('Send failed: ' + (data.error ?? 'Unknown error'), 'error');
					}
				} catch(e) {
					overlay.classList.remove('show');
					showToast('Network error — check your connection', 'error');
				}
			});

			// Global search
			window.applySearch = function(q) {
				const ql = q.toLowerCase();
				let shown = 0, total = 0;
				grid.querySelectorAll('.tg-item').forEach(el => {
					const match = !ql || el.dataset.name?.includes(ql);
					el.style.display = match ? '' : 'none';
					total++;
					if (match) shown++;
				});
				const ctr = document.getElementById('searchCount');
				if (ctr) ctr.textContent = ql ? (shown + ' of ' + total + ' photos match') : '';
				updateToolbar();
			};

			updateToolbar();
		})();
		</script>
		`,
	});
}
