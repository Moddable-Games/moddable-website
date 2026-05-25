(function() {
const { T, el, btn, navbar, footer } = MG;
document.getElementById('nav-root').appendChild(navbar('Tools'));
document.getElementById('footer-root').appendChild(footer());

/* ── HEX STRIKE PLANNER ── */
const COLS = 9, ROWS = 5;
const hexes = [];
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    hexes.push({ r, c, x: c * 36 + (r % 2) * 18 + 25, y: r * 31 + 22, id: r + '-' + c });
  }
}
const strikes = new Set();

function getNeighbours(id) {
  const [r, c] = id.split('-').map(Number);
  const offset = r % 2;
  const dirs = [
    [-1, -1 + offset], [-1, offset],
    [0, -1], [0, 1],
    [1, -1 + offset], [1, offset]
  ];
  const neighbours = [];
  dirs.forEach(([dr, dc]) => {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
      neighbours.push(nr + '-' + nc);
    }
  });
  return neighbours;
}

function isBlastZone(h) {
  return [...strikes].some(id => getNeighbours(id).includes(h.id));
}

function renderHexMap() {
  const svg = document.getElementById('hex-svg');
  svg.innerHTML = '';
  const ns = 'http://www.w3.org/2000/svg';
  hexes.forEach(h => {
    const struck = strikes.has(h.id);
    const blast = !struck && isBlastZone(h);
    const g = document.createElementNS(ns, 'g');
    const poly = document.createElementNS(ns, 'polygon');
    poly.setAttribute('transform', 'translate(' + h.x + ',' + h.y + ')');
    poly.setAttribute('points', '0,-16 14,-8 14,8 0,16 -14,8 -14,-8');
    poly.setAttribute('fill', struck ? '#d11a1a' : blast ? '#7a3a18' : 'rgba(255,255,255,0.06)');
    poly.setAttribute('stroke', struck ? '#e63232' : blast ? '#e89a1a' : 'rgba(255,255,255,0.25)');
    poly.setAttribute('stroke-width', struck ? '2' : '1');
    g.appendChild(poly);
    if (struck) {
      const t = document.createElementNS(ns, 'text');
      t.setAttribute('x', h.x); t.setAttribute('y', h.y + 5);
      t.setAttribute('font-size', '10'); t.setAttribute('fill', '#fff');
      t.setAttribute('text-anchor', 'middle'); t.setAttribute('pointer-events', 'none');
      t.setAttribute('font-family', 'var(--mg-font-pixel)');
      t.textContent = '☢';
      g.appendChild(t);
    }
    if (blast) {
      const c2 = document.createElementNS(ns, 'circle');
      c2.setAttribute('cx', h.x); c2.setAttribute('cy', h.y);
      c2.setAttribute('r', '4'); c2.setAttribute('fill', '#e89a1a');
      c2.setAttribute('pointer-events', 'none');
      g.appendChild(c2);
    }
    g.addEventListener('click', () => {
      if (strikes.has(h.id)) {
        strikes.delete(h.id);
      } else {
        strikes.add(h.id);
      }
      renderHexMap();
      updateCount();
    });
    svg.appendChild(g);
  });
}

function updateCount() {
  const blastCount = hexes.filter(h => !strikes.has(h.id) && isBlastZone(h)).length;
  document.getElementById('strike-count').innerHTML =
    'Strikes: <strong class="nukes-card__eyebrow--red">' + strikes.size + '</strong> · Destroyed hexes: <strong>' + (strikes.size + blastCount) + '</strong>';
}

document.getElementById('clear-btn').appendChild(btn('Clear board', 'outline-dark', () => {
  strikes.clear(); renderHexMap(); updateCount();
}));
renderHexMap();

/* ── COMBAT STRENGTH CALCULATOR ── */
function renderCombat() {
  const wrap = document.getElementById('combat-calc');
  wrap.innerHTML = '';

  const grid = el('div', { class: 'combat-grid' });

  function buildSide(label, prefix) {
    const side = el('div', { class: 'combat-side' });
    side.appendChild(el('div', { class: 'combat-side__label' }, label));

    const unitRow = el('div', { class: 'combat-row' });
    unitRow.appendChild(el('span', { class: 'combat-row__key' }, 'Unit tokens'));
    const unitInput = document.createElement('input');
    unitInput.type = 'number'; unitInput.min = '1'; unitInput.max = '9'; unitInput.value = '3';
    unitInput.className = 'combat-input'; unitInput.id = prefix + '-units';
    unitInput.addEventListener('input', calculate);
    unitRow.appendChild(unitInput);
    side.appendChild(unitRow);

    const adjRow = el('div', { class: 'combat-row' });
    adjRow.appendChild(el('span', { class: 'combat-row__key' }, 'Adjacent friendly units'));
    const adjInput = document.createElement('input');
    adjInput.type = 'number'; adjInput.min = '0'; adjInput.max = '18'; adjInput.value = '0';
    adjInput.className = 'combat-input'; adjInput.id = prefix + '-adj';
    adjInput.addEventListener('input', calculate);
    adjRow.appendChild(adjInput);
    side.appendChild(adjRow);

    const baseRow = el('div', { class: 'combat-row' });
    baseRow.appendChild(el('span', { class: 'combat-row__key' }, 'Bases passed through'));
    const baseInput = document.createElement('input');
    baseInput.type = 'number'; baseInput.min = '0'; baseInput.max = '6'; baseInput.value = '0';
    baseInput.className = 'combat-input'; baseInput.id = prefix + '-bases';
    baseInput.addEventListener('input', calculate);
    baseRow.appendChild(baseInput);
    side.appendChild(baseRow);

    side.appendChild(el('div', { class: 'combat-total', id: prefix + '-total' }, 'Strength: 0'));
    return side;
  }

  grid.appendChild(buildSide('Attacker', 'atk'));
  grid.appendChild(el('div', { class: 'combat-vs' }, 'vs'));
  grid.appendChild(buildSide('Defender', 'def'));
  wrap.appendChild(grid);

  const result = el('div', { class: 'combat-result', id: 'combat-result' });
  wrap.appendChild(result);

  calculate();
}

function calculate() {
  const atkUnits = parseInt(document.getElementById('atk-units').value) || 0;
  const atkAdj = parseInt(document.getElementById('atk-adj').value) || 0;
  const atkBases = parseInt(document.getElementById('atk-bases').value) || 0;
  const defUnits = parseInt(document.getElementById('def-units').value) || 0;
  const defAdj = parseInt(document.getElementById('def-adj').value) || 0;
  const defBases = parseInt(document.getElementById('def-bases').value) || 0;

  const atkTotal = atkUnits + atkAdj + atkBases;
  const defTotal = defUnits + defAdj + defBases;

  document.getElementById('atk-total').textContent = 'Strength: ' + atkTotal;
  document.getElementById('def-total').textContent = 'Strength: ' + defTotal;

  const resultEl = document.getElementById('combat-result');
  if (atkTotal > defTotal) {
    const excess = atkTotal - defTotal;
    resultEl.className = 'combat-result combat-result--win';
    resultEl.textContent = 'Attack succeeds — ' + excess + ' excess strength (can capture up to ' + excess + ' hostages)';
  } else if (atkTotal === defTotal) {
    resultEl.className = 'combat-result combat-result--tie';
    resultEl.textContent = 'Cannot attack — tie is not sufficient (must be strictly greater)';
  } else {
    resultEl.className = 'combat-result combat-result--fail';
    resultEl.textContent = 'Cannot attack — defender is stronger';
  }
}

renderCombat();

/* ── HOSTAGE TRACKER ── */
const PLAYER_COLORS = ['#d11a1a', '#0c4f8d', '#3a9928'];
const PLAYER_NAMES = ['Red', 'Blue', 'Green'];
let players = [
  { name: 'Red', color: PLAYER_COLORS[0], hostages: 20, isotopes: 1 },
  { name: 'Blue', color: PLAYER_COLORS[1], hostages: 20, isotopes: 1 },
];

function renderHostages() {
  const wrap = document.getElementById('hostage-tracker');
  wrap.innerHTML = '';

  const controls = el('div', { class: 'hostage-controls' });
  const playerCountLabel = el('span', { class: 'hostage-controls__label' }, 'Players:');
  controls.appendChild(playerCountLabel);
  [2, 3].forEach(n => {
    const b = document.createElement('button');
    b.textContent = n + 'P';
    b.className = 'hostage-controls__btn' + (players.length === n ? ' hostage-controls__btn--active' : '');
    b.addEventListener('click', () => {
      if (n === 3 && players.length === 2) {
        players.push({ name: 'Green', color: PLAYER_COLORS[2], hostages: 20, isotopes: 1 });
        players.forEach(p => { p.hostages = 20; });
      } else if (n === 2 && players.length === 3) {
        players = players.slice(0, 2);
        players.forEach(p => { p.hostages = 20; });
      }
      renderHostages();
    });
    controls.appendChild(b);
  });
  const resetBtn = document.createElement('button');
  resetBtn.textContent = 'Reset';
  resetBtn.className = 'hostage-controls__btn hostage-controls__btn--reset';
  resetBtn.addEventListener('click', () => {
    players.forEach(p => { p.hostages = players.length === 2 ? 20 : 20; p.isotopes = 1; });
    renderHostages();
  });
  controls.appendChild(resetBtn);
  wrap.appendChild(controls);

  const grid = el('div', { class: 'hostage-grid' });
  players.forEach((p, i) => {
    const card = el('div', { class: 'hostage-player' });
    card.dataset.color = p.color;

    const nameRow = el('div', { class: 'hostage-player__name' });
    nameRow.textContent = p.name;
    card.appendChild(nameRow);

    const hostageRow = el('div', { class: 'hostage-player__row' });
    hostageRow.appendChild(el('span', { class: 'hostage-player__key' }, 'Hostages held'));
    const hVal = el('span', { class: 'hostage-player__value' }, String(p.hostages));
    hostageRow.appendChild(hVal);
    card.appendChild(hostageRow);

    const isoRow = el('div', { class: 'hostage-player__row' });
    isoRow.appendChild(el('span', { class: 'hostage-player__key' }, 'Isotopes'));
    isoRow.appendChild(el('span', { class: 'hostage-player__value' }, String(p.isotopes)));
    card.appendChild(isoRow);

    const turnsLeft = Math.ceil(p.hostages / 1);
    const minTurns = Math.ceil(p.hostages / 3);
    const turnsRow = el('div', { class: 'hostage-player__row hostage-player__row--meta' });
    turnsRow.appendChild(el('span', { class: 'hostage-player__key' }, 'Turns remaining'));
    turnsRow.appendChild(el('span', { class: 'hostage-player__value' }, minTurns + '–' + turnsLeft));
    card.appendChild(turnsRow);

    const btns = el('div', { class: 'hostage-player__btns' });
    [1, 2, 3].forEach(n => {
      btns.appendChild(btn('Return ' + n, 'dark', () => {
        p.hostages = Math.max(0, p.hostages - n);
        renderHostages();
      }));
    });
    btns.appendChild(btn('+Isotope', 'outline-dark', () => {
      p.isotopes++;
      renderHostages();
    }));
    btns.appendChild(btn('−Isotope', 'outline-dark', () => {
      p.isotopes = Math.max(0, p.isotopes - 1);
      renderHostages();
    }));
    card.appendChild(btns);

    if (p.hostages === 0) {
      const warn = el('div', { class: 'hostage-player__warn' }, '☢ ELIMINATED — no hostages to return');
      card.appendChild(warn);
    }

    grid.appendChild(card);
  });
  wrap.appendChild(grid);
}

renderHostages();

/* ── UNIT REFERENCE TABLE ── */
const UNITS = [
  ['Tokens', 'Type', 'Movement', 'Terrain restriction'],
  ['1', 'Infantry', 'Same-biome flood fill + 1 step into different biome', 'Destroyed in water or desert'],
  ['2', 'Artillery', 'Straight-line jumps over occupied hexes; pivots at friendly Bases', 'Destroyed in water; no attack from forest'],
  ['3', 'Airborne', 'Exactly 2 steps (any direction, not adjacent); slingshot via Bases', 'Cannot pass through mountains without Base'],
  ['4–9', 'Base', 'Cannot move; converts units to isotopes; enables nuke launches', 'None'],
];
const ut = document.getElementById('unit-table');
UNITS.forEach((row, ri) => {
  row.forEach((cell, ci) => {
    let cls = 'resource-cell';
    if (ri === 0) cls += ' resource-cell--header';
    else if (ci === 0) cls += ' resource-cell--nuke-name';
    else cls += ' resource-cell--body';
    ut.appendChild(el('div', { class: cls }, cell));
  });
});
})();
