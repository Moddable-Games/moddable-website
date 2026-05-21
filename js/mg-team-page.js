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
    title: 'Six humans. Zero AI.',
    lede: 'The people who write the rules, draw the tiles, and lose every game of Nuke Catan.'
  }));

  MG.TEAM.forEach(function(m) {
    var card = el('article', {class:'team-card'});
    var hrow = el('div', {class:'team-card__header'});
    var avatar = el('div', {class:'team-card__avatar'});
    avatar.style.background = 'linear-gradient(135deg,' + m.color + ',' + m.color + '88)';
    avatar.textContent = m.name[0];
    hrow.appendChild(avatar);
    var info = el('div');
    info.appendChild(el('div', {class:'team-card__name'}, m.name));
    info.appendChild(el('div', {class:'team-card__role'}, m.role));
    hrow.appendChild(info);
    card.appendChild(hrow);
    card.appendChild(el('p', {class:'team-card__bio'}, m.bio));
    var handle = el('div', {class:'team-card__handle'}, m.handle);
    handle.style.color = m.color;
    card.appendChild(handle);
    grid.appendChild(card);
  });
})();
