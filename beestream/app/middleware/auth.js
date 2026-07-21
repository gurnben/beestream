const crypto = require('crypto');

function getAuthToken() {
  return process.env.BEESTREAM_AUTH_TOKEN || '';
}

function isAuthEnabled() {
  return getAuthToken().length > 0;
}

function verifyToken(token) {
  if (!isAuthEnabled()) {
    return false;
  }
  if (!token || typeof token !== 'string') {
    return false;
  }
  const expected = getAuthToken();
  if (token.length !== expected.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

function socketAuthMiddleware(socket, next) {
  if (!isAuthEnabled()) {
    socket.authenticated = false;
    next();
    return;
  }
  var token = (socket.handshake.auth && socket.handshake.auth.token) ||
              (socket.handshake.query && socket.handshake.query.token);
  socket.authenticated = verifyToken(token);
  next();
}

module.exports = {
  isAuthEnabled,
  verifyToken,
  socketAuthMiddleware
};
