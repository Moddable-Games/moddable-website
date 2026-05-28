(function() {
const { T, el, btn, navbar, footer } = MG;
document.getElementById('nav-root').appendChild(navbar('Tools'));
document.getElementById('footer-root').appendChild(footer());

const ITERATIONS = 10000;
const TABS = [
  { id: 'roller', label: 'Dice Roller' },
  { id: 'risk', label: 'Risk' },
  { id: 'ti4', label: 'TI4 Space' },
  { id: 'aa', label: 'Axis & Allies' },
  { id: 'xwing', label: 'X-Wing' },
  { id: 'bloodbowl', label: 'Blood Bowl' },
  { id: 'memoir', label: 'Memoir \'44' },
  { id: 'custom', label: 'Custom' }
];
const hashTab = window.location.hash.slice(1);
let activeTab = TABS.some(t => t.id === hashTab) ? hashTab : 'roller';

/* ── Tab bar ── */
function renderTabs() {
  const wrap = document.getElementById('combat-tabs');
  wrap.innerHTML = '';
  TABS.forEach(t => {
    const b = document.createElement('button');
    b.className = 'combat-tabs__btn' + (t.id === activeTab ? ' combat-tabs__btn--active' : '');
    b.textContent = t.label;
    b.addEventListener('click', () => {
      activeTab = t.id;
      history.replaceState(null, '', '#' + t.id);
      renderTabs();
      renderPanel();
    });
    wrap.appendChild(b);
  });
}

function renderPanel() {
  const panel = document.getElementById('combat-panel');
  panel.innerHTML = '';
  if (activeTab === 'roller') renderRoller(panel);
  else if (activeTab === 'risk') renderRisk(panel);
  else if (activeTab === 'ti4') renderTI4(panel);
  else if (activeTab === 'aa') renderAA(panel);
  else if (activeTab === 'xwing') renderXWing(panel);
  else if (activeTab === 'bloodbowl') renderBloodBowl(panel);
  else if (activeTab === 'memoir') renderMemoir(panel);
  else renderCustom(panel);
}

/* ── DICE ROLLER ── */
function renderRoller(panel) {
  const DICE = [4,6,8,10,12,20,100];
  let selectedDie = 6, diceCount = 1, modifier = 0;

  const diceRow = el('div', { class: 'dice-row' });
  DICE.forEach(d => {
    const b = document.createElement('button');
    b.className = 'die-face'; b.setAttribute('data-d', d);
    b.innerHTML = '<span class="die-face__label' + (d===100?' die-face__label--sm':'') + '">d' + d + '</span>';
    b.addEventListener('click', () => { selectedDie = d; updateSel(); });
    diceRow.appendChild(b);
  });
  panel.appendChild(diceRow);

  function updateSel() {
    diceRow.querySelectorAll('.die-face').forEach(b => {
      const d = parseInt(b.getAttribute('data-d'));
      b.style.borderColor = d === selectedDie ? '#6fb5ff' : '';
      b.style.background = d === selectedDie ? '#e8f4ff' : '';
    });
  }
  updateSel();

  const controls = el('div', { class: 'dice-controls' });
  controls.appendChild(el('label', { class: 'dice-controls__label' }, 'Count:'));
  const countSlider = document.createElement('input');
  countSlider.type='range'; countSlider.min='1'; countSlider.max='10'; countSlider.value='1';
  countSlider.className='dice-controls__range';
  const countLabel = el('span', { class: 'dice-controls__value' }, '1');
  countSlider.addEventListener('input', e => { diceCount = parseInt(e.target.value); countLabel.textContent = diceCount; });
  controls.appendChild(countSlider);
  controls.appendChild(countLabel);

  const modDiv = el('div', { class: 'dice-controls__modifier' });
  modDiv.appendChild(el('label', { class: 'dice-controls__label' }, 'Modifier:'));
  const modMinus = el('button', { class: 'dice-controls__btn' }, '−');
  const modVal = el('span', { class: 'dice-controls__value dice-controls__value--wide' }, '0');
  const modPlus = el('button', { class: 'dice-controls__btn' }, '+');
  modMinus.addEventListener('click', () => { modifier--; modVal.textContent = modifier >= 0 ? '+'+modifier : modifier; });
  modPlus.addEventListener('click', () => { modifier++; modVal.textContent = modifier >= 0 ? '+'+modifier : modifier; });
  modDiv.appendChild(modMinus); modDiv.appendChild(modVal); modDiv.appendChild(modPlus);
  controls.appendChild(modDiv);
  panel.appendChild(controls);

  const rollResult = el('div', { class: 'dice-result' }, '—');
  const rollBreak = el('div', { class: 'dice-breakdown' });
  panel.appendChild(rollResult);
  panel.appendChild(rollBreak);

  function rollDice() {
    const rolls = Array.from({length: diceCount}, () => Math.floor(Math.random() * selectedDie) + 1);
    const total = rolls.reduce((a,b)=>a+b,0) + modifier;
    rollResult.textContent = total;
    rollBreak.textContent = '[' + rolls.join(', ') + ']' + (modifier !== 0 ? (modifier>0?'+':'')+modifier : '') + ' = ' + total;
    diceRow.querySelectorAll('.die-face').forEach(b => {
      if (parseInt(b.getAttribute('data-d')) === selectedDie) {
        b.classList.add('rolling'); setTimeout(() => b.classList.remove('rolling'), 400);
      }
    });
  }
  panel.appendChild(btn('Roll the dice', 'dark', rollDice));
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

/* ── AXIS & ALLIES ── */
const AA_UNITS = {
  atk: [
    { name: 'Infantry', hit: 1, cost: 3 },
    { name: 'Artillery', hit: 2, cost: 4 },
    { name: 'Tank', hit: 3, cost: 6 },
    { name: 'Fighter', hit: 3, cost: 10 },
    { name: 'Bomber', hit: 4, cost: 12 },
    { name: 'Battleship', hit: 4, cost: 20, hp: 2 },
    { name: 'Cruiser', hit: 3, cost: 12 },
    { name: 'Destroyer', hit: 2, cost: 8 },
    { name: 'Submarine', hit: 2, cost: 6 }
  ],
  def: [
    { name: 'Infantry', hit: 2, cost: 3 },
    { name: 'Artillery', hit: 2, cost: 4 },
    { name: 'Tank', hit: 3, cost: 6 },
    { name: 'Fighter', hit: 4, cost: 10 },
    { name: 'Bomber', hit: 1, cost: 12 },
    { name: 'Battleship', hit: 4, cost: 20, hp: 2 },
    { name: 'Cruiser', hit: 3, cost: 12 },
    { name: 'Destroyer', hit: 2, cost: 8 },
    { name: 'Submarine', hit: 1, cost: 6 }
  ]
};

function simAARound(atkForce, defForce) {
  let atkHits = 0, defHits = 0;
  atkForce.forEach(u => {
    if (Math.ceil(Math.random() * 6) <= u.hit) atkHits++;
  });
  defForce.forEach(u => {
    if (Math.ceil(Math.random() * 6) <= u.hit) defHits++;
  });
  const newAtk = [...atkForce].sort((a,b) => a.cost - b.cost);
  const newDef = [...defForce].sort((a,b) => a.cost - b.cost);
  let atkRemoved = 0;
  while (atkRemoved < defHits && newAtk.length > 0) {
    newAtk.shift();
    atkRemoved++;
  }
  let defRemoved = 0;
  while (defRemoved < atkHits && newDef.length > 0) {
    newDef.shift();
    defRemoved++;
  }
  return { atk: newAtk, def: newDef };
}

function simAABattle(atkForce, defForce) {
  let atk = [...atkForce], def = [...defForce];
  let rounds = 0;
  while (atk.length > 0 && def.length > 0 && rounds < 30) {
    const r = simAARound(atk, def);
    atk = r.atk;
    def = r.def;
    rounds++;
  }
  return { atkSurviving: atk.length, defSurviving: def.length };
}

function renderAA(panel) {
  let atkCounts = AA_UNITS.atk.map(() => 0);
  let defCounts = AA_UNITS.def.map(() => 0);
  atkCounts[0] = 4; atkCounts[2] = 2; atkCounts[3] = 1;
  defCounts[0] = 6; defCounts[2] = 1;

  const sides = el('div', { class: 'combat-sides' });

  function buildSide(label, units, counts) {
    const side = el('div', { class: 'combat-side' });
    side.appendChild(el('div', { class: 'combat-side__header' }, label));
    units.forEach((unit, i) => {
      const row = el('div', { class: 'combat-unit' });
      row.appendChild(el('span', { class: 'combat-unit__name' }, unit.name));
      row.appendChild(el('span', { class: 'combat-unit__stat' }, unit.hit + ' or less'));
      const input = document.createElement('input');
      input.type = 'number'; input.min = '0'; input.max = '20'; input.value = counts[i];
      input.className = 'combat-input combat-unit__count';
      input.addEventListener('input', () => { counts[i] = parseInt(input.value) || 0; });
      row.appendChild(input);
      side.appendChild(row);
    });
    return side;
  }

  sides.appendChild(buildSide('Attacker', AA_UNITS.atk, atkCounts));
  sides.appendChild(el('div', { class: 'combat-vs' }, 'vs'));
  sides.appendChild(buildSide('Defender', AA_UNITS.def, defCounts));
  panel.appendChild(sides);

  const runWrap = el('div', { class: 'combat-run' });
  const resultsWrap = el('div');
  panel.appendChild(runWrap);
  panel.appendChild(resultsWrap);

  function runSim() {
    let atkWins = 0, defWins = 0, draws = 0;
    let totalAtkSurv = 0, totalDefSurv = 0;

    for (let i = 0; i < ITERATIONS; i++) {
      const atkForce = [];
      const defForce = [];
      AA_UNITS.atk.forEach((u, j) => {
        for (let n = 0; n < atkCounts[j]; n++) atkForce.push(u);
      });
      AA_UNITS.def.forEach((u, j) => {
        for (let n = 0; n < defCounts[j]; n++) defForce.push(u);
      });
      if (atkForce.length === 0 || defForce.length === 0) return;
      const r = simAABattle(atkForce, defForce);
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

/* ── X-WING ── */
const XWING_ATK_FACES = ['hit','hit','hit','crit','focus','focus','blank','blank'];
const XWING_DEF_FACES = ['evade','evade','evade','focus','focus','blank','blank','blank'];

function rollXWingDice(count, faces) {
  const results = {};
  for (let i = 0; i < count; i++) {
    const face = faces[Math.floor(Math.random() * faces.length)];
    results[face] = (results[face] || 0) + 1;
  }
  return results;
}

function simXWing(atkDice, defDice, atkFocus, defFocus) {
  const atk = rollXWingDice(atkDice, XWING_ATK_FACES);
  const def = rollXWingDice(defDice, XWING_DEF_FACES);
  let hits = (atk.hit || 0) + (atk.crit || 0);
  if (atkFocus) hits += (atk.focus || 0);
  let evades = (def.evade || 0);
  if (defFocus) evades += (def.focus || 0);
  const damage = Math.max(0, hits - evades);
  return damage;
}

function renderXWing(panel) {
  let atkDice = 3, defDice = 2, atkFocus = true, defFocus = false;

  const section = el('div', { class: 'combat-section' });
  section.appendChild(el('h3', { class: 'combat-section__title' }, 'X-Wing Attack'));

  const r1 = el('div', { class: 'combat-row' });
  r1.appendChild(el('span', { class: 'combat-row__label' }, 'Attack dice:'));
  const aSel = document.createElement('select');
  aSel.className = 'combat-select';
  [1,2,3,4,5,6].forEach(n => { const o = document.createElement('option'); o.value=n; o.textContent=n; if(n===atkDice) o.selected=true; aSel.appendChild(o); });
  aSel.addEventListener('change', () => { atkDice = parseInt(aSel.value); });
  r1.appendChild(aSel);
  section.appendChild(r1);

  const r2 = el('div', { class: 'combat-row' });
  r2.appendChild(el('span', { class: 'combat-row__label' }, 'Defence dice:'));
  const dSel = document.createElement('select');
  dSel.className = 'combat-select';
  [0,1,2,3,4,5,6].forEach(n => { const o = document.createElement('option'); o.value=n; o.textContent=n; if(n===defDice) o.selected=true; dSel.appendChild(o); });
  dSel.addEventListener('change', () => { defDice = parseInt(dSel.value); });
  r2.appendChild(dSel);
  section.appendChild(r2);

  const r3 = el('div', { class: 'combat-row' });
  r3.appendChild(el('span', { class: 'combat-row__label' }, 'Attacker focus:'));
  const afChk = document.createElement('input');
  afChk.type = 'checkbox'; afChk.checked = atkFocus;
  afChk.addEventListener('change', () => { atkFocus = afChk.checked; });
  r3.appendChild(afChk);
  r3.appendChild(el('span', { class: 'combat-unit__stat' }, 'converts focus → hits'));
  section.appendChild(r3);

  const r4 = el('div', { class: 'combat-row' });
  r4.appendChild(el('span', { class: 'combat-row__label' }, 'Defender focus:'));
  const dfChk = document.createElement('input');
  dfChk.type = 'checkbox'; dfChk.checked = defFocus;
  dfChk.addEventListener('change', () => { defFocus = dfChk.checked; });
  r4.appendChild(dfChk);
  r4.appendChild(el('span', { class: 'combat-unit__stat' }, 'converts focus → evades'));
  section.appendChild(r4);

  panel.appendChild(section);

  const runWrap = el('div', { class: 'combat-run' });
  const resultsWrap = el('div');
  panel.appendChild(runWrap);
  panel.appendChild(resultsWrap);

  function runSim() {
    let totalDmg = 0;
    const dmgDist = {};
    for (let i = 0; i < ITERATIONS; i++) {
      const d = simXWing(atkDice, defDice, atkFocus, defFocus);
      totalDmg += d;
      dmgDist[d] = (dmgDist[d] || 0) + 1;
    }
    const avgDmg = (totalDmg / ITERATIONS).toFixed(2);
    const zeroPct = ((dmgDist[0] || 0) / ITERATIONS * 100);
    const onePlusPct = 100 - zeroPct;

    resultsWrap.innerHTML = '';
    showResults(resultsWrap, {
      atkWin: onePlusPct,
      defWin: zeroPct,
      detail: 'Avg damage dealt: ' + avgDmg + ' · Zero damage: ' + zeroPct.toFixed(1) + '%'
    });
  }

  runWrap.appendChild(btn('Run simulation', 'dark', runSim));
  runWrap.appendChild(el('span', { class: 'combat-run__iters' }, ITERATIONS.toLocaleString() + ' iterations'));
}

/* ── BLOOD BOWL ── */
const BB_BLOCK_FACES = ['attacker_down','both_down','push','push','defender_stumbles','defender_down'];

function rollBlockDice(count, chooseBest) {
  const rolls = [];
  for (let i = 0; i < Math.abs(count); i++) {
    rolls.push(BB_BLOCK_FACES[Math.floor(Math.random() * 6)]);
  }
  const priority = chooseBest
    ? ['defender_down','defender_stumbles','push','both_down','attacker_down']
    : ['attacker_down','both_down','push','defender_stumbles','defender_down'];
  rolls.sort((a,b) => priority.indexOf(a) - priority.indexOf(b));
  return rolls[0];
}

function renderBloodBowl(panel) {
  let diceCount = 1, hasDodge = false, hasBlock = true;

  const section = el('div', { class: 'combat-section' });
  section.appendChild(el('h3', { class: 'combat-section__title' }, 'Blood Bowl Block'));

  const r1 = el('div', { class: 'combat-row' });
  r1.appendChild(el('span', { class: 'combat-row__label' }, 'Block dice:'));
  const dSel = document.createElement('select');
  dSel.className = 'combat-select';
  [[-2,'2 (defender chooses)'],[-1,'1 (defender chooses)'],[1,'1'],[2,'2 (attacker chooses)'],[3,'3 (attacker chooses)']].forEach(([v,l]) => {
    const o = document.createElement('option'); o.value=v; o.textContent=l;
    if(v===diceCount) o.selected=true; dSel.appendChild(o);
  });
  dSel.addEventListener('change', () => { diceCount = parseInt(dSel.value); });
  r1.appendChild(dSel);
  section.appendChild(r1);

  const r2 = el('div', { class: 'combat-row' });
  r2.appendChild(el('span', { class: 'combat-row__label' }, 'Attacker has Block:'));
  const blkChk = document.createElement('input');
  blkChk.type = 'checkbox'; blkChk.checked = hasBlock;
  blkChk.addEventListener('change', () => { hasBlock = blkChk.checked; });
  r2.appendChild(blkChk);
  r2.appendChild(el('span', { class: 'combat-unit__stat' }, 'both_down = safe'));
  section.appendChild(r2);

  const r3 = el('div', { class: 'combat-row' });
  r3.appendChild(el('span', { class: 'combat-row__label' }, 'Defender has Dodge:'));
  const dodChk = document.createElement('input');
  dodChk.type = 'checkbox'; dodChk.checked = hasDodge;
  dodChk.addEventListener('change', () => { hasDodge = dodChk.checked; });
  r3.appendChild(dodChk);
  r3.appendChild(el('span', { class: 'combat-unit__stat' }, 'stumbles = push'));
  section.appendChild(r3);

  panel.appendChild(section);

  const runWrap = el('div', { class: 'combat-run' });
  const resultsWrap = el('div');
  panel.appendChild(runWrap);
  panel.appendChild(resultsWrap);

  function runSim() {
    let knockdowns = 0, pushes = 0, turnovers = 0;
    for (let i = 0; i < ITERATIONS; i++) {
      const chooseBest = diceCount > 0;
      const result = rollBlockDice(diceCount, chooseBest);
      if (result === 'defender_down') { knockdowns++; }
      else if (result === 'defender_stumbles') {
        if (hasDodge) pushes++;
        else knockdowns++;
      }
      else if (result === 'push') { pushes++; }
      else if (result === 'both_down') {
        if (hasBlock) pushes++;
        else turnovers++;
      }
      else if (result === 'attacker_down') { turnovers++; }
    }

    resultsWrap.innerHTML = '';
    showResults(resultsWrap, {
      atkWin: (knockdowns / ITERATIONS) * 100,
      draw: (pushes / ITERATIONS) * 100,
      defWin: (turnovers / ITERATIONS) * 100,
      detail: 'Knockdown: ' + (knockdowns/ITERATIONS*100).toFixed(1) + '% · Push: ' + (pushes/ITERATIONS*100).toFixed(1) + '% · Turnover: ' + (turnovers/ITERATIONS*100).toFixed(1) + '%'
    });
  }

  runWrap.appendChild(btn('Run simulation', 'dark', runSim));
  runWrap.appendChild(el('span', { class: 'combat-run__iters' }, ITERATIONS.toLocaleString() + ' iterations'));
}

/* ── MEMOIR '44 ── */
const MEMOIR_FACES = ['infantry','infantry','armor','grenade','star','flag'];

function renderMemoir(panel) {
  let atkDice = 3, targetType = 'infantry', inCover = false;

  const section = el('div', { class: 'combat-section' });
  section.appendChild(el('h3', { class: 'combat-section__title' }, 'Memoir \'44 Combat'));

  const r1 = el('div', { class: 'combat-row' });
  r1.appendChild(el('span', { class: 'combat-row__label' }, 'Combat dice:'));
  const dSel = document.createElement('select');
  dSel.className = 'combat-select';
  [1,2,3,4,5,6].forEach(n => { const o = document.createElement('option'); o.value=n; o.textContent=n; if(n===atkDice) o.selected=true; dSel.appendChild(o); });
  dSel.addEventListener('change', () => { atkDice = parseInt(dSel.value); });
  r1.appendChild(dSel);
  section.appendChild(r1);

  const r2 = el('div', { class: 'combat-row' });
  r2.appendChild(el('span', { class: 'combat-row__label' }, 'Target type:'));
  const tSel = document.createElement('select');
  tSel.className = 'combat-select';
  [['infantry','Infantry'],['armor','Armor']].forEach(([v,l]) => {
    const o = document.createElement('option'); o.value=v; o.textContent=l;
    if(v===targetType) o.selected=true; tSel.appendChild(o);
  });
  tSel.addEventListener('change', () => { targetType = tSel.value; });
  r2.appendChild(tSel);
  section.appendChild(r2);

  const r3 = el('div', { class: 'combat-row' });
  r3.appendChild(el('span', { class: 'combat-row__label' }, 'Target in cover:'));
  const covChk = document.createElement('input');
  covChk.type = 'checkbox'; covChk.checked = inCover;
  covChk.addEventListener('change', () => { inCover = covChk.checked; });
  r3.appendChild(covChk);
  r3.appendChild(el('span', { class: 'combat-unit__stat' }, 'flags don\'t force retreat'));
  section.appendChild(r3);

  panel.appendChild(section);

  const runWrap = el('div', { class: 'combat-run' });
  const resultsWrap = el('div');
  panel.appendChild(runWrap);
  panel.appendChild(resultsWrap);

  function runSim() {
    let totalHits = 0, totalRetreats = 0;
    const hitDist = {};
    for (let i = 0; i < ITERATIONS; i++) {
      let hits = 0, retreats = 0;
      for (let d = 0; d < atkDice; d++) {
        const face = MEMOIR_FACES[Math.floor(Math.random() * 6)];
        if (face === targetType) hits++;
        else if (face === 'grenade') hits++;
        else if (face === 'star') hits++;
        else if (face === 'flag' && !inCover) retreats++;
      }
      totalHits += hits;
      totalRetreats += retreats;
      hitDist[hits] = (hitDist[hits] || 0) + 1;
    }
    const avgHits = (totalHits / ITERATIONS).toFixed(2);
    const avgRetreats = (totalRetreats / ITERATIONS).toFixed(2);
    const zeroPct = ((hitDist[0] || 0) / ITERATIONS * 100);

    resultsWrap.innerHTML = '';
    showResults(resultsWrap, {
      atkWin: 100 - zeroPct,
      defWin: zeroPct,
      detail: 'Avg hits: ' + avgHits + ' · Avg retreats: ' + avgRetreats + ' · Zero hits: ' + zeroPct.toFixed(1) + '%'
    });
  }

  runWrap.appendChild(btn('Run simulation', 'dark', runSim));
  runWrap.appendChild(el('span', { class: 'combat-run__iters' }, ITERATIONS.toLocaleString() + ' iterations'));
}

/* ── CUSTOM ── */
function renderCustom(panel) {
  let atkUnits = [{ name: 'Infantry', dice: 1, sides: 6, hit: 4 }];
  let defUnits = [{ name: 'Infantry', dice: 1, sides: 6, hit: 4 }];

  const sides = el('div', { class: 'combat-sides combat-sides--stacked' });

  function buildSide(label, units, redraw) {
    const side = el('div', { class: 'combat-side' });
    side.appendChild(el('div', { class: 'combat-side__header' }, label));
    units.forEach((u, i) => {
      const row = el('div', { class: 'combat-unit' });
      const nameIn = document.createElement('input');
      nameIn.type = 'text'; nameIn.value = u.name;
      nameIn.className = 'combat-input combat-unit__name-input';
      nameIn.addEventListener('input', () => { u.name = nameIn.value; });
      row.appendChild(nameIn);
      const diceIn = document.createElement('input');
      diceIn.type = 'number'; diceIn.min = '1'; diceIn.max = '10'; diceIn.value = u.dice;
      diceIn.className = 'combat-input'; diceIn.title = 'Dice count';
      diceIn.addEventListener('input', () => { u.dice = parseInt(diceIn.value) || 1; });
      row.appendChild(diceIn);
      row.appendChild(el('span', { class: 'combat-unit__stat' }, 'd'));
      const sidesIn = document.createElement('input');
      sidesIn.type = 'number'; sidesIn.min = '2'; sidesIn.max = '20'; sidesIn.value = u.sides;
      sidesIn.className = 'combat-input'; sidesIn.title = 'Dice sides';
      sidesIn.addEventListener('input', () => { u.sides = parseInt(sidesIn.value) || 6; });
      row.appendChild(sidesIn);
      row.appendChild(el('span', { class: 'combat-unit__stat' }, 'hit'));
      const hitIn = document.createElement('input');
      hitIn.type = 'number'; hitIn.min = '1'; hitIn.max = '20'; hitIn.value = u.hit;
      hitIn.className = 'combat-input'; hitIn.title = 'Hit on X+';
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
