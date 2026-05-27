(function() {
  var el = MG.el;
  var linkBtn = MG.linkBtn;
  var url = MG.url;

  document.getElementById('nav-root').appendChild(MG.navbar('Games'));
  document.getElementById('footer-root').appendChild(MG.footer());

  document.getElementById('games-hero-hex').style.backgroundImage = "url('" + url('/img/hex-grid-blue.svg') + "')";

  var eb = document.getElementById('engines-link-btns');
  eb.appendChild(linkBtn('Explore engines', '/engines/', 'blue'));

  var hb = document.getElementById('horizon-btns');
  hb.appendChild(linkBtn('Join the Discord', '/community/', 'primary'));
  hb.appendChild(linkBtn('See the roadmap', '/about/roadmap/', 'outline-dark'));

  var grid = document.getElementById('games-grid');

  MG.data.load(['games']).then(function(store) {
    store.games.forEach(function(g) {
      var card = el('a', {href:g.href, class:'game-card mg-lift', 'data-reveal':'up'});
      card.addEventListener('mouseenter', function() { card.style.borderColor = g.accent; });
      card.addEventListener('mouseleave', function() { card.style.borderColor = ''; });

      var bar = el('div', {class:'game-card__bar'});
      bar.style.background = g.accent;
      card.appendChild(bar);

      var thumb = el('div', {class:'game-card__thumb'});
      thumb.style.background = 'linear-gradient(135deg, #0a0d2a 0%, ' + g.accent + ' 100%)';
      var hexOverlay = el('div', {class:'game-card__thumb-hex'});
      hexOverlay.style.backgroundImage = 'url("' + url('/img/hex-grid-white.svg') + '")';
      thumb.appendChild(hexOverlay);
      card.appendChild(thumb);

      var body = el('div', {class:'game-card__body'});
      var status = el('div', {class:'game-card__status'});
      status.style.color = g.accent;
      status.textContent = g.status;
      body.appendChild(status);
      body.appendChild(el('h3', {class:'game-card__title'}, g.title));
      body.appendChild(el('p', {class:'game-card__desc'}, g.desc));
      var stats = el('div', {class:'game-card__stats'});
      stats.textContent = g.players + ' · ' + g.time;
      body.appendChild(stats);

      card.appendChild(body);
      grid.appendChild(card);
    });

    MG.initReveal();
  });
})();
