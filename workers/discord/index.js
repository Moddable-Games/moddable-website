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
    case 'moves': return cmdMoves(options, env);
    case 'analyze': return cmdAnalyze(options, env);
    case 'play': return cmdPlay(options, env);
    case 'search': return cmdSearch(options, env);
    case 'draft': return cmdDraft(options, env);
    case 'objectives': return cmdObjectives(options, env);
    case 'agendas': return cmdAgendas(options, env);
    case 'setup': return cmdSetup(options, env);
    case 'odds': return cmdOdds(options, env);
    case 'mancala': return cmdMancala(options, env);
    case 'morris': return cmdMorris(options, env);
    case 'ur': return cmdUr(options, env);
    case 'cowries': return cmdCowries(options, env);
    case 'test': return cmdTest(interaction, env);
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

async function cmdMoves(options, env) {
  const variant = getOption(options, 'variant') || 'standard';
  const fen = getOption(options, 'fen') || undefined;
  try {
    const result = await callTool('chess_get_legal_moves', { variant, fen }, env);
    const moves = result.moves || [];
    const display = moves.slice(0, 30).map(m => `\`${m.san || m.move || m}\``).join(', ');
    return embed({
      title: `♟️ Legal Moves (${moves.length})`,
      description: display || 'No legal moves (checkmate or stalemate).',
      footer: variant !== 'standard' ? `Variant: ${variant}` : '',
      color: 0x0c4f8d,
    });
  } catch (e) {
    return ephemeral(`Moves lookup failed: ${e.message}`);
  }
}

async function cmdAnalyze(options, env) {
  const variant = getOption(options, 'variant') || 'standard';
  const fen = getOption(options, 'fen') || undefined;
  try {
    const result = await callTool('chess_analyze_position', { variant, fen }, env);
    let desc = '';
    if (result.bestMove) desc += `**Best move:** \`${result.bestMove}\`\n`;
    if (result.evaluation !== undefined) desc += `**Eval:** ${result.evaluation}\n`;
    if (result.pv) desc += `**Line:** ${result.pv}\n`;
    if (result.material) desc += `**Material:** ${result.material}`;
    return embed({
      title: '🔍 Position Analysis',
      description: desc || JSON.stringify(result).slice(0, 500),
      footer: variant !== 'standard' ? `Variant: ${variant}` : '',
      color: 0x0c4f8d,
    });
  } catch (e) {
    return ephemeral(`Analysis failed: ${e.message}`);
  }
}

async function cmdPlay(options, env) {
  const variant = getOption(options, 'variant') || 'standard';
  const moves = getOption(options, 'moves') || '';
  const moveList = moves.split(/[\s,]+/).filter(Boolean);
  if (!moveList.length) return ephemeral('Provide moves (e.g. `/play moves:e4 e5 Nf3`).');
  try {
    const result = await callTool('chess_make_moves', { variant, moves: moveList }, env);
    let desc = `**Moves:** ${moveList.join(' ')}\n`;
    if (result.fen) desc += `**FEN:** \`${result.fen}\`\n`;
    if (result.status) desc += `**Status:** ${result.status}`;
    return embed({
      title: `♟️ Game (${moveList.length} moves)`,
      description: desc,
      footer: variant !== 'standard' ? `Variant: ${variant}` : '',
      color: 0x0c4f8d,
    });
  } catch (e) {
    return ephemeral(`Play failed: ${e.message}`);
  }
}

async function cmdSearch(options, env) {
  const query = getOption(options, 'query');
  if (!query) return ephemeral('Provide a search query (e.g. `/search query:dice movement`).');
  try {
    const result = await callTool('rules_search', { query }, env);
    const hits = result.results || [];
    if (!hits.length) return embed({ title: '🔍 Rules Search', description: `No results for "${query}".`, color: 0xd11a1a });
    const lines = hits.slice(0, 8).map(h => `**${h.game}** ${h.heading ? `· ${h.heading}` : ''}\n> ${(h.content || '').slice(0, 100)}…`);
    return embed({
      title: `🔍 "${query}" — ${hits.length} results`,
      description: lines.join('\n\n'),
      footer: hits.length > 8 ? `Showing 8 of ${hits.length}` : '',
      color: 0xd11a1a,
    });
  } catch (e) {
    return ephemeral(`Search failed: ${e.message}`);
  }
}

async function cmdDraft(options, env) {
  const players = getOption(options, 'players') || 6;
  const poolSize = getOption(options, 'pool_size') || 3;
  const expansion = getOption(options, 'expansion') || 'pok';
  try {
    const result = await callTool('ti4_draft_factions', { players, pool_size: poolSize, expansions: [expansion === 'base' ? 'base' : 'base', 'pok'] }, env);
    if (result.error) return ephemeral(result.error);
    const lines = result.draft.map(d => `**Player ${d.player}:** ${d.options.join(' · ')}`);
    return embed({
      title: '🪐 Milty Draft',
      description: lines.join('\n'),
      footer: `${poolSize} picks each · ${result.totalPool} factions in pool`,
      color: 0x0c4f8d,
    });
  } catch (e) {
    return ephemeral(`Draft failed: ${e.message}`);
  }
}

async function cmdObjectives(options, env) {
  const stage = getOption(options, 'stage') || 1;
  const count = getOption(options, 'count') || 5;
  try {
    const result = await callTool('ti4_draw_objectives', { stage, count }, env);
    if (result.error) return ephemeral(result.error);
    const lines = result.drawn.map(o => `• ${o.name || o.text || o}`);
    return embed({
      title: `🪐 Stage ${stage} Objectives`,
      description: lines.join('\n'),
      footer: `${result.count} drawn from ${result.poolSize} available`,
      color: 0x0c4f8d,
    });
  } catch (e) {
    return ephemeral(`Objectives failed: ${e.message}`);
  }
}

async function cmdAgendas(options, env) {
  const count = getOption(options, 'count') || 2;
  try {
    const result = await callTool('ti4_draw_agendas', { count }, env);
    if (result.error) return ephemeral(result.error);
    const lines = result.drawn.map(a => {
      let text = `**${a.name || a.title}**`;
      if (a.type) text += ` (${a.type})`;
      if (a.for) text += `\n> For: ${a.for}`;
      if (a.against) text += `\n> Against: ${a.against}`;
      return text;
    });
    return embed({
      title: '🪐 Agenda Phase',
      description: lines.join('\n\n'),
      footer: `${result.count} drawn from ${result.poolSize} agendas`,
      color: 0x0c4f8d,
    });
  } catch (e) {
    return ephemeral(`Agendas failed: ${e.message}`);
  }
}

async function cmdSetup(options, env) {
  const players = getOption(options, 'players') || 3;
  try {
    const result = await callTool('nukes_setup_generator', { players }, env);
    const grouped = {};
    result.territories.forEach(t => {
      if (!grouped[t.player]) grouped[t.player] = [];
      grouped[t.player].push(t.territory);
    });
    const lines = Object.entries(grouped).map(([p, terrs]) => `**Player ${p}:** territories ${terrs.join(', ')}`);
    return embed({
      title: '☢️ Nukes Setup',
      description: lines.join('\n'),
      footer: `${result.totalTerritories} territories · Seed: ${result.seed}`,
      color: 0x3a9928,
    });
  } catch (e) {
    return ephemeral(`Setup failed: ${e.message}`);
  }
}

async function cmdOdds(options, env) {
  const numbersStr = getOption(options, 'numbers') || '';
  const numbers = numbersStr.split(',').map(n => parseInt(n.trim())).filter(n => n >= 2 && n <= 12);
  if (!numbers.length) return ephemeral('Provide settlement numbers (e.g. `/odds numbers:5,6,8,9`).');
  try {
    const result = await callTool('colony_dice_odds', { numbers }, env);
    const lines = result.individual.map(n => `**${n.number}:** ${n.percent}`);
    lines.push('', `**At least one:** ${result.probabilityAtLeastOne}`, `**Expected rolls:** ${result.expectedRollsPerResource}`);
    return embed({
      title: '🎲 Colony Dice Odds',
      description: lines.join('\n'),
      color: 0x3a9928,
    });
  } catch (e) {
    return ephemeral(`Odds calculation failed: ${e.message}`);
  }
}

async function cmdMancala(options, env) {
  const pit = getOption(options, 'pit');
  const variant = getOption(options, 'variant') || 'kalah';
  if (pit === null || pit === undefined) return ephemeral('Provide a pit index (0-5 for player 1, 7-12 for player 2).');
  try {
    const result = await callTool('mancala_simulate_move', { board: [4,4,4,4,4,4,0,4,4,4,4,4,4,0], pit, variant }, env);
    if (result.error) return ephemeral(result.error);
    const p1 = result.board.slice(0, 7);
    const p2 = result.board.slice(7);
    let desc = `**Board after sowing from pit ${pit}:**\n`;
    desc += `P2: [${p2.slice(0, 6).reverse().join(', ')}] Store: ${p2[6]}\n`;
    desc += `P1: [${p1.slice(0, 6).join(', ')}] Store: ${p1[6]}\n`;
    if (result.extraTurn) desc += '\n⭐ **Extra turn!**';
    if (result.captured) desc += `\n💰 Captured ${result.captured} seeds`;
    return embed({
      title: `🫘 Mancala (${variant})`,
      description: desc,
      color: 0x3a9928,
    });
  } catch (e) {
    return ephemeral(`Mancala failed: ${e.message}`);
  }
}

async function cmdMorris(options, env) {
  const player = getOption(options, 'player') || 1;
  const phase = getOption(options, 'phase') || 'place';
  try {
    const board = new Array(24).fill(0);
    const result = await callTool('morris_legal_moves', { board, player, phase }, env);
    return embed({
      title: `⚫ Nine Men's Morris`,
      description: `**Phase:** ${phase}\n**Player ${player}** has **${result.count}** legal moves.\n\nMoves: ${result.moves.slice(0, 10).map(m => `${m.type} → ${m.to}`).join(', ')}${result.count > 10 ? '…' : ''}`,
      color: 0x3a9928,
    });
  } catch (e) {
    return ephemeral(`Morris failed: ${e.message}`);
  }
}

async function cmdUr(options, env) {
  try {
    const result = await callTool('ur_roll_dice', {}, env);
    const pips = result.dice.map(d => d ? '●' : '○').join(' ');
    return embed({
      title: '🎲 Royal Ur Dice',
      description: `${pips}\n\n**Roll: ${result.total}** (${result.description})`,
      color: 0xd4a017,
    });
  } catch (e) {
    return ephemeral(`Ur dice failed: ${e.message}`);
  }
}

async function cmdCowries(options, env) {
  const game = getOption(options, 'game') || 'pachisi';
  try {
    const result = await callTool('pachisi_roll_cowries', { game }, env);
    if (game === 'chaupar') {
      return embed({
        title: '🐚 Chaupar Dice',
        description: `Dice: [${result.dice.join(', ')}]\n**Total: ${result.total}**`,
        color: 0xd4a017,
      });
    }
    const shells = result.shells.map(s => s ? '⬆' : '⬇').join(' ');
    let desc = `${shells}\n\n**Faces up:** ${result.facesUp} → **Move: ${result.move}**`;
    if (result.isGrace) desc += '\n⭐ **Grace! Extra turn**';
    return embed({
      title: '🐚 Pachisi Cowries',
      description: desc,
      color: 0xd4a017,
    });
  } catch (e) {
    return ephemeral(`Cowries failed: ${e.message}`);
  }
}

async function cmdTest(interaction, env) {
  const channelId = interaction.channel_id;
  const token = env.DISCORD_TOKEN;

  const tests = [
    { cmd: '/roll 3d6+2', tool: 'dice_roll', args: { notation: '3d6+2' } },
    { cmd: '/flip pizza,tacos,sushi', tool: 'coin_flip', args: { options: ['pizza', 'tacos', 'sushi'] } },
    { cmd: '/teams Alice,Bob,Charlie,Dave', tool: 'team_split', args: { players: ['Alice', 'Bob', 'Charlie', 'Dave'], teams: 2 } },
    { cmd: '/variants Tactical', tool: 'chess_list_variants', args: { group: 'Tactical' } },
    { cmd: '/validate e2e4', tool: 'chess_validate_move', args: { variant: 'standard', move: 'e2e4' } },
    { cmd: '/moves (starting position)', tool: 'chess_get_legal_moves', args: { variant: 'standard' } },
    { cmd: '/analyze (starting position)', tool: 'chess_analyze_position', args: { variant: 'standard' } },
    { cmd: '/play e4 e5 Nf3', tool: 'chess_make_moves', args: { variant: 'standard', moves: ['e2e4', 'e7e5', 'g1f3'] } },
    { cmd: '/openings', tool: 'chess_get_opening_book', args: { variant: 'standard' } },
    { cmd: '/puzzle (standard)', tool: 'chess_generate_puzzle', args: { variant: 'standard', include_svg: false } },
    { cmd: '/puzzle types (atomic)', tool: 'chess_list_puzzle_types', args: { variant: 'atomic' } },
    { cmd: '/hexgames', tool: 'hex_list_games', args: {} },
    { cmd: '/map nukes 4', tool: 'hex_generate_map', args: { game: 'nukes', players: 4, seed: 'test' } },
    { cmd: '/rules (list all)', tool: 'rules_list_games', args: {} },
    { cmd: '/rules backgammon', tool: 'rules_get_game', args: { slug: 'backgammon' } },
    { cmd: '/howtoplay backgammon Acey-Deucey', tool: 'rules_get_variant', args: { game: 'backgammon', variant: 'acey-deucey' } },
    { cmd: '/search dice movement', tool: 'rules_search', args: { query: 'dice movement' } },
    { cmd: '/randomgame', tool: 'rules_random', args: {} },
    { cmd: '/factions 5 pok', tool: 'ti4_random_factions', args: { players: 5, expansion: 'pok' } },
    { cmd: '/draft 6 3', tool: 'ti4_draft_factions', args: { players: 6, pool_size: 3, expansions: ['base', 'pok'] } },
    { cmd: '/objectives 1', tool: 'ti4_draw_objectives', args: { stage: 1, count: 5 } },
    { cmd: '/agendas 2', tool: 'ti4_draw_agendas', args: { count: 2 } },
    { cmd: '/setup 4', tool: 'nukes_setup_generator', args: { players: 4 } },
    { cmd: '/odds 5,6,8,9', tool: 'colony_dice_odds', args: { numbers: [5, 6, 8, 9] } },
    { cmd: '/mancala 3', tool: 'mancala_simulate_move', args: { board: [4,4,4,4,4,4,0,4,4,4,4,4,4,0], pit: 3, variant: 'kalah' } },
    { cmd: '/morris', tool: 'morris_legal_moves', args: { board: new Array(24).fill(0), player: 1, phase: 'place' } },
    { cmd: '/ur', tool: 'ur_roll_dice', args: {} },
    { cmd: '/cowries', tool: 'pachisi_roll_cowries', args: { shells: 6, game: 'pachisi' } },
    { cmd: '/jam status', tool: 'jam_status', args: {} },
    { cmd: '/jam timer', tool: 'jam_timer', args: {} },
    { cmd: '/jam vote', tool: 'jam_vote', args: {} },
  ];

  const postMessage = async (content, embeds) => {
    await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
      method: 'POST',
      headers: { 'Authorization': `Bot ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, embeds }),
    });
  };

  // Respond immediately, then post results async
  setTimeout(async () => {
    await postMessage('**🧪 Tool Test Suite — 31 commands**\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        const result = await callTool(test.tool, test.args, env);
        const hasError = result && result.error;
        const icon = hasError ? '❌' : '✅';
        const status = hasError ? `FAIL: ${result.error}` : 'PASS';
        if (hasError) failed++; else passed++;

        const preview = hasError ? result.error : JSON.stringify(result).slice(0, 150);
        await postMessage(null, [{
          title: `${icon} ${test.cmd}`,
          description: `\`${test.tool}\`\n\`\`\`json\n${preview}\n\`\`\``,
          color: hasError ? 0xd11a1a : 0x3a9928,
        }]);
      } catch (e) {
        failed++;
        await postMessage(null, [{
          title: `💥 ${test.cmd}`,
          description: `\`${test.tool}\`\nException: ${e.message}`,
          color: 0xd11a1a,
        }]);
      }
    }

    await postMessage(`\n**Results: ${passed} passed, ${failed} failed out of ${tests.length}**\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  }, 100);

  return embed({
    title: '🧪 Running Test Suite',
    description: `Testing ${tests.length} tools against \`tools.moddable.games\`…\nResults will appear below.`,
    color: 0x0a0d2a,
  });
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
      '`/variants` — Browse 70+ chess variants',
      '`/validate` — Check if a move is legal',
      '`/moves` — Legal moves for a position',
      '`/analyze` — Evaluate a position',
      '`/play` — Play moves and show result',
      '`/openings` — Opening book moves',
      '`/puzzle` — Get a chess puzzle',
      '`/puzzle types` — Discover puzzle categories',
      '',
      '**Hex Maps**',
      '`/hexgames` — Available hex map games',
      '`/map` — Generate a hex map',
      '',
      '**Rules Library**',
      '`/rules` — Browse all games',
      '`/rules game:<slug>` — Game details + variants',
      '`/howtoplay` — Get variant rules',
      '`/search` — Search rules by keyword',
      '`/randomgame` — Random game or variant',
      '',
      '**Twilight Imperium**',
      '`/factions` — Random faction assignment',
      '`/draft` — Milty draft with pick pools',
      '`/objectives` — Draw public objectives',
      '`/agendas` — Draw agenda cards',
      '',
      '**Game Tools**',
      '`/setup` — Random Nukes territory assignment',
      '`/odds` — Colony dice probability',
      '`/mancala` — Simulate a mancala move',
      '`/morris` — Nine Men\'s Morris moves',
      '`/ur` — Roll Royal Ur dice',
      '`/cowries` — Roll Pachisi shells',
      '',
      '**Mod Jam**',
      '`/jam status` — Current jam state',
      '`/jam timer` — Time remaining',
      '`/jam vote` — Vote standings',
      '',
      '**Admin**',
      '`/test` — Run full test suite',
    ].join('\n'),
    footer: 'The House always wins. · 39 tools at tools.moddable.games',
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
