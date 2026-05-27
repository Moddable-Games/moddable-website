(function() {
const { T, el, btn, linkBtn, navbar, footer, modCard, cubeSVG, url } = MG;

// Nav + Footer
document.getElementById('nav-root').appendChild(navbar('Mods'));
document.getElementById('footer-root').appendChild(footer());

// Hero parallax + colour tint cycle + cube + mouse tracking
const heroBgInner = document.getElementById('hero-bg__inner');
const heroSection = document.getElementById('hero');
const heroTint = document.getElementById('hero-tint');
const heroCubeWrap = document.getElementById('hero-cube-wrap');

window.addEventListener('scroll', () => { heroBgInner.style.transform = `translateY(${window.scrollY * -0.3}px)`; }, { passive:true });

// Colour tint cycling on hex-land background (crossfade layers)
(function() {
  const TINTS = [
    'radial-gradient(ellipse at 40% 50%, rgba(12,79,141,0.8) 0%, transparent 60%)',
    'radial-gradient(ellipse at 60% 40%, rgba(209,26,26,0.7) 0%, transparent 60%)',
    'radial-gradient(ellipse at 50% 60%, rgba(58,153,40,0.7) 0%, transparent 60%)',
    'radial-gradient(ellipse at 35% 55%, rgba(111,181,255,0.6) 0%, transparent 55%)',
    'radial-gradient(ellipse at 60% 50%, rgba(209,26,26,0.5) 0%, rgba(58,153,40,0.4) 40%, transparent 65%)',
  ];
  const layers = TINTS.map(bg => {
    const div = document.createElement('div');
    div.className = 'hero-tint__layer';
    div.style.background = bg;
    heroTint.appendChild(div);
    return div;
  });
  let active = 0;
  layers[0].classList.add('hero-tint__layer--active');
  setInterval(function() {
    layers[active].classList.remove('hero-tint__layer--active');
    active = (active + 1) % layers.length;
    layers[active].classList.add('hero-tint__layer--active');
  }, 5000);
})();

// Mouse-responsive tint position
(function() {
  let mx = 0, my = 0, cx = 0, cy = 0;

  heroSection.addEventListener('mousemove', function(e) {
    const rect = heroSection.getBoundingClientRect();
    mx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    my = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  });
  heroSection.addEventListener('mouseleave', function() { mx = 0; my = 0; });

  function tick() {
    cx += (mx - cx) * 0.04;
    cy += (my - cy) * 0.04;
    heroTint.style.transform = `translate(${cx * 30}px, ${cy * 20}px)`;
    heroCubeWrap.style.transform = `translate(${cx * 10}px, ${cy * 8}px)`;
    if (window._heroCubeInfluence) window._heroCubeInfluence(cx * 0.4, cy * 0.4);
    requestAnimationFrame(tick);
  }
  tick();
})();

// 3D Hero cube
(function(){
  const container = heroCubeWrap;
  const w = 320, h = 320;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
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
    new THREE.LineBasicMaterial({color:0xffffff, transparent:true, opacity:0.25})
  );
  cube.add(edges);
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dir = new THREE.DirectionalLight(0x6fb5ff, 1.2);
  dir.position.set(2, 3, 4);
  scene.add(dir);

  let mouseInfluenceX = 0, mouseInfluenceY = 0;
  function animate(){
    requestAnimationFrame(animate);
    cube.rotation.y += 0.006;
    cube.rotation.x += 0.003;
    cube.rotation.y += mouseInfluenceX * 0.02;
    cube.rotation.x += mouseInfluenceY * 0.02;
    mouseInfluenceX *= 0.94;
    mouseInfluenceY *= 0.94;
    renderer.render(scene, camera);
  }
  animate();
  window._heroCubeInfluence = function(x, y) { mouseInfluenceX = x; mouseInfluenceY = y; };
})();

// Hero buttons
const hb = document.getElementById('hero-btns');
hb.appendChild(linkBtn('Browse the mods', '/mods/', 'primary'));
hb.appendChild(linkBtn('Read the manifesto', '/about/', 'outline-dark'));

// Mod gallery — featured subset from shared data
const HOME_MOD_TITLES = ['Talisman: Hexed','Hyper Imperium','Nuke Catan','Econopoly','Flooded Catan','CivRisk'];
const filters = ['All','Total conversion','Rebalance','Reskin'];
let activeFilter = 'All';
const filtersEl = document.getElementById('gallery-filters');
const gridEl = document.getElementById('gallery-grid');

MG.data.load(['mods','news']).then(store => {
  const MODS = HOME_MOD_TITLES.map(t => store.mods.find(m => m.title === t));

  function renderFilter() {
    filtersEl.innerHTML = '';
    filters.forEach(f => {
      const isActive = f === activeFilter;
      const b = el('button', { class: isActive ? 'filter-btn filter-btn--active' : 'filter-btn' }, f);
      b.addEventListener('click', () => { activeFilter = f; renderFilter(); renderGrid(); });
      filtersEl.appendChild(b);
    });
  }

  function renderGrid() {
    gridEl.innerHTML = '';
    const visible = activeFilter === 'All' ? MODS : MODS.filter(m => m.category === activeFilter);
    visible.forEach(m => gridEl.appendChild(modCard(m)));
    MG.initReveal();
  }

  renderFilter(); renderGrid();

  // News grid (latest 3 from shared data)
  const ng = document.getElementById('news-grid');
  store.news.slice(0, 3).forEach(n => {
    const a = el('a', { href:url(`/news/${n.slug}/`), class:'news-card mg-lift', 'data-reveal':'up' });
    const row = el('div', { class:'news-card__header' });
    row.appendChild(el('span', { class:'news-card__tag' }, n.tags[0]));
    row.appendChild(el('span', { class:'news-card__date' }, n.date));
    a.appendChild(row);
    a.appendChild(el('h3', { class:'news-card__title' }, n.title));
    a.appendChild(el('p', { class:'news-card__body' }, n.excerpt));
    a.appendChild(el('span', { class:'news-card__more' }, 'Read more →'));
    ng.appendChild(a);
  });
  MG.initReveal();
});

const nb2 = document.getElementById('nuke-btns');
nb2.appendChild(linkBtn('Download the rules', '#', 'red'));
nb2.appendChild(linkBtn('Read the brief', '/mods/nuke-catan/', 'outline-dark'));

// Nuke smoke wisps
(function() {
  const smoke = document.getElementById('nuke-smoke');
  const COUNT = 10;
  for (let i = 0; i < COUNT; i++) {
    const wisp = document.createElement('div');
    wisp.className = 'home-nuke__smoke-wisp';
    const size = 80 + Math.random() * 120;
    wisp.style.width = size + 'px';
    wisp.style.height = size + 'px';
    wisp.style.left = (25 + Math.random() * 50) + '%';
    wisp.style.top = (30 + Math.random() * 40) + '%';
    wisp.style.setProperty('--dur', (5 + Math.random() * 5) + 's');
    wisp.style.setProperty('--delay', (-Math.random() * 6) + 's');
    wisp.style.setProperty('--x', (Math.random() * 50 - 25) + 'px');
    wisp.style.setProperty('--drift', (Math.random() * 40 - 20) + 'px');
    wisp.style.setProperty('--o', (0.5 + Math.random() * 0.4).toFixed(2));
    smoke.appendChild(wisp);
  }
})();

// Featured mod buttons
const fb = document.getElementById('featured-btns');
fb.appendChild(linkBtn('Download the rules', '#', 'primary'));
fb.appendChild(linkBtn('View the components', '/mods/hyper-imperium/', 'outline-dark'));

// Featured stats
const stats = [['Players','3–6'],['Time','4–6 hr'],['Age','14+'],['Version','v2.0.1']];
const sEl = document.getElementById('featured-stats');
stats.forEach(([k,v], i) => {
  if (i > 0) sEl.appendChild(el('span', { class:'stats-row__divider' }));
  const d = el('div', { class:'stats-row__item' });
  d.appendChild(el('span', { class:'stats-row__label' }, k));
  d.appendChild(el('span', { class:'stats-row__value' }, v));
  sEl.appendChild(d);
});


// Platform tabs
(function() {
  const TABS = [
    {
      id: 'hexagons',
      label: 'Why Hexagons',
      heading: 'Replacing squares with <em>hexagons.</em>',
      body: 'Six neighbours instead of four. No diagonal exceptions. No edge-case rules. The math of strategy gets cleaner the moment the grid does.',
      pills: ['6 adjacencies','0 diagonals','∞ variants'],
      visual: `<svg width="240" height="240" viewBox="0 0 280 280" fill="none" opacity="0.85"><path d="M140 20 240 60v80l-100 40L40 140V60z" stroke="#0c4f8d" stroke-width="1.5" fill="none" stroke-opacity="0.3"/><path d="M140 60 200 85v50l-60 25-60-25V85z" stroke="#0c4f8d" stroke-width="2" fill="rgba(12,79,141,0.08)"/><path d="M140 100 170 112v28l-30 13-30-13v-28z" stroke="#0c4f8d" stroke-width="2.5" fill="rgba(12,79,141,0.15)"/><path d="M80 160 140 185v50l-60-25z" stroke="#3a9928" stroke-width="1" fill="rgba(58,153,40,0.06)" stroke-opacity="0.6"/><path d="M200 160 140 185v50l60-25z" stroke="#d11a1a" stroke-width="1" fill="rgba(209,26,26,0.06)" stroke-opacity="0.6"/><circle cx="140" cy="100" r="4" fill="#6fb5ff"/><text x="140" y="270" text-anchor="middle" font-family="var(--mg-font-mono)" font-size="11" fill="rgba(255,255,255,0.5)">6 adjacencies · 0 diagonals</text></svg>`
    },
    {
      id: 'engine',
      label: 'Online Engine',
      heading: 'Play anywhere. Continue <em>everywhere.</em>',
      body: 'Create private sessions. Hand off mid-game between phone, tablet, and laptop. Pause a session in May, finish it in October. The board waits.',
      pills: ['Open alpha','Private sessions','Cross-device','Async play'],
      cards: [['Private sessions','Create a room, share a link. No accounts required.'],['Cross-device','Start on desktop, continue on phone. State syncs.'],['Async play','Take your turn whenever. The board waits days, weeks, months.']]
    },
    {
      id: 'bots',
      label: 'Practice Partners',
      heading: 'Play with friends — or <em>instructive bots.</em>',
      body: 'Every game played online — human-vs-human or human-vs-bot — improves the next bot you\'ll face. The engine is a teaching engine first, an opponent second.',
      pills: ['Adaptive','Replays','Solo + Multi'],
      buttons: [['Play Nukes online','#','blue'],['Try Moddable Chess','/games/moddable-chess/','outline-dark']]
    }
  ];

  const nav = document.getElementById('tabs-nav');
  const panels = document.getElementById('tabs-panels');

  TABS.forEach((tab, i) => {
    const button = el('button', {class:'home-tabs__btn' + (i===0?' home-tabs__btn--active':'')}, tab.label);
    button.dataset.tab = tab.id;
    nav.appendChild(button);

    const panel = el('div', {class:'home-tabs__panel' + (i===0?' home-tabs__panel--active':'')});
    panel.dataset.panel = tab.id;

    const content = el('div', {class:'home-tabs__content'});
    const h = el('h3'); h.innerHTML = tab.heading; content.appendChild(h);
    content.appendChild(el('p', {}, tab.body));

    const pills = el('div', {class:'home-tabs__pills'});
    tab.pills.forEach(p => pills.appendChild(el('span', {class:'home-tabs__pill'}, p)));
    content.appendChild(pills);

    if (tab.buttons) {
      const btns = el('div', {class:'home-tabs__btns'});
      tab.buttons.forEach(([label, href, variant]) => btns.appendChild(linkBtn(label, href, variant)));
      content.appendChild(btns);
    }

    panel.appendChild(content);

    const visual = el('div', {class:'home-tabs__visual'});
    if (tab.visual) {
      visual.innerHTML = tab.visual;
    } else if (tab.cards) {
      const grid = el('div', {class:'home-tabs__cards'});
      tab.cards.forEach(([title, body]) => {
        const card = el('div', {class:'home-engine__card'});
        card.appendChild(el('div', {class:'home-engine__card-title'}, title));
        card.appendChild(el('div', {class:'home-engine__card-body'}, body));
        grid.appendChild(card);
      });
      visual.appendChild(grid);
    } else {
      visual.innerHTML = `<svg width="220" height="220" viewBox="0 0 220 220" fill="none" opacity="0.85"><circle cx="110" cy="110" r="80" stroke="#0c4f8d" stroke-width="1.5" fill="rgba(12,79,141,0.06)"/><circle cx="110" cy="110" r="50" stroke="#6fb5ff" stroke-width="1" fill="rgba(111,181,255,0.05)" stroke-dasharray="4 4"/><circle cx="110" cy="110" r="20" fill="rgba(111,181,255,0.15)"/><circle cx="110" cy="110" r="6" fill="#6fb5ff"/><line x1="110" y1="60" x2="110" y2="30" stroke="#3a9928" stroke-width="1.5"/><circle cx="110" cy="26" r="4" fill="#3a9928"/><line x1="150" y1="80" x2="175" y2="60" stroke="#d11a1a" stroke-width="1.5"/><circle cx="178" cy="57" r="4" fill="#d11a1a"/><line x1="70" y1="80" x2="45" y2="60" stroke="#0c4f8d" stroke-width="1.5"/><circle cx="42" cy="57" r="4" fill="#0c4f8d"/><line x1="150" y1="140" x2="175" y2="160" stroke="#6fb5ff" stroke-width="1.5"/><circle cx="178" cy="163" r="4" fill="#6fb5ff"/><line x1="70" y1="140" x2="45" y2="160" stroke="#3a9928" stroke-width="1.5"/><circle cx="42" cy="163" r="4" fill="#3a9928"/><text x="110" y="210" text-anchor="middle" font-family="var(--mg-font-mono)" font-size="11" fill="rgba(255,255,255,0.5)">adaptive · learning · evolving</text></svg>`;
    }
    panel.appendChild(visual);
    panels.appendChild(panel);
  });

  nav.addEventListener('click', function(e) {
    const btn = e.target.closest('.home-tabs__btn');
    if (!btn) return;
    nav.querySelectorAll('.home-tabs__btn').forEach(b => b.classList.remove('home-tabs__btn--active'));
    btn.classList.add('home-tabs__btn--active');
    panels.querySelectorAll('.home-tabs__panel').forEach(p => {
      p.classList.remove('home-tabs__panel--active');
      if (p.dataset.panel === btn.dataset.tab) p.classList.add('home-tabs__panel--active');
    });
  });
})();

// Community band
document.getElementById('community-hex').style.backgroundImage = "url('img/hex-grid-blue.svg')";
const cb = document.getElementById('community-btns');
cb.appendChild(linkBtn('Open the Discord', '/community/', 'primary'));
cb.appendChild(linkBtn('Submit a mod', '/submit/', 'outline-dark'));
})();
