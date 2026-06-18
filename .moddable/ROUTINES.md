# Moddable Games — Automation Routines

This file documents the automation setup for Moddable Games. It is the recovery document for Desktop sessions — read this at session start alongside conventions.md, session-log.md, and pipeline-log.md.

> **Issue state is always read live from GitHub — never stored here.**

---

## The Team

Claude manages two automated team members. They report to Claude, not directly to Mark. Their job is to do the groundwork while everyone is sleeping so Claude can brief Mark confidently at the start of every Desktop session.

### Researcher
Fires when a `research` label is added to any issue across the 6 repos. Reads widely, finds sources, writes architecture-level specs, embeds source content. Reports back to Claude via pipeline-log.md.

Researcher rarely produces a `ready` issue on its own — external web sources are blocked from the cloud runner. Its output is a complete spec with whatever source content it could find via GitHub API, plus a clear note to Claude on what Desktop needs to complete before the issue can be `ready`.

**Routine file:** `.moddable/routines/researcher.md`

### Builder
Fires when a `ready` label is added to any issue across the 6 repos. That label means Claude has reviewed the spec and signed off. Builder executes to production quality, merges to dev, reports back to Claude via pipeline-log.md.

Builder's output should be something Claude can present to Mark without caveats. No follow-up commits. No apologies.

**Routine file:** `.moddable/routines/builder.md`

---

## How the pipeline works

```
[Issue created with research label]
  → Researcher fires
    → Posts spec, embeds sources, writes to pipeline-log.md
      → Claude reads pipeline-log.md at session start
        → Desktop completes source gaps, labels issue ready
          → Builder fires
            → Builds, merges to dev, writes to pipeline-log.md
              → Claude reads pipeline-log.md at session start
                → Briefs Mark, reviews dev, merges to main when ready
```

Desktop (Claude + Mark) handles: source completion, design decisions, `needs-decision` resolution, issue creation, `ready` labelling, and final review before main.

---

## Triggers

| Routine | Trigger | Repos watched |
|---|---|---|
| Researcher | `research` label added to any issue | All 6 Moddable-Games repos |
| Builder | `ready` label added to any issue | All 6 Moddable-Games repos |

No schedules. Routines fire when the pipeline produces the signal they're waiting for. The pipeline moves when Claude or Mark applies a label from Desktop.

### On concurrent triggers

If multiple `research` or `ready` labels are applied in quick succession (e.g. during a label cleanup), each trigger fires independently. Each routine works one issue per run. If the same routine fires twice simultaneously, the second run will find no new actionable issue and exit gracefully. This is safe.

### Manual firing

Both routines can be fired manually via API using the fire-routine.sh script. Use this when a trigger was missed or a run needs to be forced outside normal label flow.

---

## Label System

| Label | Meaning | Who applies |
|---|---|---|
| `research` | Needs a spec — Researcher fires | Claude or Mark |
| `ready` | Spec complete, sources embedded, approved — Builder fires | Claude (after Desktop session completes spec) |
| `discuss` | Needs a Desktop conversation before anything can happen | Claude or Mark |
| `blocked` | Depends on another issue being completed first | Claude or Mark |
| `needs-decision` | Blocked on a real-world decision only Mark can make | Researcher or Claude |
| `waiting` | Blocked on a human action — routines skip these | Claude or Mark |
| `next` | Priority override — Builder picks this above all others when multiple ready issues exist | Mark or Claude |

### Label colours (managed via .moddable/scripts/set-label-colours.sh)

| Label | Hex |
|---|---|
| `research` | `#0075ca` |
| `ready` | `#0e8a16` |
| `discuss` | `#e4e669` |
| `blocked` | `#d93f0b` |
| `needs-decision` | `#cc317c` |
| `waiting` | `#bfd4f2` |
| `next` | `#ffffff` |

---

## Issue Priority Framework

When multiple `ready` issues exist, Builder uses this order:

| Priority | Repo | Rationale |
|---|---|---|
| 1 | moddable-rules | Rules drive everything — engines, website, tools, and community all depend on content |
| 2 | moddable-chess | Engine powering multiple products |
| 2 | moddable-hexmaps | Engine powering multiple products |
| 3 | moddable-website | Business visibility, investor presence, tools hub |
| 4 | dungeon-chess | Revenue product but depends on engines above |
| 4 | moddable-decks | Investor/business material |

`next` label always overrides repo priority. Within the same repo, oldest open issue first (by created_at).

---

## Branching Strategy

- All repos have a `dev` branch
- Automated work always branches from `dev` using format: `claude/issue-{repo}-{number}`
- Builder merges completed branches into `dev`
- Mark reviews `dev` and merges to `main` — `main` = production deploy via GitHub Pages
- Multiple completed issues can accumulate in `dev` before review

---

## Memory Files

Read all of these at the start of every Desktop session.

| File | Purpose | Written by |
|---|---|---|
| `.moddable/session-log.md` | Desktop session summaries — decisions, reasoning, context | Desktop sessions |
| `.moddable/pipeline-log.md` | Team run reports — what Researcher found, what Builder built, what needs Claude's attention | Researcher and Builder |

pipeline-log.md is how the team reports back to Claude. It is the first thing Claude reads to understand what happened since the last session.

---

## Desktop Session Start — Mandatory Fetch List

At the start of every Desktop session, fetch and read in full:
1. Owner: Moddable-Games / Repo: moddable-website / Path: .moddable/conventions.md
2. Owner: Moddable-Games / Repo: moddable-website / Path: .moddable/ROUTINES.md
3. Owner: Moddable-Games / Repo: moddable-website / Path: .moddable/session-log.md
4. Owner: Moddable-Games / Repo: moddable-website / Path: .moddable/pipeline-log.md

Then pull open issues across all 6 repos.

---

## Rules Research Sources

For moddable-rules content, Researcher also fetches:
- Owner: Moddable-Games / Repo: moddable-rules / Path: .moddable/dead-ends.md
- Owner: Moddable-Games / Repo: moddable-rules / Path: .moddable/sources.md
- Owner: Moddable-Games / Repo: moddable-rules / Path: .moddable/inventory.md

Rules research hard constraints:
- Public domain game families only — no modern commercial games
- Transcribe from source only — never generate or extrapolate rules content
- At least 2 independent sources verified and content embedded before `ready`
- If fewer than 2 sources accessible from cloud runner: `needs-decision`, not `ready`

---

## Local Scripts

| Script | Purpose | Credentials needed |
|---|---|---|
| `set-label-colours.sh` | Create/update label colours across all 6 repos | GitHub personal access token |
| `fire-routine.sh` | Manually fire Researcher or Builder via API | Anthropic API key |

Scripts live in `.moddable/scripts/` (token-redacted). Copy to local machine and add credentials before running.

---

## Routine Configuration

### Researcher
- **Trigger:** `research` label added to any issue in any of the 6 repos
- **Repos:** All 6 Moddable-Games repos
- **File:** `.moddable/routines/researcher.md`

### Builder
- **Trigger:** `ready` label added to any issue in any of the 6 repos
- **Repos:** All 6 Moddable-Games repos
- **File:** `.moddable/routines/builder.md`

---

## North Star Example — What Good Research Looks Like

**Issue:** moddable-rules#52 — Research: Ultimate Monopoly as community mod

1. Read widely first — dead-ends.md, sources.md, news post index, existing game entries
2. Dead end confirmed on two independent grounds — commercial game, no open licence
3. dead-ends.md updated immediately — confirmed dead ends belong there
4. Public domain precursor identified without being asked — The Landlord's Game, 1904 patent expired 1921
5. New research issue created — moddable-rules#65, full context, verified sources, scope defined
6. Original issue closed as not planned — clear comment, no questions asked, no footer

What made it good: the queue was left in better shape than it was found. One dead end removed, one better issue added. No questions asked of Mark. No footer.

---

## Shared Standards

These apply to both routines. Full detail in conventions.md.

- Every piece of work should be indistinguishable from what a senior developer would produce in a focused session with full context
- Never build without an identified consumer
- Read relevant files across every affected repo before designing or building anything
- All work merges to `dev` — Mark reviews before anything reaches `main`
- Never mention Claude, Claude Code, or AI in any file, commit, issue comment, or PR description
- Never append a footer or attribution to any comment — the final line must be substantive content

---

## Setup Checklist

- [x] Label system designed and applied across all 6 repos
- [x] `dev` branch created in all 6 repos
- [x] conventions.md created in moddable-website
- [x] Dead ends registry created (moddable-rules/.moddable/dead-ends.md)
- [x] Sources registry created (moddable-rules/.moddable/sources.md)
- [x] session-log.md and pipeline-log.md created
- [x] set-label-colours.sh and fire-routine.sh backed up to .moddable/scripts/
- [x] `waiting` label added across all 6 repos
- [x] Old 5-routine setup removed (2026-06-18)
- [x] Researcher routine file created (.moddable/routines/researcher.md) (2026-06-18)
- [x] Builder routine file created (.moddable/routines/builder.md) (2026-06-18)
- [x] ROUTINES.md rewritten for new 2-routine trigger-based model (2026-06-18)
- [ ] Researcher routine created in Claude Code with `research` label trigger
- [ ] Builder routine created in Claude Code with `ready` label trigger
- [ ] First end-to-end test — label an issue `research`, verify Researcher fires and reports to pipeline-log.md
- [ ] First build test — label an issue `ready`, verify Builder fires and merges to dev
