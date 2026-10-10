import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { assertDemoSeedAllowed } from './guard-demo-seed.js';

const originalNodeEnv = process.env.NODE_ENV;
const originalRemoteOptIn = process.env.ALLOW_REMOTE_DEMO_SEED;

afterEach(() => {
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalNodeEnv;

  if (originalRemoteOptIn === undefined) delete process.env.ALLOW_REMOTE_DEMO_SEED;
  else process.env.ALLOW_REMOTE_DEMO_SEED = originalRemoteOptIn;
});

test('allows local MongoDB for non-production demo seeding', () => {
  delete process.env.NODE_ENV;
  delete process.env.ALLOW_REMOTE_DEMO_SEED;
  assert.doesNotThrow(() => assertDemoSeedAllowed('mongodb://localhost:27017/AcroIn'));
});

test('blocks demo seeding in production even when remote opt-in is set', () => {
  process.env.NODE_ENV = 'production';
  process.env.ALLOW_REMOTE_DEMO_SEED = 'true';
  assert.throws(
    () => assertDemoSeedAllowed('mongodb://localhost:27017/AcroIn'),
    /disabled when NODE_ENV=production/
  );
});

test('blocks remote MongoDB unless explicitly opted in', () => {
  delete process.env.NODE_ENV;
  delete process.env.ALLOW_REMOTE_DEMO_SEED;
  assert.throws(
    () => assertDemoSeedAllowed('mongodb+srv://cluster.example.test/AcroIn'),
    /Refusing to seed a remote MongoDB database/
  );
});

test('allows an explicitly opted-in remote non-production database', () => {
  delete process.env.NODE_ENV;
  process.env.ALLOW_REMOTE_DEMO_SEED = 'true';
  assert.doesNotThrow(() => assertDemoSeedAllowed('mongodb+srv://cluster.example.test/AcroIn'));
});

test('rejects invalid MongoDB connection strings', () => {
  delete process.env.NODE_ENV;
  delete process.env.ALLOW_REMOTE_DEMO_SEED;
  assert.throws(() => assertDemoSeedAllowed('not-a-mongodb-uri'), /valid MongoDB connection URI/);
});
