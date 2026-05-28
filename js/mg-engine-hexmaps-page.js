(function() {
var el = MG.el;
var linkBtn = MG.linkBtn;
var url = MG.url;
var T = MG.T;

document.getElementById('nav-root').appendChild(MG.navbar('Engines'));
document.getElementById('footer-root').appendChild(MG.footer());

document.querySelector('[data-gradient]').style.background = 'linear-gradient(180deg,#0a0d2a 0%,#1a4a20 40%,#000 100%)';
document.querySelector('[data-hex]').style.backgroundImage = "url('" + url('/img/hex-grid-green.svg') + "')";
document.querySelector('[data-accent]').style.background = T.green;
document.querySelector('[data-bloom]').style.background = 'radial-gradient(ellipse,rgba(58,153,40,0.35) 0%,transparent 65%)';

var heroLogo = document.querySelector('.game-hero__logo');
heroLogo.src = url('/img/moddable-hexmaps-cube.svg');
heroLogo.alt = 'Moddable Hexmaps';

var genLink = linkBtn('Generate maps', 'https://hex.moddable.games/generate/', 'green');
genLink.setAttribute('target', '_blank');
genLink.setAttribute('rel', 'noopener');
document.getElementById('hero-btns').appendChild(genLink);
var ghLink = linkBtn('GitHub', 'https://github.com/Moddable-Games/moddable-hexmaps', 'outline-dark');
ghLink.setAttribute('target', '_blank');
ghLink.setAttribute('rel', 'noopener');
document.getElementById('hero-btns').appendChild(ghLink);

var STATS = [
  ['Games', '4'],
  ['Renderer', 'Canvas'],
  ['Styles', '3'],
  ['Seeds', '∞'],
  ['Export', 'JSON'],
  ['Status', 'Live']
];
var sb = document.getElementById('stats-bar');
STATS.forEach(function(pair, i) {
  if (i > 0) sb.appendChild(el('span', { class: 'stats-row__divider' }));
  var d = el('div', { class: 'stats-row__item' });
  d.appendChild(el('span', { class: 'stats-row__label' }, pair[0]));
  d.appendChild(el('span', { class: 'stats-row__value' }, pair[1]));
  sb.appendChild(d);
});

var GAMES = [
  {
    n: '01',
    title: 'Nukes',
    body: 'Cold-war hex maps with land, sea, and contested territories. Three superpowers carving up the world.',
    href: '/games/nukes/'
  },
  {
    n: '02',
    title: 'Talisman: Hexed',
    body: 'Fantasy adventure on hex terrain. Inner, middle, and outer rings with terrain-specific encounters.',
    href: '/mods/talisman-hexed/'
  },
  {
    n: '03',
    title: 'Colony',
    body: 'Resource extraction on alien worlds. Procedural hex terrain with biomes, hazards, and contested mining sites.',
    href: 'https://hex.moddable.games/colony/',
    external: true
  },
  {
    n: '04',
    title: 'Twilight Imperium',
    body: 'Galactic hex maps from the TI4 tile pool. Balanced placement for competitive play.',
    href: '/tools/ti/'
  }
];
var gg = document.getElementById('games-grid');
GAMES.forEach(function(g) {
  var a = el('article', { class: 'mg-card' });
  a.appendChild(el('div', { class: 'mg-card__eyebrow mg-eyebrow--green' }, g.n));
  a.appendChild(el('h3', { class: 'mg-card__title' }, g.title));
  a.appendChild(el('p', { class: 'mg-card__body' }, g.body));
  if (g.href) {
    var attrs = { href: g.external ? g.href : url(g.href), class: 'mg-card__link' };
    if (g.external) { attrs.target = '_blank'; attrs.rel = 'noopener'; }
    var link = el('a', attrs);
    link.textContent = 'View game →';
    a.appendChild(link);
  }
  gg.appendChild(a);
});

var FEATURES = ['Canvas renderer', 'Seeded RNG', 'JSON export', 'Editor mode', 'URL sharing'];
var ef = document.getElementById('engine-features');
FEATURES.forEach(function(f) {
  ef.appendChild(el('span', { class: 'mg-dark-center__pill' }, f));
});

var tryBtn = linkBtn('Try the generator', 'https://hex.moddable.games/generate/', 'green');
tryBtn.setAttribute('target', '_blank');
tryBtn.setAttribute('rel', 'noopener');
document.getElementById('engine-cta').appendChild(tryBtn);
var docsBtn = linkBtn('Read the docs', 'https://hex.moddable.games/docs/', 'outline-dark');
docsBtn.setAttribute('target', '_blank');
docsBtn.setAttribute('rel', 'noopener');
document.getElementById('engine-cta').appendChild(docsBtn);

var STYLES = [
  { title: 'Classic', body: 'Flat-colour hexes with clean borders. Fast to render, easy to read at any zoom level.' },
  { title: 'Artistic', body: 'Hand-painted tile images for each terrain type. Immersive but heavier on assets.' },
  { title: 'ASCII', body: 'Monospace character rendering. Lightweight, printable, and nostalgic.' }
];
var sg = document.getElementById('styles-grid');
STYLES.forEach(function(s) {
  var card = el('article', { class: 'mg-card' });
  card.appendChild(el('h3', { class: 'mg-card__title' }, s.title));
  card.appendChild(el('p', { class: 'mg-card__body' }, s.body));
  sg.appendChild(card);
});

var CONSUMERS = [
  { title: 'Nukes', desc: 'Cold-war territory control on a hex map. Three superpowers, fifteen turns, one button that ends everything.', href: '/games/nukes/', accent: T.red },
  { title: 'Colony', desc: 'Resource extraction on alien worlds. Procedural terrain with biomes, hazards, and contested mining sites.', href: 'https://hex.moddable.games/colony/', accent: T.green, external: true },
  { title: 'TI4 Map Generator', desc: 'Balanced galactic hex maps from the full Twilight Imperium tile pool.', href: '/tools/ti/', accent: T.blue },
  { title: 'Talisman Tools', desc: 'Fantasy hex board generator with inner, middle, and outer ring terrain.', href: '/tools/talisman/', accent: T.green }
];
var cg = document.getElementById('consumers-grid');
CONSUMERS.forEach(function(c) {
  var attrs = { href: c.external ? c.href : url(c.href), class: 'mg-card mg-lift', 'data-reveal': 'up' };
  if (c.external) { attrs.target = '_blank'; attrs.rel = 'noopener'; }
  var card = el('a', attrs);
  card.style.borderTop = '3px solid ' + c.accent;
  card.style.textDecoration = 'none';
  card.appendChild(el('h3', { class: 'mg-card__title' }, c.title));
  card.appendChild(el('p', { class: 'mg-card__body' }, c.desc));
  var link = el('span', { class: 'mg-card__link' });
  link.style.color = c.accent;
  link.textContent = 'Explore →';
  card.appendChild(link);
  cg.appendChild(card);
});
MG.initReveal();
})();
