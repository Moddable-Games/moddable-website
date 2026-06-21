/* =========================================================================
   Moddable.Games — TI4 Dashboard
   ========================================================================= */
(function () {
'use strict';
const { el, url } = MG;

const PLAYER_COLORS = [
  { name: 'Red',    hex: '#d11a1a' },
  { name: 'Blue',   hex: '#0c4f8d' },
  { name: 'Green',  hex: '#3a9928' },
  { name: 'Yellow', hex: '#daa520' },
  { name: 'Purple', hex: '#7b2d8b' },
  { name: 'Black',  hex: '#2f2f2f' }
];
const VP_TARGETS = [10, 12, 14];
const PHASES = ['Strategy', 'Action', 'Status', 'Agenda'];
const STRATEGY_CARDS = [
  { num: 1, name: 'Leadership' }, { num: 2, name: 'Diplomacy' },
  { num: 3, name: 'Politics' },   { num: 4, name: 'Construction' },
  { num: 5, name: 'Trade' },      { num: 6, name: 'Warfare' },
  { num: 7, name: 'Technology' }, { num: 8, name: 'Imperial' }
];

let dashRoot = null, objData = null, ti4Data = null, session = null;
let setup = {
  step: 1, playerCount: 4, vpTarget: 10,
  enabledExpansions: {}, players: [], factionAssignments: {}
};

function playerColor(i) {
  const p = session && session.players[i];
  return (p && p.color) ? p.color : PLAYER_COLORS[i % PLAYER_COLORS.length].hex;
}
function playerName(i) {
  const p = session && session.players[i];
  return (p && p.name) ? p.name : 'Player ' + (i + 1);
}
function setupPlayerName(i) {
  return (setup.players[i] && setup.players[i].name) ? setup.players[i].name : 'Player ' + (i + 1);
}

function calcVP(i) {
  let vp = 0;
  if (!session) return vp;
  Object.entries(session.scoredObjectives).forEach(function([key, players]) {
    if (players.includes(i)) vp += key.startsWith('s2:') ? 2 : 1;
  });
  (session.secretObjectives[i] || []).forEach(function(s) { if (s.scored) vp += 1; });
  const bonus = session.bonusVP[i] || {};
  vp += (bonus.custodians || 0) + (bonus.imperial || 0) + (bonus.support || 0);
  return vp;
}

function checkWinner() {
  if (!session) return;
  for (let i = 0; i < session.players.length; i++) {
    if (calcVP(i) >= session.vpTarget) { session.winner = i; return; }
  }
  session.winner = null;
}

function getAvailableFactions() {
  if (!ti4Data) return [];
  return (ti4Data.factions || []).filter(function(f) {
    if (!f.expansion || f.expansion === 'base') return true;
    return setup.enabledExpansions[f.expansion];
  });
}
function getAvailableObjectives(stage) {
  if (!objData) return [];
  return objData[stage === 1 ? 'stage1' : 'stage2'] || [];
}
function getAvailableSecrets() {
  return (objData && objData.secrets) ? objData.secrets : [];
}
function getAvailableAgendas() {
  if (!ti4Data) return [];
  return (ti4Data.agendas || []).filter(function(a) {
    if (!a.expansion || a.expansion === 'base') return true;
    return session && session.enabledExpansions[a.expansion];
  });
}

// =========================================================================
// Setup
// =========================================================================

function syncSetupPlayers() {
  const n = setup.playerCount;
  while (setup.players.length < n) {
    const idx = setup.players.length;
    setup.players.push({ name: '', color: PLAYER_COLORS[idx % PLAYER_COLORS.length].hex });
  }
  if (setup.players.length > n) setup.players.length = n;
}

function assignSetupColor(pIdx, colorHex) {
  setup.players[pIdx].color = colorHex;
  render();
}

function renderSetup() {
  const wrap = el('div', { className: 'ti-dash-setup' });
  const hexBg = el('div', { className: 'ti-dash-setup__hex' });
  hexBg.style.backgroundImage = MG.HEX_BG;
  wrap.appendChild(hexBg);
  const inner = el('div', { className: 'ti-dash-setup__inner' });
  wrap.appendChild(inner);
  inner.appendChild(el('div', { className: 'ti-dash-setup__eyebrow', textContent: 'TI4 DASHBOARD' }));
  const stepTitles = ['Session settings', 'Players', 'Faction draft'];
  inner.appendChild(el('h1', { className: 'ti-dash-setup__heading', textContent: stepTitles[setup.step - 1] }));
  const subs = ['Configure this session.', 'Name your players.', 'Assign factions (optional).'];
  inner.appendChild(el('p', { className: 'ti-dash-setup__sub', textContent: subs[setup.step - 1] }));
  const steps = el('div', { className: 'ti-dash-setup__steps' });
  for (let s = 1; s <= 3; s++) {
    const cls = ['ti-dash-setup__step',
      s < setup.step ? 'ti-dash-setup__step--done' : '',
      s === setup.step ? 'ti-dash-setup__step--active' : ''
    ].filter(Boolean).join(' ');
    steps.appendChild(el('div', { className: cls }));
  }
  inner.appendChild(steps);
  if (setup.step === 1) inner.appendChild(buildSetupStep1());
  if (setup.step === 2) inner.appendChild(buildSetupStep2());
  if (setup.step === 3) inner.appendChild(buildSetupStep3());
  dashRoot.appendChild(wrap);
}

function buildSetupStep1() {
  const frag = document.createDocumentFragment();
  const pcCard = el('div', { className: 'ti-dash-setup__card' });
  pcCard.appendChild(el('div', { className: 'ti-dash-setup__card-label', textContent: 'Number of players' }));
  const pcBtns = el('div', { className: 'ti-dash-setup__btns' });
  [3, 4, 5, 6].forEach(function(n) {
    const b = el('button', { className: 'td-tog' + (setup.playerCount === n ? ' td-tog--active' : ''), textContent: String(n) });
    b.addEventListener('click', function() { setup.playerCount = n; syncSetupPlayers(); render(); });
    pcBtns.appendChild(b);
  });
  pcCard.appendChild(pcBtns);
  frag.appendChild(pcCard);

  const vpCard = el('div', { className: 'ti-dash-setup__card' });
  vpCard.appendChild(el('div', { className: 'ti-dash-setup__card-label', textContent: 'Victory point target' }));
  const vpBtns = el('div', { className: 'ti-dash-setup__btns' });
  VP_TARGETS.forEach(function(v) {
    const b = el('button', { className: 'td-tog' + (setup.vpTarget === v ? ' td-tog--active' : ''), textContent: String(v) });
    b.addEventListener('click', function() { setup.vpTarget = v; render(); });
    vpBtns.appendChild(b);
  });
  vpCard.appendChild(vpBtns);
  frag.appendChild(vpCard);

  if (ti4Data && ti4Data.expansions && ti4Data.expansions.length) {
    const expCard = el('div', { className: 'ti-dash-setup__card' });
    expCard.appendChild(el('div', { className: 'ti-dash-setup__card-label', textContent: 'Expansions' }));
    const expBtns = el('div', { className: 'ti-dash-setup__btns' });
    ti4Data.expansions.forEach(function(exp) {
      if (exp.key === 'base') return;
      const active = setup.enabledExpansions[exp.key];
      const row = el('label', { className: 'td-toggle' });
      const track = el('span', { className: 'td-toggle__track' + (active ? ' td-toggle__track--on' : '') });
      track.appendChild(el('span', { className: 'td-toggle__thumb' }));
      row.appendChild(track);
      row.appendChild(el('span', { className: 'td-toggle__label', textContent: exp.label }));
      row.appendChild(el('span', { className: 'td-toggle__state', textContent: active ? 'ON' : 'OFF' }));
      row.addEventListener('click', function() { setup.enabledExpansions[exp.key] = !setup.enabledExpansions[exp.key]; render(); });
      expBtns.appendChild(row);
    });
    expCard.appendChild(expBtns);
    frag.appendChild(expCard);
  }

  const nav = el('div', { className: 'ti-dash-setup__nav' });
  nav.appendChild(el('a', { href: url('/tools/ti/'), className: 'ti-dash-setup__back', textContent: '← Exit' }));
  const nextBtn = el('button', { className: 'ti-dash-setup__next', textContent: 'Next →' });
  nextBtn.addEventListener('click', function() { setup.step = 2; syncSetupPlayers(); render(); });
  nav.appendChild(nextBtn);
  frag.appendChild(nav);
  return frag;
}

function buildSetupStep2() {
  const frag = document.createDocumentFragment();
  syncSetupPlayers();
  const card = el('div', { className: 'ti-dash-setup__card' });
  card.appendChild(el('div', { className: 'ti-dash-setup__card-label', textContent: 'Player names & colours' }));
  const rows = el('div', { className: 'ti-dash-setup__player-rows' });
  for (let i = 0; i < setup.playerCount; i++) {
    const row = el('div', { className: 'ti-dash-setup__player-row' });
    row.appendChild(el('span', { className: 'ti-dash-setup__player-num', textContent: String(i + 1) }));
    const input = el('input', { className: 'ti-dash-setup__player-input', type: 'text', placeholder: 'Player ' + (i + 1), value: setup.players[i].name });
    const idx = i;
    input.addEventListener('input', function() { setup.players[idx].name = input.value; });
    row.appendChild(input);
    const colorBtns = el('div', { className: 'ti-dash-setup__color-btns' });
    PLAYER_COLORS.forEach(function(c) {
      const sw = el('button', { className: 'ti-dash-setup__color-swatch' + (setup.players[i].color === c.hex ? ' ti-dash-setup__color-swatch--active' : ''), title: c.name });
      sw.style.background = c.hex;
      const ci = i, ch = c.hex;
      sw.addEventListener('click', function() { assignSetupColor(ci, ch); });
      colorBtns.appendChild(sw);
    });
    row.appendChild(colorBtns);
    rows.appendChild(row);
  }
  card.appendChild(rows);
  frag.appendChild(card);
  const nav = el('div', { className: 'ti-dash-setup__nav' });
  const backBtn = el('button', { className: 'ti-dash-setup__back', textContent: '← Back' });
  backBtn.addEventListener('click', function() { setup.step = 1; render(); });
  nav.appendChild(backBtn);
  const nextBtn = el('button', { className: 'ti-dash-setup__next', textContent: 'Next →' });
  nextBtn.addEventListener('click', function() { setup.step = 3; render(); });
  nav.appendChild(nextBtn);
  frag.appendChild(nav);
  return frag;
}

function buildSetupStep3() {
  const frag = document.createDocumentFragment();
  const factions = getAvailableFactions();
  const assignCard = el('div', { className: 'ti-dash-setup__card' });
  assignCard.appendChild(el('div', { className: 'ti-dash-setup__card-label', textContent: 'Faction assignments' }));
  for (let i = 0; i < setup.playerCount; i++) {
    const row = el('div', { className: 'td-draft__assign-row' });
    const sw = el('div', { className: 'td-draft__assign-swatch' });
    sw.style.background = setup.players[i].color;
    row.appendChild(sw);
    row.appendChild(el('span', { className: 'td-draft__assign-name', textContent: setupPlayerName(i) }));
    const assigned = setup.factionAssignments[i];
    if (assigned) {
      row.appendChild(el('span', { className: 'td-draft__assign-faction', textContent: assigned }));
      const clr = el('button', { className: 'td-draft__assign-clear', textContent: '×' });
      const pi = i;
      clr.addEventListener('click', function() { delete setup.factionAssignments[pi]; render(); });
      row.appendChild(clr);
    } else {
      row.appendChild(el('span', { className: 'td-draft__assign-faction', textContent: '(unassigned)' }));
      const sel = el('select', { className: 'td-secrets__select' });
      sel.appendChild(el('option', { value: '', textContent: 'Pick faction…' }));
      const assignedVals = Object.values(setup.factionAssignments);
      factions.forEach(function(f) {
        if (!assignedVals.includes(f.name)) sel.appendChild(el('option', { value: f.name, textContent: f.name }));
      });
      const pi = i;
      sel.addEventListener('change', function() { if (sel.value) { setup.factionAssignments[pi] = sel.value; render(); } });
      row.appendChild(sel);
    }
    assignCard.appendChild(row);
  }
  frag.appendChild(assignCard);
  const nav = el('div', { className: 'ti-dash-setup__nav' });
  const backBtn = el('button', { className: 'ti-dash-setup__back', textContent: '← Back' });
  backBtn.addEventListener('click', function() { setup.step = 2; render(); });
  nav.appendChild(backBtn);
  const launchBtn = el('button', { className: 'ti-dash-setup__next', textContent: 'Launch →' });
  launchBtn.addEventListener('click', launchDashboard);
  nav.appendChild(launchBtn);
  frag.appendChild(nav);
  return frag;
}

function launchDashboard() {
  const players = setup.players.slice(0, setup.playerCount).map(function(p, i) {
    return { name: p.name || ('Player ' + (i + 1)), color: p.color, faction: setup.factionAssignments[i] || null };
  });
  session = {
    players: players,
    vpTarget: setup.vpTarget,
    enabledExpansions: Object.assign({}, setup.enabledExpansions),
    round: 1, phaseIndex: 0,
    activePlayerIndex: 0, speakerIndex: 0,
    turnOrder: players.map(function(_, i) { return i; }),
    strategyCards: {},
    revealedStage1: [], revealedStage2: [],
    scoredObjectives: {},
    secretObjectives: {},
    bonusVP: {},
    winner: null,
    _activeTab: 'objectives', _objSubTab: 'public',
    _agenda: null, _agendaVotes: { for: 0, against: 0 },
    _mobileTab: 'score', _assignCard: null
  };
  render();
}

// =========================================================================
// Dashboard
// =========================================================================

function render() {
  if (!dashRoot) return;
  dashRoot.innerHTML = '';
  if (!session) renderSetup(); else renderDashboard();
}

function renderDashboard() {
  checkWinner();
  const dash = el('div', { className: 'ti-dash' });
  const hexBg = el('div', { className: 'ti-dash__hex' });
  hexBg.style.backgroundImage = MG.HEX_BG;
  dash.appendChild(hexBg);
  dash.appendChild(renderDashHeader());
  const body = el('div', { className: 'ti-dash__body' });
  body.appendChild(renderSidebar());
  const main = el('div', { className: 'ti-dash__main' });
  main.appendChild(renderMainTabs());
  main.appendChild(renderMainPanel());
  body.appendChild(main);
  body.appendChild(renderMobilePanel());
  dash.appendChild(body);
  dash.appendChild(renderMobileTabBar());
  if (session._assignCard !== null) dash.appendChild(renderAssignModal(session._assignCard));
  dashRoot.appendChild(dash);
}

function renderDashHeader() {
  const hdr = el('div', { className: 'ti-dash__header' });
  hdr.appendChild(el('span', { className: 'ti-dash__logo', textContent: 'TI4 Dashboard' }));
  hdr.appendChild(el('span', { className: 'ti-dash__round-badge', textContent: 'Round ' + session.round }));
  hdr.appendChild(el('span', { className: 'ti-dash__phase-badge', textContent: PHASES[session.phaseIndex] + ' Phase' }));
  hdr.appendChild(el('div', { className: 'ti-dash__header-spacer' }));
  hdr.appendChild(el('a', { href: url('/tools/ti/'), className: 'ti-dash__close', textContent: '✕ Exit' }));
  return hdr;
}

function renderSidebar() {
  const sb = el('div', { className: 'ti-dash__sidebar' });
  sb.appendChild(renderScoreboard());
  sb.appendChild(renderRoundPhase());
  sb.appendChild(renderTurnOrder());
  sb.appendChild(renderStrategyCards());
  return sb;
}

function renderScoreboard() {
  const wrap = el('div');
  wrap.appendChild(el('div', { className: 'td-score__section-label', textContent: 'Scoreboard' }));
  const sorted = session.players.map(function(p, i) { return { p, i, vp: calcVP(i) }; })
    .sort(function(a, b) { return b.vp - a.vp; });
  sorted.forEach(function({ p, i, vp }) {
    const row = el('div', { className: 'td-score__row' + (session.winner === i ? ' td-score__row--winner' : '') });
    const sw = el('div', { className: 'td-score__swatch' }); sw.style.background = p.color; row.appendChild(sw);
    const info = el('div', { className: 'td-score__info' });
    info.appendChild(el('div', { className: 'td-score__name', textContent: p.name }));
    if (p.faction) info.appendChild(el('div', { className: 'td-score__faction', textContent: p.faction }));
    row.appendChild(info);
    row.appendChild(el('span', { className: 'td-score__vp', textContent: String(vp) }));
    row.appendChild(el('span', { className: 'td-score__target', textContent: '/' + session.vpTarget }));
    wrap.appendChild(row);
    const bar = el('div', { className: 'td-score__bar' });
    const fill = el('div', { className: 'td-score__bar-fill' });
    fill.style.width = Math.min(100, Math.round(vp / session.vpTarget * 100)) + '%';
    fill.style.background = p.color;
    bar.appendChild(fill); wrap.appendChild(bar);
  });
  return wrap;
}

function renderRoundPhase() {
  const w = el('div', { className: 'td-round__widget' });
  w.appendChild(el('div', { className: 'td-round__label', textContent: 'Round & Phase' }));
  w.appendChild(el('div', { className: 'td-round__num', textContent: String(session.round) }));
  const pips = el('div', { className: 'td-phase__row' });
  PHASES.forEach(function(_, idx) {
    pips.appendChild(el('div', { className: 'td-phase__pip' + (idx <= session.phaseIndex ? ' td-phase__pip--active' : '') }));
  });
  w.appendChild(pips);
  w.appendChild(el('div', { className: 'td-phase__name', textContent: PHASES[session.phaseIndex] + ' Phase' }));
  const btns = el('div', { className: 'td-round__btns' });
  const prevPhase = el('button', { className: 'td-round__btn', textContent: '← Phase' });
  prevPhase.disabled = session.round === 1 && session.phaseIndex === 0;
  prevPhase.addEventListener('click', function() {
    if (session.phaseIndex > 0) session.phaseIndex--;
    else { session.round = Math.max(1, session.round - 1); session.phaseIndex = PHASES.length - 1; }
    render();
  });
  btns.appendChild(prevPhase);
  const nextPhase = el('button', { className: 'td-round__btn td-round__btn--primary', textContent: 'Phase →' });
  nextPhase.addEventListener('click', function() {
    if (session.phaseIndex < PHASES.length - 1) session.phaseIndex++;
    else { session.round++; session.phaseIndex = 0; }
    render();
  });
  btns.appendChild(nextPhase);
  w.appendChild(btns);
  return w;
}

function renderTurnOrder() {
  const wrap = el('div');
  wrap.appendChild(el('div', { className: 'td-score__section-label', textContent: 'Turn order' }));
  const list = el('div', { className: 'td-turn__list' });
  session.turnOrder.forEach(function(pi, pos) {
    const p = session.players[pi];
    const isActive = pi === session.activePlayerIndex;
    const item = el('div', { className: 'td-turn__item' + (isActive ? ' td-turn__item--active' : '') });
    item.appendChild(el('span', { className: 'td-turn__pos', textContent: String(pos + 1) }));
    const sw = el('div', { className: 'td-turn__swatch' }); sw.style.background = p.color; item.appendChild(sw);
    item.appendChild(el('span', { className: 'td-turn__name', textContent: p.name }));
    if (isActive) item.appendChild(el('span', { className: 'td-turn__hint', textContent: 'Active' }));
    item.addEventListener('click', function() { session.activePlayerIndex = pi; render(); });
    list.appendChild(item);
  });
  wrap.appendChild(list);
  return wrap;
}

function renderStrategyCards() {
  const wrap = el('div');
  wrap.appendChild(el('div', { className: 'td-score__section-label', textContent: 'Strategy cards' }));
  const grid = el('div', { className: 'td-strat__grid' });
  STRATEGY_CARDS.forEach(function(card) {
    const ownerEntry = Object.entries(session.strategyCards).find(function([, n]) { return n === card.name; });
    const owner = ownerEntry ? session.players[parseInt(ownerEntry[0])] : null;
    const div = el('div', { className: 'td-strat__card' + (owner ? ' td-strat__card--assigned' : '') });
    div.appendChild(el('div', { className: 'td-strat__num', textContent: String(card.num) }));
    div.appendChild(el('div', { className: 'td-strat__name', textContent: card.name }));
    div.appendChild(el('div', { className: 'td-strat__owner', textContent: owner ? owner.name : '—' }));
    div.addEventListener('click', function() {
      if (owner) {
        const pi = Object.entries(session.strategyCards).find(function([, n]) { return n === card.name; });
        if (pi) delete session.strategyCards[pi[0]];
        render();
      } else { session._assignCard = card.name; render(); }
    });
    grid.appendChild(div);
  });
  wrap.appendChild(grid);
  return wrap;
}

function renderAssignModal(cardName) {
  const overlay = el('div', { className: 'td-assign' });
  const box = el('div', { className: 'td-assign__box' });
  box.appendChild(el('div', { className: 'td-assign__title', textContent: 'Assign ' + cardName }));
  const list = el('div', { className: 'td-assign__list' });
  session.players.forEach(function(p, i) {
    const btn = el('button', { className: 'td-assign__item' });
    const sw = el('div', { className: 'td-assign__swatch' }); sw.style.background = p.color; btn.appendChild(sw);
    btn.appendChild(document.createTextNode(p.name));
    btn.addEventListener('click', function() {
      Object.keys(session.strategyCards).forEach(function(k) { if (session.strategyCards[k] === cardName) delete session.strategyCards[k]; });
      session.strategyCards[i] = cardName;
      session._assignCard = null;
      render();
    });
    list.appendChild(btn);
  });
  box.appendChild(list);
  const cancel = el('button', { className: 'td-assign__cancel', textContent: 'Cancel' });
  cancel.addEventListener('click', function() { session._assignCard = null; render(); });
  box.appendChild(cancel);
  overlay.appendChild(box);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) { session._assignCard = null; render(); } });
  return overlay;
}

function renderMainTabs() {
  const tabs = el('div', { className: 'ti-dash__tabs' });
  ['objectives', 'agenda'].forEach(function(id) {
    const t = el('button', {
      className: 'ti-dash__tab' + (session._activeTab === id ? ' ti-dash__tab--active' : ''),
      textContent: id.charAt(0).toUpperCase() + id.slice(1)
    });
    t.addEventListener('click', function() { session._activeTab = id; render(); });
    tabs.appendChild(t);
  });
  return tabs;
}

function renderMainPanel() {
  const panel = el('div', { className: 'ti-dash__panel' });
  if (session.winner !== null) panel.appendChild(renderWinnerBanner());
  if (session._activeTab === 'objectives') panel.appendChild(renderObjectivesTab());
  if (session._activeTab === 'agenda') panel.appendChild(renderAgendaTab());
  return panel;
}

function renderWinnerBanner() {
  const p = session.players[session.winner];
  const div = el('div', { className: 'td-winner' });
  div.appendChild(el('div', { className: 'td-winner__label', textContent: 'WINNER' }));
  div.appendChild(el('div', { className: 'td-winner__name', textContent: p.name }));
  div.appendChild(el('div', { className: 'td-winner__sub', textContent: calcVP(session.winner) + ' VP' + (p.faction ? ' · ' + p.faction : '') }));
  return div;
}

function renderObjectivesTab() {
  const wrap = el('div');
  const subtabs = el('div', { className: 'td-obj-subtabs' });
  ['public', 'secret', 'bonus'].forEach(function(id) {
    const t = el('button', {
      className: 'td-obj-subtab' + (session._objSubTab === id ? ' td-obj-subtab--active' : ''),
      textContent: id.charAt(0).toUpperCase() + id.slice(1)
    });
    t.addEventListener('click', function() { session._objSubTab = id; render(); });
    subtabs.appendChild(t);
  });
  wrap.appendChild(subtabs);
  if (session._objSubTab === 'public')  wrap.appendChild(renderPublicObjectives());
  if (session._objSubTab === 'secret')  wrap.appendChild(renderSecretObjectives());
  if (session._objSubTab === 'bonus')   wrap.appendChild(renderBonusVP());
  return wrap;
}

function renderPublicObjectives() {
  const wrap = el('div');
  wrap.appendChild(el('div', { className: 'td-obj-section-label', textContent: 'Stage I (1 VP)' }));
  session.revealedStage1.forEach(function(name) { wrap.appendChild(renderObjRow(name, 's1', 1)); });
  const avail1 = getAvailableObjectives(1).filter(function(o) { return !session.revealedStage1.includes(o.name); });
  if (avail1.length) {
    const sel = el('select', { className: 'td-secrets__select' });
    sel.appendChild(el('option', { value: '', textContent: 'Reveal Stage I objective…' }));
    avail1.forEach(function(o) { sel.appendChild(el('option', { value: o.name, textContent: o.name })); });
    sel.addEventListener('change', function() { if (sel.value) { session.revealedStage1.push(sel.value); render(); } });
    wrap.appendChild(sel);
  }
  wrap.appendChild(el('div', { className: 'td-obj-section-label', textContent: 'Stage II (2 VP)' }));
  session.revealedStage2.forEach(function(name) { wrap.appendChild(renderObjRow(name, 's2', 2)); });
  const avail2 = getAvailableObjectives(2).filter(function(o) { return !session.revealedStage2.includes(o.name); });
  if (avail2.length) {
    const sel = el('select', { className: 'td-secrets__select' });
    sel.appendChild(el('option', { value: '', textContent: 'Reveal Stage II objective…' }));
    avail2.forEach(function(o) { sel.appendChild(el('option', { value: o.name, textContent: o.name })); });
    sel.addEventListener('change', function() { if (sel.value) { session.revealedStage2.push(sel.value); render(); } });
    wrap.appendChild(sel);
  }
  return wrap;
}

function renderObjRow(name, stage, pts) {
  const key = stage + ':' + name;
  const scoredBy = session.scoredObjectives[key] || [];
  const row = el('div', { className: 'td-obj-row' + (scoredBy.length ? ' td-obj-row--scored' : '') });
  const info = el('div', { className: 'td-obj-info' });
  info.appendChild(el('div', { className: 'td-obj-name', textContent: name }));
  row.appendChild(info);
  row.appendChild(el('span', { className: 'td-obj-pts', textContent: pts + ' VP' }));
  const btns = el('div', { className: 'td-player-btns' });
  session.players.forEach(function(p, i) {
    const scored = scoredBy.includes(i);
    const b = el('button', { className: 'td-player-btn' + (scored ? ' td-player-btn--scored' : ''), title: p.name });
    b.style.background = p.color;
    b.addEventListener('click', function() {
      const arr = session.scoredObjectives[key] || [];
      session.scoredObjectives[key] = arr.includes(i) ? arr.filter(function(x) { return x !== i; }) : arr.concat([i]);
      render();
    });
    btns.appendChild(b);
  });
  row.appendChild(btns);
  return row;
}

function renderSecretObjectives() {
  const wrap = el('div');
  session.players.forEach(function(p, i) {
    const div = el('div', { className: 'td-secrets__player' });
    const hdr = el('div', { className: 'td-secrets__player-header' });
    const sw = el('div', { className: 'td-secrets__player-swatch' }); sw.style.background = p.color; hdr.appendChild(sw);
    hdr.appendChild(el('span', { className: 'td-secrets__player-name', textContent: p.name }));
    const secrets = session.secretObjectives[i] || [];
    hdr.appendChild(el('span', { className: 'td-secrets__count', textContent: secrets.filter(function(s){return s.scored;}).length + '/' + secrets.length + ' scored' }));
    div.appendChild(hdr);
    if (secrets.length) {
      const list = el('div', { className: 'td-secrets__list' });
      secrets.forEach(function(s, si) {
        const item = el('div', { className: 'td-secrets__item' });
        item.appendChild(el('span', { className: 'td-secrets__item-name', textContent: s.name }));
        if (s.scored) {
          item.appendChild(el('span', { className: 'td-secrets__item-scored', textContent: '✓ 1 VP' }));
        } else {
          const sb = el('button', { className: 'td-reveal-btn', textContent: 'Score' });
          const ii = i, sii = si;
          sb.addEventListener('click', function() { session.secretObjectives[ii][sii].scored = true; render(); });
          item.appendChild(sb);
        }
        const rm = el('button', { className: 'td-draft__assign-clear', textContent: '×' });
        const ii = i, sii = si;
        rm.addEventListener('click', function() { session.secretObjectives[ii].splice(sii, 1); render(); });
        item.appendChild(rm);
        list.appendChild(item);
      });
      div.appendChild(list);
    }
    const avail = getAvailableSecrets().filter(function(s) {
      return !(session.secretObjectives[i] || []).find(function(x) { return x.name === s.name; });
    });
    if (avail.length) {
      const sel = el('select', { className: 'td-secrets__select' });
      sel.appendChild(el('option', { value: '', textContent: 'Hold secret objective…' }));
      avail.forEach(function(s) { sel.appendChild(el('option', { value: s.name, textContent: s.name })); });
      const ii = i;
      sel.addEventListener('change', function() {
        if (sel.value) {
          if (!session.secretObjectives[ii]) session.secretObjectives[ii] = [];
          session.secretObjectives[ii].push({ name: sel.value, scored: false });
          render();
        }
      });
      div.appendChild(sel);
    }
    wrap.appendChild(div);
  });
  return wrap;
}

function renderBonusVP() {
  const wrap = el('div');
  wrap.appendChild(el('div', { className: 'td-obj-section-label', textContent: 'Bonus VP' }));
  const BONUSES = [
    { key: 'custodians', label: 'Cust.' },
    { key: 'imperial', label: 'Imperial' },
    { key: 'support', label: 'Support' }
  ];
  session.players.forEach(function(p, i) {
    const bonus = session.bonusVP[i] || {};
    const div = el('div', { className: 'td-bonus__player' });
    const hdr = el('div', { className: 'td-bonus__player-header' });
    const sw = el('div', { className: 'td-bonus__player-swatch' }); sw.style.background = p.color; hdr.appendChild(sw);
    hdr.appendChild(el('span', { className: 'td-bonus__player-name', textContent: p.name }));
    div.appendChild(hdr);
    const counters = el('div', { className: 'td-bonus__counters' });
    BONUSES.forEach(function(b) {
      const val = bonus[b.key] || 0;
      const ctr = el('div', { className: 'td-bonus__counter' });
      ctr.appendChild(el('span', { className: 'td-bonus__counter-label', textContent: b.label }));
      const dec = el('button', { className: 'td-bonus__btn', textContent: '−' });
      dec.disabled = val === 0;
      const ii = i, bk = b.key;
      dec.addEventListener('click', function() {
        if (!session.bonusVP[ii]) session.bonusVP[ii] = {};
        session.bonusVP[ii][bk] = Math.max(0, (session.bonusVP[ii][bk] || 0) - 1);
        render();
      });
      ctr.appendChild(dec);
      ctr.appendChild(el('span', { className: 'td-bonus__val', textContent: String(val) }));
      const inc = el('button', { className: 'td-bonus__btn', textContent: '+' });
      inc.addEventListener('click', function() {
        if (!session.bonusVP[ii]) session.bonusVP[ii] = {};
        session.bonusVP[ii][bk] = (session.bonusVP[ii][bk] || 0) + 1;
        render();
      });
      ctr.appendChild(inc);
      counters.appendChild(ctr);
    });
    div.appendChild(counters);
    wrap.appendChild(div);
  });
  return wrap;
}

function renderAgendaTab() {
  const wrap = el('div');
  const hdr = el('div', { className: 'td-agenda-header' });
  hdr.appendChild(el('div', { className: 'td-agenda-title', textContent: 'Agenda Phase' }));
  const drawBtn = el('button', { className: 'td-dark-btn', textContent: 'Draw agenda' });
  drawBtn.addEventListener('click', function() {
    const agendas = getAvailableAgendas();
    if (!agendas.length) return;
    session._agenda = agendas[Math.floor(Math.random() * agendas.length)];
    session._agendaVotes = { for: 0, against: 0 };
    render();
  });
  hdr.appendChild(drawBtn);
  wrap.appendChild(hdr);
  if (!session._agenda) {
    wrap.appendChild(el('div', { className: 'td-agenda-empty', textContent: 'Draw an agenda to begin voting.' }));
    return wrap;
  }
  const card = el('div', { className: 'td-agenda-card' });
  card.appendChild(el('div', { className: 'td-agenda-type', textContent: session._agenda.type || 'Agenda' }));
  card.appendChild(el('div', { className: 'td-agenda-name', textContent: session._agenda.name }));
  if (session._agenda.text) card.appendChild(el('div', { className: 'td-agenda-text', textContent: session._agenda.text }));
  wrap.appendChild(card);
  const total = session._agendaVotes.for + session._agendaVotes.against;
  function tallyRow(side, cls) {
    const row = el('div', { className: 'td-tally__row' });
    row.appendChild(el('span', { className: 'td-tally__label', textContent: side === 'for' ? 'For' : 'Against' }));
    const btns = el('div', { className: 'td-tally__btns' });
    const dec = el('button', { className: 'td-tally__btn', textContent: '−' });
    dec.addEventListener('click', function() { session._agendaVotes[side] = Math.max(0, session._agendaVotes[side] - 1); render(); });
    btns.appendChild(dec);
    btns.appendChild(el('span', { className: 'td-tally__count', textContent: String(session._agendaVotes[side]) }));
    const inc = el('button', { className: 'td-tally__btn', textContent: '+' });
    inc.addEventListener('click', function() { session._agendaVotes[side]++; render(); });
    btns.appendChild(inc);
    row.appendChild(btns);
    const bar = el('div', { className: 'td-tally__bar' });
    const fill = el('div', { className: cls });
    fill.style.width = total ? Math.round(session._agendaVotes[side] / total * 100) + '%' : '0%';
    bar.appendChild(fill); row.appendChild(bar);
    return row;
  }
  wrap.appendChild(tallyRow('for', 'td-tally__fill--for'));
  wrap.appendChild(tallyRow('against', 'td-tally__fill--against'));
  if (total > 0) {
    const f = session._agendaVotes.for, a = session._agendaVotes.against;
    const outcome = f > a ? 'For wins (' + f + ' vs ' + a + ')'
      : a > f ? 'Against wins (' + a + ' vs ' + f + ')'
      : 'Tied — speaker decides';
    wrap.appendChild(el('div', { className: 'td-agenda-outcome', textContent: outcome }));
  }
  const clearBtn = el('button', { className: 'td-outline-btn td-agenda-discard', textContent: 'Discard' });
  clearBtn.addEventListener('click', function() { session._agenda = null; session._agendaVotes = { for: 0, against: 0 }; render(); });
  wrap.appendChild(clearBtn);
  return wrap;
}

function renderMobilePanel() {
  const panel = el('div', { className: 'ti-dash__mobile-panel' });
  const tab = session._mobileTab;
  if (tab === 'score') { panel.appendChild(renderScoreboard()); }
  else if (tab === 'round') { panel.appendChild(renderRoundPhase()); panel.appendChild(renderTurnOrder()); panel.appendChild(renderStrategyCards()); }
  else if (tab === 'objectives') { if (session.winner !== null) panel.appendChild(renderWinnerBanner()); panel.appendChild(renderObjectivesTab()); }
  else if (tab === 'agenda') { panel.appendChild(renderAgendaTab()); }
  return panel;
}

function renderMobileTabBar() {
  const bar = el('div', { className: 'ti-dash__mobile-tabs' });
  [['score','🏆','Score'],['objectives','📋','Objectives'],['agenda','🗳','Agenda'],['round','🎯','Round']]
    .forEach(function([id, icon, label]) {
      const btn = el('button', { className: 'ti-dash__mobile-tab' + (session._mobileTab === id ? ' ti-dash__mobile-tab--active' : '') });
      btn.appendChild(el('span', { className: 'ti-dash__mobile-tab-icon', textContent: icon }));
      btn.appendChild(document.createTextNode(label));
      btn.addEventListener('click', function() { session._mobileTab = id; render(); });
      bar.appendChild(btn);
    });
  return bar;
}

// =========================================================================
// Entry point
// =========================================================================

function open() {
  dashRoot = document.getElementById('dashboard-root');
  if (!dashRoot) return;
  setup.enabledExpansions = { base: true };
  Promise.all([
    fetch(url('/data/ti4.json')).then(function(r) { return r.json(); }),
    fetch(url('/data/ti4-objectives.json')).then(function(r) { return r.json(); })
  ]).then(function(results) {
    ti4Data = results[0];
    objData = results[1];
    if (ti4Data.expansions) {
      ti4Data.expansions.forEach(function(e) { setup.enabledExpansions[e.key] = e.default !== false; });
    }
    syncSetupPlayers();
    render();
  });
}

window.MG_Dashboard = { open: open };
})();
