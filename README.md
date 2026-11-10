# @binom/ui

The Binom design system for every Binom app (Chat, Ideas, Meet, Calendar, Synergy): the DM Sans font, design tokens (colours, shadows, corners, sizes, motion) with light and dark themes, and base rules for buttons, fields, focus, scrollbars and touch. Components and the common Binom header come in later versions.

Owner: Kirill Stolyarov (design). Values come from chat.binom.com (`binom-com/chat` `0aec780`).

## Install

```json
"@binom/ui": "github:binom-com/ui#v0.1.0"
```

Installed straight from GitHub by tag; no registry. A new version is a new tag: change `v0.1.0` to the new one.

## Use

**Plain CSS (Chat, Ideas).** Import first, before the app's own CSS:

```js
import '@binom/ui/theme.css'; // fonts + tokens + base rules
```

**Tailwind 4 (Calendar, Synergy).** In the main stylesheet:

```css
@import 'tailwindcss';
@import '@binom/ui/tailwind.css';
@import '@binom/ui/base.css'; /* optional: Binom's look for bare buttons and fields */
```

Classes take Binom values: `bg-page`, `bg-bg`, `text-text`, `text-muted`, `border-border`, `bg-accent text-on-accent`, `rounded-xl`, `shadow-dialog`, `font-sans`, `ease-out`. Tailwind's own palette stays available. In Next.js, import the stylesheet in the root layout.

**Material UI 5 (Meet).**

```js
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { createBinomTheme } from '@binom/ui/mui';
import '@binom/ui/fonts.css';
import '@binom/ui/tokens.css';

const theme = createTheme(createBinomTheme(mode)); // mode: 'light' | 'dark'
```

## Dark theme

Follows the system by default. An app setting forces a theme with `data-theme="light"` or `data-theme="dark"` on `<html>`.

## Tokens

The single source is `tokens/tokens.json` (W3C Design Tokens; sets `core`, `light`, `dark`, `pointer-fine`, `reduced-motion`). A token's key is its CSS custom property without `--` (`color-page` → `--color-page`).

- **Change a value:** edit `tokens/tokens.json`, run `npm run build`, commit `dist/` with it. Never edit `dist/` by hand (a test checks it).
- **Figma:** import `tokens/tokens.json` with the Tokens Studio plugin; `light` and `dark` become modes.
- **Your app's own tokens** (for example Ideas' type colours) live in the app, on top of these. Do not redefine Binom tokens in an app.

## Changes

The owner approves any change to the look. Every change gets an Opus review before merging. Versions are tags `vX.Y.Z` with a `CHANGELOG.md` entry.

```bash
npm install   # dev tools for the tests only
npm test
```

## Licence

Code: MIT. Font: DM Sans, SIL Open Font License (`fonts/DM-Sans-OFL.txt`).
