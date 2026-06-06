/* =========================================================================
   Moddable.Games — Mod Page Content (single source of truth)
   Extends window.MG with MOD_PAGES lookup used by mg-mod-page.js
   ========================================================================= */

(function() {
  window.MG.MOD_PAGES = {

    'turkish-draughts': {
      accent: 'green',
      heroTitle: 'Turkish <em>Draughts</em>.',
      lede: 'Orthogonal draughts on an 8x8 board. Mandatory captures with majority rule, immediate piece removal, and flying kings. World Championships held annually since 2014.',
      buttons: [['Source (Wikipedia)', 'https://en.wikipedia.org/wiki/Turkish_draughts', 'primary'], ['Play Online', 'https://www.playok.com/en/turkish-draughts/', 'outline-dark']],
      stats: [['Players','2'],['Time','30 min'],['Age','8+'],['Source','Wikipedia'],['License','CC-BY-SA']],
      sections: [
        { id:'1', title:'Board and setup', body:"Played on an 8x8 mono-coloured board (not checkered). All 64 squares are used. Each player begins with 16 men arranged in two rows: White on rows 2 and 3, Black on rows 6 and 7. The back rows (1 and 8) are left vacant. White moves first." },
        { id:'2', title:'Men movement', body:"Men move orthogonally (straight forwards or sideways) by one square. Men cannot move backwards. Men cannot move diagonally. Only forward and sideways movement is permitted." },
        { id:'3', title:'Capturing', body:"Captures are made by jumping over an adjacent opponent piece to a vacant square beyond. Jumping is mandatory: if a capture is available, it must be taken. Men can only capture forwards or sideways, never backwards or diagonally." },
        { id:'4', title:'Majority rule', body:"When multiple capture sequences are available, the player must choose the sequence that captures the most pieces. If two or more sequences capture the same maximum number of pieces, the player may freely choose between them. There is no distinction between kings and men when counting: each piece counts as one." },
        { id:'5', title:'Immediate removal', body:"Captured pieces are removed from the board immediately after being jumped, not at the end of the sequence. This means that during a multi-capture sequence, a square vacated by an earlier capture in the same sequence becomes available for the capturing piece to pass through again." },
        { id:'6', title:'King promotion', body:"When a man reaches the opponent's back row (row 8 for White, row 1 for Black), it is promoted to a king. Note: the source does not specify whether promotion occurs immediately during a multi-capture sequence or only after the sequence completes." },
        { id:'7', title:'King movement', body:"Kings move any number of empty squares orthogonally in all four directions: forwards, backwards, and sideways. Kings capture by jumping over a single opponent piece that is any number of empty squares away, landing on any open square beyond the captured piece along the same straight line." },
        { id:'8', title:'King capture restriction', body:"During a multi-capture sequence, a king is not allowed to turn 180 degrees between two consecutive captures. It must change direction (turn 90 degrees) or continue forward." },
        { id:'9', title:'Winning', body:"A player wins when their opponent has no legal move available. This occurs either because all opponent pieces have been captured, or because all remaining opponent pieces are completely blocked from moving." },
        { id:'10', title:'Draws', body:"A king versus a single man results in a draw. This convention prevents indefinite play where the lone man cannot be cornered by the king." }
      ],
      notes: [
        { title:'Key differences from English draughts', body:"Movement is orthogonal (forwards and sideways), not diagonal. All 64 squares are used, not just 32 dark squares. Each player starts with 16 pieces instead of 12. Captured pieces are removed immediately during a multi-capture sequence, not after it completes. The majority capture rule requires taking the longest available sequence. Kings move any number of squares (flying kings) rather than one square at a time. The game has a much lower draw rate than English or international draughts." },
        { title:'Related variants', body:"Armenian Draughts (Tama): adds one-square diagonal forward movement for men; kings move in all 8 directions like a chess queen, though captures remain orthogonal only. Keny: adds backward capture and allows jumping over friendly pieces without removing them. Croda (Ljuban Dedic): replaces sideways movement with diagonal forward; fills back ranks; delays piece removal until the turn ends. Dameo (Christian Freeling): removes sideways movement; adds linear group movement; uses 18 pieces in a trapezoid starting formation. World Championships have been held annually since 2014 (Izmir, Doha)." }
      ],
      componentsHeading: 'At a glance.',
      components: [
        { kind:'Required', list:['8x8 board (all 64 squares used)','16 white pieces','16 dark pieces','Flat discs that stack for kings'] },
        { kind:'Setup', list:['White fills rows 2 and 3','Black fills rows 6 and 7','Back rows (1 and 8) start empty','White moves first'] },
        { kind:'Win condition', list:['Capture all opponent pieces','Or block all opponent moves','King vs single man is a draw'] }
      ],
    },

    'toroidal-go': {
      accent: 'blue',
      heroTitle: 'Toroidal <em>Go</em>.',
      lede: 'Standard Go played on a board where all edges wrap around. No corners, no edges, no joseki. Every point has exactly four neighbours. Active tournament community with 1,400+ recorded games since 2012.',
      buttons: [['Source (Sensei\'s Library)', 'https://senseis.xmp.net/?ToroidalGo', 'primary'], ['Editor and Viewer', 'https://goplayerjuggler.github.io/goVariants/tGoEditor.html', 'outline-dark']],
      stats: [['Players','2'],['Time','45 min'],['Board','11x11'],['Source','Sensei\'s Library'],['License','OPL 1.0']],
      sections: [
        { id:'1', title:'The board', body:"Toroidal Go is played on a grid where the edges wrap around horizontally and vertically. Each point on the far left is linked to the point on the same horizontal line on the far right. Each point on the top is linked to the corresponding point on the bottom. The result: every point on the board has exactly four neighbours. There are no edges, no corners. The surface is topologically a torus (doughnut shape). The standard size is 11x11, though 9x9 through 25x25 are also played." },
        { id:'2', title:'Placement', body:"Two players (Black and White) alternate turns, starting with Black. On each turn, a player places one stone of their colour on an empty point. A player may also pass instead of placing a stone. Stones do not move once placed unless captured." },
        { id:'3', title:'Liberties and capture', body:"An empty point adjacent to a stone is called a liberty. Adjacent stones of the same colour form a group (string) and share liberties. If a group has no liberties remaining (all adjacent points are occupied by the opponent), it is captured and removed from the board. A stone may be placed on a point with no liberties if doing so captures opponent stones, restoring liberties after removal." },
        { id:'4', title:'Ko rule', body:"A player may not make a move that returns the board to a previous position. In the most common case (simple ko): if one player captures a single stone, the opponent cannot immediately recapture that same stone. They must play elsewhere first. This prevents infinite loops of single-stone captures." },
        { id:'5', title:'Suicide', body:"Under most rulesets (Japanese, Chinese, AGA), a move that would leave your own stone or group with zero liberties without capturing any opponent stones is forbidden. Some rulesets (New Zealand, Ing) allow suicide, but it is rarely advantageous." },
        { id:'6', title:'Scoring', body:"The game ends when both players pass consecutively. Under area scoring (Chinese rules, most common for toroidal play): your score equals the number of your stones on the board plus the number of empty points surrounded only by your stones. Under territory scoring (Japanese rules): your score equals the empty points you surround minus your captured stones. The player with the higher score wins." },
        { id:'7', title:'Komi', body:"White receives 4.5 points of compensation (komi) for moving second on an 11x11 toroidal board. The half-point prevents draws. This value is specific to 11x11 as used on LittleGolem; other board sizes may use different komi." },
        { id:'8', title:'Toroidal strategy', body:"With no corners or edges, all groups are floating from the opening move. Corner joseki (standard sequences) do not exist. Making two eyes to live is harder because there are no natural safe structures at board edges. A primary strategy is to split the opponent into two separate eyeless groups and then attack one of them. Territorial frameworks must be small on 11x11; forcing the opponent into thin shape is key." },
        { id:'9', title:'Wraparound visualisation', body:"To aid reading, most software adds 3-4 extra lines around the main grid as duplicate representations of the opposite edges. These wraparound lines are shown in a different background colour. On a physical 19x19 board, 11x11 toroidal Go can be played using the inner 11x11 area (corners at 5-5 points) with the outer 4 lines serving as wraparound." },
        { id:'10', title:'Tournament history', body:"On LittleGolem, an ongoing ladder tournament has 21 players. A previous tournament ran from 2012 to 2020: 129 players, 1,497 games, 138 rounds, average 76 moves per game. The European Go Congress has hosted toroidal Go tournaments, most recently in 2023. Torigo.io hosts weekly sessions on Thursdays from 6pm Paris time." }
      ],
      notes: [
        { title:'Key differences from standard Go', body:"No edges or corners exist. The board wraps in both directions, so every point has exactly 4 neighbours (standard boards have points with 2, 3, or 4 neighbours depending on position). Corner joseki, edge territory, and side frameworks do not apply. All groups float without natural anchoring points. Making two eyes to ensure life is harder without edge structures. Komi is 4.5 on 11x11 (compared to 6.5 or 7.5 on standard 19x19). The game is shorter on average: 76 moves per game on 11x11 versus 200+ on 19x19." },
        { title:'Life and death on a torus', body:"In standard Go, groups can live by forming two eyes or by exploiting edge and corner geometry. On a torus, there are no edges to anchor territory. Two-eye life still works but is harder to achieve because the opponent can approach from all directions without restriction. Seki (mutual life) and capturing races become more common. Splitting the opponent into disconnected groups is the primary attacking strategy." }
      ],
      componentsHeading: 'At a glance.',
      components: [
        { kind:'Board', list:['11x11 grid (standard size)','Edges wrap horizontally','Edges wrap vertically','Every point has 4 neighbours'] },
        { kind:'Pieces', list:['Black and white stones','Standard Go set works','No special equipment needed'] },
        { kind:'Win condition', list:['Control the most territory','Area scoring (Chinese rules)','4.5 komi for White','Game ends on two passes'] }
      ],
    },

    'lasca': {
      accent: 'red',
      heroTitle: '<em>Lasca</em>.',
      lede: 'Column checkers by World Chess Champion Emanuel Lasker (1911). Captured pieces stack beneath the captor. All 22 pieces remain in play for the entire game. Columns change hands as their top piece is taken.',
      buttons: [['Source (Wikipedia)', 'https://en.wikipedia.org/wiki/Lasca', 'primary'], ['Lasker\'s Original Rules', 'https://web.archive.org/web/2023/https://pjb.com.au/laska/laskers_rules.html', 'outline-dark']],
      stats: [['Players','2'],['Time','30 min'],['Age','10+'],['Source','Wikipedia + Lasker 1911'],['License','CC-BY-SA']],
      sections: [
        { id:'1', title:'Board and setup', body:"Played on a 7x7 board using only the 25 diagonal squares (like draughts). Each player starts with 11 pieces: White occupies all 11 squares on rows 1, 2, and 3. Black occupies all 11 squares on rows 5, 6, and 7. The three middle-row squares (row 4) start empty. White moves first." },
        { id:'2', title:'Soldiers and officers', body:"Unpromoted pieces are called soldiers. They move and capture diagonally forward only, one square at a time. When a soldier reaches the opponent's back row, it is promoted to an officer. Officers move and capture diagonally in any direction (forward or backward), one square at a time." },
        { id:'3', title:'Column formation', body:"When a piece jumps an opponent's piece, the captured piece is NOT removed from the board. Instead, it is placed underneath the capturing piece, forming a column. A column is controlled by the player whose piece is on top. The column moves according to the top piece's rank: a soldier-led column moves forward only; an officer-led column moves in any direction." },
        { id:'4', title:'Capturing a column', body:"When you jump over a column, you take ONLY the top piece. That top piece goes under your jumping piece or column. The remaining column stays in place, now controlled by whatever piece is next from the top. This means capturing an opponent's column can liberate your own buried pieces." },
        { id:'5', title:'Multi-jump sequences', body:"Multi-jumps are permitted and mandatory if available. If after landing from a jump another capture is possible, the player must continue jumping. If multiple capture sequences are available, the player has a free choice (no majority rule). A piece may not jump the same column twice in one sequence." },
        { id:'6', title:'Promotion during multi-jump', body:"If a soldier reaches the opponent's back row during a multi-jump sequence, the sequence ends there. The soldier is promoted to an officer. However, if a column led by an officer passes through the promotion row during a multi-jump, the sequence continues (officers are not affected by passing through the back row)." },
        { id:'7', title:'The 22-piece invariant', body:"Pieces are never removed from the game. All 22 pieces remain on the board at all times, either as individual pieces or stacked within columns. Captures change a piece's position (into a column) but never eliminate it. This is the fundamental difference from all other draughts variants." },
        { id:'8', title:'Officer retention', body:"Officers retain their rank permanently, even when buried inside a column. If an officer is captured and placed beneath an opponent's piece, it remains an officer. When that column is later captured and the officer is liberated (returned to the top), it immediately functions as an officer again." },
        { id:'9', title:'Mandatory capture', body:"Capturing is compulsory: if a capture is available, it must be taken. There is no huffing (the old draughts rule of removing a piece that fails to capture). If a player overlooks a capture, the opponent should require them to take it." },
        { id:'10', title:'Winning', body:"A player wins when their opponent cannot make any legal move. This occurs either because all opponent pieces are buried inside columns controlled by the other player, or because all opponent-controlled pieces are completely blocked. There are no formal draw rules in the original game." }
      ],
      notes: [
        { title:'Key differences from English draughts', body:"7x7 board with 25 squares instead of 8x8 with 32. Eleven pieces per player instead of twelve. Captured pieces are never removed; they stack beneath the captor forming columns. All 22 pieces stay in play for the entire game. Ownership of columns shifts as top pieces are captured. No majority capture rule (free choice among captures). Officers move one square only (no flying kings)." },
        { title:'Column tactics', body:"A column with multiple same-colour pieces on top is strong (multiple captures needed to change ownership). A column whose second piece is a different colour from the top is weak (one capture flips control). Building tall columns of your own colour creates threats that require multiple moves to dismantle. Liberating buried officers by capturing the piece above them is a key tactical motif." }
      ],
      componentsHeading: 'At a glance.',
      components: [
        { kind:'Required', list:['7x7 board (25 diagonal squares)','11 white pieces','11 dark pieces','Stackable flat discs'] },
        { kind:'Setup', list:['White fills rows 1, 2, and 3','Black fills rows 5, 6, and 7','Row 4 (middle) starts empty','White moves first'] },
        { kind:'Win condition', list:['Opponent has no legal moves','All opponent pieces buried','Or all opponent pieces blocked'] }
      ],
    },

    'phantom-go': {
      accent: 'blue',
      heroTitle: 'Phantom <em>Go</em>.',
      lede: 'Fog-of-war Go. Players cannot see opponent stones. A referee mediates all moves, announcing only captures and atari. Deduction and memory replace visual reading.',
      buttons: [['Source (Sensei\'s Library)', 'https://senseis.xmp.net/?PhantomGo', 'primary'], ['Editor and Viewer', 'https://goplayerjuggler.github.io/goVariants/tGoEditor.html', 'outline-dark']],
      stats: [['Players','2 + referee'],['Time','30 min'],['Board','9x9 or 13x13'],['Source','Sensei\'s Library'],['License','OPL 1.0']],
      sections: [
        { id:'1', title:'Concept', body:"Phantom Go is a variant of Go for two players and a referee. The players only see their own stones but do not know where the opponent has played. The referee sees the moves of both players and ensures that only legal moves are made." },
        { id:'2', title:'Equipment and setup', body:"Three boards are needed: one for each player and one for the referee. Players sit back-to-back so neither can see the other's board. The referee stands between them with the master board showing all stones. Each of the three needs a table with a board, stones, and bowls. Phantom Go is usually played on a 9x9 or 13x13 board." },
        { id:'3', title:'Turn structure', body:"To make a move, a player places a stone on their own board. The referee checks whether the move is legal on the master board. If legal, the referee copies it to the master board and announces the result to both players. Then it is the other player's turn." },
        { id:'4', title:'Illegal moves', body:"If a player attempts an illegal move (placing on an occupied intersection, suicide, or recapturing a ko), it remains their turn and they may try another move. Under Common Rules, the referee says only 'Illegal move' without stating why. Under Hamburg Rules, the referee states the reason: 'There is already an opponent's stone', 'There is already an own stone', 'Suicide', or 'The ko cannot be captured back immediately'." },
        { id:'5', title:'Capture announcements', body:"Under Common Rules: when a capture occurs, the referee announces 'Black/White has captured the following stones' and points out exactly which stones were captured to both players. Under Hamburg Rules: the referee optionally announces the number of stones captured but does NOT say which stones were captured." },
        { id:'6', title:'Atari announcements', body:"Under Common Rules: the referee announces atari only if the stones were not already in atari before the move. The referee says 'Black/White puts White/Black into atari' (optionally adding 'and himself'). The referee does NOT say which stones have been put into atari, which are still in atari, or which are no longer in atari." },
        { id:'7', title:'Hidden information', body:"Under Common Rules, the referee does NOT reveal: which stones are in atari, which stones are still in atari, which stones are no longer in atari, or why a move was illegal. Under Hamburg Rules, the referee does NOT reveal: which stones are in atari, how many stones are in atari, which stones are no longer in atari, or which specific stones were captured." },
        { id:'8', title:'Hamburg variant', body:"The Hamburg Rules differ from Common Rules in two key ways. First, the referee reveals why a move is illegal (giving specific reasons) rather than just saying 'Illegal move'. Second, the referee does NOT point out exactly which stones were captured (unlike Common Rules where exact positions are revealed). This creates different deduction dynamics: you learn more from failed moves but less from opponent captures." },
        { id:'9', title:'Scoring and endgame', body:"The source does not explicitly describe endgame procedures. Standard Go scoring presumably applies: the game ends when both players pass consecutively, and territory or area scoring determines the winner. The referee announces passes to both players." },
        { id:'10', title:'Example: snapback', body:"The source provides a worked example of a snapback sequence. B1: 'Black puts a white group into atari.' W2: 'White has played, Black to play.' B3: 'Black captures the stone at a and puts White and himself into atari.' W4: 'White captures the 3 stones at b, c and d.' This illustrates how the referee's announcements reveal limited but critical information about board state." }
      ],
      notes: [
        { title:'Key differences from standard Go', body:"Players cannot see opponent stones on their board. A referee mediates all moves using a third master board. Illegal moves do not end your turn; you retry until a legal move is made. Information about the board state is only revealed through referee announcements (captures, atari). Players must deduce opponent positions from these limited announcements." },
        { title:'Strategy implications', body:"Players must mentally track opponent stone positions based solely on referee announcements. Illegal move attempts inadvertently reveal information (under Hamburg Rules, you learn whether an occupied intersection has your own or your opponent's stone). Capture announcements reveal exact positions (Common Rules) or only counts (Hamburg Rules), creating different deduction opportunities. Memory and deduction replace visual reading as core skills." }
      ],
      componentsHeading: 'At a glance.',
      components: [
        { kind:'Required', list:['Three Go boards (9x9 or 13x13)','Three sets of black and white stones','Three tables, three chairs','One referee'] },
        { kind:'Setup', list:['Players sit back-to-back','Referee stands between them','Each person has their own board','Referee board shows all stones'] },
        { kind:'Win condition', list:['Standard Go scoring applies','Game ends on two passes','Area or territory counting','Referee reveals final position'] }
      ],
    }

  };
})();
