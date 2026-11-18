#!/usr/bin/env node
// claim-check: flags sentences that state a number, a URL, a year or a named claim without a source marker.
// Use before publishing any AI-written text. Usage: node tools/claim-check.mjs <file.md|-->  (exit 1 when flags found)
import { readFileSync } from 'node:fs';
const file = process.argv[2];
if (!file) { console.error('usage: node tools/claim-check.mjs <file>'); process.exit(2); }
const text = file === '--' ? readFileSync(0, 'utf8') : readFileSync(file, 'utf8');
const SOURCE = /(\[מקור:|\(מקור:|מקור:|source:|https?:\/\/|\[\d+\])/i;
const CLAIM = /(\d[\d.,]*\s?(%|מיליון|מיליארד|אחוז|דולר|שקל|₪|\$)|\b(19|20)\d{2}\b|\b\d{3,}\b)/;
const sentences = text.split(/(?<=[.!?])\s+|\n+/).map((x) => x.trim()).filter(Boolean);
let flags = 0;
sentences.forEach((s, i) => {
  if (CLAIM.test(s) && !SOURCE.test(s)) {
    flags++;
    console.log(`${String(flags).padStart(2, '0')}. ללא מקור: ${s.slice(0, 140)}`);
  }
});
console.log(flags ? `\n${flags} טענות בלי מקור מתוך ${sentences.length} משפטים.` : 'כל הטענות עם מספרים מגובות במקור.');
process.exit(flags ? 1 : 0);
