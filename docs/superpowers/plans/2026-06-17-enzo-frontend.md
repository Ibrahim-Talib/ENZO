# ENZO Frontend Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement task-by-task.

**Goal:** Build the complete ENZO B2B wholesale fabric website — 5 pages, vanilla HTML/CSS/JS, Tailwind CSS via npm CLI.

**Architecture:** A ~20-line build.js script injects nav/footer partials into each page and writes to /dist. Tailwind CLI compiles css/input.css. Data lives in a plain JS array (not JSON) to avoid file:// CORS issues. Four JS modules handle motion, timeline, catalog filtering, and the calculator.

**Tech Stack:** Vanilla HTML5, Tailwind CSS 3 (npm), vanilla JS (ES6 modules), Node.js for build only.

**Calculator markup decision:** Option A confirmed — 10% and 16% factors stay hidden in the formula, no UI label.

---

## File Map

| File | Responsibility |
|---|---|
| `package.json` | npm scripts: build, dev, css watch |
| `tailwind.config.js` | Palette extension, font families, content paths |
| `build.js` | Inject nav/footer partials, write to /dist |
| `css/input.css` | @tailwind directives, Google Fonts import, CSS custom properties, component layer |
| `partials/nav.html` | Glassmorphic floating navbar, hamburger toggle |
| `partials/footer.html` | Dark Navy footer with logo, links, contact |
| `data/products.js` | Plain JS array, 15 SKUs |
| `assets/logo/enzo-mark-light.svg` | Placeholder mark for dark sections |
| `assets/logo/enzo-mark-dark.svg` | Placeholder mark for light sections |
| `assets/logo/enzo-mark-simplified.svg` | Reduced-detail mark for small sizes |
| `assets/logo/favicon.svg` | Filled-backing favicon |
| `js/motion.js` | Custom cursor + nav hover, loads on every page |
| `js/timeline.js` | IntersectionObserver timeline line, about.html only |
| `js/catalog.js` | Filter tabs + ambient image hover swap, catalog.html only |
| `js/calculator.js` | Live recalculation + WhatsApp CTA, calculator.html only |
| `index.html` | Home: hero, stats bar, catalog teaser, calculator teaser, certs, about snippet |
| `about.html` | Timeline, values, certifications, manufacturer-direct positioning |
| `catalog.html` | Filterable grid, 15 SKU cards, no prices |
| `calculator.html` | Two-column estimator, sticky output panel |
| `contact.html` | Inquiry form, WhatsApp + email, address |

---

## Task 1: Project Scaffold

**Files:** Create `package.json`, `tailwind.config.js`

- [ ] Create `package.json`:
```json
{
  "name": "enzo-site",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build:css": "tailwindcss -i ./css/input.css -o ./dist/output.css --minify",
    "build": "node build.js && npm run build:css",
    "dev:css": "tailwindcss -i ./css/input.css -o ./dist/output.css --watch",
    "dev": "node build.js && npm run dev:css"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.0"
  }
}
```

- [ ] Run: `npm install`

- [ ] Create `tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './partials/*.html'],
  theme: {
    extend: {
      colors: {
        'dark-navy':    '#0E1825',
        'arctic-navy':  '#1E2A39',
        'steel-blue':   '#5C7386',
        'glacier-blue': '#9DB4C6',
        'silver-mist':  '#D6DEE6',
        'ice-white':    '#F5F8FA',
      },
      fontFamily: {
        bebas: ['Bebas Neue', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
      maxWidth: {
        '6xl': '72rem',
      },
      fontSize: {
        'display': ['3rem', { lineHeight: '1', letterSpacing: '0.02em' }],
        'h2':      ['2rem', { lineHeight: '1.1' }],
        'h3':      ['1.375rem', { lineHeight: '1.2' }],
        'body':    ['0.9375rem', { lineHeight: '1.6' }],
        'label':   ['0.75rem', { lineHeight: '1', letterSpacing: '0.1em' }],
        'data':    ['1rem', { lineHeight: '1.4' }],
      },
    },
  },
  plugins: [],
}
```

- [ ] Verify: `npx tailwindcss --version` prints 3.x

---

## Task 2: CSS Input File

**Files:** Create `css/input.css`, create `dist/` directory placeholder

- [ ] Create `css/input.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --dark-navy:    #0E1825;
  --arctic-navy:  #1E2A39;
  --steel-blue:   #5C7386;
  --glacier-blue: #9DB4C6;
  --silver-mist:  #D6DEE6;
  --ice-white:    #F5F8FA;
}

@layer base {
  *, *::before, *::after { box-sizing: border-box; }

  html { scroll-behavior: smooth; }

  body {
    background-color: var(--dark-navy);
    color: var(--ice-white);
    font-family: 'Inter', sans-serif;
    font-size: 0.9375rem;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3 { font-family: 'Bebas Neue', sans-serif; }

  /* Context-aware focus rings — WCAG 2.1 AA (gap caught in design session) */
  :focus-visible {
    outline: 2px solid #9DB4C6;
    outline-offset: 3px;
  }
  .light-section :focus-visible {
    outline-color: #0E1825;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
}

@layer components {
  /* ── Layout ── */
  .content-rail {
    max-width: 72rem;
    margin-left: auto;
    margin-right: auto;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  .section-pad {
    padding-top: 80px;
    padding-bottom: 80px;
  }
  @media (max-width: 640px) {
    .section-pad { padding-top: 48px; padding-bottom: 48px; }
  }

  /* ── Nav link with animated underline ── */
  .nav-link {
    position: relative;
    font-family: 'Inter', sans-serif;
    font-size: 0.875rem;
    color: var(--silver-mist);
    text-decoration: none;
    transition: color 0.25s ease;
    padding-bottom: 2px;
  }
  .nav-link::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 1px;
    background: var(--glacier-blue);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.25s ease-out;
  }
  .nav-link:hover,
  .nav-link[aria-current="page"] { color: var(--ice-white); }
  .nav-link:hover::after,
  .nav-link[aria-current="page"]::after { transform: scaleX(1); }

  /* ── Primary CTA — Dark Navy ↔ Ice White ONLY, never reused for plain text ── */
  .btn-primary {
    display: inline-block;
    background-color: var(--dark-navy);
    color: var(--ice-white);
    font-family: 'Inter', sans-serif;
    font-size: 0.8125rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
    padding: 0.625rem 1.5rem;
    border: 1px solid var(--steel-blue);
    border-radius: 4px;
    transition: background-color 0.2s ease;
    cursor: pointer;
  }
  .btn-primary:hover { background-color: var(--arctic-navy); }

  /* On light sections — Ice White bg / Dark Navy text */
  .btn-primary-inv {
    display: inline-block;
    background-color: var(--ice-white);
    color: var(--dark-navy);
    font-family: 'Inter', sans-serif;
    font-size: 0.8125rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
    padding: 0.625rem 1.5rem;
    border: 1px solid var(--dark-navy);
    border-radius: 4px;
    transition: background-color 0.2s ease;
    cursor: pointer;
  }
  .btn-primary-inv:hover { background-color: var(--silver-mist); }

  /* ── Custom cursor ── */
  #enzo-cursor {
    position: fixed;
    width: 20px; height: 20px;
    border-radius: 50%;
    background: #fff;
    mix-blend-mode: difference;
    pointer-events: none;
    opacity: 0;
    z-index: 9999;
    top: 0; left: 0;
    will-change: transform;
  }

  /* ── Stat figure (JetBrains Mono) ── */
  .stat-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 2rem;
    font-weight: 500;
    color: var(--ice-white);
  }

  /* ── Data / spec text ── */
  .data-text {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1rem;
  }

  /* ── Catalog card image crossfade layers ── */
  .card-img-wrap { position: relative; overflow: hidden; aspect-ratio: 4/3; }
  .card-img-fabric,
  .card-img-lifestyle {
    position: absolute;
    inset: 0; width: 100%; height: 100%;
    object-fit: cover;
    transition: opacity 0.35s ease-out;
  }
  .card-img-lifestyle { opacity: 0; }
  @media (hover: hover) {
    .catalog-card:hover .card-img-fabric { opacity: 0; }
    .catalog-card:hover .card-img-lifestyle { opacity: 1; }
  }

  /* ── Timeline line draw ── */
  .timeline-line {
    height: 2px;
    background: var(--glacier-blue);
    transform-origin: left;
    transform: scaleX(0);
    transition: transform 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .timeline-line.drawn { transform: scaleX(1); }

  /* ── Section fade-in on scroll ── */
  .fade-up {
    opacity: 0;
    transform: translateY(16px);
    transition: opacity 0.4s ease, transform 0.4s ease;
  }
  .fade-up.visible {
    opacity: 1;
    transform: translateY(0);
  }
}
```

- [ ] Create empty `dist/.gitkeep` so the directory exists for the build script.

---

## Task 3: build.js

**Files:** Create `build.js`

- [ ] Create `build.js`:
```js
const fs = require('fs');

const nav    = fs.readFileSync('partials/nav.html', 'utf8');
const footer = fs.readFileSync('partials/footer.html', 'utf8');
const pages  = ['index', 'about', 'catalog', 'calculator', 'contact'];

if (!fs.existsSync('dist')) fs.mkdirSync('dist');

for (const page of pages) {
  let html = fs.readFileSync(`${page}.html`, 'utf8');
  html = html.replace('<!--NAV-->', nav).replace('<!--FOOTER-->', footer);
  fs.writeFileSync(`dist/${page}.html`, html);
  console.log(`built → dist/${page}.html`);
}
```

- [ ] Verify: `node build.js` (will fail until page files exist — that's expected).

---

## Task 4: Partials — Nav

**Files:** Create `partials/nav.html`

- [ ] Create `partials/nav.html`:
```html
<div id="enzo-cursor" aria-hidden="true"></div>
<nav id="navbar" class="fixed top-4 inset-x-0 z-50 flex justify-center px-4" aria-label="Primary navigation">
  <div class="w-full max-w-6xl flex items-center justify-between px-6 py-3 rounded-xl"
       style="background:rgba(14,24,37,0.78);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(92,115,134,0.28);">

    <!-- Logo -->
    <a href="/index.html" class="flex items-center gap-3 shrink-0" aria-label="ENZO — home">
      <img src="/assets/logo/enzo-mark-light.svg" alt="" width="32" height="32" aria-hidden="true">
      <span style="font-family:'Bebas Neue',sans-serif;font-size:1.375rem;color:#F5F8FA;letter-spacing:0.12em;">ENZO</span>
    </a>

    <!-- Desktop links -->
    <ul class="hidden md:flex items-center gap-8 list-none m-0 p-0" role="list">
      <li><a href="/index.html"       class="nav-link">Home</a></li>
      <li><a href="/about.html"       class="nav-link">About</a></li>
      <li><a href="/catalog.html"     class="nav-link">Catalog</a></li>
      <li><a href="/calculator.html"  class="nav-link">Calculator</a></li>
      <li><a href="/contact.html"     class="nav-link">Contact</a></li>
    </ul>

    <!-- Desktop CTA -->
    <a href="/contact.html" class="btn-primary hidden md:inline-block">Request Quote</a>

    <!-- Hamburger -->
    <button id="nav-toggle" class="md:hidden p-2 flex flex-col gap-1.5"
            aria-label="Open navigation menu" aria-expanded="false" aria-controls="mobile-nav">
      <span class="w-6 h-px bg-ice-white block transition-all duration-200" id="hb1"></span>
      <span class="w-6 h-px bg-ice-white block transition-all duration-200" id="hb2"></span>
      <span class="w-6 h-px bg-ice-white block transition-all duration-200" id="hb3"></span>
    </button>
  </div>

  <!-- Mobile menu -->
  <div id="mobile-nav" hidden
       class="absolute top-full inset-x-4 mt-2 rounded-xl px-6 pt-4 pb-6 flex flex-col gap-4"
       style="background:rgba(14,24,37,0.96);backdrop-filter:blur(14px);border:1px solid rgba(92,115,134,0.28);">
    <a href="/index.html"      class="nav-link text-base">Home</a>
    <a href="/about.html"      class="nav-link text-base">About</a>
    <a href="/catalog.html"    class="nav-link text-base">Catalog</a>
    <a href="/calculator.html" class="nav-link text-base">Calculator</a>
    <a href="/contact.html"    class="nav-link text-base">Contact</a>
    <a href="/contact.html"    class="btn-primary text-center mt-2">Request Quote</a>
  </div>
</nav>

<script>
(function(){
  const toggle = document.getElementById('nav-toggle');
  const menu   = document.getElementById('mobile-nav');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', function() {
    const open = !menu.hidden;
    menu.hidden = open;
    toggle.setAttribute('aria-expanded', String(!open));
  });
  // Mark active link
  const links = document.querySelectorAll('#navbar .nav-link');
  const path  = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(l => {
    if (l.getAttribute('href').endsWith(path)) l.setAttribute('aria-current', 'page');
  });
})();
</script>
```

---

## Task 5: Partials — Footer

**Files:** Create `partials/footer.html`

- [ ] Create `partials/footer.html`:
```html
<footer style="background-color:#0E1825;border-top:1px solid rgba(92,115,134,0.25);">
  <div class="content-rail section-pad">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">

      <!-- Brand column -->
      <div>
        <img src="/assets/logo/enzo-mark-light.svg" alt="ENZO" width="44" height="44" class="mb-4">
        <p style="font-family:'Bebas Neue',sans-serif;font-size:1.375rem;letter-spacing:0.12em;color:#F5F8FA;" class="mb-1">ENZO</p>
        <p style="font-size:0.8125rem;color:#5C7386;line-height:1.6;">Humayun Ibrahim Textile<br>B2B Wholesale Fabric — Lahore</p>
        <p style="font-size:0.75rem;color:#5C7386;margin-top:1rem;">MOQ 10,000 m &mdash; Quote within 1 business day</p>
      </div>

      <!-- Quick links -->
      <div>
        <p style="font-family:'Inter',sans-serif;font-size:0.6875rem;letter-spacing:0.12em;text-transform:uppercase;color:#5C7386;" class="mb-4">Pages</p>
        <nav aria-label="Footer navigation">
          <ul class="list-none m-0 p-0 flex flex-col gap-2">
            <li><a href="/index.html"      class="nav-link">Home</a></li>
            <li><a href="/about.html"      class="nav-link">About</a></li>
            <li><a href="/catalog.html"    class="nav-link">Catalog</a></li>
            <li><a href="/calculator.html" class="nav-link">Calculator</a></li>
            <li><a href="/contact.html"    class="nav-link">Contact</a></li>
          </ul>
        </nav>
      </div>

      <!-- Contact -->
      <div>
        <p style="font-family:'Inter',sans-serif;font-size:0.6875rem;letter-spacing:0.12em;text-transform:uppercase;color:#5C7386;" class="mb-4">Contact</p>
        <address class="not-italic flex flex-col gap-2" style="font-size:0.875rem;color:#D6DEE6;">
          <a href="mailto:info@enzolhr.com"          style="color:#D6DEE6;" class="nav-link">info@enzolhr.com</a>
          <a href="https://wa.me/923218230266"       style="color:#D6DEE6;" class="nav-link" target="_blank" rel="noopener noreferrer">+92 321 8230266</a>
          <span style="color:#5C7386;">ENZO Tower, Thokar Niaz Baig<br>Lahore, Pakistan</span>
        </address>
        <p style="font-size:0.75rem;color:#5C7386;margin-top:1.25rem;line-height:1.5;">Certifications (OEKO-TEX, BCI, Control Union) held at yarn-supplier level. Documentation available on request.</p>
      </div>
    </div>

    <div style="border-top:1px solid rgba(92,115,134,0.18);margin-top:3rem;padding-top:1.5rem;" class="flex flex-col md:flex-row justify-between items-center gap-3">
      <p style="font-size:0.75rem;color:#5C7386;">&copy; 2024 ENZO &mdash; Humayun Ibrahim Textile. All rights reserved.</p>
      <p style="font-size:0.75rem;color:#5C7386;">Faisalabad production &bull; Serving Lahore, Karachi, Peshawar</p>
    </div>
  </div>
</footer>
```

---

## Task 6: Data Layer

**Files:** Create `data/products.js`

- [ ] Create `data/products.js`:
```js
// Plain JS array — not JSON — avoids CORS on file:// protocol
const PRODUCTS = [
  {
    id: 'shabier-gold',
    name: 'Shabier Gold',
    article: '187',
    category: 'wash',
    colors: ['Warm Tan', 'Deep Mocha', 'Rich Umber', 'Pale Wheat'],
    colorHex: ['#C8A882', '#5A3E2B', '#7B4F2E', '#E8D5B0'],
    imgProduct:   'assets/products/187.webp',
    imgLifestyle: 'assets/lifestyle/187.webp',
    comingSoon: false,
  },
  {
    id: 'super-diamond',
    name: 'Super Diamond',
    article: '202',
    category: 'wash',
    colors: ['Slate Blue', 'Deep Navy', 'Steel Grey', 'Ice Blue'],
    colorHex: ['#6B7FA3', '#1A2B45', '#6E7E8A', '#B8D0E0'],
    imgProduct:   'assets/products/202.webp',
    imgLifestyle: 'assets/lifestyle/202.webp',
    comingSoon: false,
  },
  {
    id: 'pearl-suiting',
    name: 'Pearl Suiting',
    article: '214',
    category: 'wash',
    colors: ['Charcoal', 'Ash Grey', 'Silver', 'Ivory Pearl'],
    colorHex: ['#3A3A3A', '#8A8A8A', '#C0C0C0', '#F5F0E8'],
    imgProduct:   'assets/products/214.webp',
    imgLifestyle: 'assets/lifestyle/214.webp',
    comingSoon: false,
  },
  {
    id: 'swiss-gold',
    name: 'Swiss Gold',
    article: '218',
    category: 'wash',
    colors: ['Antique Gold', 'Bronze', 'Sand', 'Champagne'],
    colorHex: ['#B8960C', '#8C6B2F', '#C4A882', '#F7E7C1'],
    imgProduct:   'assets/products/218.webp',
    imgLifestyle: 'assets/lifestyle/218.webp',
    comingSoon: false,
  },
  {
    id: 'haroon-soft',
    name: 'Haroon Soft',
    article: '229',
    category: 'wash',
    colors: ['Forest', 'Olive', 'Sage', 'Mist'],
    colorHex: ['#2D4A2D', '#6B7C3A', '#9AAF88', '#C8D5C0'],
    imgProduct:   'assets/products/229.webp',
    imgLifestyle: 'assets/lifestyle/229.webp',
    comingSoon: false,
  },
  {
    id: '8888',
    name: '8888',
    article: '122',
    category: 'wash',
    colors: ['Burgundy', 'Wine', 'Rose', 'Blush'],
    colorHex: ['#800020', '#5C0A1A', '#C07080', '#E8B0BC'],
    imgProduct:   'assets/products/122.webp',
    imgLifestyle: 'assets/lifestyle/122.webp',
    comingSoon: false,
  },
  {
    id: 'fenci-black',
    name: 'Fenci Black',
    article: '213',
    category: 'wash',
    colors: ['Jet Black', 'Onyx', 'Graphite'],
    colorHex: ['#0A0A0A', '#1A1A1A', '#4A4A4A'],
    imgProduct:   'assets/products/213.webp',
    imgLifestyle: 'assets/lifestyle/213.webp',
    comingSoon: false,
  },
  {
    id: 'special-black',
    name: 'Special Black',
    article: '227',
    category: 'wash',
    colors: ['Pure Black', 'Deep Black', 'Matte Black'],
    colorHex: ['#000000', '#0D0D0D', '#1A1A1A'],
    imgProduct:   'assets/products/227.webp',
    imgLifestyle: 'assets/lifestyle/227.webp',
    comingSoon: false,
  },
  {
    id: 'black-sher',
    name: 'Black Sher',
    article: '259',
    category: 'wash',
    colors: ['Black', 'Dark Grey', 'Charcoal'],
    colorHex: ['#000000', '#2A2A2A', '#3D3D3D'],
    imgProduct:   'assets/products/259.webp',
    imgLifestyle: 'assets/lifestyle/259.webp',
    comingSoon: false,
  },
  {
    id: 'four-season',
    name: 'Four Season',
    article: '240',
    category: 'wash',
    colors: ['Stone', 'Taupe', 'Linen', 'Off White'],
    colorHex: ['#8A8070', '#B8A898', '#D8CCBC', '#F2EEE5'],
    imgProduct:   'assets/products/240.webp',
    imgLifestyle: 'assets/lifestyle/240.webp',
    comingSoon: false,
  },
  {
    id: 'classic-dress',
    name: 'Classic Dress',
    article: '204',
    category: 'wash',
    colors: ['Navy', 'Royal Blue', 'Sky', 'Powder'],
    colorHex: ['#1A2B45', '#2C4EA0', '#6EB0D8', '#B8D8EE'],
    imgProduct:   'assets/products/204.webp',
    imgLifestyle: 'assets/lifestyle/204.webp',
    comingSoon: false,
  },
  {
    id: 'pure-cotton',
    name: 'Pure Cotton',
    article: 'Internal',
    category: 'cotton',
    colors: ['White', 'Light Blue'],
    colorHex: ['#F8F8F8', '#B8D0E0'],
    imgProduct:   'assets/products/pure-cotton.webp',
    imgLifestyle: 'assets/lifestyle/pure-cotton.webp',
    comingSoon: false,
  },
  {
    id: 'pure-boski',
    name: 'Pure Boski',
    article: 'B-01',
    category: 'boski',
    colors: ['Cream', 'Ivory', 'Sand'],
    colorHex: ['#F5F0DC', '#FFFFF0', '#C8B882'],
    imgProduct:   'assets/products/boski-b01.webp',
    imgLifestyle: 'assets/lifestyle/boski-b01.webp',
    comingSoon: false,
  },
  {
    id: 'blended-boski',
    name: 'Blended Boski',
    article: 'B-02',
    category: 'boski',
    colors: ['Light Grey', 'Stone', 'Charcoal'],
    colorHex: ['#C0C0C0', '#8A8078', '#3D3D3D'],
    imgProduct:   'assets/products/boski-b02.webp',
    imgLifestyle: 'assets/lifestyle/boski-b02.webp',
    comingSoon: false,
  },
  {
    id: 'winter-range',
    name: 'Winter Range',
    article: 'Coming Soon',
    category: 'winter',
    colors: ['Wool', 'Pashmina', 'Tweed', 'Velvet'],
    colorHex: ['#C8B898', '#E8D8C8', '#6A5A4A', '#2A1A2A'],
    imgProduct:   'assets/products/winter-range.webp',
    imgLifestyle: 'assets/lifestyle/winter-range.webp',
    comingSoon: true,
  },
];
```

---

## Task 7: Placeholder Logo SVGs

**Files:** Create `assets/logo/` directory and 4 placeholder SVGs

- [ ] Create `assets/logo/enzo-mark-light.svg` (placeholder diamond badge, white on transparent):
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <polygon points="32,4 60,20 60,44 32,60 4,44 4,20" fill="none" stroke="#F5F8FA" stroke-width="2"/>
  <polygon points="32,14 50,24 50,40 32,50 14,40 14,24" fill="none" stroke="#9DB4C6" stroke-width="1"/>
  <text x="32" y="36" font-family="'Bebas Neue',sans-serif" font-size="14" fill="#F5F8FA" text-anchor="middle" letter-spacing="2">E</text>
</svg>
```

- [ ] Create `assets/logo/enzo-mark-dark.svg` (inverted — dark on transparent):
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <polygon points="32,4 60,20 60,44 32,60 4,44 4,20" fill="none" stroke="#0E1825" stroke-width="2"/>
  <polygon points="32,14 50,24 50,40 32,50 14,40 14,24" fill="none" stroke="#5C7386" stroke-width="1"/>
  <text x="32" y="36" font-family="'Bebas Neue',sans-serif" font-size="14" fill="#0E1825" text-anchor="middle" letter-spacing="2">E</text>
</svg>
```

- [ ] Create `assets/logo/enzo-mark-simplified.svg` (minimal, for ~28px use):
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <polygon points="16,2 30,10 30,22 16,30 2,22 2,10" fill="none" stroke="#F5F8FA" stroke-width="2"/>
  <text x="16" y="20" font-family="sans-serif" font-size="10" font-weight="bold" fill="#F5F8FA" text-anchor="middle">E</text>
</svg>
```

- [ ] Create `assets/logo/favicon.svg` (filled backing for browser tab):
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" fill="#0E1825"/>
  <polygon points="16,3 29,10 29,22 16,29 3,22 3,10" fill="none" stroke="#9DB4C6" stroke-width="1.5"/>
  <text x="16" y="20" font-family="sans-serif" font-size="9" font-weight="bold" fill="#F5F8FA" text-anchor="middle">E</text>
</svg>
```

- [ ] Create `assets/products/` and `assets/lifestyle/` directories with a `.gitkeep` each (real images are named by article number and will be swapped in later).

---

## Task 8: js/motion.js

**Files:** Create `js/motion.js`

- [ ] Create `js/motion.js`:
```js
(function () {
  const fine    = matchMedia('(pointer: fine)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cursor  = document.getElementById('enzo-cursor');

  // ── Custom cursor (pointer:fine + no reduced-motion only) ──
  if (cursor && fine && !reduced) {
    cursor.style.opacity = '1';
    let cx = 0, cy = 0, tx = 0, ty = 0;

    document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });

    // Revert to native cursor over form inputs and the calculator panel
    const nativeZones = 'input, select, textarea, button, [data-no-cursor]';
    document.addEventListener('mouseover', e => {
      cursor.style.opacity = e.target.closest(nativeZones) ? '0' : '1';
    });

    function loop() {
      cx += (tx - cx) * 0.15;
      cy += (ty - cy) * 0.15;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  // ── Fade-up on scroll (IntersectionObserver) ──
  if (!reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.fade-up').forEach(el => io.observe(el));
  } else {
    // Immediately show all fade-up elements when motion is reduced
    document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
  }
})();
```

---

## Task 9: js/timeline.js

**Files:** Create `js/timeline.js`

- [ ] Create `js/timeline.js`:
```js
(function () {
  const line    = document.getElementById('timeline-line');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!line) return;

  if (reduced) {
    line.classList.add('drawn');
    return;
  }

  // Trigger once when the timeline section enters the viewport
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        line.classList.add('drawn');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  io.observe(line.closest('[data-timeline]') || line);
})();
```

---

## Task 10: js/catalog.js

**Files:** Create `js/catalog.js`

- [ ] Create `js/catalog.js`:
```js
(function () {
  // ── Filter tabs ──
  const tabs  = document.querySelectorAll('[data-filter]');
  const cards = document.querySelectorAll('[data-category]');

  function applyFilter(cat) {
    cards.forEach(card => {
      const match = cat === 'all' || card.dataset.category === cat;
      card.style.display = match ? '' : 'none';
    });
    tabs.forEach(t => {
      const active = t.dataset.filter === cat;
      t.setAttribute('aria-pressed', String(active));
      t.style.borderColor     = active ? 'var(--glacier-blue)' : 'var(--steel-blue)';
      t.style.color           = active ? 'var(--ice-white)'    : 'var(--silver-mist)';
      t.style.backgroundColor = active ? 'var(--arctic-navy)'  : 'transparent';
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => applyFilter(tab.dataset.filter));
  });

  applyFilter('all');

  // ── Touch fallback: tap-to-reveal lifestyle image ──
  const touch = matchMedia('(hover: none)').matches;
  if (touch) {
    document.querySelectorAll('.catalog-card').forEach(card => {
      const lifestyle = card.querySelector('.card-img-lifestyle');
      const fabric    = card.querySelector('.card-img-fabric');
      if (!lifestyle || !fabric) return;
      let revealed = false;
      card.addEventListener('click', e => {
        if (e.target.closest('a, button')) return;
        revealed = !revealed;
        lifestyle.style.opacity = revealed ? '1' : '0';
        fabric.style.opacity    = revealed ? '0' : '1';
      });
    });
  }
})();
```

---

## Task 11: js/calculator.js

**Files:** Create `js/calculator.js`

Calculator markup decision: Option A — 10% and 16% factors remain in the formula, not labeled in the UI.

- [ ] Write test cases before implementation (open browser console and verify):

| Inputs (defaults) | Expected costMetre | Expected costYard |
|---|---|---|
| Reed=72, Width=54, Warp=40, Weft=40, WarpRate=720, WeftRate=720, Picks=56, Machine=0.85, Kinara=2.70, FX=1, Bag=45, Brokerage=off | ≈ 104.74 | ≈ 95.78 |

Manual trace of defaults:
```
totalEnds         = (72+4)*54          = 4104
warpWeightLbs     = 4104/731/39        = 0.14415...
warpCost          = 0.14415*720        = 103.79
weftWeightLbs     = (56*54)/731/40     = 0.10356...
weftCost          = 0.10356*720        = 74.56
conversionCost    = 0.85*56            = 47.60
baseCost          = 103.79+74.56+47.60+2.70 = 228.65
brokerage         = 0
costBeforeHidden  = (228.65*1.10)*1    = 251.52
costMetre         = 251.52*1.16        = 291.76
costYard          = 291.76*0.9144      = 266.82
weightPerMetre    = (0.14415+0.10356)*0.453592 = 0.11239 kg
bags              = ceil(0.11239*10000/45) = ceil(24.98) = 25
```

- [ ] Create `js/calculator.js`:
```js
(function () {
  const PHONE = '923218230266';

  const get = id => document.getElementById(id);

  function readNum(id, fallback) {
    const v = parseFloat(get(id)?.value);
    return isNaN(v) ? fallback : v;
  }

  function calculate() {
    const reed     = Math.max(1, readNum('inp-reed',      72));
    const width    = Math.max(1, readNum('inp-width',     54));
    const warp     = Math.max(1, readNum('inp-warp',      40));
    const weft     = Math.max(1, readNum('inp-weft',      40));
    const warpRate = Math.max(1, readNum('inp-warp-rate', 720));
    const weftRate = Math.max(1, readNum('inp-weft-rate', 720));
    const picks    = Math.max(1, readNum('inp-picks',     56));
    const metres   = Math.max(10000, readNum('inp-metres', 10000));
    const fxRate   = readNum('inp-fx', 1) || 1;
    const bagWt    = readNum('inp-bag', 45) || 45;

    const machineRate  = parseFloat(get('inp-machine')?.value  || '0.85');
    const kinaraRate   = parseFloat(get('inp-kinara')?.value   || '2.70');
    const brokerageOn  = get('inp-brokerage')?.value === '1';

    // ── Formula (exact, per brief §4.3) ──
    const totalEnds        = (reed + 4) * width;
    const warpWeightLbs    = totalEnds / 731 / Math.max(warp - 1, 1);
    const warpCost         = warpWeightLbs * warpRate;
    const weftWeightLbs    = (picks * width) / 731 / Math.max(weft, 1);
    const weftCost         = weftWeightLbs * weftRate;
    const conversionCost   = machineRate * picks;
    const baseCost         = warpCost + weftCost + conversionCost + kinaraRate;
    const brokerage        = brokerageOn ? baseCost * 0.01 : 0;
    const costBeforeHidden = ((baseCost * 1.10) + brokerage) * fxRate;
    const costMetre        = costBeforeHidden * 1.16;
    const costYard         = costMetre * 0.9144;
    const weightPerMetre   = (warpWeightLbs + weftWeightLbs) * 0.453592;
    const bags             = Math.ceil((weightPerMetre * metres) / bagWt);

    // ── Update output panel ──
    setText('out-cost-metre',   `Rs ${costMetre.toFixed(2)}`);
    setText('out-cost-yard',    `Rs ${costYard.toFixed(2)}`);
    setText('out-weight-metre', `${weightPerMetre.toFixed(3)} kg`);
    setText('out-bags',         bags.toString());

    // ── Build WhatsApp deep link ──
    const msg = encodeURIComponent(
      `Hello ENZO, I calculated a fabric cost of Rs ${costMetre.toFixed(2)}/metre ` +
      `and Rs ${costYard.toFixed(2)}/yard for ${metres.toLocaleString()} metres. ` +
      `Please review and quote.`
    );
    const waBtn = get('btn-whatsapp');
    if (waBtn) waBtn.href = `https://wa.me/${PHONE}?text=${msg}`;
  }

  function setText(id, val) {
    const el = get(id);
    if (el) el.textContent = val;
  }

  // Listen to all calculator inputs
  document.querySelectorAll('[data-calc-input]').forEach(el => {
    el.addEventListener('input', calculate);
    el.addEventListener('change', calculate);
  });

  // Run on load with defaults
  calculate();
})();
```

---

## Task 12: index.html

**Files:** Create `index.html`

Sections (Navy → Light → Navy → Light per alternation rule):
1. Hero — Dark Navy, full-viewport, brand statement
2. Trust stats bar — Arctic Navy
3. Catalog teaser — Ice White (light-section)
4. Calculator teaser — Dark Navy
5. Certifications strip — Arctic Navy
6. About snippet — Ice White (light-section)

- [ ] Create `index.html` — see implementation below. Key structural requirements:
  - `<title>Home | ENZO — Wholesale Fabric Supplier, Lahore</title>`
  - JSON-LD LocalBusiness schema in `<head>`
  - `<!--NAV-->` and `<!--FOOTER-->` placeholders (replaced by build.js)
  - Hero H1 in Bebas Neue 48px+
  - Stats: MOQ (10,000m), Quote (1 Business Day), Qualities (18+), Founded (2014) — all figures in JetBrains Mono
  - Catalog teaser: 3-card preview grid, routes to /catalog.html
  - Calculator teaser: formula preview, routes to /calculator.html
  - Certs: OEKO-TEX, BCI, Control Union — phrase as "Yarn-supplier certified"
  - About snippet: 2-sentence manufacturer-direct positioning, routes to /about.html
  - No prices anywhere
  - `<script src="/js/motion.js">` before `</body>`

---

## Task 13: about.html

**Files:** Create `about.html`

- [ ] Create `about.html`. Key structural requirements:
  - `<title>About | ENZO — Wholesale Fabric Supplier, Lahore</title>`
  - Timeline section with `data-timeline` attribute and `id="timeline-line"` on the line element
  - Milestones: 2001 (Humayun Ibrahim Textile listed), 2014 (ENZO founded, Lahore), 2016 (Faisalabad production), 2019 (Karachi & Peshawar), 2024 (18+ qualities, online B2B)
  - Values section: Consistency, Reliability, Direct Trade, Traceability
  - Certifications section: OEKO-TEX, BCI, Control Union — phrase as yarn-supplier level, docs on request via info@enzolhr.com
  - Manufacturer-direct positioning paragraph
  - `<script src="/js/motion.js">` and `<script src="/js/timeline.js">` before `</body>`

---

## Task 14: catalog.html

**Files:** Create `catalog.html`

- [ ] Create `catalog.html`. Key structural requirements:
  - `<title>Catalog | ENZO — Wholesale Fabric Supplier, Lahore</title>`
  - Filter tabs: All / Wash n Wear / Cotton / Boski / Winter — `data-filter` attributes
  - Product grid renders from `PRODUCTS` array in `data/products.js`
  - Each card: `.catalog-card` with `data-category`, quality name (Bebas Neue), article number (JetBrains Mono), color swatches (12px dot + static label text), "Request Quote" CTA → /contact.html
  - Two image layers per card: `.card-img-fabric` and `.card-img-lifestyle` (lazy load lifestyle)
  - comingSoon items: card still renders but "Coming Soon" badge replaces CTA
  - No price anywhere
  - `<script src="/data/products.js">`, `<script src="/js/catalog.js">`, `<script src="/js/motion.js">` before `</body>`

---

## Task 15: calculator.html

**Files:** Create `calculator.html`

- [ ] Create `calculator.html`. Key structural requirements:
  - `<title>Calculator | ENZO — Wholesale Fabric Supplier, Lahore</title>`
  - Two-column layout: inputs left, sticky output panel right (stacks single-column below md)
  - Output panel has `data-no-cursor` attribute (cursor reverts to native over it)
  - All inputs have `data-calc-input` attribute, real `<label for>` elements, `id` matching calculator.js selectors
  - Input IDs: `inp-reed`, `inp-width`, `inp-warp`, `inp-weft`, `inp-warp-rate`, `inp-weft-rate`, `inp-picks`, `inp-metres`, `inp-machine` (select), `inp-kinara` (select), `inp-fx`, `inp-bag`, `inp-brokerage` (select)
  - Output IDs: `out-cost-metre`, `out-cost-yard`, `out-weight-metre`, `out-bags`
  - WhatsApp CTA: `id="btn-whatsapp"` `<a>` tag, href built dynamically by calculator.js
  - "Get a Quote" secondary CTA → /contact.html
  - All inputs use JetBrains Mono for values
  - `<script src="/js/calculator.js">` and `<script src="/js/motion.js">` before `</body>`

---

## Task 16: contact.html

**Files:** Create `contact.html`

- [ ] Create `contact.html`. Key structural requirements:
  - `<title>Contact | ENZO — Wholesale Fabric Supplier, Lahore</title>`
  - Inquiry form fields: Name, Company, Email, Phone, Quantity (metres, min 10,000), Quality/Article (text), Delivery location, Message
  - All inputs have real `<label for>` elements
  - Form `action` attribute left as `#` (no backend — static site)
  - WhatsApp channel: `<a href="https://wa.me/923218230266">` with display number +92 321 8230266
  - Email channel: `<a href="mailto:info@enzolhr.com">`
  - Address: ENZO Tower, Thokar Niaz Baig, Lahore, Pakistan
  - Quote turnaround promise: "1 business day" — use as trust signal
  - `<script src="/js/motion.js">` before `</body>`

---

## Task 17: Full Build & Verify

- [ ] Run `node build.js` — should print 5 "built →" lines, no errors
- [ ] Run `npm run build:css` — should write `dist/output.css`
- [ ] Open `dist/index.html` in browser via a local server (e.g. `npx serve dist`) — NOT `file://`
- [ ] Verify calculator with defaults: costMetre should be ≈ Rs 291.76
- [ ] Verify filter tabs on catalog page show/hide correct cards
- [ ] Verify hamburger nav opens/closes on mobile viewport
- [ ] Verify no prices appear anywhere in catalog or calculator
- [ ] Verify WhatsApp `href` on calculator includes computed cost figures
- [ ] Verify focus rings: Glacier Blue on dark sections, Dark Navy on light sections
- [ ] Verify custom cursor only appears on pointer:fine devices

---

## Spec Coverage Check

| Brief requirement | Task |
|---|---|
| Floating glassmorphic navbar | Task 4 |
| Hamburger below md | Task 4 |
| Dark Navy ↔ Ice White CTA only | Tasks 2, 4, 5, 14 |
| Context-aware focus rings | Task 2 |
| Bebas Neue / Inter / JetBrains Mono | Task 2 |
| Nav underline scaleX animation | Task 2 |
| Custom cursor — pointer:fine + !reduced-motion | Task 8 |
| Cursor reverts over inputs / calculator panel | Tasks 8, 11 |
| Fade-up scroll animations | Tasks 2, 8 |
| 15 SKUs in products.js | Task 6 |
| Catalog filter tabs | Task 10 |
| Ambient image crossfade (0.35s) | Tasks 2, 10 |
| Touch fallback (tap-to-reveal) | Task 10 |
| comingSoon card badge | Task 14 |
| Calculator exact formula | Task 11 |
| Calculator defaults per brief | Task 11 |
| WhatsApp wa.me deep link | Task 11 |
| Timeline IntersectionObserver (fires once) | Task 9 |
| Timeline milestones 2001→2024 | Task 13 |
| JSON-LD LocalBusiness schema | Task 12 |
| No prices anywhere | Tasks 6, 14, 15 |
| Certifications phrased at yarn-supplier level | Tasks 5, 12, 13 |
| Footer always Dark Navy | Task 5 |
| Section alternation Navy→White | Tasks 12–16 |
| prefers-reduced-motion respected | Tasks 2, 8, 9 |
| loading="lazy" on lifestyle images | Task 14 |
| explicit width/height on all img tags | Tasks 4, 5, 12–16 |
| 10%+16% markups hidden (Option A) | Task 11 |
