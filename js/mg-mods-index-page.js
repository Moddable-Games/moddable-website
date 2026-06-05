(function() {
  var grid = document.getElementById('mods-grid');
  if (!grid) return;

  var navbar = MG.navbar;
  var footer = MG.footer;

  document.getElementById('nav-root').appendChild(navbar('Mods'));
  document.getElementById('footer-root').appendChild(footer());

  document.getElementById('page-hero').appendChild(MG.sectionHero({
    section: 'mods',
    tier: 1,
    hexColor: 'red',
    eyebrow: 'THE LIBRARY',
    title: 'Ten <em>mods</em> for the boxes on your shelf.',
    lede: 'Rulebook patches for the games gathering dust on your shelves. Filter, search, or browse.',
    feature: MG.buildHeroFeature('mods')
  }));

  MG.data.load(['mods']).then(function(store) {
    var ALL_MODS = store.mods;
    var filters = ['All','Total conversion','Rebalance','Reskin'];
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
        b.addEventListener('click', function() { activeCat = f; renderFilters(); renderGrid(); grid.scrollIntoView({ behavior:'smooth', block:'start' }); });
        el2.appendChild(b);
      });
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
      visible.forEach(function(m) { grid.appendChild(MG.modCard(m)); });
      MG.initReveal();
    }

    document.getElementById('search-input').addEventListener('input', function(e) { searchVal = e.target.value; renderGrid(); grid.scrollIntoView({ behavior:'smooth', block:'start' }); });

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
