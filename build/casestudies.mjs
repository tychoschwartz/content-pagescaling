import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'case-studies');
const W = 1080, H = 1350;

/* ---------------------------------------------------------------------------
   CASE DATA — fill the {{ }} tokens with REAL Social Blade numbers.
   `curve` = follower trajectory as y-values 0..1 (left→right over time).
   For a ban-wave story, dip then climb back (see multimillionaire_mind).
--------------------------------------------------------------------------- */
export const cases = [
  {
    n: '01',
    slug: 'moneyciety',
    handle: '{{ @moneyciety }}',
    niche: '{{ niche }}',
    sub: 'Handed over, then run on the engine. {{ one line: what changed }}',
    headline: '{{ +184K }}',
    headlineLabel: 'followers',
    timeframe: '{{ in 60 days }}',
    metrics: [
      { v: '{{ 42K → 226K }}', l: 'Start → now' },
      { v: '{{ +3.1K }}',      l: 'Avg / day' },
      { v: '{{ 60 days }}',    l: 'Timeframe' },
    ],
    curve: [0.10, 0.14, 0.20, 0.29, 0.40, 0.52, 0.66, 0.79, 0.92, 1.0],
    verify: 'Verified on Social Blade',
  },
  {
    n: '02',
    slug: 'multimillionaire_mind',
    handle: '{{ @multimillionaire_mind }}',
    niche: '{{ niche }}',
    sub: 'Rode out an Instagram ban wave and climbed straight back. {{ context }}',
    headline: '{{ +xxxK }}',
    headlineLabel: 'recovered & grown',
    timeframe: '{{ post-ban wave }}',
    metrics: [
      { v: '{{ 1.2M }}',  l: 'Peak before' },
      { v: '{{ –180K }}', l: 'Ban-wave dip' },
      { v: '{{ 1.3M }}',  l: 'Now' },
    ],
    curve: [0.55, 0.68, 0.82, 0.95, 0.42, 0.40, 0.50, 0.66, 0.84, 1.0],
    banwave: true,
    verify: 'Verified on Social Blade',
  },
  {
    n: '03',
    slug: 'victorianpoetry',
    handle: '{{ @victorianpoetry }}',
    niche: '{{ poetry / aesthetic }}',
    sub: 'Full edit + posting engine. Growth from a standing start. {{ context }}',
    headline: '{{ +xxK }}',
    headlineLabel: 'followers',
    timeframe: '{{ in xx days }}',
    metrics: [
      { v: '{{ x → xxK }}', l: 'Start → now' },
      { v: '{{ +xxx }}',    l: 'Avg / day' },
      { v: '{{ xx days }}', l: 'Timeframe' },
    ],
    curve: [0.06, 0.09, 0.13, 0.19, 0.27, 0.38, 0.51, 0.66, 0.83, 1.0],
    verify: 'Verified on Social Blade',
  },
];

/* build an SVG line+area chart from a 0..1 curve */
function chart(curve, banwave){
  const w = 820, h = 300, pad = 8;
  const n = curve.length;
  const pts = curve.map((y,i)=>[pad + (i/(n-1))*(w-2*pad), pad + (1-y)*(h-2*pad)]);
  const line = pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
  const area = line + ` L ${pts.at(-1)[0].toFixed(1)} ${h-pad} L ${pts[0][0].toFixed(1)} ${h-pad} Z`;
  const grid = [0.25,0.5,0.75].map(g=>`<line x1="${pad}" y1="${(pad+g*(h-2*pad)).toFixed(1)}" x2="${w-pad}" y2="${(pad+g*(h-2*pad)).toFixed(1)}" stroke="#22262e" stroke-width="1"/>`).join('');
  const last = pts.at(-1);
  // mark the ban-wave low point
  let dipMark = '';
  if (banwave){
    let mi = 0; for (let i=1;i<curve.length;i++) if (curve[i] < curve[mi]) mi = i;
    const dp = pts[mi];
    dipMark = `<circle cx="${dp[0].toFixed(1)}" cy="${dp[1].toFixed(1)}" r="7" fill="#08090b" stroke="#37d67a" stroke-width="3"/>`;
  }
  return `<svg viewBox="0 0 ${w} ${h}" class="chart" preserveAspectRatio="none">
    <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="rgba(92,198,255,.28)"/><stop offset="1" stop-color="rgba(92,198,255,0)"/>
    </linearGradient></defs>
    ${grid}
    <path d="${area}" fill="url(#ag)"/>
    <path d="${line}" fill="none" stroke="#5cc6ff" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
    ${dipMark}
    <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="8" fill="#5cc6ff"/>
    <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="15" fill="none" stroke="rgba(92,198,255,.4)" stroke-width="2"/>
  </svg>`;
}

const CSS = `
:root{
  --bg:#08090b; --surface:#0f1216; --surface-2:#151920;
  --hair:#22262e; --hair-soft:#171b21;
  --ink:#eef2f7; --ink-soft:#8a97a6; --ink-dim:#5b6572;
  --accent:#5cc6ff; --accent-dim:rgba(92,198,255,.14); --accent-glow:rgba(92,198,255,.45);
  --live:#37d67a;
  --display:'Fraunces',Georgia,serif; --body:'Inter',sans-serif; --mono:'JetBrains Mono',monospace;
}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#000;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;}
.slide{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:var(--bg);color:var(--ink);
  font-family:var(--body);display:flex;flex-direction:column;padding:88px 84px 80px;}
.slide::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;opacity:.5;
  background:linear-gradient(rgba(92,198,255,.028) 1px,transparent 1px) 0 0/100% 90px,
             linear-gradient(90deg,rgba(92,198,255,.028) 1px,transparent 1px) 0 0/90px 100%;
  -webkit-mask-image:radial-gradient(circle at 50% -8%,#000,transparent 72%);mask-image:radial-gradient(circle at 50% -8%,#000,transparent 72%);}
.slide::after{content:"";position:absolute;top:-24%;left:-14%;width:70%;height:120%;z-index:0;pointer-events:none;
  background:radial-gradient(circle,rgba(92,198,255,.15),transparent 60%);filter:blur(60px);}
.slide>*{position:relative;z-index:1;}
.head{display:flex;align-items:center;justify-content:space-between;}
.logo{font-family:var(--display);font-style:italic;font-weight:600;font-size:50px;letter-spacing:-.03em;line-height:1;color:var(--ink);}
.logo .dot{display:inline-block;width:.17em;height:.17em;border-radius:50%;background:var(--accent);margin-left:.04em;}
.ce{font-family:var(--mono);font-size:17px;letter-spacing:.22em;text-transform:uppercase;color:var(--accent);}
.body{flex:1;display:flex;flex-direction:column;justify-content:center;}
.ch{display:flex;align-items:center;gap:20px;font-family:var(--display);font-weight:400;font-size:58px;line-height:.98;letter-spacing:-.02em;}
.clogo{width:66px;height:66px;border-radius:14px;object-fit:cover;flex:none;background:linear-gradient(145deg,#16161c,#070709);border:1px solid var(--hair);
  display:flex;align-items:center;justify-content:center;font-family:var(--display);font-style:italic;color:var(--ink-dim);font-size:30px;}
.niche{font-family:var(--mono);font-size:18px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-soft);margin-top:6px;}
.csub{font-size:26px;line-height:1.4;color:var(--ink-soft);margin:22px 0 40px;max-width:34ch;}
.csub b{color:var(--ink);font-weight:600;}
.chero{display:grid;grid-template-columns:minmax(0,.82fr) minmax(0,1.18fr);gap:40px;align-items:center;}
.big{font-family:var(--display);font-weight:300;font-size:130px;line-height:.82;letter-spacing:-.03em;color:var(--ink);}
.big span{color:var(--accent);font-weight:500;}
.biglabel{font-family:var(--mono);font-size:19px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-soft);margin-top:16px;}
.biglabel .tf{color:var(--accent);}
.chart-wrap{border:1px solid var(--hair);border-radius:16px;padding:20px;background:rgba(0,0,0,.25);}
.chart{width:100%;height:auto;display:block;}
.cnote{display:flex;justify-content:space-between;font-family:var(--mono);font-size:15px;color:var(--ink-soft);margin-top:12px;letter-spacing:.04em;}
.crow{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:44px;padding-top:36px;border-top:1px solid var(--hair);}
.crow .v{font-family:var(--display);font-size:44px;font-weight:400;letter-spacing:-.02em;font-variant-numeric:tabular-nums;}
.crow .l{font-family:var(--mono);font-size:15px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-soft);margin-top:10px;}
.foot{display:flex;align-items:center;justify-content:space-between;gap:18px;border-top:1px solid var(--hair);padding-top:28px;margin-top:44px;}
.verify{font-family:var(--mono);font-size:18px;color:var(--ink-soft);display:inline-flex;align-items:center;gap:11px;}
.verify::before{content:"";width:11px;height:11px;border-radius:50%;background:var(--live);box-shadow:0 0 0 5px rgba(55,214,122,.14);}
.foot .handle{font-family:var(--mono);font-size:19px;letter-spacing:.08em;color:var(--ink-soft);}
.foot .handle b{color:var(--ink);font-weight:500;}
`;

function brand(){ return `<span class="logo">ps<span class="dot"></span></span>`; }

function render(c){
  const metrics = c.metrics.map(m=>`<div><div class="v">${m.v}</div><div class="l">${m.l}</div></div>`).join('');
  return `<div class="slide">
    <div class="head">${brand()}<span class="ce">Case study · ${c.n}</span></div>
    <div class="body">
      <div class="ch"><span class="clogo">@</span><div><div>${c.handle}</div><div class="niche">${c.niche}</div></div></div>
      <div class="csub">${c.sub}</div>
      <div class="chero">
        <div>
          <div class="big"><span>${c.headline}</span></div>
          <div class="biglabel">${c.headlineLabel} · <span class="tf">${c.timeframe}</span></div>
        </div>
        <div class="chart-wrap">
          ${chart(c.curve, c.banwave)}
          <div class="cnote"><span>${c.banwave ? 'peak → ban wave → recovery' : 'follower growth'}</span><span>Social&nbsp;Blade</span></div>
        </div>
      </div>
      <div class="crow">${metrics}</div>
    </div>
    <div class="foot"><span class="verify">${c.verify}</span><span class="handle"><b>@pagescaling</b></span></div>
  </div>`;
}

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>${CSS} .wrap{display:inline-block;}</style></head><body>
${cases.map(c=>`<div class="wrap" data-file="${c.slug}.png">${render(c)}</div>`).join('')}
</body></html>`;

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(__dirname, 'casestudies-preview.html'), html);

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
for (const c of cases){
  const el = await page.$(`.wrap[data-file="${c.slug}.png"] .slide`);
  await el.screenshot({ path: path.join(OUT, `${c.slug}.png`) });
  console.log('✓ case-studies/' + c.slug + '.png');
}
await browser.close();
console.log('Done.');
