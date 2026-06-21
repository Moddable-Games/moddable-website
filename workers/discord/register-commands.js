/**
 * Register slash commands with Discord.
 * Run once (or after changing command definitions):
 *   DISCORD_TOKEN=xxx DISCORD_APP_ID=xxx node register-commands.js
 */

const DISCORD_API = 'https://discord.com/api/v10';
const TOKEN = process.env.DISCORD_TOKEN;
const APP_ID = process.env.DISCORD_APP_ID;

if (!TOKEN || !APP_ID) {
  console.error('Set DISCORD_TOKEN and DISCORD_APP_ID environment variables.');
  process.exit(1);
}

const commands = [
  {
    name: 'roll',
    description: 'Roll dice using standard notation',
    options: [
      { name: 'notation', type: 3, description: 'Dice notation (e.g. 3d6+2, 2d20, 4d8-1)', required: true },
    ],
  },
  {
    name: 'factions',
    description: 'Random TI4 faction draft for game night',
    options: [
      { name: 'players', type: 4, description: 'Number of players (3-8)', required: false },
      { name: 'expansion', type: 3, description: 'Base game or Prophecy of Kings', required: false, choices: [{ name: 'Base', value: 'base' }, { name: 'Prophecy of Kings', value: 'pok' }] },
    ],
  },
  {
    name: 'variants',
    description: 'Browse available chess variants',
    options: [
      { name: 'group', type: 3, description: 'Filter by group', required: false, choices: [
        { name: 'Classic', value: 'Classic' },
        { name: 'Tactical', value: 'Tactical' },
        { name: 'Alternate Rules', value: 'Alternate Rules' },
        { name: 'Asymmetric', value: 'Asymmetric' },
        { name: 'Small Boards', value: 'Small Boards' },
        { name: 'Large Boards', value: 'Large Boards' },
      ]},
    ],
  },
  {
    name: 'validate',
    description: 'Check if a chess move is legal',
    options: [
      { name: 'move', type: 3, description: 'Move in coordinate notation (e.g. e2e4)', required: true },
      { name: 'variant', type: 3, description: 'Chess variant (default: standard)', required: false },
      { name: 'fen', type: 3, description: 'FEN string of position', required: false },
    ],
  },
  {
    name: 'openings',
    description: 'Look up opening book moves for a position',
    options: [
      { name: 'variant', type: 3, description: 'Chess variant (default: standard)', required: false },
      { name: 'fen', type: 3, description: 'FEN string of position', required: false },
    ],
  },
  {
    name: 'puzzle',
    description: 'Get a chess puzzle from 1,600+ puzzles across 70+ variants',
    options: [
      { name: 'variant', type: 3, description: 'Chess variant (e.g. atomic, racingKings, codrus) or "random" for surprise', required: false },
      { name: 'difficulty', type: 3, description: 'Difficulty level', required: false, choices: [
        { name: 'Easy (< 1000)', value: 'easy' },
        { name: 'Medium (1000-1500)', value: 'medium' },
        { name: 'Hard (1500-2000)', value: 'hard' },
        { name: 'Expert (2000+)', value: 'expert' },
      ]},
      { name: 'type', type: 3, description: 'Puzzle type (default: auto, e.g. mate-in-1, detonate-in-1)', required: false },
    ],
  },
  {
    name: 'hexgames',
    description: 'List available hex map games',
    options: [],
  },
  {
    name: 'map',
    description: 'Generate a hex map',
    options: [
      { name: 'game', type: 3, description: 'Game (nukes, colony, twilight, talisman, mongo, endless)', required: true },
      { name: 'players', type: 4, description: 'Number of players', required: false },
      { name: 'seed', type: 3, description: 'Seed string (for reproducible maps)', required: false },
    ],
  },
  {
    name: 'rules',
    description: 'Browse the rules library or get details on a game',
    options: [
      { name: 'game', type: 3, description: 'Game slug (e.g. backgammon, draughts, nukes). Omit to list all.', required: false },
    ],
  },
  {
    name: 'howtoplay',
    description: 'Get rules for a specific game variant',
    options: [
      { name: 'game', type: 3, description: 'Game slug (e.g. backgammon, draughts)', required: true },
      { name: 'variant', type: 3, description: 'Variant name (e.g. Acey-Deucey, German Draughts)', required: true },
    ],
  },
  {
    name: 'randomgame',
    description: 'Pick a random game or variant from the library',
    options: [
      { name: 'family', type: 3, description: 'Optional: pick random variant within this game family', required: false },
    ],
  },
  {
    name: 'jam',
    description: 'Mod Jam commands',
    options: [
      { name: 'action', type: 3, description: 'What to check', required: true, choices: [
        { name: 'Status', value: 'status' },
        { name: 'Timer', value: 'timer' },
        { name: 'Vote', value: 'vote' },
      ]},
    ],
  },
  {
    name: 'spotlight',
    description: 'Random mod from the Moddable library',
    options: [],
  },
  {
    name: 'teams',
    description: 'Split people into random teams',
    options: [
      { name: 'members', type: 3, description: 'Comma-separated names', required: true },
      { name: 'count', type: 4, description: 'Number of teams (default: 2)', required: false },
    ],
  },
  {
    name: 'flip',
    description: 'Coin flip or pick from a list',
    options: [
      { name: 'choices', type: 3, description: 'Comma-separated options to pick from (omit for coin flip)', required: false },
    ],
  },
  {
    name: 'moves',
    description: 'List legal moves for a chess position',
    options: [
      { name: 'variant', type: 3, description: 'Chess variant (default: standard)', required: false },
      { name: 'fen', type: 3, description: 'FEN string of position', required: false },
    ],
  },
  {
    name: 'analyze',
    description: 'Evaluate a chess position (best move, threats)',
    options: [
      { name: 'variant', type: 3, description: 'Chess variant (default: standard)', required: false },
      { name: 'fen', type: 3, description: 'FEN string of position', required: false },
    ],
  },
  {
    name: 'play',
    description: 'Play a sequence of chess moves and show the result',
    options: [
      { name: 'moves', type: 3, description: 'Space-separated moves (e.g. e4 e5 Nf3)', required: true },
      { name: 'variant', type: 3, description: 'Chess variant (default: standard)', required: false },
    ],
  },
  {
    name: 'search',
    description: 'Search the rules library by keyword',
    options: [
      { name: 'query', type: 3, description: 'Search terms (e.g. "dice movement", "capture rules")', required: true },
    ],
  },
  {
    name: 'draft',
    description: 'Milty-style TI4 faction draft with pick pools',
    options: [
      { name: 'players', type: 4, description: 'Number of players (3-8)', required: false },
      { name: 'pool_size', type: 4, description: 'Factions per player to choose from (default: 3)', required: false },
      { name: 'expansion', type: 3, description: 'Expansion filter', required: false, choices: [{ name: 'Base', value: 'base' }, { name: 'Prophecy of Kings', value: 'pok' }] },
    ],
  },
  {
    name: 'objectives',
    description: 'Draw TI4 public objectives',
    options: [
      { name: 'stage', type: 4, description: 'Stage 1 or 2', required: false, choices: [{ name: 'Stage 1', value: 1 }, { name: 'Stage 2', value: 2 }] },
      { name: 'count', type: 4, description: 'Number to draw (default: 5)', required: false },
    ],
  },
  {
    name: 'agendas',
    description: 'Draw TI4 agenda cards',
    options: [
      { name: 'count', type: 4, description: 'Number to draw (default: 2)', required: false },
    ],
  },
  {
    name: 'setup',
    description: 'Random Nukes territory assignment',
    options: [
      { name: 'players', type: 4, description: 'Number of players (2-6)', required: false },
    ],
  },
  {
    name: 'odds',
    description: 'Colony (Catan) dice probability calculator',
    options: [
      { name: 'numbers', type: 3, description: 'Settlement numbers, comma-separated (e.g. 5,6,8,9)', required: true },
    ],
  },
  {
    name: 'mancala',
    description: 'Simulate a mancala move (sow from a pit)',
    options: [
      { name: 'pit', type: 4, description: 'Pit index (0-5 for player 1, 7-12 for player 2)', required: true },
      { name: 'variant', type: 3, description: 'Rule variant', required: false, choices: [{ name: 'Kalah', value: 'kalah' }, { name: 'Oware', value: 'oware' }] },
    ],
  },
  {
    name: 'morris',
    description: "Nine Men's Morris legal moves",
    options: [
      { name: 'player', type: 4, description: 'Player number (1 or 2)', required: false },
      { name: 'phase', type: 3, description: 'Game phase', required: false, choices: [{ name: 'Place', value: 'place' }, { name: 'Slide', value: 'slide' }, { name: 'Fly', value: 'fly' }] },
    ],
  },
  {
    name: 'ur',
    description: 'Roll the Royal Game of Ur dice (4 binary dice, sum 0-4)',
    options: [],
  },
  {
    name: 'cowries',
    description: 'Roll Pachisi cowrie shells or Chaupar long dice',
    options: [
      { name: 'game', type: 3, description: 'Which game', required: false, choices: [{ name: 'Pachisi', value: 'pachisi' }, { name: 'Chaupar', value: 'chaupar' }] },
    ],
  },
  {
    name: 'test',
    description: 'Run the full tool test suite (bot-testing channel only)',
    options: [],
  },
  {
    name: 'help',
    description: 'Show all available commands',
    options: [],
  },
];

async function registerCommands() {
  const url = `${DISCORD_API}/applications/${APP_ID}/commands`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bot ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  });

  if (!res.ok) {
    console.error(`Failed: ${res.status} ${res.statusText}`);
    console.error(await res.text());
    process.exit(1);
  }

  const result = await res.json();
  console.log(`Registered ${result.length} commands:`);
  result.forEach(cmd => console.log(`  /${cmd.name} — ${cmd.description}`));
}

registerCommands();
