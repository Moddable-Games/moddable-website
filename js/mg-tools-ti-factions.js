(function() {
  var el = MG.el;
  var url = MG.url;

  document.getElementById('nav-root').appendChild(MG.navbar('Tools'));
  document.getElementById('footer-root').appendChild(MG.footer());

  var TEXT_KEYS = [
    'factionName', 'factionQuote', 'factionQuoter',
    'factionAbility1Title', 'factionAbility1',
    'factionAbility2Title', 'factionAbility2',
    'factionAbility3Title', 'factionAbility3',
    'factionCommodities', 'factionResources', 'factionInfluence',
    'flagshipName', 'flagshipTitle', 'flagshipAbility',
    'flagshipCost', 'flagshipCombat', 'flagshipMove', 'flagshipCapacity',
    'agentName', 'agentAbility',
    'commanderName', 'commanderAbility',
    'heroName', 'heroAbility',
    'tech1Name', 'tech1Ability', 'tech1Req1', 'tech1Req2', 'tech1Req3',
    'tech2Name', 'tech2Ability', 'tech2Req1', 'tech2Req2', 'tech2Req3',
    'mechName', 'mechAbility',
    'noteName', 'noteAbility'
  ];

  var state = {};
  TEXT_KEYS.forEach(function(k) { state[k] = ''; });
  state.imgSymbol = null;
  state.imgRace = null;
  state.imgSystem = null;
  state.imgAgent = null;
  state.imgCommander = null;
  state.imgHero = null;

  function loadFromParams() {
    var params = new URLSearchParams(window.location.search);
    TEXT_KEYS.forEach(function(k) {
      if (params.has(k)) state[k] = params.get(k);
    });
  }
  loadFromParams();

  function buildShareURL() {
    var params = new URLSearchParams();
    TEXT_KEYS.forEach(function(k) {
      if (state[k]) params.set(k, state[k]);
    });
    return window.location.origin + window.location.pathname + '?' + params.toString();
  }

  /* ── Card rendering (pure HTML/CSS, no PNGs) ─────────────────── */

  var UNITS = [
    { name: 'War Sun', cost: '-', combat: '-', move: '-', capacity: '-', pos: 'r2c1', abilities: 'You cannot produce this unit unless you own its unit upgrade technology.', keywords: '' },
    { name: 'Cruiser I', cost: '2', combat: '7', move: '2', capacity: '-', pos: 'r2c2', abilities: '', keywords: '' },
    { name: 'Dreadnought I', cost: '4', combat: '5', move: '1', capacity: '1', pos: 'r3c1', abilities: '', keywords: 'Sustain Damage • Bombardment 5' },
    { name: 'Destroyer I', cost: '1', combat: '9', move: '2', capacity: '', pos: 'r3c2', abilities: '', keywords: 'Anti-Fighter Barrage 9 (x2)' },
    { name: 'PDS I', cost: '-', combat: '-', move: '', capacity: '', pos: 'r3c3', abilities: '', keywords: 'Planetary Shield • Space Cannon 6' },
    { name: 'Carrier I', cost: '3', combat: '9', move: '1', capacity: '4', pos: 'r4c1', abilities: '', keywords: '' },
    { name: 'Fighter I', cost: '-', combat: '9', move: '-', capacity: '', pos: 'r4c2', abilities: '', keywords: '' },
    { name: 'Infantry I', cost: '-', combat: '-', move: '-', capacity: '', pos: 'r4c3', abilities: '', keywords: '' },
    { name: 'Space Dock I', cost: '-', combat: '-', move: '', capacity: '', pos: 'r4c4', abilities: 'This unit\'s PRODUCTION value is equal to 2 more than the resource value of this planet. Up to 3 fighters in this system do not count against your ship\'s capacity.', keywords: 'Production X' }
  ];

  function buildFactionSheet() {
    var sheet = el('div', { class: 'fc-sheet' });

    // Faction name
    var nameEl = el('div', { class: 'fc-sheet__name', id: 'fc-name' });
    sheet.appendChild(nameEl);

    // Symbol
    var sym = el('div', { class: 'fc-sheet__symbol', id: 'fc-symbol' });
    sheet.appendChild(sym);

    // Flagship
    var fs = el('div', { class: 'fc-flagship' });
    fs.innerHTML =
      '<div class="fc-flagship__label">FACTION FLAGSHIP</div>' +
      '<div class="fc-flagship__name" id="fc-fs-name"></div>' +
      '<div class="fc-flagship__ability-title" id="fc-fs-atitle"></div>' +
      '<div class="fc-flagship__ability" id="fc-fs-ability"></div>' +
      '<div class="fc-flagship__stats">' +
        '<div class="fc-flagship__stat"><div class="fc-flagship__stat-val" id="fc-fs-cost"></div><div class="fc-flagship__stat-lbl">Cost</div></div>' +
        '<div class="fc-flagship__stat"><div class="fc-flagship__stat-val" id="fc-fs-combat"></div><div class="fc-flagship__stat-lbl">Combat</div></div>' +
        '<div class="fc-flagship__stat"><div class="fc-flagship__stat-val" id="fc-fs-move"></div><div class="fc-flagship__stat-lbl">Move</div></div>' +
        '<div class="fc-flagship__stat"><div class="fc-flagship__stat-val" id="fc-fs-cap"></div><div class="fc-flagship__stat-lbl">Capacity</div></div>' +
      '</div>';
    sheet.appendChild(fs);

    // Race image
    var race = el('div', { class: 'fc-sheet__race', id: 'fc-race' });
    sheet.appendChild(race);

    // Home system
    var sys = el('div', { class: 'fc-sheet__system', id: 'fc-system' });
    sys.innerHTML =
      '<div class="fc-sheet__system-stats">' +
        '<div class="fc-sheet__system-stat"><div class="fc-sheet__system-stat-lbl">Resources</div><div class="fc-sheet__system-stat-val" id="fc-sys-res"></div></div>' +
        '<div class="fc-sheet__system-stat"><div class="fc-sheet__system-stat-lbl">Influence</div><div class="fc-sheet__system-stat-val" id="fc-sys-inf"></div></div>' +
      '</div>';
    sheet.appendChild(sys);

    // Right panel (overlaid on race area, top-right)
    var right = el('div', { class: 'fc-sheet__right' });
    right.innerHTML =
      '<div class="fc-meta">' +
        '<div class="fc-meta__quote" id="fc-quote"></div>' +
        '<div class="fc-meta__quoter" id="fc-quoter"></div>' +
      '</div>' +
      '<div class="fc-abilities">' +
        '<div class="fc-ability"><div class="fc-ability__title" id="fc-a1t"></div><div class="fc-ability__text" id="fc-a1"></div></div>' +
        '<div class="fc-ability"><div class="fc-ability__title" id="fc-a2t"></div><div class="fc-ability__text" id="fc-a2"></div></div>' +
        '<div class="fc-ability"><div class="fc-ability__title" id="fc-a3t"></div><div class="fc-ability__text" id="fc-a3"></div></div>' +
      '</div>';
    sheet.appendChild(right);

    // Commodities — its own grid cell at row 3, col 4
    var comm = el('div', { class: 'fc-commodities' });
    comm.innerHTML =
      '<span class="fc-commodities__label">Commodities</span>' +
      '<span class="fc-commodities__val" id="fc-comm"></span>';
    sheet.appendChild(comm);

    // Unit cards
    var units = el('div', { class: 'fc-sheet__units' });
    UNITS.forEach(function(u) {
      var unit = el('div', { class: 'fc-unit', 'data-pos': u.pos });
      unit.innerHTML =
        '<div class="fc-unit__name">' + u.name + '</div>' +
        (u.keywords ? '<div class="fc-unit__keywords">' + u.keywords + '</div>' : '') +
        (u.abilities ? '<div class="fc-unit__ability">' + u.abilities + '</div>' : '') +
        '<div class="fc-unit__stats">' +
          (u.cost !== '' ? '<div class="fc-unit__stat"><div class="fc-unit__stat-val">' + u.cost + '</div><div class="fc-unit__stat-lbl">Cost</div></div>' : '') +
          (u.combat !== '' ? '<div class="fc-unit__stat"><div class="fc-unit__stat-val">' + u.combat + '</div><div class="fc-unit__stat-lbl">Combat</div></div>' : '') +
          (u.move !== '' ? '<div class="fc-unit__stat"><div class="fc-unit__stat-val">' + u.move + '</div><div class="fc-unit__stat-lbl">Move</div></div>' : '') +
          (u.capacity !== '' ? '<div class="fc-unit__stat"><div class="fc-unit__stat-val">' + u.capacity + '</div><div class="fc-unit__stat-lbl">Cap</div></div>' : '') +
        '</div>';
      units.appendChild(unit);
    });
    sheet.appendChild(units);

    return sheet;
  }

  function buildLeaderCard(type, nameId, abilityId, avatarId) {
    var card = el('div', { class: 'fc-leader' });
    card.innerHTML =
      '<div class="fc-leader__left"><div class="fc-leader__avatar" id="' + avatarId + '"></div></div>' +
      '<div class="fc-leader__right">' +
        '<div class="fc-leader__name" id="' + nameId + '"></div>' +
        '<div class="fc-leader__type">' + type + '</div>' +
        '<div class="fc-leader__ability" id="' + abilityId + '"></div>' +
      '</div>';
    return card;
  }

  function buildNoteCard() {
    var card = el('div', { class: 'fc-note' });
    card.innerHTML =
      '<div class="fc-note__name" id="fc-note-name"></div>' +
      '<div class="fc-note__text" id="fc-note-text"></div>';
    return card;
  }

  function buildTechCard(idx) {
    var card = el('div', { class: 'fc-tech' });
    card.innerHTML =
      '<div class="fc-tech__pips">' +
        '<div class="fc-tech__pip" id="fc-t' + idx + '-r1"></div>' +
        '<div class="fc-tech__pip" id="fc-t' + idx + '-r2"></div>' +
        '<div class="fc-tech__pip" id="fc-t' + idx + '-r3"></div>' +
      '</div>' +
      '<div class="fc-tech__body">' +
        '<div class="fc-tech__name" id="fc-t' + idx + '-name"></div>' +
        '<div class="fc-tech__type">Technology</div>' +
        '<div class="fc-tech__ability" id="fc-t' + idx + '-ability"></div>' +
      '</div>';
    return card;
  }

  function buildMechCard() {
    var card = el('div', { class: 'fc-mech' });
    card.innerHTML =
      '<div class="fc-mech__name" id="fc-mech-name"></div>' +
      '<div class="fc-mech__type">Mech</div>' +
      '<div class="fc-mech__ability" id="fc-mech-ability"></div>';
    return card;
  }

  function renderPreview() {
    var container = document.getElementById('fd-preview-inner');
    container.innerHTML = '';

    container.appendChild(buildFactionSheet());

    var leadersRow = el('div', { class: 'leaders-row' });
    leadersRow.appendChild(buildLeaderCard('Agent', 'fc-agent-name', 'fc-agent-ability', 'fc-avatar-agent'));
    leadersRow.appendChild(buildLeaderCard('Commander', 'fc-cmdr-name', 'fc-cmdr-ability', 'fc-avatar-cmdr'));
    leadersRow.appendChild(buildLeaderCard('Hero', 'fc-hero-name', 'fc-hero-ability', 'fc-avatar-hero'));
    leadersRow.appendChild(buildNoteCard());
    container.appendChild(leadersRow);

    var techRow = el('div', { class: 'tech-row' });
    techRow.appendChild(buildTechCard(1));
    techRow.appendChild(buildTechCard(2));
    techRow.appendChild(buildMechCard());
    container.appendChild(techRow);

    syncStateToDOM();
  }

  function syncStateToDOM() {
    setText('fc-name', state.factionName);
    setText('fc-quote', state.factionQuote);
    setText('fc-quoter', state.factionQuoter);
    setText('fc-a1t', state.factionAbility1Title);
    setText('fc-a1', state.factionAbility1);
    setText('fc-a2t', state.factionAbility2Title);
    setText('fc-a2', state.factionAbility2);
    setText('fc-a3t', state.factionAbility3Title);
    setText('fc-a3', state.factionAbility3);
    setText('fc-comm', state.factionCommodities);
    setText('fc-sys-res', state.factionResources);
    setText('fc-sys-inf', state.factionInfluence);

    setText('fc-fs-name', state.flagshipName);
    setText('fc-fs-atitle', state.flagshipTitle);
    setText('fc-fs-ability', state.flagshipAbility);
    setText('fc-fs-cost', state.flagshipCost);
    setText('fc-fs-combat', state.flagshipCombat);
    setText('fc-fs-move', state.flagshipMove);
    setText('fc-fs-cap', state.flagshipCapacity);

    setText('fc-agent-name', state.agentName);
    setText('fc-agent-ability', state.agentAbility);
    setText('fc-cmdr-name', state.commanderName);
    setText('fc-cmdr-ability', state.commanderAbility);
    setText('fc-hero-name', state.heroName);
    setText('fc-hero-ability', state.heroAbility);

    setText('fc-t1-name', state.tech1Name);
    setText('fc-t1-ability', state.tech1Ability);
    setPip('fc-t1-r1', state.tech1Req1);
    setPip('fc-t1-r2', state.tech1Req2);
    setPip('fc-t1-r3', state.tech1Req3);

    setText('fc-t2-name', state.tech2Name);
    setText('fc-t2-ability', state.tech2Ability);
    setPip('fc-t2-r1', state.tech2Req1);
    setPip('fc-t2-r2', state.tech2Req2);
    setPip('fc-t2-r3', state.tech2Req3);

    setText('fc-mech-name', state.mechName);
    setText('fc-mech-ability', state.mechAbility);
    setText('fc-note-name', state.noteName);
    setText('fc-note-text', state.noteAbility);

    setBg('fc-symbol', state.imgSymbol);
    setBg('fc-race', state.imgRace);
    setBg('fc-system', state.imgSystem);
    setBg('fc-avatar-agent', state.imgAgent);
    setBg('fc-avatar-cmdr', state.imgCommander);
    setBg('fc-avatar-hero', state.imgHero);
  }

  function setText(id, val) {
    var e = document.getElementById(id);
    if (e) e.textContent = val || '';
  }

  function setPip(id, val) {
    var e = document.getElementById(id);
    if (!e) return;
    e.className = 'fc-tech__pip' + (val ? ' fc-tech__pip--' + val : ' fc-tech__pip--none');
  }

  var PLACEHOLDER_SYMBOL = url('/img/tools/ti4-factions/placeholder-icon.png');
  var PLACEHOLDER_RACE = url('/img/tools/ti4-factions/placeholder-race-white.png');
  var PLACEHOLDER_SYSTEM = url('/img/tools/ti4-factions/placeholder-planet-white.png');

  function setBg(id, src) {
    var e = document.getElementById(id);
    if (!e) return;
    var fallback = '';
    if (id === 'fc-symbol') fallback = PLACEHOLDER_SYMBOL;
    else if (id === 'fc-race') fallback = PLACEHOLDER_RACE;
    else if (id === 'fc-system') fallback = PLACEHOLDER_SYSTEM;
    e.style.backgroundImage = 'url(' + (src || fallback) + ')';
  }

  function printPreview() { window.print(); }

  function copyShareLink() {
    var shareUrl = buildShareURL();
    navigator.clipboard.writeText(shareUrl).then(function() {
      var shareBtn = document.getElementById('fd-share-btn');
      if (shareBtn) {
        shareBtn.textContent = 'Copied';
        setTimeout(function() { shareBtn.textContent = 'Copy Link'; }, 2000);
      }
    });
  }

  function buildExportBar() {
    var bar = el('div', { class: 'fd-export-bar' });
    var printBtn = el('button', { class: 'fd-export-btn' });
    printBtn.textContent = 'Print / Save PDF';
    printBtn.addEventListener('click', printPreview);
    bar.appendChild(printBtn);
    var shareBtn = el('button', { class: 'fd-export-btn fd-export-btn--outline', id: 'fd-share-btn' });
    shareBtn.textContent = 'Copy Link';
    shareBtn.addEventListener('click', copyShareLink);
    bar.appendChild(shareBtn);
    return bar;
  }

  /* ── Editor ──────────────────────────────────────────────────── */

  function renderEditor() {
    var editor = document.getElementById('fd-editor');
    editor.innerHTML = '';
    var tabs = el('div', { class: 'fd-editor__tabs' });
    var panels = [];
    var tabData = [
      { id: 'faction', label: 'Faction' },
      { id: 'flagship', label: 'Flagship' },
      { id: 'leaders', label: 'Leaders' },
      { id: 'tech', label: 'Tech' },
      { id: 'images', label: 'Images' }
    ];
    tabData.forEach(function(t, i) {
      var tabBtn = el('button', { class: 'fd-editor__tab' + (i === 0 ? ' fd-editor__tab--active' : ''), 'data-tab': t.id });
      tabBtn.textContent = t.label;
      tabBtn.addEventListener('click', function() {
        tabs.querySelectorAll('.fd-editor__tab').forEach(function(b) { b.classList.remove('fd-editor__tab--active'); });
        tabBtn.classList.add('fd-editor__tab--active');
        panels.forEach(function(p) { p.classList.remove('fd-editor__panel--active'); });
        document.getElementById('fd-panel-' + t.id).classList.add('fd-editor__panel--active');
      });
      tabs.appendChild(tabBtn);
    });
    editor.appendChild(tabs);
    panels.push(buildFactionPanel());
    panels.push(buildFlagshipPanel());
    panels.push(buildLeadersPanel());
    panels.push(buildTechPanel());
    panels.push(buildImagesPanel());
    panels.forEach(function(p, i) {
      if (i === 0) p.classList.add('fd-editor__panel--active');
      editor.appendChild(p);
    });
  }

  function buildFactionPanel() {
    var panel = el('div', { class: 'fd-editor__panel', id: 'fd-panel-faction' });
    panel.appendChild(field('Faction Name', 'text', 'factionName', 'The Xxcha Kingdom'));
    panel.appendChild(fieldRow([
      field('Quote', 'text', 'factionQuote', 'A faction quote...'),
      field('Quoter', 'text', 'factionQuoter', 'Speaker name')
    ]));
    panel.appendChild(fieldRow([
      field('Ability 1 Title', 'text', 'factionAbility1Title', 'Peace Accords'),
      field('Ability 1', 'text', 'factionAbility1', 'Description...')
    ]));
    panel.appendChild(fieldRow([
      field('Ability 2 Title', 'text', 'factionAbility2Title', 'Instinct'),
      field('Ability 2', 'text', 'factionAbility2', 'Description...')
    ]));
    panel.appendChild(fieldRow([
      field('Ability 3 Title', 'text', 'factionAbility3Title', ''),
      field('Ability 3', 'text', 'factionAbility3', '')
    ]));
    panel.appendChild(fieldRow([
      fieldSelect('Commodities', 'factionCommodities', numOptions(1, 9)),
      fieldSelect('Resources', 'factionResources', numOptions(0, 9)),
      fieldSelect('Influence', 'factionInfluence', numOptions(0, 9))
    ]));
    panel.appendChild(fieldRow([
      field('Note Name', 'text', 'noteName', 'Faction note...'),
      field('Note Contents', 'text', 'noteAbility', 'Note description...')
    ]));
    panel.appendChild(fieldRow([
      field('Mech Name', 'text', 'mechName', 'Mech name'),
      field('Mech Ability', 'text', 'mechAbility', 'Mech ability...')
    ]));
    return panel;
  }

  function buildFlagshipPanel() {
    var panel = el('div', { class: 'fd-editor__panel', id: 'fd-panel-flagship' });
    panel.appendChild(field('Flagship Name', 'text', 'flagshipName', 'The Loncara Ssodu'));
    panel.appendChild(fieldRow([
      field('Ability Title', 'text', 'flagshipTitle', 'Sustain Damage'),
      field('Ability', 'text', 'flagshipAbility', 'Description...')
    ]));
    panel.appendChild(fieldRow([
      fieldSelect('Cost', 'flagshipCost', numOptions(1, 9)),
      fieldSelect('Combat', 'flagshipCombat', combatOptions()),
      fieldSelect('Move', 'flagshipMove', numOptions(1, 5)),
      fieldSelect('Capacity', 'flagshipCapacity', numOptions(1, 9))
    ]));
    return panel;
  }

  function buildLeadersPanel() {
    var panel = el('div', { class: 'fd-editor__panel', id: 'fd-panel-leaders' });
    panel.appendChild(fieldRow([
      field('Agent Name', 'text', 'agentName', 'Agent name'),
      field('Agent Ability', 'text', 'agentAbility', 'Agent ability...')
    ]));
    panel.appendChild(fieldRow([
      field('Commander Name', 'text', 'commanderName', 'Commander name'),
      field('Commander Ability', 'text', 'commanderAbility', 'Commander ability...')
    ]));
    panel.appendChild(fieldRow([
      field('Hero Name', 'text', 'heroName', 'Hero name'),
      field('Hero Ability', 'text', 'heroAbility', 'Hero ability...')
    ]));
    return panel;
  }

  function buildTechPanel() {
    var panel = el('div', { class: 'fd-editor__panel', id: 'fd-panel-tech' });
    panel.appendChild(fieldRow([
      field('Tech 1 Name', 'text', 'tech1Name', 'Tech name'),
      field('Tech 1 Ability', 'text', 'tech1Ability', 'Tech ability...')
    ]));
    panel.appendChild(fieldRow([
      fieldSelect('Req 1', 'tech1Req1', reqOptions()),
      fieldSelect('Req 2', 'tech1Req2', reqOptions()),
      fieldSelect('Req 3', 'tech1Req3', reqOptions())
    ]));
    panel.appendChild(fieldRow([
      field('Tech 2 Name', 'text', 'tech2Name', 'Tech name'),
      field('Tech 2 Ability', 'text', 'tech2Ability', 'Tech ability...')
    ]));
    panel.appendChild(fieldRow([
      fieldSelect('Req 1', 'tech2Req1', reqOptions()),
      fieldSelect('Req 2', 'tech2Req2', reqOptions()),
      fieldSelect('Req 3', 'tech2Req3', reqOptions())
    ]));
    return panel;
  }

  function buildImagesPanel() {
    var panel = el('div', { class: 'fd-editor__panel', id: 'fd-panel-images' });
    panel.appendChild(fileField('Faction Symbol', 'imgSymbol'));
    panel.appendChild(fileField('Race Art', 'imgRace'));
    panel.appendChild(fileField('Home System', 'imgSystem'));
    panel.appendChild(fileField('Agent Avatar', 'imgAgent'));
    panel.appendChild(fileField('Commander Avatar', 'imgCommander'));
    panel.appendChild(fileField('Hero Avatar', 'imgHero'));
    return panel;
  }

  function field(label, type, key, placeholder) {
    var wrap = el('div', { class: 'fd-field' });
    var lbl = el('label', { class: 'fd-field__label' });
    lbl.textContent = label;
    wrap.appendChild(lbl);
    var input = el('input', { class: 'fd-field__input', type: type, placeholder: placeholder || '', 'data-key': key });
    input.value = state[key] || '';
    input.addEventListener('input', function() {
      state[key] = input.value;
      syncStateToDOM();
    });
    wrap.appendChild(input);
    return wrap;
  }

  function fieldSelect(label, key, options) {
    var wrap = el('div', { class: 'fd-field' });
    var lbl = el('label', { class: 'fd-field__label' });
    lbl.textContent = label;
    wrap.appendChild(lbl);
    var select = el('select', { class: 'fd-field__select', 'data-key': key });
    var def = document.createElement('option');
    def.value = '';
    def.textContent = '—';
    select.appendChild(def);
    options.forEach(function(o) {
      var opt = document.createElement('option');
      opt.value = o.value;
      opt.textContent = o.label;
      if (state[key] === o.value) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener('change', function() {
      state[key] = select.value;
      syncStateToDOM();
    });
    wrap.appendChild(select);
    return wrap;
  }

  function fileField(label, key) {
    var wrap = el('div', { class: 'fd-field' });
    var lbl = el('label', { class: 'fd-field__label' });
    lbl.textContent = label;
    wrap.appendChild(lbl);
    var input = el('input', { class: 'fd-field__file', type: 'file', accept: 'image/*' });
    input.addEventListener('change', function(e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        state[key] = ev.target.result;
        syncStateToDOM();
      };
      reader.readAsDataURL(file);
    });
    wrap.appendChild(input);
    return wrap;
  }

  function fieldRow(fields) {
    var cls = 'fd-field__row';
    if (fields.length === 3) cls += ' fd-field__row--3';
    else if (fields.length >= 4) cls += ' fd-field__row--4';
    var row = el('div', { class: cls });
    fields.forEach(function(f) { row.appendChild(f); });
    return row;
  }

  function numOptions(min, max) {
    var opts = [];
    for (var i = min; i <= max; i++) opts.push({ value: String(i), label: String(i) });
    return opts;
  }

  function combatOptions() {
    var opts = [];
    for (var base = 3; base <= 9; base++) {
      opts.push({ value: String(base), label: String(base) });
      for (var mult = 2; mult <= 4; mult++) opts.push({ value: base + 'X' + mult, label: base + 'x' + mult });
    }
    return opts;
  }

  function reqOptions() {
    return [
      { value: 'r', label: 'Red' },
      { value: 'g', label: 'Green' },
      { value: 'y', label: 'Yellow' },
      { value: 'b', label: 'Blue' }
    ];
  }

  renderEditor();
  renderPreview();
  document.getElementById('fd-editor').appendChild(buildExportBar());
})();
