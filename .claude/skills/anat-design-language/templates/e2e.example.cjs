// בדיקת קצה לקצה: node tests/e2e.cjs (אחרי npm run build, מריץ vite preview בעצמו)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const BASE = 'http://localhost:4199/TLUSHIM-GH/';
const fails = [];
const waitH1 = (p, t) => p.waitForFunction((t) => document.querySelector('h1')?.innerText === t, t, { timeout: 4000 }).catch(() => {});
const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) fails.push(msg); };

(async () => {
  const srv = spawn('npx', ['vite', 'preview', '--port', '4199', '--strictPort'], { stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 3000));
  const b = await chromium.launch();
  try {
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await p.route('**/appofapp-gh.vercel.app/**', (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    await p.goto(BASE, { waitUntil: 'networkidle' });
    ok(await p.locator('h1').innerText() === '56% מהברוטו מגיע לבנק.', 'דף הבית: שורת התובנה');
    ok(await p.locator('svg.stack .slab').count() === 5, 'דף הבית: 5 לוחות בערימה');
    await p.locator('.legend-row').nth(1).hover();
    ok(await p.locator('.stack-tip').textContent() === '6,231', 'ריחוף על המקרא מדגיש את לוח המס');
    await p.getByRole('button', { name: 'פברואר' }).click();
    ok((await p.locator('svg.ribbon').getAttribute('aria-label')).includes('15,731'), 'מסלול הכסף מתעדכן לפי חודש');

    for (const [label, hash, h1] of [['סקירה', '#/overview', 'סקירה כללית'], ['מבנה השכר', '#/structure', 'מבנה השכר, מאי 2026'], ['מגמות', '#/trends', 'מגמות וקורלציות'], ['חיסכון', '#/savings', 'הפרשות וחיסכון'], ['שאלות', '#/qa', 'שאלות ותשובות']]) {
      await p.locator('.tabs').getByRole('button', { name: label }).click();
      await waitH1(p, h1);
      ok(p.url().endsWith(hash) && (await p.locator('h1').innerText()) === h1, `לשונית ${label}`);
      ok(await p.locator('.tabs [aria-current="page"]').innerText() === label, `לשונית ${label} מסומנת`);
    }
    await p.locator('.tabs').getByRole('button', { name: 'מבנה השכר' }).click();
    await p.getByRole('button', { name: 'מרץ' }).click();
    await p.getByRole('button', { name: 'לפי קטגוריה' }).click();
    ok(p.url().includes('m=2') && p.url().includes('v=category'), 'החודש והתצוגה נשמרים בכתובת');
    await p.reload({ waitUntil: 'networkidle' });
    ok(await p.locator('h1').innerText() === 'מבנה השכר, מרץ 2026', 'קישור מועתק פותח את אותו מצב');
    await p.locator('.brand').click();
    await waitH1(p, '56% מהברוטו מגיע לבנק.');
    ok(await p.locator('h1').innerText() === '56% מהברוטו מגיע לבנק.', 'שם האפליקציה מוביל לבית');

    await p.goto(BASE + '#/qa', { waitUntil: 'networkidle' });
    await p.getByRole('button', { name: 'מה זה תיקון פנסיוני?' }).first().click();
    ok(await p.locator('.qa-a mark.insight').count() === 1, 'תשובה נפתחת עם שורת תובנה מסומנת');
    await p.getByLabel('חיפוש בשאלות').fill('רכב');
    ok(await p.locator('.qa-q').count() === 1, 'חיפוש מסנן לשאלה אחת');
    await p.getByLabel('חיפוש בשאלות').fill('אין כזה');
    ok(await p.getByText('לא נמצאה שאלה').isVisible(), 'מצב ריק מוסבר');

    await p.goto(BASE + '#/overview', { waitUntil: 'networkidle' });
    ok(await p.locator('.num').count() > 10, 'מספרים מודגשים אוטומטית');
    const radius = await p.evaluate(() => [...document.querySelectorAll('button')].every((b) => getComputedStyle(b).borderRadius === '0px'));
    ok(radius, 'כל הכפתורים מרובעים');

    const cdp = await p.context().newCDPSession(p);
    await p.goto(BASE, { waitUntil: 'networkidle' });
    const inst = await cdp.send('Page.getInstallabilityErrors');
    ok(inst.installabilityErrors.length === 0, 'התקנה: ' + (JSON.stringify(inst.installabilityErrors) || 'אין שגיאות'));

    for (const vp of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
      const m = await b.newPage({ viewport: vp, reducedMotion: 'reduce' });
      await m.route('**/appofapp-gh.vercel.app/**', (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
      for (const h of ['', '#/overview', '#/structure', '#/trends', '#/savings', '#/qa']) {
        await m.goto(BASE + h, { waitUntil: 'networkidle' });
        const hs = await m.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        ok(!hs, `${vp.width}px ${h || 'בית'}: בלי גלילה אופקית`);
      }
      const anim = await m.evaluate(() => getComputedStyle(document.querySelector('.rise')).animationName);
      ok(anim === 'none', `${vp.width}px: הפחתת תנועה מכובדת`);
      await m.close();
    }
    ok(errors.length === 0, 'אין שגיאות JavaScript ' + errors.join(' | '));
  } finally {
    await b.close();
    srv.kill();
  }
  console.log(fails.length ? `\n${fails.length} נכשלו` : '\nהכול עבר');
  process.exit(fails.length ? 1 : 0);
})();
