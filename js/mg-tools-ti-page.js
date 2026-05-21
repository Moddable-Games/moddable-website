(function() {
const { T, el, btn, navbar, footer } = MG;
document.getElementById('nav-root').appendChild(navbar('Tools'));
document.getElementById('footer-root').appendChild(footer());

/* ── FACTION PICKER ── */
const FACTIONS = [
  { name:'Federation of Sol',   color:'#c8d400', flag:'FoS' },
  { name:'Mentak Coalition',    color:'#e89a1a', flag:'MC'  },
  { name:'Yin Brotherhood',     color:'#a4a4a4', flag:'YB'  },
  { name:'Embers of Muaat',     color:'#d11a1a', flag:'EM'  },
  { name:'Arborec',             color:'#3a9928', flag:'AR'  },
  { name:'L1Z1X Mindnet',       color:'#1a1a3a', flag:'L1'  },
  { name:'Winnu',               color:'#c97afb', flag:'WN'  },
  { name:'Naalu Collective',    color:'#3a7be8', flag:'NA'  },
  { name:'Barony of Letnev',    color:'#5d2a8a', flag:'BL'  },
  { name:'Xxcha Kingdom',       color:'#0c4f8d', flag:'XX'  },
  { name:'Empyrean',            color:'#e63232', flag:'EP'  },
  { name:'Argent Flight',       color:'#6fb5ff', flag:'AF'  },
  { name:"Vuil'raith Cabal",    color:'#7a8290', flag:'VR'  },
  { name:'Naaz-Rokha Alliance', color:'#428619', flag:'NR'  },
  { name:'Titans of Ul',        color:'#936d62', flag:'TU'  },
];
let playerCount = 4, handSize = 3;

function mkTogBtn(label, active, onClick) {
  const b = document.createElement('button');
  b.className = 'tog-btn';
  b.textContent = label;
  Object.assign(b.style, { background: active?'#14161c':'#f5f4ef', color: active?'#fff':'#14161c', border: `1px solid ${active?'#14161c':'#e6e3d8'}` });
  b.addEventListener('click', onClick);
  return b;
}

function renderPlayerBtns() {
  const wrap = document.getElementById('player-btns'); wrap.innerHTML = '';
  [3,4,5,6].forEach(n => wrap.appendChild(mkTogBtn(n, n===playerCount, () => { playerCount=n; renderPlayerBtns(); renderHandBtns(); deal(); })));
}
function renderHandBtns() {
  const wrap = document.getElementById('hand-btns'); wrap.innerHTML = '';
  [2,3,4].forEach(n => wrap.appendChild(mkTogBtn(n, n===handSize, () => { handSize=n; renderHandBtns(); deal(); })));
}

function deal() {
  const shuffled = [...FACTIONS].sort(() => Math.random()-0.5);
  const hands = document.getElementById('faction-hands'); hands.innerHTML = '';
  for (let p=0; p<playerCount; p++) {
    const row = shuffled.slice(p*handSize, p*handSize+handSize);
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
      badge.style.color = f.name==='L1Z1X Mindnet'?'#fff':'#000';
      card.appendChild(badge);
      card.appendChild(el('div',{class:'ti-faction__name'},f.name));
      row2.appendChild(card);
    });
    wrap.appendChild(row2); hands.appendChild(wrap);
  }
}

document.getElementById('deal-btn').appendChild(btn('Deal factions','dark', deal));
renderPlayerBtns(); renderHandBtns(); deal();

/* ── OBJECTIVE TRACKER ── */
const STAGE_I = ['Corner the Market','Erect a Monument','Establish a Perimeter','Found a Golden Age','Grow Exploration','Imperial Point','Intimidate Council','Lead from the Front','Negotiate Trade Routes','Sway the Council'];
const STAGE_II = ['Centralize Galactic Trade','Conquer the Weak','Form Galactic Brain Trust','Found the Council','Galvanize the People','Manipulate Galactic Law','Master the Laws of War','Revolutionize Warfare','Subdue the Galaxy','Unify the Colonies'];

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
      label.style.color = state[i] ? '#7a8290' : '#14161c';
    });
    list.appendChild(row);
  });
  wrap.appendChild(list);
  return wrap;
}

const og = document.getElementById('objectives-grid');
og.appendChild(objectiveSection('STAGE I', STAGE_I, '#3a9928'));
og.appendChild(objectiveSection('STAGE II', STAGE_II, '#0c4f8d'));

/* ── AGENDA VOTER ── */
const AGENDAS = [
  { title:'Classified Document Leaks', type:'Law', for:'Attach a politics rider to any planet in Mecatol Rex system', against:'Player with most planets loses 1 VP' },
  { title:'Conventions of War', type:'Law', for:'No player may use their faction abilities during combat', against:'For the rest of the round, players may use war sun fighters' },
  { title:'Core Mining', type:'Directive', for:'Each player destroys one of their space docks; gains 2 trade goods', against:'Each player draws 1 action card' },
  { title:'Demilitarized Zone', type:'Law', for:'Mecatol Rex becomes demilitarized — no units may land', against:'Current speaker gains 3 command tokens' },
  { title:'Galactic Crisis Pact', type:'Law', for:'All players vote simultaneously and publicly', against:'Votes this round count double' },
  { title:'Holy Planet of Ixth', type:'Law', for:'Attach Holy Planet of Ixth card to one cultural planet', against:'Each player exhausts one of their planets' },
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
