const path = require('path');

const SAFE_NAME_RE = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isSafeName(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= 255 && SAFE_NAME_RE.test(value);
}

function isSafeDate(value) {
  return typeof value === 'string' && DATE_RE.test(value);
}

module.exports = { isSafeName, isSafeDate };
