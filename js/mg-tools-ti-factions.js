(function() {
  var el = MG.el;
  var url = MG.url;

  document.getElementById('nav-root').appendChild(MG.navbar('Tools'));
  document.getElementById('footer-root').appendChild(MG.footer());

  var IMG_BASE = url('/img/tools/ti4-factions/');

  var state = {
    factionName: '',
    factionQuote: '',
    factionQuoter: '',
    factionAbility1Title: '',
    factionAbility1: '',
    factionAbility2Title: '',
    factionAbility2: '',
    factionAbility3Title: '',
    factionAbility3: '',
    factionCommodities: '',
    factionResources: '',
    factionInfluence: '',
    flagshipName: '',
    flagshipTitle: '',
    flagshipAbility: '',
    flagshipCost: '',
    flagshipCombat: '',
    flagshipMove: '',
    flagshipCapacity: '',
    agentName: '',
    agentAbility: '',
    commanderName: '',
    commanderAbility: '',
    heroName: '',
    heroAbility: '',
    tech1Name: '',
    tech1Ability: '',
    tech1Req1: '',
    tech1Req2: '',
    tech1Req3: '',
    tech2Name: '',
    tech2Ability: '',
    tech2Req1: '',
    tech2Req2: '',
    tech2Req3: '',
    mechName: '',
    mechAbility: '',
    noteName: '',
    noteAbility: '',
    imgSymbol: null,
    imgRace: null,
    imgSystem: null,
    imgAgent: null,
    imgCommander: null,
    imgHero: null
  };

  function renderPreview() {
    var container = document.getElementById('fd-preview-inner');
    container.innerHTML = '';

    container.appendChild(buildFactionSheet());
    container.appendChild(buildLeadersRow());
    container.appendChild(buildTechRow());
  }

  function buildFactionSheet() {
    var wrap = el('div', {class: 'fd-card fd-faction'});
    var img = el('img', {class: 'fd-card__img', src: IMG_BASE + 'TI4-Faction-Blank.png', alt: 'Faction sheet'});
    var overlay = el('div', {class: 'fd-card__overlay'});

    overlay.appendChild(makeText('fd-faction__name fd-text--big', state.factionName || 'Faction Name'));
    overlay.appendChild(makeText('fd-faction__flagship-name fd-text--big', state.flagshipName || 'Flagship'));
    overlay.appendChild(makeText('fd-faction__flagship-title fd-text--big', state.flagshipTitle || ''));
    overlay.appendChild(makeText('fd-faction__flagship-ability fd-text--small', state.flagshipAbility || ''));
    overlay.appendChild(makeText('fd-faction__flagship-cost fd-text--big', state.flagshipCost || '?'));
    overlay.appendChild(makeText('fd-faction__flagship-combat fd-text--big', state.flagshipCombat || '?'));
    overlay.appendChild(makeText('fd-faction__flagship-move fd-text--big', state.flagshipMove || '?'));
    overlay.appendChild(makeText('fd-faction__flagship-capacity fd-text--big', state.flagshipCapacity || '?'));
    overlay.appendChild(makeText('fd-faction__resources fd-text--big', state.factionResources || '?'));
    overlay.appendChild(makeText('fd-faction__influence fd-text--big', state.factionInfluence || '?'));
    overlay.appendChild(makeText('fd-faction__quote fd-text--small', state.factionQuote || ''));
    overlay.appendChild(makeText('fd-faction__quoter fd-text--big', state.factionQuoter || ''));
    overlay.appendChild(makeText('fd-faction__ability1-title fd-text--big', state.factionAbility1Title || ''));
    overlay.appendChild(makeText('fd-faction__ability1 fd-text--small', state.factionAbility1 || ''));
    overlay.appendChild(makeText('fd-faction__ability2-title fd-text--big', state.factionAbility2Title || ''));
    overlay.appendChild(makeText('fd-faction__ability2 fd-text--small', state.factionAbility2 || ''));
    overlay.appendChild(makeText('fd-faction__ability3-title fd-text--big', state.factionAbility3Title || ''));
    overlay.appendChild(makeText('fd-faction__ability3 fd-text--small', state.factionAbility3 || ''));
    overlay.appendChild(makeText('fd-faction__commodities fd-text--big', state.factionCommodities || '?'));

    var symbolEl = el('div', {class: 'fd-text fd-faction__symbol'});
    if (state.imgSymbol) symbolEl.style.backgroundImage = 'url(' + state.imgSymbol + ')';
    else symbolEl.style.backgroundImage = 'url(' + IMG_BASE + 'placeholder-icon.png)';
    overlay.appendChild(symbolEl);

    var raceEl = el('div', {class: 'fd-text fd-faction__race-img'});
    if (state.imgRace) { raceEl.style.backgroundImage = 'url(' + state.imgRace + ')'; raceEl.style.opacity = '1'; }
    else raceEl.style.backgroundImage = 'url(' + IMG_BASE + 'placeholder-race-white.png)';
    overlay.appendChild(raceEl);

    var systemEl = el('div', {class: 'fd-text fd-faction__system-img'});
    if (state.imgSystem) { systemEl.style.backgroundImage = 'url(' + state.imgSystem + ')'; systemEl.style.opacity = '1'; }
    else systemEl.style.backgroundImage = 'url(' + IMG_BASE + 'placeholder-planet-white.png)';
    overlay.appendChild(systemEl);

    wrap.appendChild(img);
    wrap.appendChild(overlay);
    return wrap;
  }

  function buildLeadersRow() {
    var row = el('div', {class: 'fd-cards-row fd-cards-row--with-note'});
    var leaders = el('div', {class: 'fd-cards-3col'});

    leaders.appendChild(buildLeaderCard('Agent', state.agentName, state.agentAbility, state.imgAgent));
    leaders.appendChild(buildLeaderCard('Commander', state.commanderName, state.commanderAbility, state.imgCommander));
    leaders.appendChild(buildLeaderCard('Hero', state.heroName, state.heroAbility, state.imgHero));

    row.appendChild(leaders);
    row.appendChild(buildNoteCard());
    return row;
  }

  function buildLeaderCard(label, name, ability, imgData) {
    var wrap = el('div', {class: 'fd-card fd-leader'});
    var img = el('img', {class: 'fd-card__img', src: IMG_BASE + 'TI4-Leader-Blank.png', alt: label});
    var overlay = el('div', {class: 'fd-card__overlay'});

    var iconEl = el('div', {class: 'fd-text fd-leader__icon'});
    if (imgData) iconEl.style.backgroundImage = 'url(' + imgData + ')';
    else iconEl.style.backgroundImage = 'url(' + IMG_BASE + 'placeholder-icon.png)';
    overlay.appendChild(iconEl);

    overlay.appendChild(makeText('fd-leader__name fd-text--big', name || label + ' Name'));
    overlay.appendChild(makeText('fd-leader__label fd-text--big fd-text--green', label));
    overlay.appendChild(makeText('fd-leader__ability fd-text--small', ability || ''));

    wrap.appendChild(img);
    wrap.appendChild(overlay);
    return wrap;
  }

  function buildNoteCard() {
    var wrap = el('div', {class: 'fd-card fd-note'});
    var img = el('img', {class: 'fd-card__img', src: IMG_BASE + 'TI4-Note-Blank.png', alt: 'Note'});
    var overlay = el('div', {class: 'fd-card__overlay'});

    var iconEl = el('div', {class: 'fd-text fd-note__icon'});
    if (state.imgSymbol) iconEl.style.backgroundImage = 'url(' + state.imgSymbol + ')';
    else iconEl.style.backgroundImage = 'url(' + IMG_BASE + 'placeholder-icon.png)';
    overlay.appendChild(iconEl);

    overlay.appendChild(makeText('fd-note__name fd-text--big', state.noteName || 'Note'));
    overlay.appendChild(makeText('fd-note__ability fd-text--small', state.noteAbility || ''));

    wrap.appendChild(img);
    wrap.appendChild(overlay);
    return wrap;
  }

  function buildTechRow() {
    var row = el('div', {class: 'fd-cards-row'});

    row.appendChild(buildTechCard(state.tech1Name, state.tech1Ability, 'Tech #1', state.tech1Req1, state.tech1Req2, state.tech1Req3));
    row.appendChild(buildTechCard(state.tech2Name, state.tech2Ability, 'Tech #2', state.tech2Req1, state.tech2Req2, state.tech2Req3));
    row.appendChild(buildMechCard());

    return row;
  }

  function buildTechCard(name, ability, label, req1, req2, req3) {
    var wrap = el('div', {class: 'fd-card fd-tech'});
    var img = el('img', {class: 'fd-card__img', src: IMG_BASE + 'TI4-Technology-Blank.png', alt: label});
    var overlay = el('div', {class: 'fd-card__overlay'});

    var iconEl = el('div', {class: 'fd-text fd-tech__icon'});
    if (state.imgSymbol) iconEl.style.backgroundImage = 'url(' + state.imgSymbol + ')';
    else iconEl.style.backgroundImage = 'url(' + IMG_BASE + 'placeholder-icon.png)';
    overlay.appendChild(iconEl);

    overlay.appendChild(makeText('fd-tech__name fd-text--big', name || label));
    overlay.appendChild(makeText('fd-tech__label fd-text--big fd-text--green', label));
    overlay.appendChild(makeText('fd-tech__ability fd-text--small', ability || ''));

    if (req1) overlay.appendChild(makeReqPip('fd-tech__req1', req1));
    if (req2) overlay.appendChild(makeReqPip('fd-tech__req2', req2));
    if (req3) overlay.appendChild(makeReqPip('fd-tech__req3', req3));

    wrap.appendChild(img);
    wrap.appendChild(overlay);
    return wrap;
  }

  function buildMechCard() {
    var wrap = el('div', {class: 'fd-card fd-mech'});
    var img = el('img', {class: 'fd-card__img', src: IMG_BASE + 'TI4-Mech-Blank.png', alt: 'Mech'});
    var overlay = el('div', {class: 'fd-card__overlay'});

    var iconEl = el('div', {class: 'fd-text fd-mech__icon'});
    if (state.imgSymbol) iconEl.style.backgroundImage = 'url(' + state.imgSymbol + ')';
    else iconEl.style.backgroundImage = 'url(' + IMG_BASE + 'placeholder-icon.png)';
    overlay.appendChild(iconEl);

    overlay.appendChild(makeText('fd-mech__name fd-text--big', state.mechName || 'Mech'));
    overlay.appendChild(makeText('fd-mech__ability fd-text--small', state.mechAbility || ''));

    wrap.appendChild(img);
    wrap.appendChild(overlay);
    return wrap;
  }

  function makeText(cls, text) {
    var span = el('div', {class: 'fd-text ' + cls});
    span.textContent = text;
    return span;
  }

  function makeReqPip(cls, colour) {
    var pip = el('div', {class: 'fd-text ' + cls});
    var dot = el('span', {class: 'fd-req-pip fd-req-pip--' + colour});
    pip.appendChild(dot);
    return pip;
  }

  function renderEditor() {
    var editor = document.getElementById('fd-editor');
    editor.innerHTML = '';

    var tabs = el('div', {class: 'fd-editor__tabs'});
    var panels = [];
    var tabData = [
      {id: 'faction', label: 'Faction'},
      {id: 'flagship', label: 'Flagship'},
      {id: 'leaders', label: 'Leaders'},
      {id: 'tech', label: 'Tech'},
      {id: 'images', label: 'Images'}
    ];

    tabData.forEach(function(t, i) {
      var btn = el('button', {class: 'fd-editor__tab' + (i === 0 ? ' fd-editor__tab--active' : ''), 'data-tab': t.id});
      btn.textContent = t.label;
      btn.addEventListener('click', function() {
        tabs.querySelectorAll('.fd-editor__tab').forEach(function(b) { b.classList.remove('fd-editor__tab--active'); });
        btn.classList.add('fd-editor__tab--active');
        panels.forEach(function(p) { p.classList.remove('fd-editor__panel--active'); });
        document.getElementById('fd-panel-' + t.id).classList.add('fd-editor__panel--active');
      });
      tabs.appendChild(btn);
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
    var panel = el('div', {class: 'fd-editor__panel', id: 'fd-panel-faction'});
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
    var panel = el('div', {class: 'fd-editor__panel', id: 'fd-panel-flagship'});
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
    var panel = el('div', {class: 'fd-editor__panel', id: 'fd-panel-leaders'});
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
    var panel = el('div', {class: 'fd-editor__panel', id: 'fd-panel-tech'});
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
    var panel = el('div', {class: 'fd-editor__panel', id: 'fd-panel-images'});
    panel.appendChild(fileField('Faction Symbol', 'imgSymbol'));
    panel.appendChild(fileField('Race Art', 'imgRace'));
    panel.appendChild(fileField('Home System', 'imgSystem'));
    panel.appendChild(fileField('Agent Avatar', 'imgAgent'));
    panel.appendChild(fileField('Commander Avatar', 'imgCommander'));
    panel.appendChild(fileField('Hero Avatar', 'imgHero'));
    return panel;
  }

  function field(label, type, key, placeholder) {
    var wrap = el('div', {class: 'fd-field'});
    wrap.appendChild(el('label', {class: 'fd-field__label'}, label));
    var input = el('input', {class: 'fd-field__input', type: type, placeholder: placeholder || '', 'data-key': key});
    input.value = state[key] || '';
    input.addEventListener('input', function() {
      state[key] = input.value;
      renderPreview();
    });
    wrap.appendChild(input);
    return wrap;
  }

  function fieldSelect(label, key, options) {
    var wrap = el('div', {class: 'fd-field'});
    wrap.appendChild(el('label', {class: 'fd-field__label'}, label));
    var select = el('select', {class: 'fd-field__select', 'data-key': key});
    var def = el('option', {value: ''});
    def.textContent = '—';
    select.appendChild(def);
    options.forEach(function(o) {
      var opt = el('option', {value: o.value});
      opt.textContent = o.label;
      if (state[key] === o.value) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener('change', function() {
      state[key] = select.value;
      renderPreview();
    });
    wrap.appendChild(select);
    return wrap;
  }

  function fileField(label, key) {
    var wrap = el('div', {class: 'fd-field'});
    wrap.appendChild(el('label', {class: 'fd-field__label'}, label));
    var input = el('input', {class: 'fd-field__file', type: 'file', accept: 'image/*'});
    input.addEventListener('change', function(e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        state[key] = ev.target.result;
        renderPreview();
      };
      reader.readAsDataURL(file);
    });
    wrap.appendChild(input);
    return wrap;
  }

  function fieldRow(fields, multiCol) {
    var cls = 'fd-field__row';
    if (fields.length === 3) cls += ' fd-field__row--3';
    else if (fields.length >= 4) cls += ' fd-field__row--4';
    var row = el('div', {class: cls});
    fields.forEach(function(f) { row.appendChild(f); });
    return row;
  }

  function numOptions(min, max) {
    var opts = [];
    for (var i = min; i <= max; i++) {
      opts.push({value: String(i), label: String(i)});
    }
    return opts;
  }

  function combatOptions() {
    var opts = [];
    for (var base = 3; base <= 9; base++) {
      opts.push({value: String(base), label: String(base)});
      for (var mult = 2; mult <= 4; mult++) {
        opts.push({value: base + 'X' + mult, label: base + 'x' + mult});
      }
    }
    return opts;
  }

  function reqOptions() {
    return [
      {value: 'r', label: 'Red'},
      {value: 'g', label: 'Green'},
      {value: 'y', label: 'Yellow'},
      {value: 'b', label: 'Blue'}
    ];
  }

  renderEditor();
  renderPreview();
})();
