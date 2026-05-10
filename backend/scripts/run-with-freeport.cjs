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

// Spawn the actual server in a child process so nodemon can supervise this wrapper
const child = spawn(process.execPath, ['server.js'], { stdio: 'inherit', cwd: CWD });

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
