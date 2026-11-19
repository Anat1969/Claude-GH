// מריץ כלים של Craft Anything בסשן אחד (דפדפן אחד) דרך שרת ה-MCP שלו, במצב חדר נקי.
// שימוש: node tools/craft-mcp-run.mjs <תיקיית-פרויקט.cany> <calls.json> --all-tools
// calls.json: [{"name":"web_site_open","arguments":{"url":"..."}}, ...] או "list".
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
const [project, callsFile, ...extra] = process.argv.slice(2);
const calls = JSON.parse(readFileSync(callsFile, 'utf8'));
const p = spawn('craft-anything-cli', ['--project', project, '--clean-room', '--allow-run', 'mcp', ...extra], { stdio: ['pipe', 'pipe', 'inherit'] });
let buf = ''; const waiters = new Map(); let id = 0;
p.stdout.on('data', d => { buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1); if (!line) continue; let m; try { m = JSON.parse(line); } catch { continue; } if (m.id != null && waiters.has(m.id)) { waiters.get(m.id)(m); waiters.delete(m.id); } } });
const rpc = (method, params) => new Promise(r => { const n = ++id; waiters.set(n, r); p.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: n, method, params }) + '\n'); });
await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'runner', version: '1' } });
p.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
if (calls === 'list') { const t = await rpc('tools/list', {}); console.log(t.result.tools.map(x => x.name).join('\n')); }
else for (const c of calls) { const r = await rpc('tools/call', { name: c.name, arguments: c.arguments || {} }); const text = JSON.stringify(r.result ?? r.error); console.log(`== ${c.name}\n${text.slice(0, c.max || 1500)}\n`); }
p.stdin.end(); setTimeout(() => process.exit(0), 3000);
