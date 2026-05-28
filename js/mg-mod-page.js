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

    var glow = el('div', {class: 'mod-hero__glow mod-hero__glow--' + accent});
    var inner = el('div', {class: 'mod-hero__inner hero-anim'});
    var backLink = el('a', {href: MG.url('/mods/'), class: 'mod-hero__back'});
    backLink.innerHTML = '&larr; All mods';
    inner.appendChild(backLink);

    var tags = el('div', {class: 'mod-hero__tags'});
    var category = listing ? listing.category : CATEGORY_MAP[accent];
    tags.appendChild(el('span', {class: 'mod-hero__cat mod-hero__cat--' + accent}, category));
    if (listing) tags.appendChild(el('span', {class: 'mod-hero__base'}, 'base: ' + listing.baseGame));
    tags.appendChild(el('span', {class: 'mod-hero__version'}, 'v1.0.0'));
    inner.appendChild(tags);

    var titleEl = el('h1', {class: 'mod-hero__title' + (accent !== 'blue' ? ' mod-hero__title--' + accent : '')});
    titleEl.innerHTML = page.heroTitle;
    inner.appendChild(titleEl);

    var ledeEl = el('p', {class: 'mod-hero__lede'});
    ledeEl.innerHTML = page.lede;
    inner.appendChild(ledeEl);

    var btnsWrap = el('div', {class: 'mod-hero__btns'});
    var btns = page.buttons || [['Download PDF', '#', 'primary'], ['View on GitHub', '#', 'outline-dark']];
    btns.forEach(function(b) { btnsWrap.appendChild(linkBtn(b[0], b[1], b[2])); });
    inner.appendChild(btnsWrap);

    var statsRow = el('div', {class: 'stats-row'});
    if (page.stats) {
      page.stats.forEach(function(pair, i) {
        if (i > 0) statsRow.appendChild(el('span', {class: 'stats-row__divider'}));
        var d = el('div', {class: 'stats-row__item'});
        d.appendChild(el('span', {class: 'stats-row__label'}, pair[0]));
        d.appendChild(el('span', {class: 'stats-row__value'}, pair[1]));
        statsRow.appendChild(d);
      });
    }
    inner.appendChild(statsRow);

    if (listing && listing.logo) {
      var logoImg = el('img', {
        src: MG.url('/' + listing.logo),
        alt: listing.title,
        class: 'mod-hero__logo'
      });
      inner.appendChild(logoImg);
    }

    hero.appendChild(glow);
    hero.appendChild(inner);
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

  function renderComponents() {
    var cg = document.getElementById('components-grid');
    if (!cg || !page.components) return;

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
