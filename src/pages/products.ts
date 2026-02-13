import type { Session } from "../session";
import { layout } from "./layout";

export function productsListPage(session: Session | null, products: Array<{ id: string; title: string; price_cents: number; currency: string; image_urls: string; seller_name: string }>): Response {
	const cards = products
		.map((p) => {
			let images: string[] = [];
			try {
				images = JSON.parse(p.image_urls ?? "[]");
			} catch {}
			const img = images[0] ?? "https://placehold.co/600x400?text=Product";
			const price = (p.price_cents / 100).toFixed(2);
			return `
				<div class="card">
					<img src="${img}" alt="${p.title}" style="width:100%; aspect-ratio: 3/2; border-radius:.85rem; object-fit:cover; border:1px solid #2A2A3C; margin-bottom:.75rem; background:#0F0F13;" />
					<div style="font-weight:700; margin-bottom:.25rem;">${p.title}</div>
					<div class="small" style="margin-bottom:.65rem;">$${price} ${p.currency} · Seller: ${p.seller_name}</div>
					<a class="btn" href="/products/${p.id}">View</a>
				</div>
			`;
		})
		.join("");

	return layout({
		title: "SapphireAuth — Products",
		session,
		active: "products",
		content: `
			<div class="row" style="justify-content:space-between; margin-bottom:1rem;">
				<div>
					<div class="h1">Products</div>
					<div class="p">Browse listings. Images are URLs for now.</div>
				</div>
				${session ? `<a class="btn btn-primary" href="/products/new">New product</a>` : ``}
			</div>
			<div class="grid">${cards || `<div class="card">No products yet.</div>`}</div>
		`,
	});
}

export function productNewPage(session: Session): Response {
	return layout({
		title: "SapphireAuth — New Product",
		session,
		active: "products",
		content: `
			<div class="card">
				<div class="h1">New product</div>
				<div class="p">Create a listing. Add image URLs separated by commas.</div>
				<form method="POST" action="/products/new">
					<label class="label" for="title">Title</label>
					<input class="input" id="title" name="title" required />

					<label class="label" for="description">Description</label>
					<textarea id="description" name="description"></textarea>

					<label class="label" for="price">Price (USD)</label>
					<input class="input" id="price" name="price" placeholder="19.99" required />

					<label class="label" for="images">Image URLs</label>
					<input class="input" id="images" name="images" placeholder="https://... , https://..." />

					<div style="margin-top:1rem;" class="row">
						<button class="btn btn-primary" type="submit">Publish</button>
						<a class="btn" href="/products">Cancel</a>
					</div>
				</form>
			</div>
		`,
	});
}

export function productDetailPage(session: Session | null, product: { id: string; title: string; description: string | null; price_cents: number; currency: string; image_urls: string; seller_name: string; seller_id: string }, canEdit: boolean): Response {
	let images: string[] = [];
	try {
		images = JSON.parse(product.image_urls ?? "[]");
	} catch {}
	const gallery = (images.length ? images : ["https://placehold.co/900x600?text=Product"]).map((u) => `
		<img src="${u}" style="width:100%; border-radius:1rem; border:1px solid #2A2A3C; margin-bottom:.75rem; background:#0F0F13;" />
	`).join(" ");
	const price = (product.price_cents / 100).toFixed(2);

	return layout({
		title: `SapphireAuth — ${product.title}`,
		session,
		active: "products",
		content: `
			<div class="card">
				<div class="row" style="justify-content:space-between;">
					<div>
						<div class="h1">${product.title}</div>
						<div class="small">$${price} ${product.currency} · Seller: ${product.seller_name}</div>
					</div>
					<div class="row">
						${canEdit ? `<a class="btn" href="/products/${product.id}/edit">Edit</a>` : ``}
						<a class="btn" href="/products">Back</a>
					</div>
				</div>
				<div style="margin-top:1rem;">${gallery}</div>
				<div style="white-space:pre-wrap; margin-top:.5rem;">${product.description ?? ""}</div>
			</div>
		`,
	});
}

export function productEditPage(session: Session, product: { id: string; title: string; description: string | null; price_cents: number; currency: string; image_urls: string }): Response {
	let images: string[] = [];
	try { images = JSON.parse(product.image_urls ?? "[]"); } catch {}
	return layout({
		title: "SapphireAuth — Edit Product",
		session,
		active: "products",
		content: `
			<div class="card">
				<div class="h1">Edit product</div>
				<form method="POST" action="/products/${product.id}/edit">
					<label class="label" for="title">Title</label>
					<input class="input" id="title" name="title" required value="${product.title}" />

					<label class="label" for="description">Description</label>
					<textarea id="description" name="description">${product.description ?? ""}</textarea>

					<label class="label" for="price">Price (USD)</label>
					<input class="input" id="price" name="price" required value="${(product.price_cents / 100).toFixed(2)}" />

					<label class="label" for="images">Image URLs</label>
					<input class="input" id="images" name="images" value="${images.join(", ")}" />

					<div style="margin-top:1rem;" class="row">
						<button class="btn btn-primary" type="submit">Save</button>
						<a class="btn" href="/products/${product.id}">Cancel</a>
					</div>
				</form>
			</div>
		`,
	});
}
