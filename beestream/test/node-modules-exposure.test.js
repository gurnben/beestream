process.env.NODE_ENV = process.env.NODE_ENV || 'test';

const assert = require('assert');
const { describe, it } = require('node:test');
const http = require('http');
const express = require('express');
const path = require('path');
const fs = require('fs');

function requestPath(server, urlPath) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const req = http.get(`http://127.0.0.1:${addr.port}${urlPath}`, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });
    req.on('error', reject);
  });
}

function buildApp() {
  const app = express();
  app.use('/', express.static(path.resolve('./public')));
  return app;
}

describe('node_modules not served as static files', () => {
  let server;

  it('does not expose /lib/express/package.json', async () => {
    const app = buildApp();
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    try {
      const res = await requestPath(server, '/lib/express/package.json');
      assert.strictEqual(res.statusCode, 404,
        '/lib/express/package.json should not be accessible');
    } finally {
      server.close();
    }
  });

  it('does not expose /lib/mongoose/package.json', async () => {
    const app = buildApp();
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    try {
      const res = await requestPath(server, '/lib/mongoose/package.json');
      assert.strictEqual(res.statusCode, 404,
        '/lib/mongoose/package.json should not be accessible');
    } finally {
      server.close();
    }
  });

  it('still serves static files from /public', async () => {
    const publicDir = path.resolve('./public');
    const testFile = path.join(publicDir, '__test-static.txt');
    fs.writeFileSync(testFile, 'test-content');
    try {
      const app = buildApp();
      server = http.createServer(app);
      await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
      const res = await requestPath(server, '/__test-static.txt');
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body, 'test-content');
    } finally {
      server.close();
      fs.unlinkSync(testFile);
    }
  });
});
