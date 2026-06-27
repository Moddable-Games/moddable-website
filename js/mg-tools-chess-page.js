import { T, el, data, track, btn, linkBtn, navbar, footer, sectionHero } from './mg.js';

document.getElementById('nav-root').appendChild(navbar('Tools'));
document.getElementById('footer-root').appendChild(footer());

document.getElementById('page-hero').appendChild(sectionHero({
  section: 'tool-chess',
  tier: 2,
  hexColor: 'green',
  eyebrow: 'CHESS VARIANTS',
  title: 'Chess variants.',
  lede: 'Load and play from 74 variants across 5 difficulty levels. One engine, infinite rulesets.'
}));

const API_BASE = 'https://tools.moddable.games';
const CHESS_BASE = location.hostname === 'localhost'
  ? '/MODDABLE/moddable-chess/play/'
  : 'https://chess.moddable.games/play/';

function slugToKey(slug) {
  return slug.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

data.get('chess-variants').then(function(raw) {
  const VARIANTS = raw
    .sort((a, b) => a.order - b.order)
    .filter(v => v.playable !== false)
    .map(v => ({
      name: v.title, players: v.players, board: v.board,
      win: v.win, special: v.special,
      key: v.key || slugToKey(v.slug),
    }));

  let currentIdx = Math.floor(Math.random() * VARIANTS.length);

  function renderExplorer() {
    const body = document.getElementById('chess-explorer-body');
    body.innerHTML = '';

    const controls = el('div', { class: 'chess-explorer__controls' });
    const sel = document.createElement('select');
    sel.className = 'chess-explorer__select';
    VARIANTS.forEach(function(v, i) {
      const opt = document.createElement('option');
      opt.value = i; opt.textContent = v.name;
      if (i === currentIdx) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', function() {
      currentIdx = parseInt(sel.value);
      renderExplorer();
      if (track) track('chess_variant_select', { variant: VARIANTS[currentIdx].name });
    });
    controls.appendChild(sel);
    controls.appendChild(btn('Random', 'outline-light', function() {
      currentIdx = Math.floor(Math.random() * VARIANTS.length);
      renderExplorer();
    }));
    body.appendChild(controls);

    const v = VARIANTS[currentIdx];

    const info = el('div', { class: 'chess-explorer__info' });
    const grid = el('div', { class: 'chess-explorer__grid' });
    grid.appendChild(makeInfoCell('Board', v.board));
    grid.appendChild(makeInfoCell('Players', v.players));
    grid.appendChild(makeInfoCell('Win', v.win));
    info.appendChild(grid);
    if (v.special) {
      const special = el('div', { class: 'chess-explorer__special' });
      special.appendChild(el('span', { class: 'chess-explorer__cell-label' }, 'Special'));
      special.appendChild(el('span', { class: 'chess-explorer__cell-value' }, v.special));
      info.appendChild(special);
    }
    body.appendChild(info);

    const embedWrap = el('div', { class: 'chess-explorer__embed' });
    const iframe = document.createElement('iframe');
    const dims = v.board.split('×').map(Number);
    const cols = dims[0] || 8;
    const rows = dims[1] || 8;
    iframe.src = CHESS_BASE + '?variant=' + v.key + '&embed=1&theme=light&radius=8px&boardonly=1&mode=solo';
    iframe.className = 'chess-explorer__iframe';
    iframe.style.aspectRatio = cols + ' / ' + rows;
    iframe.setAttribute('title', 'Play ' + v.name);
    iframe.setAttribute('scrolling', 'no');
    embedWrap.appendChild(iframe);
    body.appendChild(embedWrap);
  }

  function makeInfoCell(label, value) {
    const cell = el('div', { class: 'chess-explorer__cell' });
    cell.appendChild(el('span', { class: 'chess-explorer__cell-label' }, label));
    cell.appendChild(el('span', { class: 'chess-explorer__cell-value' }, value));
    return cell;
  }

  renderExplorer();

  const countEl = document.getElementById('variant-count');
  if (countEl) countEl.textContent = VARIANTS.length;
});

(function() {
  const body = document.getElementById('chess-puzzle-body');
  let puzzleData = null;

  function renderPuzzle() {
    body.innerHTML = '';
    if (!puzzleData) {
      body.appendChild(el('div', { class: 'chess-puzzle__loading' }, 'Loading puzzle...'));
      return;
    }
    const p = puzzleData;
    const meta = el('div', { class: 'chess-puzzle__meta' });
    if (p.variant) meta.appendChild(el('span', { class: 'chess-puzzle__tag' }, p.variant));
    if (p.type) meta.appendChild(el('span', { class: 'chess-puzzle__tag' }, p.type));
    if (p.rating) meta.appendChild(el('span', { class: 'chess-puzzle__tag' }, 'Rating: ' + p.rating));
    body.appendChild(meta);

    if (p.svg) {
      const board = el('div', { class: 'chess-puzzle__board' });
      board.innerHTML = p.svg;
      body.appendChild(board);
    }

    if (p.fen) {
      const fen = el('div', { class: 'chess-puzzle__fen' });
      fen.appendChild(el('span', { class: 'chess-puzzle__fen-label' }, 'FEN'));
      fen.appendChild(el('code', { class: 'chess-puzzle__fen-value' }, p.fen));
      body.appendChild(fen);
    }

    const hint = el('div', { class: 'chess-puzzle__hint' });
    hint.appendChild(el('span', {}, p.toMove ? p.toMove + ' to move.' : 'Find the best move.'));
    body.appendChild(hint);

    if (p.solution) {
      const solBtn = btn('Show solution', 'outline-light', function() {
        solBtn.replaceWith(el('div', { class: 'chess-puzzle__solution' }, p.solution));
      });
      body.appendChild(solBtn);
    }

    body.appendChild(btn('New puzzle', 'blue', loadPuzzle));
  }

  async function loadPuzzle() {
    puzzleData = null;
    renderPuzzle();
    try {
      const res = await fetch(API_BASE + '/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'chess_generate_puzzle', args: { include_svg: true } })
      });
      const json = await res.json();
      puzzleData = json.result || json;
      renderPuzzle();
    } catch (e) {
      body.innerHTML = '';
      body.appendChild(el('div', { class: 'chess-puzzle__error' }, 'Could not load puzzle. Try again.'));
      body.appendChild(btn('Retry', 'blue', loadPuzzle));
    }
  }

  loadPuzzle();
})();

(function() {
  const body = document.getElementById('chess-analyzer-body');

  const form = el('div', { class: 'chess-analyzer__form' });
  const fenInput = document.createElement('input');
  fenInput.type = 'text';
  fenInput.className = 'chess-analyzer__input';
  fenInput.placeholder = 'Paste FEN (or leave empty for starting position)';
  form.appendChild(fenInput);

  const varRow = el('div', { class: 'chess-analyzer__row' });
  varRow.appendChild(el('span', { class: 'chess-analyzer__label' }, 'Variant:'));
  const varInput = document.createElement('input');
  varInput.type = 'text';
  varInput.className = 'chess-analyzer__input chess-analyzer__input--small';
  varInput.placeholder = 'standard';
  varInput.value = 'standard';
  varRow.appendChild(varInput);
  form.appendChild(varRow);

  form.appendChild(btn('Analyze', 'red', runAnalysis));
  body.appendChild(form);

  const resultArea = el('div', { class: 'chess-analyzer__result', id: 'analyzer-result' });
  body.appendChild(resultArea);

  async function runAnalysis() {
    const result = document.getElementById('analyzer-result');
    result.innerHTML = '<div class="chess-analyzer__loading">Analyzing...</div>';
    const fen = fenInput.value.trim() || undefined;
    const variant = varInput.value.trim() || 'standard';

    try {
      const evalRes = await fetch(API_BASE + '/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'chess_analyze_position', args: { variant, fen, depth: 4 } })
      });
      const evaluation = await evalRes.json();
      const movesRes = await fetch(API_BASE + '/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'chess_get_legal_moves', args: { variant, fen } })
      });
      const moves = await movesRes.json();

      result.innerHTML = '';
      const movesData = moves.result || moves;
      const evalData = evaluation.result || evaluation;

      const bestMove = evalData.bestMove || '';
      const highlights = bestMove ? [bestMove.slice(0, 2), bestMove.slice(2, 4)] : [];

      const svgRes = await fetch(API_BASE + '/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'chess_render_svg', args: { variant, fen, highlights } })
      });
      const svgJson = await svgRes.json();
      const svgData = svgJson.result || svgJson;
      if (svgData.svg) {
        const board = el('div', { class: 'chess-analyzer__board' });
        board.innerHTML = svgData.svg;
        result.appendChild(board);
      }

      if (evalData.evaluation !== undefined || evalData.score !== undefined) {
        const evalBlock = el('div', { class: 'chess-analyzer__eval' });
        const score = evalData.evaluation || evalData.score || '0';
        evalBlock.appendChild(el('span', { class: 'chess-analyzer__eval-label' }, 'Evaluation'));
        evalBlock.appendChild(el('span', { class: 'chess-analyzer__eval-score' }, String(score)));
        if (bestMove) {
          evalBlock.appendChild(el('span', { class: 'chess-analyzer__eval-best' }, 'Best: ' + bestMove));
        }
        result.appendChild(evalBlock);
      }

      if (movesData.moves && movesData.moves.length) {
        const movesBlock = el('div', { class: 'chess-analyzer__moves' });
        movesBlock.appendChild(el('div', { class: 'chess-analyzer__moves-label' }, movesData.moves.length + ' legal moves'));
        const movesList = el('div', { class: 'chess-analyzer__moves-list' });
        const moveStrings = movesData.moves.slice(0, 30).map(m => typeof m === 'string' ? m : m.move || JSON.stringify(m));
        movesList.textContent = moveStrings.join(', ') + (movesData.moves.length > 30 ? '...' : '');
        movesBlock.appendChild(movesList);
        result.appendChild(movesBlock);
      }

      if (!result.children.length) {
        result.appendChild(el('pre', { class: 'chess-analyzer__raw' }, JSON.stringify({ moves: movesData, eval: evalData }, null, 2)));
      }
    } catch (e) {
      result.innerHTML = '';
      result.appendChild(el('div', { class: 'chess-analyzer__error' }, 'Analysis failed: ' + e.message));
    }
  }
})();

const engineBtns = document.getElementById('engine-btns');
if (engineBtns) {
  engineBtns.appendChild(linkBtn('Moddable Chess', '/engines/moddable-chess/', 'primary'));
  const srcBtn = linkBtn('View Source', 'https://github.com/Moddable-Games/moddable-chess', 'dark');
  engineBtns.appendChild(srcBtn);
}


