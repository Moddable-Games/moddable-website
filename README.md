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
├── mg-loader.js            ← entry point, loads all modules
├── mg-core.js              ← tokens, el(), url(), MG.data (fetch layer)
├── mg-buttons.js           ← btn(), linkBtn()
├── mg-cards.js             ← modCard(), pageHero()
├── mg-navbar.js            ← navbar()
├── mg-footer.js            ← footer()
├── mg-search.js            ← global Cmd+K search
├── mg-animations.js        ← scroll reveal + TOC spy
├── mg-mods-content.js      ← mod page content (rules, components, etc.)
├── mg-mod-page.js          ← data-driven mod detail renderer
├── mg-news-article-page.js ← shared news article renderer
└── mg-*-page.js            ← page-specific scripts (home, tools, etc.)

data/
├── mods.json               ← mod library (13 entries)
├── games.json              ← games (5 entries)
├── news.json               ← news posts (12 entries)
└── team.json               ← team members (4 entries)
```

Pages load `mg-loader.js` (shared modules) + their own page script. Data is fetched via `MG.data.get('mods')` → Promise, or `MG.data.get('mod', 'slug')` for single items. Legacy `MG.data.load(['mods','news']).then(store => {...})` still works.

---

### Changelog

#### 2026-05-27
- Fix homepage crash: "Fog of War Chess" removed from mods.json but still referenced in homepage featured list
- Fix hero parallax spilling past section boundary — wrap in overflow:hidden container
- Fix home-tabs nav hidden under section above — remove overflow:hidden that clipped negative margin
- Bump version 1.0.29 → 1.0.30 (was missing from previous commit)
- News articles: author sidebar card with breakout team photo, name, role, profile link
- News articles: real share links (X, Facebook, LinkedIn, copy URL)
- News articles: all 12 posts now have callout cards with real links (no more dead # hrefs)
- News articles: hybrid auto-derive callout from tags when no manual modCard specified
- News articles: improved right rail spacing (topics, mod card)
- Added `teamSlug` field to all news posts — author rendered from team.json, not hardcoded

#### 2026-05-26
- Update chess variant count 20→39 across all pages (closes #55, #54)
- Remove dead `mg-game-dungeon-chess-page.js` — orphaned file not loaded anywhere (closes #52)
- Fix inline `style="display:none"` on chess tools page → CSS class with classList toggle
- Refactor navbar, footer, and cards from inline `style:{}` objects to dedicated CSS files
- New files: `css/navbar.css`, `css/footer.css`, `css/cards.css` (63 rules total)
- Loader auto-injects component CSS via `document.write` — no per-page HTML changes needed
- Only data-driven dynamic values (accent colors, image URLs) remain as inline style strings

#### 2026-05-24
- Added per-page OG/Twitter meta tags via `build/stamp-meta.py` (closes #35)
- Fleshed out 4 stub pages: /press (stat cards, swatches, assets), /subscribe (form + success state), /tools/decks (deck builder), /tools/chess (variant picker)
- Added all new pages to navbar dropdowns, footer links, and tools index
- Created new `Moddable-Games/moddable-chess` repo — shared chess engine with 14 variants
- Renamed existing chess repo to `Moddable-Games/dungeon-chess`
- Added favicon set (SVG + PNG), apple-touch-icon, PWA manifest, theme-color (closes #8)
- Added CNAME for web.moddable.games, production OG URLs, GitHub Pages ready (closes #9)
- 47 branded OG social images generated for all pages
- Auto-detect local dev path from URL — no manual `mg-base` meta tag needed
- Responsive design audit: mobile breakpoints across 11 CSS files (closes #6)
- ARIA landmarks, skip-to-content link, aria-current=page on nav (closes #24)
- Fixed placeholder # links — community channels now non-link divs (closes #26)
- TI4 agenda voter expanded: 6 → 46 cards, full base game deck (closes #3)
- Accessibility: stone colour darkened for WCAG AA contrast (closes #11)
- Performance: lazy-load below-fold images (closes #14)
- Tools interactivity audit: all widgets verified functional (closes #27)
- Repo made public, GitHub Pages live at web.moddable.games
- Team member detail pages with authored posts, long bios, teammate links (closes #32)

#### 2026-05-25
- Rebuild Nukes tools (#49): strike planner, combat calculator, hostage tracker, unit reference — based on real rulebook
- Chess tools: 20 playable variants (added No Castling, Torpedo, Horde, Extinction, Breakthrough, Maharaja)
- Chess game page: stats reflect v0.4.2 engine, CTAs link to chess.moddable.games, 6-category variant grid
- Fix nav dropdowns clipped by overflow:hidden on header
- Featured card style (dark bg) for Dungeon Chess on Moddable Chess page
- Hero cube centred on mobile
- Fix mobile nav: drawer hidden on load, prevent horizontal overflow
- Fix homepage hero bg repeating on mobile
- Fix team page pop-out overlap on mobile (increased row-gap)
- Version system: `bump.sh` single-source from `version.txt`, footer displays version
- Cache-busting `?v=` on all CSS/JS loads across 52 HTML files
- Removed fan-made disclaimer from footer (to licensing page later)
- Chess embed: live playable board via iframe from chess.moddable.games
- Chess engine params: `theme=light`, `boardonly=1`, `bg=`, `accent=`, `radius=`
- Match setup: mode selector (vs AI / Pass & Play), player names passed to engine
- Dynamic iframe aspect ratio from variant board dimensions
- Chess engine promo: full-width dark band section with USPs
- Press kit: styled bullet lists as bordered accent cards
- Auto-detect local moddable-chess path for iframe testing

#### 2026-05-23
- Refactored `MG.data` to Promise-based API: `get(name)` → Promise, `get(type, slug)` → single item lookup
- Deduplicates in-flight fetches (no double-requests for same resource)
- Removed `ready()` method (unused); `load()` kept for backward compat
- Fixed responsive team page: breakout images scale down on mobile (≤600px)
- Search index loads news asynchronously on first open (no longer relies on sync cache)
- Templated all 13 mod pages — identical HTML shells, hero rendered from data
- Extracted all 12 news article bodies to `data/articles/{slug}.html` partials
- Article metadata (author, lede, TOC, modCard) moved into `data/news.json`
- News page shells are now identical templates — full page rendered by JS
- Created issue #35 for per-page Open Graph / Twitter meta tags

#### 2026-05-22
- Extracted all data from JS modules to JSON files (`data/mods.json`, `games.json`, `news.json`, `team.json`)
- Added `MG.data` fetch layer in `mg-core.js` — async `load()/get()` pattern
- Removed 4 data JS modules (`mg-mods-data.js`, `mg-games-data.js`, `mg-news-data.js`, `mg-team-data.js`)
- Updated all consumer scripts to use `MG.data.load().then()` pattern
- Added `text-wrap: pretty` to global CSS resets for orphan prevention
- Redesigned tools page: filterable card grid with category bar (Game Night, Planning, Creative, Mod-Specific)
- Converted 3 dark-themed tool widgets (Dice, Timer, Seating) to unified light card style
- Added 3D spinning CSS dice to tools hero section
- Redesigned team page with photo avatars breaking out of cards (4-column grid)
- Removed font-test.html

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
