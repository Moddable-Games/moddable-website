(function() {
  var el = MG.el;
  var linkBtn = MG.linkBtn;
  var url = MG.url;
  var T = MG.T;

  document.getElementById('nav-root').appendChild(MG.navbar('Engines'));
  document.getElementById('footer-root').appendChild(MG.footer());

  document.getElementById('engines-hero-hex').style.backgroundImage = MG.HEX_BG;

  var ctaBtns = document.getElementById('engines-cta-btns');
  ctaBtns.appendChild(linkBtn('View on GitHub', 'https://github.com/Moddable-Games', 'primary'));
  ctaBtns.appendChild(linkBtn('Read the docs', '/about/roadmap/', 'outline-dark'));

  var grid = document.getElementById('engines-grid');

  MG.data.get('engines').then(function(engines) {
    engines.forEach(function(eng) {
      var card = el('a', {
        href: url('/engines/' + eng.slug + '/'),
        class: 'engine-card mg-lift',
        'data-reveal': 'up'
      });

      var accent = T[eng.accent] || T.blue;

      var bar = el('div', { class: 'engine-card__bar' });
      bar.style.background = accent;
      card.appendChild(bar);

      var header = el('div', { class: 'engine-card__header' });
      var logo = el('img', {
        src: url(eng.logo),
        alt: eng.title + ' logo',
        class: 'engine-card__logo'
      });
      header.appendChild(logo);
      var titleWrap = el('div', { class: 'engine-card__title-wrap' });
      var status = el('div', { class: 'engine-card__status' });
      status.style.color = accent;
      status.textContent = 'Open source · Live';
      titleWrap.appendChild(status);
      titleWrap.appendChild(el('h3', { class: 'engine-card__title' }, eng.title));
      header.appendChild(titleWrap);
      card.appendChild(header);

      card.appendChild(el('p', { class: 'engine-card__tagline' }, eng.tagline));

      var stats = el('div', { class: 'engine-card__stats' });
      eng.stats.forEach(function(s) {
        var stat = el('div', { class: 'engine-card__stat' });
        stat.appendChild(el('div', { class: 'engine-card__stat-value' }, s.value));
        stat.appendChild(el('div', { class: 'engine-card__stat-label' }, s.label));
        stats.appendChild(stat);
      });
      card.appendChild(stats);

      var features = el('div', { class: 'engine-card__features' });
      eng.features.forEach(function(f) {
        var tag = el('span', { class: 'engine-card__feature' });
        tag.textContent = f;
        features.appendChild(tag);
      });
      card.appendChild(features);

      grid.appendChild(card);
    });

    MG.initReveal();
  });
})();
