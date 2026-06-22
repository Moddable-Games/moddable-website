(function() {
  var el = MG.el;
  var url = MG.url;

  document.getElementById('nav-root').appendChild(MG.navbar('Tools'));
  document.getElementById('footer-root').appendChild(MG.footer());

  var IMG_BASE = url('/img/tools/ti4-factions/');

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

  /* ── Card DOM helpers ────────────────────────────────────────── */

  function mkDiv(className) {
    var d = document.createElement('div');
    d.className = className;
    return d;
  }

  function mkSpan(id) {
    var s = document.createElement('span');
    s.id = id;
    return s;
  }

  function mkImg(path) {
    var i = document.createElement('img');
    i.src = url(path);
    i.className = 'img-block';
    return i;
  }

  function textEl(className, spanId) {
    var d = mkDiv(className);
    d.appendChild(mkSpan(spanId));
    return d;
  }

  function buildLeaderCard(type, nameId, labelText, contentsId, iconClass) {
    var wrap = mkDiv('leader ' + type);
    wrap.appendChild(mkImg('/img/tools/ti4-factions/TI4-Leader-Blank.png'));
    var details = mkDiv('details');
    var rect = mkDiv('rectangle');
    rect.appendChild(mkDiv('icon ' + iconClass));
    rect.appendChild(textEl('title text big', nameId));
    var byline = mkDiv('byline text big green');
    var lbl = mkSpan(type + '-label');
    lbl.textContent = labelText;
    byline.appendChild(lbl);
    rect.appendChild(byline);
    rect.appendChild(mkDiv('avatar'));
    rect.appendChild(textEl('content text small', contentsId));
    details.appendChild(rect);
    wrap.appendChild(details);
    return wrap;
  }

  function buildTechCard(cssClass, png, nameId, labelText, labelSpanId, r1Id, r2Id, r3Id, contentsId) {
    var wrap = mkDiv(cssClass);
    wrap.appendChild(mkImg('/img/tools/ti4-factions/' + png));
    var details = mkDiv('details');
    var rect = mkDiv('rectangle');
    rect.appendChild(mkDiv('icon img-symbol'));
    rect.appendChild(textEl('title text big', nameId));
    if (labelText) {
      var byline = mkDiv('byline text big green');
      var lbl = mkSpan(labelSpanId);
      lbl.textContent = labelText;
      byline.appendChild(lbl);
      rect.appendChild(byline);
    }
    if (r1Id) {
      var r1 = mkDiv('reqs req1 text big'); r1.appendChild(mkSpan(r1Id)); rect.appendChild(r1);
      var r2 = mkDiv('reqs req2 text big'); r2.appendChild(mkSpan(r2Id)); rect.appendChild(r2);
      var r3 = mkDiv('reqs req3 text big'); r3.appendChild(mkSpan(r3Id)); rect.appendChild(r3);
    }
    rect.appendChild(textEl('content text small', contentsId));
    details.appendChild(rect);
    wrap.appendChild(details);
    return wrap;
  }

  function buildCardHTML() {
    var frag = document.createDocumentFragment();

    /* Faction sheet (full width) */
    var faction = mkDiv('faction back');
    faction.appendChild(mkImg('/img/tools/ti4-factions/TI4-Faction-Blank.png'));
    var fd = mkDiv('details');

    var flagship = mkDiv('rectangle flagship');
    flagship.appendChild(mkDiv('icon img-symbol'));
    flagship.appendChild(textEl('name text big', 'flagship-name'));
    flagship.appendChild(textEl('abilityt text big', 'flagship-title'));
    flagship.appendChild(textEl('ability text small', 'flagship-ability'));
    flagship.appendChild(textEl('cost text big', 'flagship-cost'));
    flagship.appendChild(textEl('combat text big', 'flagship-combat'));
    flagship.appendChild(textEl('move text big', 'flagship-move'));
    flagship.appendChild(textEl('capacity text big', 'flagship-capacity'));
    fd.appendChild(flagship);

    var system = mkDiv('rectangle system img-system');
    var res = mkDiv('resources');
    var resTitle = mkDiv('title text small');
    resTitle.appendChild(document.createTextNode('RESOURCES'));
    res.appendChild(resTitle);
    res.appendChild(textEl('text big', 'faction-resources'));
    system.appendChild(res);
    var inf = mkDiv('influence');
    var infTitle = mkDiv('title text small');
    infTitle.appendChild(document.createTextNode('INFLUENCE'));
    inf.appendChild(infTitle);
    inf.appendChild(textEl('text big', 'faction-influence'));
    system.appendChild(inf);
    fd.appendChild(system);

    fd.appendChild(mkDiv('rectangle race img-race'));

    var meta = mkDiv('rectangle meta');
    meta.appendChild(mkDiv('icon img-symbol'));
    meta.appendChild(textEl('quote text small', 'faction-quote'));
    meta.appendChild(textEl('quoter text big', 'faction-quoter'));
    fd.appendChild(meta);

    var abilities = mkDiv('rectangle abilities');
    abilities.appendChild(textEl('abilityt text big', 'faction-title1'));
    abilities.appendChild(textEl('ability text small', 'faction-ability1'));
    abilities.appendChild(textEl('abilityt2 text big', 'faction-title2'));
    abilities.appendChild(textEl('ability2 text small', 'faction-ability2'));
    abilities.appendChild(textEl('abilityt3 text big', 'faction-title3'));
    abilities.appendChild(textEl('ability3 text small', 'faction-ability3'));
    fd.appendChild(abilities);

    fd.appendChild(textEl('rectangle commodities text big', 'faction-commodities'));
    fd.appendChild(textEl('rectangle title text big', 'faction-name'));
    faction.appendChild(fd);
    frag.appendChild(faction);

    /* Leaders row */
    var leadersRow = mkDiv('leaders-row');
    leadersRow.appendChild(buildLeaderCard('agent', 'agent-name', 'Agent', 'agent-contents', 'img-agent'));
    leadersRow.appendChild(buildLeaderCard('commander', 'commander-name', 'Commander', 'commander-contents', 'img-commander'));
    leadersRow.appendChild(buildLeaderCard('hero', 'hero-name', 'Hero', 'hero-contents', 'img-hero'));

    var note = mkDiv('note');
    note.appendChild(mkImg('/img/tools/ti4-factions/TI4-Note-Blank.png'));
    var nd = mkDiv('details');
    var nr = mkDiv('rectangle');
    nr.appendChild(mkDiv('icon img-symbol'));
    nr.appendChild(textEl('title text big', 'note-name'));
    nr.appendChild(textEl('content text small', 'note-contents'));
    nd.appendChild(nr);
    note.appendChild(nd);
    leadersRow.appendChild(note);
    frag.appendChild(leadersRow);

    /* Tech row */
    var techRow = mkDiv('tech-row');
    techRow.appendChild(buildTechCard('tech tech1', 'TI4-Technology-Blank.png', 'tech1-name', 'Tech #1', 'tech1-label', 'req11-type', 'req12-type', 'req13-type', 'tech1-contents'));
    techRow.appendChild(buildTechCard('tech tech2', 'TI4-Technology-Blank.png', 'tech2-name', 'Tech #2', 'tech2-label', 'req21-type', 'req22-type', 'req23-type', 'tech2-contents'));
    techRow.appendChild(buildTechCard('tech mech', 'TI4-Mech-Blank.png', 'mech-name', null, null, null, null, null, 'mech-contents'));
    frag.appendChild(techRow);

    return frag;
  }

  function renderPreview() {
    var container = document.getElementById('fd-preview-inner');
    container.innerHTML = '';
    container.appendChild(buildCardHTML());
    syncStateToDOM();
  }

  function syncStateToDOM() {
    var map = {
      'factionName':          'faction-name',
      'factionQuote':         'faction-quote',
      'factionQuoter':        'faction-quoter',
      'factionAbility1Title': 'faction-title1',
      'factionAbility1':      'faction-ability1',
      'factionAbility2Title': 'faction-title2',
      'factionAbility2':      'faction-ability2',
      'factionAbility3Title': 'faction-title3',
      'factionAbility3':      'faction-ability3',
      'factionCommodities':   'faction-commodities',
      'factionResources':     'faction-resources',
      'factionInfluence':     'faction-influence',
      'flagshipName':         'flagship-name',
      'flagshipTitle':        'flagship-title',
      'flagshipAbility':      'flagship-ability',
      'flagshipCost':         'flagship-cost',
      'flagshipCombat':       'flagship-combat',
      'flagshipMove':         'flagship-move',
      'flagshipCapacity':     'flagship-capacity',
      'agentName':            'agent-name',
      'agentAbility':         'agent-contents',
      'commanderName':        'commander-name',
      'commanderAbility':     'commander-contents',
      'heroName':             'hero-name',
      'heroAbility':          'hero-contents',
      'tech1Name':            'tech1-name',
      'tech1Ability':         'tech1-contents',
      'tech2Name':            'tech2-name',
      'tech2Ability':         'tech2-contents',
      'mechName':             'mech-name',
      'mechAbility':          'mech-contents',
      'noteName':             'note-name',
      'noteAbility':          'note-contents'
    };
    Object.keys(map).forEach(function(k) {
      var s = document.getElementById(map[k]);
      if (s) s.textContent = state[k] || '';
    });

    var reqMap = {
      'tech1Req1': 'req11-type', 'tech1Req2': 'req12-type', 'tech1Req3': 'req13-type',
      'tech2Req1': 'req21-type', 'tech2Req2': 'req22-type', 'tech2Req3': 'req23-type'
    };
    Object.keys(reqMap).forEach(function(k) {
      var s = document.getElementById(reqMap[k]);
      if (s && s.parentElement) s.parentElement.setAttribute('data-req', state[k] || '');
    });

    setImg('.img-symbol',    state.imgSymbol    || IMG_BASE + 'placeholder-icon.png');
    setImg('.img-race',      state.imgRace      || IMG_BASE + 'placeholder-race-white.png');
    setImg('.img-system',    state.imgSystem    || IMG_BASE + 'placeholder-planet-white.png');
    setImg('.img-agent',     state.imgAgent     || IMG_BASE + 'placeholder-icon.png');
    setImg('.img-commander', state.imgCommander || IMG_BASE + 'placeholder-icon.png');
    setImg('.img-hero',      state.imgHero      || IMG_BASE + 'placeholder-icon.png');
  }

  function setImg(selector, src) {
    document.querySelectorAll(selector).forEach(function(e) {
      e.style.backgroundImage = 'url(' + src + ')';
    });
  }

  function printPreview() {
    window.print();
  }

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
    var bar = el('div', {class: 'fd-export-bar'});
    var printBtn = el('button', {class: 'fd-export-btn'});
    printBtn.textContent = 'Print / Save PDF';
    printBtn.addEventListener('click', printPreview);
    bar.appendChild(printBtn);
    var shareBtn = el('button', {class: 'fd-export-btn fd-export-btn--outline', id: 'fd-share-btn'});
    shareBtn.textContent = 'Copy Link';
    shareBtn.addEventListener('click', copyShareLink);
    bar.appendChild(shareBtn);
    return bar;
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
      var tabBtn = el('button', {class: 'fd-editor__tab' + (i === 0 ? ' fd-editor__tab--active' : ''), 'data-tab': t.id});
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
    var lbl = el('label', {class: 'fd-field__label'});
    lbl.textContent = label;
    wrap.appendChild(lbl);
    var input = el('input', {class: 'fd-field__input', type: type, placeholder: placeholder || '', 'data-key': key});
    input.value = state[key] || '';
    input.addEventListener('input', function() {
      state[key] = input.value;
      syncStateToDOM();
    });
    wrap.appendChild(input);
    return wrap;
  }

  function fieldSelect(label, key, options) {
    var wrap = el('div', {class: 'fd-field'});
    var lbl = el('label', {class: 'fd-field__label'});
    lbl.textContent = label;
    wrap.appendChild(lbl);
    var select = el('select', {class: 'fd-field__select', 'data-key': key});
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
    var wrap = el('div', {class: 'fd-field'});
    var lbl = el('label', {class: 'fd-field__label'});
    lbl.textContent = label;
    wrap.appendChild(lbl);
    var input = el('input', {class: 'fd-field__file', type: 'file', accept: 'image/*'});
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
    var row = el('div', {class: cls});
    fields.forEach(function(f) { row.appendChild(f); });
    return row;
  }

  function numOptions(min, max) {
    var opts = [];
    for (var i = min; i <= max; i++) opts.push({value: String(i), label: String(i)});
    return opts;
  }

  function combatOptions() {
    var opts = [];
    for (var base = 3; base <= 9; base++) {
      opts.push({value: String(base), label: String(base)});
      for (var mult = 2; mult <= 4; mult++) opts.push({value: base + 'X' + mult, label: base + 'x' + mult});
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
  document.getElementById('fd-editor').appendChild(buildExportBar());
})();
