import { T, el, url, track, btn, navbar, footer, sectionHero } from './mg.js';

document.getElementById('nav-root').appendChild(navbar('Tools'));
document.getElementById('footer-root').appendChild(footer());
document.getElementById('page-hero').appendChild(sectionHero({
  section: 'tool-oracle',
  tier: 2,
  hexColor: 'blue',
  eyebrow: 'ORACLES',
  title: 'Roll the <em>narrative</em>',
  lede: 'Scene generation, oracle rolls, and narrative threading for Starforged, Ironsworn, and D&D.',
}));

const TOOLS_API = 'https://tools.moddable.games/api/call';
async function callTool(tool, args) {
  const res = await fetch(TOOLS_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tool, args }) });
  return res.json();
}

const TABS = [
  { id: 'forge', label: 'Scene Forge' },
  { id: 'ask', label: 'Ask the Oracle' },
  { id: 'weaver', label: 'Thread Weaver' },
  { id: 'encounter', label: 'Encounter Builder' },
];

let activeTab = 'forge';
let recipes = [];
let selectedRecipe = '';
let selectedRegion = 'terminus';
let lastScene = null;
let askLikelihood = 'fifty_fifty';
let lastAnswer = null;
let encounterSettings = { partyLevel: 5, partySize: 4, difficulty: 'medium', monsterType: '', terrain: '', lootTier: 'medium' };
let lastEncounter = null;

const THREADS_KEY = 'mg_oracle_threads';
let threads = JSON.parse(localStorage.getItem(THREADS_KEY) || '[]');
let activeThreadId = null;

function saveThreads() { localStorage.setItem(THREADS_KEY, JSON.stringify(threads)); }

// --- Init ---
async function init() {
  const data = await callTool('oracle_list_recipes', {});
  recipes = data.recipes || [];
  if (recipes.length) selectedRecipe = recipes[0].id;
  renderTabs();
  renderPanel();
}

function renderTabs() {
  const tabsEl = document.getElementById('oracle-tabs');
  tabsEl.innerHTML = '';
  TABS.forEach(tab => {
    const b = document.createElement('button');
    b.className = 'oracle-tabs__btn' + (activeTab === tab.id ? ' oracle-tabs__btn--active' : '');
    b.textContent = tab.label;
    b.addEventListener('click', () => { activeTab = tab.id; renderTabs(); renderPanel(); });
    tabsEl.appendChild(b);
  });
}

function renderPanel() {
  const panel = document.getElementById('oracle-panel');
  panel.innerHTML = '';
  if (activeTab === 'forge') renderForge(panel);
  else if (activeTab === 'ask') renderAsk(panel);
  else if (activeTab === 'weaver') renderWeaver(panel);
  else if (activeTab === 'encounter') renderEncounter(panel);
}

// --- Scene Forge ---
function renderForge(panel) {
  panel.innerHTML = '';
  const title = el('h2', { class: 'oracle-section-title' }, 'Compose a scene');
  const sub = el('p', { class: 'oracle-section-sub' }, 'Pick a recipe and region, then forge your narrative seed.');
  panel.appendChild(title);
  panel.appendChild(sub);

  const controls = el('div', { class: 'oracle-controls' });

  const select = document.createElement('select');
  select.className = 'oracle-select';
  recipes.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = r.name;
    if (r.id === selectedRecipe) opt.selected = true;
    select.appendChild(opt);
  });
  select.addEventListener('change', () => { selectedRecipe = select.value; });
  controls.appendChild(select);

  const regionPills = el('div', { class: 'oracle-region-pills' });
  ['terminus', 'outlands', 'expanse'].forEach(r => {
    const pill = document.createElement('button');
    pill.className = 'oracle-region-pill' + (selectedRegion === r ? ' oracle-region-pill--active' : '');
    pill.textContent = r.charAt(0).toUpperCase() + r.slice(1);
    pill.addEventListener('click', () => { selectedRegion = r; renderPanel(); });
    regionPills.appendChild(pill);
  });
  controls.appendChild(regionPills);

  const forgeBtn = document.createElement('button');
  forgeBtn.className = 'oracle-forge-btn';
  forgeBtn.textContent = 'Forge';
  forgeBtn.addEventListener('click', async () => {
    forgeBtn.textContent = '...';
    const result = await callTool('oracle_scene', { recipe: selectedRecipe, region: selectedRegion });
    lastScene = result;
    track('oracle_forge', { recipe: selectedRecipe, region: selectedRegion });
    renderForgeResults(panel);
    forgeBtn.textContent = 'Forge';
  });
  controls.appendChild(forgeBtn);
  panel.appendChild(controls);

  if (lastScene) renderForgeResults(panel);
}

function renderForgeResults(panel) {
  let existing = panel.querySelector('.oracle-results');
  if (existing) existing.remove();
  let existingNarr = panel.querySelector('.oracle-narrative');
  if (existingNarr) existingNarr.remove();

  if (!lastScene || !lastScene.elements) return;

  const narrative = el('div', { class: 'oracle-narrative' }, lastScene.narrative);
  panel.appendChild(narrative);

  const grid = el('div', { class: 'oracle-results' });
  lastScene.elements.forEach((elem, idx) => {
    const card = el('div', { class: 'oracle-result-card' });
    card.appendChild(el('div', { class: 'oracle-result-card__label' }, elem.tableName || elem.table));
    card.appendChild(el('div', { class: 'oracle-result-card__value' }, elem.result));
    card.appendChild(el('div', { class: 'oracle-result-card__roll' }, elem.die + ' → ' + elem.roll));

    const rerollBtn = document.createElement('button');
    rerollBtn.className = 'oracle-result-card__reroll';
    rerollBtn.textContent = '↻';
    rerollBtn.addEventListener('click', async () => {
      const r = await callTool('oracle_roll', { game: lastScene.game || 'starforged', table: elem.table });
      if (r.rolls && r.rolls[0]) {
        lastScene.elements[idx] = { table: elem.table, tableName: r.tableName, ...r.rolls[0] };
        lastScene.narrative = lastScene.elements.map(e => e.result).join(' · ');
        renderForgeResults(panel);
      }
    });
    card.appendChild(rerollBtn);
    grid.appendChild(card);
  });
  panel.appendChild(grid);
}

// --- Ask the Oracle ---
function renderAsk(panel) {
  panel.innerHTML = '';
  const title = el('h2', { class: 'oracle-section-title' }, 'Ask the Oracle');
  const sub = el('p', { class: 'oracle-section-sub' }, 'Set a likelihood, ask your question, and let fate decide.');
  panel.appendChild(title);
  panel.appendChild(sub);

  const pills = el('div', { class: 'oracle-likelihood-pills' });
  const LIKELIHOODS = [
    { id: 'almost_certain', label: 'Almost Certain', pct: '90%' },
    { id: 'likely', label: 'Likely', pct: '75%' },
    { id: 'fifty_fifty', label: '50/50', pct: '50%' },
    { id: 'unlikely', label: 'Unlikely', pct: '25%' },
    { id: 'small_chance', label: 'Small Chance', pct: '10%' },
  ];
  LIKELIHOODS.forEach(l => {
    const pill = document.createElement('button');
    pill.className = 'oracle-likelihood-pill' + (askLikelihood === l.id ? ' oracle-likelihood-pill--active' : '');
    pill.textContent = l.label + ' (' + l.pct + ')';
    pill.addEventListener('click', () => { askLikelihood = l.id; renderPanel(); });
    pills.appendChild(pill);
  });
  panel.appendChild(pills);

  const input = document.createElement('input');
  input.className = 'oracle-question-input';
  input.placeholder = 'What do you want to ask? (optional)';
  input.type = 'text';
  panel.appendChild(input);

  const askBtn = document.createElement('button');
  askBtn.className = 'oracle-forge-btn';
  askBtn.textContent = 'Ask';
  askBtn.addEventListener('click', async () => {
    askBtn.textContent = '...';
    const result = await callTool('oracle_ask', { likelihood: askLikelihood, question: input.value.trim() || null });
    lastAnswer = result;
    track('oracle_ask', { likelihood: askLikelihood });
    renderAskResult(panel);
    askBtn.textContent = 'Ask';
  });
  panel.appendChild(askBtn);

  if (lastAnswer) renderAskResult(panel);
}

function renderAskResult(panel) {
  let existing = panel.querySelector('.oracle-answer');
  if (existing) existing.remove();

  if (!lastAnswer) return;

  const answer = el('div', { class: 'oracle-answer' });

  const verdictLabels = { yes: 'YES', no: 'NO', strong_yes: 'STRONG YES', strong_no: 'STRONG NO' };
  const verdict = el('div', { class: 'oracle-answer__verdict oracle-answer__verdict--' + lastAnswer.verdict });
  verdict.textContent = verdictLabels[lastAnswer.verdict] || lastAnswer.verdict;
  answer.appendChild(verdict);

  answer.appendChild(el('div', { class: 'oracle-answer__roll' }, 'Rolled ' + lastAnswer.roll + ' against threshold ' + lastAnswer.threshold));

  if (lastAnswer.match) {
    answer.appendChild(el('div', { class: 'oracle-answer__twist' }, 'MATCH — envision an extreme result or twist'));
  }

  if (lastAnswer.question) {
    answer.appendChild(el('div', { class: 'oracle-answer__question' }, '"' + lastAnswer.question + '"'));
  }

  panel.appendChild(answer);
}

// --- Thread Weaver ---
function renderWeaver(panel) {
  panel.innerHTML = '';
  const title = el('h2', { class: 'oracle-section-title' }, 'Thread Weaver');
  const sub = el('p', { class: 'oracle-section-sub' }, 'Maintain narrative threads. Roll in context and build connected stories.');
  panel.appendChild(title);
  panel.appendChild(sub);

  const addRow = el('div', { class: 'oracle-thread-add' });
  const addInput = document.createElement('input');
  addInput.className = 'oracle-thread-add__input';
  addInput.placeholder = 'New thread name (e.g. "Find the lost colony")...';
  const addBtn = document.createElement('button');
  addBtn.className = 'oracle-forge-btn';
  addBtn.textContent = 'Create';
  addBtn.addEventListener('click', () => {
    const name = addInput.value.trim();
    if (!name) return;
    const thread = { id: Date.now().toString(36), name, created: new Date().toISOString(), rolls: [] };
    threads.unshift(thread);
    activeThreadId = thread.id;
    saveThreads();
    addInput.value = '';
    renderWeaver(panel);
  });
  addInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addBtn.click(); });
  addRow.appendChild(addInput);
  addRow.appendChild(addBtn);
  panel.appendChild(addRow);

  if (threads.length === 0) {
    panel.appendChild(el('div', { class: 'oracle-empty' }, 'No threads yet. Create one to start weaving your narrative.'));
    return;
  }

  const list = el('div', { class: 'oracle-thread-list' });
  threads.forEach(t => {
    const item = el('div', { class: 'oracle-thread-item' + (activeThreadId === t.id ? ' oracle-thread-item--active' : '') });
    item.appendChild(el('div', { class: 'oracle-thread-item__name' }, t.name));
    item.appendChild(el('div', { class: 'oracle-thread-item__count' }, t.rolls.length + ' rolls'));
    const rm = document.createElement('button');
    rm.className = 'oracle-thread-item__remove';
    rm.textContent = '×';
    rm.addEventListener('click', (e) => {
      e.stopPropagation();
      threads = threads.filter(x => x.id !== t.id);
      if (activeThreadId === t.id) activeThreadId = null;
      saveThreads();
      renderWeaver(panel);
    });
    item.appendChild(rm);
    item.addEventListener('click', () => { activeThreadId = t.id; renderWeaver(panel); });
    list.appendChild(item);
  });
  panel.appendChild(list);

  const active = threads.find(t => t.id === activeThreadId);
  if (!active) return;

  const threadControls = el('div', { class: 'oracle-controls' });
  const recipeSelect = document.createElement('select');
  recipeSelect.className = 'oracle-select';
  recipes.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = r.name;
    recipeSelect.appendChild(opt);
  });
  threadControls.appendChild(recipeSelect);

  const rollBtn = document.createElement('button');
  rollBtn.className = 'oracle-forge-btn';
  rollBtn.textContent = 'Roll in thread';
  rollBtn.addEventListener('click', async () => {
    rollBtn.textContent = '...';
    const result = await callTool('oracle_scene', { recipe: recipeSelect.value, region: selectedRegion });
    if (result.elements) {
      active.rolls.push({ timestamp: new Date().toISOString(), recipe: recipeSelect.value, narrative: result.narrative, elements: result.elements });
      saveThreads();
    }
    rollBtn.textContent = 'Roll in thread';
    renderWeaver(panel);
  });
  threadControls.appendChild(rollBtn);
  panel.appendChild(threadControls);

  if (active.rolls.length > 0) {
    const rollsList = el('div', { class: 'oracle-thread-rolls' });
    active.rolls.slice().reverse().forEach(r => {
      const rollEl = el('div', { class: 'oracle-thread-roll' });
      rollEl.appendChild(el('div', { class: 'oracle-thread-roll__result' }, r.narrative));
      const recipeName = recipes.find(x => x.id === r.recipe)?.name || r.recipe;
      const time = new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      rollEl.appendChild(el('div', { class: 'oracle-thread-roll__meta' }, recipeName + ' · ' + time));
      rollsList.appendChild(rollEl);
    });
    panel.appendChild(rollsList);
  }
}

// --- Encounter Builder ---
const MONSTER_TYPES = ['any','aberration','beast','celestial','construct','dragon','elemental','fey','fiend','giant','humanoid','monstrosity','ooze','plant','undead'];
const TERRAINS = ['Random','Forest','Cavern','Dungeon','Swamp','Mountain','Desert','Coastal','Arctic','Urban','Planar','Underwater','Grassland'];
const DIFFICULTIES = ['easy','medium','hard','deadly'];
const LOOT_TIERS = ['none','low','medium','high','legendary'];

function renderEncounter(panel) {
  panel.innerHTML = '';
  const title = el('h2', { class: 'oracle-section-title' }, 'Encounter Builder');
  const sub = el('p', { class: 'oracle-section-sub' }, 'Generate CR-appropriate D&D 5e encounters with terrain and loot.');
  panel.appendChild(title);
  panel.appendChild(sub);

  const controls = el('div', { class: 'oracle-encounter-controls' });

  const row1 = el('div', { class: 'oracle-encounter-row' });
  row1.appendChild(makeNumberInput('Level', encounterSettings.partyLevel, 1, 20, v => { encounterSettings.partyLevel = v; }));
  row1.appendChild(makeNumberInput('Party', encounterSettings.partySize, 1, 10, v => { encounterSettings.partySize = v; }));
  row1.appendChild(makeSelect('Difficulty', DIFFICULTIES, encounterSettings.difficulty, v => { encounterSettings.difficulty = v; }));
  controls.appendChild(row1);

  const row2 = el('div', { class: 'oracle-encounter-row' });
  row2.appendChild(makeSelect('Monster Type', MONSTER_TYPES, encounterSettings.monsterType || 'any', v => { encounterSettings.monsterType = v === 'any' ? '' : v; }));
  row2.appendChild(makeSelect('Terrain', TERRAINS, encounterSettings.terrain || 'Random', v => { encounterSettings.terrain = v === 'Random' ? '' : v; }));
  row2.appendChild(makeSelect('Loot Tier', LOOT_TIERS, encounterSettings.lootTier, v => { encounterSettings.lootTier = v; }));
  controls.appendChild(row2);

  const generateBtn = document.createElement('button');
  generateBtn.className = 'oracle-forge-btn';
  generateBtn.textContent = 'Generate Encounter';
  generateBtn.addEventListener('click', async () => {
    generateBtn.textContent = '...';
    const args = {
      party_level: encounterSettings.partyLevel,
      party_size: encounterSettings.partySize,
      difficulty: encounterSettings.difficulty,
      loot_tier: encounterSettings.lootTier,
    };
    if (encounterSettings.monsterType) args.monster_type = encounterSettings.monsterType;
    if (encounterSettings.terrain) args.terrain = encounterSettings.terrain;
    const result = await callTool('oracle_encounter', args);
    lastEncounter = result;
    track('oracle_encounter', { difficulty: encounterSettings.difficulty, level: encounterSettings.partyLevel });
    renderEncounterResults(panel);
    generateBtn.textContent = 'Generate Encounter';
  });
  controls.appendChild(generateBtn);
  panel.appendChild(controls);

  if (lastEncounter) renderEncounterResults(panel);
}

function makeNumberInput(label, value, min, max, onChange) {
  const wrap = el('div', { class: 'oracle-encounter-field' });
  wrap.appendChild(el('label', { class: 'oracle-encounter-field__label' }, label));
  const input = document.createElement('input');
  input.type = 'number';
  input.className = 'oracle-encounter-field__input';
  input.min = min;
  input.max = max;
  input.value = value;
  input.addEventListener('change', () => { onChange(parseInt(input.value, 10) || min); });
  wrap.appendChild(input);
  return wrap;
}

function makeSelect(label, options, current, onChange) {
  const wrap = el('div', { class: 'oracle-encounter-field' });
  wrap.appendChild(el('label', { class: 'oracle-encounter-field__label' }, label));
  const select = document.createElement('select');
  select.className = 'oracle-select';
  options.forEach(opt => {
    const o = document.createElement('option');
    o.value = opt;
    o.textContent = opt.charAt(0).toUpperCase() + opt.slice(1);
    if (opt === current) o.selected = true;
    select.appendChild(o);
  });
  select.addEventListener('change', () => { onChange(select.value); });
  wrap.appendChild(select);
  return wrap;
}

function renderEncounterResults(panel) {
  let existing = panel.querySelector('.oracle-encounter-results');
  if (existing) existing.remove();

  if (!lastEncounter || lastEncounter.error) {
    if (lastEncounter?.error) {
      const err = el('div', { class: 'oracle-encounter-results' });
      err.appendChild(el('div', { class: 'oracle-empty' }, lastEncounter.error));
      panel.appendChild(err);
    }
    return;
  }

  const results = el('div', { class: 'oracle-encounter-results' });

  const narrative = el('div', { class: 'oracle-narrative' }, lastEncounter.narrative);
  results.appendChild(narrative);

  const header = el('div', { class: 'oracle-encounter-header' });
  header.appendChild(el('span', { class: 'oracle-encounter-badge oracle-encounter-badge--' + lastEncounter.difficulty }, lastEncounter.difficulty.toUpperCase()));
  header.appendChild(el('span', { class: 'oracle-encounter-terrain' }, lastEncounter.terrain));
  header.appendChild(el('span', { class: 'oracle-encounter-xp' }, 'XP ' + lastEncounter.xp.adjusted.toLocaleString()));
  results.appendChild(header);

  const monsterGrid = el('div', { class: 'oracle-results' });
  lastEncounter.monsters.forEach(m => {
    const card = el('div', { class: 'oracle-result-card' });
    card.appendChild(el('div', { class: 'oracle-result-card__label' }, m.type + ' · CR ' + m.cr));
    card.appendChild(el('div', { class: 'oracle-result-card__value' }, (m.count > 1 ? m.count + '× ' : '') + m.name));
    card.appendChild(el('div', { class: 'oracle-result-card__roll' }, m.size + ' · AC ' + m.ac + ' · HP ' + m.hp));
    monsterGrid.appendChild(card);
  });
  results.appendChild(monsterGrid);

  if (lastEncounter.loot.length > 0) {
    const lootSection = el('div', { class: 'oracle-encounter-loot' });
    lootSection.appendChild(el('div', { class: 'oracle-encounter-loot__title' }, 'Loot'));
    lastEncounter.loot.forEach(item => {
      const lootItem = el('div', { class: 'oracle-encounter-loot__item' });
      lootItem.appendChild(el('span', { class: 'oracle-encounter-loot__name' }, item.name));
      lootItem.appendChild(el('span', { class: 'oracle-encounter-loot__rarity oracle-encounter-loot__rarity--' + item.rarity.toLowerCase().replace(/\s+/g, '-') }, item.rarity));
      lootSection.appendChild(lootItem);
    });
    results.appendChild(lootSection);
  }

  panel.appendChild(results);
}

init();
