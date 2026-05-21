(function() {
const { T, el, btn, navbar, footer } = MG;
document.getElementById('nav-root').appendChild(navbar('Tools'));
document.getElementById('footer-root').appendChild(footer());

/* ── CHARACTER LOTTERY ── */
const CHARS = [
  { name:'Warrior',   str:4, cft:2, lives:4 },
  { name:'Wizard',    str:2, cft:4, lives:4 },
  { name:'Druid',     str:3, cft:3, lives:4 },
  { name:'Priest',    str:2, cft:4, lives:4 },
  { name:'Sorceress', str:2, cft:4, lives:3 },
  { name:'Thief',     str:2, cft:3, lives:4 },
  { name:'Troll',     str:5, cft:1, lives:5 },
  { name:'Ghoul',     str:3, cft:3, lives:4 },
  { name:'Assassin',  str:3, cft:2, lives:4 },
  { name:'Minstrel',  str:2, cft:3, lives:4 },
  { name:'Monk',      str:3, cft:3, lives:4 },
  { name:'Dwarf',     str:4, cft:2, lives:5 },
];
let charCount = 4;

function mkTog(label, active, onClick) {
  const b = document.createElement('button');
  b.className = 'tog-btn' + (active ? ' tog-btn--active' : '');
  b.textContent = label;
  b.addEventListener('click', onClick); return b;
}

function renderCharBtns() {
  const w = document.getElementById('char-player-btns'); w.innerHTML = '';
  [2,3,4,5,6].forEach(n => w.appendChild(mkTog(n, n===charCount, ()=>{ charCount=n; renderCharBtns(); drawChars(); })));
}

function drawChars() {
  const picks = [...CHARS].sort(()=>Math.random()-0.5).slice(0,charCount);
  const grid = document.getElementById('char-grid'); grid.innerHTML = '';
  picks.forEach((c,i) => {
    const card = el('div',{class:'char-card'});
    const av = el('div',{class:'char-card__avatar'},`P${i+1}`);
    const info = el('div',{class:'char-card__info'});
    info.appendChild(el('div',{class:'char-card__name'},c.name));
    info.appendChild(el('div',{class:'char-card__stats'},`STR ${c.str} · CRAFT ${c.cft} · LIVES ${c.lives}`));
    card.appendChild(av); card.appendChild(info); grid.appendChild(card);
  });
}

renderCharBtns(); drawChars();
document.getElementById('char-draw-btn').appendChild(btn('Draw characters','dark',drawChars));

/* ── HEX BOARD GENERATOR ── */
let boardSeed = Math.floor(Math.random()*9999);
const RING_META = [
  { count:1,  radius:0,   color:'#d11a1a', label:'Crown of Command' },
  { count:6,  radius:58,  color:'#5d2a8a', label:'Inner (dungeon approach)' },
  { count:12, radius:116, color:'#0c4f8d', label:'Middle (highlands)' },
  { count:18, radius:174, color:'#3a9928', label:'Outer (world)' },
];

function drawBoard() {
  document.getElementById('board-seed').textContent = `seed: ${boardSeed.toString().padStart(4,'0')}`;
  const svg = document.getElementById('board-svg');
  const ns = 'http://www.w3.org/2000/svg';
  svg.innerHTML = '';
  RING_META.forEach((ring,ri) => {
    for (let i=0; i<ring.count; i++) {
      const angle = (i/ring.count)*Math.PI*2 - Math.PI/2;
      const cx = Math.round(Math.cos(angle)*ring.radius);
      const cy = Math.round(Math.sin(angle)*ring.radius);
      const g = document.createElementNS(ns,'g');
      const poly = document.createElementNS(ns,'polygon');
      poly.setAttribute('transform',`translate(${cx},${cy})`);
      poly.setAttribute('points','0,-22 19,-11 19,11 0,22 -19,11 -19,-11');
      const type = ((boardSeed*7+ri*13+i)%5);
      const alpha = 0.5 + type*0.1;
      poly.setAttribute('fill', ring.color + Math.round(alpha*255).toString(16).padStart(2,'0'));
      poly.setAttribute('stroke', ring.color);
      poly.setAttribute('stroke-width','1.5');
      poly.setAttribute('stroke-opacity','0.6');
      g.appendChild(poly);
      if (ri===0) {
        const txt = document.createElementNS(ns,'text');
        txt.setAttribute('x',cx); txt.setAttribute('y',cy+5);
        txt.setAttribute('font-size','11'); txt.setAttribute('fill','#fff');
        txt.setAttribute('text-anchor','middle'); txt.setAttribute('pointer-events','none');
        txt.textContent = '♛'; g.appendChild(txt);
      }
      svg.appendChild(g);
    }
  });
  // Legend
  const legend = document.getElementById('board-legend'); legend.innerHTML = '';
  RING_META.forEach(r => {
    const chip = el('div',{class:'board-legend__chip'});
    const swatch = el('div',{class:'board-legend__swatch'});
    swatch.style.background = r.color;
    chip.appendChild(swatch);
    const lbl = el('span',{class:'board-legend__label'});
    lbl.textContent = r.label;
    chip.appendChild(lbl);
    legend.appendChild(chip);
  });
}

drawBoard();
document.getElementById('board-reshuffle-btn').appendChild(btn('Reshuffle','dark',()=>{ boardSeed=Math.floor(Math.random()*9999); drawBoard(); }));

/* ── ENCOUNTER QUICK-DRAW ── */
const ENCOUNTERS = {
  outer: [
    { title:'Wandering Merchant',   text:"A merchant with a cart of dubious wares. You may buy 1 item from the purchase deck at half price. If you refuse, he curses you — lose 1 Strength until your next turn." },
    { title:'The River',            text:"You approach the riverbank. Without a boat token or the Swim ability, you must roll 1d6. On a 1–2, lose 1 life to the current." },
    { title:'Village Elder',        text:"An elder recognises your crest. Gain 2 gold. She warns you that the crown corrupts all who claim it." },
    { title:'Goblin Scout',         text:"Craft 1. Strength 2. Reward: 1 gold and 1 Adventure card." },
  ],
  middle: [
    { title:'The Highland Pass',    text:"Treacherous footing. Roll 1d6 — on a 1, lose 1 life falling. On a 5–6, you discover a hidden cache: 3 gold." },
    { title:'Stone Circle',         text:"Ancient runes hum underfoot. Draw 2 Spell cards and keep one. Discard the other." },
    { title:'Wandering Knight',     text:"Strength 4. Craft 1. If you defeat them, gain their Talisman. They leave a note: 'It was not worth it.'" },
    { title:'Mountain Witch',       text:"She offers to trade. Give up 1 Craft to gain 2 Strength, or vice versa." },
  ],
  inner: [
    { title:'Portal of Power',      text:"You stand at the threshold. Roll 1d6: 1–3, you are flung back to the Outer Ring; 4–6, pass freely." },
    { title:'The Warlock',          text:"He demands a Quest. Draw a Warlock Quest card. You must complete it before claiming the Crown." },
    { title:'Dark Elf Assassin',    text:"Craft 4. Strength 3. If she defeats you, she steals your Talisman and vanishes." },
    { title:'Graveyard',            text:"Lose 1 life. Draw an Adventure card — it may be an ally or a further curse." },
  ],
  crown: [
    { title:'Crown of Command',     text:"You hold the Crown at last. Every turn, cast the Command spell on one opponent. They lose 1 life unless they pass a Strength vs. Craft test against you. First to reduce all opponents to 0 lives wins." },
  ],
};
let activeRing = 'outer';
const RING_LABELS = { outer:'Outer', middle:'Middle', inner:'Inner', crown:'Crown' };
const RING_COLORS = { outer:'#3a9928', middle:'#0c4f8d', inner:'#5d2a8a', crown:'#d11a1a' };

function renderRingFilters() {
  const rf = document.getElementById('ring-filters'); rf.innerHTML = '';
  Object.entries(RING_LABELS).forEach(([key,label]) => {
    const isA = key===activeRing;
    const b = document.createElement('button');
    b.className = 'ring-btn' + (isA ? '' : ' ring-btn--inactive');
    b.textContent = label;
    if (isA) { b.style.background = RING_COLORS[key]; b.style.color = '#fff'; b.style.border = 'none'; }
    b.addEventListener('click',()=>{ activeRing=key; renderRingFilters(); drawEncounter(); });
    rf.appendChild(b);
  });
}

function drawEncounter() {
  const pool = ENCOUNTERS[activeRing];
  const enc = pool[Math.floor(Math.random()*pool.length)];
  const card = document.getElementById('encounter-card');
  card.innerHTML = '';
  const c = el('div',{class:'encounter-card__inner'});
  c.style.borderLeft = `4px solid ${RING_COLORS[activeRing]}`;
  const eyebrow = el('div',{class:'encounter-card__eyebrow'},`${RING_LABELS[activeRing].toUpperCase()} RING`);
  eyebrow.style.color = RING_COLORS[activeRing];
  c.appendChild(eyebrow);
  c.appendChild(el('h4',{class:'encounter-card__title'},enc.title));
  c.appendChild(el('p',{class:'encounter-card__text'},enc.text));
  card.appendChild(c);
}

renderRingFilters(); drawEncounter();
document.getElementById('encounter-draw-btn').appendChild(btn('Draw encounter','dark',drawEncounter));
})();
