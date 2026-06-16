# Moddable Rules — Content Inventory

This file is the single source of truth for what exists, what's queued, and what's ruled out in moddable-rules.

**Maintained by:** Triage routine (updates after each run) + Desktop sessions
**Routines must read this file** before creating any research issue or starting any research task, to avoid duplicating work already done or in progress.

> Cross-reference with `.moddable/dead-ends.md` for ruled-out sources and games.

---

## How to read this file

| Status | Meaning |
|---|---|
| ✅ Live | File exists in `games/*/content/variants/` — do not re-research |
| 🔧 Queued | Open research issue exists — do not create a duplicate issue |
| ❌ Dead end | Ruled out — see dead-ends.md for reason |
| — Not started | No issue, no file — fair game to issue or pick up as fallback work |

---

## Chess family

**Family status:** Live at `games/moddable-chess/`

> Chess variants are managed directly in moddable-chess repo. Cross-reference moddable-chess open issues for variant gaps. When the research queue is empty, audit moddable-chess variants against moddable-rules entries and pick the next unresearched variant from the candidate pool below.

### Candidate pool (not started)

All public domain. Pick in order when queue is empty.

| Variant | Notes |
|---|---|
| Makruk | Thai Chess — widely played, well documented |
| Sittuyin | Burmese Chess — close to Makruk |
| Shatranj | Medieval Arabic Chess — ancestor of modern chess |
| Courier Chess | Medieval German variant on 12×8 board |
| Chaturanga | Ancient Indian ancestor of chess |
| Gothic Chess | Modern variant, 10×8, Archbishop + Chancellor pieces |
| Grand Chess | Christian Freeling 1984, freely released |
| Omega Chess | 10×10 with Champions and Wizards |
| Capablanca Chess | 10×8 with Archbishop + Chancellor |
| Atomic Chess | Captures cause explosions |
| Horde Chess | Asymmetric — white has 36 pawns |
| Racing Kings | Race to back rank, no checks |
| Three-Check Chess | Win by checking 3 times |
| King of the Hill | Win by reaching centre |

---

## Draughts / Checkers family

**Family status:** Live at `games/draughts/`

### Live variants
| Variant | File |
|---|---|
| Alquerque | `variants/alquerque.md` |
| Bashni | `variants/bashni.md` |
| Brazilian Draughts | `variants/brazilian.md` |
| Canadian Draughts | `variants/canadian.md` |
| Czech Draughts | `variants/czech.md` |
| English Draughts | `variants/english.md` |
| Frisian Draughts | `variants/frisian.md` |
| International Draughts | `variants/international.md` |
| Italian Draughts | `variants/italian.md` |
| Lasca | `variants/lasca.md` |
| Pool Checkers | `variants/pool.md` |
| Russian Draughts | `variants/russian.md` |
| Spanish Draughts | `variants/spanish.md` |
| Thai Draughts | `variants/thai.md` |
| Turkish Draughts | `variants/turkish-draughts.md` |

### Queued variants
| Variant | Issue |
|---|---|
| German Draughts | #69 |
| Dameo | #69 |
| Spantsiretti | #69 |
| Ghanaian Draughts | #69 |
| Diagonal Draughts | #69 |

### Candidate pool (not started)

All public domain. Pick in order when queue is empty.

| Variant | Notes |
|---|---|
| Kˆlnisch Damespiel | German regional variant |
| Croda | Sardinian variant |
| Dama | Italian/Turkish hybrid |
| Filipino Draughts | Orthogonal movement variant |
| Suicide Draughts | Forced-capture variant, must lose all pieces |
| Checkers (Portuguese) | Specific Portuguese regional rules |

---

## Go family

**Family status:** Live at `games/go/`

### Live variants
| Variant | File |
|---|---|
| Standard Go | `variants/standard.md` |
| 9×9 Go | `variants/9x9.md` |
| 13×13 Go | `variants/13x13.md` |
| Capture Go | `variants/capture-go.md` |
| One Colour Go | `variants/one-colour.md` |
| Phantom Go | `variants/phantom-go.md` |
| Rengo | `variants/rengo.md` |
| Stoical Go | `variants/stoical.md` |
| Sunjang Baduk | `variants/sunjang.md` |
| Tibetan Go | `variants/tibetan.md` |
| Toroidal Go | `variants/toroidal-go.md` |

### Queued variants
| Variant | Issue |
|---|---|
| Gomoku | #70 |
| Renju | #70 |
| Pente | #70 (licence TBC) |
| Quantum Go | #70 |

### Candidate pool (not started)

All public domain unless noted. Pick in order when queue is empty.

| Variant | Notes |
|---|---|
| 19×19 Tournament Go | Standard competitive size — surprisingly not yet live |
| Atari Go | Beginner variant — first capture wins |
| No-Pass Go | Players must play if any legal move exists |
| Blind Go | Players cannot see opponent's stones |
| Progressive Go | Each turn player places one more stone than previous |
| Baduk Blitz | Korean speed Go rules |

---

## Mancala family

**Family status:** Live at `games/mancala/` (partial — needs audit)

> Audit required: list live variants and identify gaps. Add to candidate pool once audited.

---

## Morris family

**Family status:** Live at `games/morris/` (partial — needs audit)

> Audit required: list live variants and identify gaps. Add to candidate pool once audited.

---

## Backgammon family

**Family status:** Live at `games/backgammon/` (partial — needs audit)

> Audit required: list live variants and identify gaps. Add to candidate pool once audited.

---

## Royal Game of Ur

**Family status:** Live at `games/royal-ur/` (partial — needs audit)

---

## New game families — queued

| Game | Issue | Notes |
|---|---|---|
| The Landlord's Game | #65 | Public domain 1904 patent; Monopoly precursor |
| Colony | #64 | Open-licensed hex resource game; Catan alternative |
| Pachisi | #66 | Ancestor of Ludo, Sorry, Trouble |
| Halma / Stern-Halma | #67 | Ancestor of Chinese Checkers |
| Reversi | #68 | Public domain basis of Othello |

---

## New game families — not yet issued

Known viable candidates with no open issue yet. All Tier 1 public domain.

| Game | Notes |
|---|---|
| Shogi | Q3 2026 priority; MCE drop + promotion needed |
| Xiangqi | Q3 2026 priority; MCE terrain constraints needed; mentioned across multiple projects |
| Nine Men's Morris | Q3 2026; MCE mill detection needed |
| Crokinole | 1876 patent, long expired |
| Hex | 1942 Piet Hein; rules public domain |

---

## Game families — dead ends

See `.moddable/dead-ends.md` for full details.

| Game | Reason |
|---|---|
| Monopoly (all editions) | Commercial trademark, Hasbro |
| Ultimate Monopoly (jonizaak) | Fan compilation of proprietary text |
| Anti-Monopoly | Commercially published (University Games) |
| Catan | Commercial, Kosmos/Asmodee |

---

## Last updated

2026-06-16 — candidate pools added for Chess, Draughts, Go families.
Next update: Triage routine 08:00 BST 2026-06-17.
