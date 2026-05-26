(function() {
const { T, el, btn, navbar, footer, data } = MG;
document.getElementById('nav-root').appendChild(navbar('Tools'));
document.getElementById('footer-root').appendChild(footer());

function slugToKey(slug) {
  return slug.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

data.get('chess-variants').then(function(raw) {
  const VARIANTS = raw
    .sort((a, b) => a.order - b.order)
    .map(v => ({
      name: v.title,
      players: v.players,
      board: v.board,
      win: v.win,
      special: v.special,
      key: v.key || slugToKey(v.slug),
    }));

  let currentIdx = Math.floor(Math.random() * VARIANTS.length);

  function renderPicker() {
    const wrap = document.getElementById('chess-picker');
    wrap.innerHTML = '';

    const display = el('div', { class: 'variant-display' });
    const v = VARIANTS[currentIdx];
    display.appendChild(el('div', { class: 'variant-display__name' }, v.name));
    const meta = el('div', { class: 'variant-display__meta' });
    meta.appendChild(el('span', {}, v.players + ' players'));
    meta.appendChild(el('span', {}, v.board));
    display.appendChild(meta);
    wrap.appendChild(display);

    wrap.appendChild(btn('Next variant', 'dark', function() {
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
    var fields = [
      ['Board', v.board],
      ['Players', v.players],
      ['Win', v.win],
      ['Special', v.special],
    ];
    fields.forEach(function(pair) {
      grid.appendChild(el('div', { class: 'rules-ref__label' }, pair[0]));
      grid.appendChild(el('div', { class: 'rules-ref__value' }, pair[1]));
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
    VARIANTS.forEach(function(v, i) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = v.name;
      if (i === currentIdx) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', function() {
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
    [['solo', 'vs AI'], ['pass', 'Pass & Play']].forEach(function(pair) {
      const opt = document.createElement('option');
      opt.value = pair[0]; opt.textContent = pair[1];
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

    form.appendChild(btn('Start Match', 'blue', function() {
      const v = VARIANTS[currentIdx];
      if (!v.key) return;
      const mode = document.getElementById('mode-select').value;
      const p1Name = (document.getElementById('p1-name').value.trim()) || 'White';
      const p2Name = mode === 'solo' ? 'AI' : ((document.getElementById('p2-name').value.trim()) || 'Black');
      const boardSection = document.getElementById('chess-embed-wrap');
      boardSection.classList.remove('chess-embed--hidden');
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

  var countEl = document.getElementById('variant-count');
  if (countEl) countEl.textContent = VARIANTS.length;

  renderPicker();
  renderRules();
  renderMatch();
});

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
