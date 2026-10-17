import type { RequestHandler } from 'express';
import sanitizeHtml from 'sanitize-html';

const textFields = new Set([
  'title', 'description', 'content', 'caption', 'comment', 'name', 'subtitle', 'bio', 'username', 'password',
]);
const unsafeKeys = new Set(['__proto__', 'prototype', 'constructor']);

export function validateInput(value: unknown, depth = 0): boolean {
  if (depth > 20) return false;
  if (typeof value === 'string') return !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value);
  if (value === null || typeof value !== 'object') return true;
  return Object.entries(value).every(([key, child]) => !unsafeKeys.has(key)
    && (!textFields.has(key) || child === null || typeof child === 'string')
    && validateInput(child, depth + 1));
}

export const validateRequestInput: RequestHandler = (req, res, next) => {
  if (!validateInput(req.body) || !validateInput(req.query) || !validateInput(req.params)) {
    console.warn('[INPUT] Rejected malformed fields for', req.method, req.path);
    res.status(400).json({ error: 'Invalid input fields or unsupported control characters' });
    return;
  }
  next();
};

export function sanitizeRichText(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'div', 'span', 'font', 'h1', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'ul', 'ol', 'li', 'blockquote', 'a', 'img'],
    allowedAttributes: { a: ['href', 'target', 'rel'], img: ['src', 'alt', 'width', 'height'], font: ['color', 'size'], '*': ['style'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedStyles: {
      '*': {
        color: [/^#[a-f0-9]{3,8}$/i, /^[a-z]+$/i, /^rgba?\([\d\s,.%]+\)$/i],
        'background-color': [/^#[a-f0-9]{3,8}$/i, /^[a-z]+$/i, /^rgba?\([\d\s,.%]+\)$/i],
        'text-align': [/^(left|right|center|justify)$/],
        'font-size': [/^\d+(px|em|rem|%)$/],
        'font-weight': [/^(normal|bold|[1-9]00)$/],
        'text-decoration': [/^(underline|line-through|none)$/],
      },
    },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attributes) => ({ tagName, attribs: { ...attributes, rel: 'noopener noreferrer' } }),
    },
  });
}
