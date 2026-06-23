import { url, data, track, modCard, navbar, footer, sectionHero, buildHeroFeature, initReveal } from './mg.js';

(function() {
var grid = document.getElementById('mods-grid');
  if (!grid) return;

  document.getElementById('nav-root').appendChild(navbar('Mods'));
  document.getElementById('footer-root').appendChild(footer());

  document.getElementById('page-hero').appendChild(sectionHero({
    section: 'mods',
    tier: 1,
    hexColor: 'red',
    eyebrow: 'THE LIBRARY',
    title: 'Open <em>mods</em> for the boxes on your shelf',
    lede: 'Rulebook patches for the games gathering dust on your shelves. Filter, search, or browse.',
    feature: buildHeroFeature('mods')
  }));

  data.load(['mods']).then(function(store) {
    var ALL_MODS = store.mods;
    var filters = ['All','Conversion','Rebalance','Reskin'];
    var activeCat = 'All';
    var searchVal = '';


    function renderFilters() {
      var el2 = document.getElementById('cat-filters');
      el2.innerHTML = '';
      filters.forEach(function(f) {
        var a = f === activeCat;
        var b = document.createElement('button');
        b.className = 'mods-filter__btn' + (a ? ' mods-filter__btn--active' : '');
        b.textContent = f;
        b.addEventListener('click', function() { activeCat = f; renderFilters(); renderGrid(); grid.scrollIntoView({ behavior:'smooth', block:'start' }); if (track) track('filter_select', { filter_type: 'category', filter_value: f, page: 'mods' }); });
        el2.appendChild(b);
      });
    }

    function getGridColumns() {
      var style = window.getComputedStyle(grid);
      var cols = style.getPropertyValue('grid-template-columns').split(' ').length;
      return cols || 1;
    }

    function buildSubmitCard(span) {
      var card = document.createElement('a');
      card.href = url('/submit/');
      card.className = 'mods-submit-cta mg-lift';
      card.setAttribute('data-reveal', 'up');
      if (span > 1) card.style.gridColumn = 'span ' + span;
      card.innerHTML =
        '<div class="mods-submit-cta__inner">' +
          '<div class="mg-eyebrow mg-eyebrow--green">CONTRIBUTE</div>' +
          '<h3 class="mods-submit-cta__title">Submit your own mod</h3>' +
          '<p class="mods-submit-cta__body">Got a house rule that changes everything? Share it with the community.</p>' +
          '<span class="mods-submit-cta__btn">Submit Mod →</span>' +
        '</div>';
      return card;
    }

    function renderGrid() {
      var q = searchVal.toLowerCase();
      var visible = ALL_MODS.filter(function(m) {
        return (activeCat === 'All' || m.category === activeCat) &&
          (!q || m.title.toLowerCase().indexOf(q) !== -1 || m.baseGame.toLowerCase().indexOf(q) !== -1);
      });
      var empty = document.getElementById('empty-state');
      grid.innerHTML = '';
      document.getElementById('count-label').textContent = visible.length + ' OF ' + ALL_MODS.length + ' MODS';
      if (visible.length === 0) { empty.style.display = 'block'; return; }
      empty.style.display = 'none';
      visible.forEach(function(m) { grid.appendChild(modCard(m)); });
      var cols = getGridColumns();
      var remainder = visible.length % cols;
      var span = remainder === 0 ? cols : cols - remainder;
      grid.appendChild(buildSubmitCard(span));
      initReveal();
    }


    document.getElementById('search-input').addEventListener('input', function(e) {
      searchVal = e.target.value; renderGrid(); grid.scrollIntoView({ behavior:'smooth', block:'start' });
      clearTimeout(modsSearchDebounce);
      if (searchVal.length >= 3) {
        modsSearchDebounce = setTimeout(function() { if (track) track('search', { search_term: searchVal, page: 'mods' }); }, 800);
      }
    });

    var hashCat = decodeURIComponent(location.hash.slice(1));
    if (hashCat && filters.indexOf(hashCat) !== -1) activeCat = hashCat;
    renderFilters();
    renderGrid();

    window.addEventListener('hashchange', function() {
      var h = decodeURIComponent(location.hash.slice(1));
      if (h && filters.indexOf(h) !== -1 && h !== activeCat) {
        activeCat = h;
        renderFilters();
        renderGrid();
        grid.scrollIntoView({ behavior:'smooth', block:'start' });
      }
    });
  });
})();
