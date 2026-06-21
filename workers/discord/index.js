const DISCORD_API = 'https://discord.com/api/v10';

const InteractionType = { PING: 1, APPLICATION_COMMAND: 2, MESSAGE_COMPONENT: 3 };
const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE: 4,
  DEFERRED_CHANNEL_MESSAGE: 5,
};

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const signature = request.headers.get('x-signature-ed25519');
    const timestamp = request.headers.get('x-signature-timestamp');
    const body = await request.text();

    const isValid = await verifySignature(body, signature, timestamp, env.DISCORD_PUBLIC_KEY);
    if (!isValid) {
      return new Response('Invalid signature', { status: 401 });
    }

    const interaction = JSON.parse(body);

    if (interaction.type === InteractionType.PING) {
      return json({ type: InteractionResponseType.PONG });
    }

    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      return handleCommand(interaction, env);
    }

    return json({ type: InteractionResponseType.CHANNEL_MESSAGE, data: { content: 'Unknown interaction.' } });
  },

  async scheduled(controller, env, ctx) {
    await checkHousePostReplies(env);

    const jam = await getJamState(env);
    if (!jam || !jam.deadline || !jam.channelId) return;

    const daysLeft = Math.ceil((jam.deadline - Date.now()) / 86400000);
    if (daysLeft <= 0) return;

    const milestones = [7, 3, 1];
    if (!milestones.includes(daysLeft)) return;

    const msg = daysLeft === 1
      ? `⏰ **Final day.** Mod Jam #${jam.number} deadline is tomorrow. Ship or skip.`
      : `⏱️ **${daysLeft} days remaining** on Mod Jam #${jam.number}. Keep building.`;

    await fetch(`${DISCORD_API}/channels/${jam.channelId}/messages`, {
      method: 'POST',
      headers: { 'Authorization': `Bot ${env.DISCORD_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: msg }),
    });
  },
};

// --- House post reply tracking ---

async function checkHousePostReplies(env) {
  if (!env.JAM_KV) return;
  const raw = await env.JAM_KV.get('house_posts', 'json');
  if (!raw || !raw.length) return;
  const posts = Array.isArray(raw) ? raw : [];
  const headers = { 'Authorization': `Bot ${env.DISCORD_TOKEN}` };

  for (const post of posts) {
    try {
      const res = await fetch(
        `${DISCORD_API}/channels/${post.channel}/messages?after=${post.id}&limit=50`,
        { headers }
      );
      if (!res.ok) continue;
      const messages = await res.json();
      const replies = messages.filter(m =>
        m.message_reference && m.message_reference.message_id === post.id
      );
      post.replyCount = replies.length;
      post.lastChecked = new Date().toISOString();
      if (replies.length > 0) {
        post.latestReplies = replies.slice(0, 5).map(r => ({
          author: r.author.username,
          content: r.content.slice(0, 200),
          timestamp: r.timestamp
        }));
      }
    } catch (e) {}
  }

  await env.JAM_KV.put('house_posts', JSON.stringify(posts));
}

// --- Command routing ---

async function handleCommand(interaction, env) {
  const { name, options } = interaction.data;

  switch (name) {
    case 'roll': return cmdRoll(options, env);
    case 'factions': return cmdFactions(options, env);
    case 'variants': return cmdVariants(options, env);
    case 'validate': return cmdValidate(options, env);
    case 'openings': return cmdOpenings(options, env);
    case 'hexgames': return cmdHexGames(options, env);
    case 'puzzle': return cmdPuzzle(options, env);
    case 'map': return cmdMap(options, env);
    case 'rules': return cmdRules(options, env);
    case 'howtoplay': return cmdHowToPlay(options, env);
    case 'randomgame': return cmdRandomGame(options, env);
    case 'jam': return cmdJam(options, env);
    case 'spotlight': return cmdSpotlight(env);
    case 'teams': return cmdTeams(options, interaction);
    case 'flip': return cmdFlip(options);
    case 'help': return cmdHelp();
    default:
      return ephemeral(`Unknown command: \`/${name}\``);
  }
}

// --- Tool bridge ---

async function callTool(tool, args, env) {
  const res = await fetch(env.TOOLS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool, args }),
  });
  if (!res.ok) throw new Error(`Tool API ${res.status}: ${await res.text()}`);
  return res.json();
}

// --- Command implementations ---

async function cmdRoll(options, env) {
  const notation = getOption(options, 'notation') || '1d6';
  try {
    const result = await callTool('dice_roll', { notation }, env);
    const pools = result.pools || [result];
    const lines = pools.map(p => `**${p.input || p.dice || notation}** → [${p.rolls.join(', ')}]${p.modifier ? ` ${p.modifier > 0 ? '+' : ''}${p.modifier}` : ''} = **${p.total}**`);
    return embed({
      title: '🎲 Dice Roll',
      description: lines.join('\n'),
      color: 0xd4a017,
    });
  } catch (e) {
    return ephemeral(`Roll failed: ${e.message}`);
  }
}

async function cmdFactions(options, env) {
  const players = getOption(options, 'players') || 6;
  const expansion = getOption(options, 'expansion') || 'pok';
  try {
    const result = await callTool('ti4_random_factions', { players, expansion }, env);
    const lines = result.factions.map(f => `**Player ${f.player}:** ${f.faction}`);
    return embed({
      title: '🪐 TI4 Faction Draft',
      description: lines.join('\n'),
      footer: `${result.poolSize} factions in pool (${expansion.toUpperCase()})`,
      color: 0x0c4f8d,
    });
  } catch (e) {
    return ephemeral(`Faction draft failed: ${e.message}`);
  }
}

async function cmdVariants(options, env) {
  const group = getOption(options, 'group') || undefined;
  try {
    const result = await callTool('chess_list_variants', { group }, env);
    const variants = result.variants || result;
    const list = Array.isArray(variants) ? variants : [];
    const lines = list.slice(0, 15).map(v => `**${v.name}** — ${v.description || `${v.board} board`}`);
    const footer = list.length > 15 ? `Showing 15 of ${list.length}. Groups: Classic, Tactical, Alternate Rules, Asymmetric, Small Boards, Large Boards` : '';
    return embed({
      title: '♟️ Chess Variants',
      description: lines.join('\n') || 'No variants found.',
      footer,
      color: 0x0c4f8d,
    });
  } catch (e) {
    return ephemeral(`Variants lookup failed: ${e.message}`);
  }
}

async function cmdValidate(options, env) {
  const move = getOption(options, 'move');
  const variant = getOption(options, 'variant') || 'standard';
  const fen = getOption(options, 'fen') || undefined;
  if (!move) return ephemeral('Please provide a move (e.g. `e2e4`).');
  try {
    const result = await callTool('chess_validate_move', { variant, fen, move }, env);
    const icon = result.legal ? '✅' : '❌';
    return embed({
      title: `${icon} Move: ${move}`,
      description: result.explanation || (result.legal ? 'Legal move.' : 'Illegal move.'),
      footer: variant !== 'standard' ? `Variant: ${variant}` : '',
      color: result.legal ? 0x3a9928 : 0xd11a1a,
    });
  } catch (e) {
    return ephemeral(`Validation failed: ${e.message}`);
  }
}

async function cmdOpenings(options, env) {
  const variant = getOption(options, 'variant') || 'standard';
  const fen = getOption(options, 'fen') || undefined;
  try {
    const result = await callTool('chess_get_opening_book', { variant, fen }, env);
    const moves = result.moves || result.continuations || [];
    if (!moves.length) return embed({ title: '📖 Opening Book', description: 'No book moves for this position.', color: 0x0c4f8d });
    const lines = moves.slice(0, 10).map(m => `\`${m.move || m}\`${m.name ? ` — ${m.name}` : ''}`);
    return embed({
      title: '📖 Opening Book',
      description: lines.join('\n'),
      footer: variant !== 'standard' ? `Variant: ${variant}` : '',
      color: 0x0c4f8d,
    });
  } catch (e) {
    return ephemeral(`Opening book failed: ${e.message}`);
  }
}

async function cmdHexGames(options, env) {
  try {
    const result = await callTool('hex_list_games', {}, env);
    const games = result.games || result;
    const lines = Array.isArray(games) ? games.map(g => `**${g.name || g.key}** — ${g.description || `${g.sizes || ''}`}`) : ['No games found.'];
    return embed({
      title: '🗺️ Hex Map Games',
      description: lines.join('\n'),
      color: 0x3a9928,
    });
  } catch (e) {
    return ephemeral(`Hex games lookup failed: ${e.message}`);
  }
}

async function cmdPuzzle(options, env) {
  let variant = getOption(options, 'variant') || 'standard';
  const type = getOption(options, 'type') || undefined;
  const difficulty = getOption(options, 'difficulty');

  if (variant === 'random') {
    const typesResult = await callTool('chess_list_puzzle_types', {}, env);
    const variants = typesResult.variants || [];
    variant = variants[Math.floor(Math.random() * variants.length)] || 'standard';
  }

  let variantInfo = null;
  if (variant !== 'standard') {
    try {
      const varResult = await callTool('chess_list_variants', {}, env);
      const vars = varResult.variants || [];
      variantInfo = vars.find(v => v.key === variant) || null;
    } catch {}
  }

  const args = { variant, include_svg: false };
  if (type) args.type = type;

  if (difficulty === 'easy') { args.rating_max = 1000; }
  else if (difficulty === 'medium') { args.rating_min = 1000; args.rating_max = 1500; }
  else if (difficulty === 'hard') { args.rating_min = 1500; args.rating_max = 2000; }
  else if (difficulty === 'expert') { args.rating_min = 2000; }

  try {
    const result = await callTool('chess_generate_puzzle', args, env);
    if (result.error) return ephemeral(result.error);

    const link = `https://chess.moddable.games/play/?variant=${variant}&fen=${encodeURIComponent(result.fen)}`;
    const rulesLink = `https://rules.moddable.games/dist/moddable-chess/`;
    const boardUrl = `https://tools.moddable.games/api/board.png?variant=${variant}&fen=${encodeURIComponent(result.fen)}&size=480`;
    const ratingStr = result.rating ? ` · Rating: ${result.rating}` : '';
    const turnEmoji = result.turn === 'white' ? '⬜' : '⬛';
    const themeStr = result.themes && result.themes.length > 0
      ? `\nThemes: ${result.themes.slice(0, 4).join(', ')}`
      : '';
    const variantLabel = variantInfo ? variantInfo.label : (variant !== 'standard' ? camelToTitle(variant) : '');

    let desc = `${turnEmoji} **${result.turn}** to move — find the best move!\n\n**Type:** ${result.type}${themeStr}`;
    if (variantInfo) {
      desc += `\n\n> **${variantInfo.label}** — ${variantInfo.description}`;
      desc += `\n> ${variantInfo.rule} · [Full rules](${rulesLink})`;
    }
    desc += `\n\n[▶ Open on board](${link})\n\n||Solution: ${result.solution ? result.solution.join(' → ') : 'N/A'}||`;

    return embedWithImage({
      title: `🧩 ${variantLabel ? variantLabel + ' ' : ''}Puzzle${ratingStr}`,
      description: desc,
      footer: `ID: ${result.id || '?'} · Pool: ${result.poolSize || '?'} puzzles`,
      image: boardUrl,
      color: 0x0c4f8d,
    });
  } catch (e) {
    return ephemeral(`Puzzle generation failed: ${e.message}`);
  }
}

async function cmdMap(options, env) {
  const game = getOption(options, 'game') || 'nukes';
  const players = getOption(options, 'players') || 0;
  const seed = getOption(options, 'seed') || String(Math.floor(Math.random() * 999999));
  try {
    await callTool('hex_generate_map', { game, players, seed }, env);
    const link = `https://hex.moddable.games/generate/?game=${game}&seed=${seed}&players=${players}`;
    return embed({
      title: `🗺️ Map: ${game}`,
      description: `Generated with seed \`${seed}\`\n\n[▶ Open interactive map](${link})`,
      footer: players > 0 ? `${players} players` : 'No player bases',
      color: 0x3a9928,
    });
  } catch (e) {
    return ephemeral(`Map generation failed: ${e.message}`);
  }
}

async function cmdRules(options, env) {
  const game = getOption(options, 'game');
  if (!game) {
    try {
      const result = await callTool('rules_list_games', { status: 'published' }, env);
      const lines = (result.games || []).slice(0, 15).map(g =>
        `**${g.title}** — ${g.tagline || `${g.players} players`}${g.variantCount > 0 ? ` · ${g.variantCount} variants` : ''}`
      );
      return embed({
        title: '📚 Rules Library',
        description: lines.join('\n') || 'No games found.',
        footer: `${result.total || 0} games · Use /rules game:<slug> for details`,
        color: 0xd11a1a,
      });
    } catch (e) {
      return ephemeral(`Rules lookup failed: ${e.message}`);
    }
  }
  try {
    const result = await callTool('rules_get_game', { slug: game }, env);
    if (result.error) return ephemeral(result.error);
    const variants = (result.variants || []).slice(0, 20);
    let desc = result.tagline ? `*${result.tagline}*\n\n` : '';
    if (result.summary) desc += result.summary + '\n\n';
    if (variants.length > 0) desc += `**Variants (${result.variantCount}):**\n${variants.join(', ')}`;
    if (result.rulesUrl) desc += `\n\n[📖 Full rulebook](${result.rulesUrl})`;
    return embed({
      title: `📚 ${result.title || game}`,
      description: desc || 'No details available.',
      footer: result.players ? `${result.players} players · ${result.duration || '?'}` : '',
      color: 0xd11a1a,
    });
  } catch (e) {
    return ephemeral(`Rules lookup failed: ${e.message}`);
  }
}

async function cmdHowToPlay(options, env) {
  const game = getOption(options, 'game');
  const variant = getOption(options, 'variant');
  if (!game) return ephemeral('Required: `/howtoplay game:<slug>` (e.g. `game:backgammon`)');
  if (!variant) return ephemeral('Required: `/howtoplay game:<slug> variant:<name>` (e.g. `variant:Acey-Deucey`)');
  try {
    const result = await callTool('rules_get_variant', { game, variant }, env);
    if (result.error) return ephemeral(result.error);
    let desc = result.content || 'No rules content available.';
    if (desc.length > 3900) desc = desc.slice(0, 3900) + '…';
    if (result.rulesUrl) desc += `\n\n[📖 Full rules](${result.rulesUrl})`;
    return embed({
      title: `📖 ${result.gameTitle}: ${result.variant}`,
      description: desc,
      color: 0xd11a1a,
    });
  } catch (e) {
    return ephemeral(`Rules lookup failed: ${e.message}`);
  }
}

async function cmdRandomGame(options, env) {
  const family = getOption(options, 'family') || undefined;
  try {
    const result = await callTool('rules_random', family ? { family } : {}, env);
    if (result.error) return ephemeral(result.error);
    if (result.content) {
      let desc = result.content;
      if (desc.length > 3900) desc = desc.slice(0, 3900) + '…';
      if (result.rulesUrl) desc += `\n\n[📖 Full rules](${result.rulesUrl})`;
      return embed({
        title: `🎲 ${result.gameTitle}: ${result.variant}`,
        description: desc,
        color: 0xd11a1a,
      });
    }
    let desc = result.tagline ? `*${result.tagline}*\n\n` : '';
    if (result.summary) desc += result.summary + '\n\n';
    if (result.variants && result.variants.length > 0) desc += `**Variants:** ${result.variants.slice(0, 10).join(', ')}`;
    if (result.rulesUrl) desc += `\n\n[📖 Full rulebook](${result.rulesUrl})`;
    return embed({
      title: `🎲 ${result.title || 'Random Game'}`,
      description: desc || 'No details available.',
      footer: result.players ? `${result.players} players · ${result.duration || '?'}` : '',
      color: 0xd11a1a,
    });
  } catch (e) {
    return ephemeral(`Random game failed: ${e.message}`);
  }
}

async function cmdJam(options, env) {
  const sub = getOption(options, 'action') || 'status';
  const jam = await getJamState(env);

  switch (sub) {
    case 'status': {
      if (!jam) return embed({ title: '🏠 Mod Jam', description: 'No active jam. Stay tuned for the next announcement.', color: 0xd11a1a });
      const days = jam.deadline ? Math.ceil((jam.deadline - Date.now()) / 86400000) : '?';
      return embed({
        title: `🏠 Mod Jam #${jam.number || '?'}`,
        description: `**Phase:** ${jam.phase || 'TBD'}\n**Base game:** ${jam.baseGame || 'TBD'}\n**Days remaining:** ${days > 0 ? days : 'Ended'}\n**Participants:** ${jam.participants || 'Open call'}`,
        color: 0xd11a1a,
      });
    }
    case 'timer': {
      if (!jam || !jam.deadline) return ephemeral('No active deadline set.');
      return embed({
        title: '⏱️ Jam Timer',
        description: `Deadline: <t:${Math.floor(jam.deadline / 1000)}:R>`,
        color: 0xd11a1a,
      });
    }
    case 'vote': {
      if (!jam || !jam.votes) return ephemeral('No active vote.');
      const lines = Object.entries(jam.votes).map(([option, count]) => `${option} — **${count}** vote${count !== 1 ? 's' : ''}`);
      return embed({
        title: '🗳️ Current Vote',
        description: lines.join('\n') || 'No votes yet.',
        footer: jam.voteDeadline ? `Voting closes: ${new Date(jam.voteDeadline).toLocaleDateString()}` : '',
        color: 0xd11a1a,
      });
    }
    default:
      return ephemeral('Use `/jam status`, `/jam timer`, or `/jam vote`.');
  }
}

async function getJamState(env) {
  if (!env.JAM_KV) return null;
  try {
    const data = await env.JAM_KV.get('current_jam', 'json');
    return data;
  } catch {
    return null;
  }
}

async function cmdSpotlight(env) {
  try {
    const res = await fetch(env.MODS_DATA);
    const mods = await res.json();
    const mod = mods[Math.floor(Math.random() * mods.length)];
    return embed({
      title: `🎯 Mod Spotlight: ${mod.title}`,
      description: `**${mod.category}** of ${mod.baseGame}\n\n${mod.lede || mod.description || ''}\n\n[View mod →](https://moddable.games/mods/${mod.slug}/)`,
      color: mod.category === 'Conversion' ? 0xd11a1a : mod.category === 'Rebalance' ? 0x3a9928 : 0x0c4f8d,
    });
  } catch (e) {
    return ephemeral(`Spotlight failed: ${e.message}`);
  }
}

function cmdTeams(options, interaction) {
  const count = getOption(options, 'count') || 2;
  const members = getOption(options, 'members') || '';
  const names = members.split(',').map(s => s.trim()).filter(Boolean);
  if (names.length < 2) return ephemeral('Provide at least 2 names separated by commas.');
  const shuffled = names.sort(() => Math.random() - 0.5);
  const teams = Array.from({ length: count }, () => []);
  shuffled.forEach((name, i) => teams[i % count].push(name));
  const lines = teams.map((t, i) => `**Team ${i + 1}:** ${t.join(', ')}`);
  return embed({
    title: '👥 Teams',
    description: lines.join('\n'),
    color: 0xd4a017,
  });
}

function cmdFlip(options) {
  const choices = getOption(options, 'choices') || '';
  if (choices) {
    const items = choices.split(',').map(s => s.trim()).filter(Boolean);
    const pick = items[Math.floor(Math.random() * items.length)];
    return embed({ title: '🎰 Pick', description: `From: ${items.join(', ')}\n\n**→ ${pick}**`, color: 0xd4a017 });
  }
  const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
  return embed({ title: '🪙 Coin Flip', description: `**${result}**`, color: 0xd4a017 });
}

function cmdHelp() {
  return embed({
    title: '🏠 The House — Commands',
    description: [
      '**Dice & Utilities**',
      '`/roll` — Roll dice (e.g. 3d6+2, 2d20)',
      '`/flip` — Coin flip or pick from a list',
      '`/teams` — Split people into random teams',
      '`/spotlight` — Random mod from the library',
      '',
      '**Chess**',
      '`/variants` — Browse chess variants',
      '`/validate` — Check if a move is legal',
      '`/openings` — Opening book moves',
      '`/puzzle` — Get a chess puzzle',
      '',
      '**Hex Maps**',
      '`/hexgames` — Available hex map games',
      '`/map` — Generate a hex map',
      '',
      '**Rules Library**',
      '`/rules` — Browse all games in the library',
      '`/rules game:<slug>` — Game details + variants',
      '`/howtoplay` — Get rules for a specific variant',
      '`/randomgame` — Pick a random game or variant',
      '',
      '**TI4**',
      '`/factions` — Random faction draft',
      '',
      '**Mod Jam**',
      '`/jam status` — Current jam state',
      '`/jam timer` — Time remaining',
      '`/jam vote` — Vote standings',
    ].join('\n'),
    footer: 'The House always wins.',
    color: 0x0a0d2a,
  });
}

// --- Response helpers ---

function embed({ title, description, footer, color }) {
  return json({
    type: InteractionResponseType.CHANNEL_MESSAGE,
    data: {
      embeds: [{
        title,
        description,
        color: color || 0x0a0d2a,
        ...(footer ? { footer: { text: footer } } : {}),
      }],
    },
  });
}

function embedWithImage({ title, description, footer, image, color }) {
  return json({
    type: InteractionResponseType.CHANNEL_MESSAGE,
    data: {
      embeds: [{
        title,
        description,
        color: color || 0x0a0d2a,
        ...(footer ? { footer: { text: footer } } : {}),
        ...(image ? { image: { url: image } } : {}),
      }],
    },
  });
}

function ephemeral(content) {
  return json({
    type: InteractionResponseType.CHANNEL_MESSAGE,
    data: { content, flags: 64 },
  });
}

function json(data) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}

function getOption(options, name) {
  if (!options) return null;
  const opt = options.find(o => o.name === name);
  return opt ? opt.value : null;
}

function camelToTitle(str) {
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim();
}

// --- Ed25519 signature verification ---

async function verifySignature(body, signature, timestamp, publicKey) {
  if (!signature || !timestamp) return false;
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      hexToUint8(publicKey),
      { name: 'Ed25519', namedCurve: 'Ed25519' },
      false,
      ['verify']
    );
    const message = new TextEncoder().encode(timestamp + body);
    return crypto.subtle.verify('Ed25519', key, hexToUint8(signature), message);
  } catch {
    return false;
  }
}

function hexToUint8(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}
