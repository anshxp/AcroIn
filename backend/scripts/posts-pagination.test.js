import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePostsPagination } from '../utils/postsPagination.js';

test('missing pagination parameters preserve the legacy array response mode', () => {
  assert.deepEqual(parsePostsPagination({}), { page: 0, limit: 20 });
});

test('valid page and limit are parsed', () => {
  assert.deepEqual(parsePostsPagination({ page: '3', limit: '15' }), { page: 3, limit: 15 });
});

test('invalid or non-positive page values use unpaginated mode', () => {
  assert.equal(parsePostsPagination({ page: 'not-a-number' }).page, 0);
  assert.equal(parsePostsPagination({ page: '0' }).page, 0);
  assert.equal(parsePostsPagination({ page: '-2' }).page, 0);
});

test('limits are bounded between one and fifty', () => {
  assert.equal(parsePostsPagination({ limit: '100' }).limit, 50);
  assert.equal(parsePostsPagination({ limit: '-2' }).limit, 1);
  assert.equal(parsePostsPagination({ limit: '0' }).limit, 20);
  assert.equal(parsePostsPagination({ limit: 'bad' }).limit, 20);
});
