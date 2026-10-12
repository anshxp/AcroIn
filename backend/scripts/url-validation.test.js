import test from 'node:test';
import assert from 'node:assert/strict';
import { isHttpUrl } from '../utils/urlValidation.js';

test('accepts absolute HTTP and HTTPS URLs', () => {
  assert.equal(isHttpUrl('https://example.com/apply'), true);
  assert.equal(isHttpUrl('http://example.com/apply'), true);
});

test('rejects non-HTTP schemes and malformed URLs', () => {
  assert.equal(isHttpUrl('javascript:alert(1)'), false);
  assert.equal(isHttpUrl('data:text/html,hello'), false);
  assert.equal(isHttpUrl('ftp://example.com/file'), false);
  assert.equal(isHttpUrl('/apply'), false);
  assert.equal(isHttpUrl('not a url'), false);
  assert.equal(isHttpUrl(''), false);
  assert.equal(isHttpUrl(null), false);
});
