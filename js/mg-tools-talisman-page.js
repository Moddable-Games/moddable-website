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

/* ── HEX BOARD GENERATOR (Moddable Hexmaps embed) ── */
MG_HexEmbed.init('talisman');
MG_HexEmbed.renderBtns();

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
