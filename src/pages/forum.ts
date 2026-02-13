import type { Session } from "../session";
import { layout } from "./layout";

export function forumListPage(session: Session | null, posts: Array<{ id: string; title: string; created_at: string; author_name: string; reply_count: number }>): Response {
	const rows = posts
		.map((p) => `
			<tr>
				<td><a href="/forum/${p.id}" style="color:#8B83FF; text-decoration:none; font-weight:700;">${p.title}</a></td>
				<td class="small">${p.author_name}</td>
				<td class="small">${new Date(p.created_at).toLocaleString()}</td>
				<td class="small">${p.reply_count}</td>
			</tr>
		`)
		.join("");

	return layout({
		title: "SapphireAuth — Forum",
		session,
		active: "forum",
		content: `
			<div class="row" style="justify-content:space-between; margin-bottom:1rem;">
				<div>
					<div class="h1">Forum</div>
					<div class="p">Posts + discussions.</div>
				</div>
				${session ? `<a class="btn btn-primary" href="/forum/new">New post</a>` : ``}
			</div>

			<div class="card">
				<table>
					<thead>
						<tr><th>Title</th><th>Author</th><th>Created</th><th>Replies</th></tr>
					</thead>
					<tbody>
						${rows || `<tr><td colspan="4" class="small">No posts yet.</td></tr>`}
					</tbody>
				</table>
			</div>
		`,
	});
}

export function forumNewPage(session: Session): Response {
	return layout({
		title: "SapphireAuth — New Post",
		session,
		active: "forum",
		content: `
			<div class="card">
				<div class="h1">New forum post</div>
				<form method="POST" action="/forum/new">
					<label class="label" for="title">Title</label>
					<input class="input" id="title" name="title" required />
					<label class="label" for="body">Body</label>
					<textarea id="body" name="body" required></textarea>
					<div style="margin-top:1rem;" class="row">
						<button class="btn btn-primary" type="submit">Post</button>
						<a class="btn" href="/forum">Cancel</a>
					</div>
				</form>
			</div>
		`,
	});
}

export function forumDetailPage(session: Session | null, post: { id: string; title: string; body: string; created_at: string; author_name: string; author_id: string }, replies: Array<{ id: string; body: string; created_at: string; author_name: string }>, canModerate: boolean): Response {
	const replyHtml = replies
		.map((r) => `
			<div class="card" style="margin-top:1rem;">
				<div class="small" style="margin-bottom:.5rem;">${r.author_name} · ${new Date(r.created_at).toLocaleString()}</div>
				<div style="white-space:pre-wrap;">${r.body}</div>
			</div>
		`)
		.join("");

	return layout({
		title: `SapphireAuth — ${post.title}`,
		session,
		active: "forum",
		content: `
			<div class="card">
				<div class="row" style="justify-content:space-between;">
					<div>
						<div class="h1">${post.title}</div>
						<div class="small">${post.author_name} · ${new Date(post.created_at).toLocaleString()}</div>
					</div>
					<div class="row">
						${canModerate ? `<form method="POST" action="/forum/${post.id}/delete" onsubmit="return confirm('Delete this post?')"><button class="btn" type="submit">Delete</button></form>` : ``}
						<a class="btn" href="/forum">Back</a>
					</div>
				</div>
				<div style="white-space:pre-wrap; margin-top:1rem;">${post.body}</div>
			</div>

			${replyHtml}

			${session ? `
				<div class="card" style="margin-top:1rem;">
					<div style="font-weight:700; margin-bottom:.5rem;">Reply</div>
					<form method="POST" action="/forum/${post.id}/reply">
						<textarea name="body" required></textarea>
						<div style="margin-top:1rem;">
							<button class="btn btn-primary" type="submit">Send</button>
						</div>
					</form>
				</div>
			` : ``}
		`,
	});
}
