#!/usr/bin/env node
const { spawnSync, spawn } = require('child_process');
const path = require('path');

const CWD = path.resolve(__dirname, '..');

// Run the free-port cleanup first (best-effort)
try {
  spawnSync(process.execPath, [path.join(__dirname, 'free-port.cjs')], { stdio: 'inherit', cwd: CWD });
} catch (err) {
  // ignore errors
}

// Spawn Node's built-in watch mode so server modules reload without a third-party watcher.
const child = spawn(process.execPath, ['--watch', '--watch-preserve-output', 'server.js'], { stdio: 'inherit', cwd: CWD });

const forward = (sig) => {
  try {
    child.kill(sig);
  } catch (e) {}
};

process.on('SIGINT', () => forward('SIGINT'));
process.on('SIGTERM', () => forward('SIGTERM'));

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code);
  }
});
