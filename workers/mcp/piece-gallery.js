import GALLERY_INDEX from '../../../moddable-chess/assets/pieces/gallery-index.json';

const GALLERY_BASE_URL = 'https://chess.moddable.games/assets/pieces/sets';

export const PIECE_GALLERY_TOOLS = [
  {
    name: 'piece_gallery_search',
    description: 'Search and filter piece sets from the Moddable Chess piece gallery (96 sets, 2,550 SVGs across 19 game families). Filter by family, license, author, or search by name. Returns metadata for matching sets with preview URLs.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search term to match against set name, author, or ID (case-insensitive).',
        },
        family: {
          type: 'string',
          description: 'Filter by game family (e.g. "chess", "shogi", "xiangqi", "janggi", "draughts", "go", "emoji", "oware", "abalone", "othello", "backgammon", "amazons", "breakthrough", "fairy-chess", "lines-of-action", "makruk", "sittuyin", "playing-cards", "togyzkumalak").',
        },
        license: {
          type: 'string',
          description: 'Filter by SPDX license (e.g. "MIT", "CC-BY-4.0", "CC0-1.0", "Apache-2.0", "GPL-2.0+").',
        },
        author: {
          type: 'string',
          description: 'Filter by author name (case-insensitive partial match).',
        },
        playable: {
          type: 'boolean',
          description: 'Filter to only playable sets (usable in the chess.moddable.games play UI).',
        },
        recolorable: {
          type: 'boolean',
          description: 'Filter to only recolorable sets (SVGs support color theming).',
        },
        limit: {
          type: 'number',
          description: 'Max results to return (default 20, max 96).',
        },
      },
    },
  },
  {
    name: 'piece_gallery_get_set',
    description: 'Get full details for a specific piece set including manifest, piece file list, direct SVG URLs, and a preview image URL. Use piece_gallery_search to find set IDs first.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The piece set ID (e.g. "chessnut", "kahu-shogi-international", "fluent-emoji").',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'piece_gallery_stats',
    description: 'Get aggregate statistics for the piece gallery: total sets, SVG count, breakdown by family, license distribution, author list, and playable/recolorable counts.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

export function handlePieceGalleryToolCall(name, args) {
  switch (name) {
    case 'piece_gallery_search': return pieceGallerySearch(args);
    case 'piece_gallery_get_set': return pieceGalleryGetSet(args);
    case 'piece_gallery_stats': return pieceGalleryStats(args);
    default: return { error: `Unknown piece gallery tool: ${name}` };
  }
}

function pieceGallerySearch(args) {
  let results = [...GALLERY_INDEX];

  const query = args && args.query;
  const family = args && args.family;
  const license = args && args.license;
  const author = args && args.author;
  const playable = args && args.playable;
  const recolorable = args && args.recolorable;
  const limit = Math.min(Math.max((args && args.limit) || 20, 1), 96);

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(s =>
      s.id.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      (s.author && s.author.toLowerCase().includes(q))
    );
  }

  if (family) {
    const f = family.toLowerCase();
    results = results.filter(s => s.family === f);
  }

  if (license) {
    const l = license.toLowerCase();
    results = results.filter(s => s.license && s.license.toLowerCase() === l);
  }

  if (author) {
    const a = author.toLowerCase();
    results = results.filter(s => s.author && s.author.toLowerCase().includes(a));
  }

  if (playable === true) {
    results = results.filter(s => s.playable === true);
  } else if (playable === false) {
    results = results.filter(s => !s.playable);
  }

  if (recolorable === true) {
    results = results.filter(s => s.recolorable === true);
  } else if (recolorable === false) {
    results = results.filter(s => !s.recolorable);
  }

  const total = results.length;
  results = results.slice(0, limit);

  return {
    total,
    returned: results.length,
    sets: results.map(s => ({
      id: s.id,
      name: s.name,
      family: s.family,
      author: s.author,
      license: s.license,
      pieceCount: Object.keys(s.pieces || {}).length,
      playable: s.playable || false,
      recolorable: s.recolorable || false,
      previewUrl: `https://tools.moddable.games/api/pieces.png?set=${s.id}&size=64`,
      galleryUrl: `https://chess.moddable.games/docs/pieces.html#${s.id}`,
    })),
  };
}

function pieceGalleryGetSet(args) {
  const id = args && args.id;
  if (!id) return { error: 'id parameter is required' };

  const set = GALLERY_INDEX.find(s => s.id === id);
  if (!set) {
    const suggestions = GALLERY_INDEX
      .filter(s => s.id.includes(id.toLowerCase()) || s.name.toLowerCase().includes(id.toLowerCase()))
      .slice(0, 5)
      .map(s => s.id);
    return {
      error: `Set "${id}" not found.${suggestions.length ? ' Did you mean: ' + suggestions.join(', ') + '?' : ''}`,
      availableSets: GALLERY_INDEX.length,
    };
  }

  const pieces = set.pieces || {};
  const pieceList = Object.entries(pieces).map(([key, file]) => ({
    key,
    file,
    svgUrl: `${GALLERY_BASE_URL}/${set.id}/${file}`,
  }));

  return {
    id: set.id,
    name: set.name,
    family: set.family,
    author: set.author,
    authorUrl: set.authorUrl || null,
    license: set.license,
    licenseUrl: set.licenseUrl || null,
    source: set.source || null,
    playable: set.playable || false,
    recolorable: set.recolorable || false,
    pieceCount: pieceList.length,
    pieces: pieceList,
    previewUrl: `https://tools.moddable.games/api/pieces.png?set=${set.id}&size=80`,
    galleryUrl: `https://chess.moddable.games/docs/pieces.html#${set.id}`,
  };
}

function pieceGalleryStats() {
  const families = {};
  const licenses = {};
  const authors = {};
  let totalPieces = 0;
  let playableCount = 0;
  let recolorableCount = 0;

  for (const set of GALLERY_INDEX) {
    const pieceCount = Object.keys(set.pieces || {}).length;
    totalPieces += pieceCount;

    families[set.family] = (families[set.family] || 0) + 1;
    if (set.license) licenses[set.license] = (licenses[set.license] || 0) + 1;
    if (set.author) authors[set.author] = (authors[set.author] || 0) + 1;
    if (set.playable) playableCount++;
    if (set.recolorable) recolorableCount++;
  }

  const sortedFamilies = Object.entries(families)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  const sortedLicenses = Object.entries(licenses)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  const sortedAuthors = Object.entries(authors)
    .sort((a, b) => b[1] - a[1])
    .map(([name, sets]) => ({ name, sets }));

  return {
    totalSets: GALLERY_INDEX.length,
    totalPieces,
    totalFamilies: sortedFamilies.length,
    playableCount,
    recolorableCount,
    families: sortedFamilies,
    licenses: sortedLicenses,
    authors: sortedAuthors,
  };
}

export function getSetInfo(setId) {
  return GALLERY_INDEX.find(s => s.id === setId) || null;
}

export async function renderPieceGridSvg(setId, size) {
  const set = GALLERY_INDEX.find(s => s.id === setId);
  if (!set) return null;

  const pieces = set.pieces || {};
  const keys = Object.keys(pieces).slice(0, 12);
  const count = keys.length;
  if (count === 0) return null;

  const cellSize = size || 64;
  const cols = Math.min(count, 6);
  const rows = Math.ceil(count / cols);
  const padding = 4;
  const gridWidth = cols * (cellSize + padding) - padding;
  const gridHeight = rows * (cellSize + padding) - padding;

  const fetches = keys.map(k =>
    fetch(`${GALLERY_BASE_URL}/${set.id}/${pieces[k]}`)
      .then(r => r.ok ? r.text() : null)
      .catch(() => null)
  );
  const svgTexts = await Promise.all(fetches);

  const defs = [];
  const uses = [];

  for (let i = 0; i < keys.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * (cellSize + padding);
    const y = row * (cellSize + padding);
    uses.push(`<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="#2a2a4a" rx="3"/>`);

    const raw = svgTexts[i];
    if (raw) {
      const vbMatch = raw.match(/viewBox=["']([^"']+)["']/);
      const vb = vbMatch ? vbMatch[1] : '0 0 45 45';
      let inner = raw
        .replace(/<\?xml[^?]*\?>/g, '')
        .replace(/<!DOCTYPE[^>]*>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<svg[\s\S]*?>/, '')
        .replace(/<\/svg>\s*$/, '')
        .replace(/\s*xmlns:\w+="[^"]*"/g, '')
        .replace(/\s+(?!xlink:href)\w+:\w[\w.-]*="[^"]*"/g, '')
        .replace(/<\w+:\w+[^>]*?\/>/g, '')
        .replace(/<\w+:\w+[^>]*?>[\s\S]*?<\/\w+:\w+>/g, '')
        .replace(/<metadata[\s\S]*?<\/metadata>/gi, '')
        .trim();
      const symbolId = `p${i}`;
      defs.push(`<symbol id="${symbolId}" viewBox="${vb}">${inner}</symbol>`);
      uses.push(`<use href="#${symbolId}" x="${x + 4}" y="${y + 4}" width="${cellSize - 8}" height="${cellSize - 8}"/>`);
    }
  }

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${gridWidth}" height="${gridHeight}" viewBox="0 0 ${gridWidth} ${gridHeight}">`;
  svg += `<defs>${defs.join('')}</defs>`;
  svg += `<rect width="${gridWidth}" height="${gridHeight}" fill="#1a1a2e" rx="4"/>`;
  svg += uses.join('');
  svg += `</svg>`;
  return svg;
}
