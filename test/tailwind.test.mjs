import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// A real Tailwind 4 build of a page using Binom classes and one Tailwind default (bg-red-500).
const built = execFileSync(join(root, 'node_modules/.bin/tailwindcss'), ['-i', join(root, 'test/fixtures/tailwind/input.css')], {
  cwd: root,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'ignore'],
});
const rule = (selector) => new RegExp(`\\${selector} \\{\\s*([^}]*)\\}`).exec(built)?.[1].trim();

test('Binom classes read the Binom tokens', () => {
  assert.equal(rule('.bg-page'), 'background-color: var(--color-page);');
  assert.equal(rule('.text-muted'), 'color: var(--color-muted);');
  assert.equal(rule('.rounded-xl'), 'border-radius: var(--radius-xl);');
  assert.equal(rule('.font-sans'), 'font-family: var(--font-sans);');
});

test('shadows read their variable, so the dark shadow applies', () => {
  assert.equal(rule('.shadow-dialog'), 'box-shadow: var(--shadow-dialog);');
});

test("Tailwind's own palette is kept", () => {
  assert.equal(rule('.bg-red-500'), 'background-color: var(--color-red-500);');
});

test('light values in the theme, dark values under both dark selectors', () => {
  assert.match(built, /--color-page: #f7f8f2;/);
  const dark = built.slice(built.indexOf(":root[data-theme='dark']"));
  assert.match(dark, /--color-page: #141814;/);
  const system = built.slice(built.indexOf('@media (prefers-color-scheme: dark)'));
  assert.match(system, /:root:not\(\[data-theme='light'\]\) \{[^}]*--color-page: #141814;/);
});
