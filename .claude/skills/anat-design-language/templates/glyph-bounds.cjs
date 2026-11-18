// שרטוטי SVG: טקסט לא בורח מגבולות השרטוט, ולא עולה על טקסט אחר בתוכו (סעיף 2.10 ח).
// גלאי החפיפה (overlap.cjs) לא רואה טקסט בתוך SVG, ולכן זו בדיקה נפרדת. נלמד ב-ModeleiAtslacha-GH, 02.11.2026.
// usage: node glyph-bounds.cjs <baseUrl> "/page" "/other" ...   (בורר השרטוטים: SEL, ברירת מחדל svg)
const { chromium } = require('playwright');
const SEL = process.env.SEL || 'svg';
const [base, ...pages] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.route('**/appofapp-gh.vercel.app/**', (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
  const out = []; let checked = 0;
  for (const h of pages.length ? pages : ['/']) {
    await p.goto(base + '#' + h, { waitUntil: 'networkidle' });
    await p.waitForTimeout(1200); // אנימציות כניסה
    const r = await p.evaluate((sel) => {
      const res = []; let n = 0;
      document.querySelectorAll(sel).forEach((svg) => {
        const ts = [...svg.querySelectorAll('text')].filter((t) => t.textContent.trim() && t.getBoundingClientRect().width > 0);
        if (!ts.length) return;
        n++;
        const box = svg.getBoundingClientRect(), name = svg.getAttribute('aria-label') || svg.className.baseVal || 'svg';
        for (const t of ts) {
          const a = t.getBoundingClientRect();
          if (a.left < box.left - 2 || a.right > box.right + 2 || a.top < box.top - 2 || a.bottom > box.bottom + 2) res.push(`${name}: "${t.textContent}" יוצא מהמסגרת`);
        }
        for (let i = 0; i < ts.length; i++) for (let j = i + 1; j < ts.length; j++) {
          const a = ts[i].getBoundingClientRect(), c = ts[j].getBoundingClientRect();
          const x = Math.min(a.right, c.right) - Math.max(a.left, c.left), y = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
          if (x > 1 && y > 1) res.push(`${name}: "${ts[i].textContent}" על "${ts[j].textContent}"`);
        }
      });
      return { res, n };
    }, SEL);
    out.push(...r.res.map((x) => `${h}  ${x}`)); checked += r.n;
  }
  console.log(`נבדקו ${checked} שרטוטים עם טקסט`);
  console.log(out.length ? out.join('\n') : 'אין חפיפה ואין טקסט שבורח מהמסגרת');
  await b.close();
  process.exit(out.length ? 1 : 0);
})();
