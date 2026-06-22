# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development — watches CSS and rebuilds on save
npm run dev

# Production build — injects partials, minifies CSS, copies assets to dist/
npm run build

# CSS only (watch mode, writes to dist/output.css)
npm run dev:css

# CSS only (one-shot minified, writes to both output.css and dist/output.css)
npm run build:css
```

There are no tests. Open `dist/*.html` directly in a browser to verify changes (no dev server — the site runs on the file:// protocol).

## Architecture

**Static site with a thin file-copy build step.** There is no framework, bundler, or templating engine.

- **Source pages** (`index.html`, `about.html`, `catalog.html`, `calculator.html`, `contact.html`) are self-contained — the loader, nav, and footer are **inlined in every page** so each renders correctly when opened directly (no build step required to preview).
- **`build.js`** (plain Node, no dependencies) wipes `dist/`, generates `js/config.js` from `.env`, copies each page into `dist/`, copies `assets/`, `js/`, `data/`, and copies `robots.txt` + `sitemap.xml`.
- **`dist/`** is the deployment artifact and is gitignored. Never edit files in `dist/` directly.

**Client config — `.env` → `js/config.js`.** `build.js` reads `.env` (gitignored) and generates `js/config.js` defining `window.ENZO_CONFIG`. Currently holds `FORMSPREE_ID` (consumed by `js/contact.js`). The Formspree ID is public by design — `.env`/gitignore is config hygiene, not a security boundary. `.env.example` and `js/config.example.js` are the committed templates; `js/config.js` is generated and gitignored.

**CSS pipeline — Tailwind only, no PostCSS plugins.**
- Source: `css/input.css` — contains `@tailwind` directives plus all custom component classes (`@layer components { … }`).
- Output: `dist/output.css` (dev watch) or both `output.css` + `dist/output.css` (prod build).
- All reusable UI classes are defined here: `.content-rail`, `.section-pad`, `.nav-link`, `.btn-primary`, `.btn-primary-inv`, `.enzo-input`, `.enzo-label`, `.stat-num`, `.swatch-dot`, `.fade-up`, `.card-img-wrap`, `.timeline-line`.
- Tailwind scans `./*.html` and `./js/*.js` for class usage.

**JavaScript — vanilla ES5 IIFEs, no modules, no build step.**
- `js/motion.js` — custom cursor (mix-blend-mode difference) + IntersectionObserver scroll fade-up. Respects `prefers-reduced-motion` and `pointer: fine`.
- `js/timeline.js` — fires a CSS `scaleX` draw animation once when the timeline section enters the viewport.
- `js/catalog.js` — dynamically renders product cards from the global `PRODUCTS` array; manages category filter tabs and touch-device lifestyle-image toggle.
- `js/calculator.js` — fabric cost calculator using an exact formula (reed/width/warp/weft/picks/rates). Generates a WhatsApp deep-link to `+923218230266` with the calculated result pre-filled.
- `js/contact.js` — quote form handler. Prefills the Quality/Article field from `?quality=&article=` deep-links, validates name+email, then submits to Formspree (`ENZO_CONFIG.formspreeId`) or falls back to a prefilled WhatsApp deep-link when no ID is set.

**Data layer.**
- `data/products.js` — declares a global `const PRODUCTS = [...]` array (plain JS, not JSON, to work on `file://` without CORS). Each entry has `id`, `name`, `article`, `category`, `colors[]`, `colorHex[]`, `imgProduct`, `imgLifestyle`, `comingSoon`.
- Product images live at `assets/products/<article>.webp` and `assets/lifestyle/<article>.webp`.

**Design tokens — defined in two places that must stay in sync:**
- `tailwind.config.js` → `theme.extend.colors` (for Tailwind utility classes)
- `css/input.css` → `:root` CSS custom properties (for component-layer and inline styles)

The color palette is: `dark-navy #0E1825`, `arctic-navy #1E2A39`, `steel-blue #5C7386`, `glacier-blue #9DB4C6`, `silver-mist #D6DEE6`, `ice-white #F5F8FA`.

Fonts loaded via Google Fonts (CDN, in each HTML `<head>`): **Bebas Neue** (headings), **Inter** (body), **JetBrains Mono** (monospaced UI / calculator).

## Key conventions

- **Nav, footer, and the page loader are inlined identically in all 5 pages** — when changing any of them, apply the same edit to every page (they are intentionally duplicated so pages render standalone). Never edit the copies inside `dist/`.
- **To add a product**, append an entry to `data/products.js` and place `.webp` images at the matching paths.
- **`btn-primary-inv`** is currently identical to `btn-primary`; it exists as a named hook for future light-section inversion — keep them separate in the CSS.
- The calculator formula (§4.3 in the original brief) includes a hidden 16% markup baked into `costMetre`. Do not expose or log intermediate cost values.
- Color swatches on catalog cards must always be visible (not hover-only) — accessibility requirement.
- **Copy states "3 product lines" (Nova Silk, Wostar Wool, Bluebird)** — keep all count references aligned to `data/products.js` (Bluebird ships as two seasonal entries = 4 catalog cards). Do not reintroduce "15"/"18+" claims unless the data grows to match.
- **Catalog product images are not yet committed** — `assets/products/*.webp` and `assets/lifestyle/*.webp` are referenced by `data/products.js` but the directories are empty, so cards render broken images until the `.webp` files are added.
