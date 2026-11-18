// שער הסודות (סעיף 7 בסקיל הבנייה): מפתח סודי אף פעם לא בקוד הלקוח.
// usage: node secrets.cjs [buildDir=dist]      אחרי npm run build, לפני מיזוג
// grep רגיל לא מספיק: מפתח service_role של Supabase הוא JWT, והמילה מקודדת בתוכו. כאן מפענחים כל JWT ובודקים את התפקיד.
// מפתח anon של Supabase מותר בלקוח. מפתח Google (AIza) מסומן כאזהרה: מפתח מפות מותר, מפתח Gemini אסור.
const fs = require('fs');
const path = require('path');

const FORBIDDEN = [
  ['Anthropic', /sk-ant-[A-Za-z0-9_-]{20,}/g],
  ['OpenAI', /sk-(?:proj-)?[A-Za-z0-9_-]{40,}/g],
  ['Stripe secret', /[sr]k_live_[A-Za-z0-9]{20,}/g],
  ['Supabase secret', /sb_secret_[A-Za-z0-9_-]{20,}/g],
  ['GitHub token', /gh[pousr]_[A-Za-z0-9]{36,}/g],
  ['Private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
];
const JWT = /eyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g;
const GOOGLE = /AIza[0-9A-Za-z_-]{35}/g;
const TEXT = /\.(js|mjs|cjs|css|html|json|map|txt|svg|xml|webmanifest)$/i;
const mask = (s) => s.slice(0, 10) + '...' + s.slice(-4);

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(f); else if (TEXT.test(e.name)) yield f;
  }
}

const dir = process.argv[2] || 'dist';
if (!fs.existsSync(dir)) { console.error(`אין תיקייה ${dir}. מריצים אחרי npm run build.`); process.exit(2); }
let fail = 0, warn = 0, files = 0;
for (const f of walk(dir)) {
  files++;
  const text = fs.readFileSync(f, 'utf8');
  for (const [name, re] of FORBIDDEN) for (const m of text.match(re) || []) { fail++; console.log(`FAIL ${f}  ${name}: ${mask(m)}`); }
  for (const m of text.match(JWT) || []) {
    let role = '';
    try { role = JSON.parse(Buffer.from(m.split('.')[1], 'base64url').toString()).role || ''; } catch {}
    if (role === 'service_role') { fail++; console.log(`FAIL ${f}  Supabase service_role: ${mask(m)}`); }
  }
  for (const m of new Set(text.match(GOOGLE) || [])) { warn++; console.log(`WARN ${f}  מפתח Google: ${mask(m)}. לוודא שאינו מפתח Gemini.`); }
}
console.log(`${fail ? 'שער הסודות נכשל: מעבירים את המפתח לפונקציית Edge ומחליפים אותו, כי הוא כבר נחשף.' : 'שער הסודות עבר.'} ${files} קבצים, ${fail} סודות, ${warn} אזהרות.`);
process.exit(fail ? 1 : 0);
