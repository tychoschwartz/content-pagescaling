import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'testimonials');
const W = 1080, H = 1350;

/* Template cards — placeholder tokens {{ }} are meant to be replaced with
   REAL client words/numbers before posting. */
const cards = [
  {
    file: 'template-A-quote.png',
    kind: 'quote',
    result: '{{ +142K followers · 60 days }}',
    quote: '{{ Paste the client’s exact words here — one or two sharp sentences about the result they got. }}',
    handle: '{{ @clientpage }}',
    niche: '{{ niche · e.g. mindset }}',
  },
  {
    file: 'template-B-result.png',
    kind: 'result',
    big: '{{ +142K }}',
    biglabel: '{{ followers in 60 days }}',
    quote: '{{ Client’s one-line reaction goes here. }}',
    handle: '{{ @clientpage }}',
  },
  {
    file: 'template-C-screenshot.png',
    kind: 'screenshot',
    quote: '{{ Drop a real DM / message screenshot in the frame below, or paste the quote. }}',
    handle: '{{ @clientpage }}',
  },
];

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
  font-family:var(--body);display:flex;flex-direction:column;padding:96px 92px 84px;}
.slide::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;opacity:.5;
  background:linear-gradient(rgba(92,198,255,.028) 1px,transparent 1px) 0 0/100% 90px,
             linear-gradient(90deg,rgba(92,198,255,.028) 1px,transparent 1px) 0 0/90px 100%;
  -webkit-mask-image:radial-gradient(circle at 50% -8%,#000,transparent 72%);mask-image:radial-gradient(circle at 50% -8%,#000,transparent 72%);}
.slide::after{content:"";position:absolute;top:-26%;left:-14%;width:70%;height:120%;z-index:0;pointer-events:none;
  background:radial-gradient(circle,rgba(92,198,255,.16),transparent 60%);filter:blur(60px);}
.slide>*{position:relative;z-index:1;}
.head{display:flex;align-items:center;justify-content:space-between;}
.logo{font-family:var(--display);font-style:italic;font-weight:600;font-size:54px;letter-spacing:-.03em;line-height:1;color:var(--ink);}
.logo .dot{display:inline-block;width:.17em;height:.17em;border-radius:50%;background:var(--accent);margin-left:.04em;}
.eyebrow{display:inline-flex;align-items:center;gap:14px;font-family:var(--mono);font-size:19px;letter-spacing:.26em;text-transform:uppercase;color:var(--accent);font-weight:500;}
.eyebrow::before{content:"";width:34px;height:1.5px;background:var(--accent);opacity:.6;}
.mid{flex:1;display:flex;flex-direction:column;justify-content:center;}
.quote{font-family:var(--display);font-weight:300;font-size:64px;line-height:1.14;letter-spacing:-.022em;color:var(--ink);text-wrap:balance;}
.quote .qm{color:var(--accent);font-style:italic;font-weight:600;}
.attrib{margin-top:44px;display:flex;align-items:center;gap:16px;}
.avatar{width:66px;height:66px;border-radius:50%;background:linear-gradient(145deg,#16161c,#070709);border:1px solid var(--hair);flex:none;
  display:flex;align-items:center;justify-content:center;font-family:var(--display);font-style:italic;color:var(--ink-dim);font-size:26px;}
.attrib .who{display:flex;flex-direction:column;gap:4px;}
.attrib .h{font-family:var(--mono);font-size:24px;letter-spacing:.02em;color:var(--ink);}
.attrib .n{font-family:var(--mono);font-size:17px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-soft);}
.resultchip{display:inline-flex;align-items:center;gap:12px;align-self:flex-start;margin-bottom:40px;
  font-family:var(--mono);font-size:19px;letter-spacing:.1em;text-transform:uppercase;color:var(--live);
  border:1px solid rgba(55,214,122,.4);border-radius:999px;padding:11px 22px;}
.livedot{width:11px;height:11px;border-radius:50%;background:var(--live);flex:none;box-shadow:0 0 0 5px rgba(55,214,122,.14);}
.big{font-family:var(--display);font-weight:300;font-size:200px;line-height:.82;letter-spacing:-.04em;color:var(--accent);}
.biglabel{margin-top:20px;font-family:var(--mono);font-size:22px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-soft);}
.frame{margin-top:8px;border:1px dashed var(--hair);border-radius:20px;background:rgba(255,255,255,.02);
  min-height:520px;display:flex;align-items:center;justify-content:center;text-align:center;padding:40px;}
.frame .ft{font-family:var(--mono);font-size:20px;letter-spacing:.06em;color:var(--ink-dim);max-width:30ch;line-height:1.6;}
.foot{display:flex;align-items:center;justify-content:space-between;gap:18px;border-top:1px solid var(--hair);padding-top:30px;}
.foot .handle{font-family:var(--mono);font-size:21px;letter-spacing:.08em;color:var(--ink-soft);}
.foot .handle b{color:var(--ink);font-weight:500;}
.foot .tag{font-family:var(--mono);font-size:18px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-dim);}
`;

function brand(){ return `<span class="logo">ps<span class="dot"></span></span>`; }
function foot(){ return `<div class="foot"><span class="handle"><b>@pagescaling</b></span><span class="tag">Client results</span></div>`; }

function render(c){
  const head = `<div class="head">${brand()}<span class="eyebrow" style="font-size:16px;">Testimonial</span></div>`;
  if (c.kind === 'quote'){
    return `<div class="slide">${head}
      <div class="mid">
        <div><span class="resultchip"><span class="livedot"></span>${c.result}</span></div>
        <div class="quote"><span class="qm">“</span>${c.quote}<span class="qm">”</span></div>
        <div class="attrib"><div class="avatar">@</div><div class="who"><span class="h">${c.handle}</span><span class="n">${c.niche}</span></div></div>
      </div>${foot()}</div>`;
  }
  if (c.kind === 'result'){
    return `<div class="slide">${head}
      <div class="mid">
        <div class="big">${c.big}</div>
        <div class="biglabel">${c.biglabel}</div>
        <div class="quote" style="font-size:44px;margin-top:56px;"><span class="qm">“</span>${c.quote}<span class="qm">”</span></div>
        <div class="attrib"><div class="avatar">@</div><div class="who"><span class="h">${c.handle}</span></div></div>
      </div>${foot()}</div>`;
  }
  // screenshot frame
  return `<div class="slide">${head}
    <div class="mid">
      <div class="frame"><span class="ft">▢  Drop a real message / Social Blade screenshot here</span></div>
      <div class="quote" style="font-size:40px;margin-top:44px;">${c.quote}</div>
      <div class="attrib"><div class="avatar">@</div><div class="who"><span class="h">${c.handle}</span></div></div>
    </div>${foot()}</div>`;
}

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300;1,9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>${CSS} .wrap{display:inline-block;}</style></head><body>
${cards.map(c=>`<div class="wrap" data-file="${c.file}">${render(c)}</div>`).join('')}
</body></html>`;

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(__dirname, 'testimonials-preview.html'), html);

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
for (const c of cards){
  const el = await page.$(`.wrap[data-file="${c.file}"] .slide`);
  await el.screenshot({ path: path.join(OUT, c.file) });
  console.log('✓ testimonials/' + c.file);
}
await browser.close();
console.log('Done.');
