(function() {
const { T, el, btn, navbar, footer } = MG;
document.getElementById('nav-root').appendChild(navbar('Tools'));
document.getElementById('footer-root').appendChild(footer());

const ITERATIONS = 10000;
const TABS = [
  { id: 'risk', label: 'Risk' },
  { id: 'ti4', label: 'TI4 Space' },
  { id: 'custom', label: 'Custom' }
];
let activeTab = 'risk';

/* ── Tab bar ── */
function renderTabs() {
  const wrap = document.getElementById('combat-tabs');
  wrap.innerHTML = '';
  TABS.forEach(t => {
    const b = document.createElement('button');
    b.className = 'combat-tabs__btn' + (t.id === activeTab ? ' combat-tabs__btn--active' : '');
    b.textContent = t.label;
    b.addEventListener('click', () => { activeTab = t.id; renderTabs(); renderPanel(); });
    wrap.appendChild(b);
  });
}

function renderPanel() {
  const panel = document.getElementById('combat-panel');
  panel.innerHTML = '';
  if (activeTab === 'risk') renderRisk(panel);
  else if (activeTab === 'ti4') renderTI4(panel);
  else renderCustom(panel);
}

/* ── Results renderer ── */
function showResults(panel, results) {
  const wrap = el('div', { class: 'combat-results' });
  wrap.appendChild(el('div', { class: 'combat-results__title' }, 'Results (' + ITERATIONS.toLocaleString() + ' simulations)'));

  const rows = [
    ['Attacker wins', results.atkWin, 'atk'],
    ['Defender wins', results.defWin, 'def'],
    ['Draw', results.draw, 'draw']
  ];
  rows.forEach(([label, pct, cls]) => {
    if (pct === undefined) return;
    const row = el('div', { class: 'combat-results__row' });
    row.appendChild(el('span', { class: 'combat-results__label' }, label));
    const bar = el('div', { class: 'combat-results__bar' });
    const fill = el('div', { class: 'combat-results__fill combat-results__fill--' + cls });
    fill.style.width = pct + '%';
    bar.appendChild(fill);
    row.appendChild(bar);
    row.appendChild(el('span', { class: 'combat-results__pct' }, pct.toFixed(1) + '%'));
    wrap.appendChild(row);
  });

  if (results.detail) {
    wrap.appendChild(el('div', { class: 'combat-results__detail' }, results.detail));
  }
  panel.appendChild(wrap);
}

/* ── RISK ── */
function simRiskBattle(atkDice, defDice) {
  const atk = Array.from({length: atkDice}, () => Math.ceil(Math.random() * 6)).sort((a,b) => b-a);
  const def = Array.from({length: defDice}, () => Math.ceil(Math.random() * 6)).sort((a,b) => b-a);
  let atkLoss = 0, defLoss = 0;
  const comparisons = Math.min(atk.length, def.length);
  for (let i = 0; i < comparisons; i++) {
    if (atk[i] > def[i]) defLoss++;
    else atkLoss++;
  }
  return { atkLoss, defLoss };
}

function simRiskWar(atkTroops, defTroops) {
  let atk = atkTroops, def = defTroops;
  while (atk > 0 && def > 0) {
    const atkDice = Math.min(atk, 3);
    const defDice = Math.min(def, 2);
    const r = simRiskBattle(atkDice, defDice);
    atk -= r.atkLoss;
    def -= r.defLoss;
  }
  return { atkSurviving: atk, defSurviving: def };
}

function renderRisk(panel) {
  let atkDice = 3, defDice = 2, mode = 'single';
  let atkTroops = 10, defTroops = 5;

  const section = el('div', { class: 'combat-section' });
  section.appendChild(el('h3', { class: 'combat-section__title' }, 'Risk Combat'));

  const modeRow = el('div', { class: 'combat-row' });
  modeRow.appendChild(el('span', { class: 'combat-row__label' }, 'Mode:'));
  const modeSel = document.createElement('select');
  modeSel.className = 'combat-select';
  [['single','Single round'],['war','Fight to the death']].forEach(([v,l]) => {
    const opt = document.createElement('option');
    opt.value = v; opt.textContent = l;
    if (v === mode) opt.selected = true;
    modeSel.appendChild(opt);
  });
  modeRow.appendChild(modeSel);
  section.appendChild(modeRow);

  const configWrap = el('div', { id: 'risk-config' });
  section.appendChild(configWrap);
  panel.appendChild(section);

  const runWrap = el('div', { class: 'combat-run' });
  const resultsWrap = el('div');
  panel.appendChild(runWrap);
  panel.appendChild(resultsWrap);

  function renderConfig() {
    configWrap.innerHTML = '';
    if (mode === 'single') {
      const r1 = el('div', { class: 'combat-row' });
      r1.appendChild(el('span', { class: 'combat-row__label' }, 'Attacker dice:'));
      const aSel = document.createElement('select');
      aSel.className = 'combat-select';
      [1,2,3].forEach(n => { const o = document.createElement('option'); o.value=n; o.textContent=n; if(n===atkDice) o.selected=true; aSel.appendChild(o); });
      aSel.addEventListener('change', () => { atkDice = parseInt(aSel.value); });
      r1.appendChild(aSel);
      configWrap.appendChild(r1);

      const r2 = el('div', { class: 'combat-row' });
      r2.appendChild(el('span', { class: 'combat-row__label' }, 'Defender dice:'));
      const dSel = document.createElement('select');
      dSel.className = 'combat-select';
      [1,2].forEach(n => { const o = document.createElement('option'); o.value=n; o.textContent=n; if(n===defDice) o.selected=true; dSel.appendChild(o); });
      dSel.addEventListener('change', () => { defDice = parseInt(dSel.value); });
      r2.appendChild(dSel);
      configWrap.appendChild(r2);
    } else {
      const r1 = el('div', { class: 'combat-row' });
      r1.appendChild(el('span', { class: 'combat-row__label' }, 'Attacker troops:'));
      const aIn = document.createElement('input');
      aIn.type='number'; aIn.min='1'; aIn.max='50'; aIn.value=atkTroops;
      aIn.className='combat-input'; aIn.style.width='72px';
      aIn.addEventListener('input', () => { atkTroops = parseInt(aIn.value)||1; });
      r1.appendChild(aIn);
      configWrap.appendChild(r1);

      const r2 = el('div', { class: 'combat-row' });
      r2.appendChild(el('span', { class: 'combat-row__label' }, 'Defender troops:'));
      const dIn = document.createElement('input');
      dIn.type='number'; dIn.min='1'; dIn.max='50'; dIn.value=defTroops;
      dIn.className='combat-input'; dIn.style.width='72px';
      dIn.addEventListener('input', () => { defTroops = parseInt(dIn.value)||1; });
      r2.appendChild(dIn);
      configWrap.appendChild(r2);
    }
  }

  modeSel.addEventListener('change', () => { mode = modeSel.value; renderConfig(); });
  renderConfig();

  function runSim() {
    let atkWins = 0, defWins = 0, draws = 0;
    let totalAtkLoss = 0, totalDefLoss = 0;

    for (let i = 0; i < ITERATIONS; i++) {
      if (mode === 'single') {
        const r = simRiskBattle(atkDice, defDice);
        totalAtkLoss += r.atkLoss;
        totalDefLoss += r.defLoss;
        if (r.defLoss > r.atkLoss) atkWins++;
        else if (r.atkLoss > r.defLoss) defWins++;
        else draws++;
      } else {
        const r = simRiskWar(atkTroops, defTroops);
        totalAtkLoss += (atkTroops - r.atkSurviving);
        totalDefLoss += (defTroops - r.defSurviving);
        if (r.defSurviving === 0) atkWins++;
        else defWins++;
      }
    }

    const avgAtkLoss = (totalAtkLoss / ITERATIONS).toFixed(2);
    const avgDefLoss = (totalDefLoss / ITERATIONS).toFixed(2);
    resultsWrap.innerHTML = '';
    showResults(resultsWrap, {
      atkWin: (atkWins / ITERATIONS) * 100,
      defWin: (defWins / ITERATIONS) * 100,
      draw: mode === 'single' ? (draws / ITERATIONS) * 100 : undefined,
      detail: 'Avg attacker losses: ' + avgAtkLoss + ' · Avg defender losses: ' + avgDefLoss
    });
  }

  runWrap.innerHTML = '';
  runWrap.appendChild(btn('Run simulation', 'dark', runSim));
  runWrap.appendChild(el('span', { class: 'combat-run__iters' }, ITERATIONS.toLocaleString() + ' iterations'));
}

/* ── TI4 SPACE COMBAT ── */
const TI4_SHIPS = [
  { name: 'War Sun', hit: 3, cost: 12, combat: 3, dice: 3 },
  { name: 'Dreadnought', hit: 5, cost: 4, combat: 5, dice: 1 },
  { name: 'Flagship', hit: 5, cost: 8, combat: 5, dice: 2 },
  { name: 'Cruiser', hit: 7, cost: 2, combat: 7, dice: 1 },
  { name: 'Carrier', hit: 9, cost: 3, combat: 9, dice: 1 },
  { name: 'Destroyer', hit: 9, cost: 1, combat: 9, dice: 1 },
  { name: 'Fighter', hit: 9, cost: 0.5, combat: 9, dice: 1 }
];

function simTI4Round(atkFleet, defFleet) {
  let atkHits = 0, defHits = 0;
  atkFleet.forEach(ship => {
    for (let d = 0; d < ship.dice; d++) {
      if (Math.ceil(Math.random() * 10) >= ship.hit) atkHits++;
    }
  });
  defFleet.forEach(ship => {
    for (let d = 0; d < ship.dice; d++) {
      if (Math.ceil(Math.random() * 10) >= ship.hit) defHits++;
    }
  });
  // Assign casualties cheapest-first
  const atkSorted = [...atkFleet].sort((a,b) => a.cost - b.cost);
  const defSorted = [...defFleet].sort((a,b) => a.cost - b.cost);
  const newAtk = atkSorted.slice(Math.min(defHits, atkSorted.length));
  const newDef = defSorted.slice(Math.min(atkHits, defSorted.length));
  return { atk: newAtk, def: newDef };
}

function simTI4Battle(atkFleet, defFleet) {
  let atk = [...atkFleet], def = [...defFleet];
  let rounds = 0;
  while (atk.length > 0 && def.length > 0 && rounds < 20) {
    const result = simTI4Round(atk, def);
    atk = result.atk;
    def = result.def;
    rounds++;
  }
  return { atkSurviving: atk.length, defSurviving: def.length };
}

function renderTI4(panel) {
  let atkCounts = TI4_SHIPS.map(() => 0);
  let defCounts = TI4_SHIPS.map(() => 0);
  atkCounts[1] = 2; atkCounts[4] = 1; atkCounts[6] = 3; // 2 dread, 1 carrier, 3 fighters
  defCounts[1] = 1; defCounts[3] = 2; defCounts[6] = 2; // 1 dread, 2 cruisers, 2 fighters

  const sides = el('div', { class: 'combat-sides' });

  function buildSide(label, counts) {
    const side = el('div', { class: 'combat-side' });
    side.appendChild(el('div', { class: 'combat-side__header' }, label));
    TI4_SHIPS.forEach((ship, i) => {
      const row = el('div', { class: 'combat-unit' });
      row.appendChild(el('span', { class: 'combat-unit__name' }, ship.name));
      row.appendChild(el('span', { class: 'combat-unit__stat' }, ship.hit + '+'));
      const input = document.createElement('input');
      input.type = 'number'; input.min = '0'; input.max = '12'; input.value = counts[i];
      input.className = 'combat-input combat-unit__count';
      input.addEventListener('input', () => { counts[i] = parseInt(input.value) || 0; });
      row.appendChild(input);
      side.appendChild(row);
    });
    return side;
  }

  sides.appendChild(buildSide('Attacker', atkCounts));
  sides.appendChild(el('div', { class: 'combat-vs' }, 'vs'));
  sides.appendChild(buildSide('Defender', defCounts));
  panel.appendChild(sides);

  const runWrap = el('div', { class: 'combat-run' });
  const resultsWrap = el('div');
  panel.appendChild(runWrap);
  panel.appendChild(resultsWrap);

  function runSim() {
    let atkWins = 0, defWins = 0, draws = 0;
    let totalAtkSurv = 0, totalDefSurv = 0;

    const atkFleet = [];
    const defFleet = [];
    TI4_SHIPS.forEach((ship, i) => {
      for (let n = 0; n < atkCounts[i]; n++) atkFleet.push(ship);
      for (let n = 0; n < defCounts[i]; n++) defFleet.push(ship);
    });

    if (atkFleet.length === 0 || defFleet.length === 0) return;

    for (let i = 0; i < ITERATIONS; i++) {
      const r = simTI4Battle(atkFleet, defFleet);
      totalAtkSurv += r.atkSurviving;
      totalDefSurv += r.defSurviving;
      if (r.defSurviving === 0 && r.atkSurviving > 0) atkWins++;
      else if (r.atkSurviving === 0 && r.defSurviving > 0) defWins++;
      else draws++;
    }

    resultsWrap.innerHTML = '';
    showResults(resultsWrap, {
      atkWin: (atkWins / ITERATIONS) * 100,
      defWin: (defWins / ITERATIONS) * 100,
      draw: (draws / ITERATIONS) * 100,
      detail: 'Avg attacker survivors: ' + (totalAtkSurv / ITERATIONS).toFixed(1)
        + ' · Avg defender survivors: ' + (totalDefSurv / ITERATIONS).toFixed(1)
    });
  }

  runWrap.appendChild(btn('Run simulation', 'dark', runSim));
  runWrap.appendChild(el('span', { class: 'combat-run__iters' }, ITERATIONS.toLocaleString() + ' iterations'));
}

/* ── CUSTOM ── */
function renderCustom(panel) {
  let atkUnits = [{ name: 'Infantry', dice: 1, sides: 6, hit: 4 }];
  let defUnits = [{ name: 'Infantry', dice: 1, sides: 6, hit: 4 }];

  const sides = el('div', { class: 'combat-sides' });

  function buildSide(label, units, redraw) {
    const side = el('div', { class: 'combat-side' });
    side.appendChild(el('div', { class: 'combat-side__header' }, label));
    units.forEach((u, i) => {
      const row = el('div', { class: 'combat-unit' });
      const nameIn = document.createElement('input');
      nameIn.type = 'text'; nameIn.value = u.name; nameIn.className = 'combat-input';
      nameIn.style.width = '90px'; nameIn.style.textAlign = 'left';
      nameIn.addEventListener('input', () => { u.name = nameIn.value; });
      row.appendChild(nameIn);
      const diceIn = document.createElement('input');
      diceIn.type = 'number'; diceIn.min = '1'; diceIn.max = '10'; diceIn.value = u.dice;
      diceIn.className = 'combat-input'; diceIn.style.width = '44px'; diceIn.title = 'Dice count';
      diceIn.addEventListener('input', () => { u.dice = parseInt(diceIn.value) || 1; });
      row.appendChild(diceIn);
      row.appendChild(el('span', { class: 'combat-unit__stat' }, 'd'));
      const sidesIn = document.createElement('input');
      sidesIn.type = 'number'; sidesIn.min = '2'; sidesIn.max = '20'; sidesIn.value = u.sides;
      sidesIn.className = 'combat-input'; sidesIn.style.width = '44px'; sidesIn.title = 'Dice sides';
      sidesIn.addEventListener('input', () => { u.sides = parseInt(sidesIn.value) || 6; });
      row.appendChild(sidesIn);
      row.appendChild(el('span', { class: 'combat-unit__stat' }, 'hit'));
      const hitIn = document.createElement('input');
      hitIn.type = 'number'; hitIn.min = '1'; hitIn.max = '20'; hitIn.value = u.hit;
      hitIn.className = 'combat-input'; hitIn.style.width = '44px'; hitIn.title = 'Hit on X+';
      hitIn.addEventListener('input', () => { u.hit = parseInt(hitIn.value) || 1; });
      row.appendChild(hitIn);
      row.appendChild(el('span', { class: 'combat-unit__stat' }, '+'));
      const rm = document.createElement('button');
      rm.className = 'combat-unit__remove'; rm.textContent = '×';
      rm.addEventListener('click', () => { units.splice(i, 1); redraw(); });
      row.appendChild(rm);
      side.appendChild(row);
    });
    side.appendChild(btn('+ Add unit type', 'outline-dark', () => {
      units.push({ name: 'Unit', dice: 1, sides: 6, hit: 4 });
      redraw();
    }));
    return side;
  }

  function redraw() {
    sides.innerHTML = '';
    sides.appendChild(buildSide('Attacker', atkUnits, redraw));
    sides.appendChild(el('div', { class: 'combat-vs' }, 'vs'));
    sides.appendChild(buildSide('Defender', defUnits, redraw));
  }
  redraw();
  panel.appendChild(sides);

  const runWrap = el('div', { class: 'combat-run' });
  const resultsWrap = el('div');
  panel.appendChild(runWrap);
  panel.appendChild(resultsWrap);

  function runSim() {
    let atkWins = 0, defWins = 0, draws = 0;
    for (let i = 0; i < ITERATIONS; i++) {
      let atkHits = 0, defHits = 0;
      atkUnits.forEach(u => {
        for (let d = 0; d < u.dice; d++) {
          if (Math.ceil(Math.random() * u.sides) >= u.hit) atkHits++;
        }
      });
      defUnits.forEach(u => {
        for (let d = 0; d < u.dice; d++) {
          if (Math.ceil(Math.random() * u.sides) >= u.hit) defHits++;
        }
      });
      if (atkHits > defHits) atkWins++;
      else if (defHits > atkHits) defWins++;
      else draws++;
    }
    resultsWrap.innerHTML = '';
    showResults(resultsWrap, {
      atkWin: (atkWins / ITERATIONS) * 100,
      defWin: (defWins / ITERATIONS) * 100,
      draw: (draws / ITERATIONS) * 100,
      detail: 'Comparing total hits per side. Add multiple unit types to compose forces.'
    });
  }

  runWrap.appendChild(btn('Run simulation', 'dark', runSim));
  runWrap.appendChild(el('span', { class: 'combat-run__iters' }, ITERATIONS.toLocaleString() + ' iterations'));
}

/* ── Init ── */
renderTabs();
renderPanel();
})();
