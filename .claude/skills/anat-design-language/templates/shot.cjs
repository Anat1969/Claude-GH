// usage: node shot.cjs <baseUrl> <outPrefix> [hashes...]
const { chromium } = require('playwright');
(async () => {
  const [base, out, ...hashes] = process.argv.slice(2);
  const b = await chromium.launch();
  for (const [name, vp] of [['desk', { width: 1280, height: 900 }], ['mob', { width: 390, height: 844 }]]) {
    const p = await b.newPage({ viewport: vp });
    await p.route('**/appofapp-gh.vercel.app/**', r => r.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
    await p.route('**/fonts.googleapis.com/**', r => r.abort());
    for (const h of (hashes.length ? hashes : [''])) {
      await p.goto(base + (h ? '#' + h : ''), { waitUntil: 'networkidle' });
      await p.waitForTimeout(1200);
      const sw = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      const file = `${out}-${name}-${(h || 'root').replace(/\W/g, '')}.png`;
      await p.screenshot({ path: file, fullPage: false });
      console.log(file, 'hscroll:', sw);
    }
    await p.close();
  }
  await b.close();
})();
