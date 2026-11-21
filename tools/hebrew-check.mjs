#!/usr/bin/env node
// הכלל "תמיד עברית" (נשבר ב-6 שיחות) הפך לבדיקה. אסתרטגיה, 21.11.2026.
// מסמן שורה שרוב האותיות בה לטיניות, מחוץ למסגרות קוד, ל-`קוד בתוך שורה`, לכתובות ולשמות קבצים.
// שימוש:
//   node tools/hebrew-check.mjs <קובץ...>          בדיקת טקסט או קובצי תוכן
//   echo "..." | node tools/hebrew-check.mjs        בדיקת טקסט מהקלט
//   node tools/hebrew-check.mjs --hook              כ-Stop hook של Claude Code: חוסם הודעה אחרונה שאינה בעברית
import { readFileSync } from 'node:fs';

const strip = s => s
  .replace(/^---\n[\s\S]*?\n---\n/, '')
  .replace(/```[\s\S]*?```/g, '')
  .replace(/`[^`]*`/g, '')
  .replace(/https?:\/\/\S+/g, '')
  .replace(/\b[\w.-]+\.(md|mjs|cjs|js|jsx|ts|tsx|json|html|css|sh|yml)\b/g, '')
  .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

function check(text) {
  const bad = [];
  strip(text).split('\n').forEach((line, i) => {
    const heb = (line.match(/[֐-׿]/g) || []).length;
    const lat = (line.match(/[A-Za-z]/g) || []).length;
    if (lat >= 12 && lat > heb * 2) bad.push({ line: i + 1, text: line.trim().slice(0, 100) });
  });
  return bad;
}

const args = process.argv.slice(2);
if (args[0] === '--hook') {
  const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
  if (input.stop_hook_active) process.exit(0);
  let last = '';
  try {
    for (const row of readFileSync(input.transcript_path, 'utf8').trim().split('\n')) {
      const m = JSON.parse(row);
      if (m.type === 'assistant') {
        const c = m.message?.content;
        const t = Array.isArray(c) ? c.filter(x => x.type === 'text').map(x => x.text).join('\n') : (c || '');
        if (t.trim()) last = t;
      }
    }
  } catch { process.exit(0); }
  const bad = check(last);
  if (bad.length) {
    console.error(`תמיד עברית: ${bad.length} שורות באנגלית בהודעה האחרונה לענת. כתוב אותן מחדש בעברית:\n` + bad.map(b => `- ${b.text}`).join('\n'));
    process.exit(2);
  }
  process.exit(0);
}

const texts = args.length ? args.map(f => [f, readFileSync(f, 'utf8')]) : [['קלט', readFileSync(0, 'utf8')]];
let total = 0;
for (const [name, t] of texts) for (const b of check(t)) { total++; console.log(`${name}:${b.line}  ${b.text}`); }
console.log(total ? `\nתמיד עברית: ${total} שורות באנגלית.` : 'תמיד עברית: תקין.');
process.exit(total ? 1 : 0);
