import ORACLE_DATA from './oracle-data.json';

const THRESHOLDS = {
  almost_certain: 90,
  likely: 75,
  fifty_fifty: 50,
  unlikely: 25,
  small_chance: 10,
};

const RECIPES = {
  starforged_scene: {
    name: 'Starforged Scene',
    game: 'starforged',
    description: 'Action + Theme combined with Descriptor + Focus for a full narrative seed.',
    tables: ['action', 'theme', 'descriptor', 'focus'],
  },
  npc_encounter: {
    name: 'NPC Encounter',
    game: 'starforged',
    description: 'Generate a character with name, callsign, role, appearance, and disposition.',
    tables: ['name_given', 'name_family', 'name_callsign', 'role', 'first_look', 'initial_disposition'],
  },
  starship_encounter: {
    name: 'Starship Encounter',
    game: 'starforged',
    description: 'A ship with name, first look, initial contact, and mission.',
    tables: ['starship_name', 'starships_first_look', 'starships_initial_contact'],
    region_table: 'mission',
    region_variants: { terminus: 'mission_terminus', outlands: 'mission_outlands', expanse: 'mission_expanse' },
  },
  settlement_intro: {
    name: 'Settlement Introduction',
    game: 'starforged',
    description: 'A settlement with name, location, population, authority, and projects.',
    tables: ['name', 'settlements_location', 'authority', 'settlements_first_look', 'settlements_projects'],
    region_table: 'population',
    region_variants: { terminus: 'population_terminus', outlands: 'population_outlands', expanse: 'population_expanse' },
  },
  creature_encounter: {
    name: 'Creature Encounter',
    game: 'starforged',
    description: 'A creature with environment, scale, form, appearance, and behavior.',
    tables: ['environment', 'scale', 'basic_form_land', 'creatures_first_look', 'encountered_behavior'],
  },
  space_sighting: {
    name: 'Space Sighting',
    game: 'starforged',
    description: 'What do you spot in the void? Region-aware.',
    tables: ['stellar_object'],
    region_table: 'sighting',
    region_variants: { terminus: 'sighting_terminus', outlands: 'sighting_outlands', expanse: 'sighting_expanse' },
  },
  faction_intro: {
    name: 'Faction Introduction',
    game: 'starforged',
    description: 'A faction with type, influence, name, and current project.',
    tables: ['type', 'influence', 'name_legacy', 'name_identity', 'projects'],
  },
  sector_name: {
    name: 'Sector Name',
    game: 'starforged',
    description: 'Generate a two-part sector name.',
    tables: ['sector_name_prefix', 'sector_name_suffix'],
  },
  story_hook: {
    name: 'Story Hook',
    game: 'starforged',
    description: 'A complication and a clue to drive the narrative forward.',
    tables: ['story_complication', 'story_clue'],
  },
  ironsworn_encounter: {
    name: 'Ironsworn Encounter',
    game: 'ironsworn',
    description: 'Action + Theme to seed an encounter or narrative prompt.',
    tables: ['action', 'theme'],
  },
  ironsworn_consequence: {
    name: 'Ironsworn Consequence',
    game: 'ironsworn',
    description: 'Pay the Price combined with a plot twist for dramatic turns.',
    tables: ['pay-the-price', 'major-plot-twist'],
  },
};

const NARRATIVE_TEMPLATES = {
  starforged_scene: [
    'A {descriptor} {focus} demands you {action} — the stakes are {theme}.',
    'Something here seeks to {action} the very {theme} you depend on. Before you: a {descriptor} {focus}.',
    'You discover a {descriptor} {focus}. To press on, you must {action} what binds it to {theme}.',
    'The {focus} is {descriptor}, pulsing with {theme}. Every instinct says: {action}, now.',
    'Traces of {theme} linger around a {descriptor} {focus}. Someone tried to {action} — and failed.',
    '{theme} made manifest: a {descriptor} {focus} that will force you to {action} or be consumed.',
    'A {descriptor} {focus} blocks the way. It radiates {theme}. You know you must {action}.',
    'The signal resolves into a {descriptor} {focus}. Its connection to {theme} is unmistakable. Will you {action}?',
    'Here, {theme} takes the shape of a {descriptor} {focus}. You can {action}, or let it consume you.',
    'What was meant to {action} has become a {descriptor} {focus}, steeped in {theme}.',
    'You arrive at a {descriptor} {focus}. Someone tried to {action} the {theme} here and left only ruin.',
    'The path forward demands you {action}. A {descriptor} {focus} stands between you and {theme}.',
    'A {descriptor} {focus} hums with residual {theme}. The only move is to {action}.',
    'Before you: proof that {theme} cannot be contained. A {descriptor} {focus}, waiting for someone bold enough to {action}.',
    'You feel it before you see it: {theme}, concentrated in a {descriptor} {focus}. Time to {action}.',
  ],
  npc_encounter: [
    '{name_given} {name_family}, callsign "{name_callsign}." A {role}. {first_look}. Their disposition: {initial_disposition}.',
    'You meet {name_given} "{name_callsign}" {name_family} — a {role}. {first_look}. They seem {initial_disposition}.',
    'A {role} steps forward. {first_look}. {initial_disposition}. They introduce themselves: {name_given} {name_family}, "{name_callsign}" on the comms.',
    '"{name_callsign}" — real name {name_given} {name_family}. {role}. {first_look}. Right now: {initial_disposition}.',
    '{name_given} "{name_callsign}" {name_family}. {first_look}. A {role} by trade. Their manner: {initial_disposition}.',
  ],
  starship_encounter: [
    'The {starship_name} hails you. {first_look}. First contact reads as {initial_contact}. Their mission: {mission}.',
    'Sensors lock onto a vessel: the {starship_name}. {first_look}. Posture: {initial_contact}. Mission profile suggests they intend to {mission}.',
    'The {starship_name} drops into range. {first_look}. Contact: {initial_contact}. Intelligence suggests their purpose is to {mission}.',
  ],
  settlement_intro: [
    '{name}. {location}, population: {population}. Authority: {authority}. First impressions: {first_look}. Current focus: {projects}.',
    'You arrive at {name}. A {location} settlement, population {population}. {first_look}. Authority here is {authority}. Primary industry: {projects}.',
    'Settlement {name}: {first_look}. {location}. Home to {population}. Governance: {authority}. They are focused on {projects}.',
  ],
  creature_encounter: [
    'A {basic_form_land} emerges. {scale}. Habitat: {environment}. {first_look}. Behaviour: {encountered_behavior}.',
    'From the {environment}: a {basic_form_land}. {scale}. {first_look}. It acts as a {encountered_behavior}.',
    'You encounter a {basic_form_land} in the {environment}. {scale}. {first_look}. Its behaviour suggests: {encountered_behavior}.',
  ],
  space_sighting: [
    'Long-range sensors pick up a {sighting} near a {stellar_object}.',
    'You spot a {sighting}, silhouetted against a {stellar_object}.',
    'A {sighting} registers on the scope, drifting near a {stellar_object}.',
  ],
  faction_intro: [
    'The {name_legacy} {name_identity}. {type}. {influence}. Current project: {projects}.',
    'You learn of the {name_legacy} {name_identity}: {type}. {influence}. They are pursuing {projects}.',
    'A faction called the {name_legacy} {name_identity}. {type}. {influence}. Focus: {projects}.',
  ],
  sector_name: [
    'The {sector_name_prefix} {sector_name_suffix}.',
  ],
  story_hook: [
    '{story_complication}. But there is a clue: {story_clue}.',
    'A thread unravels: {story_complication}. The trail: {story_clue}.',
    'Things fall apart. {story_complication}. Yet something remains: {story_clue}.',
  ],
  ironsworn_encounter: [
    'The situation demands you {action}. The stakes: {theme}.',
    'You must {action}. Everything hinges on {theme}.',
    '{theme} drives what comes next. You must {action} or pay the price.',
  ],
  ironsworn_consequence: [
    '{pay_the_price}. And then the twist: {major_plot_twist}.',
    'You pay dearly. {pay_the_price}. Worse still: {major_plot_twist}.',
  ],
};

function sanitiseValue(text) {
  if (!text) return '';
  return text
    .replace(/\s*[—–]\s*.+$/, '')    // strip " — description" suffixes
    .replace(/\s*\([^)]*\)/g, '')     // strip all (parentheticals)
    .replace(/\.+$/, '')              // strip trailing periods
    .trim();
}

function composeNarrative(recipeId, elements) {
  const templates = NARRATIVE_TEMPLATES[recipeId];
  if (!templates || !templates.length) return elements.map(e => e.result).join(' · ');

  const template = templates[Math.floor(Math.random() * templates.length)];
  const values = {};
  for (const elem of elements) {
    const key = elem.table.replace(/-/g, '_');
    values[key] = elem.result;
  }

  const filled = template.replace(/\{([^}]+)\}/g, (_, key) => {
    const k = key.replace(/-/g, '_');
    let val = values[k];
    if (!val) {
      const lower = k.toLowerCase();
      const match = elements.find(e => e.table.replace(/-/g, '_').toLowerCase().includes(lower) || (e.tableName || '').toLowerCase().includes(lower));
      val = match ? match.result : null;
    }
    if (!val) return key;
    return sanitiseValue(val);
  });

  // Fix "a/an" before vowels
  const withArticles = filled
    .replace(/\bA ([AEIOU])/g, 'An $1')
    .replace(/\ba ([AEIOUaeiou])/g, 'an $1');

  return withArticles;
}

function getTable(game, tableId) {
  const g = ORACLE_DATA[game || 'starforged'];
  if (!g) return null;
  return g.tables[tableId] || null;
}

function rollDie(type) {
  const max = type === 'd100' ? 100 : type === 'd10' ? 10 : 6;
  return Math.floor(Math.random() * max) + 1;
}

function rollOnTable(table) {
  const roll = rollDie(table.roll_type);
  const entry = table.entries.find(e => roll >= e.min && roll <= e.max);
  return { roll, result: entry ? entry.result : 'No result', die: table.roll_type };
}

function isCompoundResult(text) {
  const lower = text.toLowerCase();
  return lower.includes(' + ') || lower.startsWith('roll twice') || lower.startsWith('roll three');
}

function resolveCompound(game, text, sourceTableId, depth) {
  if (depth > 3) return [{ table: sourceTableId, result: text, note: 'max depth reached' }];

  const lower = text.toLowerCase();

  if (lower.startsWith('roll twice') || lower.startsWith('roll three')) {
    const count = lower.startsWith('roll three') ? 3 : 2;
    const table = getTable(game, sourceTableId);
    if (!table) return [{ table: sourceTableId, result: text }];
    const results = [];
    for (let i = 0; i < count; i++) {
      const r = rollOnTable(table);
      if (isCompoundResult(r.result)) {
        results.push(...resolveCompound(game, r.result, sourceTableId, depth + 1));
      } else {
        results.push({ table: sourceTableId, ...r });
      }
    }
    return results;
  }

  if (lower.includes(' + ')) {
    const KNOWN_COMBOS = {
      'action + theme': ['action', 'theme'],
      'descriptor + focus': ['descriptor', 'focus'],
    };
    const combo = KNOWN_COMBOS[lower.trim()];
    if (combo) {
      return combo.map(tid => {
        const t = getTable(game, tid);
        if (!t) return { table: tid, result: '?', note: 'table not found' };
        return { table: tid, ...rollOnTable(t) };
      });
    }
  }

  return [{ table: sourceTableId, result: text }];
}

// --- Tool handlers ---

function oracleListTables(args) {
  const game = args?.game || 'starforged';
  const g = ORACLE_DATA[game];
  if (!g) return { error: `Unknown game: "${game}". Available: starforged, ironsworn` };

  const category = args?.category;
  let tableList;

  if (category) {
    const ids = g.categories[category];
    if (!ids) return { error: `Unknown category: "${category}". Available: ${Object.keys(g.categories).join(', ')}` };
    tableList = ids.map(id => ({ id, name: g.tables[id]?.name, roll_type: g.tables[id]?.roll_type, usage_note: g.tables[id]?.usage_note }));
  } else {
    tableList = Object.entries(g.categories).flatMap(([cat, ids]) =>
      ids.map(id => ({ id, category: cat, name: g.tables[id]?.name, roll_type: g.tables[id]?.roll_type }))
    );
  }

  return { game, categories: Object.keys(g.categories), tables: tableList, total: tableList.length };
}

function oracleRoll(args) {
  const game = args?.game || 'starforged';
  const tableId = args?.table;
  if (!tableId) return { error: 'Required: table (e.g. "action", "theme", "name_given"). Use oracle_list_tables to discover IDs.' };

  const table = getTable(game, tableId);
  if (!table) return { error: `Table "${tableId}" not found in ${game}. Use oracle_list_tables to see available tables.` };

  const count = Math.min(Math.max(args?.count || 1, 1), 5);
  const rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(rollOnTable(table));
  }

  return {
    game,
    table: tableId,
    tableName: table.name,
    category: table.category,
    rolls,
  };
}

function oracleAsk(args) {
  const likelihood = args?.likelihood || 'fifty_fifty';
  const threshold = THRESHOLDS[likelihood];
  if (threshold == null) return { error: `Unknown likelihood: "${likelihood}". Options: ${Object.keys(THRESHOLDS).join(', ')}` };

  const d10a = Math.floor(Math.random() * 10);
  const d10b = Math.floor(Math.random() * 10);
  const roll = d10a * 10 + d10b + 1;
  const match = d10a === d10b;
  const answer = roll <= threshold;

  let verdict;
  if (answer && match) verdict = 'strong_yes';
  else if (answer) verdict = 'yes';
  else if (!answer && match) verdict = 'strong_no';
  else verdict = 'no';

  return {
    question: args?.question || null,
    likelihood,
    threshold,
    roll,
    match,
    answer,
    verdict,
    suggestion: match ? 'A match occurred — envision an extreme result or narrative twist. Consider rolling on a related oracle for inspiration.' : null,
  };
}

function oracleScene(args) {
  const game = args?.game || 'starforged';
  const region = args?.region || 'terminus';

  if (args?.recipe) {
    const recipe = RECIPES[args.recipe];
    if (!recipe) return { error: `Unknown recipe: "${args.recipe}". Use oracle_list_recipes to see options.` };

    const elements = [];
    const tableIds = [...recipe.tables];

    if (recipe.region_variants) {
      const regionTable = recipe.region_variants[region] || recipe.region_variants.terminus;
      tableIds.push(regionTable);
    }

    for (const tid of tableIds) {
      const table = getTable(recipe.game, tid);
      if (!table) { elements.push({ table: tid, result: '?', note: 'table not found' }); continue; }
      const r = rollOnTable(table);
      if (isCompoundResult(r.result)) {
        const resolved = resolveCompound(recipe.game, r.result, tid, 0);
        elements.push({ table: tid, tableName: table.name, roll: r.roll, die: r.die, result: resolved.map(x => x.result).join(' + ') });
      } else {
        elements.push({ table: tid, tableName: table.name, ...r });
      }
    }

    return {
      recipe: args.recipe,
      recipeName: recipe.name,
      game: recipe.game,
      region: recipe.region_variants ? region : null,
      elements,
      narrative: composeNarrative(args.recipe, elements),
    };
  }

  if (args?.tables && Array.isArray(args.tables)) {
    const elements = [];
    for (const tid of args.tables.slice(0, 10)) {
      const table = getTable(game, tid);
      if (!table) { elements.push({ table: tid, result: '?', note: 'table not found' }); continue; }
      const r = rollOnTable(table);
      if (isCompoundResult(r.result)) {
        const resolved = resolveCompound(game, r.result, tid, 0);
        elements.push(...resolved);
      } else {
        elements.push({ table: tid, tableName: table.name, ...r });
      }
    }
    return { recipe: null, game, elements, narrative: elements.map(e => e.result).join(' · ') };
  }

  return { error: 'Provide either "recipe" (e.g. "npc_encounter") or "tables" array (e.g. ["action","theme"]). Use oracle_list_recipes for options.' };
}

function oracleListRecipes(args) {
  const game = args?.game;
  const list = Object.entries(RECIPES)
    .filter(([, r]) => !game || r.game === game)
    .map(([id, r]) => ({ id, name: r.name, game: r.game, description: r.description, tables: r.tables, regionAware: !!r.region_variants }));
  return { recipes: list, total: list.length };
}

function oracleInterpret(args) {
  const text = args?.result;
  if (!text) return { error: 'Required: result (the oracle text to interpret, e.g. "Action + Theme")' };
  const game = args?.game || 'starforged';
  const sourceTable = args?.source_table || null;

  if (!isCompoundResult(text)) return { interpreted: false, original: text, note: 'Not a compound result — no interpretation needed.' };

  const resolved = resolveCompound(game, text, sourceTable, 0);
  return { interpreted: true, original: text, elements: resolved, narrative: resolved.map(e => e.result).join(' · ') };
}

function oracleTableView(args) {
  const game = args?.game || 'starforged';
  const tableId = args?.table;
  if (!tableId) return { error: 'Required: table (table ID to view)' };

  const table = getTable(game, tableId);
  if (!table) return { error: `Table "${tableId}" not found in ${game}.` };

  return {
    game,
    table: tableId,
    name: table.name,
    roll_type: table.roll_type,
    category: table.category,
    usage_note: table.usage_note,
    entries: table.entries,
    entryCount: table.entries.length,
  };
}

// --- Tool definitions ---

export const ORACLE_TOOLS = [
  {
    name: 'oracle_list_tables',
    description: 'List all available oracle tables for Starforged or Ironsworn, optionally filtered by category. Returns table IDs, names, and roll types.',
    inputSchema: {
      type: 'object',
      properties: {
        game: { type: 'string', enum: ['starforged', 'ironsworn'], description: 'Game system. Defaults to "starforged".' },
        category: { type: 'string', description: 'Filter by category (e.g. "core", "characters", "space", "planets"). Omit to list all.' },
      },
    },
  },
  {
    name: 'oracle_roll',
    description: 'Roll on a specific Starforged or Ironsworn oracle table. Returns the dice roll and result text. Use oracle_list_tables to discover table IDs.',
    inputSchema: {
      type: 'object',
      properties: {
        game: { type: 'string', enum: ['starforged', 'ironsworn'], description: 'Game system. Defaults to "starforged".' },
        table: { type: 'string', description: 'Table ID (e.g. "action", "theme", "name_given", "sighting_terminus").' },
        count: { type: 'number', description: 'Number of rolls (1-5). Defaults to 1.' },
      },
      required: ['table'],
    },
  },
  {
    name: 'oracle_ask',
    description: 'Ask the Oracle a yes/no question with a likelihood modifier. Implements the Ironsworn/Starforged mechanic with match detection (extreme twist on matching d10 digits).',
    inputSchema: {
      type: 'object',
      properties: {
        likelihood: { type: 'string', enum: ['almost_certain', 'likely', 'fifty_fifty', 'unlikely', 'small_chance'], description: 'How likely is "yes"? Defaults to "fifty_fifty".' },
        question: { type: 'string', description: 'Optional question text (returned in response for context).' },
      },
    },
  },
  {
    name: 'oracle_scene',
    description: 'Generate a narrative seed by rolling on multiple oracle tables. Use a named recipe (e.g. "npc_encounter", "starforged_scene") or provide a custom array of table IDs. Auto-resolves cross-references.',
    inputSchema: {
      type: 'object',
      properties: {
        recipe: { type: 'string', description: 'Recipe ID. Use oracle_list_recipes to see options.' },
        tables: { type: 'array', items: { type: 'string' }, description: 'Custom table IDs to roll. Ignored if recipe is provided.' },
        game: { type: 'string', enum: ['starforged', 'ironsworn'], description: 'Game system. Defaults to "starforged".' },
        region: { type: 'string', enum: ['terminus', 'outlands', 'expanse'], description: 'Region for tables with regional variants. Defaults to "terminus".' },
      },
    },
  },
  {
    name: 'oracle_list_recipes',
    description: 'List all predefined scene recipes — curated multi-table compositions that produce coherent narrative prompts.',
    inputSchema: {
      type: 'object',
      properties: {
        game: { type: 'string', enum: ['starforged', 'ironsworn'], description: 'Filter by game. Omit to see all.' },
      },
    },
  },
  {
    name: 'oracle_interpret',
    description: 'Resolve oracle cross-references. Given a result like "Action + Theme" or "Roll twice", follows the reference and returns expanded results.',
    inputSchema: {
      type: 'object',
      properties: {
        result: { type: 'string', description: 'Oracle result text to interpret (e.g. "Action + Theme", "Descriptor + Focus", "Roll twice").' },
        source_table: { type: 'string', description: 'Table ID the result came from (needed for "Roll twice" re-rolls).' },
        game: { type: 'string', enum: ['starforged', 'ironsworn'], description: 'Game system. Defaults to "starforged".' },
      },
      required: ['result'],
    },
  },
  {
    name: 'oracle_table_view',
    description: 'View the complete contents of an oracle table — all entries with roll ranges and results.',
    inputSchema: {
      type: 'object',
      properties: {
        game: { type: 'string', enum: ['starforged', 'ironsworn'], description: 'Game system. Defaults to "starforged".' },
        table: { type: 'string', description: 'Table ID to view.' },
      },
      required: ['table'],
    },
  },
];

export function handleOracleToolCall(name, args) {
  switch (name) {
    case 'oracle_list_tables': return oracleListTables(args);
    case 'oracle_roll': return oracleRoll(args);
    case 'oracle_ask': return oracleAsk(args);
    case 'oracle_scene': return oracleScene(args);
    case 'oracle_list_recipes': return oracleListRecipes(args);
    case 'oracle_interpret': return oracleInterpret(args);
    case 'oracle_table_view': return oracleTableView(args);
    default: return { error: `Unknown oracle tool: ${name}` };
  }
}
