/**
 * sanitize.js — XSS / HTML Tag-Strip Middleware
 * Recursively walks req.body and req.query and removes HTML tags
 * plus null-bytes from every string value before any controller runs.
 */

// Strip HTML tags and null-bytes from a string
const stripHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<[^>]*>/g, '')      // remove all HTML tags
    .replace(/\0/g, '')           // remove null bytes
    .replace(/javascript:/gi, '') // neutralise JS protocol
    .replace(/on\w+\s*=/gi, '')   // remove event handler attributes
    .trim();
};

// Recursively sanitize an object's string values
const sanitizeObject = (obj) => {
  if (obj === null || typeof obj !== 'object') return stripHtml(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  const cleaned = {};
  for (const key of Object.keys(obj)) {
    cleaned[key] = sanitizeObject(obj[key]);
  }
  return cleaned;
};

const sanitizeInput = (req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  next();
};

module.exports = sanitizeInput;
