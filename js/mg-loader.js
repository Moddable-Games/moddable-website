/* =========================================================================
   Moddable.Games — Loader
   Loads all modules in dependency order. Pages reference this single file.
   ========================================================================= */

(function() {
  const scripts = document.querySelectorAll('script[src*="mg-loader.js"]');
  const src = scripts[scripts.length - 1].getAttribute('src');
  const base = src.replace('mg-loader.js', '');
  var modules = [
    'mg-core.js',
    'mg-mods-data.js',
    'mg-games-data.js',
    'mg-news-data.js',
    'mg-buttons.js',
    'mg-cards.js',
    'mg-navbar.js',
    'mg-footer.js',
    'mg-search.js',
    'mg-animations.js'
  ];
  for (var i = 0; i < modules.length; i++) {
    document.write('<script src="' + base + modules[i] + '"><\/script>');
  }
})();
