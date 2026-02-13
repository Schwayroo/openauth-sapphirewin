export function errorPage(message: string): Response {
	const html = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>SapphireAuth — Error</title>
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
	<style>
		body { font-family: 'Inter', system-ui, sans-serif; background: #0F0F13; color: #E4E4ED; min-height: 100vh; display:flex; align-items:center; justify-content:center; }
		.box { text-align:center; max-width:520px; padding: 1.5rem; border:1px solid #2A2A3C; background:#1A1A24; border-radius: 1rem; }
		h1 { font-size:1.25rem; margin-bottom:.75rem; color:#F87171; }
		p { color:#7A7A92; margin-bottom:1.25rem; }
		a { display:inline-block; padding:.5rem 1.25rem; background:#6C63FF; color:white; border-radius:.75rem; text-decoration:none; font-weight:600; }
		a:hover { background:#5B52E0; }
	</style>
</head>
<body>
	<div class="box">
		<h1>Something went wrong</h1>
		<p>${message}</p>
		<a href="/dashboard">Back</a>
	</div>
</body>
</html>`;
	return new Response(html, { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } });
}
