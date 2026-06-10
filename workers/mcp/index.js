import { CHESS_TOOLS, handleChessToolCall } from './chess-tools.js';
import { HEX_TOOLS, handleHexToolCall } from './hex-tools.js';
import PUZZLE_POOL from './puzzle-pool.json';

const SITE_TOOLS = [
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
];

const ALL_TOOLS = [...CHESS_TOOLS, ...HEX_TOOLS, ...SITE_TOOLS];

const SERVER_INFO = {
  name: 'moddable-tools',
  version: '1.1.0',
  description: 'AI-callable tools for chess variant analysis, hex map generation, and board game utilities',
};

export default {
  async fetch(request, env) {
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

    if (path === '/mcp' || path === '/mcp/sse') {
      return handleMcpSse(request, corsHeaders);
    }

    if (path === '/mcp/message' && request.method === 'POST') {
      return handleMcpMessage(request, corsHeaders);
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

    if (path === '/.well-known/mcp.json') {
      return new Response(JSON.stringify({
        schema_version: '1.0',
        name: SERVER_INFO.name,
        description: SERVER_INFO.description,
        url: 'https://tools.moddable.games/mcp',
        transport: 'sse',
        tools: ALL_TOOLS,
      }, null, 2), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (path === '/api/tools') {
      return json({ tools: ALL_TOOLS, count: ALL_TOOLS.length }, corsHeaders);
    }

    if (path.startsWith('/api/call') && request.method === 'POST') {
      return handleRestCall(request, corsHeaders);
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
  if (name.startsWith('chess_')) return handleChessToolCall(name, args);
  if (name.startsWith('hex_')) return handleHexToolCall(name, args);
  if (name === 'dice_roll') return diceRoll(args);
  if (name === 'ti4_random_factions') return ti4RandomFactions(args);
  return { error: `Unknown tool: ${name}` };
}

function servePuzzleFromPool(args) {
  const variant = (args && args.variant) || 'standard';
  const type = (args && args.type) || 'mate-in-1';
  const key = variant + ':' + type;
  const pool = PUZZLE_POOL[key];

  if (!pool || pool.length === 0) {
    return {
      type, variant,
      error: `No pre-generated puzzles for ${variant} ${type}. Available: ${Object.keys(PUZZLE_POOL).join(', ')}`,
    };
  }

  const idx = Math.floor(Math.random() * pool.length);
  const puzzle = pool[idx];
  return { type, variant, fen: puzzle.fen, turn: puzzle.turn, solution: puzzle.solution };
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

async function handleRestCall(request, corsHeaders) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, corsHeaders, 400);
  }

  const { tool, args } = body;
  if (!tool) return json({ error: 'Missing "tool" field' }, corsHeaders, 400);

  const result = handleToolCall(tool, args || {});
  const status = result.error ? 400 : 200;
  return json(result, corsHeaders, status);
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
      capabilities: { tools: {} },
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

async function handleMcpMessage(request, corsHeaders) {
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
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      };
      break;

    case 'tools/list':
      result = { tools: ALL_TOOLS };
      break;

    case 'tools/call': {
      const { name, arguments: args } = params || {};
      const callResult = handleToolCall(name, args || {});
      result = {
        content: [{ type: 'text', text: JSON.stringify(callResult, null, 2) }],
        isError: !!callResult.error,
      };
      break;
    }

    default:
      return json({
        jsonrpc: '2.0', id,
        error: { code: -32601, message: `Method not found: ${method}` },
      }, corsHeaders, 400);
  }

  return json({ jsonrpc: '2.0', id, result }, corsHeaders);
}

function generateLlmsTxt() {
  let txt = `# Moddable.Games — AI Tool Server\n`;
  txt += `# https://tools.moddable.games\n\n`;
  txt += `> Moddable.Games provides open-source board game engines as AI-callable tools.\n`;
  txt += `> 13 tools across two engines: chess variant analysis (70+ variants) and hex map generation (6 games).\n\n`;
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
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moddable.Games — Tools API</title>
<style>
body { font-family: system-ui, sans-serif; max-width: 720px; margin: 40px auto; padding: 0 20px; background: #0a0d2a; color: #e0e0e0; }
h1 { color: #6fb5ff; }
a { color: #6fb5ff; }
code { background: #1a1a2e; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
pre { background: #1a1a2e; padding: 16px; border-radius: 6px; overflow-x: auto; }
.tool { margin: 12px 0; padding: 8px 12px; border-left: 3px solid #3a9928; background: #0f1235; border-radius: 0 4px 4px 0; }
.tool.chess { border-left-color: #0c4f8d; }
</style>
</head>
<body>
<h1>Moddable.Games Tools API</h1>
<p>13 AI-callable tools for chess variant analysis and hex map generation.</p>
<h2>Endpoints</h2>
<ul>
<li><strong>MCP (SSE):</strong> <code>https://tools.moddable.games/mcp</code></li>
<li><strong>REST:</strong> <code>POST https://tools.moddable.games/api/call</code></li>
<li><strong>Tool list:</strong> <code>GET https://tools.moddable.games/api/tools</code></li>
<li><a href="/openapi.json">OpenAPI Spec</a> | <a href="/llms.txt">llms.txt</a> | <a href="/.well-known/mcp.json">MCP Discovery</a></li>
</ul>
<h2>Quick Start</h2>
<pre>curl -X POST https://tools.moddable.games/api/call \\
  -H "Content-Type: application/json" \\
  -d '{"tool": "chess_list_variants", "args": {"group": "Tactical"}}'</pre>
<h2>Tools</h2>
${ALL_TOOLS.map(t => `<div class="tool ${t.name.startsWith('chess') ? 'chess' : ''}""><strong>${t.name}</strong> — ${t.description}</div>`).join('\n')}
<p style="margin-top:40px;opacity:0.6">Powered by <a href="https://web.moddable.games">Moddable.Games</a></p>
</body>
</html>`;
}

function json(data, corsHeaders, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}
