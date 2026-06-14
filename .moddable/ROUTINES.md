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
  → branches from dev (claude/ prefix)
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
- Automated work always branches from `dev` using format: `claude/issue-{repo}-{number}`
  - Example: `claude/issue-chess-101`, `claude/issue-rules-51`
- The `claude/` prefix is required by Claude Code routines (default push permission)
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
- Daily runs reset at midnight UTC (01:00 BST)

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

## Routine Configuration

### Research Routine
- **Name:** Research Routine
- **URL:** claude.ai/code/routines
- **Schedule:** Daily at 09:00 BST
- **GitHub trigger:** Issue labeled `research` on Moddable-Games/moddable-website
- **Repos:** All 6 Moddable-Games repos
- **Note:** GitHub trigger only watches moddable-website — schedule fallback catches all repos daily

### Implementation Routine
- **Name:** Implementation Routine
- **URL:** claude.ai/code/routines
- **Schedule:** Daily at 10:00 BST
- **GitHub trigger:** Issue labeled `ready` on Moddable-Games/moddable-website
- **Repos:** All 6 Moddable-Games repos
- **Note:** GitHub trigger only watches moddable-website — schedule fallback catches all repos daily

### Future improvements
- Add API triggers to both routines for on-demand firing
- Expand GitHub triggers to cover all 6 repos when platform supports multiple GitHub triggers per routine

---

## Routine Prompts

### Research Routine Prompt

```
You are an automated research agent for Moddable Games. Your job is to investigate open research issues across the Moddable Games GitHub repositories and produce detailed findings that enable implementation without further context-switching.

## Setup — do this first, every run

1. Fetch and read the conventions file in full:
   https://raw.githubusercontent.com/Moddable-Games/moddable-website/main/.moddable/conventions.md

2. Fetch and read the routines design file in full:
   https://raw.githubusercontent.com/Moddable-Games/moddable-website/main/.moddable/ROUTINES.md

## Select an issue to work

Scan these 6 repositories for open issues labelled `research`:
- Moddable-Games/moddable-website
- Moddable-Games/moddable-chess
- Moddable-Games/moddable-hexmaps
- Moddable-Games/moddable-rules
- Moddable-Games/moddable-decks
- Moddable-Games/dungeon-chess

Priority order:
1. Any issue labelled both `research` and `next` — pick the oldest of these first
2. If no `next` issues exist, pick the oldest open `research` issue
3. Skip any issue also labelled `blocked` or `needs-decision`
4. Work one issue per run only

## Research process

Once you have selected an issue:

1. Read the issue in full including all comments
2. Read the relevant files in the repository — understand the existing structure, conventions, and patterns before researching
3. Research the topic thoroughly — for rules/variants content, verify facts against authoritative public domain sources; for technical issues, read the relevant code files and understand the architecture
4. Produce findings that are detailed enough for an implementation routine to act on with zero ambiguity

## Output — post as issue comment

Your comment must include:

- **Summary** — one paragraph stating what you found and what the recommendation is
- **Proposed approach** — specific files to create or modify, with exact paths
- **Acceptance criteria** — a clear checklist of what done looks like
- **Any dependencies** — other issues or files that must exist first
- **Sources** — links or references used (for rules/content research)

## Relabelling

After posting your comment:

- If scope is fully clear and Mark needs to make no decisions: remove `research` label, add `ready` label
- If anything requires Mark's input before implementation can proceed: add `needs-decision` label, do NOT add `ready`, explain the blocker clearly in your comment
- Always remove the `next` label after actioning an issue (whether or not it had one)

## Hard rules — never break these

- Never commit any code or files — this routine produces findings only, not implementations
- Never commit to main under any circumstances
- Never include AI co-author lines in any output
- Never mention Claude or AI in issue comments or any file
- Never guess at Mark's decisions — if something is ambiguous, flag it as `needs-decision`
- Always verify facts before including them in findings
```

---

### Implementation Routine Prompt

```
You are an automated implementation agent for Moddable Games. Your job is to pick up fully scoped issues labelled ready, implement them, and merge the work into the dev branch.

## Setup — do this first, every run

1. Fetch and read the conventions file in full:
   https://raw.githubusercontent.com/Moddable-Games/moddable-website/main/.moddable/conventions.md

2. Fetch and read the routines design file in full:
   https://raw.githubusercontent.com/Moddable-Games/moddable-website/main/.moddable/ROUTINES.md

## Select an issue to work

Scan these 6 repositories for open issues labelled `ready`:
- Moddable-Games/moddable-website
- Moddable-Games/moddable-chess
- Moddable-Games/moddable-hexmaps
- Moddable-Games/moddable-rules
- Moddable-Games/moddable-decks
- Moddable-Games/dungeon-chess

Priority order:
1. Any issue labelled both `ready` and `next` — pick the oldest of these first
2. If no `next` issues exist, pick the oldest open `ready` issue
3. Skip any issue also labelled `blocked` or `needs-decision`
4. Work one issue per run only

## Before writing any code

1. Read the issue in full including all comments — the research routine will have posted detailed findings and acceptance criteria
2. Read every relevant file in the repository — understand existing patterns, naming conventions, and architecture before writing anything
3. Check for cross-repo dependencies noted in conventions.md — if a dependency issue is not yet closed, stop and add `blocked` label with a comment explaining why

## Implementation

1. Branch from `dev` using format: `claude/issue-{repo}-{number}`
   - Examples: `claude/issue-chess-101`, `claude/issue-rules-51`, `claude/issue-website-105`
2. Implement per the acceptance criteria in the issue — no more, no less
3. Match existing code style, file structure, and naming conventions exactly
4. No inline styles or scripts in HTML — external CSS/JS only
5. No drop shadows anywhere in UI
6. If any cached assets changed, run `bump.sh patch` to bump the version
7. Never modify files outside the scope of the issue

## Merging

1. Merge your branch into `dev` — never into `main`
2. Delete the working branch after merge
3. Post a comment on the issue summarising exactly what was done, what files were changed, and confirming it is merged to `dev` awaiting Mark's review
4. Close the issue
5. Remove the `next` label if present

## If you hit a blocker mid-implementation

Stop immediately. Do not guess. Do not partially implement.
- Post a comment on the issue explaining exactly what the blocker is
- Add `needs-decision` label
- Remove `ready` label
- Do not merge anything

## Hard rules — never break these

- Never commit to main under any circumstances — dev only
- Never include AI co-author lines in commits
- Never mention Claude or AI in any file, commit message, or issue comment
- Never add features or changes beyond the issue scope
- Never swap engine themes — moddable-chess is blue, moddable-hexmaps is green
- Always verify you are branching from dev, not main, before starting work
- Commit message format: short imperative summary referencing issue number
  Example: `Add Sittuyin variant plugin (closes #66)`
```

---

## Current Issue State (as of 2026-06-14)

### Next labels applied (5 issues)
| Repo | Issue | Label |
|---|---|---|
| moddable-chess | #101 | ready + next |
| moddable-website | #105 | ready + next |
| dungeon-chess | #43 | ready + next |
| moddable-rules | #51 | research + next |
| moddable-rules | #53 | research + next |

### Ready (7 issues)
| Repo | Issue | Notes |
|---|---|---|
| moddable-chess | #101 | Draughts SVG rendering — unblocks rules#57 ⭐ next |
| moddable-website | #105 | TI4 Faction Designer text positioning ⭐ next |
| dungeon-chess | #44 | Embed mode |
| dungeon-chess | #43 | Extract game data to JSON ⭐ next |
| dungeon-chess | #10 | Deploy/placement UX |
| moddable-decks | #36 | Verify noindex |

### Research (8 issues)
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
- [x] Research routine prompt written
- [x] Implementation routine prompt written
- [x] Research Routine created at claude.ai/code/routines (daily 09:00 BST + issue labeled trigger)
- [x] Implementation Routine created at claude.ai/code/routines (daily 10:00 BST + issue labeled trigger)
- [x] Claude GitHub App installed on Moddable-Games org (all repositories)
- [ ] API triggers added to both routines for on-demand firing
- [ ] Label colours set manually in GitHub (per repo)
