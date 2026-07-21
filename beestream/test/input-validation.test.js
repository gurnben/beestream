process.env.NODE_ENV = process.env.NODE_ENV || 'test';

const assert = require('assert');
const { describe, it, before } = require('node:test');
const mongoose = require('mongoose');

before(() => {
  require('../app/models/comment.server.model.js');
  require('../app/models/tag.server.model.js');
  require('../app/models/avaliabletags.server.model.js');
  require('../app/models/averagetrafficbyday.server.model.js');
  require('../app/models/averagetrafficbihourly.server.model.js');
  require('../app/models/averagetrafficbyhour.server.model.js');
  require('../app/models/hiveswithanalysis.server.model.js');
  require('../app/models/videofile.server.model.js');
  require('../app/models/audiofile.server.model.js');
  require('../app/models/audio.averagebihourly.server.model.js');
  require('../app/models/audio.averagebyday.server.model.js');
  require('../app/models/audio.averagehourly.server.model.js');
});

function freshRequire(modulePath) {
  delete require.cache[require.resolve(modulePath)];
  return require(modulePath);
}

function makeSocket() {
  const handlers = {};
  const emitted = [];
  return {
    socket: {
      authenticated: false,
      on: (event, handler) => { handlers[event] = handler; },
      emit: (event, data) => { emitted.push({ event, data }); }
    },
    handlers,
    emitted
  };
}

describe('comment controller input validation', () => {
  it('rejects newComment with non-string username', (_, done) => {
    const { socket, handlers, emitted } = makeSocket();
    const configure = freshRequire('../app/controllers/comment.server.controller.js');
    configure({}, socket);
    handlers['newComment']({
      username: { '$ne': '' },
      comment: 'test',
      hive: 'hive1',
      datetime: new Date().toISOString()
    });
    assert.strictEqual(emitted.length, 1);
    assert.strictEqual(emitted[0].event, 'commentError');
    done();
  });

  it('rejects newComment with oversized username', (_, done) => {
    const { socket, handlers, emitted } = makeSocket();
    const configure = freshRequire('../app/controllers/comment.server.controller.js');
    configure({}, socket);
    handlers['newComment']({
      username: 'a'.repeat(101),
      comment: 'test',
      hive: 'hive1',
      datetime: new Date().toISOString()
    });
    assert.strictEqual(emitted.length, 1);
    assert.strictEqual(emitted[0].event, 'commentError');
    done();
  });

  it('rejects newComment with non-string comment', (_, done) => {
    const { socket, handlers, emitted } = makeSocket();
    const configure = freshRequire('../app/controllers/comment.server.controller.js');
    configure({}, socket);
    handlers['newComment']({
      username: 'user1',
      comment: { '$gt': '' },
      hive: 'hive1',
      datetime: new Date().toISOString()
    });
    assert.strictEqual(emitted.length, 1);
    assert.strictEqual(emitted[0].event, 'commentError');
    done();
  });

  it('rejects newComment with invalid datetime', (_, done) => {
    const { socket, handlers, emitted } = makeSocket();
    const configure = freshRequire('../app/controllers/comment.server.controller.js');
    configure({}, socket);
    handlers['newComment']({
      username: 'user1',
      comment: 'test',
      hive: 'hive1',
      datetime: 'not-a-date'
    });
    assert.strictEqual(emitted.length, 1);
    assert.strictEqual(emitted[0].event, 'commentError');
    done();
  });

  it('rejects newComment with null message', (_, done) => {
    const { socket, handlers, emitted } = makeSocket();
    const configure = freshRequire('../app/controllers/comment.server.controller.js');
    configure({}, socket);
    handlers['newComment'](null);
    assert.strictEqual(emitted.length, 1);
    assert.strictEqual(emitted[0].event, 'commentError');
    done();
  });

  it('rejects getComments with non-string hive (NoSQL injection)', (_, done) => {
    const { socket, handlers, emitted } = makeSocket();
    const configure = freshRequire('../app/controllers/comment.server.controller.js');
    configure({}, socket);
    handlers['getComments']({
      hive: { '$ne': '' },
      datetime: new Date().toISOString()
    });
    assert.strictEqual(emitted.length, 1);
    assert.strictEqual(emitted[0].event, 'commentError');
    done();
  });

  it('rejects getComments with null message', (_, done) => {
    const { socket, handlers, emitted } = makeSocket();
    const configure = freshRequire('../app/controllers/comment.server.controller.js');
    configure({}, socket);
    handlers['getComments'](null);
    assert.strictEqual(emitted.length, 1);
    assert.strictEqual(emitted[0].event, 'commentError');
    done();
  });
});

describe('dashboard controller input validation', () => {
  it('rejects getData with non-array hives (NoSQL injection)', (_, done) => {
    const { socket, handlers, emitted } = makeSocket();
    const configure = freshRequire('../app/controllers/dashboard.server.controller.js');
    configure({}, socket);
    handlers['getData']({
      dataSets: { video: [], audio: [] },
      hives: { '$ne': '' },
      count: 10
    });
    assert.strictEqual(emitted.length, 0);
    done();
  });

  it('rejects getData with object elements in hives array', (_, done) => {
    const { socket, handlers, emitted } = makeSocket();
    const configure = freshRequire('../app/controllers/dashboard.server.controller.js');
    configure({}, socket);
    handlers['getData']({
      dataSets: { video: [], audio: [] },
      hives: [{ '$ne': '' }],
      count: 10
    });
    assert.strictEqual(emitted.length, 0);
    done();
  });

  it('rejects getData with missing dataSets', (_, done) => {
    const { socket, handlers, emitted } = makeSocket();
    const configure = freshRequire('../app/controllers/dashboard.server.controller.js');
    configure({}, socket);
    handlers['getData']({ hives: ['hive1'], count: 10 });
    assert.strictEqual(emitted.length, 0);
    done();
  });

  it('rejects getData with non-object message', (_, done) => {
    const { socket, handlers, emitted } = makeSocket();
    const configure = freshRequire('../app/controllers/dashboard.server.controller.js');
    configure({}, socket);
    handlers['getData'](null);
    assert.strictEqual(emitted.length, 0);
    done();
  });

  it('rejects getData with non-numeric count', (_, done) => {
    const { socket, handlers, emitted } = makeSocket();
    const configure = freshRequire('../app/controllers/dashboard.server.controller.js');
    configure({}, socket);
    handlers['getData']({
      dataSets: { video: [], audio: [] },
      hives: ['hive1'],
      count: 'not-a-number'
    });
    assert.strictEqual(emitted.length, 0);
    done();
  });

  it('rejects getData with oversized hives array', (_, done) => {
    const { socket, handlers, emitted } = makeSocket();
    const configure = freshRequire('../app/controllers/dashboard.server.controller.js');
    configure({}, socket);
    const bigHives = Array.from({ length: 101 }, (_, i) => `hive${i}`);
    handlers['getData']({
      dataSets: { video: [], audio: [] },
      hives: bigHives,
      count: 10
    });
    assert.strictEqual(emitted.length, 0);
    done();
  });
});

describe('archive controller input validation', () => {
  it('rejects getDate with non-string hive (NoSQL injection)', (_, done) => {
    const { socket, handlers, emitted } = makeSocket();
    const configure = freshRequire('../app/controllers/archive.server.controller.js');
    configure({}, socket);
    handlers['getDate']({ hive: { '$ne': '' } });
    assert.strictEqual(emitted.length, 0);
    done();
  });

  it('rejects getDate with null message', (_, done) => {
    const { socket, handlers, emitted } = makeSocket();
    const configure = freshRequire('../app/controllers/archive.server.controller.js');
    configure({}, socket);
    handlers['getDate'](null);
    assert.strictEqual(emitted.length, 0);
    done();
  });

  it('rejects getDate with oversized hive name', (_, done) => {
    const { socket, handlers, emitted } = makeSocket();
    const configure = freshRequire('../app/controllers/archive.server.controller.js');
    configure({}, socket);
    handlers['getDate']({ hive: 'a'.repeat(201) });
    assert.strictEqual(emitted.length, 0);
    done();
  });

  it('rejects getTime with non-string hive (NoSQL injection)', (_, done) => {
    const { socket, handlers, emitted } = makeSocket();
    const configure = freshRequire('../app/controllers/archive.server.controller.js');
    configure({}, socket);
    handlers['getTime']({ hive: { '$ne': '' }, date: '2024-01-01' });
    assert.strictEqual(emitted.length, 0);
    done();
  });

  it('rejects getTime with non-string date', (_, done) => {
    const { socket, handlers, emitted } = makeSocket();
    const configure = freshRequire('../app/controllers/archive.server.controller.js');
    configure({}, socket);
    handlers['getTime']({ hive: 'hive1', date: 12345 });
    assert.strictEqual(emitted.length, 0);
    done();
  });

  it('rejects getTime with invalid date string', (_, done) => {
    const { socket, handlers, emitted } = makeSocket();
    const configure = freshRequire('../app/controllers/archive.server.controller.js');
    configure({}, socket);
    handlers['getTime']({ hive: 'hive1', date: 'not-a-date' });
    assert.strictEqual(emitted.length, 0);
    done();
  });

  it('rejects getTime with null message', (_, done) => {
    const { socket, handlers, emitted } = makeSocket();
    const configure = freshRequire('../app/controllers/archive.server.controller.js');
    configure({}, socket);
    handlers['getTime'](null);
    assert.strictEqual(emitted.length, 0);
    done();
  });
});

describe('validate middleware', () => {
  const { isNonEmptyString, isStringArray, sanitizeString } = require('../app/middleware/validate.js');

  it('isNonEmptyString accepts valid strings', () => {
    assert.strictEqual(isNonEmptyString('hello', 10), true);
    assert.strictEqual(isNonEmptyString('a', 1), true);
  });

  it('isNonEmptyString rejects empty strings', () => {
    assert.strictEqual(isNonEmptyString('', 10), false);
  });

  it('isNonEmptyString rejects strings exceeding max length', () => {
    assert.strictEqual(isNonEmptyString('hello', 3), false);
  });

  it('isNonEmptyString rejects non-strings', () => {
    assert.strictEqual(isNonEmptyString(123, 10), false);
    assert.strictEqual(isNonEmptyString(null, 10), false);
    assert.strictEqual(isNonEmptyString(undefined, 10), false);
    assert.strictEqual(isNonEmptyString({}, 10), false);
    assert.strictEqual(isNonEmptyString([], 10), false);
  });

  it('isStringArray accepts valid arrays', () => {
    assert.strictEqual(isStringArray(['a', 'b'], 5), true);
    assert.strictEqual(isStringArray([], 5), true);
  });

  it('isStringArray rejects non-arrays', () => {
    assert.strictEqual(isStringArray('hello', 5), false);
    assert.strictEqual(isStringArray({ '$ne': '' }, 5), false);
    assert.strictEqual(isStringArray(null, 5), false);
  });

  it('isStringArray rejects arrays with non-string elements', () => {
    assert.strictEqual(isStringArray([{ '$ne': '' }], 5), false);
    assert.strictEqual(isStringArray([123], 5), false);
  });

  it('isStringArray rejects oversized arrays', () => {
    const big = Array.from({ length: 6 }, () => 'x');
    assert.strictEqual(isStringArray(big, 5), false);
  });

  it('sanitizeString returns string values unchanged', () => {
    assert.strictEqual(sanitizeString('hello'), 'hello');
  });

  it('sanitizeString returns undefined for non-strings', () => {
    assert.strictEqual(sanitizeString({ '$ne': '' }), undefined);
    assert.strictEqual(sanitizeString(123), undefined);
    assert.strictEqual(sanitizeString(null), undefined);
  });
});
