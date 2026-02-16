import { layout } from "./layout";

export function homePage(): Response {
	return layout({
		title: "SapphireVault — Secure Passwords + Private Files",
		session: null,
		active: undefined,
		variant: "marketing",
		content: `
			<style>
				.hero { display:grid; grid-template-columns: 1.15fr .85fr; gap:2rem; align-items:center; }
				@media (max-width: 900px){ .hero { grid-template-columns: 1fr; } }
				.tag { display:inline-flex; align-items:center; gap:.5rem; padding:.35rem .7rem; border-radius:999px; border:1px solid #2A2A3C; background: rgba(255,255,255,.02); color:#A7A7BD; font-size:.85rem; }
				.title { font-size: clamp(2.1rem, 4.5vw, 3.2rem); letter-spacing: -.02em; line-height:1.05; margin-top:1rem; }
				.sub { font-size:1.05rem; color:#A7A7BD; margin-top:1rem; max-width: 52ch; }
				.cta { margin-top:1.25rem; }
				.orb { position: fixed; right: 22px; top: 86px; width: 44px; height: 44px; border-radius: 999px; border: 1px solid rgba(108,99,255,.35); background: radial-gradient(circle at 30% 25%, rgba(255,255,255,.18), transparent 45%), radial-gradient(circle at 70% 70%, rgba(108,99,255,.35), transparent 55%), rgba(26,26,36,.6); box-shadow: 0 12px 50px rgba(0,0,0,.35); backdrop-filter: blur(8px); transition: transform .15s ease; z-index: 20; }
				@media (max-width: 900px){ .orb { display:none; } }
				.mock { border-radius:1.25rem; border:1px solid #2A2A3C; background: linear-gradient(180deg, rgba(26,26,36,.85), rgba(26,26,36,.6)); padding:1rem; position:relative; overflow:hidden; }
				.mock::before { content:""; position:absolute; inset:-40%; background: radial-gradient(circle at 30% 20%, rgba(108,99,255,.28), transparent 55%), radial-gradient(circle at 75% 40%, rgba(255,255,255,.06), transparent 60%); transform: rotate(10deg); }
				.mock-inner { position:relative; display:grid; gap:.75rem; }
				.kpi { display:flex; justify-content:space-between; gap:.75rem; }
				.kpi .box { flex:1; border:1px solid #2A2A3C; border-radius:1rem; padding:.85rem; background: rgba(15,15,19,.55); }
				.kpi .n { font-size:1.25rem; font-weight:800; }
				.kpi .l { color:#A7A7BD; font-size:.85rem; }
				.section { margin-top: 2.25rem; }
				.section h2 { font-size:1.2rem; margin-bottom:.75rem; }
				.cards { display:grid; grid-template-columns: repeat(12, 1fr); gap:1rem; }
				.cardx { grid-column: span 4; border-radius:1.25rem; border:1px solid #2A2A3C; background: rgba(26,26,36,.50); padding:1.1rem; transition: transform .16s ease, border-color .16s ease, background .16s ease; }
				.cardx:hover { transform: translateY(-3px); border-color: rgba(108,99,255,.45); background: rgba(26,26,36,.74); }
				.cardx .h { font-weight:800; margin-bottom:.35rem; }
				.cardx .b { color:#A7A7BD; font-size:.93rem; }
				@media (max-width: 900px){ .cardx { grid-column: span 12; } }
				.fade-in { opacity:0; transform: translateY(10px); animation: fadeIn .6s ease forwards; }
				.fade-in.d2 { animation-delay:.08s; }
				.fade-in.d3 { animation-delay:.16s; }
				@keyframes fadeIn { to { opacity:1; transform: translateY(0); } }
				.footer { margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid #1E1E2E; display:flex; justify-content:space-between; gap:1rem; flex-wrap:wrap; color:#7A7A92; font-size:.9rem; }
				.footer a { color:#A7A7BD; text-decoration:none; }
				.footer a:hover { color:#E4E4ED; }
			</style>

			<div class="orb" id="orb" title="SapphireVault"></div>
			<div class="hero">
				<div>
					<div class="tag fade-in">Private by design · Encrypted vault · R2 file storage</div>
					<div class="title fade-in d2">Secure passwords and private files, in one vault.</div>
					<div class="sub fade-in d3">SapphireVault is a minimalist, modern platform for storing encrypted passwords and private media with fast previews, clean UX, and optional Telegram mirroring.</div>
					<div class="row cta fade-in d3">
						<a class="btn btn-primary" href="/dashboard">Get started</a>
						<a class="btn" href="/dashboard">Log in</a>
						<a class="btn" href="/dashboard">Create account</a>
					</div>
				</div>

				<div class="mock fade-in d2" aria-hidden="true">
					<div class="mock-inner">
						<div class="box" style="border:1px solid #2A2A3C;border-radius:1rem;padding:1rem;background: rgba(15,15,19,.55);">
							<div style="font-weight:800; margin-bottom:.4rem;">Your vault, everywhere</div>
							<div class="small">A clean, modern workspace for secrets + files—fast, private, and simple.</div>
						</div>
						<div class="kpi">
							<div class="box"><div class="n">Private</div><div class="l">Per-user access</div></div>
							<div class="box"><div class="n">Fast</div><div class="l">Instant previews</div></div>
						</div>
					</div>
				</div>
			</div>

			<div class="section">
				<h2>Core features</h2>
				<div class="cards">
					<div class="cardx"><div class="h">Password Manager</div><div class="b">Encrypted vault stored server-side, decrypted only in your browser.</div></div>
					<div class="cardx"><div class="h">Private Photos & Videos</div><div class="b">Upload, preview, download, delete. R2-backed storage.</div></div>
					<div class="cardx"><div class="h">Sync + Access Anywhere</div><div class="b">Log in once, your vault follows you across devices.</div></div>
				</div>
			</div>

			<div class="section">
				<h2>Security & privacy</h2>
				<div class="cards">
					<div class="cardx"><div class="h">Zero-knowledge passwords</div><div class="b">We store encrypted blobs. Your master password never leaves your device.</div></div>
					<div class="cardx"><div class="h">Private by default</div><div class="b">Files are scoped per user. No public sharing links unless you add them.</div></div>
					<div class="cardx"><div class="h">Optional Telegram mirror</div><div class="b">Bring your own bot and mirror only images/videos to your group if you enable it.</div></div>
				</div>
			</div>

			<script>
				const orb = document.getElementById('orb');
				let raf = 0;
				window.addEventListener('scroll', ()=>{
					if (raf) return;
					raf = requestAnimationFrame(()=>{
						raf = 0;
						const y = Math.min(120, window.scrollY * 0.15);
						const r = Math.min(14, window.scrollY * 0.02);
						orb.style.transform = 'translateY(' + y + 'px) rotate(' + r + 'deg)';
					});
				}, { passive: true });
			</script>

			<div class="footer">
				<div>© ${new Date().getFullYear()} SapphireVault</div>
				<div class="row">
					<a href="/dashboard">App</a>
					<a href="/profile">Account</a>
					<a href="/passwords">Passwords</a>
					<a href="/vault">Files</a>
				</div>
			</div>
		`,
	});
}
