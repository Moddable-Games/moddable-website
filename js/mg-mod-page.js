/* =========================================================================
   Moddable.Games — Mod Detail Page Renderer
   Reads data-mod="slug" from <body>, looks up MG.MOD_PAGES[slug],
   and renders the entire page (hero, stats, TOC, rules, components, related).
   Depends on: mg-core.js, mg-mods-data.js, mg-mods-content.js, mg-buttons.js, mg-cards.js
   ========================================================================= */

(function() {
  var slug = document.body.getAttribute('data-mod');
  if (!slug) return;

  var page = window.MG.MOD_PAGES && window.MG.MOD_PAGES[slug];
  if (!page) return;

  var el = MG.el;
  var linkBtn = MG.linkBtn;
  var modCard = MG.modCard;
  var navbar = MG.navbar;
  var footer = MG.footer;

  var navRoot = document.getElementById('nav-root');
  var footerRoot = document.getElementById('footer-root');
  if (navRoot) navRoot.appendChild(navbar('Mods'));
  if (footerRoot) footerRoot.appendChild(footer());

  // Hero buttons
  var hb = document.getElementById('header-btns');
  if (hb) {
    var btns = page.buttons || [['Download PDF', '#', 'primary'], ['View on GitHub', '#', 'outline-dark']];
    btns.forEach(function(b) { hb.appendChild(linkBtn(b[0], b[1], b[2])); });
  }

  // Stats row
  var sr = document.getElementById('stats-row');
  if (sr && page.stats) {
    page.stats.forEach(function(pair, i) {
      if (i > 0) sr.appendChild(el('span', {class:'stats-row__divider'}));
      var d = el('div', {class:'stats-row__item'});
      d.appendChild(el('span', {class:'stats-row__label'}, pair[0]));
      d.appendChild(el('span', {class:'stats-row__value'}, pair[1]));
      sr.appendChild(d);
    });
  }

  // TOC + Rules sections
  var toc = document.getElementById('toc');
  var rulesBody = document.getElementById('rules-body');
  if (toc && rulesBody && page.sections) {
    page.sections.forEach(function(s) {
      var li = el('li');
      var a = el('a', {href:'#s' + s.id, class:'toc-list__link'});
      a.appendChild(el('span', {class:'toc-list__num'}, s.id.padStart(2, '0')));
      a.appendChild(document.createTextNode(s.title));
      li.appendChild(a);
      toc.appendChild(li);

      var art = el('article', {class:'rules-section', id:'s' + s.id});
      art.appendChild(el('div', {class:'rules-section__num'}, 'SECTION ' + s.id.padStart(2, '0')));
      art.appendChild(el('h2', {class:'rules-section__title'}, s.title));
      art.appendChild(el('p', {class:'rules-section__body'}, s.body));
      rulesBody.appendChild(art);
    });
  }

  // Components grid
  var cg = document.getElementById('components-grid');
  if (cg && page.components) {
    var eyebrowClass = 'mg-eyebrow--' + (page.accent || 'blue');
    page.components.forEach(function(comp) {
      var c = el('div', {class:'mg-card'});
      c.appendChild(el('div', {class:'mg-card__eyebrow ' + eyebrowClass}, comp.kind.toUpperCase()));
      var ul = el('ul', {class:'component-list'});
      comp.list.forEach(function(x) {
        var li = el('li', {class:'component-list__item'});
        li.appendChild(el('span', {class:'component-list__bullet'}));
        li.appendChild(document.createTextNode(x));
        ul.appendChild(li);
      });
      c.appendChild(ul);
      cg.appendChild(c);
    });
  }

  // Related mods
  var rg = document.getElementById('related-grid');
  if (rg && page.related && MG.ALL_MODS) {
    page.related.forEach(function(title) {
      var m = MG.ALL_MODS.find(function(x) { return x.title === title; });
      if (m) {
        var card = Object.assign({}, m, { href: '../' + m.href.split('/mods/')[1] });
        rg.appendChild(modCard(card));
      }
    });
  }
})();
