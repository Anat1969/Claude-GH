// Prints every URL in a JSON list ([{"url","title"}]) to its own PDF, as the live page looks in print.
// Usage: node pages.js list.json outDir [hide-selectors]
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [listFile, outDir, hide] = process.argv.slice(2);
  const list = JSON.parse(fs.readFileSync(listFile, 'utf8'));
  fs.mkdirSync(outDir, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 1400 } });
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
      await p.emulateMedia({ media: 'print' });
      const f = `${outDir}/${String(i).padStart(3, '0')} ${(it.title || 'article').replace(/[\\/:*?"<>|]/g, '').slice(0, 60)}.pdf`;
      await p.pdf({ path: f, format: 'A4', printBackground: true, margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' } });
      await p.emulateMedia({ media: 'screen' });
      console.log(f);
    } catch (e) { console.log('FAIL', it.url, e.message.slice(0, 80)); }
  }
  await b.close();
})();
