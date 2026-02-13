import type { Session } from "../session";
import { layout } from "./layout";

export function adminUsersPage(session: Session, users: Array<{ id: string; email: string; role: string; username: string | null; created_at: string }>): Response {
	const rows = users
		.map(
			(u) => `
			<tr>
				<td style="font-family:monospace; font-size:.8rem;">${u.id}</td>
				<td>${u.email}</td>
				<td>${u.username ?? ""}</td>
				<td>
					<form method="POST" action="/admin/users/${u.id}/role" class="row">
						<select name="role" class="input" style="max-width:160px; padding:.4rem .6rem;">
							<option value="member" ${u.role === "member" ? "selected" : ""}>member</option>
							<option value="moderator" ${u.role === "moderator" ? "selected" : ""}>moderator</option>
							<option value="admin" ${u.role === "admin" ? "selected" : ""}>admin</option>
						</select>
						<button class="btn" type="submit">Save</button>
					</form>
				</td>
				<td class="small">${new Date(u.created_at).toLocaleString()}</td>
			</tr>
		`,
		)
		.join("");

	return layout({
		title: "SapphireAuth — Admin",
		session,
		active: "admin",
		content: `
			<div class="card">
				<div class="h1">Admin</div>
				<div class="p">Manage users + roles. (Products moderation next.)</div>
			</div>

			<div class="card" style="margin-top:1rem;">
				<table>
					<thead>
						<tr><th>ID</th><th>Email</th><th>Username</th><th>Role</th><th>Created</th></tr>
					</thead>
					<tbody>${rows}</tbody>
				</table>
			</div>
		`,
	});
}
