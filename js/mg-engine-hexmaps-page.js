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

var genLink = linkBtn('Generate maps', 'https://hex.moddable.games/generate/', 'green');
genLink.setAttribute('target', '_blank');
genLink.setAttribute('rel', 'noopener');
document.getElementById('hero-btns').appendChild(genLink);
var ghLink = linkBtn('GitHub', 'https://github.com/Moddable-Games/moddable-hexmaps', 'outline-dark');
ghLink.setAttribute('target', '_blank');
ghLink.setAttribute('rel', 'noopener');
document.getElementById('hero-btns').appendChild(ghLink);

var STATS = [
  ['Games', '3'],
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
    var link = el('a', { href: url(g.href), class: 'mg-card__link' });
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
  { title: 'Nukes', desc: 'Cold-war territory control', href: '/games/nukes/' },
  { title: 'TI4 Map Generator', desc: 'Twilight Imperium tools', href: '/tools/ti/' },
  { title: 'Talisman Tools', desc: 'Hex board generator', href: '/tools/talisman/' }
];
var cg = document.getElementById('consumers-grid');
CONSUMERS.forEach(function(c) {
  var card = el('a', { href: url(c.href), class: 'mg-card mg-lift' });
  card.appendChild(el('h3', { class: 'mg-card__title' }, c.title));
  card.appendChild(el('p', { class: 'mg-card__body' }, c.desc));
  cg.appendChild(card);
});
})();
