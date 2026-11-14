// One command to see the whole site on your own computer:  pnpm local
//
// Starts the small Express server in server/ (using server/.env) and the site,
// with the site pointed at that local server. Press Ctrl+C once to stop both.
// Nothing here touches the Render server or the live site.
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const serverDir = join(root, 'server');
const envFile = join(serverDir, '.env');
const REQUIRED_KEYS = ['FD_TOKEN', 'AF_TOKEN'];

// The first free port from `start` upwards (an older copy may still be running on the usual one).
function isFree(port) {
  return new Promise(resolve => {
    const probe = createServer();
    probe.once('error', () => resolve(false));
    probe.once('listening', () => probe.close(() => resolve(true)));
    probe.listen(port, 'localhost');
  });
}
async function freePort(start) {
  for (let port = start; port < start + 20; port++) if (await isFree(port)) return port;
  throw new Error(`No free port found from ${start}.`);
}

function stop(lines) {
  console.error('\n' + lines.join('\n') + '\n');
  process.exit(1);
}

// ── Check server/.env has both keys (names only are ever printed) ────────────
if (!existsSync(envFile)) {
  stop([
    'The file server/.env does not exist, so the local server cannot get live data.',
    'What to do: copy server/.env.example to a new file called server/.env, then put your two keys in it:',
    '  FD_TOKEN=<your football-data.org key>',
    '  AF_TOKEN=<your API-Football key>',
    'Then run this command again.',
  ]);
}
const present = new Set();
for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
  if (match && match[2].replace(/^["']|["']$/g, '').trim() !== '') present.add(match[1]);
}
const missing = REQUIRED_KEYS.filter(key => !present.has(key));
if (missing.length) {
  stop([
    `server/.env is missing a value for: ${missing.join(', ')}.`,
    'What to do: open server/.env, add a line for each missing name (NAME=your-key, no spaces),',
    'save the file and run this command again.',
  ]);
}

// ── Start both ───────────────────────────────────────────────────────────────
const SERVER_PORT = await freePort(3001);
const SITE_PORT = await freePort(5173);
const children = [];
function run(name, args, cwd, env) {
  const child = spawn(process.execPath, args, { cwd, env: { ...process.env, ...env }, stdio: 'inherit' });
  child.on('exit', code => {
    console.log(`\n[local] ${name} stopped (code ${code ?? 'none'}). Stopping everything.`);
    shutdown(code ?? 0);
  });
  children.push(child);
}
let closing = false;
function shutdown(code) {
  if (closing) return;
  closing = true;
  children.forEach(child => { try { child.kill(); } catch { /* already gone */ } });
  setTimeout(() => process.exit(code), 300);
}
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

console.log(`[local] Server:  http://localhost:${SERVER_PORT}  (uses server/.env)`);
console.log(`[local] Site:    http://localhost:${SITE_PORT}  <- open this one`);

// PORT and CORS_ORIGIN are set here so the local server always accepts the local site,
// whatever server/.env says. (Render's own settings are not touched.)
run('server', ['--watch', 'index.js'], serverDir, {
  PORT: String(SERVER_PORT),
  CORS_ORIGIN: `http://localhost:${SITE_PORT}`,
});
run('site', [join(root, 'node_modules', 'vite', 'bin', 'vite.js'), '--port', String(SITE_PORT), '--strictPort'], root, {
  VITE_API_PROXY_URL: `http://localhost:${SERVER_PORT}`,
});
