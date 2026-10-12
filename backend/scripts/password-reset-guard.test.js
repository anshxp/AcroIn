import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const backendRoot = process.cwd();
const runScript = (script, env, args = []) => spawnSync(
  process.execPath,
  [path.resolve(backendRoot, script), ...args],
  { cwd: backendRoot, env: { ...process.env, ...env }, encoding: 'utf8', timeout: 10000 }
);

test('password reset script refuses production execution before connecting', () => {
  const result = runScript('reset-password.js', {
    NODE_ENV: 'production',
    MONGO_URI: 'mongodb://localhost:27017/AcroIn',
    RESET_PASSWORD_EMAIL: 'test@example.invalid',
    RESET_PASSWORD: 'test-password-long-enough',
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /disabled in production/i);
});

test('password reset script refuses remote databases without explicit opt-in', () => {
  const result = runScript('reset-password.js', {
    NODE_ENV: 'development',
    MONGO_URI: 'mongodb+srv://example.invalid/AcroIn',
    RESET_PASSWORD_EMAIL: 'test@example.invalid',
    RESET_PASSWORD: 'test-password-long-enough',
    ALLOW_REMOTE_PASSWORD_RESET: 'false',
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Remote password resets require/i);
});

test('student password reset script refuses production execution before connecting', () => {
  const result = runScript('scripts/reset-student-password.js', {
    NODE_ENV: 'production',
    MONGO_URI: 'mongodb://localhost:27017/AcroIn',
    RESET_PASSWORD: 'test-password-long-enough',
  }, ['test@example.invalid']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /disabled in production/i);
});
