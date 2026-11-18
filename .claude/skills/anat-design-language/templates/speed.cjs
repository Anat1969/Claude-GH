// שער המהירות (סעיף 7א בסקיל הבנייה). חוסם מיזוג כשהאפליקציה איטית בנייד חלש.
// usage: node speed.cjs <baseUrl> <outPrefix> [hashes...]     מול vite preview, אחרי npm run build
// env:   RUNS=3 (ריצות לכל דף, נלקח החציון)  CPU=4 (האטת מעבד)  TAPS=8 (לחיצות למדידת INP)
//
// התקן: Core Web Vitals של Google. טוב = LCP עד 2.5 שניות, INP עד 200 מילישניות, CLS עד 0.1.
// התנאים: נייד 390x844, מעבד מואט פי 4, רשת "Slow 4G" של Lighthouse (150ms, 1.6Mbps, 750Kbps), מטמון ריק.
// אמינות: כל דף נמדד RUNS פעמים. מדווחים חציון ופיזור, ופיזור מעל 25% (ומעל 250ms) מסומן "לא יציב".
// מגבלה: זו מדידת מעבדה. הסף של Google מוגדר על אחוזון 75 של משתמשים אמיתיים, וזה נמדד בשטח (Speed Insights).
// לפני ואחרי: אם <outPrefix>-speed.json קיים מריצה קודמת, מודפס ההפרש מולו.
const { chromium } = require('playwright');
const fs = require('fs');

const LIMIT = { lcp: 2500, inp: 200, cls: 0.1 };
const NET = { offline: false, latency: 150, downloadThroughput: (1.6e6 / 8) | 0, uploadThroughput: (750e3 / 8) | 0 };
const RUNS = +process.env.RUNS || 3, CPU = +process.env.CPU || 4, TAPS = +process.env.TAPS || 8;
const CLICKABLE = 'button:not([disabled]),[role=button],[role=tab],a[href^="#"],summary';
const UA = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';

// רץ בדף לפני כל סקריפט אחר: אוסף LCP, CLS (חלונות של עד 5 שניות) ומשך כל אינטראקציה.
const OBSERVE = () => {
  const s = (window.__sp = { lcp: 0, cls: 0, inter: {} });
  const on = (type, fn, extra) => { try { new PerformanceObserver((l) => l.getEntries().forEach(fn)).observe({ type, buffered: true, ...extra }); } catch {} };
  on('largest-contentful-paint', (e) => { s.lcp = e.startTime; });
  let win = 0, first = 0, last = 0;
  on('layout-shift', (e) => {
    if (e.hadRecentInput) return;
    if (win && e.startTime - last < 1000 && e.startTime - first < 5000) win += e.value; else { win = e.value; first = e.startTime; }
    last = e.startTime; s.cls = Math.max(s.cls, win);
  });
  on('event', (e) => { if (e.interactionId) s.inter[e.interactionId] = Math.max(s.inter[e.interactionId] || 0, e.duration); }, { durationThreshold: 16 });
};

const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[(s.length - 1) >> 1]; };

async function measure(browser, url) {
  const origin = new URL(url).origin;
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, userAgent: UA, serviceWorkers: 'block' });
  const p = await ctx.newPage();
  await p.addInitScript(OBSERVE);
  await p.route('**/appofapp-gh.vercel.app/**', (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
  // בטיחות: לחיצות המדידה לא כותבות לשרת אמיתי.
  await p.route((u) => u.origin !== origin, (r) => (r.request().method() === 'GET' ? r.fallback() : r.abort()));
  p.on('dialog', (d) => d.dismiss().catch(() => {}));
  let inflight = 0;
  p.on('request', () => inflight++); p.on('requestfinished', () => inflight--); p.on('requestfailed', () => inflight--);
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', NET);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });

  await p.goto(url, { waitUntil: 'load', timeout: 90000 });
  await p.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  // ממתינים עד שאין בקשה פתוחה וה-LCP יציב 3 שניות (עד 30 שניות), כדי לא לפספס תוכן שמגיע מאוחר.
  for (let prev = -1, still = 0, t = 0; still < 6 && t < 60; t++) {
    await p.waitForTimeout(500);
    const now = await p.evaluate(() => __sp.lcp);
    still = now === prev && inflight <= 0 ? still + 1 : 0; prev = now;
  }
  const load = await p.evaluate(() => ({
    lcp: Math.round(__sp.lcp), cls: +__sp.cls.toFixed(3),
    kb: Math.round(performance.getEntriesByType('resource').concat(performance.getEntriesByType('navigation')).reduce((n, e) => n + (e.transferSize || 0), 0) / 1024),
  }));

  // INP: לוחצים על הפריטים הלחיצים שנראים במסך. הערך הוא האינטראקציה האיטית ביותר.
  const path = new URL(p.url()).pathname;
  let inp = null, taps = 0;
  for (let i = 0; i < TAPS; i++) {
    const el = p.locator(CLICKABLE).locator('visible=true').nth(i);
    if (!(await el.count())) break;
    if (await el.evaluate((n) => !!n.closest('ai-menu,[data-speed-skip]')).catch(() => true)) continue;
    await el.click({ timeout: 2000 }).then(() => taps++).catch(() => {});
    await p.waitForTimeout(500);
    const worst = await p.evaluate(() => (window.__sp ? Math.max(0, ...Object.values(__sp.inter)) : 0)).catch(() => 0);
    if (worst) inp = Math.max(inp || 0, worst); else if (taps && inp == null) inp = 0; // מתחת ל-16ms לא נרשם אירוע
    if (new URL(p.url()).origin !== origin || new URL(p.url()).pathname !== path) break;
  }
  await ctx.close();
  return { ...load, inp, taps };
}

(async () => {
  const [base, out, ...hashes] = process.argv.slice(2);
  if (!base || !out) { console.error('usage: node speed.cjs <baseUrl> <outPrefix> [hashes...]'); process.exit(2); }
  const file = `${out}-speed.json`;
  const before = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')).pages : {};
  const browser = await chromium.launch();
  const pages = {};
  let fail = 0;
  console.log(`תנאים: נייד 390x844, מעבד x${CPU}, Slow 4G, מטמון ריק, ${RUNS} ריצות (חציון). סף: LCP ${LIMIT.lcp}ms, INP ${LIMIT.inp}ms, CLS ${LIMIT.cls}`);
  for (const h of hashes.length ? hashes : ['']) {
    const runs = [];
    for (let i = 0; i < RUNS; i++) runs.push(await measure(browser, base + (h ? '#' + h : '')));
    const inps = runs.map((r) => r.inp).filter((v) => v != null);
    const m = { lcp: median(runs.map((r) => r.lcp)), inp: inps.length ? median(inps) : null, cls: median(runs.map((r) => r.cls)), kb: median(runs.map((r) => r.kb)), taps: runs[0].taps };
    const lcps = runs.map((r) => r.lcp);
    const range = Math.max(...lcps) - Math.min(...lcps);
    m.spread = m.lcp ? Math.round((range / m.lcp) * 100) : 0;
    const shaky = m.spread > 25 && range > 250;
    const bad = ['lcp', 'inp', 'cls'].filter((k) => m[k] != null && m[k] > LIMIT[k]);
    if (!m.lcp) bad.push('lcp-missing');
    if (bad.length) fail++;
    pages[h || '/'] = { ...m, pass: !bad.length, runs };
    const b = before[h || '/'];
    const d = (k, unit) => (b && b[k] != null && m[k] != null ? ` (לפני ${b[k]}${unit})` : '');
    console.log(
      `${bad.length ? 'FAIL' : 'ok  '} ${(h || '/').padEnd(16)} LCP ${m.lcp}ms${d('lcp', 'ms')}  INP ${m.inp == null ? 'לא נמדד, אין פריט לחיץ' : m.inp ? m.inp + 'ms' : 'מתחת ל-16ms'}${d('inp', 'ms')}  CLS ${m.cls}${d('cls', '')}  משקל ${m.kb}kB${d('kb', 'kB')}  לחיצות ${m.taps}  פיזור ${m.spread}%${shaky ? ' לא יציב, להריץ שוב' : ''}${bad.length ? '  חריגה: ' + bad.join(', ') : ''}`
    );
  }
  await browser.close();
  fs.writeFileSync(file, JSON.stringify({ date: new Date().toISOString(), standard: 'Core Web Vitals (lab)', limit: LIMIT, conditions: { viewport: '390x844', cpu: CPU, network: 'Slow 4G', runs: RUNS }, pages }, null, 2));
  console.log(`${fail ? 'שער המהירות נכשל: לא ממזגים.' : 'שער המהירות עבר.'} ${file}`);
  process.exit(fail ? 1 : 0);
})();
