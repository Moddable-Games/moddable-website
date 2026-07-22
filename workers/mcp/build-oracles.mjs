import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const RULES_ROOT = resolve(import.meta.dirname, '../../../moddable-rules');
const OUTPUT = resolve(import.meta.dirname, 'oracle-data.json');

const ORACLE_GAMES = ['starforged', 'ironsworn'];
const TABLE_GAMES = ['maze-rats'];

const result = {};

// --- Standard oracle games (entries have {min, max, result}) ---
for (const game of ORACLE_GAMES) {
  const oraclesDir = resolve(RULES_ROOT, 'games', game, 'oracles');
  if (!existsSync(oraclesDir)) { console.warn(`Skipping ${game}: no oracles dir`); continue; }

  const categories = {};
  const tables = {};

  const files = readdirSync(oraclesDir).filter(f => f.endsWith('.json') && f !== 'schema.json');

  const seen = new Set();
  for (const file of files) {
    const raw = JSON.parse(readFileSync(resolve(oraclesDir, file), 'utf8'));
    const categoryId = file.replace('.json', '');
    const fileTables = raw.tables || [];

    if (!fileTables.length) continue;

    const catIds = [];
    for (const table of fileTables) {
      let id = table.id;
      if (seen.has(id)) {
        id = categoryId + '_' + id;
      }
      seen.add(id);
      catIds.push(id);
      tables[id] = {
        name: table.name,
        roll_type: table.roll_type,
        category: categoryId,
        usage_note: table.usage_note || null,
        entries: table.entries,
      };
    }
    categories[categoryId] = catIds;
  }

  result[game] = { categories, tables };
}

// --- Table games (entries are flat string arrays) ---
for (const game of TABLE_GAMES) {
  const manifestPath = resolve(RULES_ROOT, 'games', game, 'rpg-manifest.json');
  if (!existsSync(manifestPath)) { console.warn(`Skipping ${game}: no rpg-manifest.json`); continue; }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const dataBasePath = resolve(RULES_ROOT, manifest.dataPath);

  const categories = {};
  const tables = {};
  const seen = new Set();

  for (const cat of manifest.categories) {
    const filePath = resolve(dataBasePath, cat.file);
    if (!existsSync(filePath)) continue;

    const raw = JSON.parse(readFileSync(filePath, 'utf8'));
    const fileTables = raw.tables || [];
    if (!fileTables.length) continue;

    const catIds = [];
    for (const table of fileTables) {
      let id = table.id;
      if (seen.has(id)) {
        id = cat.id + '_' + id;
      }
      seen.add(id);
      catIds.push(id);

      const entries = table.entries.map((entry, i) => ({
        min: i + 1,
        max: i + 1,
        result: typeof entry === 'string' ? entry : entry.result || String(entry),
      }));

      const count = entries.length;
      const roll_type = count <= 6 ? 'd6' : count <= 10 ? 'd10' : count <= 12 ? 'd12' : count <= 20 ? 'd20' : count <= 36 ? 'd36' : 'd100';

      tables[id] = {
        name: table.name,
        roll_type,
        category: cat.id,
        usage_note: table.roll || null,
        entries,
      };
    }
    categories[cat.id] = catIds;
  }

  result[game] = { categories, tables };
}

writeFileSync(OUTPUT, JSON.stringify(result));

const counts = Object.entries(result).map(([g, d]) => `${Object.keys(d.tables).length} ${g}`);
const size = (readFileSync(OUTPUT).length / 1024).toFixed(0);
console.log(`Built oracle-data.json (${counts.join(' + ')} tables, ${size}KB)`);
