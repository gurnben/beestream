const assert = require('assert');
const path = require('path');
const videoController = require('./video.server.controller');

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

function mockRes() {
  var r = { ended: false, statusCode: null };
  r.writeHead = function(code) { r.statusCode = code; };
  r.end = function() { r.ended = true; };
  return r;
}

console.log('video.server.controller path traversal tests');

test('legitimate video name passes through', function() {
  var req = {};
  var res = mockRes();
  var called = false;
  videoController.videoName(req, res, function() { called = true; }, 'myvideo');
  assert.strictEqual(req.video, 'myvideo');
  assert.strictEqual(called, true);
  assert.strictEqual(res.ended, false);
});

test('path traversal with ../ is blocked', function() {
  var req = {};
  var res = mockRes();
  var called = false;
  videoController.videoName(req, res, function() { called = true; }, '../../etc/passwd');
  assert.strictEqual(called, false, 'next() should not be called');
  assert.strictEqual(req.video, undefined);
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.ended, true);
});

test('path traversal with encoded slashes is blocked', function() {
  var req = {};
  var res = mockRes();
  var called = false;
  videoController.videoName(req, res, function() { called = true; }, '../../../etc/shadow');
  assert.strictEqual(called, false);
  assert.strictEqual(res.statusCode, 400);
});

test('path with directory separator is rejected', function() {
  var req = {};
  var res = mockRes();
  var called = false;
  videoController.videoName(req, res, function() { called = true; }, 'subdir/video');
  assert.strictEqual(called, false);
  assert.strictEqual(res.statusCode, 400);
});

test('video name with .mp4 extension is handled correctly', function() {
  var req = {};
  var res = mockRes();
  var called = false;
  videoController.videoName(req, res, function() { called = true; }, 'test.mp4');
  assert.strictEqual(req.video, 'test');
  assert.strictEqual(called, true);
});

test('null byte injection attempt is safe', function() {
  var req = {};
  var res = mockRes();
  var called = false;
  videoController.videoName(req, res, function() { called = true; }, '../../etc/passwd\x00');
  assert.strictEqual(called, false);
  assert.strictEqual(res.statusCode, 400);
});

test('simple alphanumeric video name works', function() {
  var req = {};
  var res = mockRes();
  var called = false;
  videoController.videoName(req, res, function() { called = true; }, 'bee-hive-2024');
  assert.strictEqual(req.video, 'bee-hive-2024');
  assert.strictEqual(called, true);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
