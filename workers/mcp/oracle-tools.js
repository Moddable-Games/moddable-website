import ORACLE_DATA from './oracle-data.json';
import MONSTERS from './dnd-monsters.json';
import LOOT from './dnd-loot.json';
import PF_MONSTERS from './pf-monsters.json';
import PF_LOOT from './pf-loot.json';

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
  maze_rats_npc: {
    name: 'Random NPC',
    game: 'maze-rats',
    description: 'Generate an NPC with name, appearance, personality, and secret.',
    tables: ['male-names', 'lowerclass-surnames', 'appearances', 'personalities', 'secrets'],
  },
  maze_rats_spell: {
    name: 'Magic Spell',
    game: 'maze-rats',
    description: 'Generate a random magic spell from ethereal or physical components.',
    tables: ['physical-effects', 'physical-elements', 'physical-forms'],
  },
  maze_rats_monster: {
    name: 'Monster',
    game: 'maze-rats',
    description: 'Generate a creature with features, traits, abilities, and tactics.',
    tables: ['terrestrial-animals', 'monster-features', 'monster-traits', 'monster-abilities', 'monster-tactics'],
  },
  maze_rats_dungeon_room: {
    name: 'Dungeon Room',
    game: 'maze-rats',
    description: 'Generate a dungeon room with form, details, activities, and hazards.',
    tables: ['dungeon-forms', 'dungeon-rooms', 'dungeon-room-details', 'dungeon-activities'],
  },
  maze_rats_wilderness: {
    name: 'Wilderness Encounter',
    game: 'maze-rats',
    description: 'Generate a wilderness scene with region, landmark, discovery, and hazard.',
    tables: ['wilderness-regions', 'wilderness-landmarks', 'wilderness-discoveries', 'wilderness-hazards'],
  },
  maze_rats_city_event: {
    name: 'City Encounter',
    game: 'maze-rats',
    description: 'Generate a city scene with district, building, activity, and event.',
    tables: ['district-themes', 'lower-class-buildings', 'city-activities', 'city-events'],
  },
  maze_rats_treasure: {
    name: 'Treasure Hoard',
    game: 'maze-rats',
    description: 'Generate a treasure collection with items, traits, and materials.',
    tables: ['treasure-items', 'treasure-traits', 'valuable-materials', 'potions'],
  },
  maze_rats_inn: {
    name: 'Inn',
    game: 'maze-rats',
    description: 'Generate a tavern with name parts and a quirk.',
    tables: ['inn-adjectives', 'inn-nouns', 'inn-quirks'],
  },
  maze_rats_faction: {
    name: 'Faction',
    game: 'maze-rats',
    description: 'Generate a faction with identity, traits, and goals.',
    tables: ['factions', 'faction-traits', 'faction-goals'],
  },
  maze_rats_trap: {
    name: 'Trap',
    game: 'maze-rats',
    description: 'Generate a trap with trigger and effect.',
    tables: ['trap-triggers', 'trap-effects'],
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
  maze_rats_npc: [
    '{male_names} {lowerclass_surnames}. {appearances}. {personalities}. Secret: {secrets}.',
    'A {personalities} figure named {male_names} {lowerclass_surnames}. {appearances}. They conceal: {secrets}.',
    '{male_names} {lowerclass_surnames} — {appearances}, {personalities}. What they hide: {secrets}.',
  ],
  maze_rats_spell: [
    'Spell of {physical_effects} {physical_elements}: takes the form of {physical_forms}.',
    'A {physical_effects} {physical_forms} infused with {physical_elements}.',
    '{physical_effects} {physical_elements}, manifesting as {physical_forms}.',
  ],
  maze_rats_monster: [
    'A {terrestrial_animals} with {monster_features}. {monster_traits}. It can {monster_abilities}. Tactics: {monster_tactics}.',
    '{monster_features} {terrestrial_animals}. {monster_traits}. Ability: {monster_abilities}. Fights by {monster_tactics}.',
    'Creature: {terrestrial_animals}. Distinctive: {monster_features}, {monster_traits}. Power: {monster_abilities}. Approach: {monster_tactics}.',
  ],
  maze_rats_dungeon_room: [
    'A {dungeon_forms} room used for {dungeon_rooms}. {dungeon_room_details}. Activity: {dungeon_activities}.',
    '{dungeon_forms} chamber. Purpose: {dungeon_rooms}. Notable: {dungeon_room_details}. Currently: {dungeon_activities}.',
    'You enter a {dungeon_forms} {dungeon_rooms}. {dungeon_room_details}. Signs of {dungeon_activities}.',
  ],
  maze_rats_wilderness: [
    'The {wilderness_regions} stretches before you. A {wilderness_landmarks} marks the way. Discovery: {wilderness_discoveries}. Danger: {wilderness_hazards}.',
    'In the {wilderness_regions}: a {wilderness_landmarks}. You find {wilderness_discoveries}. Beware: {wilderness_hazards}.',
    '{wilderness_regions} terrain. Landmark: {wilderness_landmarks}. {wilderness_discoveries}. Hazard: {wilderness_hazards}.',
  ],
  maze_rats_city_event: [
    'The {district_themes} district. A {lower_class_buildings} where {city_activities}. Event: {city_events}.',
    'In a {district_themes} quarter, near a {lower_class_buildings}. {city_activities}. Then: {city_events}.',
    '{district_themes} streets. Building: {lower_class_buildings}. Activity: {city_activities}. Complication: {city_events}.',
  ],
  maze_rats_treasure: [
    'A {treasure_traits} {treasure_items} made of {valuable_materials}. Also found: {potions}.',
    '{treasure_items} — {treasure_traits}, wrought from {valuable_materials}. Alongside: {potions}.',
    'Treasure: {treasure_traits} {treasure_items} of {valuable_materials}. Potion: {potions}.',
  ],
  maze_rats_inn: [
    'The {inn_adjectives} {inn_nouns}. Quirk: {inn_quirks}.',
    'Welcome to The {inn_adjectives} {inn_nouns}. {inn_quirks}.',
    'The {inn_adjectives} {inn_nouns} — {inn_quirks}.',
  ],
  maze_rats_faction: [
    'The {factions}. {faction_traits}. They seek to {faction_goals}.',
    'A faction: {factions}. Known for being {faction_traits}. Goal: {faction_goals}.',
    '{factions} — {faction_traits}. Current objective: {faction_goals}.',
  ],
  maze_rats_trap: [
    'Triggered by: {trap_triggers}. Effect: {trap_effects}.',
    '{trap_triggers} activates a {trap_effects} trap.',
    'Trap: {trap_effects}, set off by {trap_triggers}.',
  ],
};

function pickVariant(text) {
  if (!text.includes(' / ')) return text;
  const parts = text.split(' / ');
  return parts[Math.floor(Math.random() * parts.length)].trim();
}

function mergeCompoundResults(resolved) {
  const results = resolved.map(r => pickVariant(r.result));
  const unique = [...new Set(results)];
  if (unique.length === 1) return unique[0];
  const fromActionTheme = resolved.some(r => r.table === 'action' || r.table === 'theme' || r.table === 'descriptor' || r.table === 'focus');
  if (fromActionTheme && unique.length === 2) {
    return unique[0] + ' ' + unique[1];
  }
  if (unique.length === 2) return unique[0] + ', also ' + unique[1].toLowerCase();
  return unique.join(', ');
}

function sanitiseValue(text) {
  if (!text) return '';
  let val = text
    .replace(/\s*[—–]\s*.+$/, '')    // strip " — description" suffixes
    .replace(/\s*\([^)]*\)/g, '')     // strip all (parentheticals)
    .replace(/\.+$/, '')              // strip trailing periods
    .trim();
  if (val.includes(' / ')) {
    const parts = val.split(' / ');
    val = parts[Math.floor(Math.random() * parts.length)].trim();
  }
  return val;
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
  const match = type && type.match(/d(\d+)/);
  const max = match ? parseInt(match[1], 10) : 6;
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
  if (!g) return { error: `Unknown game: "${game}". Available: ${Object.keys(ORACLE_DATA).join(', ')}` };

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
        elements.push({ table: tid, tableName: table.name, roll: r.roll, die: r.die, result: mergeCompoundResults(resolved) });
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

// --- D&D Encounter Builder ---

const TERRAINS = [
  'Forest', 'Cavern', 'Dungeon', 'Swamp', 'Mountain', 'Desert',
  'Coastal', 'Arctic', 'Urban', 'Planar', 'Underwater', 'Grassland',
];

const CR_XP = {
  0: 10, 0.125: 25, 0.25: 50, 0.5: 100, 1: 200, 2: 450, 3: 700, 4: 1100,
  5: 1800, 6: 2300, 7: 2900, 8: 3900, 9: 5000, 10: 5900, 11: 7200,
  12: 8400, 13: 10000, 14: 11500, 15: 13000, 16: 15000, 17: 18000,
  19: 22000, 20: 25000, 21: 33000, 22: 41000, 23: 50000, 24: 62000, 30: 155000,
};

const DIFFICULTY_THRESHOLDS = {
  easy:   [25,50,75,125,250,300,350,450,550,600,800,1000,1100,1250,1400,1600,2000,2100,2400,2800],
  medium: [50,100,150,250,500,600,750,900,1100,1200,1600,2000,2200,2500,2800,3200,3900,4200,4900,5700],
  hard:   [75,150,225,375,750,900,1100,1400,1600,1900,2400,3000,3400,3800,4300,4800,5900,6300,7300,8500],
  deadly: [100,200,400,500,1100,1400,1700,2100,2400,2800,3600,4500,5100,5700,6400,7200,8800,9500,10900,12700],
};

function getXpThreshold(level, difficulty) {
  const thresholds = DIFFICULTY_THRESHOLDS[difficulty];
  return thresholds[Math.min(level - 1, 19)] || thresholds[19];
}

function getMonsterXp(cr) {
  return CR_XP[cr] || 0;
}

const LOOT_TIERS = {
  none: [],
  low: ['Common', 'Uncommon'],
  medium: ['Uncommon', 'Rare'],
  high: ['Rare', 'Very Rare'],
  legendary: ['Very Rare', 'Legendary', 'Artifact'],
};

const PF_CR_XP = {
  0.25: 100, 0.5: 200, 1: 400, 2: 600, 3: 800, 4: 1200,
  5: 1600, 6: 2400, 7: 3200, 8: 4800, 9: 6400, 10: 9600,
  11: 12800, 12: 19200, 13: 25600, 14: 38400, 15: 51200,
  16: 76800, 17: 102400, 18: 153600, 19: 204800, 20: 307200,
  21: 409600, 22: 614400, 23: 819200, 24: 1228800, 25: 1638400,
};

const PF_DIFFICULTY_THRESHOLDS = {
  easy:   [50,100,200,300,400,600,800,1200,1600,2400,3200,4800,6400,9600,12800,19200,25600,38400,51200,76800],
  medium: [75,150,300,500,600,900,1200,1800,2400,3600,4800,7200,9600,14400,19200,28800,38400,57600,76800,115200],
  hard:   [100,200,400,600,800,1200,1600,2400,3200,4800,6400,9600,12800,19200,25600,38400,51200,76800,102400,153600],
  deadly: [150,300,600,900,1200,1800,2400,3600,4800,7200,9600,14400,19200,28800,38400,57600,76800,115200,153600,230400],
};

function getPfXpThreshold(level, difficulty) {
  const thresholds = PF_DIFFICULTY_THRESHOLDS[difficulty];
  return thresholds[Math.min(level - 1, 19)] || thresholds[19];
}

function getPfMonsterXp(cr) {
  return PF_CR_XP[cr] || 0;
}

function oracleEncounter(args) {
  const system = args?.system || 'dnd-5e';
  const partyLevel = Math.max(1, Math.min(20, args?.party_level || 5));
  const partySize = Math.max(1, Math.min(10, args?.party_size || 4));
  const difficulty = args?.difficulty || 'medium';
  const monsterType = args?.monster_type || null;
  const terrain = args?.terrain || TERRAINS[Math.floor(Math.random() * TERRAINS.length)];
  const lootTier = args?.loot_tier || 'medium';

  if (!DIFFICULTY_THRESHOLDS[difficulty]) {
    return { error: `Unknown difficulty "${difficulty}". Options: easy, medium, hard, deadly.` };
  }

  const isPF = system === 'pathfinder-1e';
  const monsterPool = isPF ? PF_MONSTERS : MONSTERS;
  const lootSource = isPF ? PF_LOOT : LOOT;
  const xpBudget = isPF
    ? getPfXpThreshold(partyLevel, difficulty) * partySize
    : getXpThreshold(partyLevel, difficulty) * partySize;
  const getXp = isPF ? getPfMonsterXp : getMonsterXp;

  const maxCR = partyLevel + 3;
  let pool = monsterPool.filter(m => m.cr <= maxCR && m.cr > 0);
  if (monsterType) {
    pool = pool.filter(m => m.type.toLowerCase() === monsterType.toLowerCase());
  }

  if (pool.length === 0) {
    return { error: `No ${isPF ? 'Pathfinder' : 'D&D'} monsters found matching criteria (type: ${monsterType || 'any'}, max CR: ${maxCR}).` };
  }

  const group = [];
  let xpSpent = 0;
  const maxMonsters = Math.min(8, Math.ceil(partySize * 1.5));
  let attempts = 0;

  while (xpSpent < xpBudget * 0.7 && group.length < maxMonsters && attempts < 50) {
    attempts++;
    const remaining = xpBudget - xpSpent;
    const eligible = pool.filter(m => getXp(m.cr) <= remaining && getXp(m.cr) > 0);
    if (eligible.length === 0) break;

    const monster = eligible[Math.floor(Math.random() * eligible.length)];
    const existing = group.find(g => g.name === monster.name);
    if (existing) {
      existing.count++;
    } else {
      group.push({ ...monster, count: 1 });
    }
    xpSpent += getXp(monster.cr);
  }

  const totalCount = group.reduce((sum, g) => sum + g.count, 0);
  const encounterMultiplier = totalCount <= 1 ? 1
    : totalCount <= 2 ? 1.5
    : totalCount <= 6 ? 2
    : totalCount <= 10 ? 2.5 : 3;
  const adjustedXp = Math.round(xpSpent * encounterMultiplier);

  let loot = [];
  const tierRarities = LOOT_TIERS[lootTier] || LOOT_TIERS.medium;
  if (tierRarities.length > 0) {
    const lootPool = lootSource.filter(item => tierRarities.includes(item.rarity));
    const lootCount = difficulty === 'easy' ? 1 : difficulty === 'deadly' ? 3 : 2;
    for (let i = 0; i < lootCount && lootPool.length > 0; i++) {
      const item = lootPool[Math.floor(Math.random() * lootPool.length)];
      loot.push({ name: item.name, rarity: item.rarity, category: item.category });
    }
  }

  const monsters = group.map(m => ({
    name: m.name,
    count: m.count,
    cr: m.cr,
    type: m.type,
    size: m.size,
    hp: m.hp,
    ac: m.ac,
    xp: getXp(m.cr),
  }));

  const systemLabel = isPF ? 'Pathfinder 1e' : 'D&D 5e';
  const totalMonsters = monsters.reduce((sum, m) => sum + m.count, 0);
  const narrative = `A ${difficulty} ${systemLabel} encounter for ${partySize} level-${partyLevel} adventurers. ` +
    `${totalMonsters} creature${totalMonsters !== 1 ? 's' : ''} in ${terrain.toLowerCase()} terrain. ` +
    `Adjusted XP: ${adjustedXp.toLocaleString()} (budget: ${xpBudget.toLocaleString()}).`;

  return {
    system,
    difficulty,
    party: { level: partyLevel, size: partySize },
    terrain,
    monsters,
    totalMonsters,
    xp: { raw: xpSpent, adjusted: adjustedXp, budget: xpBudget, multiplier: encounterMultiplier },
    loot,
    narrative,
  };
}

// --- Tool definitions ---

export const ORACLE_TOOLS = [
  {
    name: 'oracle_list_tables',
    description: 'List all available oracle tables for a game system, optionally filtered by category. Returns table IDs, names, and roll types.',
    inputSchema: {
      type: 'object',
      properties: {
        game: { type: 'string', enum: ['starforged', 'ironsworn', 'maze-rats'], description: 'Game system. Defaults to "starforged".' },
        category: { type: 'string', description: 'Filter by category (e.g. "core", "characters", "magic", "maze"). Omit to list all.' },
      },
    },
  },
  {
    name: 'oracle_roll',
    description: 'Roll on a specific oracle table. Returns the dice roll and result text. Use oracle_list_tables to discover table IDs.',
    inputSchema: {
      type: 'object',
      properties: {
        game: { type: 'string', enum: ['starforged', 'ironsworn', 'maze-rats'], description: 'Game system. Defaults to "starforged".' },
        table: { type: 'string', description: 'Table ID (e.g. "action", "theme", "ethereal-effects", "dungeon-rooms").' },
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
    description: 'Generate a narrative seed by rolling on multiple oracle tables. Use a named recipe (e.g. "npc_encounter", "maze_rats_dungeon_room") or provide a custom array of table IDs. Auto-resolves cross-references.',
    inputSchema: {
      type: 'object',
      properties: {
        recipe: { type: 'string', description: 'Recipe ID. Use oracle_list_recipes to see options.' },
        tables: { type: 'array', items: { type: 'string' }, description: 'Custom table IDs to roll. Ignored if recipe is provided.' },
        game: { type: 'string', enum: ['starforged', 'ironsworn', 'maze-rats'], description: 'Game system. Defaults to "starforged".' },
        region: { type: 'string', enum: ['terminus', 'outlands', 'expanse'], description: 'Region for tables with regional variants (Starforged only). Defaults to "terminus".' },
      },
    },
  },
  {
    name: 'oracle_list_recipes',
    description: 'List all predefined scene recipes — curated multi-table compositions that produce coherent narrative prompts. Covers Starforged, Ironsworn, and Maze Rats.',
    inputSchema: {
      type: 'object',
      properties: {
        game: { type: 'string', enum: ['starforged', 'ironsworn', 'maze-rats'], description: 'Filter by game. Omit to see all.' },
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
        game: { type: 'string', enum: ['starforged', 'ironsworn', 'maze-rats'], description: 'Game system. Defaults to "starforged".' },
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
        game: { type: 'string', enum: ['starforged', 'ironsworn', 'maze-rats'], description: 'Game system. Defaults to "starforged".' },
        table: { type: 'string', description: 'Table ID to view.' },
      },
      required: ['table'],
    },
  },
  {
    name: 'oracle_encounter',
    description: 'Generate a tabletop RPG encounter (D&D 5e or Pathfinder 1e). Selects CR-appropriate monsters for party level/size, picks terrain, and rolls loot. Returns a structured encounter block.',
    inputSchema: {
      type: 'object',
      properties: {
        system: { type: 'string', enum: ['dnd-5e', 'pathfinder-1e'], description: 'Game system. Defaults to "dnd-5e".' },
        party_level: { type: 'number', description: 'Average party level (1-20). Defaults to 5.' },
        party_size: { type: 'number', description: 'Number of players (1-10). Defaults to 4.' },
        difficulty: { type: 'string', enum: ['easy', 'medium', 'hard', 'deadly'], description: 'Encounter difficulty. Defaults to "medium".' },
        monster_type: { type: 'string', description: 'Filter monsters by type (e.g. "undead", "dragon", "beast", "Outsider", "Construct"). Omit for any.' },
        terrain: { type: 'string', description: 'Terrain type (e.g. "Forest", "Cavern", "Dungeon"). Omit for random.' },
        loot_tier: { type: 'string', enum: ['none', 'low', 'medium', 'high', 'legendary'], description: 'Loot rarity tier. Defaults to "medium".' },
      },
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
    case 'oracle_encounter': return oracleEncounter(args);
    default: return { error: `Unknown oracle tool: ${name}` };
  }
}
