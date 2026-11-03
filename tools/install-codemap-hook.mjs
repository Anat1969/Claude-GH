#!/usr/bin/env node
// Installs the automatic code map in an app repo, at the level the repo needs.
// Deterministic, zero LLM tokens. Invisible: nothing in the app's screens changes.
//
//   node tools/install-codemap-hook.mjs <repoDir>     installs and prints the level
//   node tools/install-codemap-hook.mjs <repoDir> --dry   prints the level only
//
// Levels:
//   0  fewer than 20 code files: nothing to install, reading the files is cheap.
//   1  20 code files or more: SessionStart hook builds CODEMAP.md in every session;
//      CODEMAP.md goes to .gitignore, so it never causes a commit or a deploy.
//   2  more than 20,000 lines: level 1, plus a note that Graphify may pay off
//      (run on Anat's computer; see docs/token-economy.md, section 5).

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const RAW = 'https://raw.githubusercontent.com/Anat1969/Claude-GH/main/tools/context-map.mjs';
const MARK = 'Anat1969/Claude-GH/main/tools/context-map.mjs';
export const HOOK_COMMAND =
  `f="\${TMPDIR:-/tmp}/anat-context-map.mjs"; curl -fsS -o "$f" ${RAW} && node "$f" code "\${CLAUDE_PROJECT_DIR:-.}" >/dev/null 2>&1 && echo "CODEMAP.md is ready in the repo root. Read it before opening source files."; exit 0`;

const CODE_EXT = /\.(tsx?|jsx?|mjs|cjs|vue|svelte|py|sql|css|html)$/;
const SKIP = /(^|\/)(node_modules|dist|build|\.next|coverage|vendor|gh-pages)\//;

function measure(dir) {
  let files;
  try {
    files = execSync('git ls-files', { cwd: dir, encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch {
    throw new Error(`${dir} is not a git repository`);
  }
  const code = files.filter((f) => CODE_EXT.test(f) && !SKIP.test(f));
  let lines = 0;
  for (const f of code) {
    const p = path.join(dir, f);
    if (fs.existsSync(p) && fs.statSync(p).size < 400_000) lines += fs.readFileSync(p, 'utf8').split('\n').length;
  }
  return { files: code.length, lines };
}

function levelOf({ files, lines }) {
  if (files < 20) return 0;
  return lines > 20_000 ? 2 : 1;
}

function installHook(dir) {
  const p = path.join(dir, '.claude', 'settings.json');
  const settings = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
  settings.hooks ??= {};
  settings.hooks.SessionStart ??= [];
  const present = JSON.stringify(settings.hooks.SessionStart).includes(MARK);
  if (!present) settings.hooks.SessionStart.push({ hooks: [{ type: 'command', command: HOOK_COMMAND, timeout: 30 }] });
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(settings, null, 2) + '\n');

  const gi = path.join(dir, '.gitignore');
  const text = fs.existsSync(gi) ? fs.readFileSync(gi, 'utf8') : '';
  if (!/^\/?CODEMAP\.md$/m.test(text)) fs.writeFileSync(gi, text + (text && !text.endsWith('\n') ? '\n' : '') + 'CODEMAP.md\n');
  return present ? 'already installed' : 'installed';
}

const [dir, flag] = process.argv.slice(2);
if (!dir) {
  console.log('usage: install-codemap-hook.mjs <repoDir> [--dry]');
  process.exit(2);
}
const m = measure(dir);
const level = levelOf(m);
let action = 'nothing to install';
if (level > 0 && flag !== '--dry') action = installHook(dir);
else if (level > 0) action = 'would install';
const note = level === 2 ? '; consider Graphify (docs/token-economy.md, section 5)' : '';
console.log(`level ${level}: ${m.files} code files, ${m.lines} lines; ${action}${note}`);
