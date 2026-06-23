import { el, data, btn } from './mg.js';
import * as State from './mg-ti-dash-state.js';
let factions = [];
let objectivesData = null;
let container = null;

const PLAYER_COLORS = [
  { name: 'Red', hex: '#e63232' },
  { name: 'Blue', hex: '#4a9eff' },
  { name: 'Green', hex: '#4eb735' },
  { name: 'Yellow', hex: '#f0c040' },
  { name: 'Purple', hex: '#b366e0' },
  { name: 'Pink', hex: '#e85a9a' },
  { name: 'Orange', hex: '#f09030' },
  { name: 'Cyan', hex: '#40d4d4' }
];

let cfg = { playerCount: 6, vpTarget: 10, expansions: ['base', 'pok'], players: [], speakerIdx: 0 };

async function loadData() {
  const base = location.pathname.includes('/MODDABLE/moddable-website')
    ? '/MODDABLE/moddable-website/data/' : '/data/';
  const [ti4, obj] = await Promise.all([
    fetch(base + 'ti4.json').then(r => r.json()),
    fetch(base + 'ti4-objectives.json').then(r => r.json())
  ]);
  factions = ti4.factions || [];
  objectivesData = obj;
  return { factions, objectivesData };
}

function render(root) {
  container = root;
  container.innerHTML = '';
  container.appendChild(renderStep1());
}

function renderStep1() {
  const step = el('div', { class: 'td-setup' });
  step.appendChild(el('div', { class: 'td-setup__eyebrow' }, 'NEW SESSION'));
  step.appendChild(el('h1', { class: 'td-setup__title' }, 'Twilight Imperium'));

  const countRow = el('div', { class: 'td-setup__field' });
  countRow.appendChild(el('label', { class: 'td-setup__label' }, 'Players'));
  const countBtns = el('div', { class: 'td-setup__count-row' });
  for (let n = 3; n <= 8; n++) {
    const b = el('button', {
      class: 'td-setup__count-btn' + (n === cfg.playerCount ? ' td-setup__count-btn--active' : ''),
      onClick: () => { cfg.playerCount = n; container.innerHTML = ''; container.appendChild(renderStep1()); }
    }, String(n));
    countBtns.appendChild(b);
  }
  countRow.appendChild(countBtns);
  step.appendChild(countRow);

  const vpRow = el('div', { class: 'td-setup__field' });
  vpRow.appendChild(el('label', { class: 'td-setup__label' }, 'Victory Points'));
  const vpBtns = el('div', { class: 'td-setup__count-row' });
  [10, 12, 14].forEach(v => {
    const b = el('button', {
      class: 'td-setup__count-btn' + (v === cfg.vpTarget ? ' td-setup__count-btn--active' : ''),
      onClick: () => { cfg.vpTarget = v; container.innerHTML = ''; container.appendChild(renderStep1()); }
    }, String(v));
    vpBtns.appendChild(b);
  });
  vpRow.appendChild(vpBtns);
  step.appendChild(vpRow);

  const expRow = el('div', { class: 'td-setup__field' });
  expRow.appendChild(el('label', { class: 'td-setup__label' }, 'Expansions'));
  const toggleRow = el('div', { class: 'td-setup__toggle-row' });
  const EXPANSIONS = [
    { key: 'base', label: 'Base Game' },
    { key: 'pok', label: 'Prophecy of Kings' },
    { key: 'codex', label: 'Codex' },
    { key: 'ds', label: 'Discordant Stars' },
    { key: 'te', label: "Thunder's Edge" }
  ];
  EXPANSIONS.forEach(exp => {
    const isBase = exp.key === 'base';
    const isOn = cfg.expansions.includes(exp.key);
    const attrs = { class: 'td-setup__toggle' + (isOn ? ' td-setup__toggle--on' : '') + (isBase ? ' td-setup__toggle--locked' : '') };
    if (!isBase) {
      attrs.onClick = () => {
        if (isOn) cfg.expansions = cfg.expansions.filter(e => e !== exp.key);
        else cfg.expansions.push(exp.key);
        container.innerHTML = ''; container.appendChild(renderStep1());
      };
    }
    const toggle = el('button', attrs);
    const track = el('div', { class: 'td-setup__toggle-track' });
    const knob = el('div', { class: 'td-setup__toggle-knob' });
    track.appendChild(knob);
    toggle.appendChild(track);
    toggle.appendChild(el('span', { class: 'td-setup__toggle-label' }, exp.label));
    toggleRow.appendChild(toggle);
  });
  expRow.appendChild(toggleRow);
  step.appendChild(expRow);

  const next = el('button', { class: 'td-setup__next-btn', onClick: goStep2 }, 'Set Up Players');
  step.appendChild(next);

  if (State.load()) {
    const resumeRow = el('div', { class: 'td-setup__resume-row' });
    resumeRow.appendChild(el('button', { class: 'td-setup__resume-btn', onClick: () => { import('./mg-ti-dash-score.js').then(m => m.render(container)); } }, 'Resume Previous Game'));
    resumeRow.appendChild(el('button', { class: 'td-setup__reset-btn', onClick: () => { State.reset(); container.innerHTML = ''; container.appendChild(renderStep1()); } }, 'Delete saved game'));
    step.appendChild(resumeRow);
  }

  return step;
}

function goStep2() {
  cfg.players = [];
  for (let i = 0; i < cfg.playerCount; i++) {
    cfg.players.push({ name: 'Player ' + (i + 1), color: PLAYER_COLORS[i % PLAYER_COLORS.length].hex, faction: null });
  }
  container.innerHTML = '';
  container.appendChild(renderStep2());
}

function renderStep2() {
  const step = el('div', { class: 'td-setup' });
  step.appendChild(el('div', { class: 'td-setup__eyebrow' }, 'PLAYERS'));
  step.appendChild(el('h2', { class: 'td-setup__subtitle' }, 'Name your fleet commanders'));

  const list = el('div', { class: 'td-setup__players' });
  cfg.players.forEach((p, i) => {
    const row = el('div', { class: 'td-setup__player-row' + (i === cfg.speakerIdx ? ' td-setup__player-row--speaker' : '') });
    row.style.setProperty('--player-color', p.color);

    const speakerBtn = el('button', {
      class: 'td-setup__speaker-btn' + (i === cfg.speakerIdx ? ' td-setup__speaker-btn--active' : ''),
      title: 'Set as Speaker',
      onClick: () => { cfg.speakerIdx = i; container.innerHTML = ''; container.appendChild(renderStep2()); }
    }, 'S');
    row.appendChild(speakerBtn);

    const swatch = el('div', { class: 'td-setup__player-swatch' });
    swatch.addEventListener('click', () => cycleColor(i));
    row.appendChild(swatch);

    const input = el('input', { class: 'td-setup__player-input', type: 'text', value: p.name });
    input.addEventListener('input', (e) => { cfg.players[i].name = e.target.value; });
    row.appendChild(input);

    const facSelect = el('select', { class: 'td-setup__faction-select' });
    facSelect.appendChild(el('option', { value: '' }, '— No faction —'));
    const filtered = factions.filter(f => cfg.expansions.includes(f.expansion));
    filtered.forEach(f => {
      const opt = el('option', { value: f.name });
      opt.textContent = f.name;
      if (p.faction === f.name) opt.selected = true;
      facSelect.appendChild(opt);
    });
    facSelect.addEventListener('change', (e) => { cfg.players[i].faction = e.target.value || null; });
    row.appendChild(facSelect);

    list.appendChild(row);
  });
  step.appendChild(list);

  const actions = el('div', { class: 'td-setup__actions' });
  actions.appendChild(el('button', { class: 'td-setup__action-btn', onClick: randomiseOrder }, 'Shuffle Order'));
  actions.appendChild(el('button', { class: 'td-setup__action-btn', onClick: randomiseFactions }, 'Random Factions'));
  actions.appendChild(el('button', { class: 'td-setup__action-btn', onClick: randomiseSpeaker }, 'Random Speaker'));
  step.appendChild(actions);

  const nav = el('div', { class: 'td-setup__nav' });
  nav.appendChild(el('button', { class: 'td-setup__back-btn', onClick: () => { container.innerHTML = ''; container.appendChild(renderStep1()); } }, 'Back'));
  nav.appendChild(el('button', { class: 'td-setup__next-btn', onClick: startGame }, 'Start Game'));
  step.appendChild(nav);

  return step;
}

function cycleColor(idx) {
  const current = cfg.players[idx].color;
  const ci = PLAYER_COLORS.findIndex(c => c.hex === current);
  const next = (ci + 1) % PLAYER_COLORS.length;
  cfg.players[idx].color = PLAYER_COLORS[next].hex;
  container.innerHTML = '';
  container.appendChild(renderStep2());
}

function randomiseOrder() {
  for (let i = cfg.players.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cfg.players[i], cfg.players[j]] = [cfg.players[j], cfg.players[i]];
  }
  container.innerHTML = '';
  container.appendChild(renderStep2());
}

function randomiseSpeaker() {
  cfg.speakerIdx = Math.floor(Math.random() * cfg.players.length);
  container.innerHTML = '';
  container.appendChild(renderStep2());
}

function randomiseFactions() {
  const filtered = factions.filter(f => cfg.expansions.includes(f.expansion));
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  cfg.players.forEach((p, i) => { p.faction = shuffled[i] ? shuffled[i].name : null; });
  container.innerHTML = '';
  container.appendChild(renderStep2());
}

function startGame() {
  const players = cfg.players.map(p => ({ ...p }));
  State.create({ players, vpTarget: cfg.vpTarget, expansions: cfg.expansions, speakerIdx: cfg.speakerIdx });
  initObjectivePools();
  import('./mg-ti-dash-agenda.js').then(m => m.loadAgendas(cfg.expansions));
  import('./mg-ti-dash-score.js').then(m => m.render(container));
}

function initObjectivePools() {
  if (!objectivesData) return;
  const exps = cfg.expansions;
  const s1 = objectivesData.stage1.filter(o => exps.includes(o.expansion));
  const s2 = objectivesData.stage2.filter(o => exps.includes(o.expansion));
  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
  const s1Pool = shuffle(s1).slice(0, 5);
  const s2Pool = shuffle(s2).slice(0, 5);
  State.update(s => {
    s.objectives.stage1Pool = s1Pool;
    s.objectives.stage2Pool = s2Pool;
    s.objectives.revealed = [
      { ...s1Pool[0], stage: 1 },
      { ...s1Pool[1], stage: 1 }
    ];
  });
  if (objectivesData.secrets) {
    const secrets = objectivesData.secrets.filter(o => exps.includes(o.expansion));
    State.update(s => { s._secretPool = shuffle(secrets); });
  }
}

export { render, loadData, PLAYER_COLORS };