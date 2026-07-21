function isNonEmptyString(val, maxLength) {
  return typeof val === 'string' && val.length > 0 && val.length <= maxLength;
}

function isStringArray(val, maxItems) {
  return Array.isArray(val) &&
    val.length <= maxItems &&
    val.every(item => typeof item === 'string');
}

function sanitizeString(val) {
  if (typeof val !== 'string') return undefined;
  return val;
}

module.exports = { isNonEmptyString, isStringArray, sanitizeString };
