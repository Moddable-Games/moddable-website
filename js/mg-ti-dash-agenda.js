import { el, data, btn, track } from './mg.js';
import * as State from './mg-ti-dash-state.js';
let agendaPool = [];

async function loadAgendas(expansions) {
  const base = location.pathname.includes('/MODDABLE/moddable-website')
    ? '/MODDABLE/moddable-website/data/' : '/data/';
  const ti4 = await fetch(base + 'ti4.json').then(r => r.json());
  if (ti4.agendas) {
    agendaPool = ti4.agendas.filter(a => expansions.includes(a.expansion));
  }
}

function renderPanel(state) {
  const panel = el('div', { class: 'td-agenda' });
  panel.appendChild(el('div', { class: 'td-agenda__eyebrow' }, 'AGENDA'));

  if (!state.mecatolClaimed) {
    panel.appendChild(el('div', { class: 'td-agenda__locked' }, 'Mecatol Rex not yet claimed'));
    return panel;
  }

  const current = state.agenda.current && state.agenda.current.length ? state.agenda.current[0] : null;
  const agendasThisPhase = state.agenda._phaseCount || 0;

  if (!current && agendasThisPhase < 2) {
    const label = agendasThisPhase === 0 ? 'Draw First Agenda' : 'Draw Second Agenda';
    const drawBtn = el('button', { class: 'td-agenda__draw-btn', onClick: drawOneAgenda }, label);
    panel.appendChild(drawBtn);
  } else if (!current && agendasThisPhase >= 2) {
    panel.appendChild(el('div', { class: 'td-agenda__done' }, 'Both agendas resolved'));
  }

  if (current) {
    panel.appendChild(el('div', { class: 'td-agenda__count' }, 'Agenda ' + (agendasThisPhase + 1) + ' of 2'));
    panel.appendChild(renderAgendaCard(state, current, 0));
    const resolveBtn = el('button', { class: 'td-agenda__resolve-btn', onClick: resolveCurrentAgenda }, 'Resolve');
    panel.appendChild(resolveBtn);
  }

  const laws = state.agenda.laws || [];
  if (laws.length) {
    const lawSection = el('div', { class: 'td-agenda__laws' });
    lawSection.appendChild(el('div', { class: 'td-agenda__laws-title' }, 'Active Laws'));
    laws.forEach((law, li) => {
      const row = el('div', { class: 'td-agenda__law-row' });
      row.appendChild(el('span', { class: 'td-agenda__law-name' }, law.title));
      row.appendChild(el('span', { class: 'td-agenda__law-effect' }, law.for || ''));
      const repeal = el('button', { class: 'td-agenda__law-repeal', onClick: () => repealLaw(li) }, '×');
      row.appendChild(repeal);
      lawSection.appendChild(row);
    });
    panel.appendChild(lawSection);
  }

  if (state.agenda.seen && state.agenda.seen.length) {
    const history = el('div', { class: 'td-agenda__history' });
    history.appendChild(el('div', { class: 'td-agenda__history-title' }, 'Resolved (' + state.agenda.seen.length + ')'));
    state.agenda.seen.forEach(a => {
      const row = el('div', { class: 'td-agenda__history-row' });
      row.appendChild(el('span', { class: 'td-agenda__history-name' }, a.title));
      const badge = el('span', { class: 'td-agenda__history-outcome td-agenda__history-outcome--' + (a._outcome || 'for') }, a._outcome || '?');
      row.appendChild(badge);
      history.appendChild(row);
    });
    panel.appendChild(history);
  }

  return panel;
}

function renderAgendaCard(state, agenda, index) {
  const card = el('div', { class: 'td-agenda__card' });
  card.appendChild(el('div', { class: 'td-agenda__card-type' }, agenda.type || 'Law'));
  card.appendChild(el('h3', { class: 'td-agenda__card-title' }, agenda.title));
  if (agenda.for) card.appendChild(el('div', { class: 'td-agenda__card-effect' }, 'For: ' + agenda.for));
  if (agenda.against) card.appendChild(el('div', { class: 'td-agenda__card-effect' }, 'Against: ' + agenda.against));

  const votes = el('div', { class: 'td-agenda__votes' });
  const forVotes = agenda._forVotes || 0;
  const againstVotes = agenda._againstVotes || 0;
  const total = forVotes + againstVotes;

  const forBar = el('div', { class: 'td-agenda__vote-bar' });
  const forFill = el('div', { class: 'td-agenda__vote-fill td-agenda__vote-fill--for' });
  forFill.style.setProperty('--vote-width', total ? Math.round(forVotes / total * 100) + '%' : '0%');
  forBar.appendChild(forFill);

  const againstBar = el('div', { class: 'td-agenda__vote-bar' });
  const againstFill = el('div', { class: 'td-agenda__vote-fill td-agenda__vote-fill--against' });
  againstFill.style.setProperty('--vote-width', total ? Math.round(againstVotes / total * 100) + '%' : '0%');
  againstBar.appendChild(againstFill);

  const forRow = el('div', { class: 'td-agenda__vote-row' });
  forRow.appendChild(el('span', { class: 'td-agenda__vote-label' }, 'For'));
  forRow.appendChild(forBar);
  forRow.appendChild(el('span', { class: 'td-agenda__vote-count' }, String(forVotes)));
  const forPlus = el('button', { class: 'td-agenda__vote-btn', onClick: () => addVote(index, 'for') }, '+');
  const forMinus = el('button', { class: 'td-agenda__vote-btn', onClick: () => addVote(index, 'for', -1) }, '−');
  forRow.appendChild(forPlus);
  forRow.appendChild(forMinus);

  const againstRow = el('div', { class: 'td-agenda__vote-row' });
  againstRow.appendChild(el('span', { class: 'td-agenda__vote-label' }, 'Against'));
  againstRow.appendChild(againstBar);
  againstRow.appendChild(el('span', { class: 'td-agenda__vote-count' }, String(againstVotes)));
  const agPlus = el('button', { class: 'td-agenda__vote-btn', onClick: () => addVote(index, 'against') }, '+');
  const agMinus = el('button', { class: 'td-agenda__vote-btn', onClick: () => addVote(index, 'against', -1) }, '−');
  againstRow.appendChild(agPlus);
  againstRow.appendChild(agMinus);

  votes.appendChild(forRow);
  votes.appendChild(againstRow);
  card.appendChild(votes);

  return card;
}

function drawOneAgenda() {
  const state = State.get();
  if (!state) return;
  if (agendaPool.length === 0) {
    loadAgendas(state.expansions).then(() => performDrawOne());
  } else {
    performDrawOne();
  }
}

function performDrawOne() {
  State.update(s => {
    const seen = new Set((s.agenda.seen || []).map(a => a.title));
    const available = agendaPool.filter(a => !seen.has(a.title));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    if (shuffled.length) {
      s.agenda.current = [{ ...shuffled[0], _forVotes: 0, _againstVotes: 0 }];
      track('ti_dash_agenda_draw', { agenda_title: shuffled[0].title });
    }
  });
}

function resolveCurrentAgenda() {
  const state = State.get();
  const agenda = state.agenda.current[0];
  if (!agenda) return;
  const forVotes = agenda._forVotes || 0;
  const againstVotes = agenda._againstVotes || 0;

  if (forVotes === againstVotes) {
    showTiebreakerModal(agenda);
  } else {
    doResolve(forVotes > againstVotes ? 'for' : 'against');
  }
}

function showTiebreakerModal(agenda) {
  const state = State.get();
  const speaker = state.players[state.speakerIdx || 0];
  const modal = el('div', { class: 'td-modal' });
  const box = el('div', { class: 'td-modal__box' });
  box.appendChild(el('h3', { class: 'td-modal__title' }, 'Tied — Speaker decides'));
  box.appendChild(el('p', { class: 'td-modal__subtitle' }, speaker.name + ' breaks the tie'));

  const forBtn = el('button', { class: 'td-modal__player-btn', onClick: () => { doResolve('for'); modal.remove(); } });
  forBtn.appendChild(el('span', {}, 'For'));
  box.appendChild(forBtn);

  const againstBtn = el('button', { class: 'td-modal__player-btn', onClick: () => { doResolve('against'); modal.remove(); } });
  againstBtn.appendChild(el('span', {}, 'Against'));
  box.appendChild(againstBtn);

  modal.appendChild(box);
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  const shell = document.querySelector('.td-shell');
  if (shell) shell.appendChild(modal);
}

function doResolve(outcome) {
  State.update(s => {
    if (!s.agenda.current || !s.agenda.current.length) return;
    track('ti_dash_agenda_resolve', { outcome: outcome, agenda_title: s.agenda.current[0].title });
    const resolved = { ...s.agenda.current[0], _outcome: outcome };
    s.agenda.seen = [...(s.agenda.seen || []), resolved];
    const isLaw = (resolved.type || '').toLowerCase() === 'law';
    if (isLaw && outcome === 'for') {
      if (!s.agenda.laws) s.agenda.laws = [];
      s.agenda.laws.push(resolved);
    }
    s.agenda.current = [];
    s.agenda._phaseCount = (s.agenda._phaseCount || 0) + 1;
    if (s.agenda._phaseCount >= 2) {
      s.round++;
      s.phase = 'strategy';
      s.passedPlayers = [];
      s.strategyCards = {};
      s.strategyPickIdx = 0;
      s.playedCards = {};
    }
  });
}

function addVote(agendaIdx, side, delta = 1) {
  State.update(s => {
    if (!s.agenda.current || !s.agenda.current[agendaIdx]) return;
    const key = side === 'for' ? '_forVotes' : '_againstVotes';
    s.agenda.current[agendaIdx][key] = Math.max(0, (s.agenda.current[agendaIdx][key] || 0) + delta);
  });
}

function repealLaw(index) {
  State.update(s => {
    if (s.agenda.laws && s.agenda.laws[index]) {
      s.agenda.laws.splice(index, 1);
    }
  });
}

export { renderPanel, loadAgendas };