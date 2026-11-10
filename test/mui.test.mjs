import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createBinomTheme } from '../dist/mui.js';

// Material UI 5 ships no ESM subpath exports for Node; its CommonJS build is the same code apps bundle.
const { createTheme } = createRequire(import.meta.url)('@mui/material/styles');

const walk = (value, out = []) => {
  if (typeof value === 'string') out.push(value);
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => walk(v, out));
  return out;
};

test('light theme takes the Binom colours, font and corners', () => {
  const t = createTheme(createBinomTheme('light'));
  assert.equal(t.palette.primary.main, '#384c2c');
  assert.equal(t.palette.primary.contrastText, '#ffffff');
  assert.equal(t.palette.background.default, '#f7f8f2');
  assert.equal(t.palette.background.paper, '#ffffff');
  assert.equal(t.palette.error.main, '#b3261e');
  assert.equal(t.shape.borderRadius, 9);
  assert.match(t.typography.fontFamily, /^'DM Sans Variable'/);
});

test('dark theme takes the dark values', () => {
  const t = createTheme(createBinomTheme('dark'));
  assert.equal(t.palette.mode, 'dark');
  assert.equal(t.palette.primary.main, '#bfdf86');
  assert.equal(t.palette.primary.contrastText, '#141814');
  assert.equal(t.palette.background.default, '#141814');
});

test('no CSS variable reaches Material UI (it computes colours)', () => {
  for (const mode of ['light', 'dark']) assert.ok(walk(createBinomTheme(mode)).every((s) => !s.includes('var(')), mode);
});

test('an unknown mode is refused', () => {
  assert.throws(() => createBinomTheme('sepia'), /unknown mode/);
});
