#!/usr/bin/env node
// claim-check: flags claims (numbers, URLs, years) that have no source.
//   text mode: node tools/claim-check.mjs <file.md|-->  [--ignore "regex"]...
//   data mode: node tools/claim-check.mjs --json <file.json>   (objects with "value" and no source / verified:false)
// Names are not claims: put names that contain numbers (a law's year, a hotline number) in `.claimignore`,
// one regex per line, or pass --ignore. Exit 1 when something is flagged.
import { readFileSync, existsSync } from 'node:fs';
const args = process.argv.slice(2);
const ignore = [];
let json = false, file;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--ignore') ignore.push(new RegExp(args[++i], 'g'));
  else if (args[i] === '--json') json = true;
  else file = args[i];
}
if (existsSync('.claimignore')) for (const l of readFileSync('.claimignore', 'utf8').split('\n')) if (l.trim() && !l.startsWith('#')) ignore.push(new RegExp(l.trim(), 'g'));
if (!file) { console.error('usage: node tools/claim-check.mjs [--json] <file> [--ignore regex]'); process.exit(2); }

if (json) {
  const data = JSON.parse(readFileSync(file, 'utf8'));
  const flags = [];
  const walk = (o, path) => {
    if (Array.isArray(o)) return o.forEach((x, i) => walk(x, `${path}[${i}]`));
    if (o && typeof o === 'object') {
      if ('value' in o && typeof o.value === 'number') {
        const unverified = o.verified === false || !o.source;
        if (unverified) flags.push({ path, label: o.label ?? '', value: `${o.op ?? ''} ${o.value} ${o.unit ?? ''}`.trim(), rule: o.rule });
      }
      for (const [k, v] of Object.entries(o)) walk(v, path ? `${path}.${k}` : k);
    }
  };
  walk(data, '');
  flags.forEach((f, i) => console.log(`${String(i + 1).padStart(2, '0')}. ללא אימות מול מקור: ${f.path} | ${f.label} ${f.value}${f.rule ? ' (סעיף ' + f.rule + ')' : ''}`));
  console.log(flags.length ? `\n${flags.length} ערכים מספריים בלי מקור מאומת.` : 'כל הערכים המספריים מאומתים מול מקור.');
  process.exit(flags.length ? 1 : 0);
}

let text = file === '--' ? readFileSync(0, 'utf8') : readFileSync(file, 'utf8');
for (const re of ignore) text = text.replace(re, ' ');
const SOURCE = /(\[מקור:|\(מקור:|מקור:|source:|https?:\/\/|\[\d+\])/i;
const CLAIM = /(\d[\d.,]*\s?(%|מיליון|מיליארד|אחוז|דולר|שקל|₪|\$)|\b(19|20)\d{2}\b|\b\d{3,}\b)/;
const sentences = text.split(/(?<=[.!?])\s+|\n+/).map((x) => x.trim()).filter(Boolean);
let flags = 0;
sentences.forEach((s) => {
  if (CLAIM.test(s) && !SOURCE.test(s)) { flags++; console.log(`${String(flags).padStart(2, '0')}. ללא מקור: ${s.slice(0, 140)}`); }
});
console.log(flags ? `\n${flags} טענות בלי מקור מתוך ${sentences.length} משפטים.` : 'כל הטענות עם מספרים מגובות במקור.');
process.exit(flags ? 1 : 0);
