import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../middleware/authMiddleware.js';

const originalJwtSecret = process.env.JWT_SECRET;
const testJwtSecret = 'test-only-secret-that-is-long-enough-for-unit-tests';
process.env.JWT_SECRET = testJwtSecret;

after(() => {
  if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = originalJwtSecret;
});

const invokeMiddleware = (token) => {
  const req = { headers: token ? { authorization: `Bearer ${token}` } : {} };
  const res = {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  let nextCalled = false;
  verifyToken(req, res, () => { nextCalled = true; });
  return { req, res, nextCalled };
};

test('rejects a verified token whose user ID is not a Mongo ObjectId', () => {
  const token = jwt.sign({ id: 'student-demo-id', userType: 'student' }, testJwtSecret);
  const { res, nextCalled } = invokeMiddleware(token);
  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled, false);
  assert.match(res.body.message, /Invalid user id/);
});

test('accepts a verified token with a valid Mongo ObjectId', () => {
  const id = '64b64c9f0d3b2a1e5f6a7b8c';
  const token = jwt.sign({ id, userType: 'student' }, testJwtSecret);
  const { req, res, nextCalled } = invokeMiddleware(token);
  assert.equal(res.statusCode, 200);
  assert.equal(nextCalled, true);
  assert.equal(req.user.id, id);
});

test('normalizes ObjectId-shaped legacy claims before validation', () => {
  const id = '64b64c9f0d3b2a1e5f6a7b8c';
  const token = jwt.sign({ id: { _id: id }, userType: 'faculty' }, testJwtSecret);
  const { req, res, nextCalled } = invokeMiddleware(token);
  assert.equal(res.statusCode, 200);
  assert.equal(nextCalled, true);
  assert.equal(req.user.id, id);
});
