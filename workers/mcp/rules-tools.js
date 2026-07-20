import RULES_INDEX from './rules-index.json';
import GAMES_SYNC from '../../data/games-sync.json';

function buildGameMap() {
  const map = {};
  for (const entry of RULES_INDEX) {
    const g = entry.game;
    if (!map[g]) map[g] = { slug: g, title: entry.gameTitle, sections: {}, variants: new Set() };
    const sec = entry.section;
    if (!map[g].sections[sec]) map[g].sections[sec] = [];
    map[g].sections[sec].push(entry);
    if (sec !== 'Variant Library' && sec !== 'Attribution') {
      map[g].variants.add(sec);
    }
  }
  for (const g of Object.values(map)) {
    g.variantCount = g.variants.size;
    g.variants = [...g.variants].sort();
  }
  return map;
}

const GAME_MAP = buildGameMap();

function getGameMeta(slug) {
  const sync = GAMES_SYNC[slug];
  if (!sync) return null;
  return {
    slug,
    title: sync.title,
    version: sync.version,
    players: sync.players,
    duration: sync.duration,
    age: sync.age,
    tagline: sync.tagline,
    type: sync.type,
    baseGame: sync.base_game,
    status: sync.status,
    published: sync.published,
  };
}

function listGames(args) {
  const status = args?.status || 'published';
  const results = [];
  const seen = new Set();
  for (const [slug, sync] of Object.entries(GAMES_SYNC)) {
    if (status === 'published' && !sync.published) continue;
    if (status !== 'all' && status !== 'published' && sync.status !== status) continue;
    const indexed = GAME_MAP[slug];
    results.push({
      slug,
      title: sync.title,
      tagline: sync.tagline,
      type: sync.type,
      status: sync.status,
      players: sync.players,
      duration: sync.duration,
      variantCount: indexed ? indexed.variantCount : 0,
      rulesUrl: indexed ? `https://rules.moddable.games/${slug}/` : null,
    });
    seen.add(slug);
  }
  for (const [slug, indexed] of Object.entries(GAME_MAP)) {
    if (seen.has(slug)) continue;
    results.push({
      slug,
      title: indexed.title,
      tagline: null,
      type: null,
      status: 'indexed',
      players: null,
      duration: null,
      variantCount: indexed.variantCount,
      rulesUrl: `https://rules.moddable.games/${slug}/`,
    });
  }
  results.sort((a, b) => a.title.localeCompare(b.title));
  return { games: results, total: results.length };
}

function getGame(args) {
  const slug = args?.slug;
  if (!slug) return { error: 'Required: slug (e.g. "backgammon", "draughts", "nukes")' };
  const meta = getGameMeta(slug);
  const indexed = GAME_MAP[slug];
  if (!meta && !indexed) {
    return { error: `Unknown game: "${slug}". Use rules_list_games to see available options.` };
  }
  const summary = indexed
    ? indexed.sections['Variant Library']?.[0]?.content || null
    : null;
  return {
    ...(meta || { slug, title: indexed?.title }),
    variantCount: indexed?.variantCount || 0,
    variants: indexed?.variants || [],
    summary,
    rulesUrl: indexed ? `https://rules.moddable.games/${slug}/` : null,
  };
}

function getVariant(args) {
  const game = args?.game;
  const variant = args?.variant;
  if (!game) return { error: 'Required: game (e.g. "backgammon")' };
  if (!variant) return { error: 'Required: variant (e.g. "Acey-Deucey", "Standard Rules")' };
  const indexed = GAME_MAP[game];
  if (!indexed) return { error: `Unknown game: "${game}". Use rules_list_games to see available options.` };
  const variantLower = variant.toLowerCase();
  const sectionKey = Object.keys(indexed.sections).find(
    s => s.toLowerCase() === variantLower || s.toLowerCase().includes(variantLower)
  );
  if (!sectionKey) {
    return {
      error: `Variant "${variant}" not found in ${game}. Available: ${indexed.variants.slice(0, 20).join(', ')}`,
    };
  }
  const entries = indexed.sections[sectionKey];
  const content = entries.map(e => `## ${e.heading}\n${e.content}`).join('\n\n');
  return {
    game,
    gameTitle: indexed.title,
    variant: sectionKey,
    content,
    entryCount: entries.length,
    rulesUrl: `https://rules.moddable.games/${game}/variants/${sectionKey.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}/`,
  };
}

function searchRules(args) {
  const query = args?.query;
  if (!query) return { error: 'Required: query (search term)' };
  const terms = query.toLowerCase().split(/\s+/);
  const results = [];
  for (const entry of RULES_INDEX) {
    const text = `${entry.gameTitle} ${entry.section} ${entry.heading} ${entry.content}`.toLowerCase();
    const score = terms.filter(t => text.includes(t)).length;
    if (score > 0) {
      results.push({ ...entry, score });
    }
  }
  results.sort((a, b) => b.score - a.score);
  const top = results.slice(0, args?.limit || 10);
  return {
    results: top.map(r => ({
      game: r.game,
      gameTitle: r.gameTitle,
      section: r.section,
      heading: r.heading,
      content: r.content,
      score: r.score,
    })),
    total: results.length,
    showing: top.length,
  };
}

function randomGame(args) {
  const family = args?.family;
  if (family) {
    const indexed = GAME_MAP[family];
    if (!indexed) return { error: `Unknown game: "${family}". Use rules_list_games to see available options.` };
    const variants = indexed.variants;
    if (!variants.length) return { error: `No variants indexed for "${family}".` };
    const pick = variants[Math.floor(Math.random() * variants.length)];
    return getVariant({ game: family, variant: pick });
  }
  const published = Object.entries(GAMES_SYNC)
    .filter(([, v]) => v.published)
    .map(([k]) => k);
  const slug = published[Math.floor(Math.random() * published.length)];
  return getGame({ slug });
}

export const RULES_TOOLS = [
  {
    name: 'rules_list_games',
    description: 'List all game families in the Moddable Games rules library. Returns titles, player counts, variant counts, and URLs.',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['published', 'live', 'all'],
          description: 'Filter by status. "published" (default) shows all published games, "live" shows only fully released, "all" includes unpublished.',
        },
      },
    },
  },
  {
    name: 'rules_get_game',
    description: 'Get full metadata and variant list for a specific game family. Returns players, duration, tagline, variant names, and rules URL.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'Game slug (e.g. "backgammon", "draughts", "nukes", "moddable-chess"). Use rules_list_games to see all.',
        },
      },
      required: ['slug'],
    },
  },
  {
    name: 'rules_get_variant',
    description: 'Get rules content for a specific variant within a game family. Returns headings, rules text, and direct URL.',
    inputSchema: {
      type: 'object',
      properties: {
        game: {
          type: 'string',
          description: 'Game family slug (e.g. "backgammon", "draughts").',
        },
        variant: {
          type: 'string',
          description: 'Variant name (e.g. "Acey-Deucey", "Standard Rules", "German Draughts"). Partial match supported.',
        },
      },
      required: ['game', 'variant'],
    },
  },
  {
    name: 'rules_search',
    description: 'Search the entire rules library by keyword. Returns matching entries ranked by relevance across all games and variants.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (e.g. "capture", "dice", "promotion", "4 players").',
        },
        limit: {
          type: 'number',
          description: 'Max results to return (default 10, max 50).',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'rules_random',
    description: 'Pick a random game or variant from the library. Optionally constrain to a specific game family for a random variant within it.',
    inputSchema: {
      type: 'object',
      properties: {
        family: {
          type: 'string',
          description: 'Optional game family slug to pick a random variant from (e.g. "backgammon" for a random backgammon variant).',
        },
      },
    },
  },
];

export function handleRulesToolCall(name, args) {
  switch (name) {
    case 'rules_list_games': return listGames(args);
    case 'rules_get_game': return getGame(args);
    case 'rules_get_variant': return getVariant(args);
    case 'rules_search': return searchRules(args);
    case 'rules_random': return randomGame(args);
    default: return { error: `Unknown rules tool: ${name}` };
  }
}
