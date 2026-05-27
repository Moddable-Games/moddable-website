(function() {
const { T, el, linkBtn, navbar, footer, url } = MG;
document.getElementById('nav-root').appendChild(navbar('Engines'));
document.getElementById('footer-root').appendChild(footer());

document.querySelector('[data-gradient]').style.background = 'linear-gradient(180deg,#0a0d2a 0%,#0c2e5a 40%,#000 100%)';
document.querySelector('[data-hex]').style.backgroundImage = "url('" + url('/img/hex-grid-blue.svg') + "')";
document.querySelector('[data-accent]').style.background = T.blue;
document.querySelector('[data-color]').style.color = '#6fb5ff';
document.querySelector('[data-color]').style.textShadow = '0 0 8px rgba(111,181,255,0.5)';
document.querySelector('[data-bloom]').style.background = 'radial-gradient(ellipse,rgba(12,79,141,0.35) 0%,transparent 65%)';

var playLink = linkBtn('Play now', 'https://chess.moddable.games/play/', 'blue');
playLink.setAttribute('target', '_blank');
playLink.setAttribute('rel', 'noopener');
document.getElementById('hero-btns').appendChild(playLink);
var ghLink = linkBtn('GitHub', 'https://github.com/Moddable-Games/moddable-chess', 'outline-dark');
ghLink.setAttribute('target', '_blank');
ghLink.setAttribute('rel', 'noopener');
document.getElementById('hero-btns').appendChild(ghLink);

var STATS = [
  ['Variants', '39'],
  ['Players', '2–6'],
  ['Status', 'Open alpha'],
  ['Engine', 'v0.4.2'],
  ['Board types', 'Square · 7×7 to 12×8'],
  ['Updated', 'May 2026']
];
var sb = document.getElementById('stats-bar');
STATS.forEach(function(pair, i) {
  if (i > 0) sb.appendChild(el('span', { class: 'stats-row__divider' }));
  var d = el('div', { class: 'stats-row__item' });
  d.appendChild(el('span', { class: 'stats-row__label' }, pair[0]));
  d.appendChild(el('span', { class: 'stats-row__value' }, pair[1]));
  sb.appendChild(d);
});

var VARIANTS = [
  { n: '01', title: 'Standard + Classics', body: 'Regular chess plus Fischer Random, No Castling, and Torpedo — familiar rules with one twist each.' },
  { n: '02', title: 'Alternate Win Conditions', body: 'King of the Hill, Three-Check, Racing Kings, Extinction — different paths to victory.' },
  { n: '03', title: 'Chaos Variants', body: 'Atomic, Duck Chess, Fog of War, Horde, Rifle — explosive mechanics that shatter standard strategy.' },
  { n: '04', title: 'Big Boards', body: 'Capablanca (10×8), Grand (10×10), Courier (12×8) — wider boards with fairy pieces. Plus Breakthrough on 7×7.' },
  { n: '05', title: 'Asymmetric', body: 'Maharaja & Sepoys, Antichess, Marseillais — unequal forces or unequal turns. Mind-bending.' },
  { n: '06', title: 'Dungeon Chess', body: 'Our original variant — four asymmetric species, XP drafting, cannon mechanics, and modular dungeon boards. Now its own standalone game.', href: '/games/dungeon-chess/' }
];
var vg = document.getElementById('variants-grid');
VARIANTS.forEach(function(s) {
  var a = el('article', { class: 'mg-card' });
  a.appendChild(el('div', { class: 'mg-card__eyebrow mg-eyebrow--blue' }, s.n));
  a.appendChild(el('h3', { class: 'mg-card__title' }, s.title));
  a.appendChild(el('p', { class: 'mg-card__body' }, s.body));
  if (s.href) {
    var link = el('a', { href: s.href, class: 'mg-card__link' });
    link.textContent = 'Learn more →';
    a.appendChild(link);
  }
  vg.appendChild(a);
});

var FEATURES = ['Embed API', 'Extension API', 'AI opponent', 'Touch/mobile', 'Theme-aware'];
var ef = document.getElementById('engine-features');
FEATURES.forEach(function(f) {
  ef.appendChild(el('span', { class: 'mg-dark-center__pill' }, f));
});

var tryBtn = linkBtn('Try the engine', 'https://chess.moddable.games/play/', 'blue');
tryBtn.setAttribute('target', '_blank');
tryBtn.setAttribute('rel', 'noopener');
document.getElementById('engine-cta').appendChild(tryBtn);
var docsBtn = linkBtn('Read the docs', 'https://chess.moddable.games/docs/', 'outline-dark');
docsBtn.setAttribute('target', '_blank');
docsBtn.setAttribute('rel', 'noopener');
document.getElementById('engine-cta').appendChild(docsBtn);

var HOOKS = [
  { name: 'Embed API', desc: 'One iframe, full game board. Pass variant, theme, and board-only params. Responsive and touch-ready.' },
  { name: 'Extension API', desc: 'Register custom pieces, terrain types, multi-player turns, and pluggable legality/win conditions.' },
  { name: 'Variant registry', desc: 'YAML-defined variants combine a board geometry, piece set, and win condition into a playable game.' },
  { name: 'AI hooks', desc: 'Minimax engine with configurable depth. Solo mode, Pass & Play, or bot-vs-bot for testing.' }
];
var hg = document.getElementById('hooks-grid');
HOOKS.forEach(function(h) {
  var d = el('div', { class: 'mg-card mg-card--row' });
  var icon = el('div', { class: 'mg-card__icon' });
  icon.style.background = T.blue;
  icon.textContent = '◈';
  d.appendChild(icon);
  var txt = el('div');
  var title = el('div', { class: 'mg-card__mono-title' });
  title.style.color = T.blue;
  title.textContent = h.name;
  txt.appendChild(title);
  txt.appendChild(el('div', { class: 'mg-card__desc' }, h.desc));
  d.appendChild(txt);
  hg.appendChild(d);
});

var cg = document.getElementById('comm-grid');
document.getElementById('comm-heading').textContent = 'Built on this engine';
MG.data.get('chess-variants').then(function(variants) {
  var featured = ['fog-of-war', 'antichess', 'racing-kings'];
  featured.forEach(function(slug) {
    var v = variants.find(function(x) { return x.slug === slug; });
    if (!v) return;
    cg.appendChild(MG.modCard({
      category: 'Total conversion',
      baseGame: 'Chess',
      title: v.title,
      body: v.special,
      stats: v.players + ' players · ' + v.board,
      href: url('/tools/chess/')
    }));
  });
});
})();
