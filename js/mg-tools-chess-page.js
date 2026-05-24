(function() {
const { T, el, btn, navbar, footer } = MG;
document.getElementById('nav-root').appendChild(navbar('Tools'));
document.getElementById('footer-root').appendChild(footer());

const VARIANTS = [
  { name: 'Regular Chess', players: '2', board: '8×8', win: 'Checkmate', special: 'Standard FIDE rules' },
  { name: 'Fischer Random (Chess960)', players: '2', board: '8×8', win: 'Checkmate', special: 'Back rank pieces randomised (960 positions). Castling rules adapted.' },
  { name: 'Crazyhouse', players: '2', board: '8×8', win: 'Checkmate', special: 'Captured pieces can be dropped onto the board as your own.' },
  { name: 'Bughouse', players: '4 (2v2)', board: '2× 8×8', win: 'Checkmate either opponent', special: 'Team pairs share captured pieces across two boards.' },
  { name: 'King of the Hill', players: '2', board: '8×8', win: 'Checkmate or king reaches centre 4 squares', special: 'Moving your king to d4/d5/e4/e5 is an instant win.' },
  { name: 'Three-Check', players: '2', board: '8×8', win: 'Checkmate or deliver 3 checks', special: 'First to check the opponent three times wins.' },
  { name: 'Atomic Chess', players: '2', board: '8×8', win: 'Explode opponent king', special: 'Captures cause explosions destroying all pieces on adjacent squares.' },
  { name: 'Antichess (Losing Chess)', players: '2', board: '8×8', win: 'Lose all pieces or get stalemated', special: 'Captures are mandatory. First to lose all pieces wins.' },
  { name: 'Racing Kings', players: '2', board: '8×8', win: 'King reaches 8th rank first', special: 'No checks allowed. Both kings start on 1st rank. Race to the top.' },
  { name: 'Horde', players: '2', board: '8×8', win: 'Black: checkmate White king. White: capture all black pawns.', special: 'White has 36 pawns and no king. Black has a standard army.' },
  { name: '4-Player Chess', players: '4', board: '14×14 (cross-shaped)', win: 'Most points from checkmates', special: 'Four armies, four colours. Free-for-all or 2v2 teams.' },
  { name: 'Hexagonal Chess (Glinski)', players: '2', board: '91 hexagons', win: 'Checkmate', special: 'Pieces move along hex axes. Bishops get 3 colours, not 2.' },
  { name: 'Circular Chess', players: '2', board: '4×16 ring', win: 'Checkmate', special: 'Board wraps into a cylinder. No edge — pieces can circle around.' },
  { name: 'Cylinder Chess', players: '2', board: '8×8 (wrapped)', win: 'Checkmate', special: 'Left and right edges are connected. Rooks and queens wrap around.' },
  { name: 'Fog of War', players: '2', board: '8×8', win: 'Capture opponent king', special: 'You only see squares your pieces can move to. No check warnings.' },
  { name: 'Duck Chess', players: '2', board: '8×8', win: 'Capture opponent king', special: 'After each move, place the duck (blocker) on any empty square.' },
  { name: 'Monster Chess', players: '2', board: '8×8', win: 'Checkmate', special: 'White has king + 4 pawns but moves TWICE per turn. Black has full army.' },
  { name: 'Rifle Chess', players: '2', board: '8×8', win: 'Checkmate', special: 'Capturing pieces stay on their square — they "shoot" the target.' },
  { name: 'Marseillais Chess', players: '2', board: '8×8', win: 'Checkmate', special: 'Each player makes TWO moves per turn (except White\'s first turn).' },
  { name: 'Capablanca Chess', players: '2', board: '10×8', win: 'Checkmate', special: 'Two extra pieces: Archbishop (B+N) and Chancellor (R+N). Wider board.' },
];

let currentIdx = Math.floor(Math.random() * VARIANTS.length);

function renderPicker() {
  const wrap = document.getElementById('chess-picker');
  wrap.innerHTML = '';

  const display = el('div', { class: 'variant-display' });
  const v = VARIANTS[currentIdx];
  display.appendChild(el('div', { class: 'variant-display__name' }, v.name));
  const meta = el('div', { class: 'variant-display__meta' });
  meta.appendChild(el('span', {}, `${v.players} players`));
  meta.appendChild(el('span', {}, v.board));
  display.appendChild(meta);
  wrap.appendChild(display);

  wrap.appendChild(btn('Next variant', 'dark', () => {
    currentIdx = (currentIdx + 1) % VARIANTS.length;
    renderPicker();
    renderRules();
  }));
}

function renderRules() {
  const wrap = document.getElementById('chess-rules');
  wrap.innerHTML = '';

  const v = VARIANTS[currentIdx];
  const grid = el('div', { class: 'rules-ref__grid' });
  const fields = [
    ['Board', v.board],
    ['Players', v.players],
    ['Win', v.win],
    ['Special', v.special],
  ];
  fields.forEach(([label, value]) => {
    grid.appendChild(el('div', { class: 'rules-ref__label' }, label));
    grid.appendChild(el('div', { class: 'rules-ref__value' }, value));
  });
  wrap.appendChild(grid);
}

function renderMatch() {
  const wrap = document.getElementById('chess-match');
  wrap.innerHTML = '';

  const form = el('div', { class: 'match-form' });

  const variantRow = el('div', { class: 'match-form__row' });
  variantRow.appendChild(el('span', { class: 'match-form__label' }, 'Variant'));
  const sel = document.createElement('select');
  sel.className = 'match-form__select';
  VARIANTS.forEach((v, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = v.name;
    if (i === currentIdx) opt.selected = true;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', () => {
    currentIdx = parseInt(sel.value);
    renderPicker();
    renderRules();
  });
  variantRow.appendChild(sel);
  form.appendChild(variantRow);

  const timeRow = el('div', { class: 'match-form__row' });
  timeRow.appendChild(el('span', { class: 'match-form__label' }, 'Time'));
  const timeSel = document.createElement('select');
  timeSel.className = 'match-form__select';
  timeSel.id = 'time-select';
  ['No limit', '5 min', '10 min', '15 min', '30 min'].forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    timeSel.appendChild(opt);
  });
  timeRow.appendChild(timeSel);
  form.appendChild(timeRow);

  const p1Row = el('div', { class: 'match-form__row' });
  p1Row.appendChild(el('span', { class: 'match-form__label' }, 'Player 1'));
  const p1 = document.createElement('input');
  p1.type = 'text'; p1.className = 'match-form__input';
  p1.placeholder = 'Name'; p1.id = 'p1-name';
  p1Row.appendChild(p1);
  form.appendChild(p1Row);

  const p2Row = el('div', { class: 'match-form__row' });
  p2Row.appendChild(el('span', { class: 'match-form__label' }, 'Player 2'));
  const p2 = document.createElement('input');
  p2.type = 'text'; p2.className = 'match-form__input';
  p2.placeholder = 'Name'; p2.id = 'p2-name';
  p2Row.appendChild(p2);
  form.appendChild(p2Row);

  form.appendChild(btn('Start Match', 'blue', () => {
    const v = VARIANTS[currentIdx];
    const time = document.getElementById('time-select').value;
    const name1 = document.getElementById('p1-name').value || 'Player 1';
    const name2 = document.getElementById('p2-name').value || 'Player 2';
    const existing = wrap.querySelector('.match-ready');
    if (existing) existing.remove();
    const ready = el('div', { class: 'match-ready' });
    ready.appendChild(el('div', { class: 'match-ready__title' }, 'Match ready'));
    ready.appendChild(el('p', { class: 'match-ready__detail' }, `Variant: ${v.name}`));
    ready.appendChild(el('p', { class: 'match-ready__detail' }, `Time control: ${time}`));
    ready.appendChild(el('p', { class: 'match-ready__detail' }, `${name1} vs ${name2}`));
    ready.appendChild(el('p', { class: 'match-ready__detail' }, `Board: ${v.board}`));
    wrap.appendChild(ready);
  }));

  wrap.appendChild(form);
}

renderPicker();
renderRules();
renderMatch();
})();
