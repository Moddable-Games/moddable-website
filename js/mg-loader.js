/* =========================================================================
   Moddable.Games — Loader
   Loads all modules in dependency order. Pages reference this single file.
   ========================================================================= */

(function() {
  var V = '1.0.15';
  const scripts = document.querySelectorAll('script[src*="mg-loader.js"]');
  const src = scripts[scripts.length - 1].getAttribute('src');
  const base = src.replace(/mg-loader\.js.*$/, '');
  var modules = [
    'mg-core.js',
    'mg-mods-content.js',
    'mg-buttons.js',
    'mg-cards.js',
    'mg-navbar.js',
    'mg-footer.js',
    'mg-search.js',
    'mg-animations.js',
    'mg-mod-page.js'
  ];
  for (var i = 0; i < modules.length; i++) {
    document.write('<script src="' + base + modules[i] + '?v=' + V + '"><\/script>');
  }
})();
