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
│   └── mg-loader.js        ← entry point; loads shared modules
├── data/
│   ├── mods.json           ← mod library (9 entries)
│   ├── games.json          ← games (4 entries)
│   ├── engines.json        ← engine/SDK listings (2 entries)
│   ├── news.json           ← news posts (12 entries)
│   └── team.json           ← team members (4 entries)
│
├── mods/
│   ├── index.html          ← mods library (filterable, searchable)
│   └── <slug>/index.html   ← detail page per mod (9 total)
├── engines/
│   ├── index.html          ← engines index (Chess, Hexmaps)
│   ├── moddable-chess/index.html    ← Chess engine page
│   └── moddable-hexmaps/index.html  ← Hexmaps engine page
├── games/
│   ├── index.html                ← games index
│   ├── endless-skies/index.html  ← Endless Skies game page
│   ├── mongo/index.html          ← Mongo game page
│   ├── dungeon-chess/index.html  ← Dungeon Chess game page
│   └── nukes/index.html          ← Nukes game page
├── news/
│   ├── index.html          ← news index
│   └── <slug>/index.html   ← article pages (12 total)
├── tools/
│   ├── index.html          ← tools hub
│   ├── ti/index.html       ← TI4 tools (faction picker, objectives, agenda voter)
│   ├── talisman/index.html ← Talisman tools (character lottery, hex board, encounter draw)
│   ├── nukes/index.html    ← Nukes tools (target picker, fallout tracker, resource converter)
│   ├── dice/index.html     ← Dice lab (multi-system roller)
│   ├── decks/index.html    ← Deck builder
│   └── chess/index.html    ← Chess variant explorer
├── submit/index.html       ← 3-step mod submission form
├── subscribe/index.html    ← email subscribe page
├── about/
│   ├── index.html          ← about page
│   └── roadmap/index.html  ← public roadmap
├── team/
│   ├── index.html          ← team page
│   └── <name>/index.html   ← team member detail pages (4 total)
├── press/index.html        ← press/media page
└── community/index.html    ← community / Discord page
```

---

## The preview workflow

**Never hand-edit `build/moddable-preview.html`.**

After any change to any source file, regenerate it:

```bash
python3 build/build-preview.py
```

This bundles all pages into one self-contained HTML file with a client-side
router and preview chrome (page switcher bar + back button). The output file
can be opened directly in a browser with no server required.

The script:
1. Reads every page's `<body>` content and inline `<script>`
2. Strips the two lines that call `navbar()` and `footer()` into `#nav-root`
   / `#footer-root` (the preview shell owns those)
3. Embeds `js/_mg.js` and `css/_mg.css` inline
4. Writes `build/moddable-preview.html`

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

## Component library (modular JS in `js/`)

All components live inside the `MG` namespace (built by `mg-core.js` + extension
modules loaded via `mg-loader.js`).

### Available exports
```js
MG.T               // colour tokens object
MG.F               // font-family strings
MG.HEX_BG          // hex grid CSS background-image data URI
MG.CATEGORY_COLORS // { "Total conversion": red, "Rebalance": green, "Reskin": blue }
MG.el(tag, attrs, ...children)  // DOM element builder
MG.btn(label, variant, onClick, extraStyle)   // <button>
MG.linkBtn(label, href, variant, extraStyle)  // <a> styled as button
MG.navbar(activeId)    // sticky 64px navbar; activeId = 'Mods'|'Games'|'Tools'|'News'|'About'
MG.footer()            // full site footer
MG.modCard(props)      // mod card; props: { category, title, baseGame, stats, body, href, source }
MG.pageHero(props)     // interior page hero; props: { eyebrow, title, lede, accent, withHorizon, minHeight }
MG.cubeSVG(size)       // the tri-colour cube SVG logo mark
MG.data.get(name)      // → Promise<Array> — fetches & caches automatically
MG.data.get(type, slug) // → Promise<Object|null> — single item by slug (e.g. get('mod','nuke-catan'))
MG.data.load(names)    // → Promise<store> — batch-fetch (backward compat)
```

### Button variants
`primary` | `dark` | `blue` | `green` | `red` | `outline-dark` | `outline-light`

---

## Page conventions

Every page follows this structure:

```html
<div id="nav-root"></div>

<!-- page-specific HTML sections -->

<div id="footer-root"></div>
<script src="../js/_mg.js"></script>  <!-- path depth varies by page -->
<script>
const { el, btn, linkBtn, navbar, footer, /* other needed exports */ } = MG;
document.getElementById('nav-root').appendChild(navbar('ActiveSection'));
document.getElementById('footer-root').appendChild(footer());

// page-specific JS
</script>
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

9 entries across 5 base games. Three are Moddable originals; six are real
publicly available community variants with attributions.

| Title | Base game | Category | Source |
|---|---|---|---|
| Talisman: Hexed | Talisman 4e | Reskin | Moddable.Games |
| Hyper Imperium | Twilight Imperium 4e | Rebalance | Moddable.Games |
| Econopoly | Monopoly | Rebalance | Moddable.Games |
| Anti-Monopoly | Monopoly | Total conversion | Public domain variant |
| Flooded Catan | Catan | Rebalance | catan.fandom.com |
| The Diamond Mine | Catan | Total conversion | scribd.com — meepleeater |
| Shattered Ascension | Twilight Imperium 4e | Rebalance | boardgamegeek.com |
| CivRisk | Risk | Rebalance | Chris Grey — self-published |
| Custom World Risk | Risk | Reskin | Community / BGG |

---

## How the preview router works

`moddable-preview.html` contains three `<script>` blocks:

1. **`_mg.js`** inlined verbatim
2. **Page registry** — `PAGES` object with one entry per page:
   ```js
   PAGES['index'] = {
     label: 'Home',
     nav: 'Mods',        // which navbar item to highlight
     style: '...',       // page-specific <style> contents
     html: `...`,        // page body HTML (template literal)
     init(container) {   // page JS with navbar()/footer() calls stripped
       ...
     }
   }
   ```
3. **Router IIFE** — on `navigateTo(pid)`:
   - Injects page style into `<head>`
   - Renders `MG.navbar(p.nav)` into `#nav-root`
   - Sets `#page-root.innerHTML = p.html`
   - Renders `MG.footer()` into `#footer-root`
   - Intercepts all internal `<a href="*.html">` clicks to stay in the router
   - Calls `p.init()` for page-specific JS
   - Re-intercepts links added by JS after a 60ms delay

**Important:** `build-preview.py` strips the two lines
`document.getElementById('nav-root').appendChild(navbar(...))` and
`document.getElementById('footer-root').appendChild(footer())` from every
page's init function, since the router handles those. If you add a new page,
keep those lines in the source HTML (so it works standalone) — the build
script removes them automatically for the preview.
