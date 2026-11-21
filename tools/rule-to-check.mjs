#!/usr/bin/env node
// אסתרטגיה: מוצא ביומן התיקונים כללים שחודדו או נשברו שוב, כמועמדים להפוך לבדיקה אוטומטית.
// שימוש: node tools/rule-to-check.mjs [CLAUDE.md]
import { readFileSync } from 'node:fs';

const file = process.argv[2] || new URL('../CLAUDE.md', import.meta.url);
const text = readFileSync(file, 'utf8');
const log = text.split('## יומן תיקונים')[1]?.split('\n## ')[0] || '';
const entries = log.split(/\n(?=- \d{1,2}\.\d{1,2}\.\d{4})/).map(s => s.trim()).filter(Boolean);

const signals = ['היה קיים', 'כבר היה', 'נשבר', 'חודד', 'הופרו', 'הופר'];
const converted = /הפך לבדיקה|tools\/[\w.-]+|\.cjs|\.mjs|hook/;

const hits = entries
  .map(e => ({ e, found: signals.filter(w => e.includes(w)) }))
  .filter(x => x.found.length && !x.e.includes('הופך לבדיקה'));

if (!hits.length) { console.log('אין כללים שחודדו שוב. אין מה להמיר.'); process.exit(0); }

console.log(`נמצאו ${hits.length} כללים שחודדו או נשברו שוב:\n`);
for (const { e, found } of hits) {
  const date = e.match(/\d{1,2}\.\d{1,2}\.\d{4}/)?.[0];
  const title = (e.match(/\*\*(.+?)\*\*/)?.[1] || e.replace(/^- [\d.]+:\s*/, '')).slice(0, 90);
  const has = converted.test(e) ? 'יש כבר כלי' : 'מועמד לבדיקה';
  console.log(`- ${date} | ${title}\n  סימנים: ${found.join(', ')} | ${has}`);
}
console.log('\nלכל מועמד: סקריפט ב-tools/, hook או שער Playwright. הפירוט: .claude/skills/astrategia/SKILL.md');
