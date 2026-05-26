(function() {
const { T, el, linkBtn, navbar, footer, url, rulesUrl } = MG;
document.getElementById('nav-root').appendChild(navbar('Games'));
document.getElementById('footer-root').appendChild(footer());

// 3D Hero cube (Three.js)
(function(){
  const container = document.getElementById('hero-cube');
  const w = container.clientWidth || 260, h = container.clientHeight || 260;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, w/h, 0.1, 100);
  camera.position.set(0, 0, 5.2);
  const renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const geo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
  const mats = [
    new THREE.MeshStandardMaterial({color:0x0c4f8d, metalness:0.3, roughness:0.4}),
    new THREE.MeshStandardMaterial({color:0x0c4f8d, metalness:0.3, roughness:0.4}),
    new THREE.MeshStandardMaterial({color:0xd11a1a, metalness:0.3, roughness:0.4}),
    new THREE.MeshStandardMaterial({color:0xd11a1a, metalness:0.3, roughness:0.4}),
    new THREE.MeshStandardMaterial({color:0x3a9928, metalness:0.3, roughness:0.4}),
    new THREE.MeshStandardMaterial({color:0x3a9928, metalness:0.3, roughness:0.4}),
  ];
  const cube = new THREE.Mesh(geo, mats);
  scene.add(cube);

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geo),
    new THREE.LineBasicMaterial({color:0xffffff, transparent:true, opacity:0.3})
  );
  cube.add(edges);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dir = new THREE.DirectionalLight(0x6fb5ff, 1.2);
  dir.position.set(2, 3, 4);
  scene.add(dir);

  function animate(){
    requestAnimationFrame(animate);
    cube.rotation.y += 0.008;
    cube.rotation.x += 0.003;
    renderer.render(scene, camera);
  }
  animate();
})();

document.querySelector('[data-gradient]').style.background = 'linear-gradient(180deg,#0a0d2a 0%,#0c2e5a 40%,#000 100%)';
document.querySelector('[data-hex]').style.backgroundImage = `url('../../img/hex-grid-blue.svg')`;
document.querySelector('[data-accent]').style.background = T.blue;
document.querySelector('[data-color]').style.color = '#6fb5ff';
document.querySelector('[data-color]').style.textShadow = '0 0 8px rgba(111,181,255,0.5)';
document.querySelector('[data-bloom]').style.background = 'radial-gradient(ellipse,rgba(12,79,141,0.35) 0%,transparent 65%)';

const playLink = linkBtn('Play now','https://chess.moddable.games/play/','blue');
playLink.setAttribute('target','_blank'); playLink.setAttribute('rel','noopener');
document.getElementById('hero-btns').appendChild(playLink);
document.getElementById('hero-btns').appendChild(linkBtn('Browse variants','/tools/chess/','outline-dark'));

const STATS = [['Variants','39'],['Players','2–6'],['Status','Open alpha'],['Engine','v0.4.2'],['Board types','Square · 7×7 to 12×8'],['Updated','May 2026']];
const sb = document.getElementById('stats-bar');
STATS.forEach(([k,v],i) => {
  if(i>0) sb.appendChild(el('span',{class:'stats-row__divider'}));
  const d = el('div',{class:'stats-row__item'});
  d.appendChild(el('span',{class:'stats-row__label'},k));
  d.appendChild(el('span',{class:'stats-row__value'},v));
  sb.appendChild(d);
});

const VARIANTS = [
  {n:'01', title:'Standard + Classics',   body:'Regular chess plus Fischer Random, No Castling, and Torpedo — familiar rules with one twist each.'},
  {n:'02', title:'Alternate Win Conditions', body:'King of the Hill, Three-Check, Racing Kings, Extinction — different paths to victory.'},
  {n:'03', title:'Chaos Variants',        body:'Atomic, Duck Chess, Fog of War, Horde, Rifle — explosive mechanics that shatter standard strategy.'},
  {n:'04', title:'Big Boards',            body:'Capablanca (10×8), Grand (10×10), Courier (12×8) — wider boards with fairy pieces. Plus Breakthrough on 7×7.'},
  {n:'05', title:'Asymmetric',            body:'Maharaja & Sepoys, Antichess, Marseillais — unequal forces or unequal turns. Mind-bending.'},
  {n:'06', title:'Dungeon Chess',         body:'Our original variant — four asymmetric species, XP drafting, cannon mechanics, and modular dungeon boards. Now its own standalone game.', href:'/games/dungeon-chess/'},
];
const vg = document.getElementById('variants-grid');
VARIANTS.forEach(s => {
  const a = el('article',{class:'mg-card'});
  a.appendChild(el('div',{class:'mg-card__eyebrow mg-eyebrow--blue'},`${s.n}`));
  a.appendChild(el('h3',{class:'mg-card__title'},s.title));
  a.appendChild(el('p',{class:'mg-card__body'},s.body));
  if(s.href) {
    const link = el('a',{href:s.href,class:'mg-card__link'});
    link.textContent = 'Learn more →';
    a.appendChild(link);
  }
  vg.appendChild(a);
});

const FEATURES = ['Private sessions','Cross-device','Async play'];
const ef = document.getElementById('engine-features');
FEATURES.forEach(f => {
  ef.appendChild(el('span',{class:'mg-dark-center__pill'},f));
});

const tryBtn = linkBtn('Try the engine','https://chess.moddable.games/play/','blue');
tryBtn.setAttribute('target','_blank'); tryBtn.setAttribute('rel','noopener');
document.getElementById('engine-cta').appendChild(tryBtn);
const ghBtn = linkBtn('View on GitHub','https://github.com/Moddable-Games/moddable-chess','outline-dark');
ghBtn.setAttribute('target','_blank'); ghBtn.setAttribute('rel','noopener');
document.getElementById('engine-cta').appendChild(ghBtn);

const HOOKS = [
  {name:'board.lua',      desc:'Board geometry — square, hex, or anything. Define the grid, valid positions, and rendering rules.'},
  {name:'pieces.yaml',    desc:'Every piece type with movement patterns, capture rules, and promotion conditions. Add new pieces or modify existing ones.'},
  {name:'variants.yaml',  desc:'The variant registry. Combine a board, piece set, and win condition to define a new way to play.'},
  {name:'ai.lua',         desc:'Bot behavior for each variant. The teaching engine learns from every game played — human or bot.'},
];
const hg = document.getElementById('hooks-grid');
HOOKS.forEach(h => {
  const d = el('div',{class:'mg-card mg-card--row'});
  const icon = el('div',{class:'mg-card__icon'});
  icon.style.background = T.blue;
  icon.textContent = '◈';
  d.appendChild(icon);
  const txt = el('div');
  const title = el('div',{class:'mg-card__mono-title'});
  title.style.color = T.blue;
  title.textContent = h.name;
  txt.appendChild(title);
  txt.appendChild(el('div',{class:'mg-card__desc'},h.desc));
  d.appendChild(txt); hg.appendChild(d);
});

// Community mods
const COMM = [
  {category:'Total conversion',baseGame:'Chess',title:'Fog of War Chess',body:'See only squares your pieces can move to. No checks — capture the king to win.',stats:'2 players · 20–40 min · 10+',href:url('/mods/fog-of-war-chess/')},
  {category:'Reskin',baseGame:'Chess',title:'4-Player Chess',body:'Four players, four armies, one board. Free-for-all or teams.',stats:'4 players · 30 min · 10+',href:url('/mods/4-player-chess/')},
  {category:'Total conversion',baseGame:'Chess',title:'Hexagonal Chess (Glinski)',body:'Chess on 91 hexagonal cells. Three colours, six directions.',stats:'2 players · 30 min · 10+',href:url('/mods/hexagonal-chess/')},
];
const cg = document.getElementById('comm-grid');
COMM.forEach(m => cg.appendChild(MG.modCard(m)));
})();
