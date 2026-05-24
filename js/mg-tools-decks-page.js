(function() {
const { T, el, btn, navbar, footer } = MG;
document.getElementById('nav-root').appendChild(navbar('Tools'));
document.getElementById('footer-root').appendChild(footer());

/* ── STATE ── */
let deck = [];
let playerCount = 4;
let cardsPerHand = 5;

/* ── PRESETS ── */
const PRESETS = {
  'Standard 52': [
    ...['2','3','4','5','6','7','8','9','10','J','Q','K','A'].flatMap(r =>
      ['♠','♥','♦','♣'].map(s => ({ name: `${r}${s}`, qty: 1 }))
    )
  ],
  'Tarot (78)': [
    ...['2','3','4','5','6','7','8','9','10','Page','Knight','Queen','King','Ace'].flatMap(r =>
      ['Wands','Cups','Swords','Pentacles'].map(s => ({ name: `${r} of ${s}`, qty: 1 }))
    ),
    ...[...Array(22)].map((_, i) => ({ name: `Major Arcana ${i}`, qty: 1 }))
  ],
  'Uno (108)': [
    ...['Red','Yellow','Green','Blue'].flatMap(c => [
      { name: `${c} 0`, qty: 1 },
      ...['1','2','3','4','5','6','7','8','9','Skip','Reverse','Draw Two'].map(v =>
        ({ name: `${c} ${v}`, qty: 2 })
      )
    ]),
    { name: 'Wild', qty: 4 },
    { name: 'Wild Draw Four', qty: 4 }
  ],
  'Custom blank': []
};

/* ── HELPERS ── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function totalCards() {
  return deck.reduce((sum, c) => sum + c.qty, 0);
}

function mkTogBtn(label, active, onClick) {
  const b = document.createElement('button');
  b.className = 'tog-btn' + (active ? ' tog-btn--active' : '');
  b.textContent = label;
  b.addEventListener('click', onClick);
  return b;
}

/* ── DECK DESIGNER ── */
function renderDesigner() {
  const wrap = document.getElementById('deck-designer');
  wrap.innerHTML = '';

  const controls = el('div', { class: 'deck-designer__controls' });
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'deck-designer__input';
  input.placeholder = 'Card name (e.g. "Ace of Spades")';
  input.id = 'card-name-input';

  let addQty = 1;
  const qtyWrap = el('div', { class: 'deck-designer__qty' });
  const qtyMinus = el('button', { class: 'deck-designer__qty-btn' }, '−');
  const qtyVal = el('span', { class: 'deck-designer__qty-val' }, '1');
  const qtyPlus = el('button', { class: 'deck-designer__qty-btn' }, '+');
  qtyMinus.addEventListener('click', () => { addQty = Math.max(1, addQty - 1); qtyVal.textContent = addQty; });
  qtyPlus.addEventListener('click', () => { addQty = Math.min(99, addQty + 1); qtyVal.textContent = addQty; });
  qtyWrap.append(qtyMinus, qtyVal, qtyPlus);

  const addBtn = btn('Add card', 'green', () => {
    const name = input.value.trim();
    if (!name) return;
    const existing = deck.find(c => c.name === name);
    if (existing) existing.qty += addQty;
    else deck.push({ name, qty: addQty });
    input.value = '';
    renderDesigner();
    renderDealer();
  });

  controls.append(input, qtyWrap, addBtn);
  wrap.appendChild(controls);

  const list = el('ul', { class: 'deck-list' });
  deck.forEach((card, i) => {
    const item = el('li', { class: 'deck-list__item' });
    item.appendChild(el('span', { class: 'deck-list__item-count' }, `×${card.qty}`));
    item.appendChild(document.createTextNode(` ${card.name}`));
    const rm = el('span', { class: 'deck-list__item-remove' }, '×');
    rm.addEventListener('click', () => { deck.splice(i, 1); renderDesigner(); renderDealer(); });
    item.appendChild(rm);
    list.appendChild(item);
  });
  wrap.appendChild(list);

  if (deck.length > 0) {
    wrap.appendChild(el('div', { class: 'deck-total' }, `${deck.length} types · ${totalCards()} cards total`));
    const clearBtn = btn('Clear deck', 'outline-light', () => { deck = []; renderDesigner(); renderDealer(); });
    wrap.appendChild(el('div', { style: '' }, clearBtn));
  }
}

/* ── SHUFFLE & DEAL ── */
function renderDealer() {
  const wrap = document.getElementById('deck-dealer');
  wrap.innerHTML = '';

  const controls = el('div', { class: 'deal-controls' });
  const pGroup = el('div', { class: 'deal-controls__group' });
  pGroup.appendChild(el('span', { class: 'deal-controls__label' }, 'Players:'));
  const pBtns = el('div', { class: 'deal-controls__btns' });
  [2, 3, 4, 5, 6].forEach(n => {
    pBtns.appendChild(mkTogBtn(n, n === playerCount, () => { playerCount = n; renderDealer(); }));
  });
  pGroup.appendChild(pBtns);

  const hGroup = el('div', { class: 'deal-controls__group' });
  hGroup.appendChild(el('span', { class: 'deal-controls__label' }, 'Per hand:'));
  const hBtns = el('div', { class: 'deal-controls__btns' });
  [3, 5, 7, 'All'].forEach(n => {
    const val = n === 'All' ? 'All' : n;
    hBtns.appendChild(mkTogBtn(val, val === cardsPerHand || (n === 'All' && cardsPerHand === 'All'), () => {
      cardsPerHand = val;
      renderDealer();
    }));
  });
  hGroup.appendChild(hBtns);

  controls.append(pGroup, hGroup);
  wrap.appendChild(controls);

  const dealBtn = btn('Deal', 'dark', deal);
  wrap.appendChild(dealBtn);
  wrap.appendChild(el('div', { id: 'deal-result', class: 'deal-hands' }));
}

function deal() {
  const all = [];
  deck.forEach(c => { for (let i = 0; i < c.qty; i++) all.push(c.name); });
  if (all.length === 0) return;

  const shuffled = shuffle(all);
  const handSize = cardsPerHand === 'All' ? Math.floor(shuffled.length / playerCount) : cardsPerHand;
  const result = document.getElementById('deal-result');
  result.innerHTML = '';

  for (let p = 0; p < playerCount; p++) {
    const hand = shuffled.slice(p * handSize, (p + 1) * handSize);
    const handEl = el('div', { class: 'deal-hand' });
    handEl.appendChild(el('div', { class: 'deal-hand__title' }, `Player ${p + 1}`));
    const cards = el('div', { class: 'deal-hand__cards' });
    hand.forEach(name => cards.appendChild(el('span', { class: 'deal-hand__card' }, name)));
    handEl.appendChild(cards);
    result.appendChild(handEl);
  }
}

/* ── PRESETS ── */
function renderPresets() {
  const wrap = document.getElementById('deck-presets');
  wrap.innerHTML = '';
  const grid = el('div', { class: 'presets-grid' });
  Object.keys(PRESETS).forEach(name => {
    grid.appendChild(btn(name, 'outline-light', () => {
      deck = JSON.parse(JSON.stringify(PRESETS[name]));
      renderDesigner();
      renderDealer();
    }));
  });
  wrap.appendChild(grid);
}

/* ── INIT ── */
renderDesigner();
renderDealer();
renderPresets();
})();
