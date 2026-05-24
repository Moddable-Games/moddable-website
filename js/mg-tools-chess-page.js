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
    if (!v.key) return;
    launchGame(v.key);
  }));

  wrap.appendChild(form);
}

function launchGame(variantKey) {
  const boardWrap = document.getElementById('chess-board-live');
  boardWrap.innerHTML = '<div style="padding:20px;color:#666;font-size:0.9rem;">Loading engine...</div>';
  boardWrap.style.display = 'block';

  const base = MG.url('/').replace(/\/$/, '').replace('/MODDABLE/moddable-website', '/MODDABLE/moddable-chess');
  const scripts = ['js/chess-engine.js','js/chess-moves.js','js/chess-play.js','js/chess-variants.js','js/board-renderer.js'];

  function loadScripts(list, cb) {
    if (list.length === 0) { cb(); return; }
    if (window.MCE && list.length === scripts.length) { cb(); return; }
    const s = document.createElement('script');
    s.src = base + '/' + list[0];
    s.onload = () => loadScripts(list.slice(1), cb);
    document.body.appendChild(s);
  }

  loadScripts(scripts, () => {
    fetch(base + '/assets/pieces.svg')
      .then(r => r.text())
      .then(svg => {
        if (!document.getElementById('mce-pieces-defs')) {
          const div = document.createElement('div');
          div.id = 'mce-pieces-defs';
          div.innerHTML = svg;
          document.body.appendChild(div);
        }
        startLiveGame(variantKey);
      });
  });
}

function startLiveGame(variantKey) {
  const wrap = document.getElementById('chess-board-live');
  wrap.innerHTML = '';

  const game = MCE.createGame(variantKey);
  if (variantKey === 'chess960') MCE.loadFEN(game, MCE.randomFEN960());
  if (variantKey === 'racingKings') MCE.loadFEN(game, '8/8/8/8/8/8/krbnNBRK/qrbnNBRQ w - - 0 1');

  let selected = null;

  function render() {
    const allMoves = MCE.legalMoves(game);
    const movesForSel = selected !== null ? allMoves.filter(m => m.from === selected) : [];
    MCE.renderBoard(wrap, game, {
      size: Math.min(480, wrap.offsetWidth - 4),
      selected: selected,
      legalMoves: movesForSel,
      onSquareClick: handleClick,
    });
    const status = MCE.getStatus(game);
    const statusEl = document.getElementById('chess-live-status');
    const turn = game.turn === MCE.WHITE ? 'White' : 'Black';
    if (status === 'checkmate') statusEl.textContent = 'Checkmate — ' + (game.turn === MCE.WHITE ? 'Black' : 'White') + ' wins!';
    else if (status === 'stalemate') statusEl.textContent = 'Stalemate — draw';
    else if (status === 'check') statusEl.textContent = turn + ' to move (check!)';
    else statusEl.textContent = turn + ' to move';
  }

  function handleClick(sq) {
    const piece = game.board[sq];
    const allMoves = MCE.legalMoves(game);
    if (selected !== null) {
      let cands = allMoves.filter(m => m.from === selected && m.to === sq);
      if (cands.length > 1) cands = cands.filter(m => m.promo === 'q');
      if (cands.length > 0) {
        MCE.makeMove(game, cands[0]);
        selected = null;
        render();
        return;
      }
    }
    if (piece && MCE.pieceColor(piece) === game.turn) selected = sq;
    else selected = null;
    render();
  }

  const statusDiv = el('div', { id: 'chess-live-status', class: 'match-ready__title' }, 'White to move');
  wrap.parentNode.insertBefore(statusDiv, wrap.nextSibling);
  render();
}

renderPicker();
renderRules();
renderMatch();
})();
