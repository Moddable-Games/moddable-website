(function() {
const { T, el, btn, navbar, footer, data } = MG;
document.getElementById('nav-root').appendChild(navbar('Tools'));
document.getElementById('footer-root').appendChild(footer());

let ti4Data = null;
let enabledExpansions = { base: true, pok: true };
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
  const toggles = document.querySelectorAll('.ti-expansion-toggles');
  toggles.forEach(t => { t.innerHTML = ''; renderExpansionTogglesInto(t); });
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

  const factionCard = document.getElementById('faction-hands').closest('.ti-card') || document.getElementById('player-btns').parentElement.parentElement;
  const toggleWrap = el('div',{class:'ti-expansion-toggles'});
  renderExpansionTogglesInto(toggleWrap);
  const controlsEl = document.querySelector('.ti-controls');
  if (controlsEl) controlsEl.prepend(toggleWrap);

  const countEl = el('span',{class:'ti-faction-count',id:'faction-count'});
  const dealBtn = document.getElementById('deal-btn');
  if (dealBtn) dealBtn.parentElement.insertBefore(countEl, dealBtn);

  renderPlayerBtns(); renderHandBtns(); deal();
  renderObjectives();
});

/* ── HEXMAP EMBED ── */
MG_HexEmbed.init('twilight');
MG_HexEmbed.renderBtns();

/* ── AGENDA VOTER ── */
const AGENDAS = [
  { title:'Anti-Intellectual Revolution', type:'Law', for:'After a player researches a technology, they must destroy one of their non-fighter ships', against:'At the start of each round, each player discards 1 action card' },
  { title:'Archived Secret', type:'Directive', for:'Elected player draws 2 secret objectives', against:'Elected player draws 3 action cards' },
  { title:'Arms Reduction', type:'Directive', for:'Each player destroys all but 2 of their dreadnoughts and all but 4 of their cruisers', against:'Each player returns 1 command token from their fleet pool to reinforcements' },
  { title:'Classified Document Leaks', type:'Law', for:'When a player scores a secret objective, they must reveal all secret objectives in hand', against:'Each player that has scored a secret objective gains 1 trade good' },
  { title:'Colonial Redistribution', type:'Directive', for:'Each player returns all planets outside their home system to the game board', against:'Each player places 1 infantry from reinforcements on a planet they control' },
  { title:'Committee Formation', type:'Law', for:'The speaker cannot vote on agendas', against:'Each player who voted for this outcome draws 1 action card' },
  { title:'Compensated Disarmament', type:'Directive', for:'Each player destroys all of their ground forces on Mecatol Rex; each player who destroys at least 1 ground force gains 3 trade goods', against:'Each player places up to 2 infantry from reinforcements on Mecatol Rex' },
  { title:'Conventions of War', type:'Law', for:'Players cannot use BOMBARDMENT against planets that contain structures', against:'Each player that voted for this outcome draws 1 action card' },
  { title:'Core Mining', type:'Directive', for:'Attach this card to a hazardous planet; its resource value is increased by 2', against:'Attach this card to a cultural planet; its influence value is increased by 2' },
  { title:'Demilitarized Zone', type:'Law', for:'All units in the Mecatol Rex system are returned to reinforcements; players cannot move units into the Mecatol Rex system', against:'The Mecatol Rex system gains no effect' },
  { title:'Economic Equality', type:'Directive', for:'Each player returns all trade goods to the supply and gains 5 trade goods', against:'Each player returns all trade goods to the supply and draws 1 action card for every 3 trade goods returned (rounded down)' },
  { title:'Enforced Travel Ban', type:'Law', for:'Alpha and beta wormholes have no effect during movement', against:'Players may not spend trade goods to increase the number of votes they cast' },
  { title:'Executive Sanctions', type:'Law', for:'Each player can have a maximum of 3 action cards in hand', against:'Each player can have a maximum of 5 action cards in hand' },
  { title:'Fleet Regulations', type:'Law', for:'Each player places a maximum of 4 tokens in their fleet pool', against:'Each player places a maximum of 5 tokens in their fleet pool' },
  { title:'Galactic Crisis Pact', type:'Directive', for:'The speaker gains 1 victory point', against:'The speaker loses 1 victory point' },
  { title:'Holy Planet of Ixth', type:'Law', for:'Attach this card to a cultural planet; its resource value and influence value are each increased by 2', against:'Exhaust all cultural planets' },
  { title:'Homeland Defense Act', type:'Law', for:'Each player cannot have more than 2 PDS units on any planet', against:'Each player places 1 PDS from reinforcements on a planet they control' },
  { title:'Imperial Arbiter', type:'Law', for:'The speaker gains this card; at any time they may discard this card to swap 2 systems on the game board', against:'Exhaust all planets in one system chosen by the speaker' },
  { title:'Incentive Program', type:'Directive', for:'Draw 1 stage I public objective and place it faceup in the common play area', against:'Draw 1 stage II public objective and place it faceup in the common play area' },
  { title:'Ixthian Artifact', type:'Directive', for:'The speaker rolls 1 die; on 6-10 each player may research 1 technology; on 1-5 destroy all units on 3 planets you control', against:'No effect' },
  { title:'Judicial Abolishment', type:'Directive', for:'Discard all laws in play', against:'Each player draws 1 action card for each law in play' },
  { title:'Minister of Commerce', type:'Law', for:'The speaker gains this card; at the start of the strategy phase they gain 1 trade good for each neighbour they have', against:'Each player who voted for this outcome gains 1 trade good' },
  { title:'Minister of Exploration', type:'Law', for:'The speaker gains this card; when they take control of a planet, they gain 1 trade good', against:'Each player who voted for this outcome gains 1 trade good' },
  { title:'Minister of Industry', type:'Law', for:'The speaker gains this card; they may place 1 space dock from reinforcements on a planet they control', against:'Each player who voted for this outcome places 1 PDS from reinforcements on a planet they control' },
  { title:'Minister of Peace', type:'Law', for:'The speaker gains this card; after a player activates a system that contains one of their units, that player loses 1 trade good', against:'Each player who voted for this outcome gains 1 trade good' },
  { title:'Minister of Policy', type:'Law', for:'The speaker gains this card; at the end of the status phase they draw 1 action card', against:'Each player who voted for this outcome draws 1 action card' },
  { title:'Minister of Sciences', type:'Law', for:'The speaker gains this card; when they research a technology, they may spend 3 trade goods to ignore 1 prerequisite', against:'Each player who voted for this outcome gains 2 trade goods' },
  { title:'Minister of War', type:'Law', for:'The speaker gains this card; they may convert 1 of their command tokens from their strategy pool to their fleet pool at the start of each round', against:'Each player who voted for this outcome places 1 cruiser from reinforcements in their home system' },
  { title:'Miscount Disclosed', type:'Directive', for:'Revote on the previous agenda', against:'The previous agenda has no further effect' },
  { title:'Mutiny', type:'Directive', for:'Each player who voted for this outcome gains 1 victory point', against:'Each player who voted for this outcome loses 1 victory point' },
  { title:'New Constitution', type:'Directive', for:'Discard all laws in play. At the end of this agenda phase draw 2 agendas from the top of the deck and resolve each', against:'No effect' },
  { title:'Prophecy of Ixth', type:'Law', for:'The speaker gains this card; they apply +1 to the result of each of their unit\'s combat rolls', against:'Each player who voted for this outcome applies +1 to their SPACE COMBAT rolls until end of round' },
  { title:'Public Execution', type:'Directive', for:'Elected player discards all action cards from hand and loses 3 trade goods', against:'Elected player gains 1 trade good for each action card in hand' },
  { title:'Publicize Weapon Schematics', type:'Directive', for:'If any player has a war sun on the board, all players may research the War Sun tech (ignoring prerequisites); destroy all war suns', against:'No effect' },
  { title:'Regulated Conscription', type:'Law', for:'No more than 2 ground forces may participate in combat on a given planet', against:'No effect; each player that voted for this outcome places 2 infantry from reinforcements on a planet they control' },
  { title:'Representative Government', type:'Law', for:'Each player with a cultural planet gains 1 additional vote during agenda phase', against:'Each player can cast a total of only 1 vote on each agenda' },
  { title:'Research Team: Biotic', type:'Directive', for:'Attach this card to a planet with a green technology specialty; its resource value is increased by 1', against:'Attach this card to a planet without a technology specialty; that planet gains a green technology specialty' },
  { title:'Research Team: Cybernetic', type:'Directive', for:'Attach this card to a planet with a yellow technology specialty; its resource value is increased by 1', against:'Attach this card to a planet without a technology specialty; that planet gains a yellow technology specialty' },
  { title:'Research Team: Propulsion', type:'Directive', for:'Attach this card to a planet with a blue technology specialty; its resource value is increased by 1', against:'Attach this card to a planet without a technology specialty; that planet gains a blue technology specialty' },
  { title:'Research Team: Warfare', type:'Directive', for:'Attach this card to a planet with a red technology specialty; its resource value is increased by 1', against:'Attach this card to a planet without a technology specialty; that planet gains a red technology specialty' },
  { title:'Seed of an Empire', type:'Directive', for:'The player with the most victory points gains 1 victory point', against:'The player with the fewest victory points gains 1 victory point' },
  { title:'Senate Sanctuary', type:'Law', for:'Mecatol Rex is immune to the BOMBARDMENT ability', against:'No effect' },
  { title:'Shard of the Throne', type:'Law', for:'The speaker gains this card and 1 VP; if they ever lose this card they lose 1 VP', against:'The speaker draws 1 secret objective' },
  { title:'Shared Research', type:'Law', for:'Each player\'s technology prerequisites are reduced by 1 for all technologies', against:'No effect' },
  { title:'Wormhole Reconstruction', type:'Directive', for:'All systems containing alpha or beta wormholes are adjacent to each other', against:'Each player that has a ship in or adjacent to a wormhole system may move that ship to any other wormhole system' },
  { title:'Wormhole Research', type:'Law', for:'Players that have ships in systems containing wormholes gain 1 trade good at the start of the status phase', against:'Each player who voted for this outcome gains 2 trade goods' },
];

let currentAgenda = null, votes = {for:0, against:0};

function drawAgenda() {
  currentAgenda = AGENDAS[Math.floor(Math.random()*AGENDAS.length)];
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

drawAgenda();
})();
