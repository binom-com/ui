# Changelog

## 0.1.1 — 2026-11-10

- Hover tints (plain button, primary, primary link) apply only with a mouse (`@media (hover: hover)`); the touch hover reset is gone, so it no longer overrides an app's own button colours on touch.
- README: install the tag's HTTPS archive (`…/archive/refs/tags/vX.Y.Z.tar.gz`), not `github:` (git+ssh fails in slim build images).

## 0.1.0 — 2026-11-10

First version: the foundation.

- DM Sans Variable, self-hosted.
- Tokens from chat.binom.com: colours, shadows, corners, sizes, motion; light and dark themes (system or `data-theme`); compact sizes for a mouse; reduced motion.
- Base rules: buttons (primary accent fill, secondary grey fill, text, danger red), fields and focus, sliders, scrollbars, touch targets, thin Lucide icons, touch press feedback without sticky hover.
- Outputs: `theme.css`, `tokens.css`, `fonts.css`, `base.css` (plain CSS), `tailwind.css` (Tailwind 4), `mui` (Material UI 5), `tokens.json` (Figma via Tokens Studio).
