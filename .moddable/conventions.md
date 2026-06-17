# Moddable Games — Universal Conventions

This file is the authoritative source for all automated routines and Claude Desktop sessions.
Read it in full at the start of every session and routine run. It supersedes any repo-level instructions.

Always fetch this file via the GitHub API — never via raw.githubusercontent.com (cached, unreliable):
- Owner: Moddable-Games
- Repo: moddable-website
- Path: .moddable/conventions.md

---

## Claude Desktop Session Notes

- **MODDABLE-PROJECT.md is read-only** — Claude cannot edit it. It is a project file mounted read-only in the Claude Desktop environment. Never offer to update it.
- **conventions.md and ROUTINES.md are the maintainable files** — all project context that needs to stay current lives here or in ROUTINES.md, both of which Claude can commit to via GitHub MCP.
- **Always fetch via GitHub API** — not raw.githubusercontent.com URLs, which are CDN-cached and may serve stale content.
- **Session start is on-demand** — do not pull all 6 repos' open issues automatically. Fetch ROUTINES.md and conventions.md only, then wait for Mark's instructions. Pull issues only when needed for planning or triage.
- **Mark will report what routines did** — do not attempt to reconstruct overnight activity from closed issue timestamps. Ask if unclear.
- **Timezone:** Mark is based near Manchester, England — timezone is **BST (UTC+1)** in summer, **GMT (UTC+0)** in winter. All routine schedules are set in BST. Claude Desktop does not have a real-time clock and cannot reliably determine the current time or Mark's location (VPN may affect location detection). When reasoning about which routines have run or what time it is, **ask Mark** rather than guessing.

---

## Organisation

- **GitHub org:** https://github.com/Moddable-Games
- **Live platform:** https://moddable.games
- **Entity:** UK-registered 2025, founded Kuala Lumpur 2024
- **Team:** Mark (founder), Kevin Chand (growth/ops), Akmal Fikri (engine/community), Iqbal Ridzuan (lead artist)
- **Discord:** https://discord.com/invite/WXENAywsQb

---

## Business Context

- **Goal:** Raise $250K–$500K from angel/HNW investors via personal network
- **Model:** Equity + per-game royalties (5–15% net revenue, capped at 3×)
- **Licensing:** Rules & mechanics: CC-BY-SA 4.0 / Code: MIT / Art, brand, assets: All Rights Reserved

---

## Three-Layer Architecture

Never conflate these layers:

| Layer | What it is | Examples |
|---|---|---|
| **Games** | Products / revenue | Nukes, Dungeon Chess, Endless Skies, Planet Mongo, Baristasaurus |
| **Engines** | SDKs / moat | Moddable Chess Engine, Moddable Hexmaps |
| **Platform** | Hosting / marketplace / embed API | moddable.games, tools.moddable.games |

Chess is the catalyst product. Nukes is the flagship creative property.

---

## Repos

| Repo | Live URL | Purpose |
|---|---|---|
| moddable-website | https://moddable.games | Marketing site, mod library, tools hub |
| moddable-chess | https://chess.moddable.games | Chess engine — 70+ variants, AI, plugin system |
| moddable-hexmaps | https://hex.moddable.games | Hex map generator for physical tabletop play |
| moddable-rules | https://rules.moddable.games | Canonical rulebook source for all games |
| moddable-decks | https://decks.moddable.games | Investor pitch deck (multi-audience) |
| dungeon-chess | https://dungeon.moddable.games | Digital asymmetric skirmish game |

---

## Local Development

All repos: `/Applications/MAMP/htdocs/MODDABLE/`
MAMP serves on port 80 — no port number in localhost URLs.

---

## Universal Code Conventions

- **Stack:** Native ESM, Vanilla JS, zero dependencies, zero build step
- **No inline styles or scripts** in HTML — external CSS/JS only
- **No drop shadows** anywhere in UI
- **Version system:** `version.txt` + `bump.sh [major|minor|patch]` — always bump before deploying cached-asset changes
- **Deployment:** GitHub Pages, push to main = deploy (push to dev = staging)
- **Branching:** All automated work branches from `dev` using `claude/` prefix, merges back to `dev`. Never commit directly to `main`.

---

## Character Encoding Standards

Two different standards apply depending on file type — never mix them:

### HTML files — use HTML entities
All special characters in `.html` files must use HTML entities:
- Em dash: `&mdash;` (never `—`)
- Middle dot / interpunct: `&middot;` (never `·`)
- Left arrow: `&larr;`
- Right arrow: `&rarr;`
- Ampersand in text: `&amp;`

This is the established pattern across the entire codebase. Routines must preserve this when editing HTML files and must never convert entities to literal UTF-8 characters.

### JSON and JS data files — use literal UTF-8
Data files (`.json`, data arrays in `.js`) store content as plain UTF-8 strings:
- Em dash: `—` (never `\u2014` or `&mdash;`)
- Middle dot: `·` (never `\u00b7` or `&middot;`)
- En dash: `–`
- Curly quotes: `'` `'` `"` `"`

The JS that reads these files and injects into the DOM handles rendering — HTML entities are not needed and should not appear in data files.

### File editing discipline
When making a targeted change to any file, write back only the changed lines. Never reformat, reorder, or re-serialise the rest of the file. A routine fixing one bug should not produce a 400-line diff across unrelated content. If using a JSON parser that changes formatting on write, use string replacement instead to avoid reformatting side effects.

---

## Commit Rules

- **Never** include AI co-author lines in commits
- **Never** mention Claude, Claude Code, or AI in commit messages, public-facing files, issue comments, or pull request descriptions
- **Never** append a generated-by footer or any attribution to pull request descriptions — the final line must be substantive content
- **"Commit" means commit AND push**
- Commit message format: short imperative summary, reference issue number where applicable
- `CLAUDE.md` is gitignored in every repo — never commit it

---

## Design System

### Fonts
| Role | Family |
|---|---|
| Display / headings | Inter Tight 500–700 |
| Body / UI | Inter 400–500 |
| Monospace / stats | JetBrains Mono 400–600 |
| Pixel / eyebrows | Press Start 2P |

### Colour Tokens
| Token | Value | Use |
|---|---|---|
| `red` | `#d11a1a` | Total conversion accent, Nukes |
| `green` | `#3a9928` | Rebalance accent, Mongo, Endless Skies |
| `blue` | `#0c4f8d` | Reskin accent, chess, TI tools |
| `cosmicDeep` | `#0a0d2a` | Hero section backgrounds |
| `cosmicMid` | `#1a3680` | Hero gradient midpoint |
| `cosmicGlow` | `#6fb5ff` | Pixel eyebrow text, horizon glows |
| `canvasLight` | `#f5f4ef` | Warm off-white backgrounds (NOT pure white) |
| `ink` | `#14161c` | Primary text on light |
| `hairlineLight` | `#e6e3d8` | Borders on light backgrounds |

### Engine Themes
- **moddable-chess** — blue theme (`#0c4f8d`)
- **moddable-hexmaps** — green theme (accent `#4cdf7a`, deep `#0a1a0d`)
- Never swap these

### Key Design Rules
- Pill buttons only — `border-radius: 9999px`
- One RGB primary per surface
- `canvasLight (#f5f4ef)`, not pure white, for warm section backgrounds
- Press Start 2P only for eyebrow labels — never body text, never large sizes
- Hex grid SVG overlay on all cosmic/dark hero sections (`hexFloat` keyframe)
- Horizon glow line (1px gradient + radial bloom) on home hero and community band

---

## Issue Workflow Labels

| Label | Meaning |
|---|---|
| `research` | Needs investigation — research routine picks this up |
| `ready` | Fully scoped, Mark has approved — implementation routine picks this up |
| `discuss` | Needs a conversation in Claude Desktop before any action — conversation not yet happened |
| `blocked` | Depends on another issue being completed first — carries only this label while blocked |
| `needs-decision` | Conversation is done; blocked on a real-world decision only Mark can make |
| `waiting` | Blocked on a human action — manual testing, physical work, team review, external dependency. May be split into sub-labels later if volume warrants it. |
| `next` | Priority override — routine picks this above all others |

---

## Routine Behaviour Rules

### All routines
- Fetch this file and ROUTINES.md at the start of every run via GitHub API
- Never commit to `main` — always work on and merge into `dev`
- Never include AI co-author lines
- Never mention Claude, Claude Code, or AI in any file, commit message, issue comment, or pull request description
- Never append a generated-by footer or attribution to pull request descriptions
- Verify facts against authoritative source files before committing
- If a task is ambiguous or hits a decision only Mark can make, add `needs-decision` and post a comment — do not guess
- Skip issues labelled `waiting` — these are blocked on human action, not actionable by routines

### Research routine
- Produces architecture-level design specs, not findings documents — see ROUTINES.md for full standard
- Must identify a consumer before proceeding — no building into a void
- Pre-flight: check dead-ends.md and sources.md before starting any rules research
- If fewer than 2 sources accessible: add `needs-decision`, do NOT add `ready`
- Always remove `next` after actioning

### Implementation routine
- Executes research specs to production quality — see ROUTINES.md for full standard
- Branch from `dev` using format `claude/issue-{repo}-{number}`
- If research spec is thin: relabel `research`, remove `ready`, post comment explaining what's missing
- Bump version via `bump.sh patch` if cached assets changed
- Merge branch into `dev`, close issue, post summary comment
- If blocked mid-implementation: add `needs-decision`, remove `ready`, do not merge

---

## Cross-Repo Dependencies

```
moddable-rules
  └─ build-variants-json.sh → moddable-chess/data/variants.json
  └─ sync-chess-variants.sh → moddable-website/data/chess-variants.json

moddable-chess (MCE)
  └─ pull-mce.sh → dungeon-chess/lib/mce/ (vendored copy)
  └─ mcp/tools.js → moddable-website/workers/mcp/chess-tools.js

moddable-hexmaps
  └─ mcp/tools.js → moddable-website/workers/mcp/hex-tools.js
```

When closing an issue that has downstream dependents, post a comment on the dependent issue noting the blocker is resolved and relabel `ready` if appropriate.
