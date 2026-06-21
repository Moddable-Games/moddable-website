(function() {
  var MG = window.MG;
  var el = MG.el;

  document.getElementById('nav-root').appendChild(MG.navbar('Developers'));
  document.getElementById('footer-root').appendChild(MG.footer());

  var hero = document.getElementById('dev-hero');
  hero.appendChild(MG.pageHero({
    eyebrow: 'EXAMPLES',
    title: 'Built with <em>Moddable</em> Tools',
    lede: 'Live integrations running in production, plus ideas for what you could build next.',
    accent: '#8b5cf6',
    withHorizon: true,
    minHeight: '300px'
  }));

  // ── Live Integrations ──

  var liveIntegrations = [
    {
      title: 'The House',
      subtitle: 'Discord Bot',
      description: '16 slash commands serving chess puzzles, hex maps, faction drafts, rules lookups, and mod jam orchestration to our community.',
      stats: [
        { label: 'Commands', value: '16' },
        { label: 'Tools used', value: '12' },
        { label: 'Status', value: 'Live' }
      ],
      accent: 'purple',
      links: [
        { label: 'Join Server', href: 'https://discord.gg/moddable', external: true },
        { label: 'View Source', href: 'https://github.com/Moddable-Games/moddable-website/tree/main/workers/discord', external: true }
      ]
    },
    {
      title: 'MCP Server',
      subtitle: 'tools.moddable.games',
      description: '22 AI-callable tools across chess analysis, hex map generation, rules library queries, and board game utilities. MCP + REST.',
      stats: [
        { label: 'Tools', value: '22' },
        { label: 'Namespaces', value: '4' },
        { label: 'Protocols', value: 'MCP + REST' }
      ],
      accent: 'blue',
      links: [
        { label: 'Live Server', href: 'https://tools.moddable.games/', external: true },
        { label: 'OpenAPI Spec', href: 'https://tools.moddable.games/openapi.json', external: true }
      ]
    },
    {
      title: 'Chess Explorer',
      subtitle: 'chess.moddable.games',
      description: '70 chess variants playable in-browser with AI opponents across 5 difficulty levels. Embeddable via iframe with postMessage API.',
      stats: [
        { label: 'Variants', value: '70' },
        { label: 'Puzzles', value: '1,557' },
        { label: 'AI Levels', value: '5' }
      ],
      accent: 'green',
      links: [
        { label: 'Play Now', href: 'https://chess.moddable.games/', external: true },
        { label: 'Embed Docs', href: '/engines/moddable-chess/', external: false }
      ]
    },
    {
      title: 'Rules Library',
      subtitle: 'rules.moddable.games',
      description: '18 game families with full variant rulebooks, searchable and queryable via MCP. New games auto-propagate to all consumers.',
      stats: [
        { label: 'Games', value: '18' },
        { label: 'Indexed entries', value: '1,149' },
        { label: 'MCP tools', value: '5' }
      ],
      accent: 'red',
      links: [
        { label: 'Browse Rules', href: 'https://rules.moddable.games/', external: true },
        { label: 'API Docs', href: '/developers/api/', external: false }
      ]
    }
  ];

  var liveGrid = document.getElementById('live-grid');
  liveIntegrations.forEach(function(item, idx) {
    var statsHtml = item.stats.map(function(s) {
      return el('div', { class: 'dev-live-card__stat' },
        el('span', { class: 'dev-live-card__stat-value' }, s.value),
        el('span', { class: 'dev-live-card__stat-label' }, s.label)
      );
    });

    var linksHtml = item.links.map(function(link) {
      var attrs = { class: 'dev-live-card__link', href: link.href };
      if (link.external) {
        attrs.target = '_blank';
        attrs.rel = 'noopener';
      }
      return el('a', attrs, link.label, el('span', { class: 'dev-live-card__link-arrow' }, '→'));
    });

    var card = el('div', { class: 'dev-live-card dev-live-card--' + item.accent, style: '--delay:' + (idx * 80) + 'ms' },
      el('div', { class: 'dev-live-card__header' },
        el('div', { class: 'dev-live-card__status' },
          el('span', { class: 'dev-live-card__dot' }),
          el('span', { class: 'dev-live-card__status-text' }, 'Live')
        ),
        el('span', { class: 'dev-live-card__subtitle' }, item.subtitle)
      ),
      el('h3', { class: 'dev-live-card__title' }, item.title),
      el('p', { class: 'dev-live-card__desc' }, item.description),
      el('div', { class: 'dev-live-card__stats' }, ...statsHtml),
      el('div', { class: 'dev-live-card__links' }, ...linksHtml)
    );
    liveGrid.appendChild(card);
  });

  // ── Build Ideas ──

  var buildIdeas = [
    {
      title: 'Telegram Chess Coach',
      body: 'Analyze positions, generate daily puzzles in any variant, and explain why moves are legal or illegal.',
      tools: 'chess_analyze_position, chess_generate_puzzle, chess_validate_move',
      accent: 'blue'
    },
    {
      title: 'Discord Map Bot',
      body: 'Generate and share hex maps for game night. "/map nukes 4p seed:volcano" posts a map directly in chat.',
      tools: 'hex_generate_map, hex_export_svg',
      accent: 'green'
    },
    {
      title: 'Slack Puzzle of the Day',
      body: 'A scheduled bot that posts a new chess puzzle every morning. Tracks who solves it first.',
      tools: 'chess_generate_puzzle, chess_validate_move',
      accent: 'blue'
    },
    {
      title: 'AI Game Assistant',
      body: 'Let Claude or GPT look up variant rules, suggest moves, and validate game states during a live session.',
      tools: 'chess_list_variants, chess_get_legal_moves',
      accent: 'blue'
    },
    {
      title: 'Procedural World Builder',
      body: 'Generate seeded hex worlds for tabletop RPGs. Query terrain, compute sight lines, and plan encounters.',
      tools: 'hex_generate_map, hex_compute_fov, hex_pathfind',
      accent: 'green'
    },
    {
      title: 'Variant Explorer App',
      body: 'Browse 70+ chess variants, play positions, and get engine analysis with explanations.',
      tools: 'chess_list_variants, chess_make_moves',
      accent: 'blue'
    },
    {
      title: 'Rules Lookup Bot',
      body: 'Answers "how do you play X?" with official rules, variant lists, and links to full rulebooks.',
      tools: 'rules_get_game, rules_get_variant, rules_search',
      accent: 'red'
    },
    {
      title: 'Random Game Night Picker',
      body: 'Pick a random game from the library, filtered by player count or game family.',
      tools: 'rules_list_games, rules_random',
      accent: 'red'
    }
  ];

  var buildGrid = document.getElementById('build-grid');
  buildIdeas.forEach(function(idea, idx) {
    var card = el('div', { class: 'dev-build-card dev-build-card--' + idea.accent, style: '--delay:' + (idx * 60) + 'ms' },
      el('div', { class: 'dev-build-card__title' }, idea.title),
      el('div', { class: 'dev-build-card__body' }, idea.body),
      el('div', { class: 'dev-build-card__tools' }, idea.tools)
    );
    buildGrid.appendChild(card);
  });

  // ── CTA ──
  var ctaBtns = document.getElementById('examples-cta-btns');
  ctaBtns.appendChild(MG.linkBtn('Tools API', '/developers/api/', 'blue'));
  var serverBtn = MG.linkBtn('Live Server', 'https://tools.moddable.games/', 'outline-dark');
  serverBtn.setAttribute('target', '_blank');
  serverBtn.setAttribute('rel', 'noopener');
  ctaBtns.appendChild(serverBtn);

  // CTA copy button
  var ctaCopy = document.getElementById('cta-copy');
  if (ctaCopy) {
    ctaCopy.addEventListener('click', function() {
      var code = ctaCopy.parentElement.querySelector('code');
      navigator.clipboard.writeText(code.textContent.trim());
      ctaCopy.textContent = 'Copied';
      setTimeout(function() { ctaCopy.textContent = 'Copy'; }, 2000);
    });
  }

  // ── Scroll reveal ──
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('dev-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.dev-live-card, .dev-build-card').forEach(function(card) {
    observer.observe(card);
  });
})();
