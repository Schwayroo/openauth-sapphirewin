import { layout } from "./layout";

export function homePage(): Response {
	return layout({
		title: "SapphireVault — Secure Passwords + Private Files",
		session: null,
		active: undefined,
		variant: "marketing",
		content: `
			<style>
				/* ── Marketing Nav ── */
				.mkt-nav {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: .85rem 0;
					margin-bottom: 3rem;
					border-bottom: 1px solid rgba(42,42,60,.5);
				}
				.mkt-brand {
					font-size: 1.2rem;
					font-weight: 800;
					color: #6C63FF;
					text-decoration: none;
					letter-spacing: -.02em;
				}
				.mkt-brand span { color: #E4E4ED; }
				.mkt-nav-right { display: flex; align-items: center; gap: .6rem; }

				/* ── Hero ── */
				.hero {
					text-align: center;
					padding: 3.5rem 1rem 4rem;
					position: relative;
				}
				.hero-eyebrow {
					display: inline-flex;
					align-items: center;
					gap: .4rem;
					padding: .3rem .85rem;
					border-radius: 999px;
					border: 1px solid rgba(108,99,255,.35);
					background: rgba(108,99,255,.08);
					color: #A7A7BD;
					font-size: .8rem;
					font-weight: 500;
					margin-bottom: 1.75rem;
				}
				.hero-eyebrow .dot {
					width: 6px;
					height: 6px;
					border-radius: 999px;
					background: #6C63FF;
					box-shadow: 0 0 6px rgba(108,99,255,.8);
				}
				.hero-title {
					font-size: clamp(2.4rem, 5.5vw, 3.8rem);
					font-weight: 800;
					line-height: 1.08;
					letter-spacing: -.03em;
					margin-bottom: 1.25rem;
				}
				.hero-title .accent {
					background: linear-gradient(135deg, #6C63FF 0%, #a78bfa 60%, #c4b5fd 100%);
					-webkit-background-clip: text;
					-webkit-text-fill-color: transparent;
					background-clip: text;
				}
				.hero-sub {
					font-size: 1.05rem;
					color: #A7A7BD;
					max-width: 48ch;
					margin: 0 auto 2rem;
					line-height: 1.7;
				}
				.hero-cta {
					display: flex;
					justify-content: center;
					align-items: center;
					gap: .75rem;
					flex-wrap: wrap;
					margin-bottom: 2rem;
				}
				.btn-lg {
					padding: .75rem 1.6rem !important;
					font-size: 1rem !important;
				}
				.trust-pills {
					display: flex;
					justify-content: center;
					gap: .5rem;
					flex-wrap: wrap;
				}
				.pill {
					display: inline-flex;
					align-items: center;
					gap: .4rem;
					padding: .3rem .7rem;
					border-radius: 999px;
					border: 1px solid #2A2A3C;
					background: rgba(255,255,255,.025);
					font-size: .78rem;
					color: #7A7A92;
				}
				.pill-icon { font-size: .85rem; }

				/* ── App Preview ── */
				.preview-wrap {
					position: relative;
					max-width: 820px;
					margin: 0 auto 1rem;
				}
				.preview-glow {
					position: absolute;
					inset: -80px;
					background: radial-gradient(ellipse at 50% 50%, rgba(108,99,255,.2), transparent 68%);
					pointer-events: none;
					z-index: 0;
				}
				.preview {
					position: relative;
					z-index: 1;
					border-radius: 1.5rem;
					border: 1px solid #2A2A3C;
					background: linear-gradient(180deg, #1C1C28 0%, #12121C 100%);
					overflow: hidden;
					box-shadow: 0 50px 120px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.03);
				}
				.preview-topbar {
					display: flex;
					align-items: center;
					gap: .5rem;
					padding: .75rem 1rem;
					border-bottom: 1px solid #1E1E2E;
					background: rgba(12,12,18,.7);
				}
				.p-dot { width: 10px; height: 10px; border-radius: 999px; }
				.preview-url {
					flex: 1;
					margin: 0 .75rem;
					padding: .25rem .85rem;
					border-radius: .5rem;
					background: rgba(255,255,255,.04);
					border: 1px solid #1E1E2E;
					font-size: .72rem;
					color: #5A5A72;
					text-align: center;
					font-family: monospace;
				}
				.preview-body {
					padding: 1rem;
				}
				.preview-layout {
					display: grid;
					grid-template-columns: 160px 1fr;
					gap: .75rem;
					min-height: 260px;
				}
				@media (max-width: 600px) {
					.preview-layout { grid-template-columns: 1fr; }
					.preview-sidebar { display: none; }
				}
				.preview-sidebar {
					border-radius: 1rem;
					border: 1px solid #1A1A2A;
					background: rgba(10,10,16,.5);
					padding: .75rem .6rem;
					display: flex;
					flex-direction: column;
					gap: .3rem;
				}
				.preview-brand {
					font-size: .75rem;
					font-weight: 800;
					color: #6C63FF;
					padding: .3rem .6rem;
					margin-bottom: .35rem;
				}
				.p-nav {
					padding: .38rem .6rem;
					border-radius: .5rem;
					font-size: .72rem;
					color: #5A5A72;
					display: flex;
					align-items: center;
					gap: .4rem;
					cursor: default;
				}
				.p-nav.active {
					background: rgba(108,99,255,.13);
					color: #B4AEFF;
					border: 1px solid rgba(108,99,255,.2);
				}
				.preview-main { display: grid; gap: .75rem; align-content: start; }
				.p-kpi-row {
					display: grid;
					grid-template-columns: repeat(3,1fr);
					gap: .5rem;
				}
				.p-kpi {
					border-radius: .65rem;
					border: 1px solid #1A1A2A;
					background: rgba(10,10,16,.5);
					padding: .6rem .7rem;
				}
				.p-kpi-n {
					font-size: 1rem;
					font-weight: 800;
					color: #E4E4ED;
				}
				.p-kpi-l { font-size: .65rem; color: #5A5A72; margin-top: .1rem; }
				.p-file-grid {
					display: grid;
					grid-template-columns: repeat(5,1fr);
					gap: .45rem;
				}
				@media (max-width: 500px) { .p-file-grid { grid-template-columns: repeat(3,1fr); } }
				.p-file {
					aspect-ratio: 1;
					border-radius: .65rem;
					border: 1px solid #1A1A2A;
					background: rgba(10,10,16,.5);
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 1.05rem;
				}
				.p-file.hi { background: rgba(108,99,255,.1); border-color: rgba(108,99,255,.2); }
				.p-add {
					border-style: dashed;
					font-size: .8rem;
					color: #3A3A52;
				}

				/* ── Section layout ── */
				.section { margin-top: 5.5rem; }
				.section-eyebrow {
					font-size: .75rem;
					font-weight: 600;
					text-transform: uppercase;
					letter-spacing: .1em;
					color: #6C63FF;
					margin-bottom: .6rem;
				}
				.section-title {
					font-size: clamp(1.7rem, 3.5vw, 2.4rem);
					font-weight: 800;
					letter-spacing: -.025em;
					line-height: 1.15;
					margin-bottom: .6rem;
				}
				.section-sub {
					color: #A7A7BD;
					font-size: .975rem;
					max-width: 50ch;
					line-height: 1.65;
				}

				/* ── Bento Grid ── */
				.bento {
					display: grid;
					grid-template-columns: repeat(12,1fr);
					gap: 1rem;
					margin-top: 2.5rem;
				}
				.bento-card {
					border-radius: 1.25rem;
					border: 1px solid #2A2A3C;
					background: linear-gradient(145deg, rgba(26,26,36,.95) 0%, rgba(18,18,28,.8) 100%);
					padding: 1.6rem;
					transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease;
					cursor: default;
				}
				.bento-card:hover {
					transform: translateY(-4px);
					border-color: rgba(108,99,255,.4);
					box-shadow: 0 24px 60px rgba(0,0,0,.35), 0 0 0 1px rgba(108,99,255,.08);
				}
				.bc-full { grid-column: span 12; }
				.bc-7 { grid-column: span 7; }
				.bc-5 { grid-column: span 5; }
				.bc-4 { grid-column: span 4; }
				@media (max-width: 900px) {
					.bc-7, .bc-5, .bc-4 { grid-column: span 12; }
				}
				.bento-icon {
					width: 44px;
					height: 44px;
					border-radius: .85rem;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 1.2rem;
					margin-bottom: 1rem;
				}
				.bi-purple { background: rgba(108,99,255,.15); border: 1px solid rgba(108,99,255,.25); }
				.bi-blue   { background: rgba(59,130,246,.12);  border: 1px solid rgba(59,130,246,.22); }
				.bi-green  { background: rgba(34,197,94,.1);    border: 1px solid rgba(34,197,94,.2); }
				.bi-amber  { background: rgba(245,158,11,.1);   border: 1px solid rgba(245,158,11,.2); }
				.bi-pink   { background: rgba(236,72,153,.1);   border: 1px solid rgba(236,72,153,.2); }
				.bento-h { font-size: 1.05rem; font-weight: 700; margin-bottom: .45rem; }
				.bento-b { color: #A7A7BD; font-size: .9rem; line-height: 1.6; }

				/* Password vault mini-UI */
				.vault-rows { margin-top: 1.25rem; display: grid; gap: .4rem; }
				.vault-row {
					display: flex;
					align-items: center;
					gap: .65rem;
					padding: .5rem .75rem;
					border-radius: .6rem;
					background: rgba(10,10,16,.5);
					border: 1px solid #1E1E2E;
					font-size: .8rem;
				}
				.vault-row .vr-name { flex: 1; color: #A7A7BD; }
				.vr-dots { letter-spacing: .05em; color: #5A5A72; font-size: .65rem; }
				.vr-copy {
					font-size: .7rem;
					color: #6C63FF;
					padding: .15rem .45rem;
					border-radius: .35rem;
					border: 1px solid rgba(108,99,255,.3);
					background: rgba(108,99,255,.08);
					cursor: default;
				}
				.vault-lock {
					display: flex;
					align-items: center;
					gap: .5rem;
					margin-top: .75rem;
					padding: .45rem .75rem;
					border-radius: .6rem;
					border: 1px solid rgba(108,99,255,.25);
					background: rgba(108,99,255,.07);
					font-size: .78rem;
					color: #A7A7BD;
				}

				/* ── Security Strip ── */
				.sec-strip {
					margin-top: 5.5rem;
					border-radius: 1.5rem;
					border: 1px solid #2A2A3C;
					background: linear-gradient(135deg, rgba(26,26,36,.98) 0%, rgba(16,16,26,.9) 100%);
					padding: 3rem;
					display: grid;
					grid-template-columns: 1fr 1fr;
					gap: 3rem;
					align-items: center;
					position: relative;
					overflow: hidden;
				}
				.sec-strip::before {
					content: "";
					position: absolute;
					inset: 0;
					background: radial-gradient(ellipse at 0% 50%, rgba(108,99,255,.12), transparent 60%);
					pointer-events: none;
				}
				@media (max-width: 768px) {
					.sec-strip { grid-template-columns: 1fr; gap: 2rem; padding: 2rem; }
				}
				.sec-badges {
					display: grid;
					grid-template-columns: 1fr 1fr;
					gap: .75rem;
				}
				.sec-badge {
					border-radius: 1rem;
					border: 1px solid #2A2A3C;
					background: rgba(10,10,16,.45);
					padding: 1.1rem;
					transition: border-color .15s;
				}
				.sec-badge:hover { border-color: rgba(108,99,255,.35); }
				.sec-badge-icon { font-size: 1.4rem; margin-bottom: .4rem; }
				.sec-badge-h { font-size: .875rem; font-weight: 600; margin-bottom: .2rem; }
				.sec-badge-b { font-size: .78rem; color: #7A7A92; line-height: 1.45; }

				/* ── Stats ── */
				.stats-row {
					display: grid;
					grid-template-columns: repeat(3,1fr);
					gap: 1rem;
					margin-top: 5.5rem;
					text-align: center;
				}
				@media (max-width: 600px) { .stats-row { grid-template-columns: 1fr; } }
				.stat-card {
					border-radius: 1.25rem;
					border: 1px solid #2A2A3C;
					background: linear-gradient(180deg, rgba(26,26,36,.6), rgba(18,18,28,.4));
					padding: 2rem 1rem;
				}
				.stat-n {
					font-size: 2.2rem;
					font-weight: 800;
					color: #6C63FF;
					letter-spacing: -.025em;
					margin-bottom: .3rem;
				}
				.stat-l { color: #7A7A92; font-size: .85rem; }

				/* ── CTA ── */
				.cta-block {
					margin-top: 5.5rem;
					text-align: center;
					border-radius: 1.5rem;
					border: 1px solid rgba(108,99,255,.25);
					background: radial-gradient(ellipse at 50% -10%, rgba(108,99,255,.22), transparent 65%),
								linear-gradient(180deg, rgba(26,26,36,.95), rgba(18,18,28,.9));
					padding: 5rem 2rem;
					position: relative;
					overflow: hidden;
				}
				.cta-block::before {
					content: "";
					position: absolute;
					top: -1px;
					left: 20%;
					right: 20%;
					height: 1px;
					background: linear-gradient(90deg, transparent, rgba(108,99,255,.6), transparent);
				}
				.cta-title {
					font-size: clamp(2rem, 4.5vw, 3rem);
					font-weight: 800;
					letter-spacing: -.03em;
					line-height: 1.1;
					margin-bottom: .85rem;
				}
				.cta-sub {
					color: #A7A7BD;
					font-size: 1.05rem;
					max-width: 44ch;
					margin: 0 auto 2.25rem;
					line-height: 1.65;
				}
				.cta-cta {
					display: flex;
					justify-content: center;
					gap: .75rem;
					flex-wrap: wrap;
				}

				/* ── Footer ── */
				.footer {
					margin-top: 4rem;
					padding-top: 2rem;
					border-top: 1px solid #1E1E2E;
					display: flex;
					justify-content: space-between;
					align-items: center;
					flex-wrap: wrap;
					gap: 1rem;
					color: #7A7A92;
					font-size: .875rem;
				}
				.footer-brand { color: #6C63FF; font-weight: 700; margin-bottom: .2rem; }
				.footer-links { display: flex; gap: 1.5rem; flex-wrap: wrap; }
				.footer-links a { color: #7A7A92; text-decoration: none; transition: color .12s; }
				.footer-links a:hover { color: #E4E4ED; }

				/* ── Animations ── */
				.fade { opacity: 0; transform: translateY(16px); animation: fi .65s ease forwards; }
				.d1 { animation-delay: .05s; }
				.d2 { animation-delay: .13s; }
				.d3 { animation-delay: .22s; }
				.d4 { animation-delay: .32s; }
				.d5 { animation-delay: .42s; }
				@keyframes fi { to { opacity: 1; transform: translateY(0); } }

				/* ── Scroll-reveal ── */
				.reveal { opacity: 0; transform: translateY(24px); transition: opacity .6s ease, transform .6s ease; }
				.reveal.visible { opacity: 1; transform: translateY(0); }
			</style>

			<!-- ─── Marketing Nav ─── -->
			<nav class="mkt-nav fade d1">
				<a href="/" class="mkt-brand">Sapphire<span>Vault</span></a>
				<div class="mkt-nav-right">
					<a class="btn" href="/dashboard">Sign in</a>
					<a class="btn btn-primary" href="/dashboard">Get started →</a>
				</div>
			</nav>

			<!-- ─── Hero ─── -->
			<div class="hero fade d2">
				<div class="hero-eyebrow">
					<span class="dot"></span>
					Encrypted by design &nbsp;·&nbsp; Built on Cloudflare
				</div>
				<h1 class="hero-title">
					Your passwords and files,<br><span class="accent">safe and private.</span>
				</h1>
				<p class="hero-sub">
					SapphireVault is a zero-knowledge vault for passwords and private media.
					Everything encrypted in your browser—your master password never leaves your device.
				</p>
				<div class="hero-cta">
					<a class="btn btn-primary btn-lg" href="/dashboard">Create your free vault →</a>
					<a class="btn btn-lg" href="/dashboard">Sign in</a>
				</div>
				<div class="trust-pills">
					<div class="pill"><span class="pill-icon">✓</span> No credit card required</div>
					<div class="pill"><span class="pill-icon">🔒</span> End-to-end encrypted</div>
					<div class="pill"><span class="pill-icon">⚡</span> Works across all devices</div>
				</div>
			</div>

			<!-- ─── App Preview ─── -->
			<div class="preview-wrap fade d3">
				<div class="preview-glow"></div>
				<div class="preview">
					<div class="preview-topbar">
						<div class="p-dot" style="background:#FF5F57;"></div>
						<div class="p-dot" style="background:#FEBC2E;"></div>
						<div class="p-dot" style="background:#28C840;"></div>
						<div class="preview-url">app.sapphirevault.io/dashboard</div>
					</div>
					<div class="preview-body">
						<div class="preview-layout">
							<div class="preview-sidebar">
								<div class="preview-brand">SapphireVault</div>
								<div class="p-nav active">📊 Dashboard</div>
								<div class="p-nav">📁 Files</div>
								<div class="p-nav">🖼 Photos</div>
								<div class="p-nav">🔑 Passwords</div>
								<div class="p-nav" style="margin-top:auto;">⚙️ Settings</div>
							</div>
							<div class="preview-main">
								<div class="p-kpi-row">
									<div class="p-kpi">
										<div class="p-kpi-n">24</div>
										<div class="p-kpi-l">Files stored</div>
									</div>
									<div class="p-kpi">
										<div class="p-kpi-n">8</div>
										<div class="p-kpi-l">Recent uploads</div>
									</div>
									<div class="p-kpi">
										<div class="p-kpi-n" style="color:#6C63FF;">🔒</div>
										<div class="p-kpi-l">Vault locked</div>
									</div>
								</div>
								<div class="p-file-grid">
									<div class="p-file hi">🖼</div>
									<div class="p-file">📄</div>
									<div class="p-file hi">🎞</div>
									<div class="p-file">📦</div>
									<div class="p-file">🖼</div>
									<div class="p-file hi">🎵</div>
									<div class="p-file">📄</div>
									<div class="p-file hi">🖼</div>
									<div class="p-file">📦</div>
									<div class="p-file p-add">＋</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- ─── Features Bento ─── -->
			<div class="section reveal">
				<div class="section-eyebrow">Features</div>
				<h2 class="section-title">Everything you need, nothing you don't</h2>
				<p class="section-sub">A focused toolkit—no bloat, no noise. Just what you need to stay private and organised.</p>

				<div class="bento">
					<!-- Password vault — wide card -->
					<div class="bento-card bc-7">
						<div class="bento-icon bi-purple">🔑</div>
						<div class="bento-h">Zero-knowledge password vault</div>
						<div class="bento-b">Your master password never leaves your device. We store only an encrypted blob—AES-GCM 256-bit with 210,000 PBKDF2 iterations.</div>
						<div class="vault-rows">
							<div class="vault-row">
								<span>🔑</span>
								<span class="vr-name">GitHub account</span>
								<span class="vr-dots">••••••••</span>
								<span class="vr-copy">Copy</span>
							</div>
							<div class="vault-row">
								<span>💳</span>
								<span class="vr-name">Banking credentials</span>
								<span class="vr-dots">••••••••</span>
								<span class="vr-copy">Copy</span>
							</div>
							<div class="vault-row">
								<span>🌐</span>
								<span class="vr-name">Domain registrar</span>
								<span class="vr-dots">••••••••</span>
								<span class="vr-copy">Copy</span>
							</div>
						</div>
						<div class="vault-lock">🔒 Encrypted with your master password — never stored in plaintext</div>
					</div>

					<!-- File vault — narrow card -->
					<div class="bento-card bc-5">
						<div class="bento-icon bi-blue">📁</div>
						<div class="bento-h">Private file vault</div>
						<div class="bento-b">Upload any file. Images, videos, documents—stored in Cloudflare R2 with strict per-user access control. Preview and download in a click.</div>
						<div style="margin-top:1.25rem; display:grid; grid-template-columns:repeat(3,1fr); gap:.5rem;">
							<div class="p-file" style="border-radius:.75rem; aspect-ratio:1; font-size:1.4rem;">🖼</div>
							<div class="p-file hi" style="border-radius:.75rem; aspect-ratio:1; font-size:1.4rem;">🎞</div>
							<div class="p-file" style="border-radius:.75rem; aspect-ratio:1; font-size:1.4rem;">📄</div>
						</div>
					</div>

					<!-- Photo gallery -->
					<div class="bento-card bc-4">
						<div class="bento-icon bi-green">🖼</div>
						<div class="bento-h">Photo gallery</div>
						<div class="bento-b">A beautiful grid of your private photos and videos with lazy-loading and instant full previews.</div>
					</div>

					<!-- Telegram -->
					<div class="bento-card bc-4">
						<div class="bento-icon bi-amber">📱</div>
						<div class="bento-h">Telegram mirroring</div>
						<div class="bento-b">Bring your own bot token and mirror uploads to a private Telegram group. Opt-in, per-user, and fully under your control.</div>
					</div>

					<!-- Edge speed -->
					<div class="bento-card bc-4">
						<div class="bento-icon bi-pink">⚡</div>
						<div class="bento-h">Edge-native speed</div>
						<div class="bento-b">Runs on Cloudflare Workers—globally distributed, zero cold-start latency, always fast from anywhere in the world.</div>
					</div>
				</div>
			</div>

			<!-- ─── Security Strip ─── -->
			<div class="sec-strip reveal">
				<div style="position:relative;">
					<div class="section-eyebrow">Security</div>
					<h2 class="section-title">Built for privacy from day one</h2>
					<p class="section-sub" style="margin-top:.75rem;">We don't want to see your data—so we built it so we can't. Every sensitive bit is encrypted before it leaves your browser.</p>
					<div style="margin-top:2rem;">
						<a class="btn btn-primary btn-lg" href="/dashboard">Start for free →</a>
					</div>
				</div>
				<div class="sec-badges">
					<div class="sec-badge">
						<div class="sec-badge-icon">🛡</div>
						<div class="sec-badge-h">AES-GCM 256-bit</div>
						<div class="sec-badge-b">Industry-standard encryption for all vault data</div>
					</div>
					<div class="sec-badge">
						<div class="sec-badge-icon">🔐</div>
						<div class="sec-badge-h">Zero-knowledge</div>
						<div class="sec-badge-b">Your master password never touches our servers</div>
					</div>
					<div class="sec-badge">
						<div class="sec-badge-icon">👤</div>
						<div class="sec-badge-h">Per-user isolation</div>
						<div class="sec-badge-b">All files scoped to your account only</div>
					</div>
					<div class="sec-badge">
						<div class="sec-badge-icon">🌐</div>
						<div class="sec-badge-h">Edge-distributed</div>
						<div class="sec-badge-b">Cloudflare R2 + D1—no single point of failure</div>
					</div>
				</div>
			</div>

			<!-- ─── Stats ─── -->
			<div class="stats-row reveal">
				<div class="stat-card">
					<div class="stat-n">210k</div>
					<div class="stat-l">PBKDF2 iterations per vault unlock</div>
				</div>
				<div class="stat-card">
					<div class="stat-n">AES-256</div>
					<div class="stat-l">Encryption standard powering your vault</div>
				</div>
				<div class="stat-card">
					<div class="stat-n">0</div>
					<div class="stat-l">Plaintext passwords ever stored on server</div>
				</div>
			</div>

			<!-- ─── CTA Block ─── -->
			<div class="cta-block reveal">
				<h2 class="cta-title">Ready to lock down your vault?</h2>
				<p class="cta-sub">Join SapphireVault and take control of your passwords and private files today—completely free.</p>
				<div class="cta-cta">
					<a class="btn btn-primary btn-lg" href="/dashboard">Create free account →</a>
					<a class="btn btn-lg" href="/dashboard">Sign in</a>
				</div>
			</div>

			<!-- ─── Footer ─── -->
			<div class="footer">
				<div>
					<div class="footer-brand">SapphireVault</div>
					<div>© ${new Date().getFullYear()} SapphireVault. All rights reserved.</div>
				</div>
				<div class="footer-links">
					<a href="/dashboard">App</a>
					<a href="/profile">Account</a>
					<a href="/passwords">Passwords</a>
					<a href="/vault">Files</a>
				</div>
			</div>

			<script>
				/* Scroll-reveal */
				const revealEls = document.querySelectorAll('.reveal');
				const io = new IntersectionObserver((entries) => {
					entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
				}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
				revealEls.forEach(el => io.observe(el));
			</script>
		`,
	});
}
