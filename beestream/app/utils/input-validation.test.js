const assert = require('assert');
const {isSafeName, isSafeDate} = require('./input-validation');

var passed = 0;
var failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  PASS: ${name}`);
  } catch (e) {
    failed++;
    console.log(`  FAIL: ${name} - ${e.message}`);
  }
}

console.log('input-validation tests');

console.log('\nisSafeName:');

test('accepts simple alphanumeric name', function() {
  assert.strictEqual(isSafeName('hive1'), true);
});

test('accepts name with hyphens and underscores', function() {
  assert.strictEqual(isSafeName('my-hive_01'), true);
});

test('accepts name with dots', function() {
  assert.strictEqual(isSafeName('hive.backup'), true);
});

test('rejects path traversal with ../', function() {
  assert.strictEqual(isSafeName('../../etc/passwd'), false);
});

test('rejects name with forward slash', function() {
  assert.strictEqual(isSafeName('hive/evil'), false);
});

test('rejects name with backslash', function() {
  assert.strictEqual(isSafeName('hive\\evil'), false);
});

test('rejects empty string', function() {
  assert.strictEqual(isSafeName(''), false);
});

test('rejects null', function() {
  assert.strictEqual(isSafeName(null), false);
});

test('rejects undefined', function() {
  assert.strictEqual(isSafeName(undefined), false);
});

test('rejects number', function() {
  assert.strictEqual(isSafeName(42), false);
});

test('rejects object', function() {
  assert.strictEqual(isSafeName({$gt: ''}), false);
});

test('rejects name starting with dot', function() {
  assert.strictEqual(isSafeName('.hidden'), false);
});

test('rejects name starting with hyphen', function() {
  assert.strictEqual(isSafeName('-flag'), false);
});

test('rejects null bytes', function() {
  assert.strictEqual(isSafeName('hive\x00evil'), false);
});

test('rejects name with spaces', function() {
  assert.strictEqual(isSafeName('hive name'), false);
});

test('rejects string exceeding 255 chars', function() {
  assert.strictEqual(isSafeName('a'.repeat(256)), false);
});

test('accepts string of exactly 255 chars', function() {
  assert.strictEqual(isSafeName('a'.repeat(255)), true);
});

console.log('\nisSafeDate:');

test('accepts valid date YYYY-MM-DD', function() {
  assert.strictEqual(isSafeDate('2024-01-15'), true);
});

test('accepts date with high values', function() {
  assert.strictEqual(isSafeDate('2099-12-31'), true);
});

test('rejects date with path traversal', function() {
  assert.strictEqual(isSafeDate('../../etc'), false);
});

test('rejects date with slashes', function() {
  assert.strictEqual(isSafeDate('2024/01/15'), false);
});

test('rejects non-date string', function() {
  assert.strictEqual(isSafeDate('not-a-date'), false);
});

test('rejects null', function() {
  assert.strictEqual(isSafeDate(null), false);
});

test('rejects number', function() {
  assert.strictEqual(isSafeDate(20240115), false);
});

test('rejects date with extra characters', function() {
  assert.strictEqual(isSafeDate('2024-01-15; rm -rf'), false);
});

test('rejects incomplete date', function() {
  assert.strictEqual(isSafeDate('2024-01'), false);
});

test('rejects date with wrong separators', function() {
  assert.strictEqual(isSafeDate('2024.01.15'), false);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
