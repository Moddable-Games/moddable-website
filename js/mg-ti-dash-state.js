const PHASES = ['strategy', 'action', 'status', 'agenda'];
const PHASE_LABELS = { strategy: 'Strategy', action: 'Action', status: 'Status', agenda: 'Agenda' };
const STRATEGY_CARDS = [
  { number: 1, name: 'Leadership' },
  { number: 2, name: 'Diplomacy' },
  { number: 3, name: 'Politics' },
  { number: 4, name: 'Construction' },
  { number: 5, name: 'Trade' },
  { number: 6, name: 'Warfare' },
  { number: 7, name: 'Technology' },
  { number: 8, name: 'Imperial' }
];
const STORAGE_KEY = 'ti4dash_session';

let state = null;
let listeners = [];

function getCardsPerPlayer(playerCount) {
  return playerCount <= 4 ? 2 : 1;
}

function getStrategyPickOrder(state) {
  const n = state.players.length;
  const speaker = state.speakerIdx || 0;
  const order = [];
  for (let i = 0; i < n; i++) order.push((speaker + i) % n);
  if (n <= 4) {
    for (let i = 0; i < n; i++) order.push((speaker + i) % n);
  }
  return order;
}

function create(cfg) {
  state = {
    players: cfg.players,
    round: 1,
    phase: 'strategy',
    vpTarget: cfg.vpTarget || 10,
    expansions: cfg.expansions || ['base', 'pok'],
    speakerIdx: cfg.speakerIdx || 0,
    mecatolClaimed: false,
    mecatolClaimedBy: null,
    mecatolHolder: null,
    activePlayerIdx: 0,
    passedPlayers: [],
    strategyCards: {},
    strategyPickIdx: 0,
    playedCards: {},
    statusStep: 0,
    objectives: { stage1Pool: [], stage2Pool: [], revealed: [], scored: {} },
    agenda: { pool: [], seen: [], current: [] },
    secrets: {},
    bonusVP: {},
    winner: null
  };
  cfg.players.forEach((p, i) => {
    state.secrets[i] = [];
    state.bonusVP[i] = 0;
    state.objectives.scored[i] = [];
  });
  save();
  notify();
  return state;
}

function get() { return state; }

function update(fn) {
  if (!state) return;
  fn(state);
  checkWinner();
  save();
  notify();
}

function checkWinner() {
  if (!state || state.winner !== null) return;
  for (let i = 0; i < state.players.length; i++) {
    if (getPlayerVP(i) >= state.vpTarget) {
      state.winner = i;
      break;
    }
  }
}

function getPlayerVP(idx) {
  if (!state) return 0;
  let vp = 0;
  const scored = state.objectives.scored[idx] || [];
  scored.forEach(obj => {
    if (obj.stage === 1) vp += 1;
    else if (obj.stage === 2) vp += 2;
    else vp += (obj.vp || 1);
  });
  vp += (state.secrets[idx] || []).filter(s => s.scored).length;
  vp += (state.bonusVP[idx] || 0);
  return vp;
}

function getInitiativeOrder() {
  if (!state) return [];
  const assigned = Object.entries(state.strategyCards)
    .map(([idx, cards]) => ({ idx: parseInt(idx), lowest: Math.min(...cards) }))
    .filter(e => isFinite(e.lowest));
  assigned.sort((a, b) => a.lowest - b.lowest);
  const ordered = assigned.map(e => e.idx);
  state.players.forEach((_, i) => { if (!ordered.includes(i)) ordered.push(i); });
  return ordered;
}

function save() {
  if (!state) return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { state = JSON.parse(raw); notify(); return true; }
  } catch (e) {}
  return false;
}

function reset() {
  state = null;
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  notify();
}

function subscribe(fn) { listeners.push(fn); }
function notify() { listeners.forEach(fn => fn(state)); }

export {
  PHASES, PHASE_LABELS, STRATEGY_CARDS, create, get, update,
  getPlayerVP, getInitiativeOrder, getCardsPerPlayer, getStrategyPickOrder,
  save, load, reset, subscribe
};