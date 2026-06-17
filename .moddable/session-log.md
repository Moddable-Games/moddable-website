# Moddable Games — Session Log

This file records Desktop session summaries for continuity between sessions. Each entry captures decisions made, reasoning behind them, and anything that would take time to re-establish in a fresh session. It is not a transcript — only what matters for the next session.

Read this at the start of every Desktop session after conventions.md and ROUTINES.md.

---

## 2026-06-17 — Mark + Claude (continued, afternoon)

### Routine activity today

- Research Routine fired manually ~10:16 BST — picked up rules#65 (Landlord's Game). Produced a complete architecture spec but couldn't verify external sources (all 403 from cloud runner). Correctly labelled `needs-decision`. Good structural output, wrong label outcome — Desktop finished the job.
- Triage ran 08:05 and 09:17 (both failed on PushNotification tool). Despite failures, 08:05 run completed all phases successfully — labelled hexmaps#59 `discuss`, applied `next` to rules#64 (Colony) and rules#66 (Pachisi). Both `next` labels removed later as incorrect given queue state changes.
- rules#65 completed by Desktop: sources verified via GitHub API (hoelzl/L3), full source content embedded across 4 comments, architecture spec expanded to 6-variant hub, relabelled `ready` + `next`.

### Key decisions made

**Rules transcription standard overhauled**
Research routine was marking issues `needs-decision` when external sources were blocked, leaving them incomplete for Desktop to finish. Two problems identified: (1) routine wasn't trying GitHub API search first, (2) even when it produced a spec, source content wasn't embedded so implementation would hit the same 403 walls. Fixed in research.md: GitHub search strategy added as primary source path; hard rule added that rules transcription issues are never `ready` until source content is fully embedded. Triage.md updated with content completeness gate.

**Catan → Harvesters**
rules#64 (Colony) was incorrectly closed as a dead end. The error was treating "no existing open ruleset" as a dead end — completely wrong for an open source board game company. Moddable Games can create original games. rules#64 reopened, renamed to "Design: Harvesters", reframed as an original Moddable Games hex farming game.

**Dead end pivot procedure updated in research.md**
New priority order: (1) public domain precursor, (2) open equivalent, (3) create original Moddable Games version, (4) true dead end. Option 3 was entirely missing before. Hard rule added: never close an issue simply because no existing open ruleset exists.

**Moddable Games open source identity**
The site and decks undersell the open source identity — it's framed as a feature, not a founding claim. Two issues created:
- moddable-website#112 (`research`) — verify and strengthen "possibly the world's first open source board game company" claim across homepage and about page
- moddable-decks#41 (`discuss`) — position open source identity as core investor differentiator in pitch deck

**Harvesters design brief (rules#64)**
First design session for Harvesters. Key decisions:
- Name confirmed: Harvesters (clean on BGG, strong historical resonance — Bruegel 1565)
- Core principle: simpler than Catan, not more complex. Base game = one sheet of rules, playable with Catan box
- Solves Catan's biggest flaw: dice dominance replaced by dice pool allocation
- Dice pool mechanic: roll your personal pool, allocate results to your own hexes (you decide where effort goes, not random number generation)
- Dice pool grows with farm development (2→5 dice) — pool size = farm productive capacity
- Push-your-luck: reroll unallocated dice at a cost (TBD)
- Pastoral vs arable specialisation emerges from terrain placement naturally
- Shared failure state + individual win condition
- Advanced mechanics (seasons, weather track, Common Land, hex exhaustion) deferred to expansions

**What's still needed for Harvesters before `ready`:**
One more Desktop session to nail:
- Exact dice pool growth triggers
- 7/robber replacement mechanic
- Trading rules (simplified)
- Win condition numbers and triggers
- Shared failure state (lightweight)
- Turn structure written step by step
- Player count and target duration
Once answered: Desktop writes full architecture spec, labels `ready`, implementation routine builds it. Research routine never touches this issue.

### Pipeline improvements made today

- research.md: GitHub search strategy, content embedding standard, hub scope requirement, dead end pivot procedure rewritten with 4-step priority including original game creation
- triage.md: content completeness gate for moddable-rules, fix attempt check, regression risk check
- dead-ends.md: Catan added, cloud runner blocking notes, all external sources documented
- ROUTINES.md: scripts section added, waiting label documented, checklist updated
- session-log.md and pipeline-log.md created
- set-label-colours.sh and fire-routine.sh backed up to .moddable/scripts/
- `waiting` label created across all 6 repos (#bfd4f2)

### Current queue state (end of afternoon session)
- rules#65 — `ready` + `next` — Landlord's Game, fully self-contained, 6 variants, all source content embedded
- rules#64 — `discuss` — Harvesters design, needs one more Desktop session
- rules#66–70 — `research` — Pachisi, Halma, Reversi, Draughts variants, Go variants (all need GitHub search for sources)
- chess#104 — `research` — Chess960 castling bug, reverted fix attempt documented
- moddable-website#112 — `research` — open source identity claim
- moddable-decks#41 — `discuss` — open source investor positioning (depends on #112)

### For next session
1. **MCP server in Docker** — fire_routine, set_label, list_labels tools. Most important infrastructure item.
2. **Harvesters design session** — finish the open mechanics questions, write the spec, label `ready`
3. **Review tonight's routine runs** — first real test of overhauled research.md and triage.md
4. **moddable-website#112** — verify "world's first open source board game company" claim, draft copy

---

## 2026-06-17 — Mark + Claude (morning)

### Context
First session after the routine pipeline had been running for a few days. Focus was on diagnosing why routines didn't fire as expected overnight, and improving the pipeline's self-awareness going forward.

### What happened overnight (16 Jun)
- Research Routine ran 03:02 (scheduled, ~2hr late) — queue was empty at that point, rules#65 and the batch of new research issues (66–70, 71) weren't created until 19:30–19:45
- Implementation Routine ran 04:02 (scheduled) — built `js/svg-renderer.js` in moddable-chess, closing chess#101. Good output.
- Triage ran 08:05 (scheduled) — applied a `ready` label to something, which triggered both implementation webhook triggers simultaneously
- Implementation Routine + Implementation B both fired at 08:08 via webhook — double-firing on the same issue (website#86, remove placeholder Nukes mods). Both PRs (#110, #111) merged to dev. Harmless duplicate but two runs wasted.
- Research B ran 17:02 (scheduled) — queue still empty at that point
- Implementation B ran 18:04 (scheduled)
- Result: 7 runs consumed against a 5/day budget. Today's overnight runs (01:00, 02:00) didn't fire — budget exhausted.

### Decisions made

**Webhooks removed from all 4 routines**
Root cause of the double-fire: both Implementation Routine and Implementation B had "issue labeled" webhook triggers on moddable-website. Triage applied a `ready` label at 08:05 and both fired simultaneously. With only 5 runs/day, webhook triggers are a liability — they can exhaust the budget before the scheduled windows. Removed from all 4 routines. ROUTINES.md updated.

**PR footer ban added explicitly to conventions.md**
PRs #102, #110, #111 all had `_Generated by Claude Code_` footers — pre-conventions-update artefacts. Ban added to both Commit Rules and Routine Behaviour Rules sections.

**Character encoding standards added to conventions.md**
HTML files use HTML entities; JSON/JS data files use literal UTF-8. File editing discipline rule added: write back only changed lines, never reformat unrelated content.

**Session log, pipeline log, script backups, waiting label** — all created this morning (see afternoon entry for full details).

### Pending (carried to afternoon)
- Manual fire Research + Implementation after token reset
- First real test of routine loop tonight
