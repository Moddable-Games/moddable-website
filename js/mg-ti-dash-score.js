/* TI4 Dashboard — Scoreboard + Round/Phase + Turn order */
window.MG_TIDash_Score = (() => {
  const State = window.MG_TIDash_State;
  const el = MG.el;
  let root = null;
  let subscribed = false;
  let sortMode = 'auto';

  function render(container) {
    root = container;
    root.innerHTML = '';
    const state = State.get();
    if (!state) return;

    const shell = el('div', { class: 'td-shell' });
    const hexBg = el('div', { class: 'td-shell__hex' });
    hexBg.style.backgroundImage = MG.HEX_BG;
    shell.appendChild(hexBg);

    shell.appendChild(renderHeader(state));
    shell.appendChild(renderPhaseFlow(state));
    shell.appendChild(renderBody(state));
    shell.appendChild(renderMobileNav(state));

    root.appendChild(shell);
    if (!subscribed) { State.subscribe(onStateChange); subscribed = true; }
  }

  function onStateChange(state) {
    if (!root || !state) return;
    const shell = root.querySelector('.td-shell');
    if (!shell) return;
    const header = shell.querySelector('.td-header');
    if (header) header.replaceWith(renderHeader(state));
    const flow = shell.querySelector('.td-flow');
    if (flow) flow.replaceWith(renderPhaseFlow(state));
    const body = shell.querySelector('.td-body');
    if (body) body.replaceWith(renderBody(state));
  }

  function renderHeader(state) {
    const header = el('div', { class: 'td-header' });
    const roundLabel = el('span', { class: 'td-header__round' }, 'Round ' + state.round);
    const phaseLabel = el('span', { class: 'td-header__phase' }, State.PHASE_LABELS[state.phase]);
    const speakerTag = el('span', { class: 'td-header__speaker' }, state.players[state.speakerIdx || 0].name);
    speakerTag.style.setProperty('--player-color', state.players[state.speakerIdx || 0].color);
    const info = el('div', { class: 'td-header__info' });
    info.appendChild(roundLabel);
    info.appendChild(el('span', { class: 'td-header__dot' }, '·'));
    info.appendChild(phaseLabel);
    info.appendChild(el('span', { class: 'td-header__dot' }, '·'));
    info.appendChild(speakerTag);
    header.appendChild(info);

    const controls = el('div', { class: 'td-header__controls' });

    if (state.phase === 'action') {
      const turnBtn = el('button', { class: 'td-header__btn td-header__btn--accent td-header__btn--large', onClick: nextTurn }, 'Next Turn');
      controls.appendChild(turnBtn);
    }

    if (state.phase === 'status') {
      const step = state.statusStep || 0;
      const STATUS_STEPS = [
        'Score objectives now',
        'Reveal next objective',
        'Draw action cards',
        'Redistribute command tokens',
        'Ready cards & return strategy cards'
      ];
      const label = step < STATUS_STEPS.length ? STATUS_STEPS[step] + ' →' : 'Finish Status →';
      const statusBtn = el('button', { class: 'td-header__btn td-header__btn--primary td-header__btn--large', onClick: advanceStatus }, label);
      controls.appendChild(statusBtn);
      controls.appendChild(el('span', { class: 'td-header__step-count' }, 'Step ' + (step + 1) + '/5'));
    }


    const mecatol = el('button', {
      class: 'td-header__mecatol' + (state.mecatolClaimed ? ' td-header__mecatol--active' : ''),
      onClick: toggleMecatol
    }, state.mecatolClaimed ? 'Mecatol ✓' : 'Mecatol Rex');
    controls.appendChild(mecatol);

    const overrideBtn = el('button', { class: 'td-header__btn td-header__override', onClick: showOverridePanel }, '⚙');
    controls.appendChild(overrideBtn);

    const resetBtn = el('button', { class: 'td-header__btn td-header__btn--danger', onClick: confirmReset }, 'End');
    controls.appendChild(resetBtn);
    header.appendChild(controls);

    return header;
  }

  const PHASE_STEPS = {
    strategy: ['Speaker picks first', 'Clockwise until all assigned', 'Auto-advances to Action'],
    action: ['Turns in initiative order', 'Play strategy card (required to pass)', 'Pass when done', 'Auto-advances to Status'],
    status: ['Score objectives (1 public + 1 secret max)', 'Reveal next objective', 'Draw action cards', 'Redistribute command tokens', 'Ready cards & return strategy cards'],
    agenda: ['Draw agenda', 'Vote (influence)', 'Resolve (winner auto-detected)', 'Repeat for second agenda', 'Auto-advances to next round']
  };

  function renderPhaseFlow(state) {
    const flow = el('div', { class: 'td-flow' });

    const phases = el('div', { class: 'td-flow__phases' });
    State.PHASES.forEach(p => {
      const skip = p === 'agenda' && !state.mecatolClaimed;
      const cls = 'td-flow__phase' + (p === state.phase ? ' td-flow__phase--active' : '') + (skip ? ' td-flow__phase--skip' : '');
      phases.appendChild(el('span', { class: cls }, State.PHASE_LABELS[p]));
    });
    flow.appendChild(phases);

    const steps = PHASE_STEPS[state.phase] || [];
    if (steps.length) {
      const stepList = el('div', { class: 'td-flow__steps' });
      steps.forEach((s, i) => {
        const step = el('span', { class: 'td-flow__step' }, (i + 1) + '. ' + s);
        stepList.appendChild(step);
      });
      flow.appendChild(stepList);
    }

    return flow;
  }

  function renderBody(state) {
    if (state.winner !== null) return renderVictoryScreen(state);
    if (state.phase === 'strategy') return renderStrategyBody(state);
    if (state.phase === 'agenda') return renderAgendaBody(state);
    const body = el('div', { class: 'td-body' });
    body.appendChild(renderScoreboard(state));
    body.appendChild(renderSidePanel(state));
    return body;
  }

  function renderVictoryScreen(state) {
    const body = el('div', { class: 'td-body td-body--victory' });
    const screen = el('div', { class: 'td-victory' });

    const winner = state.players[state.winner];
    const winnerVP = State.getPlayerVP(state.winner);

    screen.appendChild(el('div', { class: 'td-victory__eyebrow' }, 'GAME OVER'));
    const title = el('h1', { class: 'td-victory__title' }, winner.name + ' wins');
    title.style.setProperty('--player-color', winner.color);
    screen.appendChild(title);
    screen.appendChild(el('div', { class: 'td-victory__subtitle' }, winnerVP + ' VP · Round ' + state.round));
    if (winner.faction) screen.appendChild(el('div', { class: 'td-victory__faction' }, winner.faction));

    const standings = el('div', { class: 'td-victory__standings' });
    standings.appendChild(el('div', { class: 'td-victory__standings-title' }, 'Final Standings'));
    const sorted = state.players.map((p, i) => ({ player: p, idx: i, vp: State.getPlayerVP(i) }));
    sorted.sort((a, b) => b.vp - a.vp);
    sorted.forEach((entry, rank) => {
      const row = el('div', { class: 'td-victory__row' + (entry.idx === state.winner ? ' td-victory__row--winner' : '') });
      row.style.setProperty('--player-color', entry.player.color);
      row.appendChild(el('span', { class: 'td-victory__rank' }, String(rank + 1)));
      const info = el('div', { class: 'td-victory__player-info' });
      info.appendChild(el('span', { class: 'td-victory__player-name' }, entry.player.name));
      if (entry.player.faction) info.appendChild(el('span', { class: 'td-victory__player-faction' }, entry.player.faction));
      row.appendChild(info);
      row.appendChild(el('span', { class: 'td-victory__player-vp' }, String(entry.vp) + ' VP'));
      standings.appendChild(row);
    });
    screen.appendChild(standings);

    const actions = el('div', { class: 'td-victory__actions' });
    actions.appendChild(el('button', { class: 'td-victory__new-game', onClick: () => { State.reset(); if (window.MG_TIDash_Setup) window.MG_TIDash_Setup.render(root); } }, 'New Game'));
    screen.appendChild(actions);

    body.appendChild(screen);
    return body;
  }

  function renderAgendaBody(state) {
    const body = el('div', { class: 'td-body td-body--agenda' });
    const main = el('div', { class: 'td-agenda-main' });
    if (window.MG_TIDash_Agenda) {
      main.appendChild(window.MG_TIDash_Agenda.renderPanel(state));
    }
    body.appendChild(main);
    const side = el('div', { class: 'td-agenda-side' });
    side.appendChild(renderScoreboard(state));
    body.appendChild(side);
    return body;
  }

  function renderStrategyBody(state) {
    const body = el('div', { class: 'td-body td-body--strategy' });
    const left = el('div', { class: 'td-strat-players' });
    const pickOrder = State.getStrategyPickOrder(state);
    const picksDone = state.strategyPickIdx || 0;
    const currentPicker = picksDone < pickOrder.length ? pickOrder[picksDone] : null;

    state.players.forEach((player, idx) => {
      const isCurrent = idx === currentPicker;
      const row = el('div', { class: 'td-strat-players__row' + (isCurrent ? ' td-strat-players__row--picking' : '') });
      row.style.setProperty('--player-color', player.color);
      const swatch = el('div', { class: 'td-strat-players__swatch' });
      row.appendChild(swatch);
      const info = el('div', { class: 'td-strat-players__info' });
      info.appendChild(el('span', { class: 'td-strat-players__name' }, player.name));
      if (player.faction) info.appendChild(el('span', { class: 'td-strat-players__faction' }, player.faction));
      const assigned = state.strategyCards[idx] || [];
      if (assigned.length) {
        const pills = el('div', { class: 'td-strat-players__cards' });
        assigned.forEach(n => {
          pills.appendChild(el('span', { class: 'td-strat-players__card-pill' }, State.STRATEGY_CARDS[n - 1].name));
        });
        info.appendChild(pills);
      }
      row.appendChild(info);
      if (idx === (state.speakerIdx || 0)) {
        row.appendChild(el('span', { class: 'td-strat-players__speaker-badge' }, 'Speaker'));
      }
      left.appendChild(row);
    });
    body.appendChild(left);

    const right = el('div', { class: 'td-strat-cards' });
    const header = el('div', { class: 'td-strat-cards__header' });
    if (currentPicker !== null) {
      header.style.setProperty('--player-color', state.players[currentPicker].color);
      header.appendChild(el('span', { class: 'td-strat-cards__picking' }, state.players[currentPicker].name + ' picks'));
      header.appendChild(el('span', { class: 'td-strat-cards__count' }, '(' + (picksDone + 1) + '/' + pickOrder.length + ')'));
    } else {
      header.appendChild(el('span', { class: 'td-strat-cards__done' }, 'All cards assigned'));
    }
    right.appendChild(header);

    const grid = el('div', { class: 'td-strat-cards__grid' });
    State.STRATEGY_CARDS.forEach(card => {
      const owner = findCardOwner(state, card.number);
      const taken = owner !== null;
      const attrs = { class: 'td-strat-cards__card' + (taken ? ' td-strat-cards__card--taken' : '') };
      if (!taken) attrs.onClick = () => assignCardToCurrentPicker(card.number);
      const btn = el('button', attrs);
      if (taken) btn.style.setProperty('--player-color', state.players[owner].color);
      btn.appendChild(el('span', { class: 'td-strat-cards__card-num' }, String(card.number)));
      btn.appendChild(el('span', { class: 'td-strat-cards__card-name' }, card.name));
      if (taken) btn.appendChild(el('span', { class: 'td-strat-cards__card-owner' }, state.players[owner].name));
      grid.appendChild(btn);
    });
    right.appendChild(grid);

    if (picksDone > 0) {
      right.appendChild(el('button', { class: 'td-strat-cards__undo', onClick: undoLastPick }, 'Undo last pick'));
    }
    body.appendChild(right);
    return body;
  }

  function renderScoreboard(state) {
    const panel = el('div', { class: 'td-scoreboard' });

    const toolbar = el('div', { class: 'td-scoreboard__toolbar' });
    const mode = getEffectiveSortMode(state);
    const sortBtn = el('button', {
      class: 'td-scoreboard__sort-btn',
      onClick: () => { sortMode = sortMode === 'auto' ? (mode === 'initiative' ? 'vp' : 'initiative') : 'auto'; onStateChange(State.get()); }
    }, mode === 'initiative' ? 'Turn order' : 'VP order');
    toolbar.appendChild(sortBtn);
    panel.appendChild(toolbar);


    const sorted = getSortedPlayers(state);
    sorted.forEach(({ player, idx, vp }) => {
      const row = el('div', { class: buildRowClasses(state, idx) });
      row.style.setProperty('--player-color', player.color);

      const rank = el('div', { class: 'td-score__rank' });
      const swatch = el('div', { class: 'td-score__swatch' });
      rank.appendChild(swatch);
      row.appendChild(rank);

      const info = el('div', { class: 'td-score__info' });
      const name = el('span', { class: 'td-score__name' }, player.name);
      info.appendChild(name);
      if (player.faction) {
        info.appendChild(el('span', { class: 'td-score__faction' }, player.faction));
      }
      if (state.mecatolHolder === idx) {
        info.appendChild(el('span', { class: 'td-score__mecatol-pill' }, 'Mecatol Rex'));
      }
      if (state.mecatolClaimedBy === idx && state.mecatolHolder !== idx) {
        info.appendChild(el('span', { class: 'td-score__custodians-pill' }, 'Custodians +1 VP'));
      }
      if (state.strategyCards[idx] && state.strategyCards[idx].length) {
        const cardsRow = el('div', { class: 'td-score__cards-row' });
        state.strategyCards[idx].forEach(n => {
          const played = state.playedCards && state.playedCards[idx] && state.playedCards[idx].includes(n);
          const pill = el('button', {
            class: 'td-score__card-pill' + (played ? ' td-score__card-pill--played' : ''),
            onClick: (e) => { e.stopPropagation(); toggleCardPlayed(idx, n); }
          }, State.STRATEGY_CARDS[n - 1].name + (played ? ' ✓' : ''));
          cardsRow.appendChild(pill);
        });
        info.appendChild(cardsRow);
      }
      row.appendChild(info);

      const track = el('div', { class: 'td-score__track' });
      const fill = el('div', { class: 'td-score__fill' });
      const pct = Math.min(100, Math.round((vp / state.vpTarget) * 100));
      fill.style.setProperty('--fill-width', pct + '%');
      track.appendChild(fill);
      row.appendChild(track);

      const vpEl = el('div', { class: 'td-score__vp' }, String(vp));
      row.appendChild(vpEl);

      if (state.phase === 'action') {
        const actions = el('div', { class: 'td-score__actions' });
        const isPassed = state.passedPlayers.includes(idx);
        const playerCards = state.strategyCards[idx] || [];
        const playedCards = (state.playedCards && state.playedCards[idx]) || [];
        const allCardsPlayed = playerCards.length > 0 && playerCards.every(n => playedCards.includes(n));
        if (isPassed) {
          const unpass = el('button', { class: 'td-score__action-btn td-score__action-btn--unpass', onClick: (e) => { e.stopPropagation(); unpassPlayer(idx); } }, 'Unpass');
          actions.appendChild(unpass);
        } else if (allCardsPlayed) {
          const passBtn = el('button', { class: 'td-score__action-btn td-score__action-btn--pass', onClick: (e) => { e.stopPropagation(); passPlayer(idx); } }, 'Pass');
          actions.appendChild(passBtn);
        } else {
          actions.appendChild(el('span', { class: 'td-score__action-hint' }, 'Must play card'));
        }
        row.appendChild(actions);
      }

      row.addEventListener('click', () => setActivePlayer(idx));
      panel.appendChild(row);
    });

    return panel;
  }


  function renderSidePanel(state) {
    const side = el('div', { class: 'td-side', id: 'td-side-panel' });
    if (window.MG_TIDash_Objectives) {
      side.appendChild(window.MG_TIDash_Objectives.renderPanel(state));
    }
    if (state.phase === 'agenda' && state.mecatolClaimed && window.MG_TIDash_Agenda) {
      side.appendChild(window.MG_TIDash_Agenda.renderPanel(state));
    }
    return side;
  }

  function renderMobileNav(state) {
    const nav = el('div', { class: 'td-mobile-nav' });
    const tabs = [
      { id: 'score', label: 'Score', icon: '★' },
      { id: 'objectives', label: 'Objectives', icon: '◎' },
      { id: 'agenda', label: 'Agenda', icon: '⚖' }
    ];
    tabs.forEach(t => {
      const btn = el('button', {
        class: 'td-mobile-nav__tab' + (t.id === 'score' ? ' td-mobile-nav__tab--active' : ''),
        'data-tab': t.id,
        onClick: () => switchMobileTab(t.id)
      });
      btn.appendChild(el('span', { class: 'td-mobile-nav__icon' }, t.icon));
      btn.appendChild(el('span', { class: 'td-mobile-nav__label' }, t.label));
      nav.appendChild(btn);
    });
    return nav;
  }

  function switchMobileTab(tabId) {
    const shell = root.querySelector('.td-shell');
    if (!shell) return;
    shell.setAttribute('data-active-tab', tabId);
    shell.querySelectorAll('.td-mobile-nav__tab').forEach(t => {
      t.classList.toggle('td-mobile-nav__tab--active', t.getAttribute('data-tab') === tabId);
    });
  }

  function buildRowClasses(state, idx) {
    let cls = 'td-score__row';
    if (state.phase === 'action') {
      if (idx === state.activePlayerIdx) cls += ' td-score__row--active';
      if (state.passedPlayers.includes(idx)) cls += ' td-score__row--passed';
    }
    return cls;
  }

  function getEffectiveSortMode(state) {
    if (sortMode !== 'auto') return sortMode;
    return state.phase === 'action' ? 'initiative' : 'vp';
  }

  function getSortedPlayers(state) {
    const players = state.players.map((p, i) => ({ player: p, idx: i, vp: State.getPlayerVP(i) }));
    const initiative = State.getInitiativeOrder();
    const mode = getEffectiveSortMode(state);
    if (mode === 'initiative') {
      players.sort((a, b) => initiative.indexOf(a.idx) - initiative.indexOf(b.idx));
    } else {
      players.sort((a, b) => {
        if (b.vp !== a.vp) return b.vp - a.vp;
        return initiative.indexOf(a.idx) - initiative.indexOf(b.idx);
      });
    }
    return players;
  }

  function findCardOwner(state, cardNum) {
    for (const [idx, cards] of Object.entries(state.strategyCards)) {
      if (cards.includes(cardNum)) return parseInt(idx);
    }
    return null;
  }

  function assignCardToCurrentPicker(cardNum) {
    const state = State.get();
    const pickOrder = State.getStrategyPickOrder(state);
    const picksDone = state.strategyPickIdx || 0;
    if (picksDone >= pickOrder.length) return;

    const owner = findCardOwner(state, cardNum);
    if (owner !== null) return;

    const playerIdx = pickOrder[picksDone];
    State.update(s => {
      if (!s.strategyCards[playerIdx]) s.strategyCards[playerIdx] = [];
      s.strategyCards[playerIdx].push(cardNum);
      s.strategyPickIdx = (s.strategyPickIdx || 0) + 1;
      if (s.strategyPickIdx >= pickOrder.length) {
        s.phase = 'action';
        s.passedPlayers = [];
        s.activePlayerIdx = getFirstPlayer(s);
      }
    });
  }

  function undoLastPick() {
    State.update(s => {
      if (!s.strategyPickIdx || s.strategyPickIdx <= 0) return;
      s.strategyPickIdx--;
      const pickOrder = State.getStrategyPickOrder(s);
      const playerIdx = pickOrder[s.strategyPickIdx];
      if (s.strategyCards[playerIdx] && s.strategyCards[playerIdx].length) {
        s.strategyCards[playerIdx].pop();
      }
    });
  }

  function advanceStatus() {
    State.update(s => {
      const step = s.statusStep || 0;
      if (step === 1) {
        autoRevealObjective(s);
      }
      if (step >= 4) {
        s.statusStep = 0;
        if (s.mecatolClaimed) {
          s.phase = 'agenda';
          s.agenda._phaseCount = 0;
        } else {
          s.round++;
          s.phase = 'strategy';
          s.passedPlayers = [];
          s.strategyCards = {};
          s.strategyPickIdx = 0;
          s.playedCards = {};
        }
      } else {
        s.statusStep = step + 1;
      }
    });
  }


  function nextTurn() {
    State.update(s => {
      const order = State.getInitiativeOrder();
      const active = order.filter(i => !s.passedPlayers.includes(i));
      if (active.length === 0) return;
      const cur = active.indexOf(s.activePlayerIdx);
      s.activePlayerIdx = active[(cur + 1) % active.length];
    });
  }

  function passPlayer(idx) {
    State.update(s => {
      if (!s.passedPlayers.includes(idx)) {
        s.passedPlayers.push(idx);
      }
      if (s.passedPlayers.length >= s.players.length) {
        s.phase = 'status';
        s.statusStep = 0;
        return;
      }
      if (s.activePlayerIdx === idx) {
        const order = State.getInitiativeOrder();
        const active = order.filter(i => !s.passedPlayers.includes(i));
        if (active.length === 0) return;
        const posInFull = order.indexOf(idx);
        let next = null;
        for (let i = 1; i < order.length; i++) {
          const candidate = order[(posInFull + i) % order.length];
          if (active.includes(candidate)) { next = candidate; break; }
        }
        s.activePlayerIdx = next !== null ? next : active[0];
      }
    });
  }

  function unpassPlayer(idx) {
    State.update(s => { s.passedPlayers = s.passedPlayers.filter(p => p !== idx); });
  }

  function setActivePlayer(idx) {
  }

  function toggleCardPlayed(playerIdx, cardNum) {
    State.update(s => {
      if (!s.playedCards[playerIdx]) s.playedCards[playerIdx] = [];
      const idx = s.playedCards[playerIdx].indexOf(cardNum);
      if (idx >= 0) {
        s.playedCards[playerIdx].splice(idx, 1);
      } else {
        s.playedCards[playerIdx].push(cardNum);
        if (cardNum === 3) showSpeakerChangeModal();
      }
    });
  }

  function showSpeakerChangeModal() {
    const state = State.get();
    const modal = el('div', { class: 'td-modal' });
    const box = el('div', { class: 'td-modal__box' });
    box.appendChild(el('h3', { class: 'td-modal__title' }, 'Politics: Choose new Speaker'));
    state.players.forEach((p, i) => {
      const btn = el('button', { class: 'td-modal__player-btn', onClick: () => {
        State.update(s => { s.speakerIdx = i; });
        modal.remove();
      }});
      btn.style.setProperty('--player-color', p.color);
      btn.appendChild(el('span', {}, p.name + (i === state.speakerIdx ? ' (current)' : '')));
      box.appendChild(btn);
    });
    const cancel = el('button', { class: 'td-modal__cancel', onClick: () => modal.remove() }, 'Keep current');
    box.appendChild(cancel);
    modal.appendChild(box);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    root.querySelector('.td-shell').appendChild(modal);
  }

  function toggleMecatol() {
    showMecatolClaimModal();
  }

  function showMecatolClaimModal() {
    const state = State.get();
    const modal = el('div', { class: 'td-modal' });
    const box = el('div', { class: 'td-modal__box' });
    const isTransfer = state.mecatolClaimed;
    box.appendChild(el('h3', { class: 'td-modal__title' }, isTransfer ? 'Mecatol Rex changes hands' : 'Who claimed Mecatol Rex?'));
    if (!isTransfer) box.appendChild(el('p', { class: 'td-modal__subtitle' }, '+1 VP (Custodians token)'));
    state.players.forEach((p, i) => {
      const btn = el('button', { class: 'td-modal__player-btn', onClick: () => {
        State.update(s => {
          if (!s.mecatolClaimed) {
            s.mecatolClaimed = true;
            s.mecatolClaimedBy = i;
            s.bonusVP[i] = (s.bonusVP[i] || 0) + 1;
          }
          s.mecatolHolder = i;
        });
        modal.remove();
      }});
      btn.style.setProperty('--player-color', p.color);
      btn.appendChild(el('span', {}, p.name + (state.mecatolHolder === i ? ' (current)' : '')));
      box.appendChild(btn);
    });
    const cancel = el('button', { class: 'td-modal__cancel', onClick: () => modal.remove() }, 'Cancel');
    box.appendChild(cancel);
    modal.appendChild(box);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    root.querySelector('.td-shell').appendChild(modal);
  }

  function showOverridePanel() {
    const state = State.get();
    const modal = el('div', { class: 'td-modal' });
    const box = el('div', { class: 'td-modal__box td-modal__box--wide' });
    box.appendChild(el('h3', { class: 'td-modal__title' }, 'Override Controls'));
    box.appendChild(el('p', { class: 'td-modal__subtitle' }, 'For action cards, faction abilities, and edge cases'));

    const section = (title) => {
      const s = el('div', { class: 'td-override__section' });
      s.appendChild(el('div', { class: 'td-override__section-title' }, title));
      return s;
    };

    const phaseSection = section('Force Phase');
    const phaseRow = el('div', { class: 'td-override__row' });
    State.PHASES.forEach(p => {
      const btn = el('button', {
        class: 'td-override__btn' + (p === state.phase ? ' td-override__btn--active' : ''),
        onClick: () => { State.update(s => { s.phase = p; s.statusStep = 0; s.passedPlayers = []; }); modal.remove(); }
      }, State.PHASE_LABELS[p]);
      phaseRow.appendChild(btn);
    });
    phaseSection.appendChild(phaseRow);
    box.appendChild(phaseSection);

    const turnSection = section('Set Active Player');
    const turnRow = el('div', { class: 'td-override__row' });
    state.players.forEach((p, i) => {
      const btn = el('button', { class: 'td-override__player-btn', onClick: () => { State.update(s => { s.activePlayerIdx = i; }); modal.remove(); } });
      btn.style.setProperty('--player-color', p.color);
      btn.appendChild(el('span', {}, p.name));
      turnRow.appendChild(btn);
    });
    turnSection.appendChild(turnRow);
    box.appendChild(turnSection);

    const passSection = section('Reset Passed Players');
    const passBtn = el('button', { class: 'td-override__btn', onClick: () => { State.update(s => { s.passedPlayers = []; }); modal.remove(); } }, 'Clear all passed');
    passSection.appendChild(passBtn);
    box.appendChild(passSection);

    const speakerSection = section('Change Speaker');
    const speakerRow = el('div', { class: 'td-override__row' });
    state.players.forEach((p, i) => {
      const btn = el('button', {
        class: 'td-override__player-btn' + (i === (state.speakerIdx || 0) ? ' td-override__btn--active' : ''),
        onClick: () => { State.update(s => { s.speakerIdx = i; }); modal.remove(); }
      });
      btn.style.setProperty('--player-color', p.color);
      btn.appendChild(el('span', {}, p.name));
      speakerRow.appendChild(btn);
    });
    speakerSection.appendChild(speakerRow);
    box.appendChild(speakerSection);

    const vpSection = section('Adjust Bonus VP');
    state.players.forEach((p, i) => {
      const row = el('div', { class: 'td-override__vp-row' });
      row.style.setProperty('--player-color', p.color);
      row.appendChild(el('span', { class: 'td-override__vp-name' }, p.name));
      row.appendChild(el('button', { class: 'td-override__vp-btn', onClick: () => { State.update(s => { s.bonusVP[i] = Math.max(0, (s.bonusVP[i] || 0) - 1); }); modal.remove(); } }, '−'));
      row.appendChild(el('span', { class: 'td-override__vp-val' }, String(state.bonusVP[i] || 0)));
      row.appendChild(el('button', { class: 'td-override__vp-btn', onClick: () => { State.update(s => { s.bonusVP[i] = (s.bonusVP[i] || 0) + 1; }); modal.remove(); } }, '+'));
      vpSection.appendChild(row);
    });
    box.appendChild(vpSection);

    const roundSection = section('Round');
    const roundRow = el('div', { class: 'td-override__row' });
    roundRow.appendChild(el('button', { class: 'td-override__btn', onClick: () => { State.update(s => { s.round = Math.max(1, s.round - 1); }); modal.remove(); } }, '− Round'));
    roundRow.appendChild(el('span', { class: 'td-override__vp-val' }, String(state.round)));
    roundRow.appendChild(el('button', { class: 'td-override__btn', onClick: () => { State.update(s => { s.round++; }); modal.remove(); } }, '+ Round'));
    const newRound = el('button', { class: 'td-override__btn', onClick: () => {
      State.update(s => { s.round++; s.phase = 'strategy'; s.passedPlayers = []; s.strategyCards = {}; s.strategyPickIdx = 0; s.playedCards = {}; });
      modal.remove();
    } }, 'Start New Round');
    roundRow.appendChild(newRound);
    roundSection.appendChild(roundRow);
    box.appendChild(roundSection);

    const cardsSection = section('Strategy Cards');
    const clearCards = el('button', { class: 'td-override__btn', onClick: () => { State.update(s => { s.strategyCards = {}; s.strategyPickIdx = 0; s.playedCards = {}; }); modal.remove(); } }, 'Clear all cards');
    const unplayAll = el('button', { class: 'td-override__btn', onClick: () => { State.update(s => { s.playedCards = {}; }); modal.remove(); } }, 'Unplay all cards');
    cardsSection.appendChild(clearCards);
    cardsSection.appendChild(unplayAll);
    box.appendChild(cardsSection);

    const cancel = el('button', { class: 'td-modal__cancel', onClick: () => modal.remove() }, 'Close');
    box.appendChild(cancel);
    modal.appendChild(box);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    root.querySelector('.td-shell').appendChild(modal);
  }

  function confirmReset() {
    if (confirm('End this game session?')) {
      State.reset();
      if (window.MG_TIDash_Setup) window.MG_TIDash_Setup.render(root);
    }
  }

  function getFirstPlayer(s) {
    const order = State.getInitiativeOrder();
    return order[0] || 0;
  }

  function autoRevealObjective(s) {
    const revealedS1 = s.objectives.revealed.filter(o => o.stage === 1).length;
    const revealedS2 = s.objectives.revealed.filter(o => o.stage === 2).length;
    const s1Pool = s.objectives.stage1Pool;
    const s2Pool = s.objectives.stage2Pool;
    if (revealedS1 < s1Pool.length && s1Pool[revealedS1]) {
      s.objectives.revealed.push({ ...s1Pool[revealedS1], stage: 1 });
    } else if (revealedS2 < s2Pool.length && s2Pool[revealedS2]) {
      s.objectives.revealed.push({ ...s2Pool[revealedS2], stage: 2 });
    }
  }

  return { render };
})();
