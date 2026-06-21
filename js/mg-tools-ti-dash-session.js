/* =========================================================================
   TI4 Dashboard — Session shell (sidebar, header, strategy cards)
   ========================================================================= */
(function () {
'use strict';
const { el, url } = MG;
const S = window.TiDash;

function launchDashboard() {
  const players = S.setup.players.slice(0, S.setup.playerCount).map(function(p, i) {
    return { name: p.name || ('Player ' + (i + 1)), color: p.color, faction: S.setup.factionAssignments[i] || null };
  });
  S.session = {
    players: players,
    vpTarget: S.setup.vpTarget,
    enabledExpansions: Object.assign({}, S.setup.enabledExpansions),
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
  window.TiDash_render();
}

function renderDashboard() {
  S.checkWinner();
  const dash = el('div', { className: 'ti-dash' });
  const hexBg = el('div', { className: 'ti-dash__hex' });
  hexBg.style.backgroundImage = MG.HEX_BG;
  dash.appendChild(hexBg);
  dash.appendChild(renderHeader());
  const body = el('div', { className: 'ti-dash__body' });
  body.appendChild(renderSidebar());
  const main = el('div', { className: 'ti-dash__main' });
  main.appendChild(window.TiDash_renderMainTabs());
  main.appendChild(window.TiDash_renderMainPanel());
  body.appendChild(main);
  body.appendChild(renderMobilePanel());
  dash.appendChild(body);
  dash.appendChild(renderMobileTabBar());
  if (S.session._assignCard !== null) dash.appendChild(renderAssignModal(S.session._assignCard));
  S.dashRoot.appendChild(dash);
}

function renderHeader() {
  const hdr = el('div', { className: 'ti-dash__header' });
  hdr.appendChild(el('span', { className: 'ti-dash__logo', textContent: 'TI4 Dashboard' }));
  hdr.appendChild(el('span', { className: 'ti-dash__round-badge', textContent: 'Round ' + S.session.round }));
  hdr.appendChild(el('span', { className: 'ti-dash__phase-badge', textContent: S.PHASES[S.session.phaseIndex] + ' Phase' }));
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
  const sorted = S.session.players.map(function(p, i) { return { p, i, vp: S.calcVP(i) }; })
    .sort(function(a, b) { return b.vp - a.vp; });
  sorted.forEach(function({ p, i, vp }) {
    const row = el('div', { className: 'td-score__row' + (S.session.winner === i ? ' td-score__row--winner' : '') });
    const sw = el('div', { className: 'td-score__swatch' }); sw.style.background = p.color; row.appendChild(sw);
    const info = el('div', { className: 'td-score__info' });
    info.appendChild(el('div', { className: 'td-score__name', textContent: p.name }));
    if (p.faction) info.appendChild(el('div', { className: 'td-score__faction', textContent: p.faction }));
    row.appendChild(info);
    row.appendChild(el('span', { className: 'td-score__vp', textContent: String(vp) }));
    row.appendChild(el('span', { className: 'td-score__target', textContent: '/' + S.session.vpTarget }));
    wrap.appendChild(row);
    const bar = el('div', { className: 'td-score__bar' });
    const fill = el('div', { className: 'td-score__bar-fill' });
    fill.style.width = Math.min(100, Math.round(vp / S.session.vpTarget * 100)) + '%';
    fill.style.background = p.color;
    bar.appendChild(fill); wrap.appendChild(bar);
  });
  return wrap;
}

function renderRoundPhase() {
  const w = el('div', { className: 'td-round__widget' });
  w.appendChild(el('div', { className: 'td-round__label', textContent: 'Round & Phase' }));
  w.appendChild(el('div', { className: 'td-round__num', textContent: String(S.session.round) }));
  const pips = el('div', { className: 'td-phase__row' });
  S.PHASES.forEach(function(_, idx) {
    pips.appendChild(el('div', { className: 'td-phase__pip' + (idx <= S.session.phaseIndex ? ' td-phase__pip--active' : '') }));
  });
  w.appendChild(pips);
  w.appendChild(el('div', { className: 'td-phase__name', textContent: S.PHASES[S.session.phaseIndex] + ' Phase' }));
  const btns = el('div', { className: 'td-round__btns' });
  const prevPhase = el('button', { className: 'td-round__btn', textContent: '← Phase' });
  prevPhase.disabled = S.session.round === 1 && S.session.phaseIndex === 0;
  prevPhase.addEventListener('click', function() {
    if (S.session.phaseIndex > 0) S.session.phaseIndex--;
    else { S.session.round = Math.max(1, S.session.round - 1); S.session.phaseIndex = S.PHASES.length - 1; }
    window.TiDash_render();
  });
  btns.appendChild(prevPhase);
  const nextPhase = el('button', { className: 'td-round__btn td-round__btn--primary', textContent: 'Phase →' });
  nextPhase.addEventListener('click', function() {
    if (S.session.phaseIndex < S.PHASES.length - 1) S.session.phaseIndex++;
    else { S.session.round++; S.session.phaseIndex = 0; }
    window.TiDash_render();
  });
  btns.appendChild(nextPhase);
  w.appendChild(btns);
  return w;
}

function renderTurnOrder() {
  const wrap = el('div');
  wrap.appendChild(el('div', { className: 'td-score__section-label', textContent: 'Turn order' }));
  const list = el('div', { className: 'td-turn__list' });
  S.session.turnOrder.forEach(function(pi, pos) {
    const p = S.session.players[pi];
    const isActive = pi === S.session.activePlayerIndex;
    const item = el('div', { className: 'td-turn__item' + (isActive ? ' td-turn__item--active' : '') });
    item.appendChild(el('span', { className: 'td-turn__pos', textContent: String(pos + 1) }));
    const sw = el('div', { className: 'td-turn__swatch' }); sw.style.background = p.color; item.appendChild(sw);
    item.appendChild(el('span', { className: 'td-turn__name', textContent: p.name }));
    if (isActive) item.appendChild(el('span', { className: 'td-turn__hint', textContent: 'Active' }));
    item.addEventListener('click', function() { S.session.activePlayerIndex = pi; window.TiDash_render(); });
    list.appendChild(item);
  });
  wrap.appendChild(list);
  return wrap;
}

function renderStrategyCards() {
  const wrap = el('div');
  wrap.appendChild(el('div', { className: 'td-score__section-label', textContent: 'Strategy cards' }));
  const grid = el('div', { className: 'td-strat__grid' });
  S.STRATEGY_CARDS.forEach(function(card) {
    const ownerEntry = Object.entries(S.session.strategyCards).find(function([, n]) { return n === card.name; });
    const owner = ownerEntry ? S.session.players[parseInt(ownerEntry[0])] : null;
    const div = el('div', { className: 'td-strat__card' + (owner ? ' td-strat__card--assigned' : '') });
    div.appendChild(el('div', { className: 'td-strat__num', textContent: String(card.num) }));
    div.appendChild(el('div', { className: 'td-strat__name', textContent: card.name }));
    div.appendChild(el('div', { className: 'td-strat__owner', textContent: owner ? owner.name : '—' }));
    div.addEventListener('click', function() {
      if (owner) {
        const pi = Object.entries(S.session.strategyCards).find(function([, n]) { return n === card.name; });
        if (pi) delete S.session.strategyCards[pi[0]];
        window.TiDash_render();
      } else { S.session._assignCard = card.name; window.TiDash_render(); }
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
  S.session.players.forEach(function(p, i) {
    const btn = el('button', { className: 'td-assign__item' });
    const sw = el('div', { className: 'td-assign__swatch' }); sw.style.background = p.color; btn.appendChild(sw);
    btn.appendChild(document.createTextNode(p.name));
    btn.addEventListener('click', function() {
      Object.keys(S.session.strategyCards).forEach(function(k) { if (S.session.strategyCards[k] === cardName) delete S.session.strategyCards[k]; });
      S.session.strategyCards[i] = cardName;
      S.session._assignCard = null;
      window.TiDash_render();
    });
    list.appendChild(btn);
  });
  box.appendChild(list);
  const cancel = el('button', { className: 'td-assign__cancel', textContent: 'Cancel' });
  cancel.addEventListener('click', function() { S.session._assignCard = null; window.TiDash_render(); });
  box.appendChild(cancel);
  overlay.appendChild(box);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) { S.session._assignCard = null; window.TiDash_render(); } });
  return overlay;
}

function renderMobilePanel() {
  const panel = el('div', { className: 'ti-dash__mobile-panel' });
  const tab = S.session._mobileTab;
  if (tab === 'score') { panel.appendChild(renderScoreboard()); }
  else if (tab === 'round') { panel.appendChild(renderRoundPhase()); panel.appendChild(renderTurnOrder()); panel.appendChild(renderStrategyCards()); }
  else if (tab === 'objectives') { if (S.session.winner !== null) panel.appendChild(window.TiDash_renderWinnerBanner()); panel.appendChild(window.TiDash_renderObjectivesTab()); }
  else if (tab === 'agenda') { panel.appendChild(window.TiDash_renderAgendaTab()); }
  return panel;
}

function renderMobileTabBar() {
  const bar = el('div', { className: 'ti-dash__mobile-tabs' });
  [['score','🏆','Score'],['objectives','📋','Objectives'],['agenda','🗳','Agenda'],['round','🎯','Round']]
    .forEach(function([id, icon, label]) {
      const btn = el('button', { className: 'ti-dash__mobile-tab' + (S.session._mobileTab === id ? ' ti-dash__mobile-tab--active' : '') });
      btn.appendChild(el('span', { className: 'ti-dash__mobile-tab-icon', textContent: icon }));
      btn.appendChild(document.createTextNode(label));
      btn.addEventListener('click', function() { S.session._mobileTab = id; window.TiDash_render(); });
      bar.appendChild(btn);
    });
  return bar;
}

window.TiDash_launch = launchDashboard;
window.TiDash_renderDashboard = renderDashboard;
window.TiDash_renderScoreboard = renderScoreboard;
})();
