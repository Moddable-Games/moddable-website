import { el, btn } from './mg.js';
import * as State from './mg-ti-dash-state.js';
function renderPanel(state) {
  const panel = el('div', { class: 'td-objectives' });
  panel.appendChild(el('div', { class: 'td-objectives__eyebrow' }, 'OBJECTIVES'));

  panel.appendChild(renderStage(state, 1));
  panel.appendChild(renderStage(state, 2));
  const lower = el('div', { class: 'td-objectives__lower' });
  lower.appendChild(renderSecrets(state));
  lower.appendChild(renderBonus(state));
  panel.appendChild(lower);

  return panel;
}

function renderStage(state, stage) {
  const pool = stage === 1 ? state.objectives.stage1Pool : state.objectives.stage2Pool;
  const revealed = state.objectives.revealed.filter(o => o.stage === stage);
  const section = el('div', { class: 'td-objectives__stage' });
  const title = stage === 1 ? 'Stage I' : 'Stage II';
  const count = revealed.length + '/' + pool.length;
  section.appendChild(el('div', { class: 'td-objectives__stage-header' },
    el('span', { class: 'td-objectives__stage-title' }, title),
    el('span', { class: 'td-objectives__stage-count' }, count)
  ));

  revealed.forEach((obj, i) => {
    const row = el('div', { class: 'td-objectives__obj' });
    row.appendChild(el('span', { class: 'td-objectives__obj-name' }, obj.name));
    const scorers = el('div', { class: 'td-objectives__scorers' });
    state.players.forEach((p, pi) => {
      const scored = (state.objectives.scored[pi] || []).some(s => s.name === obj.name && s.stage === stage);
      const pip = el('button', {
        class: 'td-objectives__pip' + (scored ? ' td-objectives__pip--scored' : ''),
        onClick: () => toggleObjectiveScore(pi, obj, stage)
      });
      pip.style.setProperty('--player-color', p.color);
      pip.setAttribute('title', p.name);
      scorers.appendChild(pip);
    });
    row.appendChild(scorers);
    section.appendChild(row);
  });

  const unrevealed = pool.length - revealed.length;
  for (let i = 0; i < unrevealed; i++) {
    const row = el('div', { class: 'td-objectives__obj td-objectives__obj--hidden' });
    row.appendChild(el('span', { class: 'td-objectives__obj-name' }, '???'));
    section.appendChild(row);
  }

  return section;
}

function renderSecrets(state) {
  const section = el('div', { class: 'td-objectives__secrets' });
  section.appendChild(el('div', { class: 'td-objectives__stage-title' }, 'Secrets'));

  state.players.forEach((p, pi) => {
    const secrets = state.secrets[pi] || [];
    const row = el('div', { class: 'td-objectives__secret-row' });
    row.style.setProperty('--player-color', p.color);
    const label = el('span', { class: 'td-objectives__secret-name' }, p.name);
    row.appendChild(label);

    const pips = el('div', { class: 'td-objectives__secret-pips' });
    secrets.forEach((s, si) => {
      const pip = el('button', {
        class: 'td-objectives__secret-pip' + (s.scored ? ' td-objectives__secret-pip--scored' : ''),
        onClick: () => toggleSecret(pi, si)
      });
      pip.setAttribute('title', s.name || 'Secret ' + (si + 1));
      pips.appendChild(pip);
    });
    if (secrets.length < 3) {
      const addBtn = el('button', { class: 'td-objectives__secret-add', onClick: () => addSecret(pi) }, '+');
      pips.appendChild(addBtn);
    }
    row.appendChild(pips);
    section.appendChild(row);
  });

  return section;
}

function renderBonus(state) {
  const section = el('div', { class: 'td-objectives__bonus' });
  section.appendChild(el('div', { class: 'td-objectives__stage-title' }, 'Bonus VP'));

  state.players.forEach((p, pi) => {
    const row = el('div', { class: 'td-objectives__bonus-row' });
    row.style.setProperty('--player-color', p.color);
    row.appendChild(el('span', { class: 'td-objectives__bonus-name' }, p.name));
    const controls = el('div', { class: 'td-objectives__bonus-controls' });
    controls.appendChild(el('button', { class: 'td-objectives__bonus-btn', onClick: () => adjustBonus(pi, -1) }, '−'));
    controls.appendChild(el('span', { class: 'td-objectives__bonus-val' }, String(state.bonusVP[pi] || 0)));
    controls.appendChild(el('button', { class: 'td-objectives__bonus-btn', onClick: () => adjustBonus(pi, 1) }, '+'));
    row.appendChild(controls);
    section.appendChild(row);
  });

  return section;
}

function toggleObjectiveScore(playerIdx, obj, stage) {
  State.update(s => {
    const scored = s.objectives.scored[playerIdx] || [];
    const existing = scored.findIndex(o => o.name === obj.name && o.stage === stage);
    if (existing >= 0) {
      scored.splice(existing, 1);
    } else {
      scored.push({ name: obj.name, stage });
    }
    s.objectives.scored[playerIdx] = scored;
  });
}

function toggleSecret(playerIdx, secretIdx) {
  State.update(s => {
    const secrets = s.secrets[playerIdx];
    if (secrets[secretIdx]) secrets[secretIdx].scored = !secrets[secretIdx].scored;
  });
}

function addSecret(playerIdx) {
  State.update(s => {
    if (!s.secrets[playerIdx]) s.secrets[playerIdx] = [];
    if (s.secrets[playerIdx].length < 3) {
      s.secrets[playerIdx].push({ name: 'Secret', scored: false });
    }
  });
}

function adjustBonus(playerIdx, delta) {
  State.update(s => {
    const val = (s.bonusVP[playerIdx] || 0) + delta;
    s.bonusVP[playerIdx] = Math.max(0, val);
  });
}

export { renderPanel };