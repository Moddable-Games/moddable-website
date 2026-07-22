import { CHESS_TOOLS, handleChessToolCall } from './chess-tools.js';
import { HEX_TOOLS, handleHexToolCall } from './hex-tools.js';
import { RULES_TOOLS, handleRulesToolCall } from './rules-tools.js';
import { GAME_TOOLS, handleGameToolCall } from './game-tools.js';
import { PIECE_GALLERY_TOOLS, handlePieceGalleryToolCall, renderPieceGridSvg } from './piece-gallery.js';
import { ORACLE_TOOLS, handleOracleToolCall } from './oracle-tools.js';
import PUZZLE_POOL from './puzzle-pool.json';
import { GameRoom } from './game-room.js';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm';
export { GameRoom };

let wasmReady = false;

const GA_MEASUREMENT_ID = 'G-N0N3JPVCBE';

function trackToolCall(toolName, env, request) {
  const secret = env.GA_API_SECRET;
  if (!secret) return null;
  const clientId = request?.headers?.get('cf-connecting-ip') || 'anonymous';
  const payload = {
    client_id: clientId.replace(/[.:]/g, '_'),
    events: [{
      name: 'tool_call',
      params: {
        tool_name: toolName,
        engagement_time_msec: '1',
      },
    }],
  };
  return fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${secret}`,
    { method: 'POST', body: JSON.stringify(payload) }
  ).catch(() => {});
}

const PUZZLE_POOL_TOOL = {
  name: 'chess_generate_puzzle',
  description: 'Serve a random chess puzzle from a pool of 1,557 pre-generated puzzles across 66 variants (plus standard). Returns position, solution, metadata, and an SVG board image. Use chess_list_puzzle_types to discover available variant:type combinations.',
  inputSchema: {
    type: 'object',
    properties: {
      variant: {
        type: 'string',
        description: 'Variant key (e.g. "standard", "atomic", "racingKings") or "random" for a surprise variant. Defaults to "standard". Use chess_list_puzzle_types to see all available variants.',
      },
      type: {
        type: 'string',
        description: 'Puzzle type (e.g. "mate-in-1", "detonate-in-1", "sacrifice-your-king"). Defaults to the first available type for the variant. Use chess_list_puzzle_types to see all types.',
      },
      rating_min: {
        type: 'number',
        description: 'Minimum puzzle rating filter (Lichess rating scale). Omit for no minimum.',
      },
      rating_max: {
        type: 'number',
        description: 'Maximum puzzle rating filter. Omit for no maximum.',
      },
      theme: {
        type: 'string',
        description: 'Filter by puzzle theme (e.g. "backRankMate", "sacrifice", "endgame"). Only applies to Lichess-sourced puzzles.',
      },
      include_svg: {
        type: 'boolean',
        description: 'Include an SVG board render of the puzzle position. Defaults to true.',
      },
    },
  },
};

const SITE_TOOLS = [
  {
    name: 'chess_list_puzzle_types',
    description: 'List all available puzzle types in the pool with counts. Returns variant:type keys, total puzzles per key, and rating ranges. Use this to discover what puzzles are available before calling chess_generate_puzzle.',
    inputSchema: {
      type: 'object',
      properties: {
        variant: {
          type: 'string',
          description: 'Filter to a specific variant (e.g. "standard", "atomic"). Omit to see all variants.',
        },
      },
    },
  },
  {
    name: 'dice_roll',
    description: 'Roll dice using standard notation (e.g. "2d6+3", "4d8-1", "d20"). Supports any combination of dice, modifiers, and multiple pools.',
    inputSchema: {
      type: 'object',
      properties: {
        notation: {
          type: 'string',
          description: 'Dice notation (e.g. "2d6+3", "4d8", "d20+5", "3d6"). Multiple pools separated by commas.',
        },
      },
      required: ['notation'],
    },
  },
  {
    name: 'ti4_random_factions',
    description: 'Generate random faction assignments for a Twilight Imperium 4e game. Supports base game and Prophecy of Kings expansion.',
    inputSchema: {
      type: 'object',
      properties: {
        players: {
          type: 'number',
          description: 'Number of players (3-8). Defaults to 6.',
        },
        expansion: {
          type: 'string',
          enum: ['base', 'pok'],
          description: 'Include Prophecy of Kings factions. Defaults to "pok".',
        },
      },
    },
  },
  {
    name: 'coin_flip',
    description: 'Flip a coin or pick randomly from a list of options. Use for quick binary decisions or random selection.',
    inputSchema: {
      type: 'object',
      properties: {
        options: {
          type: 'array',
          items: { type: 'string' },
          description: 'Custom options to pick from (e.g. ["pizza","tacos","sushi"]). Defaults to ["heads","tails"].',
        },
      },
    },
  },
  {
    name: 'team_split',
    description: 'Randomly split a list of players into balanced teams. Handles odd numbers gracefully.',
    inputSchema: {
      type: 'object',
      properties: {
        players: {
          type: 'array',
          items: { type: 'string' },
          description: 'Player names to split into teams.',
        },
        teams: {
          type: 'number',
          description: 'Number of teams (default 2).',
        },
      },
      required: ['players'],
    },
  },
  {
    name: 'jam_status',
    description: 'Get the current Mod Jam status: active/inactive, theme, base game, time remaining, and submission count.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'jam_timer',
    description: 'Get the countdown timer for the current Mod Jam phase (voting, building, or judging).',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'jam_vote',
    description: 'Get current vote standings for the active Mod Jam vote. Returns anonymised tallies per option.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

const ALL_TOOLS = [
  ...CHESS_TOOLS.filter(t => t.name !== 'chess_generate_puzzle'),
  PUZZLE_POOL_TOOL,
  ...HEX_TOOLS,
  ...RULES_TOOLS,
  ...GAME_TOOLS,
  ...PIECE_GALLERY_TOOLS,
  ...ORACLE_TOOLS,
  ...SITE_TOOLS,
];

const SERVER_INFO = {
  name: 'moddable-tools',
  version: '1.7.0',
  description: 'AI-callable tools for chess variant analysis, hex map generation, piece gallery search, rules library queries, RPG oracles (Starforged, Ironsworn, Maze Rats), encounter building (D&D 5e, Pathfinder 1e), and board game utilities',
};

const PROMPTS = [
  {
    name: 'analyse_position',
    description: 'Analyse a chess position given in FEN notation. Identifies threats, material balance, and suggests best moves for the side to play.',
    arguments: [
      { name: 'fen', description: 'FEN string of the position to analyse', required: true },
      { name: 'variant', description: 'Chess variant name (default: standard)', required: false },
    ],
  },
  {
    name: 'build_variant',
    description: 'Design a new chess variant step by step. Guides through board size, piece types, win conditions, and special rules.',
    arguments: [
      { name: 'theme', description: 'Theme or concept for the variant (e.g. "fast-paced", "asymmetric", "3-player")', required: true },
    ],
  },
  {
    name: 'plan_hex_map',
    description: 'Plan a hex map layout for a board game. Determines grid size, terrain distribution, and resource placement based on player count and game type.',
    arguments: [
      { name: 'players', description: 'Number of players (2-8)', required: true },
      { name: 'game', description: 'Game system (e.g. "nukes", "talisman", "ti4", "custom")', required: false },
    ],
  },
];

const RESOURCES = [
  {
    uri: 'tools://moddable-games/variants',
    name: 'Chess Variants Catalog',
    description: 'Complete list of all 70+ supported chess variants with group classifications',
    mimeType: 'application/json',
  },
  {
    uri: 'tools://moddable-games/tools',
    name: 'Tool Catalog',
    description: 'Full listing of all available tools with input schemas and descriptions',
    mimeType: 'application/json',
  },
  {
    uri: 'tools://moddable-games/ti4-factions',
    name: 'TI4 Faction List',
    description: 'All Twilight Imperium 4e factions (base + Prophecy of Kings expansion)',
    mimeType: 'application/json',
  },
  {
    uri: 'tools://moddable-games/piece-gallery',
    name: 'Piece Gallery Stats',
    description: 'Aggregate statistics for the piece gallery: 96 sets, 2,550 SVGs across 19 game families',
    mimeType: 'application/json',
  },
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '') || '/';
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',');

    const corsOrigin = allowed.includes(origin) ? origin : allowed[0] || '*';
    const corsHeaders = {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (path === '/do-test') {
      const id = env.GAME_ROOMS.idFromName('test-room');
      const stub = env.GAME_ROOMS.get(id);
      return stub.fetch(new Request('https://fake/ping'));
    }

    if ((path === '/mcp' || path === '/mcp/sse') && request.method === 'GET') {
      return handleMcpSse(request, corsHeaders);
    }

    if ((path === '/mcp' || path === '/mcp/message') && request.method === 'POST') {
      return handleMcpMessage(request, corsHeaders, env, ctx);
    }

    if (path === '/llms.txt') {
      return new Response(generateLlmsTxt(), {
        headers: { 'Content-Type': 'text/plain', ...corsHeaders },
      });
    }

    if (path === '/openapi.json') {
      return new Response(JSON.stringify(generateOpenApi(), null, 2), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (path === '/.well-known/mcp-registry-auth') {
      return new Response('v=MCPv1; k=ed25519; p=aTEWAPx+rAD+1PCeA9tc0CWAj4yanBPkMM/SVEswhdA=', {
        headers: { 'Content-Type': 'text/plain', ...corsHeaders },
      });
    }

    if (path === '/.well-known/mcp.json') {
      return new Response(JSON.stringify({
        schema_version: '1.0',
        name: SERVER_INFO.name,
        description: SERVER_INFO.description,
        url: 'https://tools.moddable.games/mcp',
        transport: 'sse',
        tools: ALL_TOOLS,
        prompts: PROMPTS,
        resources: RESOURCES,
        configSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false,
          description: 'No configuration required. All tools are free and open, no API keys needed.',
        },
      }, null, 2), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (path === '/.well-known/mcp/server-card.json') {
      return new Response(JSON.stringify({
        name: SERVER_INFO.name,
        version: SERVER_INFO.version,
        description: SERVER_INFO.description,
        homepage: 'https://moddable.games/developers/',
        repository: 'https://github.com/Moddable-Games',
        icon: 'https://moddable.games/img/favicon.svg',
        transport: { type: 'http', url: 'https://tools.moddable.games/mcp' },
        capabilities: {
          tools: { count: ALL_TOOLS.length },
          prompts: { count: PROMPTS.length },
          resources: { count: RESOURCES.length },
        },
        tools: ALL_TOOLS.map(t => ({ name: t.name, description: t.description })),
        prompts: PROMPTS.map(p => ({ name: p.name, description: p.description })),
        resources: RESOURCES.map(r => ({ uri: r.uri, name: r.name, description: r.description })),
        config: { schema: { type: 'object', properties: {}, additionalProperties: false } },
      }, null, 2), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (path === '/api/tools') {
      return json({ tools: ALL_TOOLS, count: ALL_TOOLS.length }, corsHeaders);
    }

    if (path === '/api/board.png') {
      return handleBoardPng(url, corsHeaders);
    }

    if (path === '/api/pieces.png') {
      return handlePiecesPng(url, corsHeaders);
    }

    if (path.startsWith('/api/call') && request.method === 'POST') {
      return handleRestCall(request, corsHeaders, env, ctx);
    }

    if (path === '/' || path === '') {
      return new Response(generateIndexHtml(), {
        headers: { 'Content-Type': 'text/html', ...corsHeaders },
      });
    }

    return json({ error: 'Not found' }, corsHeaders, 404);
  }
};

function handleToolCall(name, args) {
  if (name === 'chess_generate_puzzle') return servePuzzleFromPool(args);
  if (name === 'chess_list_puzzle_types') return listPuzzleTypes(args);
  if (name.startsWith('chess_')) return handleChessToolCall(name, args);
  if (name.startsWith('hex_')) return handleHexToolCall(name, args);
  if (name.startsWith('rules_')) return handleRulesToolCall(name, args);
  if (name.startsWith('piece_gallery_')) return handlePieceGalleryToolCall(name, args);
  if (name.startsWith('oracle_')) return handleOracleToolCall(name, args);
  if (GAME_TOOLS.some(t => t.name === name)) return handleGameToolCall(name, args);
  if (name === 'dice_roll') return diceRoll(args);
  if (name === 'ti4_random_factions') return ti4RandomFactions(args);
  if (name === 'coin_flip') return coinFlip(args);
  if (name === 'team_split') return teamSplit(args);
  if (name === 'jam_status') return jamStatus(args);
  if (name === 'jam_timer') return jamTimer(args);
  if (name === 'jam_vote') return jamVote(args);
  return { error: `Unknown tool: ${name}` };
}

function listPuzzleTypes(args) {
  const filterVariant = args && args.variant;
  const types = [];

  for (const [key, puzzles] of Object.entries(PUZZLE_POOL)) {
    const [variant, ...typeParts] = key.split(':');
    const type = typeParts.join(':');
    if (filterVariant && variant !== filterVariant) continue;

    const ratings = puzzles.map(p => p.rating).filter(r => typeof r === 'number');
    types.push({
      key,
      variant,
      type,
      count: puzzles.length,
      ratingRange: ratings.length > 0
        ? { min: Math.min(...ratings), max: Math.max(...ratings) }
        : null,
    });
  }

  types.sort((a, b) => a.key.localeCompare(b.key));

  const variants = [...new Set(types.map(t => t.variant))].sort();
  const totalPuzzles = types.reduce((sum, t) => sum + t.count, 0);

  return {
    totalPuzzles,
    totalTypes: types.length,
    variants,
    variantCount: variants.length,
    types,
  };
}

function extractHighlightSquares(moveStr) {
  if (!moveStr) return [];
  if (/^[a-l]\d[a-l]\d/.test(moveStr)) {
    return [moveStr.slice(0, 2), moveStr.slice(2, 4)];
  }
  const squares = moveStr.match(/[a-l][1-9][0-2]?/g);
  return squares ? squares.slice(0, 2) : [];
}

function servePuzzleFromPool(args) {
  let variant = (args && args.variant) || 'standard';
  if (variant === 'random') {
    const allVariants = [...new Set(Object.keys(PUZZLE_POOL).map(k => k.split(':')[0]))];
    variant = allVariants[Math.floor(Math.random() * allVariants.length)];
  }
  const ratingMin = args && args.rating_min;
  const ratingMax = args && args.rating_max;
  const themeFilter = args && args.theme;
  const includeSvg = args && args.include_svg !== false;

  let type = args && args.type;
  if (!type) {
    const variantKeys = Object.keys(PUZZLE_POOL).filter(k => k.startsWith(variant + ':'));
    if (variantKeys.length === 0) {
      const available = [...new Set(Object.keys(PUZZLE_POOL).map(k => k.split(':')[0]))].sort();
      return {
        variant,
        error: `No puzzles available for variant "${variant}". Available variants: ${available.join(', ')}`,
      };
    }
    type = variantKeys[0].split(':').slice(1).join(':');
  }

  const key = variant + ':' + type;
  let pool = PUZZLE_POOL[key];

  if (!pool || pool.length === 0) {
    const variantKeys = Object.keys(PUZZLE_POOL).filter(k => k.startsWith(variant + ':'));
    return {
      variant, type,
      error: `No puzzles for "${key}". Available types for ${variant}: ${variantKeys.map(k => k.split(':').slice(1).join(':')).join(', ') || 'none'}`,
    };
  }

  if (ratingMin) pool = pool.filter(p => (p.rating || 0) >= ratingMin);
  if (ratingMax) pool = pool.filter(p => (p.rating || 9999) <= ratingMax);
  if (themeFilter) pool = pool.filter(p => p.themes && p.themes.includes(themeFilter));

  if (pool.length === 0) {
    return {
      variant, type,
      error: 'No puzzles match the given filters. Try widening rating range or removing theme filter.',
      totalBeforeFilter: PUZZLE_POOL[key].length,
    };
  }

  const idx = Math.floor(Math.random() * pool.length);
  const puzzle = pool[idx];

  const solution = puzzle.solution || [];
  const setupMove = solution.length > 1 && !puzzle.historical ? solution[0] : null;
  const playerSolution = setupMove ? solution.slice(1) : solution;

  let puzzleFen = puzzle.fen;
  if (setupMove) {
    const moveResult = handleChessToolCall('chess_make_moves', { variant, fen: puzzle.fen, moves: [setupMove] });
    if (moveResult && moveResult.fen) {
      puzzleFen = moveResult.fen;
    }
  }

  const fenParts = puzzleFen.split(' ');
  const turn = fenParts[1] === 'w' ? 'white' : 'black';

  const result = {
    variant,
    type,
    id: puzzle.id,
    fen: puzzleFen,
    turn,
    setupMove,
    solution: playerSolution,
    rating: puzzle.rating || null,
    themes: puzzle.themes || [],
    source: puzzle.source || null,
    poolSize: pool.length,
  };

  if (includeSvg) {
    const lastMoveSquares = setupMove ? extractHighlightSquares(setupMove) : [];
    const svgResult = handleChessToolCall('chess_render_svg', {
      variant,
      fen: puzzleFen,
      theme: 'classic',
      highlights: lastMoveSquares,
      size: 480,
    });
    if (svgResult && svgResult.svg) {
      result.svg = svgResult.svg;
    }
  }

  return result;
}

function diceRoll(args) {
  if (!args || !args.notation) return { error: 'notation parameter is required (e.g. "2d6+3")' };

  const pools = args.notation.split(',').map(s => s.trim());
  const results = [];
  let grandTotal = 0;

  for (const pool of pools) {
    const match = pool.match(/^(\d*)d(\d+)([+-]\d+)?$/i);
    if (!match) {
      results.push({ input: pool, error: 'Invalid notation. Use format: NdS+M (e.g. 2d6+3)' });
      continue;
    }
    const count = parseInt(match[1] || '1');
    const sides = parseInt(match[2]);
    const modifier = parseInt(match[3] || '0');

    if (count < 1 || count > 100) return { error: 'Dice count must be 1-100' };
    if (sides < 2 || sides > 1000) return { error: 'Dice sides must be 2-1000' };

    const rolls = [];
    for (let i = 0; i < count; i++) {
      rolls.push(1 + Math.floor(Math.random() * sides));
    }
    const subtotal = rolls.reduce((a, b) => a + b, 0);
    const total = subtotal + modifier;
    grandTotal += total;

    results.push({
      input: pool,
      dice: `${count}d${sides}`,
      rolls,
      subtotal,
      modifier,
      total,
    });
  }

  return { pools: results, total: grandTotal };
}

const TI4_FACTIONS_BASE = [
  'Federation of Sol', 'Emirates of Hacan', 'Universities of Jol-Nar',
  'Sardakk N\'orr', 'Barony of Letnev', 'Clan of Saar',
  'Embers of Muaat', 'Ghosts of Creuss', 'L1Z1X Mindnet',
  'Mentak Coalition', 'Naalu Collective', 'Nekro Virus',
  'Winnu', 'Xxcha Kingdom', 'Yin Brotherhood', 'Yssaril Tribes',
  'Arborec',
];

const TI4_FACTIONS_POK = [
  'Argent Flight', 'Empyrean', 'Mahact Gene-Sorcerers',
  'Naaz-Rokha Alliance', 'Nomad', 'Titans of Ul',
  'Vuil\'raith Cabal',
];

function ti4RandomFactions(args) {
  const players = Math.min(8, Math.max(3, (args && args.players) || 6));
  const expansion = (args && args.expansion) || 'pok';

  let pool = [...TI4_FACTIONS_BASE];
  if (expansion === 'pok') pool = pool.concat(TI4_FACTIONS_POK);

  const assigned = [];
  for (let i = 0; i < players; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    assigned.push(pool.splice(idx, 1)[0]);
  }

  return {
    players,
    expansion,
    factions: assigned.map((f, i) => ({ player: i + 1, faction: f })),
    poolSize: pool.length + players,
  };
}

function coinFlip(args) {
  const options = (args && args.options && args.options.length >= 2) ? args.options : ['heads', 'tails'];
  const idx = Math.floor(Math.random() * options.length);
  return { result: options[idx], options, index: idx };
}

function teamSplit(args) {
  if (!args || !args.players || args.players.length < 2) {
    return { error: 'Provide at least 2 player names.' };
  }
  const teamCount = Math.min(args.teams || 2, args.players.length);
  const shuffled = [...args.players];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const teams = Array.from({ length: teamCount }, () => []);
  shuffled.forEach((p, i) => teams[i % teamCount].push(p));
  return {
    teams: teams.map((members, i) => ({ team: i + 1, members })),
    teamCount,
    totalPlayers: args.players.length,
  };
}

function jamStatus() {
  return { active: false, message: 'No Mod Jam is currently running. Check back soon or join the Discord for announcements.' };
}

function jamTimer() {
  return { active: false, message: 'No active jam phase. The timer starts when a jam is announced.' };
}

function jamVote() {
  return { active: false, message: 'No active vote. Voting opens when a new Mod Jam is announced.' };
}

async function handleRestCall(request, corsHeaders, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, corsHeaders, 400);
  }

  const { tool, args } = body;
  if (!tool) return json({ error: 'Missing "tool" field' }, corsHeaders, 400);

  const result = handleToolCall(tool, args || {});
  const track = trackToolCall(tool, env, request);
  if (track && ctx) ctx.waitUntil(track);
  const status = result.error ? 400 : 200;
  return json(result, corsHeaders, status);
}

async function handleBoardPng(url, corsHeaders) {
  const fen = url.searchParams.get('fen');
  const variant = url.searchParams.get('variant') || 'standard';
  const theme = url.searchParams.get('theme') || 'classic';
  const size = parseInt(url.searchParams.get('size') || '480');
  const highlights = url.searchParams.get('highlights');

  if (!fen) {
    return json({ error: 'fen parameter is required' }, corsHeaders, 400);
  }

  const svgResult = handleChessToolCall('chess_render_svg', {
    variant,
    fen,
    theme,
    size,
    highlights: highlights ? highlights.split(',') : [],
  });

  if (!svgResult || !svgResult.svg) {
    return json({ error: 'Failed to render SVG' }, corsHeaders, 500);
  }

  try {
    if (!wasmReady) {
      await initWasm(resvgWasm);
      wasmReady = true;
    }

    const resvg = new Resvg(svgResult.svg, {
      fitTo: { mode: 'width', value: size },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    return new Response(pngBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
        ...corsHeaders,
      },
    });
  } catch (e) {
    return json({ error: `PNG render failed: ${e.message}` }, corsHeaders, 500);
  }
}

async function handlePiecesPng(url, corsHeaders) {
  const setId = url.searchParams.get('set');
  const size = parseInt(url.searchParams.get('size') || '64');

  if (!setId) {
    return json({ error: 'set parameter is required (e.g. ?set=chessnut)' }, corsHeaders, 400);
  }

  const svg = await renderPieceGridSvg(setId, Math.min(Math.max(size, 32), 128));
  if (!svg) {
    return json({ error: `Set "${setId}" not found or has no pieces` }, corsHeaders, 404);
  }

  try {
    if (!wasmReady) {
      await initWasm(resvgWasm);
      wasmReady = true;
    }

    const resvg = new Resvg(svg, {
      fitTo: { mode: 'original' },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    return new Response(pngBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
        ...corsHeaders,
      },
    });
  } catch (e) {
    return json({ error: `PNG render failed: ${e.message}` }, corsHeaders, 500);
  }
}

function handleMcpSse(request, corsHeaders) {
  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  const sessionId = crypto.randomUUID();

  const welcome = {
    jsonrpc: '2.0',
    method: 'notifications/initialized',
    params: { sessionId },
  };

  writer.write(encoder.encode(`data: ${JSON.stringify(welcome)}\n\n`));

  const capabilities = {
    jsonrpc: '2.0',
    id: 0,
    result: {
      protocolVersion: '2025-03-26',
      capabilities: {
        tools: { listChanged: false },
        prompts: { listChanged: false },
        resources: { listChanged: false, subscribe: false },
      },
      serverInfo: SERVER_INFO,
    },
  };
  writer.write(encoder.encode(`data: ${JSON.stringify(capabilities)}\n\n`));

  setTimeout(() => writer.close(), 100);

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      ...corsHeaders,
    },
  });
}

async function handleMcpMessage(request, corsHeaders, env, ctx) {
  let msg;
  try {
    msg = await request.json();
  } catch {
    return json({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' } }, corsHeaders, 400);
  }

  const { id, method, params } = msg;

  let result;
  switch (method) {
    case 'initialize':
      result = {
        protocolVersion: '2025-03-26',
        capabilities: {
          tools: { listChanged: false },
          prompts: { listChanged: false },
          resources: { listChanged: false, subscribe: false },
        },
        serverInfo: SERVER_INFO,
        configSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false,
          description: 'No configuration required. All tools are free and open, no API keys needed.',
        },
      };
      break;

    case 'tools/list':
      result = { tools: ALL_TOOLS };
      break;

    case 'tools/call': {
      const { name, arguments: args } = params || {};
      const callResult = handleToolCall(name, args || {});
      const track = trackToolCall(name, env, request);
      if (track && ctx) ctx.waitUntil(track);
      result = {
        content: [{ type: 'text', text: JSON.stringify(callResult, null, 2) }],
        isError: !!callResult.error,
      };
      break;
    }

    case 'prompts/list':
      result = { prompts: PROMPTS };
      break;

    case 'prompts/get': {
      const prompt = PROMPTS.find(p => p.name === (params || {}).name);
      if (!prompt) {
        return json({ jsonrpc: '2.0', id, error: { code: -32602, message: `Unknown prompt: ${(params || {}).name}` } }, corsHeaders, 400);
      }
      const messages = generatePromptMessages(prompt.name, (params || {}).arguments || {});
      result = { description: prompt.description, messages };
      break;
    }

    case 'resources/list':
      result = { resources: RESOURCES };
      break;

    case 'resources/read': {
      const content = readResource((params || {}).uri);
      if (content.error) {
        return json({ jsonrpc: '2.0', id, error: { code: -32602, message: content.error } }, corsHeaders, 400);
      }
      result = { contents: [content] };
      break;
    }

    case 'notifications/initialized':
    case 'notifications/cancelled':
      return new Response(null, { status: 204, headers: corsHeaders });

    case 'resources/subscribe':
    case 'resources/unsubscribe':
      result = {};
      break;

    case 'ai.smithery/events/list':
      result = { events: [] };
      break;

    default:
      return json({
        jsonrpc: '2.0', id,
        error: { code: -32601, message: `Method not found: ${method}` },
      }, corsHeaders, 400);
  }

  return json({ jsonrpc: '2.0', id, result }, corsHeaders);
}

function generatePromptMessages(name, args) {
  switch (name) {
    case 'analyse_position':
      return [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Analyse this chess position${args.variant && args.variant !== 'standard' ? ` (variant: ${args.variant})` : ''}:\n\nFEN: ${args.fen || '[no FEN provided]'}\n\nPlease:\n1. Identify the material balance\n2. Assess king safety for both sides\n3. List immediate threats and tactical motifs\n4. Suggest the best 2-3 candidate moves with reasoning\n\nUse the chess_validate_move and chess_get_variant tools to verify any moves you suggest.`,
          },
        },
      ];
    case 'build_variant':
      return [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Help me design a new chess variant with the theme: "${args.theme || 'creative'}"\n\nWalk me through:\n1. Board dimensions and shape\n2. Piece types (standard + custom)\n3. Win conditions\n4. Special rules or phase changes\n5. Balance considerations\n\nUse chess_list_variants to check for similar existing variants, and chess_get_variant to study their rules for inspiration.`,
          },
        },
      ];
    case 'plan_hex_map':
      return [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Plan a hex map layout for ${args.players || '4'} players${args.game ? ` playing ${args.game}` : ''}.\n\nConsider:\n1. Grid dimensions and total hex count\n2. Terrain type distribution (land, water, mountain, etc.)\n3. Resource placement and balance\n4. Starting positions and fairness\n5. Strategic chokepoints\n\nUse hex_generate_map to create the actual map once we agree on parameters, and hex_list_terrains to see available terrain types.`,
          },
        },
      ];
    default:
      return [{ role: 'user', content: { type: 'text', text: 'Unknown prompt.' } }];
  }
}

function readResource(uri) {
  switch (uri) {
    case 'tools://moddable-games/variants': {
      const variantList = handleToolCall('chess_list_variants', {});
      return {
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(variantList, null, 2),
      };
    }
    case 'tools://moddable-games/tools':
      return {
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(ALL_TOOLS.map(t => ({ name: t.name, description: t.description, inputSchema: t.inputSchema })), null, 2),
      };
    case 'tools://moddable-games/ti4-factions':
      return {
        uri,
        mimeType: 'application/json',
        text: JSON.stringify({ base: TI4_FACTIONS_BASE, pok: TI4_FACTIONS_POK, total: TI4_FACTIONS_BASE.length + TI4_FACTIONS_POK.length }, null, 2),
      };
    case 'tools://moddable-games/piece-gallery':
      return {
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(handlePieceGalleryToolCall('piece_gallery_stats', {}), null, 2),
      };
    default:
      return { error: `Unknown resource: ${uri}` };
  }
}

function generateLlmsTxt() {
  let txt = `# Moddable.Games — AI Tool Server\n`;
  txt += `# https://tools.moddable.games\n\n`;
  txt += `> Moddable.Games provides open-source board game engines as AI-callable tools.\n`;
  txt += `> ${ALL_TOOLS.length} tools across chess variant analysis (70+ variants, 1,500+ puzzles), piece gallery (96 sets, 2,550 SVGs), hex map generation (6 games), rules library queries (41 game families, 8,400+ indexed entries), RPG oracles (Starforged, Ironsworn, Maze Rats, D&D 5e + Pathfinder 1e encounters), and board game utilities.\n\n`;
  txt += `## Endpoints\n\n`;
  txt += `- MCP (SSE): https://tools.moddable.games/mcp\n`;
  txt += `- MCP (message): POST https://tools.moddable.games/mcp/message\n`;
  txt += `- REST API: POST https://tools.moddable.games/api/call\n`;
  txt += `- Tool list: GET https://tools.moddable.games/api/tools\n`;
  txt += `- OpenAPI spec: https://tools.moddable.games/openapi.json\n\n`;
  txt += `## Tools\n\n`;

  for (const tool of ALL_TOOLS) {
    txt += `### ${tool.name}\n${tool.description}\n\n`;
  }

  txt += `## Prompts\n\n`;
  for (const p of PROMPTS) {
    txt += `### ${p.name}\n${p.description}\n`;
    txt += `Arguments: ${p.arguments.map(a => `${a.name}${a.required ? ' (required)' : ''}`).join(', ')}\n\n`;
  }

  txt += `## Resources\n\n`;
  for (const r of RESOURCES) {
    txt += `### ${r.name}\n${r.description}\nURI: ${r.uri}\n\n`;
  }

  return txt;
}

function generateOpenApi() {
  const paths = {};
  for (const tool of ALL_TOOLS) {
    paths[`/api/call/${tool.name}`] = {
      post: {
        summary: tool.description,
        operationId: tool.name,
        requestBody: {
          content: {
            'application/json': {
              schema: tool.inputSchema,
            },
          },
        },
        responses: {
          200: { description: 'Tool result' },
          400: { description: 'Invalid input or tool error' },
        },
      },
    };
  }

  return {
    openapi: '3.1.0',
    info: {
      title: 'Moddable.Games Tools API',
      version: SERVER_INFO.version,
      description: SERVER_INFO.description,
    },
    servers: [{ url: 'https://tools.moddable.games' }],
    paths,
  };
}

function generateIndexHtml() {
  const chessTools = ALL_TOOLS.filter(t => t.name.startsWith('chess_'));
  const hexTools = ALL_TOOLS.filter(t => t.name.startsWith('hex_'));
  const pieceTools = ALL_TOOLS.filter(t => t.name.startsWith('piece_gallery_'));
  const siteTools = ALL_TOOLS.filter(t => !t.name.startsWith('chess_') && !t.name.startsWith('hex_') && !t.name.startsWith('piece_gallery_'));

  function toolCard(t) {
    let accent = '#3a9928';
    if (t.name.startsWith('chess_')) accent = '#0c4f8d';
    else if (t.name.startsWith('hex_')) accent = '#3a9928';
    else if (t.name.startsWith('piece_gallery_')) accent = '#8b5cf6';
    else accent = '#d11a1a';
    return `<div class="tool-card" style="border-left-color:${accent}"><span class="tool-name" style="color:${accent === '#0c4f8d' ? '#6fb5ff' : accent}">${t.name}</span><span class="tool-desc">${t.description}</span></div>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="icon" href="https://moddable.games/img/favicon.svg" type="image/svg+xml">
<link rel="icon" href="https://moddable.games/img/favicon-32x32.png" sizes="32x32" type="image/png">
<meta name="theme-color" content="#0a0d2a">
<title>Moddable.Games — Tools API</title>
<meta name="description" content="${ALL_TOOLS.length} AI-callable tools for chess variant analysis, piece gallery search, hex map generation, and board game utilities.">
<meta property="og:title" content="Moddable.Games Tools API">
<meta property="og:description" content="${ALL_TOOLS.length} AI-callable tools for chess variant analysis, piece gallery search, hex map generation, and board game utilities. Connect via MCP or REST.">
<meta property="og:url" content="https://tools.moddable.games/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Moddable.Games">
<meta property="og:image" content="https://moddable.games/img/og/developers-api.png?v=${SERVER_INFO.version}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Moddable.Games Tools API">
<meta name="twitter:description" content="${ALL_TOOLS.length} AI-callable tools for chess variant analysis, piece gallery search, hex map generation, and board game utilities.">
<meta name="twitter:image" content="https://moddable.games/img/og/developers-api.png?v=${SERVER_INFO.version}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@600;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&family=Press+Start+2P&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0d2a;color:#e0e0e0;font-family:'Inter',system-ui,sans-serif;font-size:15px;line-height:1.6}
a{color:#6fb5ff;text-decoration:none}
a:hover{text-decoration:underline}

.hero{padding:80px 24px 60px;text-align:center;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,#0a0d2a 0%,#1a3680 60%,#0a0d2a 100%);opacity:0.4}
.hero>*{position:relative}
.hero__eyebrow{font-family:'Press Start 2P',monospace;font-size:9px;letter-spacing:0.1em;color:#6fb5ff;text-shadow:0 0 12px rgba(111,181,255,0.5);margin-bottom:16px}
.hero__title{font-family:'Inter Tight',sans-serif;font-size:clamp(2rem,5vw,3rem);font-weight:700;color:#fff;margin-bottom:16px}
.hero__lede{color:rgba(255,255,255,0.7);max-width:560px;margin:0 auto 32px}
.hero__connect{background:#0f1235;border:1px solid #1a3680;border-radius:12px;padding:16px 80px 16px 20px;max-width:860px;margin:0 auto;text-align:left;position:relative;overflow-x:auto;white-space:nowrap}
.hero__connect code{font-family:'JetBrains Mono',monospace;font-size:0.8rem;color:#6fb5ff}
.hero__connect-copy{position:absolute;top:50%;right:14px;transform:translateY(-50%);background:#6fb5ff;color:#0a0d2a;border:none;border-radius:9999px;padding:6px 16px;font-size:0.7rem;font-weight:600;cursor:pointer}
.hero__stats{display:flex;justify-content:center;gap:40px;margin-top:32px}
.hero__stat-value{font-family:'JetBrains Mono',monospace;font-size:1.5rem;font-weight:700;color:#fff}
.hero__stat-label{font-size:0.75rem;color:rgba(255,255,255,0.5);margin-top:2px}

.section{padding:64px 24px}
.section--light{background:#f5f4ef;color:#14161c}
.section--dark{background:#0a0d2a;border-top:1px solid rgba(111,181,255,0.08)}
.container{max-width:960px;margin:0 auto}
.section__eyebrow{font-family:'Press Start 2P',monospace;font-size:9px;letter-spacing:0.1em;color:#6fb5ff;text-shadow:0 0 12px rgba(111,181,255,0.5);margin-bottom:12px}
.section--light .section__eyebrow{color:#0c4f8d;text-shadow:none}
.section__title{font-family:'Inter Tight',sans-serif;font-size:1.5rem;font-weight:700;margin-bottom:24px}
.section--light .section__title{color:#14161c}

.endpoints{display:grid;gap:10px;margin-bottom:32px}
.endpoint{display:flex;align-items:center;gap:16px;padding:12px 16px;background:#0f1235;border:1px solid #1a3680;border-radius:8px}
.section--light .endpoint{background:#fff;border-color:#e6e3d8}
.endpoint code{font-family:'JetBrains Mono',monospace;font-size:0.75rem;font-weight:500;color:#6fb5ff;white-space:nowrap}
.section--light .endpoint code{color:#0c4f8d}
.endpoint span{font-size:0.8rem;color:rgba(255,255,255,0.6)}
.section--light .endpoint span{color:#14161c;opacity:0.7}

.code-block{background:#0f1235;border:1px solid #1a3680;border-left:3px solid #6fb5ff;border-radius:0 8px 8px 0;padding:16px 20px;overflow-x:auto;margin-bottom:24px}
.section--light .code-block{background:#1a1a2e;border-color:#1a3680}
.code-block pre{font-family:'JetBrains Mono',monospace;font-size:0.78rem;line-height:1.7;color:#e0e0e0;margin:0;white-space:pre-wrap}

.tools-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.tool-card{background:#0f1235;border:1px solid #1a3680;border-left:3px solid #3a9928;border-radius:0 8px 8px 0;padding:14px 16px;display:flex;flex-direction:column;gap:6px;transition:border-color 0.2s}
.tool-card:hover{border-color:#6fb5ff}
.tool-name{font-family:'JetBrains Mono',monospace;font-size:0.72rem;font-weight:500}
.tool-desc{font-size:0.78rem;color:rgba(255,255,255,0.6);line-height:1.4}

.links{display:flex;gap:16px;flex-wrap:wrap;margin-top:24px}
.links a{font-size:0.8rem;font-weight:500;padding:8px 20px;border:1px solid rgba(111,181,255,0.3);border-radius:9999px;transition:border-color 0.2s}
.links a:hover{border-color:#6fb5ff;text-decoration:none}

.footer{padding:48px 24px;text-align:center;font-size:0.8rem;border-top:1px solid rgba(111,181,255,0.08)}
.footer__logo{display:inline-block;margin-bottom:12px;opacity:0.7;transition:opacity 0.2s}
.footer__logo:hover{opacity:1}
.footer p{color:rgba(255,255,255,0.45);margin-top:8px}

@media(max-width:768px){
  .hero{padding:60px 16px 48px}
  .hero__connect{white-space:normal;padding:14px 16px 14px 16px;word-break:break-all}
  .hero__connect-copy{position:static;display:block;margin-top:12px;width:fit-content}
  .hero__stats{flex-direction:row;flex-wrap:wrap;justify-content:center;gap:24px}
  .section{padding:48px 16px}
  .section__title{text-align:center}
  .section__eyebrow{text-align:center}
  .tools-grid{grid-template-columns:1fr}
  .endpoint{flex-direction:column;align-items:center;text-align:center;gap:4px}
  .endpoint code{white-space:normal;word-break:break-all}
  .code-block pre{font-size:0.7rem}
  .links{justify-content:center}
  .footer p{font-size:0.75rem}
}
</style>
</head>
<body>

<div class="hero">
  <div class="hero__eyebrow">MODDABLE.GAMES</div>
  <h1 class="hero__title">Tools API</h1>
  <p class="hero__lede">${ALL_TOOLS.length} AI-callable tools for chess variant analysis, piece gallery search, hex map generation, and board game utilities. Connect from any MCP client or call via REST.</p>
  <div class="hero__connect">
    <code>claude mcp add --transport http moddable-tools https://tools.moddable.games/mcp</code>
    <button class="hero__connect-copy" onclick="navigator.clipboard.writeText('claude mcp add --transport http moddable-tools https://tools.moddable.games/mcp');this.textContent='Copied';setTimeout(()=>this.textContent='Copy',2000)">Copy</button>
  </div>
  <div class="hero__stats">
    <div><div class="hero__stat-value">${ALL_TOOLS.length}</div><div class="hero__stat-label">tools</div></div>
    <div><div class="hero__stat-value">3</div><div class="hero__stat-label">engines</div></div>
    <div><div class="hero__stat-value">&lt;10ms</div><div class="hero__stat-label">response</div></div>
    <div><div class="hero__stat-value">$0</div><div class="hero__stat-label">cost</div></div>
  </div>
</div>

<div class="section section--dark">
  <div class="container">
    <div class="section__eyebrow">ENDPOINTS</div>
    <h2 class="section__title">Connect however you want</h2>
    <div class="endpoints">
      <div class="endpoint"><code>POST /mcp/message</code><span>MCP protocol (JSON-RPC)</span></div>
      <div class="endpoint"><code>GET /mcp</code><span>MCP server-sent events (SSE)</span></div>
      <div class="endpoint"><code>POST /api/call</code><span>REST API — {"tool": "name", "args": {...}}</span></div>
      <div class="endpoint"><code>GET /api/tools</code><span>List all tools with input schemas</span></div>
      <div class="endpoint"><code>GET /llms.txt</code><span>AI-readable discovery file</span></div>
      <div class="endpoint"><code>GET /openapi.json</code><span>OpenAPI 3.1 specification</span></div>
    </div>
    <div class="section__eyebrow">QUICK START</div>
    <div class="code-block"><pre>curl -X POST https://tools.moddable.games/api/call \\
  -H "Content-Type: application/json" \\
  -d '{"tool": "chess_list_variants", "args": {"group": "Tactical"}}'</pre></div>
  </div>
</div>

<div class="section section--dark">
  <div class="container">
    <div class="section__eyebrow">CHESS &middot; ${chessTools.length} TOOLS</div>
    <h2 class="section__title">Variant analysis</h2>
    <div class="tools-grid">${chessTools.map(toolCard).join('')}</div>
  </div>
</div>

<div class="section section--dark">
  <div class="container">
    <div class="section__eyebrow">HEXMAPS &middot; ${hexTools.length} TOOLS</div>
    <h2 class="section__title">Map generation</h2>
    <div class="tools-grid">${hexTools.map(toolCard).join('')}</div>
  </div>
</div>

<div class="section section--dark">
  <div class="container">
    <div class="section__eyebrow">PIECE GALLERY &middot; ${pieceTools.length} TOOLS</div>
    <h2 class="section__title">Piece set discovery</h2>
    <div class="tools-grid">${pieceTools.map(toolCard).join('')}</div>
  </div>
</div>

${siteTools.length > 0 ? `<div class="section section--dark">
  <div class="container">
    <div class="section__eyebrow">UTILITIES &middot; ${siteTools.length} TOOLS</div>
    <h2 class="section__title">Board game utilities</h2>
    <div class="tools-grid">${siteTools.map(toolCard).join('')}</div>
  </div>
</div>` : ''}

<div class="section section--dark">
  <div class="container">
    <div class="links">
      <a href="/openapi.json">OpenAPI Spec</a>
      <a href="/llms.txt">llms.txt</a>
      <a href="/.well-known/mcp.json">MCP Discovery</a>
      <a href="https://moddable.games/developers/">Developer Guide</a>
      <a href="https://github.com/Moddable-Games">GitHub</a>
    </div>
  </div>
</div>

<div class="footer">
  <a href="https://moddable.games" class="footer__logo"><img src="https://moddable.games/img/moddable-logo-white.png" alt="Moddable.Games" height="24"></a>
  <p>Open-source board game engines, mods, and tools.</p>
  <p><a href="https://moddable.games">Main site</a> &middot; <a href="https://moddable.games/developers/">Developer guide</a> &middot; <a href="https://github.com/Moddable-Games">GitHub</a> &middot; v${SERVER_INFO.version}</p>
</div>

</body>
</html>`;
}

function json(data, corsHeaders, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}
