# Moddable.Games — Claude Code context

This file is the authoritative handoff document for this project.
Read it in full before making any changes.

---

## What this is

A multi-page marketing and tools website for **Moddable.Games** — a fictional
workshop that publishes open-source rulebook mods for existing board games, plus
three original games designed to be modded from day one.

The site is **plain HTML + vanilla JS, zero dependencies, zero build step**.
One shared component library (`_mg.js` + `_mg.css`), one page per HTML file.

---

## Repo structure

```
/
├── CLAUDE.md               ← you are here
├── index.html              ← marketing home
├── 404.html                ← GitHub Pages 404
├── css/
│   └── _mg.css             ← shared CSS variables + resets + keyframes
├── js/
│   ├── mg.js               ← barrel re-export (single import for pages)
│   └── mg-core.js          ← tokens, helpers, data layer
├── data/
│   ├── mods.json           ← mod library (10 entries)
│   ├── games.json          ← games (3 entries)
│   ├── engines.json        ← engine/SDK listings (2 entries)
│   ├── mcp-tools.json      ← MCP tool registry (56 tools, 7 namespaces, v1.8.0)
│   ├── news.json           ← news posts (13 entries)
│   └── team.json           ← team members (4 entries)
│
├── mods/
│   ├── index.html          ← mods library (filterable, searchable)
│   └── <slug>/index.html   ← detail page per mod (10 total, incl. Dungeon Chess)
├── engines/
│   ├── index.html          ← engines index (Chess, Hexmaps)
│   ├── moddable-chess/index.html    ← Chess engine page
│   └── moddable-hexmaps/index.html  ← Hexmaps engine page
├── games/
│   ├── index.html                ← games index
│   ├── endless-skies/index.html  ← Endless Skies game page
│   ├── mongo/index.html          ← Mongo game page
│   └── nukes/index.html          ← Nukes game page
├── news/
│   ├── index.html          ← news index
│   └── <slug>/index.html   ← article pages (13 total)
├── tools/
│   ├── index.html          ← tools hub
│   ├── ti/index.html       ← TI4 tools (faction picker, objectives, agenda voter)
│   ├── talisman/index.html ← Talisman tools (character lottery, hex board, encounter draw)
│   ├── nukes/index.html    ← Nukes tools (target picker, fallout tracker, resource converter)
│   ├── dice/index.html     ← Dice lab (multi-system roller)
│   ├── decks/index.html    ← Deck builder
│   ├── chess/index.html    ← Chess variant explorer
│   └── oracles/index.html  ← Oracles (Scene Forge, Maze Rats, Ask the Oracle, Thread Weaver, Encounter Builder, RPG Library)
├── submit/index.html       ← 3-step mod submission form
├── subscribe/index.html    ← email subscribe page
├── about/
│   ├── index.html          ← about page
│   └── roadmap/index.html  ← public roadmap
├── team/
│   ├── index.html          ← team page
│   └── <name>/index.html   ← team member detail pages (4 total)
├── developers/index.html   ← developers/API page (MCP tools showcase)
├── press/index.html        ← press/media page
├── community/index.html    ← community / Discord page
└── workers/
    ├── index.js            ← forms API Worker (subscribe, submit)
    ├── wrangler.toml       ← Cloudflare config for moddable-api
    ├── discord/
    │   ├── index.js        ← The House Discord bot (31 slash commands)
    │   ├── register-commands.js ← Discord command registration script
    │   └── wrangler.toml   ← Cloudflare config for moddable-bot
    └── mcp/
        ├── index.js        ← MCP tools Worker (50 tools, 7 namespaces, v1.7.0)
        ├── chess-tools.js  ← re-exports from moddable-chess/mcp/tools.js
        ├── hex-tools.js    ← re-exports from moddable-hexmaps/mcp/tools.js
        ├── piece-gallery.js ← piece gallery tools (imports gallery-index.json from moddable-chess)
        ├── game-tools.js   ← classic game engines (Mancala, Morris, Ur, Pachisi, etc)
        ├── rules-tools.js  ← rules library tools (queries rules-index.json)
        ├── rules-index.json← search index from moddable-rules/dist/
        ├── oracle-tools.js ← oracle + RPG entity tools (10 systems, 305 tables, 3385 entities)
        ├── oracle-data.json← aggregated oracle/random tables from moddable-rules (305 tables, 6 games)
        ├── rpg-entities.json← RPG entity index from moddable-rules (3385 entities, 7 games)
        ├── pf-monsters.json← Pathfinder 1e monster pool (336 creatures)
        ├── pf-loot.json    ← Pathfinder 1e magic item loot table
        ├── build-oracles.mjs← build script for oracle-data.json
        ├── wrangler.toml   ← Cloudflare config for moddable-tools
        └── deploy.sh       ← deploy script
```

---

## MCP Tools Worker

The repo contains a Cloudflare Worker at `workers/mcp/` that serves 56
AI-callable tools across 7 namespaces (Chess, Hexmaps, Piece Gallery, Rules,
Game Tools, Oracles/RPG, Utilities).

**Live at:** `https://tools.moddable.games/`

**Endpoints:**
- `/mcp` — SSE transport for MCP protocol (Claude Desktop, Cursor, VS Code)
- `/mcp/message` — POST endpoint for MCP JSON-RPC messages
- `/api/call` — REST API (`POST {"tool": "name", "args": {...}}`)
- `/api/tools` — GET tool listing with schemas
- `/api/pieces.png` — GET piece set preview grid as PNG (`?set=chessnut&size=64`)
- `/llms.txt` — AI-readable discovery file
- `/openapi.json` — OpenAPI 3.1 spec
- `/.well-known/mcp.json` — MCP server discovery manifest

**Namespaces:**
- **moddable-chess** (9 tools) — variant listing, legal moves, analysis, puzzles, SVG render
- **moddable-hexmaps** (6 tools) — map generation, pathfinding, FOV, SVG export
- **piece-gallery** (3 tools) — piece set search, get details, aggregate stats (96 sets, 19 families)
- **moddable-rules** (5 tools) — game/variant lookup, search, random
- **game-tools** (12 tools) — TI4 objectives/agendas/draft, Mancala, Morris, Ur, Pachisi, Nukes setup, Colony odds
- **oracles** (14 tools) — oracle roll/ask/scene/recipes/interpret/table view, encounter builder, RPG entity browser (list games, list categories, search, browse, get entity, random) across 10 systems (Starforged, Ironsworn, Maze Rats, Cairn, Dungeon World, Knave, D&D 5e, Pathfinder 1e, BRP, Fate Core)
- **moddable-tools** (7 tools) — dice roll, faction assign, coin flip, team split, jam status/timer/vote

**Architecture:** The Worker imports tool handlers from sibling repos
(`moddable-chess/mcp/tools.js`, `moddable-hexmaps/mcp/tools.js`) and local
modules (`rules-tools.js`, `game-tools.js`) via relative paths. Wrangler's
bundler resolves and inlines everything at deploy time.

**Deploy:** `cd workers/mcp && wrangler deploy`

**Puzzle pool:** `chess_generate_puzzle` serves from a pre-computed pool of
1,557 puzzles across 66 variants (no CPU-intensive search at runtime). The
pool is imported from `puzzle-pool.json` at bundle time. Board images are
rendered via `@resvg/resvg-wasm` at `/api/board.png`.

---

## Discord Bot (The House)

The repo contains a Cloudflare Worker at `workers/discord/` that powers "The
House" — the server bot for the Moddable.Games Discord.

**34 registered slash commands** consuming all 56 MCP tools via the REST API
bridge (`callTool` → `POST tools.moddable.games/api/call`).

**Command groups:** Dice & Utilities, Chess (8 commands), Hex Maps, Rules
Library, Twilight Imperium, Game Tools (Mancala/Morris/Ur/Pachisi/Nukes/Colony),
Mod Jam, Admin (`/test`).

**`/test` command:** Runs the full tool test suite in any channel — calls each
of the 31 testable tools and posts pass/fail embeds with response previews.

**Deploy:** `cd workers/discord && wrangler deploy`
**Register commands:** `DISCORD_TOKEN=xxx DISCORD_APP_ID=xxx node register-commands.js`

**Scheduled tasks:** Cron trigger checks for Mod Jam deadline milestones (7d,
3d, 1d warnings) and monitors replies to House posts.

---

## Design system

### Fonts (Google Fonts, loaded in `_mg.css`)
| Role | Family |
|---|---|
| Display / headings | Inter Tight 500–700 |
| Body / UI | Inter 400–700 |
| Monospace / stats | JetBrains Mono 400–600 |
| Pixel / eyebrows | Press Start 2P |

### Colour tokens (all in `_mg.js` as `T.*` and in `_mg.css` as `--mg-*`)
| Token | Value | Use |
|---|---|---|
| `red` | `#d11a1a` | Total conversion accent, Nukes |
| `green` | `#3a9928` | Rebalance accent, Mongo, Endless Skies |
| `blue` | `#0c4f8d` | Reskin accent, TI tools |
| `cosmicDeep` | `#0a0d2a` | Hero section backgrounds |
| `cosmicMid` | `#1a3680` | Hero gradient midpoint |
| `cosmicGlow` | `#6fb5ff` | Pixel eyebrow text, horizon glows |
| `canvasLight` | `#f5f4ef` | Warm off-white section backgrounds (NOT pure white) |
| `ink` | `#14161c` | Primary text on light |
| `hairlineLight` | `#e6e3d8` | Borders on light backgrounds |

### Mod category → accent colour
```js
"Total conversion" → T.red
"Rebalance"        → T.green
"Reskin"           → T.blue
```

### Key design rules (do not break these)
- **No drop shadows** anywhere
- **Pill buttons only** — `border-radius: 9999px`
- **One RGB primary per surface** — dark sections use one accent colour, not mixed
- **`canvasLight` (#f5f4ef), not pure white** for warm section backgrounds
- **Pixel font (Press Start 2P) only for eyebrow labels** — never body text, never large sizes
- **Hex grid SVG overlay** on all cosmic/dark hero sections, animated with `hexFloat` keyframe
- **Horizon glow line** (1px gradient + radial bloom) on the home hero and community band sections

---

## Component library (native ESM in `js/`)

All components are native ES modules. The barrel file `js/mg.js` re-exports
everything; page modules import from it.

### Module structure
```
js/mg-core.js       ← tokens, el(), url(), data, cubeSVG (root module)
js/mg-analytics.js  ← GA4 track() + gtag init
js/mg-buttons.js    ← btn(), linkBtn()
js/mg-cards.js      ← modCard(), pageHero()
js/mg-navbar.js     ← navbar()
js/mg-footer.js     ← footer()
js/mg-hero.js       ← sectionHero(), buildHeroFeature()
js/mg-search.js     ← openSearch(), Cmd+K handler
js/mg-animations.js ← initReveal(), initTocSpy()
js/mg-schema.js     ← JSON-LD structured data (side-effect only)
js/mg.js            ← barrel re-export (single import for pages)
```

### Available exports (from `./mg.js`)
```js
import { T, F, HEX_BG, CATEGORY_COLORS, el, url, data, cubeSVG,
         btn, linkBtn, modCard, pageHero, navbar, footer,
         sectionHero, buildHeroFeature, initReveal, track } from './mg.js';
```

### Button variants
`primary` | `dark` | `blue` | `green` | `red` | `outline-dark` | `outline-light`

---

## Page conventions

Every page follows this structure:

```html
<link rel="stylesheet" href="../css/_mg.css?v=X.X.X">
<link rel="stylesheet" href="../css/page-specific.css?v=X.X.X">
<link rel="stylesheet" href="../css/navbar.css?v=X.X.X">
<link rel="stylesheet" href="../css/footer.css?v=X.X.X">
<link rel="stylesheet" href="../css/cards.css?v=X.X.X">
<link rel="stylesheet" href="../css/hero.css?v=X.X.X">
<link rel="stylesheet" href="../css/hero-features.css?v=X.X.X">
...
<div id="nav-root"></div>
<!-- page-specific HTML sections -->
<div id="footer-root"></div>
<script type="module" src="../js/mg-page-name.js?v=X.X.X"></script>
```

Each page JS file imports what it needs from `./mg.js`:
```js
import { navbar, footer, sectionHero, ... } from './mg.js';
document.getElementById('nav-root').appendChild(navbar('ActiveSection'));
document.getElementById('footer-root').appendChild(footer());
```

**Dark pages** (games, home hero, news post) use `background:#000` on `<body>`.
**Light pages** (mods, tools, about, community) use `background:#f5f4ef`.

Interior page heroes (About, News, Team, Community) use `MG.pageHero()` — not
hand-rolled sections — so they stay visually consistent.

---

## Pages that still need work / known gaps

- The **submit form** (`submit/index.html`) has no backend — it shows a success
  state on submit but doesn't POST anywhere.

- `tools/ti/` agenda voter draws from a hardcoded 6-agenda list. The full
  TI4 agenda deck has 44 cards — expanding this would be straightforward.

- No **global search** — the search in mods and news indexes is local to each
  page's in-memory data.

---

## Mods library data (source of truth: `data/mods.json`)

10 entries across 6 base games. Four are Moddable originals; six are real
publicly available community variants with attributions.

| Title | Base game | Category | Source |
|---|---|---|---|
| Dungeon Chess | Chess | Total conversion | Moddable.Games |
| Talisman: Hexed | Talisman 4e | Reskin | Moddable.Games |
| Hyper Imperium | Twilight Imperium 4e | Rebalance | Moddable.Games |
| Econopoly | Monopoly | Rebalance | Moddable.Games |
| Anti-Monopoly | Monopoly | Total conversion | Public domain variant |
| Flooded Catan | Catan | Rebalance | catan.fandom.com |
| The Diamond Mine | Catan | Total conversion | scribd.com — meepleeater |
| Shattered Ascension | Twilight Imperium 4e | Rebalance | boardgamegeek.com |
| CivRisk | Risk | Rebalance | Chris Grey — self-published |
| Custom World Risk | Risk | Reskin | Community / BGG |

