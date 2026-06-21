/* =========================================================================
   TI4 Dashboard — Objectives & Agenda tabs
   ========================================================================= */
(function () {
'use strict';
const { el } = MG;
const S = window.TiDash;

function renderMainTabs() {
  const tabs = el('div', { className: 'ti-dash__tabs' });
  ['objectives', 'agenda'].forEach(function(id) {
    const t = el('button', {
      className: 'ti-dash__tab' + (S.session._activeTab === id ? ' ti-dash__tab--active' : ''),
      textContent: id.charAt(0).toUpperCase() + id.slice(1)
    });
    t.addEventListener('click', function() { S.session._activeTab = id; window.TiDash_render(); });
    tabs.appendChild(t);
  });
  return tabs;
}

function renderMainPanel() {
  const panel = el('div', { className: 'ti-dash__panel' });
  if (S.session.winner !== null) panel.appendChild(renderWinnerBanner());
  if (S.session._activeTab === 'objectives') panel.appendChild(renderObjectivesTab());
  if (S.session._activeTab === 'agenda') panel.appendChild(renderAgendaTab());
  return panel;
}

function renderWinnerBanner() {
  const p = S.session.players[S.session.winner];
  const div = el('div', { className: 'td-winner' });
  div.appendChild(el('div', { className: 'td-winner__label', textContent: 'WINNER' }));
  div.appendChild(el('div', { className: 'td-winner__name', textContent: p.name }));
  div.appendChild(el('div', { className: 'td-winner__sub', textContent: S.calcVP(S.session.winner) + ' VP' + (p.faction ? ' · ' + p.faction : '') }));
  return div;
}

function renderObjectivesTab() {
  const wrap = el('div');
  const subtabs = el('div', { className: 'td-obj-subtabs' });
  ['public', 'secret', 'bonus'].forEach(function(id) {
    const t = el('button', {
      className: 'td-obj-subtab' + (S.session._objSubTab === id ? ' td-obj-subtab--active' : ''),
      textContent: id.charAt(0).toUpperCase() + id.slice(1)
    });
    t.addEventListener('click', function() { S.session._objSubTab = id; window.TiDash_render(); });
    subtabs.appendChild(t);
  });
  wrap.appendChild(subtabs);
  if (S.session._objSubTab === 'public')  wrap.appendChild(renderPublicObjectives());
  if (S.session._objSubTab === 'secret')  wrap.appendChild(renderSecretObjectives());
  if (S.session._objSubTab === 'bonus')   wrap.appendChild(renderBonusVP());
  return wrap;
}

function renderPublicObjectives() {
  const wrap = el('div');
  wrap.appendChild(el('div', { className: 'td-obj-section-label', textContent: 'Stage I (1 VP)' }));
  S.session.revealedStage1.forEach(function(name) { wrap.appendChild(renderObjRow(name, 's1', 1)); });
  const avail1 = S.getAvailableObjectives(1).filter(function(o) { return !S.session.revealedStage1.includes(o.name); });
  if (avail1.length) {
    const sel = el('select', { className: 'td-secrets__select' });
    sel.appendChild(el('option', { value: '', textContent: 'Reveal Stage I objective…' }));
    avail1.forEach(function(o) { sel.appendChild(el('option', { value: o.name, textContent: o.name })); });
    sel.addEventListener('change', function() { if (sel.value) { S.session.revealedStage1.push(sel.value); window.TiDash_render(); } });
    wrap.appendChild(sel);
  }
  wrap.appendChild(el('div', { className: 'td-obj-section-label', textContent: 'Stage II (2 VP)' }));
  S.session.revealedStage2.forEach(function(name) { wrap.appendChild(renderObjRow(name, 's2', 2)); });
  const avail2 = S.getAvailableObjectives(2).filter(function(o) { return !S.session.revealedStage2.includes(o.name); });
  if (avail2.length) {
    const sel = el('select', { className: 'td-secrets__select' });
    sel.appendChild(el('option', { value: '', textContent: 'Reveal Stage II objective…' }));
    avail2.forEach(function(o) { sel.appendChild(el('option', { value: o.name, textContent: o.name })); });
    sel.addEventListener('change', function() { if (sel.value) { S.session.revealedStage2.push(sel.value); window.TiDash_render(); } });
    wrap.appendChild(sel);
  }
  return wrap;
}

function renderObjRow(name, stage, pts) {
  const key = stage + ':' + name;
  const scoredBy = S.session.scoredObjectives[key] || [];
  const row = el('div', { className: 'td-obj-row' + (scoredBy.length ? ' td-obj-row--scored' : '') });
  const info = el('div', { className: 'td-obj-info' });
  info.appendChild(el('div', { className: 'td-obj-name', textContent: name }));
  row.appendChild(info);
  row.appendChild(el('span', { className: 'td-obj-pts', textContent: pts + ' VP' }));
  const btns = el('div', { className: 'td-player-btns' });
  S.session.players.forEach(function(p, i) {
    const scored = scoredBy.includes(i);
    const b = el('button', { className: 'td-player-btn' + (scored ? ' td-player-btn--scored' : ''), title: p.name });
    b.style.background = p.color;
    b.addEventListener('click', function() {
      const arr = S.session.scoredObjectives[key] || [];
      S.session.scoredObjectives[key] = arr.includes(i) ? arr.filter(function(x) { return x !== i; }) : arr.concat([i]);
      window.TiDash_render();
    });
    btns.appendChild(b);
  });
  row.appendChild(btns);
  return row;
}

function renderSecretObjectives() {
  const wrap = el('div');
  S.session.players.forEach(function(p, i) {
    const div = el('div', { className: 'td-secrets__player' });
    const hdr = el('div', { className: 'td-secrets__player-header' });
    const sw = el('div', { className: 'td-secrets__player-swatch' }); sw.style.background = p.color; hdr.appendChild(sw);
    hdr.appendChild(el('span', { className: 'td-secrets__player-name', textContent: p.name }));
    const secrets = S.session.secretObjectives[i] || [];
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
          sb.addEventListener('click', function() { S.session.secretObjectives[ii][sii].scored = true; window.TiDash_render(); });
          item.appendChild(sb);
        }
        const rm = el('button', { className: 'td-draft__assign-clear', textContent: '×' });
        const ii = i, sii = si;
        rm.addEventListener('click', function() { S.session.secretObjectives[ii].splice(sii, 1); window.TiDash_render(); });
        item.appendChild(rm);
        list.appendChild(item);
      });
      div.appendChild(list);
    }
    const avail = S.getAvailableSecrets().filter(function(s) {
      return !(S.session.secretObjectives[i] || []).find(function(x) { return x.name === s.name; });
    });
    if (avail.length) {
      const sel = el('select', { className: 'td-secrets__select' });
      sel.appendChild(el('option', { value: '', textContent: 'Hold secret objective…' }));
      avail.forEach(function(s) { sel.appendChild(el('option', { value: s.name, textContent: s.name })); });
      const ii = i;
      sel.addEventListener('change', function() {
        if (sel.value) {
          if (!S.session.secretObjectives[ii]) S.session.secretObjectives[ii] = [];
          S.session.secretObjectives[ii].push({ name: sel.value, scored: false });
          window.TiDash_render();
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
  S.session.players.forEach(function(p, i) {
    const bonus = S.session.bonusVP[i] || {};
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
        if (!S.session.bonusVP[ii]) S.session.bonusVP[ii] = {};
        S.session.bonusVP[ii][bk] = Math.max(0, (S.session.bonusVP[ii][bk] || 0) - 1);
        window.TiDash_render();
      });
      ctr.appendChild(dec);
      ctr.appendChild(el('span', { className: 'td-bonus__val', textContent: String(val) }));
      const inc = el('button', { className: 'td-bonus__btn', textContent: '+' });
      inc.addEventListener('click', function() {
        if (!S.session.bonusVP[ii]) S.session.bonusVP[ii] = {};
        S.session.bonusVP[ii][bk] = (S.session.bonusVP[ii][bk] || 0) + 1;
        window.TiDash_render();
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
    const agendas = S.getAvailableAgendas();
    if (!agendas.length) return;
    S.session._agenda = agendas[Math.floor(Math.random() * agendas.length)];
    S.session._agendaVotes = { for: 0, against: 0 };
    window.TiDash_render();
  });
  hdr.appendChild(drawBtn);
  wrap.appendChild(hdr);
  if (!S.session._agenda) {
    wrap.appendChild(el('div', { className: 'td-agenda-empty', textContent: 'Draw an agenda to begin voting.' }));
    return wrap;
  }
  const card = el('div', { className: 'td-agenda-card' });
  card.appendChild(el('div', { className: 'td-agenda-type', textContent: S.session._agenda.type || 'Agenda' }));
  card.appendChild(el('div', { className: 'td-agenda-name', textContent: S.session._agenda.name }));
  if (S.session._agenda.text) card.appendChild(el('div', { className: 'td-agenda-text', textContent: S.session._agenda.text }));
  wrap.appendChild(card);
  const total = S.session._agendaVotes.for + S.session._agendaVotes.against;
  function tallyRow(side, cls) {
    const row = el('div', { className: 'td-tally__row' });
    row.appendChild(el('span', { className: 'td-tally__label', textContent: side === 'for' ? 'For' : 'Against' }));
    const btns = el('div', { className: 'td-tally__btns' });
    const dec = el('button', { className: 'td-tally__btn', textContent: '−' });
    dec.addEventListener('click', function() { S.session._agendaVotes[side] = Math.max(0, S.session._agendaVotes[side] - 1); window.TiDash_render(); });
    btns.appendChild(dec);
    btns.appendChild(el('span', { className: 'td-tally__count', textContent: String(S.session._agendaVotes[side]) }));
    const inc = el('button', { className: 'td-tally__btn', textContent: '+' });
    inc.addEventListener('click', function() { S.session._agendaVotes[side]++; window.TiDash_render(); });
    btns.appendChild(inc);
    row.appendChild(btns);
    const bar = el('div', { className: 'td-tally__bar' });
    const fill = el('div', { className: cls });
    fill.style.width = total ? Math.round(S.session._agendaVotes[side] / total * 100) + '%' : '0%';
    bar.appendChild(fill); row.appendChild(bar);
    return row;
  }
  wrap.appendChild(tallyRow('for', 'td-tally__fill--for'));
  wrap.appendChild(tallyRow('against', 'td-tally__fill--against'));
  if (total > 0) {
    const f = S.session._agendaVotes.for, a = S.session._agendaVotes.against;
    const outcome = f > a ? 'For wins (' + f + ' vs ' + a + ')'
      : a > f ? 'Against wins (' + a + ' vs ' + f + ')'
      : 'Tied — speaker decides';
    wrap.appendChild(el('div', { className: 'td-agenda-outcome', textContent: outcome }));
  }
  const clearBtn = el('button', { className: 'td-outline-btn td-agenda-discard', textContent: 'Discard' });
  clearBtn.addEventListener('click', function() { S.session._agenda = null; S.session._agendaVotes = { for: 0, against: 0 }; window.TiDash_render(); });
  wrap.appendChild(clearBtn);
  return wrap;
}

window.TiDash_renderMainTabs = renderMainTabs;
window.TiDash_renderMainPanel = renderMainPanel;
window.TiDash_renderWinnerBanner = renderWinnerBanner;
window.TiDash_renderObjectivesTab = renderObjectivesTab;
window.TiDash_renderAgendaTab = renderAgendaTab;
})();
