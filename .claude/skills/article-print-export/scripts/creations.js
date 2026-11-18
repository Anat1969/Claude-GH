// Prints every article on an app's creations page to its own A4 PDF, using the app's own print button.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [url, outDir] = process.argv.slice(2);
  fs.mkdirSync(outDir, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 1800 } });
  await p.addInitScript(() => { window.print = () => { window.__printed = (window.__printed || 0) + 1; }; });
  await p.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  await p.waitForTimeout(4000);
  if (!(await p.$('[data-ar-print]'))) {
    // Same shared component, mounted on the app's own origin with the app's own creations.json
    const src = process.argv[4] || './creations.json';
    await p.evaluate(async (src) => {
      if (!customElements.get('app-creations')) await new Promise((r) => { const s = document.createElement('script'); s.src = 'https://anat1969.github.io/AppOfApp-GH/creations.js'; s.onload = r; document.head.appendChild(s); });
      document.body.innerHTML = `<app-creations src="${src}"></app-creations>`;
    }, src);
    await p.waitForSelector('[data-ar-print]', { timeout: 30000 });
    await p.waitForTimeout(3000);
  }
  const keys = await p.$$eval('[data-ar-print]', (els) => [...new Set(els.map((e) => e.dataset.arPrint))]);
  console.log('articles', keys.length);
  let i = 0;
  for (const k of keys) {
    i++;
    const before = await p.evaluate(() => window.__printed || 0);
    await p.evaluate((k) => document.querySelector(`[data-ar-print="${CSS.escape(k)}"]`).click(), k);
    await p.waitForFunction((n) => (window.__printed || 0) > n, before, { timeout: 30000 });
    if (process.env.SHRINK) await p.evaluate(async () => {
      for (const im of document.querySelectorAll('.cr-print img')) {
        await (im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; }));
        const w = im.naturalWidth, h = im.naturalHeight; if (!w || w <= 1240) continue;
        const c = document.createElement('canvas'); c.width = 1240; c.height = Math.round(h * 1240 / w);
        const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height);
        im.removeAttribute('srcset'); im.src = c.toDataURL('image/jpeg', 0.8);
        await new Promise((r) => { im.onload = im.onerror = r; });
      }
    });
    await p.evaluate(() => Promise.all([...document.querySelectorAll('.cr-print img')].map((im) => im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; }))));
    const title = await p.evaluate(() => document.title.split(' · ')[0].replace(/[\\/:*?"<>|]/g, ''));
    await p.emulateMedia({ media: 'print' });
    const f = `${outDir}/${String(i).padStart(2, '0')} ${title}.pdf`;
    await p.pdf({ path: f, printBackground: true, preferCSSPageSize: true });
    await p.emulateMedia({ media: 'screen' });
    await p.evaluate(() => window.dispatchEvent(new Event('afterprint')));
    console.log(f);
  }
  await b.close();
})().catch((e) => { console.error(e.message); process.exit(1); });
