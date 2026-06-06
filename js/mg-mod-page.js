/* =========================================================================
   Moddable.Games — Mod Detail Page Renderer
   Reads slug from URL path, looks up MOD_PAGES[slug] + mods.json listing,
   and renders the entire page (hero, stats, TOC, rules, components, related).
   Depends on: mg-core.js, mg-mods-content.js, mg-buttons.js, mg-cards.js
   ========================================================================= */

(function() {
  var pathParts = window.location.pathname.replace(/\/$/, '').split('/');
  var slug = pathParts[pathParts.length - 1];
  if (!slug) return;

  var page = window.MG.MOD_PAGES && window.MG.MOD_PAGES[slug];
  if (!page) return;

  var el = MG.el;
  var linkBtn = MG.linkBtn;
  var modCard = MG.modCard;
  var navbar = MG.navbar;
  var footer = MG.footer;

  var accent = page.accent || 'blue';
  var CATEGORY_MAP = { red: 'Total conversion', green: 'Rebalance', blue: 'Reskin' };

  function init() {
    document.body.setAttribute('data-accent', accent);
    var navRoot = document.getElementById('nav-root');
    var footerRoot = document.getElementById('footer-root');
    if (navRoot) navRoot.appendChild(navbar('Mods'));
    if (footerRoot) footerRoot.appendChild(footer());

    MG.data.get('mods').then(function(mods) {
      var listing = mods.find(function(m) { return m.path.indexOf(slug) !== -1; });
      renderHero(listing);
      renderRules();
      renderNotes();
      renderComponents();
      renderRelated(mods);
      document.title = (listing ? listing.title : slug) + ' — Moddable.Games';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function renderHero(listing) {
    var hero = document.getElementById('mod-hero');
    if (!hero) return;

    var GRADIENTS = {
      red: 'linear-gradient(180deg,#2a0a0a 0%,#3a0d0d 40%,#000 100%)',
      green: 'linear-gradient(180deg,#0a1f0a 0%,#0d2a0d 40%,#000 100%)',
      blue: 'linear-gradient(180deg,#0a0d2a 0%,#0c2e5a 40%,#000 100%)'
    };
    var HEX_GRIDS = { red: 'hex-grid-red.svg', green: 'hex-grid-green.svg', blue: 'hex-grid-blue.svg' };

    hero.className = 'game-hero';

    var gradient = el('div', {class: 'game-hero__gradient'});
    gradient.style.background = GRADIENTS[accent] || GRADIENTS.blue;
    hero.appendChild(gradient);

    hero.appendChild(el('div', {class: 'game-hero__bloom game-hero__bloom--' + accent}));

    var hex = el('div', {class: 'game-hero__hex'});
    hex.style.backgroundImage = "url('" + MG.url('/img/' + (HEX_GRIDS[accent] || HEX_GRIDS.blue)) + "')";
    hero.appendChild(hex);

    hero.appendChild(el('div', {class: 'game-hero__fade'}));

    var inner = el('div', {class: 'game-hero__inner'});
    var text = el('div', {class: 'game-hero__text hero-anim'});

    var backLink = el('a', {href: MG.url('/mods/'), class: 'game-hero__back'});
    backLink.innerHTML = '&larr; All mods';
    text.appendChild(backLink);

    var tags = el('div', {class: 'game-hero__tags'});
    var category = listing ? listing.category : CATEGORY_MAP[accent];
    var catTag = el('span', {class: 'game-hero__tag'});
    catTag.style.background = MG.T[accent];
    catTag.textContent = category;
    tags.appendChild(catTag);
    if (listing) tags.appendChild(el('span', {class: 'game-hero__tag--outline'}, 'base: ' + listing.baseGame));
    var versionTag = el('span', {class: 'game-hero__version'});
    versionTag.style.color = MG.T[accent === 'green' ? 'green' : accent === 'red' ? 'redBright' : 'cosmicGlow'];
    versionTag.textContent = 'v1.0.0';
    tags.appendChild(versionTag);
    text.appendChild(tags);

    var titleEl = el('h1', {class: 'game-hero__title'});
    titleEl.innerHTML = page.heroTitle;
    text.appendChild(titleEl);

    var ledeEl = el('p', {class: 'game-hero__lede'});
    ledeEl.innerHTML = page.lede;
    text.appendChild(ledeEl);

    var btnsWrap = el('div', {class: 'game-hero__btns'});
    var btns = page.buttons || [['Download PDF', '#', 'primary'], ['View on GitHub', '#', 'outline-dark']];
    btns.forEach(function(b) { btnsWrap.appendChild(linkBtn(b[0], b[1], b[2])); });
    text.appendChild(btnsWrap);

    inner.appendChild(text);

    if (listing && listing.logo) {
      var logoImg = el('img', {
        src: MG.url('/' + listing.logo),
        alt: listing.title,
        class: 'game-hero__logo'
      });
      inner.appendChild(logoImg);
    }

    hero.appendChild(inner);

    if (page.stats) {
      var statsSection = el('section', {class: 'stats-bar'});
      var statsInner = el('div', {class: 'stats-bar__inner'});
      page.stats.forEach(function(pair, i) {
        if (i > 0) statsInner.appendChild(el('span', {class: 'stats-row__divider'}));
        var d = el('div', {class: 'stats-row__item'});
        d.appendChild(el('span', {class: 'stats-row__label'}, pair[0]));
        d.appendChild(el('span', {class: 'stats-row__value'}, pair[1]));
        statsInner.appendChild(d);
      });
      statsSection.appendChild(statsInner);
      hero.parentNode.insertBefore(statsSection, hero.nextSibling);
    }
  }

  function renderRules() {
    var toc = document.getElementById('toc');
    var rulesBody = document.getElementById('rules-body');
    if (!toc || !rulesBody || !page.sections) return;

    var eyebrow = toc.previousElementSibling;
    if (eyebrow && eyebrow.classList.contains('mg-eyebrow')) {
      eyebrow.className = 'mg-eyebrow mg-eyebrow--' + accent;
    }

    page.sections.forEach(function(s) {
      var li = el('li');
      var a = el('a', {href: '#s' + s.id, class: 'toc-list__link'});
      a.appendChild(el('span', {class: 'toc-list__num'}, s.id.padStart(2, '0')));
      a.appendChild(document.createTextNode(s.title));
      li.appendChild(a);
      toc.appendChild(li);

      var art = el('article', {class: 'rules-section', id: 's' + s.id});
      art.appendChild(el('div', {class: 'rules-section__num'}, 'SECTION ' + s.id.padStart(2, '0')));
      art.appendChild(el('h2', {class: 'rules-section__title'}, s.title));
      art.appendChild(el('p', {class: 'rules-section__body'}, s.body));
      rulesBody.appendChild(art);
    });

    if (MG.initTocSpy) MG.initTocSpy();
  }

  function renderNotes() {
    if (!page.notes || !page.notes.length) return;
    var rulesSection = document.getElementById('rules-body');
    if (!rulesSection) return;

    var container = rulesSection.closest('.mg-section');
    if (!container) return;

    var notesSection = el('section', {class: 'mg-section mg-section--white mg-section--border-top'});
    var inner = el('div', {class: 'mg-container'});
    inner.appendChild(el('div', {class: 'mg-eyebrow mg-eyebrow--' + accent}, 'GOOD TO KNOW'));
    inner.appendChild(el('h2', {class: 'mg-heading-lg'}, 'Context and comparisons.'));

    var grid = el('div', {class: 'mg-grid-notes'});
    page.notes.forEach(function(n) {
      var card = el('div', {class: 'mg-card mg-card--note'});
      card.appendChild(el('h3', {class: 'mg-card__title'}, n.title));
      card.appendChild(el('p', {class: 'mg-card__body'}, n.body));
      grid.appendChild(card);
    });

    inner.appendChild(grid);
    notesSection.appendChild(inner);
    container.parentNode.insertBefore(notesSection, container.nextSibling);
  }

  function renderComponents() {
    var cg = document.getElementById('components-grid');
    if (!cg || !page.components) return;

    if (page.componentsHeading) {
      var heading = cg.parentNode.querySelector('.mg-heading-xl');
      if (heading) heading.textContent = page.componentsHeading;
    }

    var eyebrowClass = 'mg-eyebrow--' + accent;
    page.components.forEach(function(comp) {
      var c = el('div', {class: 'mg-card'});
      c.appendChild(el('div', {class: 'mg-card__eyebrow ' + eyebrowClass}, comp.kind.toUpperCase()));
      var ul = el('ul', {class: 'component-list'});
      comp.list.forEach(function(x) {
        var li = el('li', {class: 'component-list__item'});
        li.appendChild(el('span', {class: 'component-list__bullet'}));
        li.appendChild(document.createTextNode(x));
        ul.appendChild(li);
      });
      c.appendChild(ul);
      cg.appendChild(c);
    });
  }

  function renderRelated(mods) {
    var rg = document.getElementById('related-grid');
    if (!rg) return;

    var currentTitle = page.heroTitle ? page.heroTitle.replace(/<[^>]+>/g, '').replace(/\.$/, '') : '';
    var listing = mods.find(function(m) { return m.path === '/mods/' + slug + '/'; });
    var others = mods.filter(function(m) { return m.title !== (listing ? listing.title : currentTitle); });

    others.sort(function(a, b) {
      var aScore = 0, bScore = 0;
      if (a.source === 'Moddable.Games') aScore += 4;
      if (b.source === 'Moddable.Games') bScore += 4;
      if (listing) {
        if (a.category === listing.category) aScore += 2;
        if (b.category === listing.category) bScore += 2;
        if (a.baseGame === listing.baseGame) aScore += 1;
        if (b.baseGame === listing.baseGame) bScore += 1;
      }
      return bScore - aScore || Math.random() - 0.5;
    });

    others.slice(0, 3).forEach(function(m) { rg.appendChild(modCard(m)); });
    if (MG.initReveal) MG.initReveal();
  }
})();
