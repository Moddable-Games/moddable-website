# Moddable Games — Automation Routines Design

This file documents the full automation workflow designed for Moddable Games.
It is the recovery document for Claude Desktop sessions — read this at the start of any session
where routine setup or issue workflow is being discussed.

---

## Overview

Three-layer pipeline:

```
Claude Desktop (Mark + Claude)
  → discuss, plan, decide
  → create issues labelled research or discuss
  → optionally add next to set priority
        ↓
Research Routine (automated, triggered by research label)
  → investigates issue, reads codebase, writes findings as issue comment
  → relabels ready if scope is clear
  → relabels needs-decision if blocked on Mark
        ↓
Implementation Routine (automated, triggered by ready label)
  → branches from dev
  → implements per acceptance criteria
  → merges into dev
        ↓
Mark reviews dev periodically → merges to main → deploys
```

---

## Label System

| Label | Meaning | Who applies |
|---|---|---|
| `research` | Needs investigation — research routine picks this up | Claude Desktop or Mark |
| `ready` | Fully scoped, Mark approved — implementation routine picks this up | Research routine or Mark |
| `discuss` | Needs a Desktop conversation before any action | Claude Desktop or Mark |
| `blocked` | Depends on another issue being completed first | Claude Desktop or Mark |
| `needs-decision` | Blocked on a real-world decision only Mark can make | Research routine or Mark |
| `next` | Priority override — routine picks this above all others | Mark |
| `blocker` | Pre-existing label — kept for backward compatibility | Mark |

### Label colours (set manually in GitHub per repo)
| Label | Hex |
|---|---|
| `research` | `#0075ca` |
| `ready` | `#0e8a16` |
| `discuss` | `#e4e669` |
| `blocked` | `#d93f0b` |
| `needs-decision` | `#cc317c` |
| `next` | `#ffffff` |

---

## Branching Strategy

- All repos have a `dev` branch created from `main` on 2026-06-14
- Automated work always branches from `dev` using format: `auto/issue-{repo}-{number}`
  - Example: `auto/issue-chess-101`, `auto/issue-rules-51`
- Implementation routine merges completed branches into `dev`
- Mark reviews `dev` and merges to `main` when ready — `main` = production deploy via GitHub Pages
- Multiple completed issues can accumulate in `dev` before review
- Dependent issues are safe to stack in `dev` — each routine run branches from latest `dev`

---

## Routine Budget

- Claude Pro: 5 routine runs per day
- Two routines share the budget: research + implementation
- No fixed split — Mark decides daily allocation via `next` labels
- If no `next` labels exist, routines self-select by oldest issue (see priority logic below)

---

## Priority Logic

### Both routines follow this order:
1. Pick any issue with `next` label first (Mark's explicit override)
2. If no `next` exists, pick the oldest open issue with the matching label (`research` or `ready`)
3. Skip any issue that also has `blocked` label
4. Skip any issue that also has `needs-decision` label

### `next` label behaviour:
- Optional — Mark only applies it when overriding default order
- Applied per-issue alongside the primary label (e.g. `research` + `next`)
- Remove `next` after the routine has actioned the issue (routine should do this automatically)

---

## Conventions Source

Both routines must fetch `.moddable/conventions.md` from moddable-website at the start of every run:
```
https://raw.githubusercontent.com/Moddable-Games/moddable-website/main/.moddable/conventions.md
```

---

## Routine Prompts

### Status: TO BE WRITTEN
The actual routine prompts for claude.ai/code/routines have not yet been written.
Next Desktop session should pick up from here and write both prompts.

#### Research Routine prompt must include:
- Fetch conventions.md from URL above at start of run
- Scan all 6 repos for open issues labelled `research` (+ optionally `next`)
- Priority logic: next first, then oldest
- Skip blocked/needs-decision
- For each selected issue: read the issue, read relevant files in the repo, research the topic
- Output: post detailed findings as issue comment
- If scope clear → remove `research`, add `ready`
- If Mark decision needed → add `needs-decision`, post comment explaining blocker
- Remove `next` label after actioning
- Never commit to main
- Never include AI co-author lines
- Never mention Claude/AI in any file or commit

#### Implementation Routine prompt must include:
- Fetch conventions.md from URL above at start of run
- Scan all 6 repos for open issues labelled `ready` (+ optionally `next`)
- Priority logic: next first, then oldest
- Skip blocked/needs-decision
- For each selected issue: read the issue + acceptance criteria, read relevant files
- Branch from `dev` using `auto/issue-{repo}-{number}` format
- Implement per acceptance criteria
- Bump version via `bump.sh patch` if cached assets changed
- Merge branch into `dev`
- Close issue with summary comment
- Remove `next` label after actioning
- Never commit to main
- Never include AI co-author lines
- Never mention Claude/AI in any file or commit
- If ambiguous or hits Mark decision: stop, add `needs-decision`, post comment

---

## Current Issue State (as of 2026-06-14)

### Ready (7 issues — implementation routine can action)
| Repo | Issue | Notes |
|---|---|---|
| moddable-chess | #101 | Draughts SVG rendering — unblocks rules#57 |
| moddable-website | #105 | TI4 Faction Designer text positioning |
| dungeon-chess | #44 | Embed mode |
| dungeon-chess | #43 | Extract game data to JSON ⭐ next |
| dungeon-chess | #10 | Deploy/placement UX |
| moddable-decks | #36 | Verify noindex |

### Next labels applied (5 issues)
| Repo | Issue | Label |
|---|---|---|
| moddable-chess | #101 | ready + next |
| moddable-website | #105 | ready + next |
| dungeon-chess | #43 | ready + next |
| moddable-rules | #51 | research + next |
| moddable-rules | #53 | research + next |

### Research (8 issues — research routine can action)
| Repo | Issue | Notes |
|---|---|---|
| moddable-rules | #51 | Mancala + public domain classics ⭐ next |
| moddable-rules | #53 | Carcassonne + Gloomhaven mods ⭐ next |
| moddable-rules | #52 | Ultimate Monopoly mod |
| moddable-website | #103 | Expand MCP tools |
| moddable-website | #100 | TI4 Game Dashboard |
| moddable-chess | #93 | Multiplayer WebSocket |
| moddable-hexmaps | #53 | Interactive sessions |
| moddable-hexmaps | #52 | Fog of war |

### Discuss (17 issues — need Desktop conversation first)
moddable-rules: #51 (relabelled research), #39, #12, #11
moddable-website: #102, #90, #81, #66, #12
moddable-chess: #91, #70, #68, #66, #53
moddable-hexmaps: #25
dungeon-chess: #27, #11, #7, #2, #1

### Needs-decision (15 issues — blocked on Mark)
moddable-rules: #48, #46, #45, #44, #43
moddable-website: #86, #82, #45
moddable-hexmaps: #46
dungeon-chess: #15
moddable-decks: #31, #30, #25, #23, #22

### Blocked (3 issues)
| Repo | Issue | Blocked by |
|---|---|---|
| moddable-rules | #57 | moddable-chess #101 |
| dungeon-chess | #28 | moddable-chess #93 |

---

## Setup Checklist

- [x] Label system designed
- [x] Labels applied to all 50 issues across 6 repos
- [x] `.moddable/conventions.md` created in moddable-website
- [x] `dev` branch created in all 6 repos
- [x] First 5 `next` labels applied
- [ ] Research routine prompt written
- [ ] Implementation routine prompt written
- [ ] Routines set up at claude.ai/code/routines
- [ ] Label colours set manually in GitHub (per repo)
