# Moddable Games — Automation Routines Design

This file documents the full automation workflow designed for Moddable Games.
It is the recovery document for Claude Desktop sessions — read this at the start of any session
where routine setup or issue workflow is being discussed.

> **Issue state is always read live from GitHub via MCP — never stored here.**
> At the start of each Desktop session, pull open issues across all 6 repos to get current state.

---

## Overview

Five-run daily pipeline across three token windows:

```
03:00 BST — Research Routine   ► Window 1 opens (rolling 5h, closes ~08:00)
04:00 BST — Implementation     ► Inside Window 1
             [results ready when Mark wakes]
08:00 BST — Triage Time        ► Window 2 opens (cheap — label management only)
             [Mark reviews overnight work, can adjust next labels before afternoon]
17:00 BST — Research B         ► Window 3 opens (rolling 5h, closes ~22:00)
18:00 BST — Implementation B   ► Inside Window 3
             [7h gap before Window 1 reopens at 03:00 — tokens fully reset]
        ↓
Mark reviews dev periodically → merges to main → deploys
```

Claude Desktop (Mark + Claude) handles planning, issue creation, and decisions between runs.

---

## Label System

| Label | Meaning | Who applies |
|---|---|---|
| `research` | Needs investigation — research routine picks this up | Claude Desktop or Mark |
| `ready` | Fully scoped, Mark approved — implementation routine picks this up | Research routine or Mark |
| `discuss` | Needs a Desktop conversation before any action | Claude Desktop or Mark |
| `blocked` | Depends on another issue being completed first | Claude Desktop or Mark |
| `needs-decision` | Blocked on a real-world decision only Mark can make | Research routine or Mark |
| `next` | Priority override — routine picks this above all others | Mark or Triage routine |
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
- Token window: rolling 5 hours from first activity after reset (resets 00:00 UTC / 01:00 BST)
- Three token windows are used across the day:
  - **Window 1** (03:00–08:00 BST): Research Routine + Implementation Routine
  - **Window 2** (08:00 BST): Triage Time only — cheap, barely uses allowance
  - **Window 3** (17:00–22:00 BST): Research B + Implementation B
- 7-hour gap between Window 3 closing (~22:00) and Window 1 reopening (03:00) ensures full token reset
- Mark can adjust `next` labels between 08:00 and 17:00 to influence afternoon/evening runs

### Handling imbalanced queues

When the triage routine runs, it checks the ratio of open `research` vs `ready` issues:
- If both exist: apply `next` to 1 of each — balanced split across the two pairs
- If only `research` exists: apply `next` to 2 `research` issues — both pairs do research
- If only `ready` exists: apply `next` to 2 `ready` issues — both pairs do implementation
- If one queue has 1 issue and the other has 0: apply `next` to that 1 issue only
- If both queues are empty: do nothing, log that no work is available

This ensures all 5 runs are used whenever work is available in either queue.

---

## Priority Logic

### All routines follow this order:
1. Pick any issue with `next` label first (Mark's explicit override or triage assignment)
2. If no `next` exists, pick the oldest open issue with the matching label (`research` or `ready`)
3. Skip any issue that also has `blocked` label
4. Skip any issue that also has `needs-decision` label
5. If nothing actionable exists, exit gracefully with a log note — do not force work

### `next` label behaviour:
- Applied by Triage Time at 08:00, or manually by Mark at any time
- Applied per-issue alongside the primary label (e.g. `research` + `next`)
- Removed by research/implementation routines after actioning an issue
- Triage NEVER removes existing `next` labels — it only adds new ones to fill gaps

---

## Conventions Source

All routines must fetch `.moddable/conventions.md` from moddable-website at the start of every run:
```
https://raw.githubusercontent.com/Moddable-Games/moddable-website/main/.moddable/conventions.md
```

---

## Routine Configuration

### Research Routine
- **Name:** Research Routine
- **Schedule:** Daily at 03:00 BST
- **GitHub trigger:** Issue labeled `research` on Moddable-Games/moddable-website
- **API fire URL:** https://api.anthropic.com/v1/claude_code/routines/trig_01LnV8dQzRy1R35j2kP5iBq7/fire
- **Repos:** All 6 Moddable-Games repos

### Implementation Routine
- **Name:** Implementation Routine
- **Schedule:** Daily at 04:00 BST
- **GitHub trigger:** Issue labeled `ready` on Moddable-Games/moddable-website
- **API fire URL:** https://api.anthropic.com/v1/claude_code/routines/trig_01JQPz1wg2R3jbJuDYC5iJBi/fire
- **Repos:** All 6 Moddable-Games repos

### Triage Time
- **Name:** Triage Time
- **Schedule:** Daily at 08:00 BST
- **GitHub trigger:** None (schedule only)
- **API fire URL:** https://api.anthropic.com/v1/claude_code/routines/trig_01SFuiAPF4vEb6coS4ais6z6/fire
- **Repos:** All 6 Moddable-Games repos
- **Purpose:** Count existing `next` labels, fill gaps up to 2 total — one research, one ready where possible

### Research B
- **Name:** Research B
- **Schedule:** Daily at 17:00 BST
- **GitHub trigger:** None (schedule only — triage handles priority)
- **API fire URL:** https://api.anthropic.com/v1/claude_code/routines/trig_01RbRYDhjcJv255kW35V24Wu/fire
- **Repos:** All 6 Moddable-Games repos

### Implementation B
- **Name:** Implementation B
- **Schedule:** Daily at 18:00 BST
- **GitHub trigger:** None (schedule only — triage handles priority)
- **API fire URL:** https://api.anthropic.com/v1/claude_code/routines/trig_0125Lpb7ewAMDrMusVjJZKqW/fire
- **Repos:** All 6 Moddable-Games repos

### All API fire URLs — quick reference
| Routine | API fire URL |
|---|---|
| Research Routine | https://api.anthropic.com/v1/claude_code/routines/trig_01LnV8dQzRy1R35j2kP5iBq7/fire |
| Implementation Routine | https://api.anthropic.com/v1/claude_code/routines/trig_01JQPz1wg2R3jbJuDYC5iJBi/fire |
| Triage Time | https://api.anthropic.com/v1/claude_code/routines/trig_01SFuiAPF4vEb6coS4ais6z6/fire |
| Research B | https://api.anthropic.com/v1/claude_code/routines/trig_01RbRYDhjcJv255kW35V24Wu/fire |
| Implementation B | https://api.anthropic.com/v1/claude_code/routines/trig_0125Lpb7ewAMDrMusVjJZKqW/fire |

### Notes on GitHub triggers
- GitHub triggers currently only watch moddable-website — scheduled runs catch all repos
- Expand triggers to all 6 repos when the platform supports multiple GitHub triggers per routine
- Research Routine and Implementation Routine retain GitHub triggers as on-demand fallback during the day

---

## Routine Prompts

### Triage Time Prompt

```
You are an automated triage agent for Moddable Games. Your job is to ensure the issue queue always has the right `next` labels set so that the research and implementation routines pick up the highest-priority work.

## Setup — do this first, every run

1. Fetch and read the conventions file in full:
   https://raw.githubusercontent.com/Moddable-Games/moddable-website/main/.moddable/conventions.md

2. Fetch and read the routines design file in full:
   https://raw.githubusercontent.com/Moddable-Games/moddable-website/main/.moddable/ROUTINES.md

## Triage process

1. Scan all 6 repositories for open issues:
   - Moddable-Games/moddable-website
   - Moddable-Games/moddable-chess
   - Moddable-Games/moddable-hexmaps
   - Moddable-Games/moddable-rules
   - Moddable-Games/moddable-decks
   - Moddable-Games/dungeon-chess

2. Count existing `next` labels already on open issues — split by type:
   - How many open `research` + `next` issues exist?
   - How many open `ready` + `next` issues exist?

   IMPORTANT: Do NOT remove any existing `next` labels. Mark may have set them
   intentionally. Only add new `next` labels where gaps exist.

3. Determine how many `next` labels need to be added:
   - Target: 1 `next` on a `research` issue + 1 `next` on a `ready` issue
   - If a `research` + `next` already exists: do not add another research `next`
   - If a `ready` + `next` already exists: do not add another ready `next`
   - Only add where the slot is empty

4. Fill gaps according to this logic:
   - If `research` slot is empty and actionable `research` issues exist:
     apply `next` to the oldest open `research` issue (not `blocked`, not `needs-decision`)
   - If `ready` slot is empty and actionable `ready` issues exist:
     apply `next` to the oldest open `ready` issue (not `blocked`, not `needs-decision`)
   - If both slots are already filled: do nothing
   - If a queue is empty and the other has 2+ issues: apply a second `next` to that queue

5. Selection priority within each queue:
   - Oldest open issue first (by created_at)
   - Skip any issue labelled `blocked` or `needs-decision`
   - Prefer issues that unblock downstream dependencies

## Hard rules — never break these

- Never remove existing `next` labels — only add them
- Never commit any code or files
- Never close, modify body, or comment on issues — only add the `next` label
- Never apply `next` to issues labelled `blocked`, `needs-decision`, or `discuss`
- Never mention Claude or AI in any output
```

---

### Research Routine Prompt

(Used by both Research Routine and Research B — identical prompt)

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
4. If no actionable `research` issues exist, exit gracefully — do not force work
5. Work one issue per run only

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

(Used by both Implementation Routine and Implementation B — identical prompt)

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
4. If no actionable `ready` issues exist, exit gracefully — do not force work
5. Work one issue per run only

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

## Setup Checklist

- [x] Label system designed
- [x] Labels applied to all issues across 6 repos
- [x] `.moddable/conventions.md` created in moddable-website
- [x] `dev` branch created in all 6 repos
- [x] `next` labels applied to priority issues
- [x] Research routine prompt written
- [x] Implementation routine prompt written
- [x] Triage routine prompt written
- [x] Research Routine created at claude.ai/code/routines (03:00 BST + issue labeled trigger)
- [x] Implementation Routine created at claude.ai/code/routines (04:00 BST + issue labeled trigger)
- [x] Triage Time created at claude.ai/code/routines (08:00 BST)
- [x] Research B created at claude.ai/code/routines (17:00 BST)
- [x] Implementation B created at claude.ai/code/routines (18:00 BST)
- [x] API fire URLs documented for all 5 routines
- [x] Claude GitHub App installed on Moddable-Games org (all repositories)
- [x] Label colours set in GitHub (per repo)
- [ ] Expand GitHub triggers to cover all 6 repos
