import type { Session } from "../session";
import { layout } from "./layout";

export function profilePage(session: Session, user: { role: string; username: string | null; avatar_url: string | null }): Response {
	return layout({
		title: "SapphireAuth — Profile",
		session,
		active: "profile",
		content: `
			<div class="card">
				<div class="h1">Your Profile</div>
				<div class="p">Set a username + profile picture (paste an image URL for now).</div>

				<div class="row" style="margin-bottom:1rem;">
					<img src="${user.avatar_url ?? "https://www.gravatar.com/avatar/?d=mp"}" alt="avatar" style="width:64px;height:64px;border-radius:999px;border:1px solid #2A2A3C;object-fit:cover;background:#0F0F13;" />
					<div>
						<div style="font-weight:700;">${user.username ?? "(no username yet)"}</div>
						<div class="small">Role: ${user.role}</div>
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
		`,
	});
}
