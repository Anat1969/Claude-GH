// מדד קומפוזיציה (סעיף 2.13 בסקיל העיצוב): חוק השלישים וחתך הזהב.
// usage: node compose.cjs <baseUrl> <outPrefix> [hashes...]   (COMPOSE_CSS=after.css לבדיקת "מה אם")
// מסמנים בדף: data-focal על המוקד (בלי סימון: זיהוי אוטומטי של האלמנט החזותי הגדול ביותר, ושל שני טורים צמודים) (או data-focal="center" לחריג סימטרי), data-col="main" ו-data-col="side" על הטורים.
// לכל דף ולכל גודל: מרחק המוקד מנקודת העוצמה הקרובה (% מהאלכסון), יחס הטורים, וצילום עם רשת שלישים (אפור) וקווי φ (צהוב).
const { chromium } = require('playwright');
const SIZES = [['1920', 1920, 1080], ['1440', 1440, 900], ['1280', 1280, 720], ['mob', 390, 844]];
const PHI = 1.618, MAX_FOCAL = 8, MAX_CENTER = 5, COL_MIN = 1.5, COL_MAX = 1.75;
(async () => {
  const [base, out, ...hashes] = process.argv.slice(2);
  const b = await chromium.launch();
  let fail = 0;
  for (const [name, width, height] of SIZES) {
    const p = await b.newPage({ viewport: { width, height } });
    await p.route('**/appofapp-gh.vercel.app/**', r => r.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
    await p.route('**/fonts.googleapis.com/**', r => r.abort());
    for (const h of (hashes.length ? hashes : [''])) {
      await p.goto(base + (h ? '#' + h : ''), { waitUntil: 'networkidle' });
      // "מה אם": COMPOSE_CSS=<קובץ> מזריק CSS לפני המדידה, כדי לראות "אחרי" בלי לגעת בקוד האפליקציה
      if (process.env.COMPOSE_CSS) await p.addStyleTag({ content: require('fs').readFileSync(process.env.COMPOSE_CSS, 'utf8') });
      await p.waitForTimeout(800);
      const m = await p.evaluate(({ PHI }) => {
        const W = innerWidth, H = innerHeight, D = Math.hypot(W, H);
        // מוקד: data-focal, ואם אין, זיהוי אוטומטי: האלמנט החזותי הגדול ביותר במסך הראשון (בלי רקעים שתופסים כמעט הכול)
        const desc = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : '');
        const vis = el => { const r = el.getBoundingClientRect(); const w = Math.min(r.right, W) - Math.max(r.left, 0), h = Math.min(r.bottom, H) - Math.max(r.top, 0); return w > 0 && h > 0 ? w * h : 0; };
        let f = document.querySelector('[data-focal]'), auto = false;
        if (!f) {
          auto = true;
          const cands = [...document.querySelectorAll('svg,canvas,img,video,figure,h1,[data-info]')]
            .filter(el => !el.closest('nav,header,ai-menu') && getComputedStyle(el).visibility !== 'hidden')
            .map(el => ({ el, a: vis(el) })).filter(c => c.a > 2000 && c.a < W * H * 0.85)
            .sort((a, b) => b.a - a.a);
          f = cands[0] ? cands[0].el : null;
        }
        let focal = null;
        if (f) {
          const r = f.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          const mode = f.getAttribute('data-focal') === 'center' ? 'center' : 'thirds';
          const pts = mode === 'center' ? [[W / 2, H / 2, 'מרכז']] :
            [[W * 2 / 3, H / 3, 'ימין־עליון'], [W / 3, H / 3, 'שמאל־עליון'], [W * 2 / 3, H * 2 / 3, 'ימין־תחתון'], [W / 3, H * 2 / 3, 'שמאל־תחתון']];
          const best = pts.map(([x, y, n]) => ({ n, d: Math.hypot(cx - x, cy - y) / D * 100 })).sort((a, b) => a.d - b.d)[0];
          focal = { mode, auto, el: desc(f), point: best.n, dist: +best.d.toFixed(1), cx: Math.round(cx), cy: Math.round(cy) };
        }
        let mn = document.querySelector('[data-col="main"]'), sd = document.querySelector('[data-col="side"]');
        let cols = null, colsAuto = false;
        if (!(mn && sd)) {
          // זיהוי אוטומטי: שני אחים גדולים זה ליד זה (כל אחד מעל 20% רוחב ו-35% גובה), הרחב הוא התוכן
          let best = null;
          for (const par of document.querySelectorAll('body *')) {
            const kids = [...par.children].map(k => ({ k, r: k.getBoundingClientRect() }))
              .filter(o => o.r.width > W * 0.2 && Math.min(o.r.bottom, H) - Math.max(o.r.top, 0) > H * 0.35);
            if (kids.length !== 2 || Math.abs(kids[0].r.top - kids[1].r.top) > 40) continue;
            const area = kids[0].r.width + kids[1].r.width;
            if (!best || area > best.area) best = { area, kids };
          }
          if (best) { const [a, b] = best.kids.sort((x, y) => y.r.width - x.r.width); mn = a.k; sd = b.k; colsAuto = true; }
        }
        if (mn && sd) {
          const a = mn.getBoundingClientRect(), c = sd.getBoundingClientRect();
          const sideBySide = Math.abs(a.top - c.top) < 40 && c.width > 0;
          cols = sideBySide ? +(a.width / c.width).toFixed(2) : 'stacked';
        }
        // שכבת רשת לצילום
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('style', `position:fixed;inset:0;width:${W}px;height:${H}px;pointer-events:none;z-index:2147483647`);
        const line = (x1, y1, x2, y2, c, dash) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="1.5" ${dash ? 'stroke-dasharray="6 6"' : ''}/>`;
        const g = W / PHI;
        let s = '';
        for (const t of [1 / 3, 2 / 3]) s += line(W * t, 0, W * t, H, 'rgba(26,26,24,.45)', true) + line(0, H * t, W, H * t, 'rgba(26,26,24,.45)', true);
        s += line(g, 0, g, H, '#E0B800') + line(W - g, 0, W - g, H, '#E0B800');
        for (const x of [W / 3, W * 2 / 3]) for (const y of [H / 3, H * 2 / 3]) s += `<circle cx="${x}" cy="${y}" r="7" fill="none" stroke="rgba(26,26,24,.6)" stroke-width="1.5"/>`;
        if (focal) s += `<circle cx="${focal.cx}" cy="${focal.cy}" r="9" fill="#A32D2D"/>`;
        svg.innerHTML = s;
        document.body.appendChild(svg);
        return { focal, cols, colsAuto };
      }, { PHI });
      const isMob = name === 'mob';
      // מוקד אוטומטי הוא הערכה: מזהיר (WARN) ולא מכשיל. פסיקה מחייבת דורשת data-focal.
      const fOff = !m.focal ? true : m.focal.dist > (m.focal.mode === 'center' ? MAX_CENTER : MAX_FOCAL);
      const fBad = fOff && m.focal && !m.focal.auto;
      const warn = fOff && (!m.focal || m.focal.auto);
      const cBad = !isMob && typeof m.cols === 'number' && (m.cols < COL_MIN || m.cols > COL_MAX);
      const bad = fBad || cBad;
      if (bad) fail++;
      const file = `${out}-${name}-${(h || 'root').replace(/\W/g, '')}.png`;
      await p.screenshot({ path: file });
      const fTxt = !m.focal ? 'focal MISSING (add data-focal)' : `focal${m.focal.auto ? '(auto ' + m.focal.el + ')' : ''} ${m.focal.dist}% from ${m.focal.point} (max ${m.focal.mode === 'center' ? MAX_CENTER : MAX_FOCAL})`;
      const cTxt = m.cols === null ? 'cols n/a' : `cols${m.colsAuto ? '(auto)' : ''} ${m.cols} (φ=${PHI}, ok ${COL_MIN}-${COL_MAX})`;
      console.log(`${bad ? 'FAIL' : warn ? 'WARN' : 'ok  '} ${name.padEnd(5)} ${(h || '/').padEnd(14)} ${fTxt}  ${cTxt}  ${file}`);
    }
    await p.close();
  }
  await b.close();
  process.exit(fail ? 1 : 0); // WARN לא מכשיל
})();
