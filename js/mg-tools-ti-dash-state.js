/* =========================================================================
   TI4 Dashboard — State & constants
   ========================================================================= */
window.TiDash = (function () {
'use strict';

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

function syncSetupPlayers() {
  const n = setup.playerCount;
  while (setup.players.length < n) {
    const idx = setup.players.length;
    setup.players.push({ name: '', color: PLAYER_COLORS[idx % PLAYER_COLORS.length].hex });
  }
  if (setup.players.length > n) setup.players.length = n;
}

return {
  PLAYER_COLORS: PLAYER_COLORS, VP_TARGETS: VP_TARGETS,
  PHASES: PHASES, STRATEGY_CARDS: STRATEGY_CARDS,
  get dashRoot() { return dashRoot; }, set dashRoot(v) { dashRoot = v; },
  get objData() { return objData; }, set objData(v) { objData = v; },
  get ti4Data() { return ti4Data; }, set ti4Data(v) { ti4Data = v; },
  get session() { return session; }, set session(v) { session = v; },
  get setup() { return setup; }, set setup(v) { setup = v; },
  playerColor: playerColor, playerName: playerName,
  setupPlayerName: setupPlayerName, calcVP: calcVP,
  checkWinner: checkWinner, getAvailableFactions: getAvailableFactions,
  getAvailableObjectives: getAvailableObjectives,
  getAvailableSecrets: getAvailableSecrets,
  getAvailableAgendas: getAvailableAgendas,
  syncSetupPlayers: syncSetupPlayers
};
})();
