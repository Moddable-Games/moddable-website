(function() {
const { T, el, btn, navbar, footer } = MG;
document.getElementById('nav-root').appendChild(navbar('About'));
document.getElementById('footer-root').appendChild(footer());

/* ── FACT SHEET ── */
const stats = [
  { value: '2024', label: 'Founded' },
  { value: 'KL', label: 'Location' },
  { value: '4', label: 'Team' },
  { value: '5', label: 'Games' },
  { value: '13', label: 'Mods' },
  { value: 'Pre-seed', label: 'Stage' },
];

const statsWrap = document.getElementById('press-stats');
const grid = el('div', { class: 'press-stats' });
stats.forEach(s => {
  const stat = el('div', { class: 'press-stat' });
  stat.appendChild(el('div', { class: 'press-stat__value' }, s.value));
  stat.appendChild(el('div', { class: 'press-stat__label' }, s.label));
  grid.appendChild(stat);
});
statsWrap.appendChild(grid);

/* ── BRAND COLOURS ── */
const colours = [
  { name: 'Red', hex: T.red },
  { name: 'Green', hex: T.green },
  { name: 'Blue', hex: T.blue },
  { name: 'Deep', hex: T.cosmicDeep },
  { name: 'Mid', hex: T.cosmicMid },
  { name: 'Glow', hex: T.cosmicGlow },
  { name: 'Canvas', hex: T.canvasLight },
  { name: 'Ink', hex: T.ink },
];

const swatchWrap = document.getElementById('press-swatches');
const swatches = el('div', { class: 'press-swatches' });
colours.forEach(c => {
  const swatch = el('div', { class: 'press-swatch' });
  const color = el('div', { class: 'press-swatch__color' });
  color.style.backgroundColor = c.hex;
  swatch.appendChild(color);
  swatch.appendChild(el('div', { class: 'press-swatch__hex' }, c.hex));
  swatch.appendChild(el('div', { class: 'press-swatch__name' }, c.name));
  swatches.appendChild(swatch);
});
swatchWrap.appendChild(swatches);

/* ── ASSET PREVIEWS ── */
const assets = [
  { label: 'Logo (dark)', bg: T.cosmicDeep },
  { label: 'Logo (light)', bg: T.canvasLight },
  { label: 'Nukes icon', bg: T.red },
  { label: 'Dungeon Chess', bg: T.green },
  { label: 'Cube mark', bg: T.cosmicMid },
  { label: 'Wordmark', bg: T.ink },
];

const assetWrap = document.getElementById('press-assets');
const assetGrid = el('div', { class: 'press-assets' });
assets.forEach(a => {
  const tile = el('div', { class: 'press-asset' });
  const preview = el('div', { class: 'press-asset__preview' }, 'SVG');
  preview.style.backgroundColor = a.bg;
  tile.appendChild(preview);
  tile.appendChild(el('div', { class: 'press-asset__label' }, a.label));
  assetGrid.appendChild(tile);
});
assetWrap.appendChild(assetGrid);

/* ── COPY EMAIL ── */
const copyBtn = btn('Copy email', 'outline-dark', () => {
  navigator.clipboard.writeText('press@moddable.games').then(() => {
    const msg = document.getElementById('press-copied');
    msg.classList.add('press-copied--show');
    setTimeout(() => msg.classList.remove('press-copied--show'), 2000);
  });
});
document.getElementById('press-copy-btn').appendChild(copyBtn);
})();
