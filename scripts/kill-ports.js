#!/usr/bin/env node
/**
 * Cross-platform replacement for force-kill-ports.sh.
 *
 * Windows has no lsof/fuser, so the PIDs listening on each dev port are looked
 * up through netstat and terminated with taskkill.
 */
const { execSync } = require('child_process');

const PORTS = [3000, 3001, 3002, 3003, 3004, 4000];
const isWindows = process.platform === 'win32';

function run(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return '';
  }
}

function killWindows(port) {
  const output = run('netstat -ano');
  const pids = new Set();

  for (const line of output.split(/\r?\n/)) {
    if (!line.includes(`:${port} `)) continue;
    const columns = line.trim().split(/\s+/);
    const pid = columns[columns.length - 1];
    if (pid && /^\d+$/.test(pid) && pid !== '0') pids.add(pid);
  }

  for (const pid of pids) {
    run(`taskkill /PID ${pid} /F`);
  }
  return pids.size;
}

function killPosix(port) {
  const output = run(`lsof -ti:${port}`);
  const pids = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((pid) => /^\d+$/.test(pid));

  for (const pid of pids) run(`kill -9 ${pid}`);
  return pids.length;
}

let total = 0;

for (const port of PORTS) {
  console.log(`> port ${port}`);
  total += isWindows ? killWindows(port) : killPosix(port);
}

// pm2 is optional and Linux-only in practice.
if (!isWindows) {
  run('pm2 stop all');
  run('pm2 delete all');
}

console.log(total === 0 ? 'Aucun processus à arrêter.' : `${total} processus arrêté(s).`);