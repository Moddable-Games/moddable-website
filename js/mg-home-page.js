(function() {
const { T, el, btn, linkBtn, navbar, footer, modCard, url } = MG;

// Enable hero animations (content visible by default if this fails)
document.getElementById('hero').classList.add('hero-anim-ready');

// Nav + Footer
document.getElementById('nav-root').appendChild(navbar(''));
document.getElementById('footer-root').appendChild(footer());

// Hero parallax + colour tint cycle + cube + mouse tracking
const heroBgInner = document.getElementById('hero-bg__inner');
const heroSection = document.getElementById('hero');
const heroTint = document.getElementById('hero-tint');

const heroContent = document.getElementById('hero-content');
const heroHex = document.getElementById('hero-hex');
const heroGlow = document.getElementById('hero-glow');
const heroBotFade = document.getElementById('hero-bot-fade');
const heroWash = document.getElementById('hero-wash');
var heroScrollActive = false;
window.addEventListener('scroll', () => {
  const rect = heroSection.getBoundingClientRect();
  const scrolled = Math.max(0, -rect.top);
  if (!heroScrollActive && scrolled < 5) return;
  heroScrollActive = true;
  const ratio = Math.min(1, scrolled / (rect.height * 0.7));
  heroBgInner.style.transform = `translateY(${scrolled * -0.15}px)`;
  if (heroContent) { heroContent.style.transform = `translateY(${ratio * -120}px)`; heroContent.style.opacity = Math.max(0, 1 - ratio * 2.5); }
  if (heroHex) { heroHex.style.opacity = Math.max(0, 1 - ratio * 1.8); heroHex.style.transform = `translateY(${ratio * -40}px)`; }
  if (heroTint) { heroTint.style.opacity = Math.max(0, 1 - ratio * 1.5); }
  if (heroBotFade) { heroBotFade.style.opacity = Math.max(0, 1 - ratio * 2.5); }
  if (heroWash) { heroWash.style.opacity = ratio; }
}, { passive:true });

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
    requestAnimationFrame(tick);
  }
  tick();
})();


// After animations complete, remove animation class so elements revert to default visible state
setTimeout(function() {
  var hero = document.getElementById('hero');
  if (hero) hero.classList.remove('hero-anim-ready');
}, 2500);

// Typewriter cycle on hero title
(function() {
  var WORDS = ['games','mods','rules','engines','tools','variants','worlds'];
  var COLORS = ['#6fb5ff','#3a9928','#d11a1a'];
  var tw = document.getElementById('hero-typewriter');
  if (!tw) return;
  var wordIdx = 0;
  var colorIdx = 0;
  var charIdx = WORDS[0].length;
  var deleting = true;

  function showCursor() { tw.classList.add('typing'); }
  function hideCursor() { tw.classList.remove('typing'); }

  function tick() {
    var word = WORDS[wordIdx];
    if (deleting) {
      charIdx--;
      tw.textContent = word.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        wordIdx = (wordIdx + 1) % WORDS.length;
        colorIdx = (colorIdx + 1) % COLORS.length;
        tw.style.color = COLORS[colorIdx];
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, 60 + Math.random() * 40);
    } else {
      var target = WORDS[wordIdx];
      charIdx++;
      tw.textContent = target.slice(0, charIdx);
      if (charIdx === target.length) {
        deleting = true;
        hideCursor();
        setTimeout(function() { showCursor(); setTimeout(tick, 600); }, 2000);
        return;
      }
      setTimeout(tick, 90 + Math.random() * 50);
    }
  }
  setTimeout(function() { showCursor(); setTimeout(tick, 600); }, 3000);
})();

// Hero buttons
const hb = document.getElementById('hero-btns');
hb.appendChild(linkBtn('Browse Mods', '/mods/', 'primary'));
hb.appendChild(linkBtn('Learn More', '/about/', 'outline-dark'));

// Mod gallery — all mods loaded, show max 6
const MAX_SHOWN = 6;
let activeFilter = 'All';
const filtersEl = document.getElementById('gallery-filters');
const gridEl = document.getElementById('gallery-grid');

MG.data.load(['mods','news']).then(store => {
  const MODS = store.mods;
  const baseGames = ['All'].concat([...new Set(MODS.map(m => m.baseGame))].sort());

  function renderFilter() {
    filtersEl.innerHTML = '';
    baseGames.forEach(f => {
      const isActive = f === activeFilter;
      const b = el('button', { class: isActive ? 'filter-btn filter-btn--active' : 'filter-btn' }, f);
      b.addEventListener('click', () => { activeFilter = f; renderFilter(); renderGrid(); if (MG.track) MG.track('filter_select', { filter_type: 'base_game', filter_value: f, page: 'home' }); });
      filtersEl.appendChild(b);
    });
  }

  function renderGrid() {
    gridEl.innerHTML = '';
    const filtered = activeFilter === 'All' ? MODS : MODS.filter(m => m.baseGame === activeFilter);
    filtered.slice(0, MAX_SHOWN).forEach(m => gridEl.appendChild(modCard(m)));
    MG.initReveal();
  }

  renderFilter(); renderGrid();

  // News grid (latest 3 from shared data)
  const ng = document.getElementById('news-grid');
  store.news.slice(0, 3).forEach(n => {
    const a = el('a', { href:url(`/news/${n.slug}/`), class:'news-card mg-lift', 'data-reveal':'up' });
    a.addEventListener('click', function() { if (MG.track) MG.track('select_content', { content_type: 'news', item_id: n.slug }); });
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
nb2.appendChild(linkBtn('Play Nukes', '/games/nukes/', 'red'));
nb2.appendChild(linkBtn('Read Article', '/news/nuking-catan/', 'outline-dark'));

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
fb.appendChild(linkBtn('Read Rules', 'https://rules.moddable.games/dist/hyper-imperium/', 'primary'));
fb.appendChild(linkBtn('View Components', '/mods/hyper-imperium/', 'outline-dark'));

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



// Community band
document.getElementById('community-hex').style.backgroundImage = "url('img/hex-grid-blue.svg')";
const cb = document.getElementById('community-btns');
cb.appendChild(linkBtn('Join Community', '/community/', 'primary'));
cb.appendChild(linkBtn('Submit Mod', '/submit/', 'outline-dark'));
})();
