(function() {
  var MG = window.MG;
  var el = MG.el;
  var url = MG.url;

  document.getElementById('nav-root').appendChild(MG.navbar('Developers'));
  document.getElementById('footer-root').appendChild(MG.footer());

  // Tier-1 hero
  document.getElementById('page-hero').appendChild(MG.sectionHero({
    section: 'developers',
    tier: 1,
    hexColor: 'purple',
    eyebrow: 'DEVELOPERS',
    title: 'Board game engines as <em>AI</em> tools',
    lede: '39 callable tools across five namespaces. Connect from any MCP client, call via REST, or build bots for Telegram, Slack, and Discord.',
    feature: MG.buildHeroFeature('developers')
  }));

  // Destination cards
  var destinations = [
    {
      title: 'Tools API',
      body: '39 tools for chess, hex maps, rules queries, classic game engines, and utilities. Connect in one command via MCP or call via REST.',
      href: url('/developers/api/'),
      stat: '39 tools',
      accent: 'blue'
    },
    {
      title: 'Build Examples',
      body: 'Telegram chess coaches, Discord map bots, Slack puzzle-of-the-day, AI game assistants, and procedural world builders.',
      href: url('/developers/examples/'),
      stat: '6 ideas',
      accent: 'green'
    },
    {
      title: 'Live Server',
      body: 'The MCP server running at tools.moddable.games. Interactive docs, OpenAPI spec, llms.txt discovery, and a live tool explorer.',
      href: 'https://tools.moddable.games/',
      stat: 'tools.moddable.games',
      accent: 'red',
      external: true
    }
  ];

  // CTA buttons
  var ctaBtns = document.getElementById('dev-cta-btns');
  ctaBtns.appendChild(MG.linkBtn('Connect Now', '/developers/api/', 'blue'));
  ctaBtns.appendChild(MG.linkBtn('View Live Server', 'https://tools.moddable.games/', 'outline-dark'));

  var grid = document.getElementById('landing-grid');
  destinations.forEach(function(d) {
    var attrs = { class: 'dev-dest-card dev-dest-card--' + d.accent, href: d.href };
    if (d.external) { attrs.target = '_blank'; attrs.rel = 'noopener'; }
    var card = el('a', attrs,
      el('div', { class: 'dev-dest-card__stat' }, d.stat),
      el('h3', { class: 'dev-dest-card__title' }, d.title),
      el('p', { class: 'dev-dest-card__body' }, d.body),
      el('span', { class: 'dev-dest-card__arrow' }, '→')
    );
    grid.appendChild(card);
  });
})();
