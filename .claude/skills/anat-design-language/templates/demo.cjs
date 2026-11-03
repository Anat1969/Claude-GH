// סרטון הדגמה אוטומטי לאפליקציה: מה ש-123apps עושה ידנית (הקלטת מסך, חיתוך, המרה), כאן בפקודה אחת, חינם ובלי העלאה.
// usage: node demo.cjs <url> <outPrefix> ["שורת תובנה"] [hash1 hash2 ...]
// פלט: <outPrefix>.mp4 (H.264, מוכן לרשת), <outPrefix>.gif (קל, ל-README ול-aoa_apps), <outPrefix>-poster.jpg (תמונת שער).
// המסלול: כניסה, כיתוב תובנה מעל הדף (RTL אמיתי של הדפדפן, לא של ffmpeg), גלילה איטית, ריחוף על עד 4 פריטים לחיצים, מעבר בין דפי hash.
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const W = 1280, H = 800;
(async () => {
  const [url, out, caption = '', ...hashes] = process.argv.slice(2);
  if (!url || !out) { console.error('usage: node demo.cjs <url> <outPrefix> ["caption"] [hash...]'); process.exit(2); }
  const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'demo-'));
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, recordVideo: { dir, size: { width: W, height: H } }, reducedMotion: 'no-preference' });
  const p = await ctx.newPage();
  await p.route('**/fonts.googleapis.com/**', r => r.abort());

  const showCaption = async (text) => {
    if (!text) return;
    await p.evaluate((t) => {
      let el = document.getElementById('__demo_cap');
      if (!el) {
        el = document.createElement('div');
        el.id = '__demo_cap';
        el.dir = 'rtl';
        el.style.cssText = 'position:fixed;inset-inline:0;bottom:0;z-index:2147483647;padding:14px 24px;background:#0b1f3a;color:#fff;border-top:3px solid #f2b705;font:700 24px "IBM Plex Sans Hebrew",Arial,sans-serif;text-align:right;pointer-events:none';
        document.body.appendChild(el);
      }
      el.textContent = t;
    }, text);
  };

  const pages = hashes.length ? ['', ...hashes] : [''];
  for (const h of pages) {
    await p.goto(url + (h ? '#' + h : ''), { waitUntil: 'networkidle' }).catch(() => {});
    await p.waitForTimeout(900);
    await showCaption(caption);
    await p.waitForTimeout(1200);
    const total = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    for (let y = 0; y <= total && y < 3000; y += 120) { await p.evaluate(v => scrollTo({ top: v }), y); await p.waitForTimeout(60); }
    await p.waitForTimeout(400);
    await p.evaluate(() => scrollTo({ top: 0, behavior: 'smooth' }));
    await p.waitForTimeout(700);
    const targets = await p.$$('button:visible, a[href]:visible, [role="button"]:visible');
    for (const t of targets.slice(0, 4)) { await t.hover().catch(() => {}); await p.waitForTimeout(450); }
  }
  const video = p.video();
  await ctx.close();
  await b.close();
  const webm = await video.path();

  const ff = (args) => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args]);
  ff(['-ss', '0.9', '-i', webm, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '26', '-movflags', '+faststart', `${out}.mp4`]);
  ff(['-ss', '0.9', '-t', '10', '-i', webm, '-vf', 'fps=6,scale=600:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle', `${out}.gif`]);
  ff(['-ss', '2.2', '-i', webm, '-frames:v', '1', '-q:v', '3', `${out}-poster.jpg`]);
  fs.rmSync(dir, { recursive: true, force: true });
  for (const f of [`${out}.mp4`, `${out}.gif`, `${out}-poster.jpg`]) console.log(f, (fs.statSync(f).size / 1024).toFixed(0) + 'KB');
})();
