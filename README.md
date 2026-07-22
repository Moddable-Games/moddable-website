# Moddable.Games

**Creating games you already own.**

A multi-page marketing site and tools platform for an open-source board game modding workshop. Ten mods. Three original games. Two open-source engines. One Discord.

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
| `/mods/[slug]/` | 10 mod detail pages (incl. Dungeon Chess) |
| `/games/` | Games hub |
| `/games/nukes/` | Nukes |
| `/games/mongo/` | Mongo |
| `/games/endless-skies/` | Endless Skies |
| `/engines/` | Engines hub |
| `/engines/moddable-chess/` | Moddable Chess engine |
| `/engines/moddable-hexmaps/` | Moddable Hexmaps engine |
| `/developers/` | Developers / Tools API |
| `/news/` | News index |
| `/news/[slug]/` | 13 article pages |
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
├── mods.json               ← mod library (10 entries)
├── games.json              ← games (3 entries)
├── engines.json            ← engine listings (2 entries)
├── mcp-tools.json          ← MCP tool registry (50 tools, 7 namespaces)
├── news.json               ← news posts (13 entries)
└── team.json               ← team members (4 entries)
```

Pages load `mg-loader.js` (shared modules) + their own page script. Data is fetched via `MG.data.get('mods')` → Promise, or `MG.data.get('mod', 'slug')` for single items. Legacy `MG.data.load(['mods','news']).then(store => {...})` still works.

---

### Changelog

#### 2026-07-22
- Added Maze Rats (94 procedural tables) to oracle pipeline and oracles page
- Encounter Builder now supports D&D 5e and Pathfinder 1e via system selector
- Discord /encounter command uses autocomplete for future-proof system selection
- Rebuilt rules-index.json (8,426 entries across 41 games, added table-type indexing)
- MCP Worker bumped to v1.7.0

#### 2026-07-20
- Added GA4 analytics tracking to all untracked interactive modules
- API playground: tool select, category expand, tool run events
- Hex embed: layout, size, player, style changes and map generation
- TI Dashboard: game start, strategy picks, pass, Mecatol claims, agenda draw/resolve, game over
- Registered `tool_name` custom dimension in GA4 for per-MCP-tool breakdowns
- D&D Encounter Builder, Discord oracle commands, and /test suite (from prior session)
- Closed issues #131, #132, #135

#### 2026-06-10
- Deployed MCP tools server at tools.moddable.games (42 AI-callable tools across 6 namespaces)
- Serves MCP protocol (SSE), REST API, llms.txt, OpenAPI 3.1, .well-known/mcp.json discovery
- New /developers/ section: landing page + /api/ sub-page + /examples/ sub-page
- Purple section accent (#8b5cf6), SVG hero feature, unique OG images
- Homepage "For Developers" band between Featured Mod and Nukes sections
- Nav reordered: Mods, Engines, Games, Tools, Developers, About, News (SVG/cube alternation)
- Added dice_roll and ti4_random_factions as site-native tools
- Puzzle generation uses pre-computed pool (Cloudflare Workers free tier)
- AI Integration sections added to chess.moddable.games and hex.moddable.games
- Favicon and full OG/Twitter meta tags on tools.moddable.games Worker

#### 2026-06-09
- TI4 Objective Tracker: full game-session mode with player scoring, secret objectives, bonus VP tracking
- Supports all expansions (base, Prophecy of Kings, Discordant Stars, Thunder's Edge)
- Setup screen with player count, VP target, expansion toggles, and colour assignment
- Scoreboard with progress bars, tabbed interface (public/secrets/bonus), winner detection

#### 2026-06-05
- Unified hero system across all 17 pages with new shared sectionHero() component
- Two-tier design: full cosmic heroes (tier-1 indexes) and reduced sub-page heroes (tier-2)
- Colour system: RGB accents for consistent-sub-page sections, CMYK for divergent ones
- Added parallax scroll with dramatic text fade-out, hex grid zoom, and gradient darkening
- Added animated 3D feature elements: spinning cubes (Tools, Engines, About) and animated SVGs (Mods, Games, News)
- Reordered nav to alternate cube/SVG features: Mods, Engines, Games, Tools, News, About
- Fixed Endless Skies accent (green→blue to match detail page)
- Fixed mods page hash-change filtering from navbar dropdown
- Fixed tools page auto-scrolling to search on load
- Normalised all hero copy: tier-1 gets 2-line titles with single highlighted keyword + 2-line balanced ledes
- Created GitHub issue #81 for static site build system migration
- New assets: hex-grid-purple.svg, hex-grid-cyan.svg, hex-grid-magenta.svg, hex-grid-amber.svg

#### 2026-06-04
- Rewrote Planet Mongo game page from real rulebook (v0.9.0): 4X hex territory control, 8 factions, hidden orders, central market
- Rewrote Endless Skies game page from real rulebook (v0.2.0): 4X worker placement, 8 factions, ship rooms, wormhole network
- Both pages now honestly marked "In development" with no fabricated content
- Removed fake community mods from both pages (no real mods exist yet)
- Deleted dead per-game JS files and custom CSS (pages use shared data-driven renderer)
- Updated meta tags and OG descriptions for both games
- Synced all mod metadata from moddable-rules: versions, taglines, stats, development status
- Replaced Talisman Worlds logo (new circular emblem from moddable-rules, properly on 410x410 canvas)
- Fixed Talisman Worlds hero title (was still "Talisman: Hexed")
- Replaced fabricated Econopoly content with real rulebook mechanics (resources, VP, choose-your-action)
- Replaced fabricated Hyper Imperium content with real mechanics (3D exploration, promissory trades, mercenary builder)
- Rewrote games-sync.json from actual rulebook front matter (all entries were stale)
- Added RGB cube placeholder logo for all 6 community mods (#61 partial)
- Closed #25 (mod download links complete on website side), #78, #79

#### 2026-06-02
- Synced MCE to v0.7.1 / 70 variants (from v0.6.8 / 64): stats, features, consumer APIs, developer guides
- Moved Dungeon Chess from /games/ to /mods/ — it's a total conversion of chess, not an original game
- Added news article: "Building Games on Chess" (MCE v0.7.1 consumer APIs + DC v1.2.0 renderer migration)
- Rewrote Nukes game page from actual moddable-rules rulebook (removed all hallucinated content)
- Added game logos to games index cards (410x410 normalized PNGs)
- Updated all counts site-wide: 10 mods, 3 games, 13 news articles
- Regenerated OG images for games page and new article
- Added `.game-card__logo` CSS for logo thumbnails in game/mod cards
- Fixed body text centering in games engines callout section
- Created issues #78 (Mongo sync) and #79 (Endless Skies sync) for future rulebook rewrites
- Bumped to v1.0.60

#### 2026-05-28
- Synced chess engine stats from moddable-chess v0.6.8: variant count 39/54→64, engine version, board types
- Updated all stale chess references across 9 files (engines page, tools page, news cards, data files)
- Added Colony as 4th hexmaps-powered game across engines page, stats, and consumer listings (#71)
- TI4 tools: added Discordant Stars + Thunder's Edge expansions (36 factions, 26 objectives, 20 agendas) (#68)
- Galaxy map generator: replaced player count dropdown with 7 official TI4 layout variants (3p–8p + Hyper Imperium)
- Hexmap embed: added style selector (Artistic/Classic/Kenney/Realistic per game) with consistent URL params
- Hexmap embed: postMessage bridge for "New map" regeneration without iframe reload
- New Dice Lab at `/tools/dice/` — dice roller + battle simulators for Risk, TI4, Axis & Allies, X-Wing, Blood Bowl, Memoir '44, Custom (#67)
- Merged dice roller from tools index into Dice Lab as first tab
- Removed strike planner widget from Nukes tools (redundant with full hexmaps embed)
- Removed Hex Map Generator card from tools index (belongs under Engines, not Tools)
- Updated "Games supported" count 3→4 on all hexmaps engine bands
- Footer column titles now clickable links to their respective index pages
- Renamed "Mod-specific tools" → "Per-game tools" with consistent spacing and anchors
- Tab selection persists in URL hash (`/tools/dice/#risk`) for sharing
- Mod detail page TOC scroll-spy fixed (calls initTocSpy after dynamic render)
- Mod buttons wired up with real URLs: rules.moddable.games, BGG, Wikipedia, itch.io (#25 Part 1)
- Removed Nuke Catan mod (invented, no supporting material) — homepage section now links to Nukes game + nuking-catan article
- Related mods auto-derived from category/baseGame (no more hardcoded arrays)
- Fixed mod/game counts: 9 mods, 4 games across all references

#### 2026-05-27
- New tools: Resource Dashboard, Bag Tracker, Role Distributor (all fully configurable with game presets)
- Removed: Map Grid Generator (redundant), Voting Booth (needs server), Combat Odds (rebuilt as Dice Lab #67)
- Fixed invisible buttons on tools page (wrong variants for light backgrounds)
- Tools index: added Hex Map Generator card, updated mod-specific card descriptions
- Hexmaps tools card links to engine page (not external generator)
- Nukes game page: added "Generate Map" hero CTA
- Embed moddable-hexmaps engine in tools pages: `/tools/nukes/`, `/tools/talisman/`, `/tools/ti/` (#62)
- Shared embed module (`js/mg-hexmap-embed.js`) + CSS (`css/tools-hexmaps.css`)
- "Powered by Moddable Hexmaps" engine band on all three pages
- Seed sharing via URL params works through iframe
- New `/engines/` section: top-level nav item, index page, Moddable Chess + Moddable Hexmaps pages
- Reclassified Chess and Hexmaps from "Games" to "Engines" — they're SDKs, not games
- Nav updated: `Mods | Games | Engines | Tools | News | About`
- Moved `/games/moddable-chess/` → `/engines/moddable-chess/` (old URL redirects)
- Created `/engines/moddable-hexmaps/` showcase page (green accent, no embed yet — pending hexmaps#7)
- Footer, search, tools chess page, news.json all updated to new paths
- Games index: removed chess, added "Powered by our engines" callout
- Created `data/engines.json` as data source for engine listings
- Cross-project issues: moddable-chess#47, moddable-hexmaps#17
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
- Per-team-member OG images with breakout photo + shadow slit effect
- Replaced 16 template OG images: 10 mod pages (hex-grid cards) + 6 tool pages (geometric icons)
- OG scripts data-driven: `build/gen-mod-og.py` (reads mods.json), `build/gen-tools-og.py`
- Mod logos: added `logo` field to mods.json, logos display on cards, detail heroes, and OG images
- Copied Talisman: Hexed + Econopoly logos from moddable-rules; Hyper Imperium already had one
- Fix mod detail page hero never rendering (DOMContentLoaded race condition)
- Component list styling: accent-coloured outlined bullets, better spacing
- Generated ALL remaining OG images — zero template placeholders left (closes #53)
- 4 build scripts for future regeneration: `gen-team-og.py`, `gen-mod-og.py`, `gen-tools-og.py`, `gen-remaining-og.py`
- Created #61 (missing mod/tool logos) and moddable-chess#44 (board themes)

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
