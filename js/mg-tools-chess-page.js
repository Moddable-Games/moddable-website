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
    iframe.src = CHESS_BASE + '?variant=' + v.key + '&embed=1&theme=light&radius=0&boardonly=1&mode=solo';
    iframe.className = 'chess-explorer__iframe';
    iframe.style.aspectRatio = cols + ' / ' + rows;
    iframe.setAttribute('title', 'Play ' + v.name);
    iframe.setAttribute('scrolling', 'no');
    embedWrap.appendChild(iframe);
    body.appendChild(embedWrap);

    const statusBar = el('div', { class: 'chess-explorer__status', id: 'explorer-status' }, 'White to move');
    body.appendChild(statusBar);

    const analyzeToggle = el('details', { class: 'chess-explorer__analyze' });
    const summary = el('summary', { class: 'chess-explorer__analyze-summary' }, 'Analyze a position');
    analyzeToggle.appendChild(summary);

    const analyzeForm = el('div', { class: 'chess-explorer__analyze-form' });
    const fenInput = document.createElement('input');
    fenInput.type = 'text';
    fenInput.className = 'chess-explorer__analyze-input';
    fenInput.placeholder = 'Paste FEN (or leave empty for starting position)';
    analyzeForm.appendChild(fenInput);
    analyzeForm.appendChild(btn('Analyze', 'red', function() { runAnalysis(v.key, fenInput.value.trim()); }));
    analyzeToggle.appendChild(analyzeForm);

    const analyzeResult = el('div', { class: 'chess-explorer__analyze-result', id: 'analyzer-result' });
    analyzeToggle.appendChild(analyzeResult);
    body.appendChild(analyzeToggle);
  }

  async function runAnalysis(variant, fen) {
    const result = document.getElementById('analyzer-result');
    result.innerHTML = '<div class="chess-analyzer__loading">Analyzing...</div>';
    const fenArg = fen || undefined;

    try {
      const evalRes = await fetch(API_BASE + '/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'chess_analyze_position', args: { variant, fen: fenArg, depth: 4 } })
      });
      const evaluation = await evalRes.json();
      const movesRes = await fetch(API_BASE + '/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'chess_get_legal_moves', args: { variant, fen: fenArg } })
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
        body: JSON.stringify({ tool: 'chess_render_svg', args: { variant, fen: fenArg, highlights } })
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

  function makeInfoCell(label, value) {
    const cell = el('div', { class: 'chess-explorer__cell' });
    cell.appendChild(el('span', { class: 'chess-explorer__cell-label' }, label));
    cell.appendChild(el('span', { class: 'chess-explorer__cell-value' }, value));
    return cell;
  }

  renderExplorer();

  window.addEventListener('message', function(e) {
    if (!e.data || e.data.type !== 'chess:status') return;
    const statusEl = document.getElementById('explorer-status');
    if (statusEl) statusEl.textContent = e.data.text;
  });

  const countEl = document.getElementById('variant-count');
  if (countEl) countEl.textContent = VARIANTS.length;
});

(function() {
  const body = document.getElementById('chess-puzzle-body');
  let allPuzzles = [];
  let variants = [];
  let variantInfo = {};
  let currentVariant = '';
  let filtered = [];
  let currentIdx = 0;
  let svgCache = {};

  function keyToSlug(key) {
    return key.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  }

  async function init() {
    body.innerHTML = '';
    body.appendChild(el('div', { class: 'chess-puzzle__loading' }, 'Loading puzzles...'));
    try {
      const [raw, varData] = await Promise.all([
        data.get('puzzles-variants'),
        data.get('chess-variants')
      ]);
      allPuzzles = raw.puzzles || raw;
      varData.forEach(function(v) {
        const key = v.key || slugToKey(v.slug);
        variantInfo[key] = { special: v.special || '', win: v.win || '', board: v.board || '' };
      });
      const varSet = new Set(allPuzzles.map(p => p.variant));
      variants = Array.from(varSet).sort();
      currentVariant = '';
      applyFilter();
      render();
    } catch (e) {
      body.innerHTML = '';
      body.appendChild(el('div', { class: 'chess-puzzle__error' }, 'Could not load puzzles.'));
    }
  }

  function applyFilter() {
    filtered = currentVariant
      ? allPuzzles.filter(p => p.variant === currentVariant)
      : allPuzzles;
    currentIdx = 0;
  }

  function variantLabel(key) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim();
  }

  function render() {
    body.innerHTML = '';

    const controls = el('div', { class: 'chess-puzzle__controls' });
    const sel = document.createElement('select');
    sel.className = 'chess-puzzle__select';
    const allOpt = document.createElement('option');
    allOpt.value = '';
    allOpt.textContent = 'All variants (' + allPuzzles.length + ')';
    if (!currentVariant) allOpt.selected = true;
    sel.appendChild(allOpt);
    variants.forEach(function(v) {
      const count = allPuzzles.filter(p => p.variant === v).length;
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = variantLabel(v) + ' (' + count + ')';
      if (v === currentVariant) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', function() {
      currentVariant = sel.value;
      applyFilter();
      render();
      loadBoard();
      if (track) track('puzzle_variant_select', { variant: currentVariant || 'all' });
    });
    controls.appendChild(sel);
    body.appendChild(controls);

    if (!filtered.length) {
      body.appendChild(el('div', { class: 'chess-puzzle__loading' }, 'No puzzles found.'));
      return;
    }

    const p = filtered[currentIdx];

    const meta = el('div', { class: 'chess-puzzle__meta' });
    meta.appendChild(el('span', { class: 'chess-puzzle__tag' }, variantLabel(p.variant)));
    if (p.puzzleType) meta.appendChild(el('span', { class: 'chess-puzzle__tag chess-puzzle__tag--type' }, p.puzzleType));
    if (p.rating) meta.appendChild(el('span', { class: 'chess-puzzle__tag' }, 'Rating: ' + p.rating));
    body.appendChild(meta);

    const info = variantInfo[p.variant];
    if (info && info.special) {
      body.appendChild(el('div', { class: 'chess-puzzle__variant-desc' }, info.special));
    }

    const boardWrap = el('div', { class: 'chess-puzzle__board', id: 'puzzle-board' });
    const cached = svgCache[p.id];
    if (cached) {
      boardWrap.innerHTML = cached;
    } else {
      boardWrap.appendChild(el('div', { class: 'chess-puzzle__loading' }, 'Rendering board...'));
    }
    body.appendChild(boardWrap);

    if (p.fen) {
      const fen = el('div', { class: 'chess-puzzle__fen' });
      fen.appendChild(el('span', { class: 'chess-puzzle__fen-label' }, 'FEN'));
      fen.appendChild(el('code', { class: 'chess-puzzle__fen-value' }, p.fen));
      body.appendChild(fen);
    }

    const toMove = p.fen ? (p.fen.split(' ')[1] === 'w' ? 'White' : 'Black') : '';
    const hint = el('div', { class: 'chess-puzzle__hint' });
    hint.appendChild(el('span', {}, toMove ? toMove + ' to move. Find the winning move.' : 'Find the winning move.'));
    body.appendChild(hint);

    const solWrap = el('div', { class: 'chess-puzzle__sol-wrap' });
    const solBtn = btn('Show solution', 'outline-light', function() {
      const moves = Array.isArray(p.solution) ? p.solution.join(', ') : p.solution;
      solBtn.replaceWith(el('div', { class: 'chess-puzzle__solution' }, moves));
      loadBoardWithHighlight(p);
    });
    solWrap.appendChild(solBtn);
    body.appendChild(solWrap);

    const nav = el('div', { class: 'chess-puzzle__nav' });
    const prevBtn = btn('Prev', 'outline-light', function() {
      currentIdx = (currentIdx - 1 + filtered.length) % filtered.length;
      render();
      loadBoard();
    });
    const counter = el('span', { class: 'chess-puzzle__counter' }, (currentIdx + 1) + ' / ' + filtered.length);
    const nextBtn = btn('Next', 'outline-light', function() {
      currentIdx = (currentIdx + 1) % filtered.length;
      render();
      loadBoard();
    });
    nav.appendChild(prevBtn);
    nav.appendChild(counter);
    nav.appendChild(nextBtn);
    body.appendChild(nav);

    if (!cached) loadBoard();
  }

  async function loadBoard() {
    const p = filtered[currentIdx];
    if (!p || svgCache[p.id]) return;
    try {
      const res = await fetch(API_BASE + '/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'chess_render_svg', args: { variant: p.variant, fen: p.fen } })
      });
      const json = await res.json();
      const svg = (json.result || json).svg;
      if (svg) {
        svgCache[p.id] = svg;
        const boardEl = document.getElementById('puzzle-board');
        if (boardEl && filtered[currentIdx] && filtered[currentIdx].id === p.id) {
          boardEl.innerHTML = svg;
        }
      }
    } catch (e) {}
  }

  async function loadBoardWithHighlight(p) {
    const move = Array.isArray(p.solution) ? p.solution[0] : p.solution;
    if (!move) return;
    const highlights = [move.slice(0, 2), move.slice(2, 4)];
    try {
      const res = await fetch(API_BASE + '/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'chess_render_svg', args: { variant: p.variant, fen: p.fen, highlights } })
      });
      const json = await res.json();
      const svg = (json.result || json).svg;
      if (svg) {
        const boardEl = document.getElementById('puzzle-board');
        if (boardEl) boardEl.innerHTML = svg;
      }
    } catch (e) {}
  }

  init();
})();


const engineBtns = document.getElementById('engine-btns');
if (engineBtns) {
  engineBtns.appendChild(linkBtn('Moddable Chess', '/engines/moddable-chess/', 'primary'));
  const srcBtn = linkBtn('View Source', 'https://github.com/Moddable-Games/moddable-chess', 'dark');
  engineBtns.appendChild(srcBtn);
}


