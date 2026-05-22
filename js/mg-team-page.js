(function() {
  var grid = document.getElementById('team-grid');
  if (!grid || !window.MG.TEAM) return;

  var el = MG.el;
  var navbar = MG.navbar;
  var footer = MG.footer;
  var pageHero = MG.pageHero;

  document.getElementById('nav-root').appendChild(navbar('About'));
  document.getElementById('footer-root').appendChild(footer());
  document.getElementById('page-hero').appendChild(pageHero({
    eyebrow: 'THE TEAM',
    title: "Who's making this happen.",
    lede: 'A modder-founder, a systems-thinker playtester, a board-game evangelist who builds the engine, and a game artist with TV credits.'
  }));

  MG.TEAM.forEach(function(m) {
    var card = el('div', {class:'team-card'});
    var avatar = el('div', {class:'card-avatar'});
    var img = el('img', {class:'img-breakout', src: m.img, alt: m.name});
    avatar.appendChild(img);
    card.appendChild(avatar);
    card.appendChild(el('h3', {class:'team-card__name'}, m.name));
    card.appendChild(el('div', {class:'team-card__role'}, m.role));
    card.appendChild(el('p', {class:'team-card__bio'}, m.bio));
    grid.appendChild(card);
  });
})();
