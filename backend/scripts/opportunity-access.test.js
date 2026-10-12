import test from 'node:test';
import assert from 'node:assert/strict';
import { canViewOpportunity } from '../utils/opportunityAccess.js';

const approved = { isActive: true, status: 'APPROVED' };
const pending = { isActive: true, status: 'PENDING' };
const inactive = { isActive: false, status: 'APPROVED' };

test('anonymous users and students only see active approved opportunities', () => {
  assert.equal(canViewOpportunity(approved), true);
  assert.equal(canViewOpportunity(approved, { userType: 'student' }), true);
  assert.equal(canViewOpportunity(pending), false);
  assert.equal(canViewOpportunity(pending, { userType: 'student' }), false);
  assert.equal(canViewOpportunity(inactive), false);
});

test('faculty can review active opportunities regardless of approval status', () => {
  assert.equal(canViewOpportunity(approved, { userType: 'faculty' }), true);
  assert.equal(canViewOpportunity(pending, { userType: 'faculty' }), true);
  assert.equal(canViewOpportunity(inactive, { userType: 'faculty' }), false);
});

test('admins can inspect inactive opportunities', () => {
  assert.equal(canViewOpportunity(inactive, { userType: 'admin' }), true);
  assert.equal(canViewOpportunity(null, { userType: 'admin' }), false);
});
