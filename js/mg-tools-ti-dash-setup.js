/* =========================================================================
   TI4 Dashboard — Setup wizard
   ========================================================================= */
(function () {
'use strict';
const { el, url } = MG;
const S = window.TiDash;

function assignSetupColor(pIdx, colorHex) {
  S.setup.players[pIdx].color = colorHex;
  window.TiDash_render();
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
  inner.appendChild(el('h1', { className: 'ti-dash-setup__heading', textContent: stepTitles[S.setup.step - 1] }));
  const subs = ['Configure this session.', 'Name your players.', 'Assign factions (optional).'];
  inner.appendChild(el('p', { className: 'ti-dash-setup__sub', textContent: subs[S.setup.step - 1] }));
  const steps = el('div', { className: 'ti-dash-setup__steps' });
  for (let s = 1; s <= 3; s++) {
    const cls = ['ti-dash-setup__step',
      s < S.setup.step ? 'ti-dash-setup__step--done' : '',
      s === S.setup.step ? 'ti-dash-setup__step--active' : ''
    ].filter(Boolean).join(' ');
    steps.appendChild(el('div', { className: cls }));
  }
  inner.appendChild(steps);
  if (S.setup.step === 1) inner.appendChild(buildStep1());
  if (S.setup.step === 2) inner.appendChild(buildStep2());
  if (S.setup.step === 3) inner.appendChild(buildStep3());
  S.dashRoot.appendChild(wrap);
}

function buildStep1() {
  const frag = document.createDocumentFragment();
  const pcCard = el('div', { className: 'ti-dash-setup__card' });
  pcCard.appendChild(el('div', { className: 'ti-dash-setup__card-label', textContent: 'Number of players' }));
  const pcBtns = el('div', { className: 'ti-dash-setup__btns' });
  [3, 4, 5, 6].forEach(function(n) {
    const b = el('button', { className: 'td-tog' + (S.setup.playerCount === n ? ' td-tog--active' : ''), textContent: String(n) });
    b.addEventListener('click', function() { S.setup.playerCount = n; S.syncSetupPlayers(); window.TiDash_render(); });
    pcBtns.appendChild(b);
  });
  pcCard.appendChild(pcBtns);
  frag.appendChild(pcCard);

  const vpCard = el('div', { className: 'ti-dash-setup__card' });
  vpCard.appendChild(el('div', { className: 'ti-dash-setup__card-label', textContent: 'Victory point target' }));
  const vpBtns = el('div', { className: 'ti-dash-setup__btns' });
  S.VP_TARGETS.forEach(function(v) {
    const b = el('button', { className: 'td-tog' + (S.setup.vpTarget === v ? ' td-tog--active' : ''), textContent: String(v) });
    b.addEventListener('click', function() { S.setup.vpTarget = v; window.TiDash_render(); });
    vpBtns.appendChild(b);
  });
  vpCard.appendChild(vpBtns);
  frag.appendChild(vpCard);

  if (S.ti4Data && S.ti4Data.expansions && S.ti4Data.expansions.length) {
    const expCard = el('div', { className: 'ti-dash-setup__card' });
    expCard.appendChild(el('div', { className: 'ti-dash-setup__card-label', textContent: 'Expansions' }));
    const expBtns = el('div', { className: 'ti-dash-setup__btns' });
    S.ti4Data.expansions.forEach(function(exp) {
      const active = S.setup.enabledExpansions[exp.key];
      const b = el('button', { className: 'td-tog' + (active ? ' td-tog--active' : ''), textContent: exp.name });
      b.addEventListener('click', function() { S.setup.enabledExpansions[exp.key] = !S.setup.enabledExpansions[exp.key]; window.TiDash_render(); });
      expBtns.appendChild(b);
    });
    expCard.appendChild(expBtns);
    frag.appendChild(expCard);
  }

  const nav = el('div', { className: 'ti-dash-setup__nav' });
  nav.appendChild(el('a', { href: url('/tools/ti/'), className: 'ti-dash-setup__back', textContent: '← Exit' }));
  const nextBtn = el('button', { className: 'ti-dash-setup__next', textContent: 'Next →' });
  nextBtn.addEventListener('click', function() { S.setup.step = 2; S.syncSetupPlayers(); window.TiDash_render(); });
  nav.appendChild(nextBtn);
  frag.appendChild(nav);
  return frag;
}

function buildStep2() {
  const frag = document.createDocumentFragment();
  S.syncSetupPlayers();
  const card = el('div', { className: 'ti-dash-setup__card' });
  card.appendChild(el('div', { className: 'ti-dash-setup__card-label', textContent: 'Player names & colours' }));
  const rows = el('div', { className: 'ti-dash-setup__player-rows' });
  for (let i = 0; i < S.setup.playerCount; i++) {
    const row = el('div', { className: 'ti-dash-setup__player-row' });
    row.appendChild(el('span', { className: 'ti-dash-setup__player-num', textContent: String(i + 1) }));
    const input = el('input', { className: 'ti-dash-setup__player-input', type: 'text', placeholder: 'Player ' + (i + 1), value: S.setup.players[i].name });
    const idx = i;
    input.addEventListener('input', function() { S.setup.players[idx].name = input.value; });
    row.appendChild(input);
    const colorBtns = el('div', { className: 'ti-dash-setup__color-btns' });
    S.PLAYER_COLORS.forEach(function(c) {
      const sw = el('button', { className: 'ti-dash-setup__color-swatch' + (S.setup.players[i].color === c.hex ? ' ti-dash-setup__color-swatch--active' : ''), title: c.name });
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
  backBtn.addEventListener('click', function() { S.setup.step = 1; window.TiDash_render(); });
  nav.appendChild(backBtn);
  const nextBtn = el('button', { className: 'ti-dash-setup__next', textContent: 'Next →' });
  nextBtn.addEventListener('click', function() { S.setup.step = 3; window.TiDash_render(); });
  nav.appendChild(nextBtn);
  frag.appendChild(nav);
  return frag;
}

function buildStep3() {
  const frag = document.createDocumentFragment();
  const factions = S.getAvailableFactions();
  const assignCard = el('div', { className: 'ti-dash-setup__card' });
  assignCard.appendChild(el('div', { className: 'ti-dash-setup__card-label', textContent: 'Faction assignments' }));
  for (let i = 0; i < S.setup.playerCount; i++) {
    const row = el('div', { className: 'td-draft__assign-row' });
    const sw = el('div', { className: 'td-draft__assign-swatch' });
    sw.style.background = S.setup.players[i].color;
    row.appendChild(sw);
    row.appendChild(el('span', { className: 'td-draft__assign-name', textContent: S.setupPlayerName(i) }));
    const assigned = S.setup.factionAssignments[i];
    if (assigned) {
      row.appendChild(el('span', { className: 'td-draft__assign-faction', textContent: assigned }));
      const clr = el('button', { className: 'td-draft__assign-clear', textContent: '×' });
      const pi = i;
      clr.addEventListener('click', function() { delete S.setup.factionAssignments[pi]; window.TiDash_render(); });
      row.appendChild(clr);
    } else {
      row.appendChild(el('span', { className: 'td-draft__assign-faction', textContent: '(unassigned)' }));
      const sel = el('select', { className: 'td-secrets__select' });
      sel.appendChild(el('option', { value: '', textContent: 'Pick faction…' }));
      const assignedVals = Object.values(S.setup.factionAssignments);
      factions.forEach(function(f) {
        if (!assignedVals.includes(f.name)) sel.appendChild(el('option', { value: f.name, textContent: f.name }));
      });
      const pi = i;
      sel.addEventListener('change', function() { if (sel.value) { S.setup.factionAssignments[pi] = sel.value; window.TiDash_render(); } });
      row.appendChild(sel);
    }
    assignCard.appendChild(row);
  }
  frag.appendChild(assignCard);
  const nav = el('div', { className: 'ti-dash-setup__nav' });
  const backBtn = el('button', { className: 'ti-dash-setup__back', textContent: '← Back' });
  backBtn.addEventListener('click', function() { S.setup.step = 2; window.TiDash_render(); });
  nav.appendChild(backBtn);
  const launchBtn = el('button', { className: 'ti-dash-setup__next', textContent: 'Launch →' });
  launchBtn.addEventListener('click', function() { window.TiDash_launch(); });
  nav.appendChild(launchBtn);
  frag.appendChild(nav);
  return frag;
}

window.TiDash_renderSetup = renderSetup;
})();
