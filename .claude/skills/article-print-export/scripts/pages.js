// Prints every URL in a JSON list ([{"url","title"}]) to its own PDF, as the live page looks in print.
// Usage: node pages.js list.json outDir [hide-selectors]
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [listFile, outDir, hide] = process.argv.slice(2);
  const list = JSON.parse(fs.readFileSync(listFile, 'utf8'));
  fs.mkdirSync(outDir, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1000, height: 1400 }, serviceWorkers: process.env.SHRINK ? 'block' : 'allow' }); // block service workers so the image shrink route sees every request
  const p = await ctx.newPage();
  if (process.env.SHRINK) { // shrink heavy raster images in transit (works for cross-origin images too); needs ImageMagick `convert`
    const { execFileSync } = require('child_process');
    await p.route('**/*', async (route) => {
      if (!['image', 'fetch', 'xhr'].includes(route.request().resourceType())) return route.continue();
      try {
        const r = await route.fetch(); const ct = r.headers()['content-type'] || '';
        const body = await r.body();
        if (!/image\/(png|jpe?g|webp)/.test(ct) || body.length < 150000) return route.fulfill({ response: r, body });
        const out = execFileSync('convert', ['-', '-background', 'white', '-flatten', '-resize', (process.env.SHRINK_PX || '1240') + 'x>', '-quality', '80', 'jpg:-'], { input: body, maxBuffer: 64 * 1024 * 1024 });
        return route.fulfill({ response: r, body: out, headers: { ...r.headers(), 'content-type': 'image/jpeg', 'content-length': String(out.length) } });
      } catch (e) { console.log('shrink-err', e.message.slice(0, 100)); return route.continue(); }
    });
  }
  const css = `${hide || 'header, nav, footer, ai-menu, .no-print'}{display:none!important} body{-webkit-print-color-adjust:exact;print-color-adjust:exact}`;
  // Optional 3rd arg: a warm-up URL (e.g. the app's library) opened once so apps that cache articles locally have them before each article URL is opened.
  const warm = process.argv[5];
  if (warm) { await p.goto(warm, { waitUntil: 'networkidle', timeout: 60000 }); await p.waitForTimeout(6000); }
  let i = 0;
  for (const it of list) {
    i++;
    try {
      if (warm) { await p.evaluate((u) => { location.href = u; }, it.url); await p.reload({ waitUntil: 'networkidle' }); } else await p.goto(it.url, { waitUntil: 'networkidle', timeout: 60000 });
      await p.waitForTimeout(2500);
      await p.addStyleTag({ content: css });
      if (process.env.SHRINK) await p.evaluate(async () => { // heavy PNG/photo images -> JPEG 0.8, max 1240px (page-level, keeps vectors and backgrounds intact)
        for (const im of document.querySelectorAll('img')) {
          if (!im.complete) await new Promise((r) => { im.onload = im.onerror = r; });
          const w = im.naturalWidth, h = im.naturalHeight; if (!w || im.src.startsWith('data:image/svg') || /\.svg(\?|$)/.test(im.src)) continue;
          const k = Math.min(1, 1240 / w), c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k);
          const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
          try { x.drawImage(im, 0, 0, c.width, c.height); im.removeAttribute('srcset'); im.src = c.toDataURL('image/jpeg', 0.8); await new Promise((r) => { im.onload = im.onerror = r; }); } catch (e) {}
        }
      });
      await p.emulateMedia({ media: 'print' });
      const f = `${outDir}/${String(i).padStart(3, '0')} ${(it.title || 'article').replace(/[\\/:*?"<>|]/g, '').slice(0, 60)}.pdf`;
      await p.pdf({ path: f, format: 'A4', printBackground: true, margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' } });
      await p.emulateMedia({ media: 'screen' });
      console.log(f);
    } catch (e) { console.log('FAIL', it.url, e.message.slice(0, 80)); }
  }
  await b.close();
})();
