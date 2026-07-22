import RULES_INDEX from './rules-index.json';
import GAMES_META from './games-meta.json';

function buildGameMap() {
  const map = {};
  for (const entry of RULES_INDEX) {
    const g = entry.game;
    if (!map[g]) map[g] = { slug: g, title: entry.gameTitle, sections: {} };
    const sec = entry.section;
    if (!map[g].sections[sec]) map[g].sections[sec] = [];
    map[g].sections[sec].push(entry);
  }
  return map;
}

const GAME_MAP = buildGameMap();
const META_MAP = Object.fromEntries(GAMES_META.map(g => [g.slug, g]));

function listGames(args) {
  const results = GAMES_META.map(g => ({
    slug: g.slug,
    title: g.title,
    tagline: g.tagline,
    type: g.type,
    status: g.status,
    players: g.players,
    duration: g.duration,
    variantCount: g.variants.length,
    rulesUrl: `https://rules.moddable.games/dist/${g.slug}/`,
  }));
  results.sort((a, b) => a.title.localeCompare(b.title));
  return { games: results, total: results.length };
}

function getGame(args) {
  const slug = args?.slug;
  if (!slug) return { error: 'Required: slug (e.g. "backgammon", "draughts", "nukes")' };
  const meta = META_MAP[slug];
  const indexed = GAME_MAP[slug];
  if (!meta && !indexed) {
    return { error: `Unknown game: "${slug}". Use rules_list_games to see available options.` };
  }
  return {
    slug,
    title: meta?.title || indexed?.title || slug,
    players: meta?.players || null,
    duration: meta?.duration || null,
    age: meta?.age || null,
    tagline: meta?.tagline || null,
    type: meta?.type || null,
    status: meta?.status || null,
    variantHub: meta?.variantHub || false,
    variantCount: meta?.variants?.length || 0,
    variants: (meta?.variants || []).map(v => v.title),
    sections: meta?.sections || [],
    howToPlay: meta?.howToPlay || null,
    rulesUrl: `https://rules.moddable.games/dist/${slug}/`,
  };
}

function getVariant(args) {
  const game = args?.game;
  const variant = args?.variant;
  if (!game) return { error: 'Required: game (e.g. "backgammon")' };
  const indexed = GAME_MAP[game];
  const meta = META_MAP[game];
  if (!indexed && !meta) return { error: `Unknown game: "${game}". Use rules_list_games to see available options.` };
  if (!indexed) return { error: `Game "${game}" has metadata but no indexed content yet.` };

  let sectionKey;
  if (variant) {
    const variantLower = variant.toLowerCase();
    sectionKey = Object.keys(indexed.sections).find(
      s => s.toLowerCase() === variantLower || s.toLowerCase().includes(variantLower)
    );
  } else {
    const title = meta?.title || indexed.title || '';
    const exactAttempts = ['how to play', game.toLowerCase(), title.toLowerCase()];
    for (const attempt of exactAttempts) {
      if (!attempt) continue;
      sectionKey = Object.keys(indexed.sections).find(
        s => s.toLowerCase() === attempt
      );
      if (sectionKey) break;
    }
    if (!sectionKey) {
      for (const attempt of exactAttempts) {
        if (!attempt) continue;
        sectionKey = Object.keys(indexed.sections).find(
          s => s.toLowerCase().startsWith(attempt) || attempt.startsWith(s.toLowerCase())
        );
        if (sectionKey) break;
      }
    }
    if (!sectionKey) {
      const allSections = Object.keys(indexed.sections).filter(s => s !== 'Variant Library' && s !== 'Attribution');
      const preferred = allSections.find(s => {
        const l = s.toLowerCase();
        return l.includes('standard') || l.includes('classic') || l.includes('international') || l.includes('official');
      });
      if (preferred) {
        sectionKey = preferred;
      } else {
        const metaVariants = meta?.variants || [];
        const preferredVariant = metaVariants.find(v => {
          const l = v.title.toLowerCase();
          return l.includes('standard') || l.includes('classic') || l.includes('international') || l.includes('official');
        });
        const pick = preferredVariant?.title || metaVariants[0]?.title;
        if (pick) {
          sectionKey = allSections.find(s => s.toLowerCase() === pick.toLowerCase() || s.toLowerCase().includes(pick.toLowerCase()));
        }
        if (!sectionKey) sectionKey = allSections[0] || null;
      }
    }
  }
  if (!sectionKey) {
    const available = meta?.variants?.map(v => v.title) || Object.keys(indexed.sections).slice(0, 20);
    return {
      error: `Variant "${variant || 'default'}" not found in ${game}. Available: ${available.join(', ')}`,
    };
  }
  const entries = indexed.sections[sectionKey];
  const content = entries.map(e => `## ${e.heading}\n${e.content}`).join('\n\n');
  const variantPath = entries[0]?.variantUrl || entries[0]?.variant;
  const rulesUrl = variantPath
    ? `https://rules.moddable.games/${variantPath}`
    : `https://rules.moddable.games/dist/${game}/`;
  return {
    game,
    gameTitle: indexed.title,
    variant: sectionKey,
    content,
    entryCount: entries.length,
    rulesUrl,
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
      anchor: r.anchor,
      variantUrl: r.variantUrl || null,
      dataType: r.dataType || null,
      category: r.category || null,
      score: r.score,
    })),
    total: results.length,
    showing: top.length,
  };
}

function randomGame(args) {
  const family = args?.family;
  if (family) {
    const meta = META_MAP[family];
    if (!meta) return { error: `Unknown game: "${family}". Use rules_list_games to see available options.` };
    if (meta.variants.length > 0) {
      const pick = meta.variants[Math.floor(Math.random() * meta.variants.length)];
      return getVariant({ game: family, variant: pick.title });
    }
    return getVariant({ game: family });
  }
  const all = GAMES_META.filter(g => g.status === 'live');
  const pick = all[Math.floor(Math.random() * all.length)];
  return getGame({ slug: pick.slug });
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
