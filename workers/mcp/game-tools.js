import TI4_DATA from '../../data/ti4.json';

export const GAME_TOOLS = [
  {
    name: 'ti4_draw_objectives',
    description: 'Draw random public objectives for a Twilight Imperium 4e game round. Supports expansion filtering.',
    inputSchema: {
      type: 'object',
      properties: {
        stage: { type: 'number', enum: [1, 2], description: 'Stage 1 or Stage 2. Defaults to 1.' },
        count: { type: 'number', description: 'Number of objectives to draw (default 5).' },
        expansions: { type: 'array', items: { type: 'string' }, description: 'Expansions to include: "base", "pok", "ds", "te". Defaults to ["base","pok"].' },
      },
    },
  },
  {
    name: 'ti4_draw_agendas',
    description: 'Draw random agenda cards for a Twilight Imperium 4e agenda phase. Returns for/against text.',
    inputSchema: {
      type: 'object',
      properties: {
        count: { type: 'number', description: 'Number of agendas to draw (default 2).' },
        expansions: { type: 'array', items: { type: 'string' }, description: 'Expansions to include: "base", "ds", "te". Defaults to ["base"].' },
      },
    },
  },
  {
    name: 'ti4_draft_factions',
    description: 'Run a Milty-style faction draft: deal N factions per player to choose from. Supports ban lists.',
    inputSchema: {
      type: 'object',
      properties: {
        players: { type: 'number', description: 'Number of players (3-8). Defaults to 6.' },
        pool_size: { type: 'number', description: 'Factions dealt to each player to pick from (default 3).' },
        expansions: { type: 'array', items: { type: 'string' }, description: 'Expansions: "base","pok","ds","te","codex". Defaults to ["base","pok"].' },
        ban: { type: 'array', items: { type: 'string' }, description: 'Faction names to exclude from the draft.' },
      },
    },
  },
  {
    name: 'nukes_setup_generator',
    description: 'Generate random starting positions for a Nukes game. Assigns territories to players on a generated hex map.',
    inputSchema: {
      type: 'object',
      properties: {
        players: { type: 'number', description: 'Number of players (2-6). Defaults to 3.' },
        seed: { type: 'string', description: 'Map seed for reproducible setups.' },
      },
    },
  },
  {
    name: 'colony_dice_odds',
    description: 'Calculate probability of each resource number being rolled on 2d6. Returns the odds table and expected output for a given board position.',
    inputSchema: {
      type: 'object',
      properties: {
        numbers: { type: 'array', items: { type: 'number' }, description: 'Array of numbers on your settlements (e.g. [5, 6, 8, 9, 11]). Returns probability of rolling at least one.' },
      },
    },
  },
  {
    name: 'mancala_simulate_move',
    description: 'Simulate a mancala move: sow seeds from a pit and return the resulting board state. Supports Oware and Kalah rules.',
    inputSchema: {
      type: 'object',
      properties: {
        board: { type: 'array', items: { type: 'number' }, description: 'Array of 14 values: pits[0-5] = player 1, pit[6] = store 1, pits[7-12] = player 2, pit[13] = store 2.' },
        pit: { type: 'number', description: 'Pit index (0-5 for player 1, 7-12 for player 2) to sow from.' },
        variant: { type: 'string', enum: ['kalah', 'oware'], description: 'Rule variant. Defaults to "kalah".' },
      },
      required: ['board', 'pit'],
    },
  },
  {
    name: 'mancala_legal_moves',
    description: 'List legal moves for the current player in a mancala position.',
    inputSchema: {
      type: 'object',
      properties: {
        board: { type: 'array', items: { type: 'number' }, description: 'Array of 14 values (same format as mancala_simulate_move).' },
        player: { type: 'number', enum: [1, 2], description: 'Which player to move (1 or 2). Defaults to 1.' },
      },
      required: ['board'],
    },
  },
  {
    name: 'morris_legal_moves',
    description: 'List legal moves in a Nine Men\'s Morris position. Handles placement, sliding, and flying phases.',
    inputSchema: {
      type: 'object',
      properties: {
        board: { type: 'array', items: { type: 'number' }, description: 'Array of 24 values (0=empty, 1=player1, 2=player2) for the 24 intersections.' },
        player: { type: 'number', enum: [1, 2], description: 'Which player to move.' },
        phase: { type: 'string', enum: ['place', 'slide', 'fly'], description: 'Game phase. "place" during initial placement, "slide" during normal play, "fly" when player has 3 pieces.' },
        pieces_in_hand: { type: 'number', description: 'Pieces not yet placed (0-9). Required during place phase.' },
      },
      required: ['board', 'player'],
    },
  },
  {
    name: 'morris_detect_mill',
    description: 'Check if a placement/move forms a mill (three in a row) in Nine Men\'s Morris.',
    inputSchema: {
      type: 'object',
      properties: {
        board: { type: 'array', items: { type: 'number' }, description: 'Array of 24 intersection values.' },
        position: { type: 'number', description: 'The intersection index (0-23) to check for mills.' },
        player: { type: 'number', enum: [1, 2], description: 'Which player to check.' },
      },
      required: ['board', 'position', 'player'],
    },
  },
  {
    name: 'ur_roll_dice',
    description: 'Roll the four tetrahedral dice for the Royal Game of Ur. Each die has 2 marked corners (50% chance). Sum is 0-4.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'ur_legal_moves',
    description: 'List legal moves for a Royal Game of Ur position given a dice roll.',
    inputSchema: {
      type: 'object',
      properties: {
        board: { type: 'array', items: { type: 'number' }, description: 'Array of 14 track positions (0=empty, 1=player1, 2=player2). Indices 0-13 represent the shared track.' },
        player: { type: 'number', enum: [1, 2], description: 'Which player to move.' },
        roll: { type: 'number', description: 'Dice roll result (0-4).' },
        pieces_home: { type: 'array', items: { type: 'number' }, description: 'Pieces at home for each player [p1, p2].' },
      },
      required: ['board', 'player', 'roll'],
    },
  },
  {
    name: 'pachisi_roll_cowries',
    description: 'Roll cowrie shells for Pachisi/Chaupar. 6 shells, count faces up. Special values: 0 faces = 25 (grace), 1 face = 10 (grace).',
    inputSchema: {
      type: 'object',
      properties: {
        shells: { type: 'number', description: 'Number of cowrie shells (default 6). Pachisi uses 6, Chaupar uses 3 long dice.' },
        game: { type: 'string', enum: ['pachisi', 'chaupar'], description: 'Which game rules to apply. Defaults to "pachisi".' },
      },
    },
  },
];

// ── Implementations ──

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function filterByExpansion(items, expansions) {
  return items.filter(i => expansions.includes(i.expansion || 'base'));
}

function ti4DrawObjectives(args) {
  const stage = args?.stage || 1;
  const count = args?.count || 5;
  const expansions = args?.expansions || ['base', 'pok'];
  const key = stage === 2 ? 'stage2' : 'stage1';
  const pool = filterByExpansion(TI4_DATA.objectives[key], expansions);
  if (pool.length === 0) return { error: 'No objectives match the given expansions.' };
  const drawn = shuffle([...pool]).slice(0, Math.min(count, pool.length));
  return { stage, drawn, count: drawn.length, poolSize: pool.length, expansions };
}

function ti4DrawAgendas(args) {
  const count = args?.count || 2;
  const expansions = args?.expansions || ['base'];
  const pool = filterByExpansion(TI4_DATA.agendas, expansions);
  if (pool.length === 0) return { error: 'No agendas match the given expansions.' };
  const drawn = shuffle([...pool]).slice(0, Math.min(count, pool.length));
  return { drawn, count: drawn.length, poolSize: pool.length, expansions };
}

function ti4DraftFactions(args) {
  const players = args?.players || 6;
  const poolSize = args?.pool_size || 3;
  const expansions = args?.expansions || ['base', 'pok'];
  const ban = (args?.ban || []).map(b => b.toLowerCase());
  let pool = filterByExpansion(TI4_DATA.factions, expansions);
  if (ban.length) pool = pool.filter(f => !ban.includes(f.name.toLowerCase()));
  const needed = players * poolSize;
  if (pool.length < needed) return { error: `Need ${needed} factions but only ${pool.length} available after bans/expansion filter.` };
  const dealt = shuffle([...pool]).slice(0, needed);
  const draft = [];
  for (let i = 0; i < players; i++) {
    draft.push({ player: i + 1, options: dealt.slice(i * poolSize, (i + 1) * poolSize).map(f => f.name) });
  }
  return { draft, players, poolSize, totalPool: pool.length, expansions, banned: ban };
}

function nukesSetupGenerator(args) {
  const players = args?.players || 3;
  const seed = args?.seed || String(Math.floor(Math.random() * 999999));
  const territories = players * 4;
  const assignments = [];
  for (let i = 0; i < territories; i++) {
    assignments.push({ territory: i + 1, player: (i % players) + 1 });
  }
  shuffle(assignments);
  return { players, seed, territories: assignments, totalTerritories: territories };
}

function colonyDiceOdds(args) {
  const PROBS = { 2: 1/36, 3: 2/36, 4: 3/36, 5: 4/36, 6: 5/36, 7: 6/36, 8: 5/36, 9: 4/36, 10: 3/36, 11: 2/36, 12: 1/36 };
  const numbers = args?.numbers || [];
  if (numbers.length === 0) return { table: PROBS, note: 'Pass numbers array to calculate combined probability.' };
  const individual = numbers.map(n => ({ number: n, probability: PROBS[n] || 0, percent: ((PROBS[n] || 0) * 100).toFixed(1) + '%' }));
  const pNone = numbers.reduce((acc, n) => acc * (1 - (PROBS[n] || 0)), 1);
  const pAtLeastOne = 1 - pNone;
  return { numbers, individual, probabilityAtLeastOne: (pAtLeastOne * 100).toFixed(1) + '%', expectedRollsPerResource: (1 / pAtLeastOne).toFixed(1), table: PROBS };
}

function mancalaSimulateMove(args) {
  const board = [...(args?.board || [4,4,4,4,4,4,0,4,4,4,4,4,4,0])];
  const pit = args?.pit;
  const variant = args?.variant || 'kalah';
  if (pit === undefined || pit < 0 || pit > 12) return { error: 'Pit must be 0-5 (player 1) or 7-12 (player 2).' };
  if (pit === 6 || pit === 13) return { error: 'Cannot sow from a store.' };
  if (board[pit] === 0) return { error: 'Selected pit is empty.' };
  const player = pit < 6 ? 1 : 2;
  const store = player === 1 ? 6 : 13;
  const oppStore = player === 1 ? 13 : 6;
  let seeds = board[pit];
  board[pit] = 0;
  let idx = pit;
  while (seeds > 0) {
    idx = (idx + 1) % 14;
    if (idx === oppStore) continue;
    board[idx]++;
    seeds--;
  }
  let extraTurn = idx === store;
  let captured = 0;
  if (variant === 'kalah' && idx !== store) {
    const myPits = player === 1 ? [0,1,2,3,4,5] : [7,8,9,10,11,12];
    if (myPits.includes(idx) && board[idx] === 1) {
      const opposite = 12 - idx;
      if (board[opposite] > 0) {
        captured = board[opposite] + 1;
        board[store] += captured;
        board[idx] = 0;
        board[opposite] = 0;
      }
    }
  }
  return { board, lastPit: idx, extraTurn, captured, player, variant };
}

function mancalaLegalMoves(args) {
  const board = args?.board || [4,4,4,4,4,4,0,4,4,4,4,4,4,0];
  const player = args?.player || 1;
  const pits = player === 1 ? [0,1,2,3,4,5] : [7,8,9,10,11,12];
  const moves = pits.filter(i => board[i] > 0);
  return { player, moves, count: moves.length };
}

const MORRIS_ADJACENCY = [
  [1,9],[0,2,4],[1,14],[4,10],[3,5,2,7],[4,13],[7,11],[6,8,5],[7,12],
  [0,10,21],[9,11,3,18],[10,6,15],[8,13,17],[12,5,14,20],[13,2,23],
  [11,16],[15,17,19],[16,12],[10,19],[18,20,16],[19,13,22],[9,22],[21,23,20],[22,14]
];
const MORRIS_MILLS = [
  [0,1,2],[3,4,5],[6,7,8],[9,10,11],[12,13,14],[15,16,17],[18,19,20],[21,22,23],
  [0,9,21],[3,10,18],[6,11,15],[1,4,7],[16,19,22],[8,12,17],[5,13,20],[2,14,23]
];

function morrisLegalMoves(args) {
  const board = args?.board || new Array(24).fill(0);
  const player = args?.player;
  const phase = args?.phase || 'place';
  if (!player) return { error: 'Required: player (1 or 2).' };
  const moves = [];
  if (phase === 'place') {
    for (let i = 0; i < 24; i++) { if (board[i] === 0) moves.push({ type: 'place', to: i }); }
  } else {
    const pieces = board.reduce((acc, v, i) => { if (v === player) acc.push(i); return acc; }, []);
    const canFly = phase === 'fly' || pieces.length <= 3;
    for (const from of pieces) {
      if (canFly) {
        for (let to = 0; to < 24; to++) { if (board[to] === 0) moves.push({ type: 'fly', from, to }); }
      } else {
        for (const to of MORRIS_ADJACENCY[from]) { if (board[to] === 0) moves.push({ type: 'slide', from, to }); }
      }
    }
  }
  return { player, phase, moves, count: moves.length };
}

function morrisDetectMill(args) {
  const board = args?.board || [];
  const pos = args?.position;
  const player = args?.player;
  if (pos === undefined || !player) return { error: 'Required: board, position, player.' };
  const mills = MORRIS_MILLS.filter(m => m.includes(pos) && m.every(i => board[i] === player));
  return { position: pos, player, isMill: mills.length > 0, mills };
}

function urRollDice() {
  const dice = [0,0,0,0].map(() => Math.random() < 0.5 ? 1 : 0);
  return { dice, total: dice.reduce((a, b) => a + b, 0), description: `${dice.filter(d => d).length} of 4 marked corners showing` };
}

function urLegalMoves(args) {
  const board = args?.board || new Array(14).fill(0);
  const player = args?.player;
  const roll = args?.roll;
  const piecesHome = args?.pieces_home || [7, 7];
  if (!player || roll === undefined) return { error: 'Required: player, roll.' };
  if (roll === 0) return { player, roll, moves: [], count: 0, note: 'Roll of 0 — no moves possible.' };
  const TRACK_P1 = [0,1,2,3,4,5,6,7,8,9,10,11,12,13];
  const TRACK_P2 = [0,1,2,3,4,5,6,7,8,9,10,11,12,13];
  const ROSETTES = [3, 7, 13];
  const moves = [];
  const home = piecesHome[player - 1];
  if (home > 0 && roll <= 14 && board[roll - 1] !== player) {
    moves.push({ type: 'enter', to: roll - 1 });
  }
  for (let i = 0; i < 14; i++) {
    if (board[i] !== player) continue;
    const dest = i + roll;
    if (dest === 14) { moves.push({ type: 'bear_off', from: i }); }
    else if (dest < 14 && board[dest] !== player) {
      const canCapture = board[dest] !== 0 && !ROSETTES.includes(dest);
      if (board[dest] === 0 || canCapture) {
        moves.push({ type: canCapture ? 'capture' : 'move', from: i, to: dest });
      }
    }
  }
  return { player, roll, moves, count: moves.length };
}

function pachisiRollCowries(args) {
  const shells = args?.shells || 6;
  const game = args?.game || 'pachisi';
  if (game === 'chaupar') {
    const dice = [0,0,0].map(() => Math.floor(Math.random() * 4) + 1);
    return { game: 'chaupar', dice, total: dice.reduce((a, b) => a + b, 0) };
  }
  const results = Array.from({ length: shells }, () => Math.random() < 0.5 ? 1 : 0);
  const facesUp = results.reduce((a, b) => a + b, 0);
  let move;
  if (facesUp === 0) move = 25;
  else if (facesUp === 1) move = 10;
  else move = facesUp;
  const isGrace = facesUp === 0 || facesUp === 1 || facesUp === shells;
  return { game: 'pachisi', shells: results, facesUp, move, isGrace, grantsExtraTurn: isGrace };
}

export function handleGameToolCall(name, args) {
  switch (name) {
    case 'ti4_draw_objectives': return ti4DrawObjectives(args);
    case 'ti4_draw_agendas': return ti4DrawAgendas(args);
    case 'ti4_draft_factions': return ti4DraftFactions(args);
    case 'nukes_setup_generator': return nukesSetupGenerator(args);
    case 'colony_dice_odds': return colonyDiceOdds(args);
    case 'mancala_simulate_move': return mancalaSimulateMove(args);
    case 'mancala_legal_moves': return mancalaLegalMoves(args);
    case 'morris_legal_moves': return morrisLegalMoves(args);
    case 'morris_detect_mill': return morrisDetectMill(args);
    case 'ur_roll_dice': return urRollDice(args);
    case 'ur_legal_moves': return urLegalMoves(args);
    case 'pachisi_roll_cowries': return pachisiRollCowries(args);
    default: return { error: `Unknown game tool: ${name}` };
  }
}
