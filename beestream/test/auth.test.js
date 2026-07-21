process.env.NODE_ENV = process.env.NODE_ENV || 'test';

const assert = require('assert');
const { describe, it, beforeEach, afterEach, before } = require('node:test');
const mongoose = require('mongoose');

before(() => {
  require('../app/models/comment.server.model.js');
  require('../app/models/tag.server.model.js');
  require('../app/models/avaliabletags.server.model.js');
});

function freshRequire(modulePath) {
  delete require.cache[require.resolve(modulePath)];
  return require(modulePath);
}

describe('auth middleware', () => {
  let originalToken;

  beforeEach(() => {
    originalToken = process.env.BEESTREAM_AUTH_TOKEN;
  });

  afterEach(() => {
    if (originalToken === undefined) {
      delete process.env.BEESTREAM_AUTH_TOKEN;
    } else {
      process.env.BEESTREAM_AUTH_TOKEN = originalToken;
    }
  });

  describe('isAuthEnabled', () => {
    it('returns false when BEESTREAM_AUTH_TOKEN is not set', () => {
      delete process.env.BEESTREAM_AUTH_TOKEN;
      const { isAuthEnabled } = freshRequire('../app/middleware/auth.js');
      assert.strictEqual(isAuthEnabled(), false);
    });

    it('returns false when BEESTREAM_AUTH_TOKEN is empty', () => {
      process.env.BEESTREAM_AUTH_TOKEN = '';
      const { isAuthEnabled } = freshRequire('../app/middleware/auth.js');
      assert.strictEqual(isAuthEnabled(), false);
    });

    it('returns true when BEESTREAM_AUTH_TOKEN is set', () => {
      process.env.BEESTREAM_AUTH_TOKEN = 'test-secret-token';
      const { isAuthEnabled } = freshRequire('../app/middleware/auth.js');
      assert.strictEqual(isAuthEnabled(), true);
    });
  });

  describe('verifyToken', () => {
    it('rejects when auth is not enabled', () => {
      delete process.env.BEESTREAM_AUTH_TOKEN;
      const { verifyToken } = freshRequire('../app/middleware/auth.js');
      assert.strictEqual(verifyToken('anything'), false);
    });

    it('rejects null token', () => {
      process.env.BEESTREAM_AUTH_TOKEN = 'secret';
      const { verifyToken } = freshRequire('../app/middleware/auth.js');
      assert.strictEqual(verifyToken(null), false);
    });

    it('rejects undefined token', () => {
      process.env.BEESTREAM_AUTH_TOKEN = 'secret';
      const { verifyToken } = freshRequire('../app/middleware/auth.js');
      assert.strictEqual(verifyToken(undefined), false);
    });

    it('rejects non-string token', () => {
      process.env.BEESTREAM_AUTH_TOKEN = 'secret';
      const { verifyToken } = freshRequire('../app/middleware/auth.js');
      assert.strictEqual(verifyToken(12345), false);
    });

    it('rejects wrong token', () => {
      process.env.BEESTREAM_AUTH_TOKEN = 'correct-token';
      const { verifyToken } = freshRequire('../app/middleware/auth.js');
      assert.strictEqual(verifyToken('wrong-tokens'), false);
    });

    it('rejects token with wrong length', () => {
      process.env.BEESTREAM_AUTH_TOKEN = 'correct-token';
      const { verifyToken } = freshRequire('../app/middleware/auth.js');
      assert.strictEqual(verifyToken('short'), false);
    });

    it('accepts correct token', () => {
      process.env.BEESTREAM_AUTH_TOKEN = 'correct-token';
      const { verifyToken } = freshRequire('../app/middleware/auth.js');
      assert.strictEqual(verifyToken('correct-token'), true);
    });
  });

  describe('socketAuthMiddleware', () => {
    it('marks socket as unauthenticated when auth is not enabled', (_, done) => {
      delete process.env.BEESTREAM_AUTH_TOKEN;
      const { socketAuthMiddleware } = freshRequire('../app/middleware/auth.js');
      const socket = { handshake: { auth: {}, query: {} } };
      socketAuthMiddleware(socket, () => {
        assert.strictEqual(socket.authenticated, false);
        done();
      });
    });

    it('marks socket as authenticated with valid token in auth', (_, done) => {
      process.env.BEESTREAM_AUTH_TOKEN = 'my-secret';
      const { socketAuthMiddleware } = freshRequire('../app/middleware/auth.js');
      const socket = { handshake: { auth: { token: 'my-secret' }, query: {} } };
      socketAuthMiddleware(socket, () => {
        assert.strictEqual(socket.authenticated, true);
        done();
      });
    });

    it('marks socket as authenticated with valid token in query', (_, done) => {
      process.env.BEESTREAM_AUTH_TOKEN = 'my-secret';
      const { socketAuthMiddleware } = freshRequire('../app/middleware/auth.js');
      const socket = { handshake: { auth: {}, query: { token: 'my-secret' } } };
      socketAuthMiddleware(socket, () => {
        assert.strictEqual(socket.authenticated, true);
        done();
      });
    });

    it('marks socket as unauthenticated with wrong token', (_, done) => {
      process.env.BEESTREAM_AUTH_TOKEN = 'my-secret';
      const { socketAuthMiddleware } = freshRequire('../app/middleware/auth.js');
      const socket = { handshake: { auth: { token: 'wrong-tok' }, query: {} } };
      socketAuthMiddleware(socket, () => {
        assert.strictEqual(socket.authenticated, false);
        done();
      });
    });

    it('marks socket as unauthenticated with no token when auth is enabled', (_, done) => {
      process.env.BEESTREAM_AUTH_TOKEN = 'my-secret';
      const { socketAuthMiddleware } = freshRequire('../app/middleware/auth.js');
      const socket = { handshake: { auth: {}, query: {} } };
      socketAuthMiddleware(socket, () => {
        assert.strictEqual(socket.authenticated, false);
        done();
      });
    });

    it('always calls next to allow connection', (_, done) => {
      process.env.BEESTREAM_AUTH_TOKEN = 'my-secret';
      const { socketAuthMiddleware } = freshRequire('../app/middleware/auth.js');
      const socket = { handshake: { auth: {}, query: {} } };
      socketAuthMiddleware(socket, () => {
        done();
      });
    });
  });
});

describe('comment controller auth guard', () => {
  let originalToken;

  beforeEach(() => {
    originalToken = process.env.BEESTREAM_AUTH_TOKEN;
  });

  afterEach(() => {
    if (originalToken === undefined) {
      delete process.env.BEESTREAM_AUTH_TOKEN;
    } else {
      process.env.BEESTREAM_AUTH_TOKEN = originalToken;
    }
  });

  it('rejects newComment from unauthenticated socket when auth is enabled', (_, done) => {
    process.env.BEESTREAM_AUTH_TOKEN = 'secret';
    freshRequire('../app/middleware/auth.js');

    const handlers = {};
    const emitted = [];
    const socket = {
      authenticated: false,
      on: (event, handler) => { handlers[event] = handler; },
      emit: (event, data) => { emitted.push({ event, data }); }
    };

    const configureComment = freshRequire('../app/controllers/comment.server.controller.js');
    configureComment({}, socket);

    handlers['newComment']({
      username: 'attacker',
      comment: 'spam',
      hive: 'hive1',
      datetime: new Date().toISOString()
    });

    assert.strictEqual(emitted.length, 1);
    assert.strictEqual(emitted[0].event, 'commentError');
    assert.strictEqual(emitted[0].data.message, 'Authentication required');
    done();
  });
});

describe('tag controller auth guard', () => {
  let originalToken;

  beforeEach(() => {
    originalToken = process.env.BEESTREAM_AUTH_TOKEN;
  });

  afterEach(() => {
    if (originalToken === undefined) {
      delete process.env.BEESTREAM_AUTH_TOKEN;
    } else {
      process.env.BEESTREAM_AUTH_TOKEN = originalToken;
    }
  });

  it('rejects newTag from unauthenticated socket when auth is enabled', (_, done) => {
    process.env.BEESTREAM_AUTH_TOKEN = 'secret';
    freshRequire('../app/middleware/auth.js');

    const handlers = {};
    const emitted = [];
    const socket = {
      authenticated: false,
      on: (event, handler) => { handlers[event] = handler; },
      emit: (event, data) => { emitted.push({ event, data }); }
    };

    const configureTags = freshRequire('../app/controllers/tag.server.controller.js');
    configureTags({}, socket);

    handlers['newTag']({
      hive: 'hive1',
      datetime: new Date().toISOString(),
      tag: 'test'
    });

    assert.strictEqual(emitted.length, 1);
    assert.strictEqual(emitted[0].event, 'tagError');
    assert.strictEqual(emitted[0].data.message, 'Authentication required');
    done();
  });

  it('rejects decrementTag from unauthenticated socket when auth is enabled', (_, done) => {
    process.env.BEESTREAM_AUTH_TOKEN = 'secret';
    freshRequire('../app/middleware/auth.js');

    const handlers = {};
    const emitted = [];
    const socket = {
      authenticated: false,
      on: (event, handler) => { handlers[event] = handler; },
      emit: (event, data) => { emitted.push({ event, data }); }
    };

    const configureTags = freshRequire('../app/controllers/tag.server.controller.js');
    configureTags({}, socket);

    handlers['decrementTag']({
      hive: 'hive1',
      datetime: new Date().toISOString(),
      tag: 'test'
    });

    assert.strictEqual(emitted.length, 1);
    assert.strictEqual(emitted[0].event, 'tagError');
    assert.strictEqual(emitted[0].data.message, 'Authentication required');
    done();
  });
});
