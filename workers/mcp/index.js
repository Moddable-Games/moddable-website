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
  const chessTools = ALL_TOOLS.filter(t => t.name.startsWith('chess_'));
  const hexTools = ALL_TOOLS.filter(t => t.name.startsWith('hex_'));
  const siteTools = ALL_TOOLS.filter(t => !t.name.startsWith('chess_') && !t.name.startsWith('hex_'));

  function toolCard(t) {
    let accent = '#3a9928';
    if (t.name.startsWith('chess_')) accent = '#0c4f8d';
    else if (t.name.startsWith('hex_')) accent = '#3a9928';
    else accent = '#d11a1a';
    return `<div class="tool-card" style="border-left-color:${accent}"><span class="tool-name" style="color:${accent === '#0c4f8d' ? '#6fb5ff' : accent}">${t.name}</span><span class="tool-desc">${t.description}</span></div>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Moddable.Games — Tools API</title>
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

.footer{padding:40px 24px;text-align:center;opacity:0.5;font-size:0.8rem;border-top:1px solid rgba(111,181,255,0.08)}

@media(max-width:768px){
  .tools-grid{grid-template-columns:1fr}
  .hero__stats{flex-direction:column;gap:16px}
  .endpoint{flex-direction:column;align-items:flex-start;gap:4px}
}
</style>
</head>
<body>

<div class="hero">
  <div class="hero__eyebrow">MODDABLE.GAMES</div>
  <h1 class="hero__title">Tools API</h1>
  <p class="hero__lede">${ALL_TOOLS.length} AI-callable tools for chess variant analysis, hex map generation, and board game utilities. Connect from any MCP client or call via REST.</p>
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
      <a href="https://web.moddable.games/developers/">Developer Guide</a>
      <a href="https://github.com/Moddable-Games">GitHub</a>
    </div>
  </div>
</div>

<div class="footer">
  Powered by <a href="https://web.moddable.games">Moddable.Games</a> &middot; ${SERVER_INFO.version}
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
