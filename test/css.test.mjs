import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
// The chat theme as Ideas carried it (binom-com/Ideas app/web/src/binom-ui/theme.css): the values this package must keep.
const seed = read('test/fixtures/seed-theme.css');

/** Custom properties declared directly in the block opened by the first `head` (comments ignored). */
function vars(source, head) {
  const start = source.indexOf(head);
  assert.ok(start >= 0, `block ${head}`);
  const open = source.indexOf('{', start + head.length - 1);
  let depth = 0;
  let i = open;
  for (; i < source.length; i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}' && --depth === 0) break;
  }
  const body = source.slice(open + 1, i).replace(/\/\*[\s\S]*?\*\//g, '');
  return Object.fromEntries([...body.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}

const BLOCKS = [
  ':root {',
  ":root[data-theme='dark'] {",
  "@media (prefers-color-scheme: dark) {\n  :root:not([data-theme='light']) {",
  '@media (pointer: fine) {',
  '@media (prefers-reduced-motion: reduce) {',
];

test('tokens.css keeps every value of the chat theme, block by block', () => {
  const tokens = read('dist/tokens.css');
  for (const head of BLOCKS) assert.deepEqual(vars(tokens, head), vars(seed, head), head);
});

test('theme.css is fonts, then tokens, then base rules', () => {
  const theme = read('dist/theme.css');
  const at = (s) => theme.indexOf(s);
  assert.ok(at('@font-face') < at(':root {') && at(':root {') < at('button {'));
  assert.ok(theme.includes("url('../fonts/dm-sans-latin.woff2')"));
  assert.ok(theme.includes('button.primary { background: var(--color-accent)'));
  assert.ok(theme.includes("@media (prefers-color-scheme: dark) {\n  :root:not([data-theme='light'])"));
});

test('dist matches a fresh build (nobody edited it by hand)', () => {
  const fresh = mkdtempSync(join(tmpdir(), 'binom-ui-'));
  execFileSync(process.execPath, [join(root, 'scripts/build.mjs'), fresh]);
  assert.deepEqual(readdirSync(join(root, 'dist')).sort(), readdirSync(fresh).sort(), 'no stale or missing files');
  for (const name of readdirSync(fresh)) assert.equal(read(`dist/${name}`), readFileSync(join(fresh, name), 'utf8'), name);
});

test('base rules are the chat rules, with every hover tint for a mouse only', () => {
  const base = read('dist/base.css');
  for (const rule of ["svg.lucide[stroke-width='2'] { stroke-width: 1.65; }", 'input:focus,', '@media (hover: none) {'])
    assert.ok(base.includes(rule), rule);
  // Every `@media (hover: hover) { … }` block (one level of nesting), then what is left outside them.
  const blocks = [...base.matchAll(/@media \(hover: hover\) \{((?:[^{}]|\{[^{}]*\})*)\}/g)].map((m) => m[1]);
  const outside = base.replace(/@media \(hover: hover\) \{(?:[^{}]|\{[^{}]*\})*\}/g, '');
  const tints = ['button:where(:hover:not(:disabled))', 'button.primary:hover:not(:disabled)', 'a.primary-link:hover'];
  for (const tint of tints) {
    assert.equal(base.split(tint).length - 1, 1, `${tint} appears once`);
    assert.ok(blocks.some((b) => b.includes(tint)), `${tint} is inside @media (hover: hover)`);
  }
  // Outside those blocks the only hover left is the scrollbar thumb: no bare tint, no touch reset.
  const bareHovers = outside.match(/[^\s,{}]*:hover[^{,]*/g) ?? [];
  assert.deepEqual(bareHovers.map((h) => h.trim()), [':hover::-webkit-scrollbar-thumb']);
});
