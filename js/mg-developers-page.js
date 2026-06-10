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
    hexColor: 'blue',
    eyebrow: 'DEVELOPERS',
    title: 'Board game <em>engines</em> as AI tools',
    lede: '15 callable tools across two open-source engines. Connect from any MCP client, call via REST, or build bots for Telegram, Slack, and Discord.',
    feature: MG.buildHeroFeature('engines')
  }));

  // Destination cards
  var destinations = [
    {
      title: 'Tools API',
      body: '15 tools for chess analysis, hex map generation, and board game utilities. Connect in one command via MCP or call via REST.',
      href: url('/developers/api/'),
      stat: '15 tools',
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

  // Engines
  var engines = [
    {
      title: 'Moddable Chess',
      tagline: '70 chess variants. One modular engine.',
      stats: [
        { value: '70+', label: 'variants' },
        { value: '7', label: 'tools' },
        { value: '67KB', label: 'bundled' }
      ],
      accent: 'blue',
      url: 'https://chess.moddable.games/',
      repo: 'https://github.com/Moddable-Games/moddable-chess'
    },
    {
      title: 'Moddable Hexmaps',
      tagline: 'Hex map generation for any game.',
      stats: [
        { value: '6', label: 'games' },
        { value: '6', label: 'tools' },
        { value: '0', label: 'dependencies' }
      ],
      accent: 'green',
      url: 'https://hex.moddable.games/',
      repo: 'https://github.com/Moddable-Games/moddable-hexmaps'
    }
  ];

  var engGrid = document.getElementById('engines-grid');
  engines.forEach(function(eng) {
    var statsEl = el('div', { class: 'dev-engine-card__stats' });
    eng.stats.forEach(function(s) {
      statsEl.appendChild(el('div', { class: 'dev-engine-card__stat' },
        el('div', { class: 'dev-engine-card__stat-value' + (eng.accent === 'green' ? ' green' : '') }, s.value),
        el('div', { class: 'dev-engine-card__stat-label' }, s.label)
      ));
    });

    var card = el('div', { class: 'dev-engine-card' },
      el('div', { class: 'dev-engine-card__title' }, eng.title),
      el('div', { class: 'dev-engine-card__tagline' }, eng.tagline),
      statsEl,
      el('div', { class: 'dev-engine-card__links' },
        el('a', { class: 'dev-engine-card__link', href: eng.url, target: '_blank', rel: 'noopener' }, 'Live site →'),
        el('a', { class: 'dev-engine-card__link', href: eng.repo, target: '_blank', rel: 'noopener' }, 'GitHub →')
      )
    );
    engGrid.appendChild(card);
  });
})();
