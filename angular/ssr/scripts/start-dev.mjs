// Dev counterpart to scripts/start-all.mjs: starts the federated SSR dev
// servers (`ng serve`) in the order they must boot:
//   1. the remotes (mfe1, mfe2) — pinned to the dev-server ports in
//      angular.json, which match projects/host/public/federation.manifest.json
//   2. the host — but only once each remote's dev server actually serves its
//      `remoteEntry.json`, so the host's SSR `initNodeFederation` can fetch them.
//
// Why this exists: under `ng serve` the host initialises federation lazily on
// the first remote load (the first SSR render of a federated route), once, and
// memoises the result. If that first render happens before the remotes are
// serving, init fails, the federated regions render the RemoteUnavailable
// placeholder, and they stay that way until the dev server is restarted (the
// failure is memoised — a file save won't re-init). `concurrently` (the previous
// `start:dev`) starts all three at once and can't gate on HTTP readiness, so an
// early hit on the host exposes the race. This script removes that footgun the
// same way start-all.mjs does for prod.
//
// Dependency-free on purpose. Ctrl+C (or any child crashing) tears everything
// down together. No build step required — the dev servers compile on the fly.

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { get } from 'node:http';
import { join } from 'node:path';
import process from 'node:process';

const REMOTES = [
  { name: 'mfe1', port: 4201 },
  { name: 'mfe2', port: 4202 },
];
const HOST = { name: 'host', port: 4200 };

// ANSI colors so interleaved logs are readable.
const COLORS = ['\x1b[36m', '\x1b[35m', '\x1b[32m']; // cyan, magenta, green
const RESET = '\x1b[0m';

const children = [];
let shuttingDown = false;

function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (child.exitCode === null) child.kill('SIGTERM');
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

// Launch the local Angular CLI directly (no shell) so the script behaves the
// same on every platform. Ports come from each project's dev-server config in
// angular.json, so we don't pass PORT here.
const NG = join(process.cwd(), 'node_modules/@angular/cli/bin/ng.js');

function start({ name }, color) {
  if (!existsSync(NG)) {
    console.error(`✗ ${NG} not found — run \`npm install\` first.`);
    shutdown(1);
    return null;
  }

  const child = spawn(process.execPath, [NG, 'serve', name], {
    env: { ...process.env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const prefix = `${color}[${name}]${RESET}`;
  const relay = (stream, out) =>
    stream.on('data', (buf) => {
      for (const line of buf.toString().split('\n')) {
        if (line.trim()) out.write(`${prefix} ${line}\n`);
      }
    });
  relay(child.stdout, process.stdout);
  relay(child.stderr, process.stderr);

  child.on('exit', (exitCode) => {
    if (!shuttingDown) {
      console.error(`${prefix} exited (code ${exitCode}) — stopping the rest.`);
      shutdown(exitCode ?? 1);
    }
  });

  children.push(child);
  return child;
}

// Resolves once the URL responds (any HTTP status), or rejects after timeout.
// The timeout is generous because a cold `ng serve` compiles before it serves.
function waitForHttp(url, timeoutMs = 120000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (Date.now() > deadline) reject(new Error(`timed out waiting for ${url}`));
        else setTimeout(attempt, 300);
      });
    };
    attempt();
  });
}

console.log('Starting remote dev servers…');
REMOTES.forEach((remote, i) => start(remote, COLORS[i]));

// Wait for the exact resource the host needs at init: each remote's entry,
// served from the dev server's memory.
await Promise.all(
  REMOTES.map((r) => waitForHttp(`http://localhost:${r.port}/remoteEntry.json`)),
).catch((err) => {
  console.error(`✗ ${err.message}`);
  shutdown(1);
});

console.log('Remotes are up — starting host dev server…');
start(HOST, COLORS[2]);
// Gate on `/` (host is serving), not `/healthz`: the latter reports the prod
// federation status object, which `ng serve` never publishes, so it 503s in dev.
await waitForHttp(`http://localhost:${HOST.port}/`).catch((err) => {
  console.error(`✗ ${err.message}`);
  shutdown(1);
});

console.log(
  [
    '',
    '✓ All dev servers up:',
    `  host  → http://localhost:${HOST.port}`,
    ...REMOTES.map((r) => `  ${r.name}  → http://localhost:${r.port}`),
    '',
    'Press Ctrl+C to stop all.',
    '',
  ].join('\n'),
);
