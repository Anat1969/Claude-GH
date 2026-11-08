#!/usr/bin/env node
// Variant check: every alternative design language must declare, in its README,
// each rule of the fixed layer (design skill, section 1) that its tokens break.
//
//   node tools/variant-check.mjs        exits 1 when a variant breaks a rule silently
//
// Each variant lives in .claude/skills/anat-design-language/variants/<name>/
// with README.md and tokens.css. The README needs a paragraph or section that
// starts with "חריגות מהשכבה הקבועה"; it runs until the next heading.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIR = path.join(ROOT, '.claude/skills/anat-design-language/variants');
const MARK = 'חריגות מהשכבה הקבועה';

// Fixed-layer rules that tokens can break. detect() returns evidence or null;
// the exceptions text must contain one of the words.
const RULES = [
  {
    name: 'כפתורים מרובעים (border-radius: 0)',
    detect: (vars) => {
      const hits = Object.entries(vars).filter(([k, v]) =>
        /(^--r-|radius)/.test(k) && !/^\s*0(px)?\s*$/.test(v));
      return hits.length ? hits.map(([k]) => k).join(', ') : null;
    },
    words: ['פינות', 'רדיוס', 'radius'],
  },
  {
    name: 'טיפוגרפיה: IBM Plex Sans Hebrew ו-IBM Plex Mono',
    detect: (vars) => {
      const hits = Object.entries(vars).filter(([k, v]) =>
        /font|mono/.test(k) && !/IBM Plex/.test(v));
      return hits.length ? hits.map(([k, v]) => `${k}: ${v.trim()}`).join('; ') : null;
    },
    words: ['גופן', 'טיפוגרפיה', 'IBM Plex'],
  },
  {
    name: 'כפתורים סמויים: בלי קו מסגרת',
    detect: (vars) => {
      const hits = Object.entries(vars).filter(([k, v]) =>
        /border/.test(k) && !/^\s*(0|none|transparent)\b/.test(v));
      return hits.length ? hits.map(([k]) => k).join(', ') : null;
    },
    words: ['מסגרת', 'border'],
  },
];

function rootVars(css) {
  const vars = {};
  const block = css.match(/:root\s*\{([\s\S]*?)\n\}/);
  if (!block) return vars;
  const body = block[1].replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) vars[m[1]] = m[2];
  return vars;
}

function exceptionsText(readme) {
  const lines = readme.split('\n');
  const i = lines.findIndex((l) => l.includes(MARK));
  if (i < 0) return null;
  const out = [lines[i]];
  for (let j = i + 1; j < lines.length && !/^#{1,6}\s/.test(lines[j]); j++) out.push(lines[j]);
  return out.join('\n');
}

let failed = 0;
const variants = fs.existsSync(DIR)
  ? fs.readdirSync(DIR).filter((d) => fs.statSync(path.join(DIR, d)).isDirectory())
  : [];

for (const v of variants) {
  const readmePath = path.join(DIR, v, 'README.md');
  const tokensPath = path.join(DIR, v, 'tokens.css');
  const problems = [];
  if (!fs.existsSync(readmePath)) problems.push('חסר README.md');
  if (!fs.existsSync(tokensPath)) problems.push('חסר tokens.css');
  if (!problems.length) {
    const text = exceptionsText(fs.readFileSync(readmePath, 'utf8'));
    const vars = rootVars(fs.readFileSync(tokensPath, 'utf8'));
    if (text === null) problems.push(`חסר סעיף "${MARK}" ב-README`);
    for (const r of RULES) {
      const evidence = r.detect(vars);
      if (evidence && !(text && r.words.some((w) => text.includes(w)))) {
        problems.push(`חורגת מ"${r.name}" (${evidence}) בלי שורה בסעיף החריגות`);
      }
    }
  }
  if (problems.length) {
    failed++;
    console.log(`נכשל: ${v}`);
    for (const p of problems) console.log(`  - ${p}`);
  } else {
    console.log(`תקין: ${v}`);
  }
}

if (!variants.length) console.log('אין שפות חלופיות לבדיקה.');
process.exit(failed ? 1 : 0);
