import { chromium } from 'playwright';
import { posts } from './slides.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'posts');

const W = 1080, H = 1350;

/* ---------- brand system (pulled 1:1 from pagescaling/index.html) ---------- */
const CSS = `
:root{
  --bg:#08090b; --surface:#0f1216; --surface-2:#151920;
  --hair:#22262e; --hair-soft:#171b21;
  --ink:#eef2f7; --ink-soft:#8a97a6; --ink-dim:#5b6572;
  --accent:#5cc6ff; --accent-deep:#2a9fe6;
  --accent-dim:rgba(92,198,255,.14); --accent-glow:rgba(92,198,255,.45);
  --live:#37d67a;
  --display:'Fraunces',Georgia,serif;
  --body:'Inter',-apple-system,sans-serif;
  --mono:'JetBrains Mono',ui-monospace,monospace;
}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#000;font-variant-ligatures:common-ligatures;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;}
.slide{
  position:relative;width:${W}px;height:${H}px;overflow:hidden;
  background:var(--bg);color:var(--ink);font-family:var(--body);
  display:flex;flex-direction:column;
  padding:96px 92px 84px;
}
/* fine blue grid ground */
.slide::before{
  content:"";position:absolute;inset:0;z-index:0;pointer-events:none;opacity:.5;
  background:
    linear-gradient(rgba(92,198,255,.028) 1px,transparent 1px) 0 0/100% 90px,
    linear-gradient(90deg,rgba(92,198,255,.028) 1px,transparent 1px) 0 0/90px 100%;
  -webkit-mask-image:radial-gradient(circle at 50% -8%,#000,transparent 72%);
          mask-image:radial-gradient(circle at 50% -8%,#000,transparent 72%);
}
/* aurora glow */
.slide::after{
  content:"";position:absolute;top:-26%;left:-14%;width:70%;height:120%;z-index:0;pointer-events:none;
  background:radial-gradient(circle,rgba(92,198,255,.16),transparent 60%);filter:blur(60px);
}
.slide > *{position:relative;z-index:1;}

.eyebrow{
  display:inline-flex;align-items:center;gap:14px;font-family:var(--mono);font-size:19px;
  letter-spacing:.26em;text-transform:uppercase;color:var(--accent);font-weight:500;
}
.eyebrow::before{content:"";width:34px;height:1.5px;background:var(--accent);opacity:.6;}

/* header row: mark + wordmark */
.head{display:flex;align-items:center;justify-content:space-between;}
.brand{display:flex;align-items:baseline;}
.logo{font-family:var(--display);font-style:italic;font-weight:600;font-size:54px;letter-spacing:-.03em;line-height:1;color:var(--ink);}
.logo .dot{display:inline-block;width:.17em;height:.17em;border-radius:50%;background:var(--accent);margin-left:.04em;vertical-align:baseline;}
.pageno{font-family:var(--mono);font-size:20px;letter-spacing:.14em;color:var(--ink-soft);font-variant-numeric:tabular-nums;}
.pageno i{color:var(--accent);font-style:normal;}

.mid{flex:1;display:flex;flex-direction:column;justify-content:center;}

h1{font-family:var(--display);font-weight:300;line-height:1.0;letter-spacing:-.028em;text-wrap:balance;color:var(--ink);}
h1 b{font-weight:600;font-style:italic;}
.sub{margin-top:34px;font-size:30px;line-height:1.4;color:var(--ink-soft);max-width:24ch;}
.sub b{color:var(--ink);font-weight:600;}

/* big serif step number */
.bignum{font-family:var(--display);font-weight:300;font-size:230px;line-height:.8;letter-spacing:-.04em;color:var(--accent);}
.steplabel{font-family:var(--display);font-weight:400;font-size:62px;line-height:1.02;letter-spacing:-.02em;color:var(--ink);margin-top:26px;}
.stepbody{margin-top:26px;font-size:31px;line-height:1.45;color:var(--ink-soft);max-width:24ch;}
.stepbody b{color:var(--ink);font-weight:600;}

/* generic bottom bar */
.foot{display:flex;align-items:center;justify-content:space-between;gap:18px;
  border-top:1px solid var(--hair);padding-top:30px;}
.foot .handle{font-family:var(--mono);font-size:21px;letter-spacing:.08em;color:var(--ink-soft);}
.foot .handle b{color:var(--ink);font-weight:500;}
.foot .tag{font-family:var(--mono);font-size:18px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-dim);}

/* CTA pill */
.pill{display:inline-flex;align-items:center;gap:14px;align-self:flex-start;margin-top:44px;
  background:var(--accent);color:#04121e;font-family:var(--mono);font-weight:600;font-size:24px;
  letter-spacing:.05em;text-transform:uppercase;padding:22px 38px;border-radius:999px;
  box-shadow:0 1px 0 rgba(255,255,255,.35) inset, 0 26px 60px -24px var(--accent-glow);}
.pill .arw{font-size:22px;}

/* dossier point (audit) */
.point{display:flex;gap:34px;align-items:flex-start;}
.point .bullet{font-family:var(--display);font-weight:300;font-size:150px;line-height:.7;color:var(--accent);flex:none;}
.point .ptxt{font-family:var(--display);font-weight:300;font-size:60px;line-height:1.14;letter-spacing:-.02em;color:var(--ink);}
.point .ptxt b{font-weight:600;font-style:italic;color:var(--ink);}

/* deliverable row */
.deliver .dnum{font-family:var(--mono);font-size:22px;letter-spacing:.22em;color:var(--accent);}
.deliver .dtxt{margin-top:30px;font-family:var(--display);font-weight:300;font-size:66px;line-height:1.1;letter-spacing:-.022em;color:var(--ink);}
.deliver .dtxt b{font-weight:600;font-style:italic;}
.deliver .livetag{display:inline-flex;align-items:center;gap:11px;margin-top:40px;font-family:var(--mono);
  font-size:18px;letter-spacing:.14em;text-transform:uppercase;color:var(--live);
  border:1px solid rgba(55,214,122,.4);border-radius:999px;padding:9px 20px;}
.livedot{width:12px;height:12px;border-radius:50%;background:var(--live);flex:none;box-shadow:0 0 0 5px rgba(55,214,122,.14);}

/* single: reframe */
.reframe{font-family:var(--display);font-weight:300;font-size:104px;line-height:1.02;letter-spacing:-.035em;color:var(--ink);}
.reframe b{font-weight:600;font-style:italic;color:var(--accent);}

/* single: weekly loop */
.loop .lt{font-family:var(--display);font-weight:400;font-style:italic;font-size:44px;color:var(--ink-soft);letter-spacing:-.01em;}
.loop ul{list-style:none;margin-top:46px;display:flex;flex-direction:column;gap:34px;}
.loop li{display:flex;gap:28px;align-items:baseline;font-family:var(--display);font-weight:300;font-size:64px;line-height:1.04;letter-spacing:-.022em;color:var(--ink);}
.loop li .arw{color:var(--accent);font-family:var(--body);font-weight:400;flex:none;}
.loop .rep{margin-top:60px;font-family:var(--display);font-weight:300;font-size:78px;line-height:1.02;letter-spacing:-.028em;color:var(--ink);}
.loop .rep b{font-weight:600;font-style:italic;color:var(--accent);}

.stack-tight{margin-top:auto;}
`;

/* ---------- per-type markup ---------- */
function brand(){ return `<div class="brand"><span class="logo">ps<span class="dot"></span></span></div>`; }
function pageno(i,n){ return n>1 ? `<span class="pageno"><i>${String(i+1).padStart(2,'0')}</i> / ${String(n).padStart(2,'0')}</span>` : `<span class="pageno">@pagescaling</span>`; }
function footBar(){ return `<div class="foot"><span class="handle"><b>@pagescaling</b></span><span class="tag">The faceless content engine</span></div>`; }

function renderSlide(s, i, n){
  const header = `<div class="head">${brand()}${pageno(i,n)}</div>`;

  if (s.type === 'hook'){
    return `<div class="slide">${header}
      <div class="mid">
        <div class="eyebrow">${s.eyebrow}</div>
        <h1 style="font-size:96px;margin-top:36px;">${s.title}</h1>
        <div class="sub">${s.sub}</div>
      </div>
      ${footBar()}
    </div>`;
  }
  if (s.type === 'step'){
    return `<div class="slide">${header}
      <div class="mid">
        <div class="bignum">${s.num}</div>
        <div class="steplabel">${s.label}</div>
        <div class="stepbody">${s.body}</div>
      </div>
      ${footBar()}
    </div>`;
  }
  if (s.type === 'point'){
    return `<div class="slide">${header}
      <div class="mid">
        <div class="point"><span class="bullet">·</span><span class="ptxt">${s.body}</span></div>
      </div>
      ${footBar()}
    </div>`;
  }
  if (s.type === 'deliver'){
    const live = s.live ? `<div><span class="livetag"><span class="livedot"></span>Tracked · verifiable</span></div>` : '';
    return `<div class="slide">${header}
      <div class="mid deliver">
        <div class="dnum">Deliverable ${s.num}</div>
        <div class="dtxt">${s.body}</div>
        ${live}
      </div>
      ${footBar()}
    </div>`;
  }
  if (s.type === 'statement'){
    return `<div class="slide">${header}
      <div class="mid">
        <div class="eyebrow">${s.eyebrow}</div>
        <h1 style="font-size:88px;margin-top:36px;">${s.title}</h1>
      </div>
      ${footBar()}
    </div>`;
  }
  if (s.type === 'cta'){
    return `<div class="slide">${header}
      <div class="mid">
        <div class="eyebrow">${s.eyebrow}</div>
        <h1 style="font-size:96px;margin-top:36px;">${s.title}</h1>
        <div class="pill"><span class="arw">→</span>${s.cta}</div>
      </div>
      ${footBar()}
    </div>`;
  }
  if (s.type === 'reframe'){
    return `<div class="slide">${header}
      <div class="mid">
        <div class="eyebrow">The reframe</div>
        <div class="reframe" style="margin-top:40px;">${s.lines.join('<br>')}</div>
      </div>
      <div class="foot"><span class="handle"><b>@pagescaling</b> — done-for-you page management.</span></div>
    </div>`;
  }
  if (s.type === 'loop'){
    const items = s.items.map(t=>`<li><span class="arw">→</span><span>${t}</span></li>`).join('');
    return `<div class="slide">${header}
      <div class="mid loop">
        <div class="lt">${s.top}</div>
        <ul>${items}</ul>
        <div class="rep">${s.repeat}</div>
      </div>
      <div class="foot"><span class="handle"><b>@pagescaling</b></span><span class="tag">The faceless content engine</span></div>
    </div>`;
  }
  return `<div class="slide">${header}</div>`;
}

/* ---------- assemble full HTML ---------- */
const allSlides = [];
for (const p of posts){
  p.slides.forEach((s, i) => allSlides.push({ ...s, _post:p, _i:i, _n:p.slides.length,
    _file: p.slides.length>1 ? `${p.slug}-${String(i+1).padStart(2,'0')}.png` : `${p.slug}.png` }));
}

const bodyHtml = allSlides.map((s,gi)=>`<div class="wrap" data-file="${s._file}" data-post="${s._post.id}">${renderSlide(s, s._i, s._n)}</div>`).join('\n');

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,300;1,9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>${CSS} .wrap{display:inline-block;}</style>
</head><body>${bodyHtml}</body></html>`;

fs.writeFileSync(path.join(__dirname, 'preview.html'), html);

/* ---------- render to PNG ---------- */
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);

let count = 0;
for (const s of allSlides){
  const dir = path.join(OUT, s._post.slug);
  fs.mkdirSync(dir, { recursive: true });
  const el = await page.$(`.wrap[data-file="${s._file}"] .slide`);
  await el.screenshot({ path: path.join(dir, s._file) });
  count++;
  console.log(`✓ ${s._post.slug}/${s._file}`);
}
await browser.close();
console.log(`\nDone — ${count} PNGs rendered to ${OUT}`);
