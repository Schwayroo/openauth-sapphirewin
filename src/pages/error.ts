export function errorPage(message: string, status = 400): Response {
	const html = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>SapphireVault — Error</title>
	<link rel="icon" href="/logo.webp" type="image/webp" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
	<style>
		*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
		body {
			font-family: 'Inter', system-ui, sans-serif;
			background: radial-gradient(900px 500px at 50% 10%, rgba(108,99,255,.15), transparent 60%), #0F0F13;
			color: #E4E4ED; min-height: 100vh;
			display: flex; align-items: center; justify-content: center; padding: 1.5rem;
		}
		.box {
			width: 100%; max-width: 480px; text-align: center;
			border: 1px solid #2A2A3C; background: rgba(26,26,36,.95);
			border-radius: 1.25rem; padding: 2.5rem 2rem;
			box-shadow: 0 40px 80px rgba(0,0,0,.5);
		}
		.brand { display: flex; align-items: center; justify-content: center; gap: .55rem; margin-bottom: 2rem; }
		.brand img { width: 28px; height: 28px; object-fit: contain; }
		.brand-name { font-size: 1rem; font-weight: 800; color: #6C63FF; letter-spacing: -.02em; }
		.brand-name span { color: #E4E4ED; }
		.error-icon { font-size: 3rem; margin-bottom: 1.25rem; }
		h1 { font-size: 1.35rem; font-weight: 800; color: #F87171; margin-bottom: .75rem; letter-spacing: -.02em; }
		p { color: #7A7A92; margin-bottom: 1.75rem; font-size: .9rem; line-height: 1.65; }
		.actions { display: flex; justify-content: center; gap: .65rem; flex-wrap: wrap; }
		a {
			display: inline-flex; align-items: center; padding: .6rem 1.3rem;
			border-radius: .75rem; text-decoration: none; font-weight: 600; font-size: .9rem;
			transition: all .15s ease;
		}
		.btn-home { background: #6C63FF; color: white; border: 1px solid #6C63FF; }
		.btn-home:hover { background: #5B52E0; border-color: #5B52E0; transform: translateY(-1px); }
		.btn-back { border: 1px solid #2A2A3C; color: #7A7A92; }
		.btn-back:hover { border-color: #3A3A4C; color: #E4E4ED; background: rgba(255,255,255,.04); transform: translateY(-1px); }
	</style>
</head>
<body>
	<div class="box">
		<div class="brand">
			<img src="/logo.webp" alt="SapphireVault" />
			<span class="brand-name">Sapphire<span>Vault</span></span>
		</div>
		<div class="error-icon">⚠️</div>
		<h1>Something went wrong</h1>
		<p>${message}</p>
		<div class="actions">
			<a class="btn-back" onclick="history.back()">← Go back</a>
			<a class="btn-home" href="/">Home</a>
		</div>
	</div>
</body>
</html>`;
	return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}
