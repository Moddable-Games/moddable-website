(function() {
  var MG = window.MG;
  var el = MG.el;

  document.getElementById('nav-root').appendChild(MG.navbar('Developers'));
  document.getElementById('footer-root').appendChild(MG.footer());

  var hero = document.getElementById('dev-hero');
  hero.appendChild(MG.pageHero({
    eyebrow: 'EXAMPLES',
    title: 'What you could build',
    lede: 'Bots, apps, and integrations powered by the Moddable Tools API.',
    accent: MG.T.cosmicGlow,
    withHorizon: true,
    minHeight: '300px'
  }));

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
})();
