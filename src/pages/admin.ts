import type { Session } from "../session";
import { layout } from "./layout";

export function adminUsersPage(session: Session, users: Array<{ id: string; email: string; role: string; username: string | null; created_at: string }>): Response {
	const rows = users.map((u) => {
		const roleColors: Record<string, string> = {
			admin:     "rgba(248,113,113,.12);border:1px solid rgba(248,113,113,.3);color:#F87171",
			moderator: "rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.25);color:#FBB040",
			member:    "rgba(122,122,146,.08);border:1px solid #2A2A3C;color:#7A7A92",
		};
		const badge = roleColors[u.role] ?? roleColors.member;
		const initial = u.email[0].toUpperCase();
		return `
		<tr>
			<td>
				<div style="display:flex;align-items:center;gap:.65rem;">
					<div style="width:32px;height:32px;border-radius:999px;background:linear-gradient(135deg,#6C63FF,#a78bfa);display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:700;color:white;flex-shrink:0;">${initial}</div>
					<div>
						<div style="font-weight:600;font-size:.875rem;">${u.email}</div>
						<div style="font-size:.75rem;color:#5A5A72;">${u.username ?? "no username"}</div>
					</div>
				</div>
			</td>
			<td>
				<span style="padding:.22rem .6rem;border-radius:999px;font-size:.75rem;font-weight:600;background:${badge};">${u.role}</span>
			</td>
			<td>
				<form method="POST" action="/admin/users/${u.id}/role" style="display:flex;gap:.5rem;align-items:center;">
					<select name="role" class="input" style="max-width:150px;padding:.38rem .65rem;font-size:.82rem;">
						<option value="member"    ${u.role === "member"    ? "selected" : ""}>member</option>
						<option value="moderator" ${u.role === "moderator" ? "selected" : ""}>moderator</option>
						<option value="admin"     ${u.role === "admin"     ? "selected" : ""}>admin</option>
					</select>
					<button class="btn btn-sm" type="submit">Save</button>
				</form>
			</td>
			<td class="small" style="white-space:nowrap;">${new Date(u.created_at).toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric" })}</td>
			<td style="font-family:monospace;font-size:.72rem;color:#4A4A62;">${u.id.slice(0, 8)}…</td>
		</tr>`;
	}).join("");

	return layout({
		title: "SapphireVault — Admin",
		session,
		active: "admin",
		content: `
		<style>
			.admin-hd { margin-bottom: 1.25rem; }
			.admin-title { font-size: 1.45rem; font-weight: 900; letter-spacing: -.025em; }
			.admin-sub { color: #7A7A92; font-size: .85rem; margin-top: .2rem; }
			.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.25rem; }
			@media (max-width: 600px) { .stats-row { grid-template-columns: 1fr; } }
			.stat { border: 1px solid #2A2A3C; border-radius: 1rem; background: rgba(22,22,32,.8); padding: 1.1rem; text-align: center; }
			.stat-n { font-size: 1.8rem; font-weight: 900; color: #6C63FF; letter-spacing: -.03em; }
			.stat-l { color: #7A7A92; font-size: .8rem; margin-top: .25rem; }
			.admin-table-card { border: 1px solid #2A2A3C; border-radius: 1.1rem; background: rgba(22,22,32,.8); overflow: hidden; }
			.admin-table-hd { padding: 1rem 1.25rem; border-bottom: 1px solid #1E1E2E; display: flex; align-items: center; justify-content: space-between; }
			.admin-table-title { font-size: .95rem; font-weight: 700; }
			table { width: 100%; border-collapse: collapse; }
			th, td { text-align: left; padding: .85rem 1.25rem; border-bottom: 1px solid #1A1A2A; font-size: .875rem; }
			tr:last-child td { border-bottom: none; }
			th { color: #5A5A72; font-size: .72rem; text-transform: uppercase; letter-spacing: .08em; font-weight: 600; background: rgba(15,15,19,.4); }
			tr:hover td { background: rgba(255,255,255,.015); }
		</style>

		<div class="admin-hd">
			<div class="admin-title">Admin panel</div>
			<div class="admin-sub">Manage users, roles, and platform settings</div>
		</div>

		<div class="stats-row">
			<div class="stat"><div class="stat-n">${users.length}</div><div class="stat-l">Total users</div></div>
			<div class="stat"><div class="stat-n">${users.filter(u => u.role === "admin").length}</div><div class="stat-l">Admins</div></div>
			<div class="stat"><div class="stat-n">${users.filter(u => u.role === "member").length}</div><div class="stat-l">Members</div></div>
		</div>

		<div class="admin-table-card">
			<div class="admin-table-hd">
				<div class="admin-table-title">Users</div>
				<div class="small">${users.length} account${users.length !== 1 ? "s" : ""}</div>
			</div>
			<table>
				<thead>
					<tr>
						<th>User</th>
						<th>Role</th>
						<th>Change role</th>
						<th>Joined</th>
						<th>ID</th>
					</tr>
				</thead>
				<tbody>${rows}</tbody>
			</table>
		</div>
		`,
	});
}
