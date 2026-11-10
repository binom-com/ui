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

test('elevations come from the Binom shadows, per mode', () => {
  const light = createTheme(createBinomTheme('light'));
  assert.equal(light.shadows.length, 25);
  assert.equal(light.shadows[0], 'none');
  assert.equal(light.shadows[1], '0 1px 4px rgb(32 39 32 / 15%)');
  assert.equal(light.shadows[8], '0 8px 24px rgb(32 39 32 / 12%)');
  assert.equal(light.shadows[24], '0 16px 48px rgb(32 39 32 / 18%)');
  assert.match(createTheme(createBinomTheme('dark')).shadows[24], /^0 0 0 1px rgb\(232 236 226/);
});

test('CommonJS build gives the same theme, a fresh object each call', () => {
  const cjs = createRequire(import.meta.url)('../dist/mui.cjs');
  assert.deepEqual(cjs.createBinomTheme('dark'), createBinomTheme('dark'));
  const a = createBinomTheme('light');
  a.palette.primary.main = 'red';
  assert.equal(createBinomTheme('light').palette.primary.main, '#384c2c');
});

test('an unknown mode is refused', () => {
  assert.throws(() => createBinomTheme('sepia'), /unknown mode/);
});
