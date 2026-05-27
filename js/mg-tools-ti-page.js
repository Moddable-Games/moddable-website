(function() {
const { T, el, btn, navbar, footer, data } = MG;
document.getElementById('nav-root').appendChild(navbar('Tools'));
document.getElementById('footer-root').appendChild(footer());

let ti4Data = null;
let enabledExpansions = { base: true, pok: true, codex: true };
let playerCount = 4, handSize = 3;

function mkTogBtn(label, active, onClick) {
  const b = document.createElement('button');
  b.className = 'tog-btn';
  b.textContent = label;
  Object.assign(b.style, { background: active?'#14161c':'#f5f4ef', color: active?'#fff':'#14161c', border: `1px solid ${active?'#14161c':'#e6e3d8'}` });
  b.addEventListener('click', onClick);
  return b;
}

function getFactions() {
  return ti4Data.factions.filter(f => enabledExpansions[f.expansion]);
}

function renderExpansionToggles(container) {
  const row = el('div',{class:'ti-expansion-toggles'});
  ti4Data.expansions.forEach(exp => {
    row.appendChild(mkTogBtn(exp.label, enabledExpansions[exp.key], () => {
      enabledExpansions[exp.key] = !enabledExpansions[exp.key];
      renderAll();
    }));
  });
  container.appendChild(row);
}

function renderPlayerBtns() {
  const wrap = document.getElementById('player-btns'); wrap.innerHTML = '';
  [3,4,5,6,7,8].forEach(n => wrap.appendChild(mkTogBtn(n, n===playerCount, () => { playerCount=n; renderPlayerBtns(); renderHandBtns(); deal(); })));
}
function renderHandBtns() {
  const wrap = document.getElementById('hand-btns'); wrap.innerHTML = '';
  [2,3,4].forEach(n => wrap.appendChild(mkTogBtn(n, n===handSize, () => { handSize=n; renderHandBtns(); deal(); })));
}

function deal() {
  const factions = getFactions();
  const shuffled = [...factions].sort(() => Math.random()-0.5);
  const hands = document.getElementById('faction-hands'); hands.innerHTML = '';
  for (let p=0; p<playerCount; p++) {
    const row = shuffled.slice(p*handSize, p*handSize+handSize);
    if (row.length === 0) continue;
    const wrap = el('div',{class:'ti-hand'});
    wrap.appendChild(el('div',{class:'ti-hand__label'},`PLAYER ${p+1}`));
    const row2 = el('div',{class:'ti-hand__row'});
    row.forEach(f => {
      const card = el('div',{class:'ti-faction'});
      card.style.borderWidth = '2px';
      card.style.borderStyle = 'solid';
      card.style.borderColor = f.color;
      const badge = el('div',{class:'ti-faction__badge'},f.flag);
      badge.style.background = f.color;
      const darkBg = ['L1Z1X Mindnet','Nekro Virus','Barony of Letnev'].includes(f.name);
      badge.style.color = darkBg ? '#fff' : '#000';
      card.appendChild(badge);
      const nameEl = el('div',{class:'ti-faction__name'},f.name);
      card.appendChild(nameEl);
      if (f.expansion !== 'base') {
        const tag = el('span',{class:'ti-faction__exp'},'PoK');
        card.appendChild(tag);
      }
      row2.appendChild(card);
    });
    wrap.appendChild(row2); hands.appendChild(wrap);
  }
  const countEl = document.getElementById('faction-count');
  if (countEl) countEl.textContent = factions.length + ' factions';
}

function renderObjectives() {
  const og = document.getElementById('objectives-grid'); og.innerHTML = '';
  const s1 = ti4Data.objectives.stage1.filter(o => enabledExpansions[o.expansion]).map(o => o.text);
  const s2 = ti4Data.objectives.stage2.filter(o => enabledExpansions[o.expansion]).map(o => o.text);
  og.appendChild(objectiveSection('STAGE I (' + s1.length + ')', s1, '#3a9928'));
  og.appendChild(objectiveSection('STAGE II (' + s2.length + ')', s2, '#0c4f8d'));
}

function objectiveSection(title, objs, accent) {
  const wrap = el('div');
  const heading = el('div',{class:'ti-obj-title'},title);
  heading.style.color = accent;
  wrap.appendChild(heading);
  const list = el('div',{class:'ti-obj-list'});
  const state = objs.map(()=>false);
  objs.forEach((obj, i) => {
    const row = el('div',{class:'ti-obj-row'});
    const check = el('div',{class:'ti-obj-check'});
    check.style.border = `2px solid ${accent}`;
    const label = el('span',{class:'ti-obj-label'},obj);
    row.appendChild(check); row.appendChild(label);
    row.addEventListener('click',()=>{
      state[i] = !state[i];
      check.style.background = state[i] ? accent : 'transparent';
      check.style.borderColor = accent;
      check.textContent = state[i] ? '✓' : '';
      check.style.color = '#fff';
      row.style.background = state[i] ? accent+'18' : '#f5f4ef';
      label.style.textDecoration = state[i] ? 'line-through' : 'none';
      label.style.color = state[i] ? '#636b78' : '#14161c';
    });
    list.appendChild(row);
  });
  wrap.appendChild(list);
  return wrap;
}

function renderAll() {
  renderPlayerBtns(); renderHandBtns(); deal(); renderObjectives();
  document.querySelectorAll('.ti-expansion-toggles').forEach(t => { t.innerHTML = ''; renderExpansionTogglesInto(t); });
}

function renderExpansionTogglesInto(container) {
  ti4Data.expansions.forEach(exp => {
    container.appendChild(mkTogBtn(exp.label, enabledExpansions[exp.key], () => {
      enabledExpansions[exp.key] = !enabledExpansions[exp.key];
      renderAll();
    }));
  });
}

fetch(MG.url('/data/ti4.json')).then(r => r.json()).then(d => {
  ti4Data = d;
  document.querySelectorAll('.ti-expansion-toggles').forEach(t => renderExpansionTogglesInto(t));
  renderPlayerBtns(); renderHandBtns(); deal();
  renderObjectives();
  drawAgenda();
});

/* ── HEXMAP EMBED ── */
MG_HexEmbed.init('twilight');
MG_HexEmbed.renderBtns();

/* ── AGENDA VOTER ── */
let currentAgenda = null, votes = {for:0, against:0};

function getAgendas() {
  if (!ti4Data || !ti4Data.agendas) return [];
  return ti4Data.agendas.filter(a => enabledExpansions[a.expansion]);
}

function drawAgenda() {
  const pool = getAgendas();
  if (pool.length === 0) return;
  currentAgenda = pool[Math.floor(Math.random()*pool.length)];
  votes = {for:0, against:0};
  renderAgenda();
}

function renderAgenda() {
  const sec = document.getElementById('agenda-section');
  sec.innerHTML = '';
  if (!currentAgenda) {
    const b = el('div',{class:'ti-agenda-empty'});
    b.appendChild(btn('Draw agenda','dark',drawAgenda));
    sec.appendChild(b); return;
  }
  const card = el('div',{class:'ti-agenda-card'});
  const typeTag = el('span',{class:'ti-agenda-type'},currentAgenda.type.toUpperCase());
  card.appendChild(typeTag);
  card.appendChild(el('h4',{class:'ti-agenda-title'},currentAgenda.title));
  const opts = el('div',{class:'ti-agenda-opts'});
  [['FOR',currentAgenda.for,'#3a9928'],['AGAINST',currentAgenda.against,'#d11a1a']].forEach(([label,text,c]) => {
    const o = el('div',{class:'ti-agenda-opt'});
    o.style.border = `1px solid ${c}44`;
    const lbl = el('div',{class:'ti-agenda-opt__label'},label);
    lbl.style.color = c;
    o.appendChild(lbl);
    o.appendChild(el('div',{class:'ti-agenda-opt__text'},text));
    opts.appendChild(o);
  });
  card.appendChild(opts); sec.appendChild(card);

  // Vote tallies
  const tally = el('div',{class:'ti-tally'});
  ['for','against'].forEach(side => {
    const c = side==='for'?'#3a9928':'#d11a1a';
    const group = el('div',{class:'ti-tally__group'});
    group.appendChild(el('span',{class:'ti-tally__side'},side));
    const count = el('span',{class:'ti-tally__count'},votes[side]);
    count.style.color = c;
    group.appendChild(count);
    const minus = document.createElement('button');
    minus.textContent='−';
    minus.className = 'ti-tally__btn ti-tally__btn--minus';
    minus.addEventListener('click',()=>{ if(votes[side]>0){votes[side]--;count.textContent=votes[side];} });
    const plus = document.createElement('button');
    plus.textContent='+';
    plus.className = 'ti-tally__btn ti-tally__btn--plus';
    plus.style.background = c;
    plus.addEventListener('click',()=>{ votes[side]++;count.textContent=votes[side]; });
    group.appendChild(minus); group.appendChild(plus); tally.appendChild(group);
  });
  sec.appendChild(tally);

  const btns2 = el('div',{class:'ti-agenda-btns'});
  btns2.appendChild(btn('Draw new agenda','dark',drawAgenda));
  btns2.appendChild(btn('Reset votes','outline-light',()=>{ votes={for:0,against:0};renderAgenda(); },{color:'#14161c'}));
  sec.appendChild(btns2);
}

})();
