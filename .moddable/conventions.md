# Moddable Games — Universal Conventions

This file is the authoritative source for all automated routines (research and implementation).
Read it in full at the start of every routine run. It supersedes any repo-level instructions.

---

## Organisation

- **GitHub org:** https://github.com/Moddable-Games
- **Live platform:** https://moddable.games
- **Entity:** UK-registered 2025, founded Kuala Lumpur 2024
- **Team:** Mark (founder), Kevin Chand (growth/ops), Akmal Fikri (engine/community), Iqbal Ridzuan (lead artist)

---

## Three-Layer Architecture

Never conflate these layers:

| Layer | What it is | Examples |
|---|---|---|
| **Games** | Products / revenue | Nukes, Dungeon Chess, Endless Skies, Planet Mongo, Baristasaurus |
| **Engines** | SDKs / moat | Moddable Chess Engine, Moddable Hexmaps |
| **Platform** | Hosting / marketplace / embed API | moddable.games, tools.moddable.games |

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

## Universal Code Conventions

- **Stack:** Native ESM, Vanilla JS, zero dependencies, zero build step
- **No inline styles or scripts** in HTML — external CSS/JS only
- **No drop shadows** anywhere in UI
- **Version system:** `version.txt` + `bump.sh [major|minor|patch]` — always bump before deploying cached-asset changes
- **Deployment:** GitHub Pages, push to main = deploy (push to dev = staging)
- **Branching:** All automated work branches from `dev` using `claude/` prefix, merges back to `dev`. Never commit directly to `main`.

---

## Commit Rules

- **Never** include AI co-author lines in commits
- **Never** mention Claude or AI in commit messages or public-facing files
- **"Commit" means commit AND push**
- Commit message format: short imperative summary, reference issue number where applicable (e.g. `Add Sittuyin variant plugin (closes #66)`)
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
| `discuss` | Needs a conversation in Claude Desktop before any action |
| `blocked` | Depends on another issue being completed first |
| `needs-decision` | Blocked on a real-world decision only Mark can make |
| `next` | Optional override — routine prioritises this above all others |

---

## Routine Behaviour Rules

### Both routines
- Fetch this file at the start of every run
- Never commit to `main` — always work on and merge into `dev`
- Never include AI co-author lines
- Never mention Claude or AI in any file or commit message
- Verify facts against authoritative source files before committing
- If a task is ambiguous or hits a decision only Mark can make, add `needs-decision` label and post a comment explaining what is needed — do not guess

### Research routine
- Triggered by `research` label
- If a `next` label exists on any `research` issue, pick that first
- Otherwise pick the oldest open `research` issue with no `blocked` label
- Output: post findings as a detailed issue comment
- If scope is clear and no decisions needed: relabel issue `ready`, remove `research`
- If a Mark decision is needed: add `needs-decision`, post comment explaining the blocker

### Implementation routine
- Triggered by `ready` label
- If a `next` label exists on any `ready` issue, pick that first
- Otherwise pick the oldest open `ready` issue with no `blocked` label
- Branch from `dev` using format `claude/issue-{repo}-{number}` (e.g. `claude/issue-chess-101`)
- Implement per acceptance criteria in the issue
- Bump version via `bump.sh patch` before pushing if cached assets changed
- Merge branch into `dev` on completion
- Close the issue with a comment summarising what was done

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

When closing an issue that has downstream dependents, post a comment on the dependent issue noting the blocker is resolved and relabel it `ready` if appropriate.
