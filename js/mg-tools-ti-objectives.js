/* =========================================================================
   TI4 Objective Tracker with Player Scoring
   Renders into #obj-tracker-root on the TI tools page
   ========================================================================= */
(function() {
const { T, el, btn } = MG;

const ROOT_ID = 'obj-tracker-root';
let root = null;

/* ── State ── */
let objData = null;
let gameState = null;

const PLAYER_COLORS = [
  { name: 'Red', hex: '#d11a1a' },
  { name: 'Blue', hex: '#0c4f8d' },
  { name: 'Green', hex: '#3a9928' },
  { name: 'Yellow', hex: '#daa520' },
  { name: 'Purple', hex: '#7b2d8b' },
  { name: 'Black', hex: '#2f2f2f' }
];

const VP_TARGETS = [10, 12, 14];

function defaultState() {
  const enabledExpansions = {};
  if (objData && objData.expansions) {
    objData.expansions.forEach(exp => { enabledExpansions[exp.key] = exp.default !== false; });
  } else {
    enabledExpansions.base = true;
    enabledExpansions.pok = true;
  }
  return {
    phase: 'setup',
    playerCount: 4,
    vpTarget: 10,
    enabledExpansions: enabledExpansions,
    players: [],
    revealedStage1: [],
    revealedStage2: [],
    scoredObjectives: {},
    secretObjectives: {},
    bonusVP: {},
    winner: null
  };
}

/* ── Data fetch ── */
function init() {
  root = document.getElementById(ROOT_ID);
  if (!root) return;
  fetch(MG.url('/data/ti4-objectives.json'))
    .then(r => r.json())
    .then(d => {
      objData = d;
      gameState = defaultState();
      render();
    });
}

/* ── Rendering ── */
function render() {
  root.innerHTML = '';
  if (gameState.phase === 'setup') {
    renderSetup();
  } else if (gameState.phase === 'play') {
    renderGame();
  }
  applyDynamicColors();
}

function applyDynamicColors() {
  root.querySelectorAll('[data-player-color]').forEach(el => {
    const color = el.dataset.playerColor;
    if (el.classList.contains('ot-scoreboard__bar')) {
      el.style.background = color;
      el.style.width = el.dataset.width || '0%';
    } else if (el.classList.contains('ot-player-btn')) {
      if (el.classList.contains('ot-player-btn--scored')) {
        el.style.background = color;
        el.style.borderColor = color;
      } else {
        el.style.borderColor = color;
        el.style.color = color;
      }
    } else {
      el.style.background = color;
    }
  });
  root.querySelectorAll('.ot-swatch').forEach(el => {
    el.style.background = el.dataset.color;
  });
}

/* ── Setup phase ── */
function renderSetup() {
  const wrap = el('div', { class: 'ot-setup' });

  // Player count
  const pcGroup = el('div', { class: 'ot-setup__group' });
  pcGroup.appendChild(el('label', { class: 'ot-setup__label' }, 'Players'));
  const pcBtns = el('div', { class: 'ot-setup__btns' });
  [2, 3, 4, 5, 6].forEach(n => {
    const b = document.createElement('button');
    b.className = 'ot-tog' + (n === gameState.playerCount ? ' ot-tog--active' : '');
    b.textContent = n;
    b.addEventListener('click', () => { gameState.playerCount = n; render(); });
    pcBtns.appendChild(b);
  });
  pcGroup.appendChild(pcBtns);
  wrap.appendChild(pcGroup);

  // VP target
  const vpGroup = el('div', { class: 'ot-setup__group' });
  vpGroup.appendChild(el('label', { class: 'ot-setup__label' }, 'Victory target'));
  const vpBtns = el('div', { class: 'ot-setup__btns' });
  VP_TARGETS.forEach(n => {
    const b = document.createElement('button');
    b.className = 'ot-tog' + (n === gameState.vpTarget ? ' ot-tog--active' : '');
    b.textContent = n + ' VP';
    b.addEventListener('click', () => { gameState.vpTarget = n; render(); });
    vpBtns.appendChild(b);
  });
  vpGroup.appendChild(vpBtns);
  wrap.appendChild(vpGroup);

  // Expansion toggles
  const expGroup = el('div', { class: 'ot-setup__group' });
  expGroup.appendChild(el('label', { class: 'ot-setup__label' }, 'Expansions'));
  const expBtns = el('div', { class: 'ot-setup__btns' });
  objData.expansions.filter(exp => exp.key !== 'base').forEach(exp => {
    const b = document.createElement('button');
    b.className = 'ot-tog' + (gameState.enabledExpansions[exp.key] ? ' ot-tog--active' : '');
    b.textContent = exp.label;
    b.addEventListener('click', () => { gameState.enabledExpansions[exp.key] = !gameState.enabledExpansions[exp.key]; render(); });
    expBtns.appendChild(b);
  });
  expGroup.appendChild(expBtns);
  wrap.appendChild(expGroup);

  // Player colour assignment
  const colGroup = el('div', { class: 'ot-setup__group' });
  colGroup.appendChild(el('label', { class: 'ot-setup__label' }, 'Player colours'));
  const colGrid = el('div', { class: 'ot-setup__colors' });
  for (let i = 0; i < gameState.playerCount; i++) {
    const row = el('div', { class: 'ot-setup__player-row' });
    const label = el('span', { class: 'ot-setup__player-num' }, 'P' + (i + 1));
    row.appendChild(label);
    const swatches = el('div', { class: 'ot-setup__swatches' });
    PLAYER_COLORS.forEach(pc => {
      const swatch = document.createElement('button');
      swatch.className = 'ot-swatch';
      if (getAssignedColor(i) === pc.hex) swatch.classList.add('ot-swatch--selected');
      swatch.dataset.color = pc.hex;
      swatch.setAttribute('aria-label', pc.name);
      swatch.addEventListener('click', () => {
        assignColor(i, pc.hex);
        render();
      });
      swatches.appendChild(swatch);
    });
    row.appendChild(swatches);
    colGrid.appendChild(row);
  }
  colGroup.appendChild(colGrid);
  wrap.appendChild(colGroup);

  // Start button
  const startWrap = el('div', { class: 'ot-setup__start' });
  startWrap.appendChild(btn('Start game', 'dark', () => {
    startGame();
    if (MG.track) MG.track('obj_tracker_start', { players: gameState.playerCount, vp: gameState.vpTarget, expansions: Object.keys(gameState.enabledExpansions).filter(k => gameState.enabledExpansions[k]) });
  }));
  wrap.appendChild(startWrap);

  root.appendChild(wrap);
}

function getAssignedColor(index) {
  if (!gameState.players[index]) return PLAYER_COLORS[index] ? PLAYER_COLORS[index].hex : PLAYER_COLORS[0].hex;
  return gameState.players[index].color;
}

function assignColor(index, hex) {
  // Ensure players array is populated
  while (gameState.players.length < gameState.playerCount) {
    const idx = gameState.players.length;
    gameState.players.push({ color: PLAYER_COLORS[idx] ? PLAYER_COLORS[idx].hex : PLAYER_COLORS[0].hex });
  }
  // Swap if colour already taken
  const existing = gameState.players.findIndex(p => p.color === hex);
  if (existing !== -1 && existing !== index) {
    gameState.players[existing].color = gameState.players[index].color;
  }
  gameState.players[index].color = hex;
}

function startGame() {
  while (gameState.players.length < gameState.playerCount) {
    const idx = gameState.players.length;
    gameState.players.push({ color: PLAYER_COLORS[idx] ? PLAYER_COLORS[idx].hex : PLAYER_COLORS[0].hex });
  }
  gameState.players = gameState.players.slice(0, gameState.playerCount);
  gameState.phase = 'play';
  gameState.scoredObjectives = {};
  gameState.secretObjectives = {};
  gameState.bonusVP = {};
  gameState.players.forEach((_, i) => {
    gameState.bonusVP[i] = { custodians: false, imperial: 0, support: 0 };
    gameState.secretObjectives[i] = [];
  });
  gameState.revealedStage1 = [];
  gameState.revealedStage2 = [];
  gameState.winner = null;
  render();
}

/* ── Game phase ── */
function renderGame() {
  const wrap = el('div', { class: 'ot-game' });

  // Winner banner
  if (gameState.winner !== null) {
    const banner = el('div', { class: 'ot-winner' });
    const pc = getPlayerColor(gameState.winner);
    const pName = getPlayerName(gameState.winner);
    banner.appendChild(el('div', { class: 'ot-winner__label' }, 'WINNER'));
    banner.appendChild(el('div', { class: 'ot-winner__name' }, pName));
    const dot = el('span', { class: 'ot-winner__dot' });
    dot.dataset.playerColor = pc;
    banner.insertBefore(dot, banner.firstChild);
    wrap.appendChild(banner);
  }

  // Scoreboard
  wrap.appendChild(renderScoreboard());

  // Tabs: Public / Secrets / Bonus
  const tabs = el('div', { class: 'ot-tabs' });
  const tabData = [
    { id: 'public', label: 'Public objectives' },
    { id: 'secrets', label: 'Secret objectives' },
    { id: 'bonus', label: 'Bonus VP' }
  ];
  const activeTab = gameState._activeTab || 'public';
  tabData.forEach(t => {
    const tb = document.createElement('button');
    tb.className = 'ot-tab' + (t.id === activeTab ? ' ot-tab--active' : '');
    tb.textContent = t.label;
    tb.addEventListener('click', () => { gameState._activeTab = t.id; render(); });
    tabs.appendChild(tb);
  });
  wrap.appendChild(tabs);

  // Tab content
  const content = el('div', { class: 'ot-tab-content' });
  if (activeTab === 'public') {
    content.appendChild(renderPublicObjectives());
  } else if (activeTab === 'secrets') {
    content.appendChild(renderSecretObjectives());
  } else if (activeTab === 'bonus') {
    content.appendChild(renderBonusVP());
  }
  wrap.appendChild(content);

  // Actions
  const actions = el('div', { class: 'ot-actions' });
  actions.appendChild(btn('Reset game', 'outline-light', () => {
    if (confirm('Reset the objective tracker? All progress will be lost.')) {
      gameState = defaultState();
      render();
    }
  }));
  wrap.appendChild(actions);

  root.appendChild(wrap);
}

/* ── Helpers ── */
function getPlayerColor(index) {
  return gameState.players[index] ? gameState.players[index].color : '#636b78';
}

function getPlayerName(index) {
  const color = getPlayerColor(index);
  const match = PLAYER_COLORS.find(c => c.hex === color);
  return match ? match.name : 'Player ' + (index + 1);
}

function getAvailableObjectives(stage) {
  const pool = stage === 1 ? objData.stage1 : objData.stage2;
  return pool.filter(o => gameState.enabledExpansions[o.expansion]);
}

function getAvailableSecrets() {
  return objData.secrets.filter(o => gameState.enabledExpansions[o.expansion]);
}

function calcPlayerVP(pIndex) {
  let vp = 0;
  // Stage I objectives (1 VP each)
  gameState.revealedStage1.forEach(objName => {
    const key = 's1:' + objName;
    if (gameState.scoredObjectives[key] && gameState.scoredObjectives[key].includes(pIndex)) vp += 1;
  });
  // Stage II objectives (2 VP each)
  gameState.revealedStage2.forEach(objName => {
    const key = 's2:' + objName;
    if (gameState.scoredObjectives[key] && gameState.scoredObjectives[key].includes(pIndex)) vp += 2;
  });
  // Secret objectives (1 VP each)
  vp += (gameState.secretObjectives[pIndex] || []).length;
  // Bonus VP
  const bonus = gameState.bonusVP[pIndex];
  if (bonus) {
    if (bonus.custodians) vp += 1;
    vp += bonus.imperial;
    vp += bonus.support;
  }
  return vp;
}

function checkWinner() {
  gameState.winner = null;
  for (let i = 0; i < gameState.players.length; i++) {
    if (calcPlayerVP(i) >= gameState.vpTarget) {
      gameState.winner = i;
      break;
    }
  }
}

/* ── Scoreboard ── */
function renderScoreboard() {
  const board = el('div', { class: 'ot-scoreboard' });
  const header = el('div', { class: 'ot-scoreboard__header' });
  header.appendChild(el('span', { class: 'ot-scoreboard__title' }, 'Scoreboard'));
  header.appendChild(el('span', { class: 'ot-scoreboard__target' }, 'Target: ' + gameState.vpTarget + ' VP'));
  board.appendChild(header);

  const grid = el('div', { class: 'ot-scoreboard__grid' });
  gameState.players.forEach((player, i) => {
    const vp = calcPlayerVP(i);
    const row = el('div', { class: 'ot-scoreboard__row' });
    if (gameState.winner === i) row.classList.add('ot-scoreboard__row--winner');

    const dot = el('span', { class: 'ot-scoreboard__dot' });
    dot.dataset.playerColor = player.color;

    const name = el('span', { class: 'ot-scoreboard__name' }, getPlayerName(i));
    const score = el('span', { class: 'ot-scoreboard__score' }, String(vp));
    score.dataset.playerColor = player.color;

    // VP bar
    const barWrap = el('div', { class: 'ot-scoreboard__bar-wrap' });
    const bar = el('div', { class: 'ot-scoreboard__bar' });
    const pct = Math.min(100, (vp / gameState.vpTarget) * 100);
    bar.dataset.playerColor = player.color;
    bar.dataset.width = pct + '%';
    barWrap.appendChild(bar);

    row.appendChild(dot);
    row.appendChild(name);
    row.appendChild(barWrap);
    row.appendChild(score);
    grid.appendChild(row);
  });
  board.appendChild(grid);
  return board;
}

/* ── Public Objectives Tab ── */
function renderPublicObjectives() {
  const wrap = el('div', { class: 'ot-public' });

  // Stage I
  const s1Section = el('div', { class: 'ot-stage' });
  const s1Header = el('div', { class: 'ot-stage__header' });
  s1Header.appendChild(el('span', { class: 'ot-stage__label ot-stage__label--green' }, 'STAGE I (1 VP)'));
  const s1Pool = getAvailableObjectives(1);
  const unrevealed1 = s1Pool.filter(o => !gameState.revealedStage1.includes(o.name));
  if (unrevealed1.length > 0) {
    const revealBtn = document.createElement('button');
    revealBtn.className = 'ot-reveal-btn';
    revealBtn.textContent = 'Reveal objective';
    revealBtn.addEventListener('click', () => {
      const next = unrevealed1[Math.floor(Math.random() * unrevealed1.length)];
      gameState.revealedStage1.push(next.name);
      if (MG.track) MG.track('obj_reveal', { stage: 1, name: next.name });
      render();
    });
    s1Header.appendChild(revealBtn);
  }
  s1Section.appendChild(s1Header);

  if (gameState.revealedStage1.length === 0) {
    s1Section.appendChild(el('p', { class: 'ot-empty' }, 'No objectives revealed yet'));
  } else {
    const list = el('div', { class: 'ot-obj-list' });
    gameState.revealedStage1.forEach(name => {
      list.appendChild(renderObjectiveRow(name, 's1', 1));
    });
    s1Section.appendChild(list);
  }
  wrap.appendChild(s1Section);

  // Stage II
  const s2Section = el('div', { class: 'ot-stage' });
  const s2Header = el('div', { class: 'ot-stage__header' });
  s2Header.appendChild(el('span', { class: 'ot-stage__label ot-stage__label--blue' }, 'STAGE II (2 VP)'));
  const unrevealed2 = getAvailableObjectives(2).filter(o => !gameState.revealedStage2.includes(o.name));
  if (unrevealed2.length > 0) {
    const revealBtn2 = document.createElement('button');
    revealBtn2.className = 'ot-reveal-btn';
    revealBtn2.textContent = 'Reveal objective';
    revealBtn2.addEventListener('click', () => {
      const next = unrevealed2[Math.floor(Math.random() * unrevealed2.length)];
      gameState.revealedStage2.push(next.name);
      if (MG.track) MG.track('obj_reveal', { stage: 2, name: next.name });
      render();
    });
    s2Header.appendChild(revealBtn2);
  }
  s2Section.appendChild(s2Header);

  if (gameState.revealedStage2.length === 0) {
    s2Section.appendChild(el('p', { class: 'ot-empty' }, 'No objectives revealed yet'));
  } else {
    const list2 = el('div', { class: 'ot-obj-list' });
    gameState.revealedStage2.forEach(name => {
      list2.appendChild(renderObjectiveRow(name, 's2', 2));
    });
    s2Section.appendChild(list2);
  }
  wrap.appendChild(s2Section);

  // Pool counts
  const info = el('div', { class: 'ot-pool-info' });
  info.appendChild(el('span', {}, 'Pool: ' + s1Pool.length + ' Stage I, ' + getAvailableObjectives(2).length + ' Stage II'));
  objData.expansions.filter(exp => exp.key !== 'base' && gameState.enabledExpansions[exp.key]).forEach(exp => {
    info.appendChild(el('span', { class: 'ot-pool-info__tag' }, exp.label));
  });
  wrap.appendChild(info);

  return wrap;
}

function renderObjectiveRow(name, prefix, vpValue) {
  const key = prefix + ':' + name;
  const scoredBy = gameState.scoredObjectives[key] || [];
  const pool = vpValue === 1 ? objData.stage1 : objData.stage2;
  const objDef = pool.find(o => o.name === name);
  const desc = objDef ? objDef.desc : '';

  const row = el('div', { class: 'ot-obj-row' });
  const header = el('div', { class: 'ot-obj-row__header' });
  header.appendChild(el('span', { class: 'ot-obj-row__name' }, name));
  header.appendChild(el('span', { class: 'ot-obj-row__vp' }, vpValue + ' VP'));
  row.appendChild(header);

  if (desc) {
    row.appendChild(el('p', { class: 'ot-obj-row__desc' }, desc));
  }

  // Player scoring buttons
  const players = el('div', { class: 'ot-obj-row__players' });
  gameState.players.forEach((player, i) => {
    const scored = scoredBy.includes(i);
    const pb = document.createElement('button');
    pb.className = 'ot-player-btn' + (scored ? ' ot-player-btn--scored' : '');
    pb.dataset.playerColor = player.color;
    pb.textContent = getPlayerName(i).charAt(0);
    pb.setAttribute('aria-label', (scored ? 'Remove from ' : 'Score for ') + getPlayerName(i));
    pb.addEventListener('click', () => {
      if (!gameState.scoredObjectives[key]) gameState.scoredObjectives[key] = [];
      if (scored) {
        gameState.scoredObjectives[key] = gameState.scoredObjectives[key].filter(x => x !== i);
      } else {
        gameState.scoredObjectives[key].push(i);
      }
      checkWinner();
      render();
    });
    players.appendChild(pb);
  });
  row.appendChild(players);

  return row;
}

/* ── Secret Objectives Tab ── */
function renderSecretObjectives() {
  const wrap = el('div', { class: 'ot-secrets' });
  const secrets = getAvailableSecrets();

  wrap.appendChild(el('p', { class: 'ot-secrets__info' }, 'Each player draws 2 secret objectives and keeps 1. Mark them as scored below (1 VP each).'));

  gameState.players.forEach((player, pIndex) => {
    const section = el('div', { class: 'ot-secrets__player' });
    const header = el('div', { class: 'ot-secrets__player-header' });
    const dot = el('span', { class: 'ot-secrets__dot' });
    dot.dataset.playerColor = player.color;
    header.appendChild(dot);
    header.appendChild(el('span', { class: 'ot-secrets__player-name' }, getPlayerName(pIndex)));

    const scored = gameState.secretObjectives[pIndex] || [];
    header.appendChild(el('span', { class: 'ot-secrets__count' }, scored.length + ' scored'));
    section.appendChild(header);

    // Show scored secrets
    if (scored.length > 0) {
      const scoredList = el('div', { class: 'ot-secrets__scored' });
      scored.forEach(sName => {
        const row = el('div', { class: 'ot-secrets__scored-row' });
        row.appendChild(el('span', {}, sName));
        const removeBtn = document.createElement('button');
        removeBtn.className = 'ot-secrets__remove';
        removeBtn.textContent = 'x';
        removeBtn.setAttribute('aria-label', 'Remove ' + sName);
        removeBtn.addEventListener('click', () => {
          gameState.secretObjectives[pIndex] = gameState.secretObjectives[pIndex].filter(s => s !== sName);
          checkWinner();
          render();
        });
        row.appendChild(removeBtn);
        scoredList.appendChild(row);
      });
      section.appendChild(scoredList);
    }

    // Add secret dropdown
    const addWrap = el('div', { class: 'ot-secrets__add' });
    const select = document.createElement('select');
    select.className = 'ot-select';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Score a secret objective...';
    select.appendChild(placeholder);
    secrets.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.name;
      opt.textContent = s.name;
      select.appendChild(opt);
    });
    select.addEventListener('change', () => {
      if (select.value) {
        if (!gameState.secretObjectives[pIndex]) gameState.secretObjectives[pIndex] = [];
        gameState.secretObjectives[pIndex].push(select.value);
        if (MG.track) MG.track('obj_secret_scored', { player: pIndex, name: select.value });
        checkWinner();
        render();
      }
    });
    addWrap.appendChild(select);
    section.appendChild(addWrap);

    wrap.appendChild(section);
  });

  return wrap;
}

/* ── Bonus VP Tab ── */
function renderBonusVP() {
  const wrap = el('div', { class: 'ot-bonus' });
  wrap.appendChild(el('p', { class: 'ot-bonus__info' }, 'Track VP from Custodians, Imperial strategy card, and Support for the Throne.'));

  gameState.players.forEach((player, pIndex) => {
    const section = el('div', { class: 'ot-bonus__player' });
    const header = el('div', { class: 'ot-bonus__player-header' });
    const dot = el('span', { class: 'ot-bonus__dot' });
    dot.dataset.playerColor = player.color;
    header.appendChild(dot);
    header.appendChild(el('span', { class: 'ot-bonus__player-name' }, getPlayerName(pIndex)));
    section.appendChild(header);

    const bonus = gameState.bonusVP[pIndex];
    const grid = el('div', { class: 'ot-bonus__grid' });

    // Custodians (toggle, 1 VP)
    grid.appendChild(renderBonusToggle('Custodians', '1 VP', bonus.custodians, () => {
      gameState.bonusVP[pIndex].custodians = !gameState.bonusVP[pIndex].custodians;
      // Only one player can have custodians
      if (gameState.bonusVP[pIndex].custodians) {
        gameState.players.forEach((_, j) => {
          if (j !== pIndex) gameState.bonusVP[j].custodians = false;
        });
      }
      checkWinner();
      render();
    }));

    // Imperial (counter, 1 VP each)
    grid.appendChild(renderBonusCounter('Imperial', '1 VP each', bonus.imperial, (val) => {
      gameState.bonusVP[pIndex].imperial = val;
      checkWinner();
      render();
    }));

    // Support for the Throne (counter, 1 VP each)
    grid.appendChild(renderBonusCounter('Support', '1 VP each', bonus.support, (val) => {
      gameState.bonusVP[pIndex].support = val;
      checkWinner();
      render();
    }));

    section.appendChild(grid);
    wrap.appendChild(section);
  });

  return wrap;
}

function renderBonusToggle(label, vpLabel, active, onClick) {
  const item = el('div', { class: 'ot-bonus__item' + (active ? ' ot-bonus__item--active' : '') });
  item.appendChild(el('span', { class: 'ot-bonus__item-label' }, label));
  item.appendChild(el('span', { class: 'ot-bonus__item-vp' }, vpLabel));
  const toggle = document.createElement('button');
  toggle.className = 'ot-bonus__toggle' + (active ? ' ot-bonus__toggle--on' : '');
  toggle.textContent = active ? 'Yes' : 'No';
  toggle.addEventListener('click', onClick);
  item.appendChild(toggle);
  return item;
}

function renderBonusCounter(label, vpLabel, value, onChange) {
  const item = el('div', { class: 'ot-bonus__item' });
  item.appendChild(el('span', { class: 'ot-bonus__item-label' }, label));
  item.appendChild(el('span', { class: 'ot-bonus__item-vp' }, vpLabel));
  const counter = el('div', { class: 'ot-bonus__counter' });
  const minus = document.createElement('button');
  minus.className = 'ot-bonus__counter-btn';
  minus.textContent = '−';
  minus.addEventListener('click', () => { if (value > 0) onChange(value - 1); });
  const display = el('span', { class: 'ot-bonus__counter-val' }, String(value));
  const plus = document.createElement('button');
  plus.className = 'ot-bonus__counter-btn ot-bonus__counter-btn--plus';
  plus.textContent = '+';
  plus.addEventListener('click', () => { onChange(value + 1); });
  counter.appendChild(minus);
  counter.appendChild(display);
  counter.appendChild(plus);
  item.appendChild(counter);
  return item;
}

/* ── Init ── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
})();
