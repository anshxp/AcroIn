#!/usr/bin/env node

const { execSync } = require('child_process');
const dotenv = require('dotenv');

dotenv.config();

const port = Number(process.argv[2] || process.env.PORT || 5000);

if (!Number.isInteger(port) || port <= 0) {
  console.error('[free-port] Invalid port provided.');
  process.exit(1);
}

function getPidsForPort(targetPort) {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano | findstr :${targetPort}`, {
        stdio: ['ignore', 'pipe', 'ignore'],
        encoding: 'utf8',
      });

      return [...new Set(
        output
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .filter((line) => /\bLISTENING\b/i.test(line))
          .map((line) => line.split(/\s+/).pop())
          .filter((pid) => /^\d+$/.test(pid))
      )];
    }

    const output = execSync(`lsof -nP -iTCP:${targetPort} -sTCP:LISTEN -t`, {
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
    });

    return [...new Set(
      output
        .split('\n')
        .map((line) => line.trim())
        .filter((pid) => /^\d+$/.test(pid))
    )];
  } catch {
    return [];
  }
}

function terminatePid(pid) {
  try {
    process.kill(Number(pid), 'SIGTERM');
    return true;
  } catch {
    return false;
  }
}

const pids = getPidsForPort(port);

if (pids.length === 0) {
  console.log(`[free-port] Port ${port} is already free.`);
  process.exit(0);
}

let terminatedCount = 0;
for (const pid of pids) {
  if (terminatePid(pid)) {
    terminatedCount += 1;
  }
}

if (terminatedCount > 0) {
  console.log(`[free-port] Freed port ${port} by stopping ${terminatedCount} process(es): ${pids.join(', ')}.`);
  process.exit(0);
}

console.warn(`[free-port] Found process(es) on port ${port} but could not stop them: ${pids.join(', ')}.`);
process.exit(0);
