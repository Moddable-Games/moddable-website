# Moddable.Games

**Creating games you already own.**

A multi-page marketing site and tools platform for an open-source board game modding workshop. Twelve mods. Three original games. One Discord.

---

### Stack

```
HTML + Vanilla JS + Zero dependencies + Zero build step
```

Modular JS architecture: one loader (`js/mg-loader.js`) loads 12 shared modules + page-specific scripts. Zero inline scripts or styles.

---

### Routes

| URL | Page |
|-----|------|
| `/` | Home |
| `/mods/` | Filterable mod library |
| `/mods/[slug]/` | 12 mod detail pages |
| `/games/` | Games hub |
| `/games/nukes/` | Nukes |
| `/games/mongo/` | Mongo |
| `/games/endless-skies/` | Endless Skies |
| `/games/moddable-chess/` | Moddable Chess |
| `/games/dungeon-chess/` | Dungeon Chess |
| `/news/` | News index |
| `/news/[slug]/` | 12 article pages |
| `/tools/` | Tools hub (dice, names, scores) |
| `/tools/ti/` | Twilight Imperium tools |
| `/tools/talisman/` | Talisman tools |
| `/tools/nukes/` | Nukes tools |
| `/submit/` | Mod submission form |
| `/about/` | About |
| `/about/roadmap/` | 18-month roadmap |
| `/team/` | Team |
| `/community/` | Community / Discord |

---

### Run locally

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/`. Clean URLs, no `.html` extensions.

---

### Deploy to GitHub Pages

1. Push to GitHub
2. Settings → Pages → Deploy from `main` branch, root folder
3. Update the `<meta name="mg-base">` tag across pages to match your deploy path:

| Scenario | `mg-base` value |
|----------|-----------------|
| Custom domain (root) | _(remove the tag)_ |
| `username.github.io` repo | _(remove the tag)_ |
| Project repo (`/repo-name/`) | `/repo-name` |

---

### Design system

| | |
|---|---|
| **Display** | Inter Tight 500–700 |
| **Body** | Inter 400–700 |
| **Mono** | JetBrains Mono 400–600 |
| **Pixel** | Press Start 2P (eyebrows only) |

```
#d11a1a  red         Total conversion / Nukes
#3a9928  green       Rebalance / Mongo / Endless Skies
#0c4f8d  blue        Reskin / TI tools
#0a0d2a  cosmicDeep  Hero backgrounds
#f5f4ef  canvasLight Warm off-white sections (not pure white)
#14161c  ink         Primary text on light
```

**Rules:** No drop shadows. Pill buttons only. One RGB primary per surface. Hex grid SVG overlay on all dark heroes.

---

### JS Architecture

```
js/
├── mg-loader.js          ← entry point, loads all modules
├── mg-core.js            ← tokens, el(), url()
├── mg-buttons.js         ← btn(), linkBtn()
├── mg-cards.js           ← modCard()
├── mg-navbar.js          ← navbar()
├── mg-footer.js          ← footer()
├── mg-search.js          ← global Cmd+K search
├── mg-animations.js      ← scroll reveal + TOC spy
├── mg-mods-data.js       ← mod library data
├── mg-mods-content.js    ← mod page content (rules, components, etc.)
├── mg-news-data.js       ← news post metadata
├── mg-games-data.js      ← games data
├── mg-team-data.js       ← team member data
├── mg-mod-page.js        ← data-driven mod detail renderer
├── mg-news-article-page.js ← shared news article renderer
└── mg-*-page.js          ← page-specific scripts (home, tools, etc.)
```

Pages load `mg-loader.js` (which handles shared modules) + their own page script.

---

### Changelog

#### 2026-05-21
- Extracted ALL inline scripts to external JS files (zero remain across 45 pages)
- Created data-driven mod page renderer (`mg-mod-page.js` + `mg-mods-content.js`)
- Created shared news article renderer (`mg-news-article-page.js` with `data-toc`)
- Extracted team data to `mg-team-data.js`
- Added TOC scroll-spy with accent colour highlighting
- Added global rule: no inline `<script>` blocks (matches no inline styles)
- Net: -5220 lines of inline JS removed, +3537 lines in proper external modules

#### 2026-05-20
- Extracted mods and games data into shared JS modules (`mg-mods-data.js`, `mg-games-data.js`)
- Extracted all inline styles to external CSS files; complete JS module split
- Split `_mg.js` into semantic modules (core, components, animations)
- Added global search (Cmd+K) and made mod cards fully clickable
- Scroll-reveal animation system, hero entrance choreography, button micro-interactions
- Game page heroes: two-column layout with floating logos
- Homepage: nuked-family illustration, Hyper Imperium logo, glowing section dividers
- All 12 news articles created from WordPress, news index linked correctly
- Nav dropdowns upgraded with animation and blue accent states
- Removed all inline style attributes; semantic BEM class system throughout
- Created 12 mod detail pages, games hub, Moddable Chess, Dungeon Chess, roadmap
- Fixed double-url bug, removed redundant nav items, cleaned unused assets

#### 2026-05-19
- Restructured for clean URLs and GitHub Pages deployment
- Initial site commit

---

### License

MIT
