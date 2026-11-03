// סרטון הדגמה אוטומטי לאפליקציה: מה ש-123apps עושה ידנית (הקלטת מסך, חיתוך, המרה), כאן בפקודה אחת, חינם ובלי העלאה.
//
// מצב מהיר:   node demo.cjs <url> <outPrefix> ["שורת תובנה"] [hash1 hash2 ...]
//             כניסה, כיתוב, גלילה איטית וריחוף על עד 4 פריטים לחיצים.
// מצב תסריט:  node demo.cjs <baseUrl> <outPrefix> <script.json>
//             סרטון שמספר סיפור: כרטיס פתיחה, סצנות ממוספרות עם תובנה והסבר, סמן גלוי, וכרטיס סיום עם הכתובת.
//
// script.json:
// { "title": "שם האפליקציה", "promise": "מה היא נותנת, בשורה", "url": "כתובת לכרטיס הסיום", "owner": "A&I · אד׳ ענת שטיבלמן",
//   "ready": "css של תוכן שנטען (לא מסך טעינה)",
//   "scenes": [ { "insight": "עד 8 מילים", "detail": "עד 20 מילים", "goto": "?q=..." | "nav": "css של כפתור ניווט", "ready": "css", "hold": 1400, "steps": [
//       { "type": "input.search", "text": "משכורת" } | { "hover": "css" } | { "click": "css" } | { "scroll": 600 } | { "wait": 800 } ] } ] }
//
// פלט: <outPrefix>.mp4 (H.264, מוכן לרשת), <outPrefix>.gif (קל, ל-README), <outPrefix>-poster.jpg (תמונת שער).
// הכיתוב נבנה בתוך הדף, ולכן העברית מימין לשמאל נכונה (ffmpeg drawtext לא יודע RTL).
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const W = 1280, H = 800;
const NAVY = '#0b1f3a', AMBER = '#f2b705';
const FONT = '"IBM Plex Sans Hebrew", Arial, sans-serif';

(async () => {
  const [base, out, third, ...rest] = process.argv.slice(2);
  if (!base || !out) { console.error('usage: node demo.cjs <url> <outPrefix> ["caption" | script.json] [hash...]'); process.exit(2); }
  const script = third && third.endsWith('.json') ? JSON.parse(fs.readFileSync(third, 'utf8')) : null;

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'demo-'));
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, recordVideo: { dir, size: { width: W, height: H } }, locale: 'he-IL' });
  const p = await ctx.newPage();
  const t0 = Date.now();
  let startAt = 0;
  await p.route('**/fonts.googleapis.com/**', r => r.abort());

  // סמן גלוי: headless לא מקליט את סמן העכבר.
  await p.addInitScript(() => {
    const mk = () => {
      if (document.getElementById('__demo_cursor')) return;
      const c = document.createElement('div');
      c.id = '__demo_cursor';
      c.style.cssText = 'position:fixed;left:0;top:0;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:rgba(242,183,5,.35);border:2px solid #0b1f3a;z-index:2147483647;pointer-events:none;transition:transform .12s;display:none';
      document.documentElement.appendChild(c);
      addEventListener('mousemove', e => { c.style.display = 'block'; c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; }, true);
      addEventListener('mousedown', () => { c.style.transform = 'scale(.6)'; }, true);
      addEventListener('mouseup', () => { c.style.transform = ''; }, true);
    };
    document.readyState === 'loading' ? addEventListener('DOMContentLoaded', mk) : mk();
  });

  const caption = async (insight, detail = '', counter = '') => {
    await p.evaluate(({ insight, detail, counter, NAVY, AMBER, FONT }) => {
      let el = document.getElementById('__demo_cap');
      if (!el) {
        el = document.createElement('div');
        el.id = '__demo_cap';
        el.dir = 'rtl';
        el.style.cssText = `position:fixed;inset-inline:0;bottom:0;z-index:2147483646;padding:14px 28px 16px;background:${NAVY};color:#fff;border-top:3px solid ${AMBER};font-family:${FONT};text-align:right;pointer-events:none;display:flex;gap:20px;align-items:center;box-shadow:0 -8px 24px rgba(0,0,0,.18)`;
        document.body.appendChild(el);
      }
      el.innerHTML = '';
      if (counter) { const n = document.createElement('div'); n.textContent = counter; n.style.cssText = `font:700 15px "IBM Plex Mono",monospace;color:${AMBER};letter-spacing:.06em;flex:none`; el.appendChild(n); }
      const t = document.createElement('div');
      const a = document.createElement('div'); a.textContent = insight; a.style.cssText = 'font-size:26px;font-weight:700;line-height:1.25';
      t.appendChild(a);
      if (detail) { const d = document.createElement('div'); d.textContent = detail; d.style.cssText = 'font-size:17px;opacity:.82;margin-top:3px'; t.appendChild(d); }
      el.appendChild(t);
    }, { insight, detail, counter, NAVY, AMBER, FONT });
  };

  const card = async (big, small, foot = '', ms = 2200) => {
    await p.evaluate(({ big, small, foot, NAVY, AMBER, FONT }) => {
      const c = document.createElement('div');
      c.id = '__demo_card';
      c.dir = 'rtl';
      c.style.cssText = `position:fixed;inset:0;z-index:2147483647;background:${NAVY};color:#fff;font-family:${FONT};display:flex;flex-direction:column;justify-content:center;padding:0 120px;gap:18px;opacity:0;transition:opacity .45s`;
      c.innerHTML = '';
      const bar = document.createElement('div'); bar.style.cssText = `width:96px;height:6px;background:${AMBER}`;
      const h = document.createElement('div'); h.textContent = big; h.style.cssText = 'font-size:64px;font-weight:700;line-height:1.1';
      const s = document.createElement('div'); s.textContent = small; s.style.cssText = 'font-size:28px;opacity:.85;max-width:900px;line-height:1.35';
      c.append(bar, h, s);
      if (foot) { const f = document.createElement('div'); f.textContent = foot; f.dir = 'ltr'; f.style.cssText = `font:500 22px "IBM Plex Mono",monospace;color:${AMBER};margin-top:24px;text-align:right`; c.appendChild(f); }
      document.body.appendChild(c);
      const k = document.getElementById('__demo_cursor'); if (k) k.style.visibility = 'hidden';
      requestAnimationFrame(() => { c.style.opacity = '1'; });
    }, { big, small, foot, NAVY, AMBER, FONT });
    await p.waitForTimeout(ms);
    await p.evaluate(() => { const k = document.getElementById('__demo_cursor'); if (k) k.style.visibility = ''; const c = document.getElementById('__demo_card'); if (c) { c.style.opacity = '0'; setTimeout(() => c.remove(), 500); } });
    await p.waitForTimeout(500);
  };

  const moveTo = async (sel) => {
    const el = p.locator(sel).first();
    await el.scrollIntoViewIfNeeded().catch(() => {});
    const box = await el.boundingBox();
    if (!box) return null;
    await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 18 });
    return el;
  };

  // מחכים לתוכן האמיתי (script.ready), כדי שמסך טעינה לא ייכנס לסרטון. אותה כתובת לא נטענת פעמיים.
  const go = async (u) => {
    if (p.url() === u) return;
    await p.goto(u, { waitUntil: 'networkidle' }).catch(() => {});
    if (script && script.ready) await p.locator(script.ready).first().waitFor({ timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(500);
  };

  if (script) {
    const scenes = script.scenes || [];
    await go(base);
    await p.mouse.move(W / 2, H / 2);
    startAt = (Date.now() - t0) / 1000; // הסרטון מתחיל בכרטיס הפתיחה, בלי מסך הטעינה שלפניו
    await card(script.title, script.promise || '', '', 2600);
    for (let i = 0; i < scenes.length; i++) {
      const s = scenes[i];
      if (s.goto !== undefined) await go(new URL(s.goto, base).href);
      // מעבר בתוך האפליקציה (לחיצה על ניווט) עדיף על טעינה מחדש: אין מסך טעינה, ורואים את הפעולה.
      if (s.nav) { await caption(s.insight, s.detail, `${String(i + 1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')}`); const el = await moveTo(s.nav); if (el) { await p.waitForTimeout(300); await el.click().catch(() => {}); } if (s.ready) await p.locator(s.ready).first().waitFor({ timeout: 15000 }).catch(() => {}); }
      await caption(s.insight, s.detail, `${String(i + 1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')}`);
      await p.waitForTimeout(900);
      for (const st of s.steps || []) {
        if (st.type) { const el = await moveTo(st.type); if (el) { await el.click(); await el.fill(''); await p.keyboard.type(st.text, { delay: 110 }); } }
        else if (st.hover) await moveTo(st.hover);
        else if (st.click) { const el = await moveTo(st.click); if (el) { await p.waitForTimeout(250); await el.click().catch(() => {}); } }
        else if (st.scroll) { const steps = Math.ceil(Math.abs(st.scroll) / 40); for (let k = 0; k < steps; k++) { await p.mouse.wheel(0, Math.sign(st.scroll) * 40); await p.waitForTimeout(28); } }
        if (st.wait) await p.waitForTimeout(st.wait);
        await p.waitForTimeout(st.pause ?? 500);
      }
      await p.waitForTimeout(s.hold ?? 1400);
    }
    await p.evaluate(() => document.getElementById('__demo_cap')?.remove());
    await card(script.title, script.close || script.promise || '', [script.url, script.owner].filter(Boolean).join('   ·   '), 3000);
  } else {
    const text = third || '';
    const pages = rest.length ? ['', ...rest] : [''];
    for (const h of pages) {
      await go(base + (h ? '#' + h : ''));
      if (text) await caption(text);
      await p.waitForTimeout(1200);
      const total = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
      for (let y = 0; y <= total && y < 3000; y += 120) { await p.evaluate(v => scrollTo({ top: v }), y); await p.waitForTimeout(60); }
      await p.waitForTimeout(400);
      await p.evaluate(() => scrollTo({ top: 0, behavior: 'smooth' }));
      await p.waitForTimeout(700);
      const targets = await p.$$('button:visible, a[href]:visible, [role="button"]:visible');
      for (const t of targets.slice(0, 4)) { const bx = await t.boundingBox(); if (bx) await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2, { steps: 12 }); await p.waitForTimeout(450); }
    }
  }

  const video = p.video();
  await ctx.close();
  await b.close();
  const webm = await video.path();

  const ff = (args) => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args]);
  const lead = String(script ? Math.max(0, startAt - 0.1).toFixed(2) : 0.9);
  ff(['-ss', lead, '-i', webm, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24', '-preset', 'slow', '-movflags', '+faststart', `${out}.mp4`]);
  ff(['-ss', lead, '-t', script ? '120' : '10', '-i', webm, '-vf', (script ? 'setpts=0.5*PTS,fps=5,scale=560:-1:flags=lanczos,' : 'fps=6,scale=600:-1:flags=lanczos,') + 'split[a][b];[a]palettegen=max_colors=64:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle', `${out}.gif`]); // בתסריט: כל הסיפור במהירות כפולה
  ff(['-ss', script ? String(startAt + 1.2) : '2.2', '-i', webm, '-frames:v', '1', '-q:v', '3', `${out}-poster.jpg`]);
  fs.rmSync(dir, { recursive: true, force: true });
  for (const f of [`${out}.mp4`, `${out}.gif`, `${out}-poster.jpg`]) console.log(f, (fs.statSync(f).size / 1024).toFixed(0) + 'KB');
})();
