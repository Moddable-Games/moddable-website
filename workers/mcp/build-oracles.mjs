import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';

const RULES_ROOT = resolve(import.meta.dirname, '../../../moddable-rules');
const ORACLE_OUTPUT = resolve(import.meta.dirname, 'oracle-data.json');
const ENTITY_OUTPUT = resolve(import.meta.dirname, 'rpg-entities.json');

const gamesDir = join(RULES_ROOT, 'games');
const games = readdirSync(gamesDir).filter(g => {
  return existsSync(join(gamesDir, g, 'rpg-manifest.json'));
});

const oracleResult = {};
const entityResult = {};

for (const game of games) {
  const manifestPath = join(gamesDir, game, 'rpg-manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const dataBasePath = resolve(RULES_ROOT, manifest.dataPath);

  const categories = {};
  const tables = {};
  const seen = new Set();

  const entityCategories = {};

  for (const cat of manifest.categories) {
    const filePath = resolve(dataBasePath, cat.file);
    if (!existsSync(filePath)) {
      console.warn(`  [${game}] Missing: ${cat.file}`);
      continue;
    }

    const raw = JSON.parse(readFileSync(filePath, 'utf8'));

    if (cat.dataType === 'oracle') {
      // Oracle format: file has { tables: [{ id, name, roll_type, entries: [{min,max,result}] }] }
      const fileTables = raw.tables || [];
      if (!fileTables.length) continue;

      const catIds = [];
      for (const table of fileTables) {
        let id = table.id;
        if (seen.has(id)) id = cat.id + '_' + id;
        seen.add(id);
        catIds.push(id);
        tables[id] = {
          name: table.name,
          roll_type: table.roll_type,
          category: cat.id,
          usage_note: table.usage_note || null,
          entries: table.entries,
        };
      }
      categories[cat.id] = catIds;

    } else if (cat.dataType === 'table') {
      // Table format: file has { tables: [{ id, name, entries: [strings] }] }
      const arrayKey = cat.arrayKey || 'tables';
      const fileTables = raw[arrayKey] || raw.tables || [];
      if (!fileTables.length) continue;

      const catIds = [];
      for (const table of fileTables) {
        let id = table.id;
        if (seen.has(id)) id = cat.id + '_' + id;
        seen.add(id);
        catIds.push(id);

        // Normalise entries — some are strings, some are {min,max,result}
        let entries;
        if (table.entries && table.entries.length > 0 && typeof table.entries[0] === 'object' && 'min' in table.entries[0]) {
          entries = table.entries;
        } else {
          entries = (table.entries || []).map((entry, i) => ({
            min: i + 1,
            max: i + 1,
            result: typeof entry === 'string' ? entry : entry.result || String(entry),
          }));
        }

        const count = entries.length;
        const roll_type = table.roll_type || (
          count <= 6 ? 'd6' : count <= 10 ? 'd10' : count <= 12 ? 'd12' :
          count <= 20 ? 'd20' : count <= 36 ? 'd36' : 'd100'
        );

        tables[id] = {
          name: table.name,
          roll_type,
          category: cat.id,
          usage_note: table.roll || table.usage_note || null,
          entries,
        };
      }
      categories[cat.id] = catIds;

    } else if (cat.dataType === 'entity') {
      // Entity format: file is array or { [arrayKey]: [...] }
      let items;
      const arrayKey = cat.arrayKey;

      if (!arrayKey || arrayKey === '(none)') {
        items = Array.isArray(raw) ? raw : [];
      } else if (arrayKey.includes('[')) {
        // Handle path like "tables[0].entries"
        try {
          const parts = arrayKey.match(/([^[.]+)|\[(\d+)\]/g);
          let val = raw;
          for (const p of parts) {
            if (p.startsWith('[')) {
              val = val[parseInt(p.slice(1, -1))];
            } else {
              val = val[p];
            }
          }
          items = Array.isArray(val) ? val : [];
        } catch {
          items = [];
        }
      } else {
        items = Array.isArray(raw) ? raw : (raw[arrayKey] || []);
      }

      if (!Array.isArray(items)) items = [];

      // Build compact entity index
      const displayField = cat.displayField || 'name';
      const searchFields = cat.searchFields || [displayField];
      const cardFields = cat.cardFields || {};

      entityCategories[cat.id] = {
        label: cat.label,
        color: cat.color || null,
        displayField,
        searchFields,
        cardFields,
        count: items.length,
        items: items.map(item => {
          const entry = { _name: item[displayField] || item.name || item.index || '?' };
          // Include search fields for text search
          for (const sf of searchFields) {
            if (sf !== displayField && item[sf] !== undefined) {
              const val = item[sf];
              entry[sf] = Array.isArray(val) ? val.join(' ') : String(val).slice(0, 200);
            }
          }
          // Include card display fields
          if (cardFields.meta) {
            for (const tmpl of cardFields.meta) {
              const fields = tmpl.match(/\{([^}]+)\}/g);
              if (fields) {
                for (const f of fields) {
                  const key = f.slice(1, -1);
                  if (item[key] !== undefined && !entry[key]) {
                    const val = item[key];
                    entry[key] = Array.isArray(val) ? val[0] : String(val).slice(0, 300);
                  }
                }
              }
            }
          }
          // Include core fields for rich display
          for (const key of ['desc', 'description', 'hp', 'ac', 'cr', 'type', 'size', 'level', 'school', 'range', 'duration', 'casting_time', 'components', 'str', 'dex', 'wil', 'armor', 'attacks', 'special', 'actions']) {
            if (item[key] !== undefined && !entry[key]) {
              const val = item[key];
              if (Array.isArray(val)) {
                entry[key] = val.slice(0, 2).join(' ').slice(0, 300);
              } else if (typeof val === 'object') {
                entry[key] = JSON.stringify(val).slice(0, 200);
              } else {
                entry[key] = String(val).slice(0, 300);
              }
            }
          }
          return entry;
        }),
      };
    }
  }

  // Only add to oracle output if there are tables
  if (Object.keys(tables).length > 0) {
    oracleResult[game] = { categories, tables };
  }

  // Only add to entity output if there are entities
  if (Object.keys(entityCategories).length > 0) {
    entityResult[game] = {
      label: manifest.label,
      categories: entityCategories,
    };
  }
}

// Write oracle tables
writeFileSync(ORACLE_OUTPUT, JSON.stringify(oracleResult));
const oracleCounts = Object.entries(oracleResult).map(([g, d]) => `${Object.keys(d.tables).length} ${g}`);
const oracleSize = (readFileSync(ORACLE_OUTPUT).length / 1024).toFixed(0);
console.log(`Built oracle-data.json (${oracleCounts.join(' + ')} tables, ${oracleSize}KB)`);

// Write entity index
writeFileSync(ENTITY_OUTPUT, JSON.stringify(entityResult));
const entityCounts = Object.entries(entityResult).map(([g, d]) => {
  const total = Object.values(d.categories).reduce((sum, c) => sum + c.count, 0);
  return `${total} ${g}`;
});
const entitySize = (readFileSync(ENTITY_OUTPUT).length / 1024).toFixed(0);
console.log(`Built rpg-entities.json (${entityCounts.join(' + ')} entities, ${entitySize}KB)`);
