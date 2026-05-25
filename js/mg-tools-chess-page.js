(function() {
const { T, el, btn, navbar, footer } = MG;
document.getElementById('nav-root').appendChild(navbar('Tools'));
document.getElementById('footer-root').appendChild(footer());

const VARIANTS = [
  { name: 'Regular Chess', players: '2', board: '8×8', win: 'Checkmate', special: 'Standard FIDE rules', key: 'standard' },
  { name: 'Fischer Random (Chess960)', players: '2', board: '8×8', win: 'Checkmate', special: 'Back rank pieces randomised (960 positions). Castling rules adapted.', key: 'chess960' },
  { name: 'King of the Hill', players: '2', board: '8×8', win: 'Checkmate or king reaches centre 4 squares', special: 'Moving your king to d4/d5/e4/e5 is an instant win.', key: 'kingOfTheHill' },
  { name: 'Three-Check', players: '2', board: '8×8', win: 'Checkmate or deliver 3 checks', special: 'First to check the opponent three times wins.', key: 'threeCheck' },
  { name: 'Atomic Chess', players: '2', board: '8×8', win: 'Explode opponent king', special: 'Captures cause explosions destroying all pieces on adjacent squares.', key: 'atomic' },
  { name: 'Antichess', players: '2', board: '8×8', win: 'Lose all pieces or get stalemated', special: 'Captures are mandatory. First to lose all pieces wins.', key: 'antichess' },
  { name: 'Racing Kings', players: '2', board: '8×8', win: 'King reaches 8th rank first', special: 'No checks allowed. Both kings start on 1st rank. Race to the top.', key: 'racingKings' },
  { name: 'Fog of War', players: '2', board: '8×8', win: 'Capture opponent king', special: 'You only see squares your pieces can move to. No check warnings.', key: 'fogOfWar' },
  { name: 'Duck Chess', players: '2', board: '8×8', win: 'Capture opponent king', special: 'After each move, place the duck (blocker) on any empty square.', key: 'duckChess' },
  { name: 'Rifle Chess', players: '2', board: '8×8', win: 'Checkmate', special: 'Capturing pieces stay on their square — they "shoot" the target.', key: 'rifle' },
  { name: 'Marseillais Chess', players: '2', board: '8×8', win: 'Checkmate', special: 'Each player makes TWO moves per turn (except White\'s first turn).', key: 'marseillais' },
  { name: 'Capablanca Chess', players: '2', board: '10×8', win: 'Checkmate', special: 'Two extra pieces: Archbishop (B+N) and Chancellor (R+N). Wider board.', key: 'capablanca' },
  { name: 'Grand Chess', players: '2', board: '10×10', win: 'Checkmate', special: 'Same new pieces as Capablanca, bigger board, pawns start on rank 3.', key: 'grand' },
  { name: 'Courier Chess', players: '2', board: '12×8', win: 'Checkmate', special: 'Medieval German variant from the 1200s. Extra bishops and sage pieces.', key: 'courier' },
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

  const modeRow = el('div', { class: 'match-form__row' });
  modeRow.appendChild(el('span', { class: 'match-form__label' }, 'Mode'));
  const modeSel = document.createElement('select');
  modeSel.className = 'match-form__select';
  modeSel.id = 'mode-select';
  [['solo', 'vs AI'], ['pass', 'Pass & Play']].forEach(([val, label]) => {
    const opt = document.createElement('option');
    opt.value = val; opt.textContent = label;
    modeSel.appendChild(opt);
  });
  modeRow.appendChild(modeSel);
  form.appendChild(modeRow);

  const p1Row = el('div', { class: 'match-form__row' });
  p1Row.appendChild(el('span', { class: 'match-form__label' }, 'White'));
  const p1 = document.createElement('input');
  p1.type = 'text'; p1.className = 'match-form__input';
  p1.placeholder = 'Your name'; p1.id = 'p1-name';
  p1Row.appendChild(p1);
  form.appendChild(p1Row);

  const p2Row = el('div', { class: 'match-form__row' });
  p2Row.appendChild(el('span', { class: 'match-form__label' }, 'Black'));
  const p2 = document.createElement('input');
  p2.type = 'text'; p2.className = 'match-form__input';
  p2.placeholder = 'Opponent name'; p2.id = 'p2-name';
  p2Row.appendChild(p2);
  form.appendChild(p2Row);

  form.appendChild(btn('Start Match', 'blue', () => {
    const v = VARIANTS[currentIdx];
    if (!v.key) return;
    const mode = document.getElementById('mode-select').value;
    const p1Name = (document.getElementById('p1-name').value.trim()) || 'White';
    const p2Name = mode === 'solo' ? 'AI' : ((document.getElementById('p2-name').value.trim()) || 'Black');
    const boardSection = document.getElementById('chess-embed-wrap');
    boardSection.style.display = 'block';
    boardSection.innerHTML = '';

    const header = el('div', {class: 'chess-embed__header'});
    header.appendChild(el('h3', {class: 'chess-embed__title'}, v.name));
    const meta = el('div', {class: 'chess-embed__meta'});
    meta.appendChild(el('span', {}, p1Name + ' vs ' + p2Name));
    if (mode === 'pass') meta.appendChild(el('span', {}, 'Pass & Play'));
    header.appendChild(meta);
    boardSection.appendChild(header);

    const dims = v.board.split('×').map(Number);
    const cols = dims[0] || 8;
    const rows = dims[1] || 8;

    const iframe = document.createElement('iframe');
    const chessBase = location.hostname === 'localhost'
      ? '/MODDABLE/moddable-chess/play/'
      : 'https://chess.moddable.games/play/';
    iframe.src = chessBase + '?variant=' + v.key + '&embed=1'
      + '&theme=light&radius=8px&boardonly=1'
      + '&p1=' + encodeURIComponent(p1Name)
      + '&p2=' + encodeURIComponent(p2Name)
      + '&mode=' + mode;
    iframe.className = 'chess-embed__iframe';
    iframe.style.aspectRatio = cols + ' / ' + rows;
    iframe.setAttribute('title', 'Play ' + v.name);
    iframe.setAttribute('scrolling', 'no');
    boardSection.appendChild(iframe);
    boardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));

  wrap.appendChild(form);
}


renderPicker();
renderRules();
renderMatch();

const engineBtns = document.getElementById('engine-btns');
if (engineBtns) {
  const playBtn = MG.linkBtn('Moddable Chess', '/games/moddable-chess/', 'primary');
  const srcBtn = MG.linkBtn('View source on GitHub', 'https://github.com/Moddable-Games/moddable-chess', 'dark');
  srcBtn.setAttribute('target', '_blank');
  srcBtn.setAttribute('rel', 'noopener');
  engineBtns.appendChild(playBtn);
  engineBtns.appendChild(srcBtn);
}
})();
