import { layout } from "./layout";
import type { Session } from "../session";

export function dashboardPage(session: Session): Response {
	return layout({
		title: "SapphireAuth — Dashboard",
		session,
		active: "dashboard",
		content: `
			<div class="card">
				<div class="h1">Dashboard</div>
				<div class="p">Welcome back. Use the nav to manage products, the forum, and admin tools.</div>
				<div class="row">
					<a class="btn btn-primary" href="/products/new">New product</a>
					<a class="btn" href="/forum/new">New forum post</a>
					<a class="btn" href="/profile">Edit profile</a>
				</div>
				<div style="margin-top:1rem" class="small">
					User: <b>${session.username ?? session.email}</b> · Role: <b>${session.role}</b>
				</div>
			</div>
		`,
	});
}
