# Moddable Games — Automation Routines Design

This file documents the full automation workflow designed for Moddable Games.
It is the recovery document for Claude Desktop sessions — read this at the start of any session
where routine setup or issue workflow is being discussed.

> **Issue state is always read live from GitHub via MCP — never stored here.**
> At the start of each Desktop session, pull open issues across all 6 repos to get current state.

---

## Overview

Five-run daily pipeline across three token windows — with Triage Time acting as a quality gate:

```
01:00 BST — Research Routine   ► Window 1 opens (rolling 5h, closes ~06:00)
02:00 BST — Implementation     ► Inside Window 1
             [results ready when Mark wakes]
08:00 BST — Triage Time        ► Queue health check — quality gate, label management
             [validates ready issues, sends thin specs back, fills next gaps]
17:00 BST — Research B         ► Window 3 opens (rolling 5h, closes ~22:00)
18:00 BST — Implementation B   ► Inside Window 3
             [7h gap before Window 1 reopens at 01:00 — tokens fully reset]
        ↓
Mark reviews dev periodically → merges to main → deploys
```

**Effective throughput: 2 issue executions per day** — Research and Implementation per window.
Triage is a quality gate, not an execution slot.

Claude Desktop (Mark + Claude) handles planning, issue creation, and decisions between runs.

---

## Issue Priority Framework

When no `next` label is present, routines select issues using this repo priority order:

| Priority | Repo | Rationale |
|---|---|---|
| 1 | moddable-rules | Rules drive everything — engines, website, tools, and community all depend on content |
| 2 | moddable-chess | Engine powering multiple products (chess.moddable.games + dungeon-chess) |
| 2 | moddable-hexmaps | Engine powering multiple products (hex.moddable.games + TI4/Nukes tools) |
| 3 | moddable-website | Business visibility, investor presence, tools hub |
| 4 | dungeon-chess | Revenue product but depends on engines above |
| 4 | moddable-decks | Investor/business material |

Within each repo, oldest open issue first (by created_at).

`next` labels always override this order — they are Mark's explicit priority signal.

---

## Label System

| Label | Meaning | Who applies |
|---|---|---|
| `research` | Needs investigation — research routine picks this up | Claude Desktop or Mark |
| `ready` | Fully scoped, Mark approved — implementation routine picks this up | Research routine or Mark |
| `discuss` | Needs a conversation in Claude Desktop before any action — conversation not yet happened | Claude Desktop or Mark |
| `blocked` | Depends on another issue being completed first — carries only this label while blocked | Claude Desktop or Mark |
| `needs-decision` | Conversation is done; blocked on a real-world action only Mark can take | Research routine or Mark |
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
- Three token windows used across the day:
  - **Window 1** (01:00–06:00 BST): Research Routine + Implementation Routine
  - **Window 2** (08:00 BST): Triage Time — quality gate + label management (no execution)
  - **Window 3** (17:00–22:00 BST): Research B + Implementation B
- 7-hour gap between Window 3 closing (~22:00) and Window 1 reopening (01:00) ensures full token reset
- Mark can adjust `next` labels between 08:00 and 17:00 to influence afternoon/evening runs

---

## Priority Logic

### All routines follow this order:
1. Pick any issue with `next` label first (Mark's explicit override or triage assignment)
2. If no `next` exists, apply the repo priority order above — moddable-rules first, then engines, then business repos
3. Within the same repo, pick the oldest open issue first (by created_at)
4. Skip any issue that also has `blocked` label
5. Skip any issue that also has `needs-decision` label
6. If nothing actionable exists, exit gracefully with a log note — do not force work

### `next` label behaviour:
- Applied by Triage Time at 08:00, or manually by Mark at any time
- Applied per-issue alongside the primary label (e.g. `research` + `next`)
- Removed by research/implementation routines after actioning an issue
- Triage NEVER removes existing `next` labels — it only adds new ones to fill gaps
- Triage NEVER applies `next` to an issue that failed its quality gate

---

## Routine Files

Each routine has its own instruction file. Routines fetch their file directly — no manual prompt updates needed.

| Routine | File |
|---|---|
| Research Routine + Research B | `.moddable/routines/research.md` |
| Implementation Routine + Implementation B | `.moddable/routines/implementation.md` |
| Triage Time | `.moddable/routines/triage.md` |

### Claude Code stub prompts (what's in the Claude Code routine field)

All five routines use a minimal stub that fetches conventions.md and the relevant routine file. The stubs should never need updating — all changes go into the routine files above.

---

## Memory Files

These files provide persistent memory across sessions and routine runs. Read all of them at the start of every Desktop session.

| File | Purpose | Written by |
|---|---|---|
| `.moddable/session-log.md` | Desktop session summaries — decisions, reasoning, context that doesn't belong in conventions | Desktop sessions |
| `.moddable/pipeline-log.md` | Routine run quality assessments — what ran, how well, what was sent back and why | Triage Time |

### Desktop session start — mandatory fetch list

At the start of every Desktop session, fetch and read in full via GitHub API:
1. Owner: Moddable-Games / Repo: moddable-website / Path: .moddable/conventions.md
2. Owner: Moddable-Games / Repo: moddable-website / Path: .moddable/ROUTINES.md
3. Owner: Moddable-Games / Repo: moddable-website / Path: .moddable/session-log.md
4. Owner: Moddable-Games / Repo: moddable-website / Path: .moddable/pipeline-log.md

Then pull open issues across all 6 repos.

---

## Conventions Source

All routines fetch `.moddable/conventions.md` from moddable-website at the start of every run.
All routine files also reference conventions.md — it defines the project standards that apply to everything.

---

## Rules Research Sources

For any research involving moddable-rules content, the research routine fetches via GitHub API:

**Dead ends registry** (sources and games ruled out — do not re-attempt):
- Owner: Moddable-Games / Repo: moddable-rules / Path: .moddable/dead-ends.md

**Sources registry** (verified accessible sources by game family):
- Owner: Moddable-Games / Repo: moddable-rules / Path: .moddable/sources.md

Rules research hard constraints:
- Only public domain game families — no modern commercial games
- Must successfully fetch and verify at least 2 independent sources
- If fewer than 2 sources accessible: label `needs-decision`, do not label `ready`
- Transcribe from source only — never generate or extrapolate rules content
- Add any newly discovered reliable sources to sources.md as part of the research comment

---

## Routine Configuration

### Research Routine
- **Name:** Research Routine
- **Schedule:** Daily at 01:00 BST
- **GitHub trigger:** None — removed 2026-06-17 (budget conservation; webhook double-fired with Research B)
- **API fire URL:** https://api.anthropic.com/v1/claude_code/routines/trig_01LnV8dQzRy1R35j2kP5iBq7/fire
- **Repos:** All 6 Moddable-Games repos

### Implementation Routine
- **Name:** Implementation Routine
- **Schedule:** Daily at 02:00 BST
- **GitHub trigger:** None — removed 2026-06-17 (budget conservation; webhook double-fired with Implementation B)
- **API fire URL:** https://api.anthropic.com/v1/claude_code/routines/trig_01JQPz1wg2R3jbJuDYC5iJBi/fire
- **Repos:** All 6 Moddable-Games repos

### Triage Time
- **Name:** Triage Time
- **Schedule:** Daily at 08:00 BST
- **GitHub trigger:** None (schedule only)
- **API fire URL:** https://api.anthropic.com/v1/claude_code/routines/trig_01SFuiAPF4vEb6coS4ais6z6/fire
- **Repos:** All 6 Moddable-Games repos
- **Purpose:** Quality gate and queue health check — not an execution slot

### Research B
- **Name:** Research B
- **Schedule:** Daily at 17:00 BST
- **GitHub trigger:** None — removed 2026-06-17 (budget conservation)
- **API fire URL:** https://api.anthropic.com/v1/claude_code/routines/trig_01RbRYDhjcJv255kW35V24Wu/fire
- **Repos:** All 6 Moddable-Games repos

### Implementation B
- **Name:** Implementation B
- **Schedule:** Daily at 18:00 BST
- **GitHub trigger:** None — removed 2026-06-17 (budget conservation)
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
- All GitHub triggers removed 2026-06-17 — on a 5-run/day budget, webhooks caused double-firing that consumed runs outside the intended schedule windows
- Reinstate when daily run limit increases or a use case emerges that scheduled runs can't cover
- The API fire URLs remain available for on-demand manual triggering

---

## Shared Standards Preamble

The following standards are embedded in conventions.md and apply to all routines. Reproduced here for reference.

- **The quality bar:** Every piece of work should be indistinguishable from what a senior developer would produce in a focused Claude Code session with full context. Closing an issue is not success. Producing genuinely usable, integrated, production-quality output is success.
- **No building into a void:** Never implement without an identified consumer whose requirements are understood.
- **Cross-repo by default:** Every issue exists within a system of six repos. Read relevant files across every affected repo before designing or building anything.
- **Never build narrow:** The issue description is the starting point, not the full scope.
- **The pipeline exists for a reason:** Research produces architecture. Implementation executes architecture.
- **Dev is a review gate:** All work merges to `dev`. Mark reviews before anything reaches `main`.
- **Never mention Claude, Claude Code, or AI** in any file, commit, issue comment, or pull request description.
- **Never append a footer or attribution** to any comment — the final line must be substantive content.

---

## Research Routine — North Star Example

This is the reference for what a good research run looks like. When evaluating whether a routine run met the standard, compare it to this.

**Issue:** moddable-rules#52 — Research: Ultimate Monopoly as community mod
**Date:** 2026-06-16 (Desktop session, not a routine run)

### What happened

1. **Read widely first.** Fetched dead-ends.md, sources.md, the news post index, the moddable-rules repo structure, and an existing game entry (draughts) to understand conventions before touching anything.

2. **Dead end confirmed immediately.** Two independent grounds: (a) Monopoly is a modern commercial game family — categorically excluded from moddable-rules scope; (b) Jon Izaak's fan compilation has no open licence — he explicitly disclaimed authorship of text drawn from four proprietary rulebooks. No ambiguity, no hedging.

3. **dead-ends.md updated immediately.** Both the Ultimate Monopoly entry and a Monopoly family scope exclusion note committed without waiting for confirmation. A confirmed dead end belongs in dead-ends.md.

4. **Open alternative identified without being asked.** The news post `monopolising-modified-variations/` confirmed Moddable Games had already written about Monopoly. The Landlord's Game — Monopoly's public domain precursor, 1904 patent expired 1921 — was the obvious pivot. Two sources verified accessible: Google Patents (full rules text) and Wikipedia (detailed article).

5. **New research issue created immediately.** moddable-rules#65 — The Landlord's Game rulebook entry — created with `research` + `next` labels, full context, verified source URLs, scope defined, consumer identified, notes on what to transcribe and what to avoid.

6. **Original issue closed as not planned.** Comment explains what was a dead end and why, what alternative was identified, what new issue was created. No questions asked. No footer.

### What made it good

- The queue was left in better shape than it was found — one dead end removed, one better issue added
- No questions asked of Mark — everything within routine authority was acted on
- News post context used to strengthen the case for the alternative — cross-repo awareness applied to content, not just code
- dead-ends.md updated as part of the run, not deferred
- No signature, attribution, or generated-by footer on any comment

### What the previous routine run did instead (the before)

The same issue had been picked up by a scheduled Research B run the previous day. That run:
- Confirmed the dead end correctly
- Proposed a dead-ends.md entry but did not commit it
- Asked Mark three questions before closing
- Left the queue empty
- Appended a "Generated by Claude Code" footer to both comments

Same information, completely different outcome. The difference is acting vs deferring.

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
- [x] Research Routine created at claude.ai/code/routines (01:00 BST)
- [x] Implementation Routine created at claude.ai/code/routines (02:00 BST)
- [x] Triage Time created at claude.ai/code/routines (08:00 BST)
- [x] Research B created at claude.ai/code/routines (17:00 BST)
- [x] Implementation B created at claude.ai/code/routines (18:00 BST)
- [x] API fire URLs documented for all 5 routines
- [x] Claude GitHub App installed on Moddable-Games org (all repositories)
- [x] Label colours set in GitHub (per repo)
- [x] Dead ends registry created (moddable-rules/.moddable/dead-ends.md)
- [x] Sources registry created (moddable-rules/.moddable/sources.md)
- [x] Routine prompts overhauled — quality gate standard, architecture-level research, production-quality implementation, triage as queue health (2026-06-16)
- [x] Individual routine files created: .moddable/routines/research.md, implementation.md, triage.md (2026-06-16)
- [x] ROUTINES.md stripped to design document only — prompts moved to individual files (2026-06-16)
- [x] North star example added — rules#52 / rules#65 dead end pivot (2026-06-16)
- [x] GitHub triggers removed from all 4 routines — budget conservation (2026-06-17)
- [x] Session log and pipeline log created — persistent memory across sessions and runs (2026-06-17)
- [ ] Update Claude Code stub prompts to point to individual routine files (test one run first)
- [ ] Reinstate GitHub triggers when daily run limit increases
