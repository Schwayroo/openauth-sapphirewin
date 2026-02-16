import type { Session } from "../session";
import { layout } from "./layout";
import type { UserSettings } from "../settings";

export function profilePage(
	session: Session,
	user: { role: string; username: string | null; avatar_url: string | null },
	settings: UserSettings,
): Response {
	return layout({
		title: "SapphireVault — Account",
		session,
		active: "profile",
		content: `
			<div class="grid">
				<div class="card">
					<div class="h1">Account</div>
					<div class="p">Profile + optional Telegram mirror.</div>

					<div class="row" style="margin-bottom:1rem;">
						<img src="${user.avatar_url ?? "https://www.gravatar.com/avatar/?d=mp"}" alt="avatar" style="width:64px;height:64px;border-radius:999px;border:1px solid #2A2A3C;object-fit:cover;background:#0F0F13;" />
						<div>
							<div style="font-weight:700;">${user.username ?? "(no username yet)"}</div>
							<div class="small">${session.email} · Role: ${user.role}</div>
						</div>
					</div>

					<form method="POST" action="/profile">
						<label class="label" for="username">Username</label>
						<input class="input" id="username" name="username" placeholder="ex: Chris_Dev" value="${user.username ?? ""}" />

						<label class="label" for="avatar_url">Profile picture URL</label>
						<input class="input" id="avatar_url" name="avatar_url" placeholder="https://..." value="${user.avatar_url ?? ""}" />

						<div style="margin-top:1rem;">
							<button class="btn btn-primary" type="submit">Save</button>
						</div>
					</form>
				</div>

				<div class="card">
					<div class="h1">Telegram mirror</div>
					<div class="p">When enabled, image/video uploads get forwarded to your Telegram group.</div>

					<form method="POST" action="/profile/telegram">
						<label class="label" for="telegram_enabled">Enabled</label>
						<select class="input" id="telegram_enabled" name="telegram_enabled">
							<option value="0" ${settings.telegram_mirror_enabled ? "" : "selected"}>Off</option>
							<option value="1" ${settings.telegram_mirror_enabled ? "selected" : ""}>On</option>
						</select>

						<label class="label" for="telegram_bot_token">Your bot token</label>
						<input class="input" id="telegram_bot_token" name="telegram_bot_token" placeholder="123456:ABC..." value="${settings.telegram_bot_token ?? ""}" />
						<div class="small" style="margin-top:.5rem;">This is stored in your account settings so your uploads can be forwarded. Treat it like a password.</div>

						<label class="label" for="telegram_chat_id">Telegram chat id (group)</label>
						<input class="input" id="telegram_chat_id" name="telegram_chat_id" placeholder="ex: -1001234567890" value="${settings.telegram_chat_id ?? ""}" />
						<div class="small" style="margin-top:.5rem;">Tip: add your bot to the group, then use @RawDataBot or getUpdates to find the chat id.</div>

						<div style="margin-top:1rem;">
							<button class="btn btn-primary" type="submit">Save Telegram settings</button>
						</div>
					</form>
				</div>
			</div>
		`,
	});
}
