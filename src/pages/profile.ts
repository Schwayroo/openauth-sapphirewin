import type { Session } from "../session";
import { appShell } from "./appshell";
import type { UserSettings } from "../settings";

export function profilePage(
	session: Session,
	user: { role: string; username: string | null; avatar_url: string | null },
	settings: UserSettings,
): Response {
	const avatarSrc = user.avatar_url ?? `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(session.email)}&backgroundColor=6C63FF&textColor=ffffff`;

	return appShell(session, {
		title: "SapphireVault — Settings",
		active: "settings",
		content: `
		<style>
			.page-hd { margin-bottom: 1.25rem; }
			.page-title { font-size: 1.45rem; font-weight: 900; letter-spacing: -.025em; }
			.page-sub { color: #7A7A92; font-size: .85rem; margin-top: .2rem; }

			/* ── Settings layout ── */
			.settings-layout { display: grid; gap: 1rem; }

			/* ── Section card ── */
			.setting-card { border: 1px solid #2A2A3C; border-radius: 1.1rem; background: rgba(22,22,32,.8); overflow: hidden; }
			.setting-card-hd { padding: 1rem 1.25rem; border-bottom: 1px solid #1E1E2E; display: flex; align-items: center; gap: .75rem; }
			.setting-card-icon { font-size: 1.2rem; }
			.setting-card-title { font-size: .95rem; font-weight: 700; }
			.setting-card-sub { font-size: .78rem; color: #7A7A92; margin-top: .1rem; }
			.setting-card-body { padding: 1.25rem; }

			/* ── Profile section ── */
			.profile-hero { display: flex; align-items: center; gap: 1.1rem; margin-bottom: 1.25rem; }
			.profile-avatar { width: 72px; height: 72px; border-radius: 999px; border: 2px solid #2A2A3C; object-fit: cover; background: #1A1A24; flex-shrink: 0; }
			.profile-info { min-width: 0; }
			.profile-name { font-size: 1.1rem; font-weight: 800; letter-spacing: -.02em; }
			.profile-email { font-size: .82rem; color: #7A7A92; margin-top: .2rem; }
			.profile-role {
				display: inline-flex; align-items: center; gap: .35rem;
				margin-top: .4rem; padding: .2rem .6rem; border-radius: 999px;
				font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em;
				background: rgba(108,99,255,.12); border: 1px solid rgba(108,99,255,.25); color: #A7A7FF;
			}

			/* ── Telegram card ── */
			.tg-status {
				display: flex; align-items: center; gap: .65rem;
				padding: .85rem 1rem; border-radius: .85rem;
				background: rgba(15,15,19,.6); border: 1px solid #2A2A3C;
				margin-bottom: 1rem;
			}
			.tg-status-dot { width: 9px; height: 9px; border-radius: 999px; flex-shrink: 0; }
			.tg-status-on  .tg-status-dot { background: #34D399; box-shadow: 0 0 6px rgba(52,211,153,.6); }
			.tg-status-off .tg-status-dot { background: #3A3A4C; }
			.tg-status-text strong { display: block; font-size: .875rem; font-weight: 700; margin-bottom: .08rem; }
			.tg-status-text span { font-size: .78rem; color: #7A7A92; }
			.tg-how {
				border: 1px solid rgba(108,99,255,.2); border-radius: .85rem;
				background: rgba(108,99,255,.05); padding: 1rem;
				margin-top: 1.25rem;
			}
			.tg-how-title { font-size: .82rem; font-weight: 700; color: #A7A7FF; margin-bottom: .6rem; }
			.tg-step { display: flex; gap: .6rem; align-items: flex-start; margin-bottom: .5rem; font-size: .82rem; color: #A7A7BD; }
			.tg-step-n {
				width: 20px; height: 20px; border-radius: 999px; flex-shrink: 0;
				background: rgba(108,99,255,.2); border: 1px solid rgba(108,99,255,.3);
				display: flex; align-items: center; justify-content: center;
				font-size: .7rem; font-weight: 700; color: #A7A7FF;
			}

			/* ── Danger zone ── */
			.danger-zone { border: 1px solid rgba(248,113,113,.2); border-radius: 1.1rem; background: rgba(248,113,113,.03); overflow: hidden; }
			.danger-zone .setting-card-hd { border-bottom-color: rgba(248,113,113,.15); }
			.danger-zone .setting-card-title { color: #F87171; }
			.danger-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
			.danger-info strong { display: block; font-size: .875rem; font-weight: 700; margin-bottom: .2rem; }
			.danger-info span { font-size: .82rem; color: #7A7A92; }
		</style>

		<div class="page-hd">
			<div class="page-title">Settings</div>
			<div class="page-sub">Manage your account, profile, and integrations</div>
		</div>

		<div class="settings-layout">

			<!-- ─── Profile ─── -->
			<div class="setting-card">
				<div class="setting-card-hd">
					<span class="setting-card-icon">👤</span>
					<div>
						<div class="setting-card-title">Profile</div>
						<div class="setting-card-sub">Your public identity and avatar</div>
					</div>
				</div>
				<div class="setting-card-body">
					<div class="profile-hero">
						<img class="profile-avatar" src="${avatarSrc}" alt="avatar" id="avatarPreview" />
						<div class="profile-info">
							<div class="profile-name">${user.username ?? session.email.split("@")[0]}</div>
							<div class="profile-email">${session.email}</div>
							<div class="profile-role">${user.role}</div>
						</div>
					</div>

					<form method="POST" action="/profile">
						<label class="label" for="username">Username</label>
						<input class="input" id="username" name="username" placeholder="e.g. Chris_Dev" value="${user.username ?? ""}" />
						<div class="small" style="margin-top:.35rem;">3–20 chars · letters, numbers, underscore</div>

						<label class="label" for="avatar_url">Profile picture URL</label>
						<input class="input" id="avatar_url" name="avatar_url" placeholder="https://..." value="${user.avatar_url ?? ""}" oninput="previewAvatar(this.value)" />
						<div class="small" style="margin-top:.35rem;">Leave blank to use your initials avatar</div>

						<div style="margin-top:1.25rem;">
							<button class="btn btn-primary" type="submit">Save profile</button>
						</div>
					</form>
				</div>
			</div>

			<!-- ─── Telegram mirror (photos only) ─── -->
			<div class="setting-card">
				<div class="setting-card-hd">
					<span class="setting-card-icon">📲</span>
					<div>
						<div class="setting-card-title">Telegram mirror</div>
						<div class="setting-card-sub">Automatically forward photo uploads to a Telegram group</div>
					</div>
				</div>
				<div class="setting-card-body">

					<div class="tg-status ${settings.telegram_mirror_enabled ? "tg-status-on" : "tg-status-off"}">
						<div class="tg-status-dot"></div>
						<div class="tg-status-text">
							<strong>${settings.telegram_mirror_enabled ? "Mirroring active" : "Mirroring off"}</strong>
							<span>${settings.telegram_mirror_enabled
								? `Photos are being forwarded to chat ${settings.telegram_chat_id ?? "?"}`
								: "Enable below and configure your bot to start mirroring"
							}</span>
						</div>
					</div>

					<form method="POST" action="/profile/telegram">
						<label class="label" for="telegram_enabled">Mirror status</label>
						<select class="input" id="telegram_enabled" name="telegram_enabled">
							<option value="0" ${settings.telegram_mirror_enabled ? "" : "selected"}>Off — don't mirror photos</option>
							<option value="1" ${settings.telegram_mirror_enabled ? "selected" : ""}>On — mirror photos to Telegram</option>
						</select>
						<div class="small" style="margin-top:.35rem;">Only <strong>image</strong> uploads are mirrored. Videos and other files are not forwarded.</div>

						<label class="label" for="telegram_bot_token">Bot token</label>
						<input class="input" id="telegram_bot_token" name="telegram_bot_token" type="password" placeholder="123456:ABC-DEF…" value="${settings.telegram_bot_token ?? ""}" autocomplete="off" />
						<div class="small" style="margin-top:.35rem;">Create a bot with @BotFather and paste the token here. Treat it like a password.</div>

						<label class="label" for="telegram_chat_id">Chat / Group ID</label>
						<input class="input" id="telegram_chat_id" name="telegram_chat_id" placeholder="-1001234567890" value="${settings.telegram_chat_id ?? ""}" />
						<div class="small" style="margin-top:.35rem;">Add your bot to the group, then use @RawDataBot or the Telegram API to find the chat ID (negative number for groups).</div>

						<div style="margin-top:1.25rem;display:flex;gap:.65rem;flex-wrap:wrap;">
							<button class="btn btn-primary" type="submit">Save Telegram settings</button>
						</div>
					</form>

					<div class="tg-how">
						<div class="tg-how-title">How to set up</div>
						<div class="tg-step"><span class="tg-step-n">1</span> Open Telegram and message <strong>@BotFather</strong> → /newbot</div>
						<div class="tg-step"><span class="tg-step-n">2</span> Copy the bot token and paste it above</div>
						<div class="tg-step"><span class="tg-step-n">3</span> Add your bot to a private group or channel</div>
						<div class="tg-step"><span class="tg-step-n">4</span> Get the chat ID using @RawDataBot or the getUpdates API</div>
						<div class="tg-step"><span class="tg-step-n">5</span> Paste the chat ID, enable mirroring, and save</div>
					</div>
				</div>
			</div>

			<!-- ─── Account info ─── -->
			<div class="setting-card">
				<div class="setting-card-hd">
					<span class="setting-card-icon">ℹ</span>
					<div>
						<div class="setting-card-title">Account info</div>
						<div class="setting-card-sub">Your account details</div>
					</div>
				</div>
				<div class="setting-card-body">
					<div style="display:grid;gap:.65rem;">
						<div style="display:flex;justify-content:space-between;padding:.7rem 0;border-bottom:1px solid #1A1A2A;font-size:.875rem;">
							<span style="color:#7A7A92;">Email</span><span>${session.email}</span>
						</div>
						<div style="display:flex;justify-content:space-between;padding:.7rem 0;border-bottom:1px solid #1A1A2A;font-size:.875rem;">
							<span style="color:#7A7A92;">Role</span><span>${user.role}</span>
						</div>
						<div style="display:flex;justify-content:space-between;padding:.7rem 0;font-size:.875rem;">
							<span style="color:#7A7A92;">Authentication</span><span>Email OTP</span>
						</div>
					</div>
					<div style="margin-top:1.25rem;">
						<a class="btn btn-danger" href="/logout">Sign out</a>
					</div>
				</div>
			</div>

		</div>

		<script>
			function previewAvatar(url) {
				const img = document.getElementById('avatarPreview');
				if (url && /^https?:\\/\\//.test(url)) img.src = url;
			}
		</script>
		`,
	});
}
