# @binom/ui 0.1.0 Foundation Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A repo `binom-com/ui` with one token source (`tokens/tokens.json`) and generated CSS, Tailwind 4 and Material UI 5 outputs, installable from GitHub by tag, with Ideas as the first consumer.

**Architecture:** A dependency-free Node build script (`scripts/build.mjs`) reads `tokens/tokens.json` (W3C Design Tokens) and writes `dist/` (committed). Base element rules and fonts are copied verbatim from Ideas' `app/web/src/binom-ui/` (itself verbatim from chat). Tests run with `node --test`; a Tailwind fixture build and a Material UI `createTheme` check use dev dependencies only.

**Tech Stack:** Node 22 (ESM), `node:test`; dev only: `tailwindcss@4`, `@tailwindcss/cli@4`, `@mui/material@5`, `@emotion/react`, `@emotion/styled`, `react@18`, `react-dom@18`.

**Spec:** `docs/specs/2026-11-10-binom-ui-foundation-package.md`

**Seed (read-only):** `/Users/kanbanchi/Claude project/app/web/src/binom-ui/` — `theme.css` (354 lines: font-faces 1–20, light `:root` 26–106, dark 113–149 and 151–189, base rules 190–354 incl. pointer-fine, hover-none, reduced-motion), `fonts/`, `README.md`.

## Global Constraints

- Every token name and value comes from the seed `theme.css`; nothing invented. Token names keep the seed's CSS names (`--color-page`, `--radius-xl`, `--tap-size`, `--motion-fast`, …).
- Dark values apply under BOTH `@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) { … } }` and `:root[data-theme='dark'] { … }`.
- `dist/` is generated only; a test fails if `dist/` differs from a fresh build.
- No runtime dependencies. `package.json`: `"name": "@binom/ui"`, `"version": "0.1.0"`, `"type": "module"`, `"private": false`, `"license"` set for code (MIT) with the font under SIL OFL (`fonts/DM-Sans-OFL.txt`), `"exports"` for `./theme.css`, `./tokens.css`, `./fonts.css`, `./base.css`, `./tailwind.css`, `./mui` (`dist/mui.js`, types `dist/mui.d.ts`), `./tokens.json`; `"files": ["dist", "fonts", "tokens"]`.
- Fonts referenced from `dist/*.css` as `url('../fonts/<file>.woff2')`.
- Install line documented: `"@binom/ui": "github:binom-com/ui#v0.1.0"`.

## Review Focus

1. A Tailwind 4 app's own default palette must still work next to Binom tokens (no `--color-*: initial`); Binom classes like `bg-page` resolve to the token and flip in dark mode.
2. Material UI needs real colours (it computes alpha/darken): the MUI theme must use hex/rgb values, never `var(--…)`.
3. Tokens whose light value is a `var(...)` reference (e.g. `--bubble-radius`-style aliases, `--menu-item-size: var(--tap-size)`, dark `--color-tint: var(--color-accent)`) must survive the round trip as references, not be resolved or dropped.
4. `@media (pointer: fine)` size overrides and reduced-motion overrides are part of the token output, not lost.
5. Ideas after switching to the package renders identically (same computed values) — screenshots before/after.

---

### Task 1: Token source and CSS outputs

**Files:** create `package.json`, `tokens/tokens.json`, `scripts/build.mjs`, `src/base.css` (seed lines 190–351 minus the token blocks, verbatim), `src/fonts.css` (seed font-faces with `../fonts/` urls), `fonts/*` (copied), `dist/{tokens,fonts,base,theme}.css`, `test/css.test.mjs`, `README.md`, `.gitignore` (`node_modules`).

**Interfaces:** `npm run build` writes `dist/`; `npm test` runs `node --test`.

`tokens.json` shape: `{ "color": { "<name>": { "$type": "color", "$value": { "light": "...", "dark": "..." } } }, "shadow": {…same light/dark…}, "radius": {…$value…}, "size": {…}, "motion": {…}, "font": {…} , "$extensions": { "binom.pointerFine": { "small-control-size": "28px", … }, "binom.reducedMotion": { "motion-fast": "0s", … } } }` — the build maps `<group>.<name>` back to the seed CSS name (`--color-page`, `--radius-xl`, `--tap-size`…); a token present only in light has no dark entry.

- [ ] **Step 1: Failing tests** (`test/css.test.mjs`): `tokens.css equals the seed's token blocks` — parse custom properties per selector block from seed `theme.css` and from `dist/tokens.css` and compare maps for `:root`, `:root[data-theme='dark']`, the media dark block, pointer-fine and reduced-motion; `theme.css = fonts + tokens + base in that order`; `dist is up to date` — run the build into a temp dir and compare byte for byte; `fonts are byte-identical to the seed`.
- [ ] **Step 2:** `npm test` — FAIL.
- [ ] **Step 3:** write `tokens.json` from the seed, `build.mjs`, `src/*`, copy fonts; `npm run build`.
- [ ] **Step 4:** `npm test` — PASS.
- [ ] **Step 5:** commit `feat: token source and CSS outputs`.

### Task 2: Tailwind 4 and Material UI outputs

**Files:** extend `scripts/build.mjs`; create `dist/tailwind.css`, `dist/mui.js`, `dist/mui.d.ts`, `test/tailwind.test.mjs`, `test/mui.test.mjs`, `test/fixtures/tailwind/{input.css,index.html}`; dev dependencies listed in Tech Stack (installed with `npm install -D`).

**Interfaces:**
- `dist/tailwind.css`: `@import './fonts.css';` then `@theme { <every light token as --name: value>; --font-sans: <font token>; }` then the same dark blocks as `tokens.css` (unlayered, so they override the theme layer), pointer-fine and reduced-motion blocks. No `--color-*: initial`.
- `dist/mui.js`: `export function createBinomTheme(mode)` → MUI 5 `ThemeOptions`: `palette.mode`, `primary.main` = accent, `primary.contrastText` = on-accent, `error.main` = danger, `background.default` = page, `background.paper` = bg, `text.primary` = text, `text.secondary` = muted, `divider` = border; `typography.fontFamily` = font token; `shape.borderRadius` = 9 (number). Values resolved to literal colours (resolve `var()` references through the token map).
- `dist/mui.d.ts`: `export function createBinomTheme(mode: 'light' | 'dark'): import('@mui/material/styles').ThemeOptions;`

- [ ] **Step 1: Failing tests:** `tailwind fixture builds and maps Binom tokens` — run `npx @tailwindcss/cli -i test/fixtures/tailwind/input.css` (imports `../../../dist/tailwind.css`, content `index.html` using `bg-page text-muted rounded-xl shadow-dialog bg-red-500`) and assert the output has `.bg-page{background-color:var(--color-page)}`-equivalent, `.bg-red-500` (default palette kept), `--color-page:#f7f8f2` in the theme and `#141814` under both dark selectors. `mui theme`: `createTheme(createBinomTheme('light')).palette.primary.main === '#384c2c'`, dark `=== '#bfdf86'`, `background.default` light `#f7f8f2`, no value in palette contains `var(`.
- [ ] **Step 2:** FAIL. **Step 3:** implement. **Step 4:** `npm test` PASS.
- [ ] **Step 5:** commit `feat: Tailwind 4 and Material UI outputs`.

### Task 3: README and release prep

**Files:** `README.md`, `CHANGELOG.md`.

README (English, short): what it is; install line; per-stack usage — CSS (`import '@binom/ui/theme.css'` first), Tailwind 4 (`@import 'tailwindcss'; @import '@binom/ui/tailwind.css';`), Next.js (import in root layout), Material UI (`createTheme(createBinomTheme(mode))` + `@binom/ui/tokens.css` + `fonts.css`); dark theme (`data-theme` on `<html>` or system); how to change tokens (edit `tokens/tokens.json`, `npm run build`, owner approves, Opus review); Figma (import `tokens/tokens.json` with Tokens Studio); versioning (tag `vX.Y.Z`). CHANGELOG `0.1.0`.

- [ ] commit `docs: README and changelog`.

### Task 4 (controller): review, publish, first consumers

- [ ] Opus whole-repo review; apply fixes.
- [ ] When write access exists: push, PR, merge, tag `v0.1.0`.
- [ ] When the repo is public: Ideas PR replacing `app/web/src/binom-ui/` with the package (same screenshots before/after); Chat PR; Meet/Calendar/Synergy PRs or patches.
