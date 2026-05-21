(function() {
  var grid = document.getElementById('mods-grid');
  if (!grid) return;

  var navbar = MG.navbar;
  var footer = MG.footer;

  document.getElementById('nav-root').appendChild(navbar('Mods'));
  document.getElementById('footer-root').appendChild(footer());

  var ALL_MODS = MG.ALL_MODS;
  var filters = ['All','Total conversion','Rebalance','Reskin'];
  var activeCat = 'All';
  var searchVal = '';

  document.getElementById('hero-sub').textContent = ALL_MODS.length + ' rulebook mods across ' + new Set(ALL_MODS.map(function(m) { return m.baseGame; })).size + ' base games. Filter by mod-type, or search for the one you already own.';

  function renderFilters() {
    var el2 = document.getElementById('cat-filters');
    el2.innerHTML = '';
    filters.forEach(function(f) {
      var a = f === activeCat;
      var b = document.createElement('button');
      b.className = 'mods-filter__btn' + (a ? ' mods-filter__btn--active' : '');
      b.textContent = f;
      b.addEventListener('click', function() { activeCat = f; renderFilters(); renderGrid(); });
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

  document.getElementById('search-input').addEventListener('input', function(e) { searchVal = e.target.value; renderGrid(); });

  var hashCat = decodeURIComponent(location.hash.slice(1));
  if (hashCat && filters.indexOf(hashCat) !== -1) activeCat = hashCat;
  renderFilters();
  renderGrid();
})();
