import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const RULES_ROOT = resolve(import.meta.dirname, '../../../moddable-rules');
const OUTPUT = resolve(import.meta.dirname, 'oracle-data.json');

const GAMES = ['starforged', 'ironsworn'];
const result = {};

for (const game of GAMES) {
  const oraclesDir = resolve(RULES_ROOT, 'games', game, 'oracles');
  if (!existsSync(oraclesDir)) { console.warn(`Skipping ${game}: no oracles dir`); continue; }

  const categories = {};
  const tables = {};

  const files = readdirSync(oraclesDir).filter(f => f.endsWith('.json') && f !== 'schema.json');

  for (const file of files) {
    const raw = JSON.parse(readFileSync(resolve(oraclesDir, file), 'utf8'));
    const categoryId = file.replace('.json', '');
    const fileTables = raw.tables || [];

    if (!fileTables.length) continue;

    categories[categoryId] = fileTables.map(t => t.id);

    for (const table of fileTables) {
      tables[table.id] = {
        name: table.name,
        roll_type: table.roll_type,
        category: categoryId,
        usage_note: table.usage_note || null,
        entries: table.entries,
      };
    }
  }

  result[game] = { categories, tables };
}

writeFileSync(OUTPUT, JSON.stringify(result));

const sfCount = Object.keys(result.starforged?.tables || {}).length;
const isCount = Object.keys(result.ironsworn?.tables || {}).length;
const size = (readFileSync(OUTPUT).length / 1024).toFixed(0);
console.log(`Built oracle-data.json (${sfCount} Starforged + ${isCount} Ironsworn tables, ${size}KB)`);
