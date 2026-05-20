# Moddable.Games

**Creating games you already own.**

A multi-page marketing site and tools platform for an open-source board game modding workshop. Twelve mods. Three original games. One Discord.

---

### Stack

```
HTML + Vanilla JS + Zero dependencies + Zero build step
```

One shared component library (`js/_mg.js` + `css/_mg.css`), one `index.html` per route.

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

### Component library (`_mg.js`)

```js
MG.navbar(activeId)        // Sticky 64px navbar
MG.footer()                // Full site footer
MG.modCard(props)          // Mod card component
MG.pageHero(props)         // Interior page hero
MG.linkBtn(label, href, variant)  // Pill link button
MG.btn(label, variant, onClick)   // Pill button
MG.cubeSVG(size)           // Tri-colour cube logo
MG.url(path)               // Base-path-aware URL helper
```

---

### Changelog

#### 2026-05-20
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
