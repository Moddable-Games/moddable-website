(function() {
  var MG = window.MG;
  var el = MG.el;

  document.getElementById('nav-root').appendChild(MG.navbar('Developers'));
  document.getElementById('footer-root').appendChild(MG.footer());

  // Hero
  var hero = document.getElementById('dev-hero');
  hero.appendChild(MG.pageHero({
    eyebrow: 'TOOLS API',
    title: 'Board game engines as AI tools',
    lede: '13 callable tools for chess variant analysis and hex map generation. Connect from Claude, Cursor, VS Code, or any HTTP client.',
    accent: MG.T.cosmicGlow,
    withHorizon: true,
    minHeight: '340px'
  }));

  // Copy buttons
  document.querySelectorAll('.dev-connect__copy').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var code = btn.parentElement.querySelector('code');
      navigator.clipboard.writeText(code.textContent.trim());
      btn.textContent = 'Copied';
      setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
    });
  });

  // Load tools data
  MG.data.get('mcp-tools').then(function(namespaces) {
    var grid = document.getElementById('tools-grid');
    namespaces.forEach(function(ns) {
      ns.tools.forEach(function(tool) {
        var card = el('div', { class: 'dev-tool-card' },
          el('div', { class: 'dev-tool-card__name' + (ns.accent === 'green' ? ' green' : '') }, tool.name),
          el('div', { class: 'dev-tool-card__desc' }, tool.description),
          el('div', { class: 'dev-tool-card__example' }, '"' + tool.example + '"')
        );
        grid.appendChild(card);
      });
    });
  });

  // Build ideas
  var buildIdeas = [
    {
      icon: '\u{1F916}',
      title: 'Telegram Chess Coach',
      body: 'A bot that analyzes positions, generates daily puzzles in any variant, and explains why moves are legal or illegal.',
      tools: 'chess_analyze_position, chess_generate_puzzle, chess_validate_move'
    },
    {
      icon: '\u{1F5FA}',
      title: 'Discord Map Bot',
      body: 'Generate and share hex maps for game night. "/map nukes 4p seed:volcano" posts an SVG map directly in chat.',
      tools: 'hex_generate_map, hex_export_svg'
    },
    {
      icon: '\u{1F9E9}',
      title: 'Slack Puzzle of the Day',
      body: 'A scheduled bot that posts a new chess puzzle every morning. Tracks who solves it first.',
      tools: 'chess_generate_puzzle, chess_validate_move, chess_make_moves'
    },
    {
      icon: '\u{1F4A1}',
      title: 'AI Game Assistant',
      body: 'Let Claude or GPT look up variant rules, suggest moves, and validate game states during a live session.',
      tools: 'chess_list_variants, chess_get_legal_moves, chess_analyze_position'
    },
    {
      icon: '\u{1F30D}',
      title: 'Procedural World Builder',
      body: 'Generate seeded hex worlds for tabletop RPGs. Query terrain, compute sight lines, and find paths for encounter planning.',
      tools: 'hex_generate_map, hex_compute_fov, hex_pathfind, hex_get_info'
    },
    {
      icon: '\u{1F3AF}',
      title: 'Variant Explorer App',
      body: 'A web app that lets users browse 70+ chess variants, play positions, and get engine analysis with explanations.',
      tools: 'chess_list_variants, chess_make_moves, chess_analyze_position'
    }
  ];

  var buildGrid = document.getElementById('build-grid');
  buildIdeas.forEach(function(idea) {
    var card = el('div', { class: 'dev-build-card' },
      el('div', { class: 'dev-build-card__icon' }, idea.icon),
      el('div', { class: 'dev-build-card__title' }, idea.title),
      el('div', { class: 'dev-build-card__body' }, idea.body),
      el('div', { class: 'dev-build-card__tools' }, idea.tools)
    );
    buildGrid.appendChild(card);
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
