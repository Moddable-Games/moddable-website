(function() {
const { el, btn, linkBtn, navbar, footer, url, T } = MG;
document.getElementById('nav-root').appendChild(navbar('Tools'));
document.getElementById('footer-root').appendChild(footer());

/* ── TOOL DEFINITIONS ── */
const TOOLS = [
  { id:'dice',       title:'Roll anything.',        eyebrow:'DICE ROLLER',         category:'game-night', accent:'glow',  desc:'Standard RPG dice from d4 to d100, with modifiers.' },
  { id:'name-gen',   title:'Name your character.',  eyebrow:'NAME GENERATOR',      category:'creative',   accent:'blue',  desc:'Works for any hex-tile explorer, faction leader, or rule-bending rogue.' },
  { id:'score',      title:'Keep the count.',       eyebrow:'SCORE TRACKER',       category:'planning',   accent:'green', desc:'Tracks up to 6 players. Good for Catan VP, TI4 objectives, anything with points.' },
  { id:'timer',      title:"Time's up.",            eyebrow:'TURN TIMER',          category:'game-night', accent:'red',   desc:'Per-player countdown timer with cumulative stats.' },
  { id:'initiative', title:'Who goes next.',        eyebrow:'INITIATIVE TRACKER',  category:'game-night', accent:'blue',  desc:'Turn order tracker with initiative rolls.' },
  { id:'resources',  title:'Track the economy.',    eyebrow:'RESOURCE DASHBOARD',  category:'planning',   accent:'green', desc:'Multi-resource bank per player with trade logging. Built for Econopoly, Nukes, TI4.' },
  { id:'bag-tracker',title:"What's left?",           eyebrow:'BAG TRACKER',         category:'planning',   accent:'blue',  desc:'Track drawn tiles/cards. See remaining odds. Presets for Catan, Carcassonne, Scrabble.' },
  { id:'roles',      title:'Who are you, really?',  eyebrow:'ROLE DISTRIBUTOR',    category:'game-night', accent:'red',   desc:'Assign hidden roles for social deduction games. Tap-to-reveal, no app needed.' },
  { id:'rules',      title:'House rules, settled.', eyebrow:'RULES REFEREE',       category:'planning',   accent:'red',   desc:"Record your group's house rules. Search them mid-game. Never argue twice." },
  { id:'seating',    title:'Take your seats.',      eyebrow:'SEATING RANDOMIZER',  category:'game-night', accent:'glow',  desc:'Random player seating around the table.' },
];

const CATEGORIES = [
  { key:'all',          label:'All Tools' },
  { key:'game-night',   label:'Game Night' },
  { key:'planning',     label:'Planning' },
  { key:'creative',     label:'Creative' },
  { key:'mod-specific', label:'Mod-Specific' },
];

let activeCategory = 'all';

/* ── MOD-SPECIFIC LINKS ── */
const MOD_TOOLS = [
  { title:'Twilight Imperium', sub:'Galaxy generator · Faction picker · Objective tracker · Agenda voter', color:'#0c4f8d', href:url('/tools/ti/') },
  { title:'Talisman: Hexed',   sub:'Hex board generator · Character lottery · Encounter draw', color:'#5d2a8a', href:url('/tools/talisman/') },
  { title:'Nukes',             sub:'Hex map generator · Strike planner · Combat calculator · Hostage tracker', color:'#d11a1a', href:url('/tools/nukes/') },
  { title:'Card Deck Builder', sub:'Design · Shuffle · Deal — custom decks for any game', color:'#3a9928', href:url('/tools/decks/') },
  { title:'Chess Variants',    sub:'39 variants · Rules reference · Match setup', color:'#0c4f8d', href:url('/tools/chess/') },
  { title:'Hex Map Generator', sub:'Nukes · Talisman · Twilight Imperium — seeded maps, Canvas rendering', color:'#3a9928', href:url('/engines/moddable-hexmaps/') },
];
const mtg = document.getElementById('mod-tools-grid');
MOD_TOOLS.forEach(t => {
  const isExt = t.href.startsWith('http');
  const a = el('a',{href:t.href,class:'mod-tool-card', ...(isExt ? {target:'_blank',rel:'noopener'} : {})});
  a.addEventListener('mouseenter',()=>{ a.style.borderColor=t.color; });
  a.addEventListener('mouseleave',()=>{ a.style.borderColor=''; });
  const bar = el('div',{class:'mod-tool-card__bar'});
  bar.style.background = t.color;
  a.appendChild(bar);
  a.appendChild(el('div',{class:'mod-tool-card__title'},t.title));
  a.appendChild(el('div',{class:'mod-tool-card__sub'},t.sub));
  const cta = el('div',{class:'mod-tool-card__cta'},'Open tools →');
  cta.style.color = t.color;
  a.appendChild(cta);
  mtg.appendChild(a);
});

/* ── FILTER BAR ── */
function renderFilterBar() {
  const bar = document.getElementById('tools-category-bar');
  bar.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const b = document.createElement('button');
    b.className = 'tools-filter__btn' + (cat.key === activeCategory ? ' tools-filter__btn--active' : '');
    b.textContent = cat.label;
    b.addEventListener('click', () => { activeCategory = cat.key; renderFilterBar(); filterTools(); });
    bar.appendChild(b);
  });
}

function filterTools() {
  document.querySelectorAll('.tool-card[data-category]').forEach(card => {
    const cat = card.getAttribute('data-category');
    const show = activeCategory === 'all' || cat === activeCategory;
    card.classList.toggle('tool-card--hidden', !show);
  });
  const modSection = document.getElementById('mod-tools-section');
  const showMod = activeCategory === 'all' || activeCategory === 'mod-specific';
  modSection.classList.toggle('tools-section--hidden', !showMod);
}

/* ── RENDER CARD SHELLS ── */
function renderToolCards() {
  const grid = document.getElementById('tools-grid');
  TOOLS.forEach(tool => {
    const card = el('div', {class:'tool-card', 'data-category':tool.category});
    card.id = 'tool-' + tool.id;

    const header = el('div', {class:'tool-card__header'});
    header.appendChild(el('div', {class:'tool-card__accent tool-card__accent--' + tool.accent}));
    const headerText = el('div');
    headerText.appendChild(el('div', {class:'tool-card__eyebrow tool-card__eyebrow--' + tool.accent}, tool.eyebrow));
    headerText.appendChild(el('h3', {class:'tool-card__title'}, tool.title));
    headerText.appendChild(el('p', {class:'tool-card__desc'}, tool.desc));
    header.appendChild(headerText);
    card.appendChild(header);

    const body = el('div', {class: 'tool-card__body'});
    body.id = tool.id + '-body';
    card.appendChild(body);

    grid.appendChild(card);
  });
}

renderFilterBar();
renderToolCards();

/* ── DICE ROLLER ── */
(function() {
  const body = document.getElementById('dice-body');
  const DICE = [4,6,8,10,12,20,100];
  let selectedDie = 6, diceCount = 1, modifier = 0;

  const diceRow = el('div',{class:'dice-row'});
  body.appendChild(diceRow);
  DICE.forEach(d => {
    const b = document.createElement('button');
    b.className = 'die-face'; b.setAttribute('data-d', d);
    b.innerHTML = '<span class="die-face__label' + (d===100?' die-face__label--sm':'') + '">d' + d + '</span>';
    b.addEventListener('click', () => { selectedDie = d; updateDiceButtons(); });
    diceRow.appendChild(b);
  });

  function updateDiceButtons() {
    diceRow.querySelectorAll('.die-face').forEach(b => {
      const d = parseInt(b.getAttribute('data-d'));
      b.style.borderColor = d === selectedDie ? '#6fb5ff' : '';
      b.style.background = d === selectedDie ? '#e8f4ff' : '';
    });
  }
  updateDiceButtons();

  const controls = el('div',{class:'dice-controls'});
  controls.innerHTML = '<label class="dice-controls__label">Count:</label>';
  const countSlider = document.createElement('input');
  countSlider.type='range'; countSlider.min='1'; countSlider.max='10'; countSlider.value='1'; countSlider.className='dice-controls__range';
  const countLabel = el('span',{class:'dice-controls__value'},'1');
  countSlider.addEventListener('input', e => { diceCount = parseInt(e.target.value); countLabel.textContent = diceCount; });
  controls.appendChild(countSlider);
  controls.appendChild(countLabel);

  const modDiv = el('div',{class:'dice-controls__modifier'});
  modDiv.innerHTML = '<label class="dice-controls__label">Modifier:</label>';
  const modMinus = el('button',{class:'dice-controls__btn'},'−');
  const modVal = el('span',{class:'dice-controls__value dice-controls__value--wide'},'0');
  const modPlus = el('button',{class:'dice-controls__btn'},'+');
  modMinus.addEventListener('click', () => { modifier--; modVal.textContent = modifier >= 0 ? '+'+modifier : modifier; });
  modPlus.addEventListener('click', () => { modifier++; modVal.textContent = modifier >= 0 ? '+'+modifier : modifier; });
  modDiv.appendChild(modMinus); modDiv.appendChild(modVal); modDiv.appendChild(modPlus);
  controls.appendChild(modDiv);
  body.appendChild(controls);

  const rollResult = el('div',{class:'dice-result'},'—');
  const rollBreak = el('div',{class:'dice-breakdown'});
  body.appendChild(rollResult);
  body.appendChild(rollBreak);

  function rollDice() {
    const rolls = Array.from({length: diceCount}, () => Math.floor(Math.random() * selectedDie) + 1);
    const total = rolls.reduce((a,b)=>a+b,0) + modifier;
    rollResult.textContent = total;
    rollBreak.textContent = '[' + rolls.join(', ') + ']' + (modifier !== 0 ? (modifier>0?'+':'')+modifier : '') + ' = ' + total;
    diceRow.querySelectorAll('.die-face').forEach(b => {
      if (parseInt(b.getAttribute('data-d')) === selectedDie) {
        b.classList.add('rolling'); setTimeout(() => b.classList.remove('rolling'), 400);
      }
    });
  }
  body.appendChild(btn('Roll the dice', 'dark', rollDice));
})();

/* ── NAME GENERATOR ── */
(function() {
  const body = document.getElementById('name-gen-body');
  const NAME_PARTS = {
    fantasy:  { first:['Aerin','Brax','Calder','Dusk','Evren','Fenn','Gara','Hex','Ivar','Jora'], last:['of the Outer Ring','the Unmapped','Voidwalker','Stormcaller','Ironquill','the Hexed','Far-Shore'] },
    sci_fi:   { first:['Vega','Krix','Oryn','Zael','Pyx','Cade','Thorn','Sola','Nx-7','Clio'],    last:['of Sector Nine','Drifter','Null-Class','the Salvager','Protocol-Break','Station-Born'] },
    tabletop: { first:['The Merchant','The Cartographer','The Bandit','The Diplomat','The Engineer','The Warlord'], last:['of Catan','of the Void','of House Salvager','of the Outer Colonies','the Undefeated'] },
  };
  let nameStyle = 'fantasy';

  const filters = el('div',{class:'name-gen__filters'});
  Object.keys(NAME_PARTS).forEach(s => {
    const label = s.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase());
    const b = document.createElement('button');
    b.textContent = label; b.setAttribute('data-style', s);
    b.className = 'tools-filter__btn' + (s === nameStyle ? ' tools-filter__btn--active' : '');
    b.addEventListener('click', () => { nameStyle=s; refreshBtns(); generateName(); });
    filters.appendChild(b);
  });
  body.appendChild(filters);

  function refreshBtns() {
    filters.querySelectorAll('[data-style]').forEach(b => {
      b.className = 'tools-filter__btn' + (b.getAttribute('data-style') === nameStyle ? ' tools-filter__btn--active' : '');
    });
  }

  const nameResult = el('div',{class:'name-gen__result'},'—');
  const nameSub = el('div',{class:'name-gen__sub'});
  body.appendChild(nameResult);
  body.appendChild(nameSub);

  function generateName() {
    const parts = NAME_PARTS[nameStyle];
    nameResult.textContent = parts.first[Math.floor(Math.random()*parts.first.length)];
    nameSub.textContent = parts.last[Math.floor(Math.random()*parts.last.length)];
  }
  generateName();

  const btnsWrap = el('div',{class:'name-gen__btns'});
  btnsWrap.appendChild(btn('Generate', 'dark', generateName));
  btnsWrap.appendChild(btn('Regenerate first', 'outline-light', () => {
    const parts = NAME_PARTS[nameStyle];
    nameResult.textContent = parts.first[Math.floor(Math.random()*parts.first.length)];
  }));
  body.appendChild(btnsWrap);
})();

/* ── SCORE TRACKER ── */
(function() {
  const body = document.getElementById('score-body');
  const MAX_PLAYERS = 6;
  const PLAYER_COLORS = ['#d11a1a','#0c4f8d','#3a9928','#e89a1a','#5d2a8a','#936d62'];
  let players = [
    {name:'Player 1',score:0,color:PLAYER_COLORS[0]},
    {name:'Player 2',score:0,color:PLAYER_COLORS[1]},
  ];

  const board = el('div',{class:'score-board'});
  const btnsEl = el('div',{class:'score-board__btns'});
  body.appendChild(board);
  body.appendChild(btnsEl);

  function renderScoreboard() {
    board.innerHTML = '';
    players.forEach((p,i) => {
      const c = el('div',{class:'score-player'});
      c.style.cssText = 'background:#f5f4ef;border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:8px;border:2px solid ' + p.color + '22';
      const nameEl = document.createElement('div');
      nameEl.contentEditable = 'true';
      nameEl.style.cssText = 'font-family:var(--mg-font-body);font-weight:600;font-size:14px;color:#14161c;outline:none;border-bottom:1px dashed #c3c5cc;padding-bottom:4px';
      nameEl.textContent = p.name;
      nameEl.addEventListener('blur',()=>{players[i].name=nameEl.textContent.trim()||'Player '+(i+1);});
      c.appendChild(nameEl);
      const score = el('div');
      score.style.cssText = 'font-family:var(--mg-font-display);font-weight:600;font-size:48px;line-height:1;letter-spacing:-1px;color:'+p.color+';text-align:center';
      score.textContent = p.score;
      c.appendChild(score);
      const bRow = el('div');
      bRow.style.cssText = 'display:flex;gap:8px';
      const minus = document.createElement('button');
      minus.style.cssText = 'flex:1;height:36px;border-radius:9999px;background:#fff;border:1px solid #e6e3d8;font-family:var(--mg-font-body);font-weight:600;font-size:18px;cursor:pointer;color:#14161c';
      minus.textContent = '−';
      minus.addEventListener('click',()=>{players[i].score=Math.max(0,players[i].score-1);renderScoreboard();});
      const plus = document.createElement('button');
      plus.style.cssText = 'flex:1;height:36px;border-radius:9999px;background:'+p.color+';border:none;color:#fff;font-family:var(--mg-font-body);font-weight:600;font-size:18px;cursor:pointer';
      plus.textContent = '+';
      plus.addEventListener('click',()=>{players[i].score++;renderScoreboard();});
      bRow.appendChild(minus); bRow.appendChild(plus);
      c.appendChild(bRow);
      board.appendChild(c);
    });
  }
  renderScoreboard();

  btnsEl.appendChild(btn('Add player', 'dark', () => {
    if (players.length < MAX_PLAYERS) { players.push({name:'Player '+(players.length+1),score:0,color:PLAYER_COLORS[players.length]}); renderScoreboard(); }
  }));
  btnsEl.appendChild(btn('Reset scores', 'outline-light', () => { players.forEach(p => p.score = 0); renderScoreboard(); }));
})();

/* ── TURN TIMER ── */
(function() {
  const body = document.getElementById('timer-body');
  let timerPlayers = [], timePerTurn = 60, currentPlayerIdx = 0, timeRemaining = 60, interval = null, running = false, cumulativeTime = {};

  const playersEl = el('div'); const displayEl = el('div'); const controlsEl = el('div');
  body.appendChild(playersEl); body.appendChild(displayEl); body.appendChild(controlsEl);

  function formatTime(seconds) { const m = Math.floor(seconds/60); const s = seconds%60; return (m>0?m+':':'')+(m>0?String(s).padStart(2,'0'):s+'s'); }

  function renderSetup() {
    playersEl.innerHTML = ''; displayEl.innerHTML = ''; controlsEl.innerHTML = '';
    const row = el('div',{class:'timer-players'});
    const input = document.createElement('input'); input.className='timer-players__input'; input.placeholder='Player name...';
    input.addEventListener('keydown',(e)=>{ if(e.key==='Enter'&&input.value.trim()){addPlayer(input.value.trim());input.value='';} });
    row.appendChild(input);
    row.appendChild(btn('Add','red',()=>{ if(input.value.trim()){addPlayer(input.value.trim());input.value='';} }));
    playersEl.appendChild(row);
    if(timerPlayers.length>0){
      const tags=el('div',{class:'timer-players'});
      timerPlayers.forEach((name,i)=>{
        const tag=el('div',{class:'timer-players__tag'},name);
        const rm=el('button',{class:'timer-players__tag-remove'},'×');
        rm.addEventListener('click',()=>{timerPlayers.splice(i,1);delete cumulativeTime[name];renderSetup();});
        tag.appendChild(rm); tags.appendChild(tag);
      });
      playersEl.appendChild(tags);
    }
    const presets=el('div',{class:'timer-presets'});
    [30,60,90,120].forEach(sec=>{
      const b=document.createElement('button'); b.className='timer-preset-btn'+(sec===timePerTurn?' timer-preset-btn--active':''); b.textContent=sec+'s';
      b.addEventListener('click',()=>{timePerTurn=sec;timeRemaining=sec;renderSetup();}); presets.appendChild(b);
    });
    displayEl.appendChild(presets);
    displayEl.appendChild(el('div',{class:'timer-display'},formatTime(timePerTurn)));
    if(timerPlayers.length>0) displayEl.appendChild(el('div',{class:'timer-current'},timerPlayers[currentPlayerIdx]+"'s turn"));
    if(timerPlayers.length>=2){ const bw=el('div',{class:'timer-buttons'}); bw.appendChild(btn('Start','red',startTimer)); controlsEl.appendChild(bw); }
    renderStats();
  }

  function addPlayer(name){if(timerPlayers.length<8){timerPlayers.push(name);cumulativeTime[name]=0;renderSetup();}}
  function startTimer(){if(timerPlayers.length<2)return;running=true;timeRemaining=timePerTurn;renderRunning();interval=setInterval(tick,1000);}
  function tick(){timeRemaining--;cumulativeTime[timerPlayers[currentPlayerIdx]]++;if(timeRemaining<=0){clearInterval(interval);running=false;renderExpired();}else{updateDisplay();}}
  function updateDisplay(){const d=body.querySelector('.timer-display');if(d)d.textContent=formatTime(timeRemaining);renderStats();}

  function renderRunning(){
    displayEl.innerHTML='';controlsEl.innerHTML='';
    displayEl.appendChild(el('div',{class:'timer-display'},formatTime(timeRemaining)));
    displayEl.appendChild(el('div',{class:'timer-current'},timerPlayers[currentPlayerIdx]+"'s turn"));
    const bw=el('div',{class:'timer-buttons'});
    bw.appendChild(btn('Pause','outline-light',()=>{clearInterval(interval);running=false;
      const rw=el('div',{class:'timer-buttons'});rw.appendChild(btn('Resume','red',()=>{running=true;interval=setInterval(tick,1000);renderRunning();}));rw.appendChild(btn('Next Player','outline-light',nextPlayer));controlsEl.innerHTML='';controlsEl.appendChild(rw);renderStats();
    }));
    bw.appendChild(btn('Next Player','dark',nextPlayer));controlsEl.innerHTML='';controlsEl.appendChild(bw);renderStats();
  }

  function renderExpired(){
    displayEl.innerHTML='';controlsEl.innerHTML='';
    displayEl.appendChild(el('div',{class:'timer-display timer-display--expired'},'0s'));
    displayEl.appendChild(el('div',{class:'timer-current'},timerPlayers[currentPlayerIdx]+' — time expired!'));
    const bw=el('div',{class:'timer-buttons'});
    bw.appendChild(btn('Next Player','red',nextPlayer));
    bw.appendChild(btn('Reset','outline-light',()=>{clearInterval(interval);running=false;currentPlayerIdx=0;Object.keys(cumulativeTime).forEach(k=>cumulativeTime[k]=0);renderSetup();}));
    controlsEl.innerHTML='';controlsEl.appendChild(bw);renderStats();
  }

  function nextPlayer(){clearInterval(interval);currentPlayerIdx=(currentPlayerIdx+1)%timerPlayers.length;timeRemaining=timePerTurn;running=true;interval=setInterval(tick,1000);renderRunning();}

  function renderStats(){
    let se=controlsEl.querySelector('.timer-stats');if(se)se.remove();if(timerPlayers.length===0)return;
    se=el('div',{class:'timer-stats'});
    timerPlayers.forEach(name=>{const e=el('div',{class:'timer-stats__entry'});e.appendChild(el('div',{class:'timer-stats__name'},name));e.appendChild(el('div',{class:'timer-stats__time'},formatTime(cumulativeTime[name]||0)));se.appendChild(e);});
    controlsEl.appendChild(se);
  }
  renderSetup();
})();

/* ── INITIATIVE TRACKER ── */
(function() {
  const body = document.getElementById('initiative-body');
  let combatants = [], currentTurn = 0, round = 1;

  function render() {
    body.innerHTML = '';
    const addRow = el('div',{class:'init-add'});
    const nameInput = document.createElement('input'); nameInput.className='init-add__input init-add__input--name'; nameInput.placeholder='Name...';
    const initInput = document.createElement('input'); initInput.className='init-add__input init-add__input--number'; initInput.type='number'; initInput.placeholder='Init';
    const addFn = () => { const name=nameInput.value.trim(); const init=parseInt(initInput.value)||0; if(name){combatants.push({name,initiative:init});combatants.sort((a,b)=>b.initiative-a.initiative);nameInput.value='';initInput.value='';render();}};
    nameInput.addEventListener('keydown',(e)=>{if(e.key==='Enter')addFn();});
    initInput.addEventListener('keydown',(e)=>{if(e.key==='Enter')addFn();});
    addRow.appendChild(nameInput); addRow.appendChild(initInput); addRow.appendChild(btn('Add','blue',addFn));
    body.appendChild(addRow);

    if(combatants.length>0) body.appendChild(el('div',{class:'init-round'},'Round '+round));
    const list=el('div',{class:'init-list'});
    combatants.forEach((c,i)=>{
      const entry=el('div',{class:'init-entry'+(i===currentTurn?' init-entry--active':'')});
      entry.appendChild(el('div',{class:'init-entry__rank'},c.initiative.toString()));
      entry.appendChild(el('div',{class:'init-entry__name'},c.name));
      const rm=el('button',{class:'init-entry__remove'},'×');
      rm.addEventListener('click',()=>{combatants.splice(i,1);if(currentTurn>=combatants.length)currentTurn=0;render();});
      entry.appendChild(rm); list.appendChild(entry);
    });
    body.appendChild(list);

    if(combatants.length>0){
      const bw=el('div',{class:'init-buttons'});
      bw.appendChild(btn('Next Turn','blue',()=>{currentTurn++;if(currentTurn>=combatants.length){currentTurn=0;round++;}render();}));
      bw.appendChild(btn('New Round','outline-light',()=>{currentTurn=0;round++;render();}));
      bw.appendChild(btn('Randomize All','outline-light',()=>{combatants.forEach(c=>{c.initiative=Math.floor(Math.random()*20)+1;});combatants.sort((a,b)=>b.initiative-a.initiative);currentTurn=0;render();}));
      bw.appendChild(btn('Clear All','outline-light',()=>{combatants=[];currentTurn=0;round=1;render();}));
      body.appendChild(bw);
    }
  }
  render();
})();

/* ── RESOURCE DASHBOARD ── */
(function() {
  const body = document.getElementById('resources-body');
  const RESOURCE_PRESETS = {
    custom:    { label:'Custom', resources:[] },
    nukes:    { label:'Nukes', resources:['Hostages','Isotopes','Bases'] },
    ti4:      { label:'TI4', resources:['Trade Goods','Influence','Commodities'] },
    econopoly:{ label:'Econopoly', resources:['Cash','Property','Stock'] },
    catan:    { label:'Catan', resources:['Wood','Brick','Sheep','Wheat','Ore'] },
  };
  let preset = 'catan';
  let resources = [...RESOURCE_PRESETS.catan.resources];
  let players = [
    { name:'Player 1', values:{}, log:[] },
    { name:'Player 2', values:{}, log:[] },
  ];

  function initValues(p) { resources.forEach(r => { if (!(r in p.values)) p.values[r] = 0; }); }

  function renderDashboard() {
    body.innerHTML = '';
    players.forEach(p => initValues(p));

    const presetRow = el('div',{class:'res-presets'});
    Object.entries(RESOURCE_PRESETS).forEach(([key, cfg]) => {
      const b = document.createElement('button');
      b.className = 'tools-filter__btn' + (key === preset ? ' tools-filter__btn--active' : '');
      b.textContent = cfg.label;
      b.addEventListener('click', () => { preset = key; resources = [...cfg.resources]; players.forEach(p => { p.values = {}; p.log = []; }); renderDashboard(); });
      presetRow.appendChild(b);
    });
    body.appendChild(presetRow);

    const addResRow = el('div',{class:'res-add'});
    const resInput = document.createElement('input'); resInput.className='res-add__input'; resInput.placeholder='Add resource type...';
    const addResFn = () => { const v=resInput.value.trim(); if(v&&!resources.includes(v)){resources.push(v);resInput.value='';renderDashboard();} };
    resInput.addEventListener('keydown', e => { if(e.key==='Enter') addResFn(); });
    addResRow.appendChild(resInput);
    addResRow.appendChild(btn('Add','dark', addResFn));
    if (resources.length > 0) {
      const chips = el('div',{class:'res-chips'});
      resources.forEach((r,i) => {
        const chip = el('span',{class:'res-chip'}, r);
        const rm = el('button',{class:'res-chip__remove'},'×');
        rm.addEventListener('click', () => { resources.splice(i,1); players.forEach(p => delete p.values[r]); renderDashboard(); });
        chip.appendChild(rm);
        chips.appendChild(chip);
      });
      addResRow.appendChild(chips);
    }
    body.appendChild(addResRow);

    if (resources.length === 0) {
      body.appendChild(el('div',{class:'res-empty'}, 'Add resource types above to start tracking.'));
      return;
    }

    const grid = el('div',{class:'res-grid'});
    players.forEach((p, pi) => {
      const card = el('div',{class:'res-player'});
      const nameEl = document.createElement('div');
      nameEl.contentEditable = 'true';
      nameEl.className = 'res-player__name';
      nameEl.textContent = p.name;
      nameEl.addEventListener('blur', () => { p.name = nameEl.textContent.trim() || 'Player ' + (pi+1); });
      card.appendChild(nameEl);

      resources.forEach(r => {
        const row = el('div',{class:'res-row'});
        row.appendChild(el('span',{class:'res-row__label'}, r));
        const minus = document.createElement('button');
        minus.className = 'res-row__btn'; minus.textContent = '−';
        minus.addEventListener('click', () => { p.values[r]--; p.log.push({r,delta:-1,t:Date.now()}); renderDashboard(); });
        const val = el('span',{class:'res-row__value'}, String(p.values[r]));
        const plus = document.createElement('button');
        plus.className = 'res-row__btn res-row__btn--plus'; plus.textContent = '+';
        plus.addEventListener('click', () => { p.values[r]++; p.log.push({r,delta:1,t:Date.now()}); renderDashboard(); });
        row.appendChild(minus); row.appendChild(val); row.appendChild(plus);
        card.appendChild(row);
      });
      grid.appendChild(card);
    });
    body.appendChild(grid);

    const btnsRow = el('div',{class:'res-btns'});
    btnsRow.appendChild(btn('Add player','dark', () => {
      if (players.length < 6) { players.push({ name:'Player '+(players.length+1), values:{}, log:[] }); renderDashboard(); }
    }));
    btnsRow.appendChild(btn('Reset all','outline-light', () => {
      players.forEach(p => { Object.keys(p.values).forEach(k => p.values[k] = 0); p.log = []; }); renderDashboard();
    }));
    body.appendChild(btnsRow);
  }
  renderDashboard();
})();

/* ── BAG TRACKER ── */
(function() {
  const body = document.getElementById('bag-tracker-body');
  const PRESETS = {
    custom: { label:'Custom', items:[] },
    catan: { label:'Catan', items:[{name:'Wood',total:19},{name:'Brick',total:19},{name:'Sheep',total:19},{name:'Wheat',total:19},{name:'Ore',total:19}] },
    carcassonne: { label:'Carcassonne', items:[{name:'Road',total:24},{name:'City',total:22},{name:'Monastery',total:6},{name:'Field-only',total:4},{name:'Road+City',total:16}] },
    scrabble: { label:'Scrabble', items:[{name:'Vowels (AEIOU)',total:44},{name:'Common (RSTLNE)',total:36},{name:'Mid (DGHBCM)',total:17},{name:'Rare (JKQXZ)',total:5}] },
  };
  let activePreset = 'catan';
  let currentItems = PRESETS.catan.items.map(i => ({...i}));
  let drawn = {};

  function totalRemaining() { return currentItems.reduce((sum,it) => sum + Math.max(0, it.total - (drawn[it.name]||0)), 0); }

  function renderBag() {
    body.innerHTML = '';
    const presetRow = el('div',{class:'bag-presets'});
    Object.entries(PRESETS).forEach(([key,cfg]) => {
      const b = document.createElement('button');
      b.className = 'tools-filter__btn' + (key===activePreset ? ' tools-filter__btn--active' : '');
      b.textContent = cfg.label;
      b.addEventListener('click', () => { activePreset=key; currentItems=cfg.items.map(i=>({...i})); drawn={}; renderBag(); });
      presetRow.appendChild(b);
    });
    body.appendChild(presetRow);

    if (currentItems.length === 0) {
      body.appendChild(el('div',{class:'bag-empty'}, 'Add items to track what remains in the bag.'));
    }

    if (currentItems.length > 0) {
      const remaining = totalRemaining();
      const summary = el('div',{class:'bag-summary'});
      summary.appendChild(el('span',{class:'bag-summary__count'}, String(remaining)));
      summary.appendChild(el('span',{class:'bag-summary__label'}, ' remaining in bag'));
      body.appendChild(summary);

      const list = el('div',{class:'bag-list'});
      currentItems.forEach((it, idx) => {
        const d = drawn[it.name] || 0;
        const left = Math.max(0, it.total - d);
        const pct = remaining > 0 ? (left / remaining * 100).toFixed(0) : '0';

        const row = el('div',{class:'bag-row'});
        row.appendChild(el('span',{class:'bag-row__name'}, it.name));
        row.appendChild(el('span',{class:'bag-row__odds'}, pct + '%'));
        row.appendChild(el('span',{class:'bag-row__count'}, left + '/' + it.total));

        const drawBtn = document.createElement('button');
        drawBtn.className = 'bag-row__btn'; drawBtn.textContent = '+1 drawn';
        drawBtn.addEventListener('click', () => { if (left > 0) { drawn[it.name] = d + 1; renderBag(); } });
        row.appendChild(drawBtn);

        const undo = document.createElement('button');
        undo.className = 'bag-row__btn bag-row__btn--undo'; undo.textContent = 'Undo';
        undo.addEventListener('click', () => { if (d > 0) { drawn[it.name] = d - 1; renderBag(); } });
        row.appendChild(undo);

        const rm = document.createElement('button');
        rm.className = 'bag-row__btn bag-row__btn--undo'; rm.textContent = '×';
        rm.addEventListener('click', () => { currentItems.splice(idx,1); delete drawn[it.name]; renderBag(); });
        row.appendChild(rm);

        list.appendChild(row);
      });
      body.appendChild(list);
    }

    const addRow = el('div',{class:'bag-add'});
    const nameInput = document.createElement('input'); nameInput.className='bag-add__input'; nameInput.placeholder='Item name...';
    const totalInput = document.createElement('input'); totalInput.className='bag-add__input bag-add__input--num'; totalInput.type='number'; totalInput.placeholder='Qty'; totalInput.min='1';
    const addFn = () => { const n=nameInput.value.trim(); const t=parseInt(totalInput.value)||0; if(n&&t>0){currentItems.push({name:n,total:t});nameInput.value='';totalInput.value='';renderBag();} };
    nameInput.addEventListener('keydown', e => { if(e.key==='Enter') addFn(); });
    totalInput.addEventListener('keydown', e => { if(e.key==='Enter') addFn(); });
    addRow.appendChild(nameInput); addRow.appendChild(totalInput);
    addRow.appendChild(btn('Add','dark', addFn));
    body.appendChild(addRow);

    if (currentItems.length > 0) {
      const btns2 = el('div',{class:'bag-btns'});
      btns2.appendChild(btn('Reset draws','outline-light', () => { drawn={}; renderBag(); }));
      body.appendChild(btns2);
    }
  }
  renderBag();
})();

/* ── ROLE DISTRIBUTOR ── */
(function() {
  const body = document.getElementById('roles-body');
  const PRESETS = {
    custom: { label:'Custom', roles:[] },
    mafia: { label:'Mafia', roles:['Mafia','Mafia','Doctor','Detective','Town','Town','Town'] },
    werewolf: { label:'Werewolf', roles:['Werewolf','Werewolf','Seer','Witch','Hunter','Villager','Villager','Villager'] },
    botc: { label:'BotC', roles:['Imp','Poisoner','Washerwoman','Librarian','Investigator','Chef','Empath'] },
    resistance: { label:'Resistance', roles:['Spy','Spy','Resistance','Resistance','Resistance','Resistance'] },
  };
  let activePreset = 'mafia';
  let currentRoles = [...PRESETS.mafia.roles];
  let assigned = null;
  let revealed = {};

  function shuffle(arr) { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

  function renderRoles() {
    body.innerHTML = '';
    const presetRow = el('div',{class:'role-presets'});
    Object.entries(PRESETS).forEach(([key,cfg]) => {
      const b = document.createElement('button');
      b.className = 'tools-filter__btn' + (key===activePreset ? ' tools-filter__btn--active' : '');
      b.textContent = cfg.label;
      b.addEventListener('click', () => { activePreset=key; currentRoles=[...cfg.roles]; assigned=null; revealed={}; renderRoles(); });
      presetRow.appendChild(b);
    });
    body.appendChild(presetRow);

    if (!assigned) {
      const info = el('div',{class:'role-info'});
      info.appendChild(el('div',{class:'role-info__count'}, currentRoles.length + ' players'));
      const counts = {};
      currentRoles.forEach(r => { counts[r] = (counts[r]||0) + 1; });
      const chips = el('div',{class:'role-chips'});
      Object.entries(counts).forEach(([role, count]) => {
        const chip = el('span',{class:'role-chip'});
        chip.textContent = role + (count > 1 ? ' ×' + count : '');
        const rm = el('button',{class:'role-chip__remove'},'×');
        rm.addEventListener('click', (e) => { e.stopPropagation(); const idx = currentRoles.indexOf(role); if(idx>-1){currentRoles.splice(idx,1);renderRoles();} });
        chip.appendChild(rm);
        chips.appendChild(chip);
      });
      info.appendChild(chips);
      body.appendChild(info);

      const addRow = el('div',{class:'role-add'});
      const input = document.createElement('input'); input.className='role-add__input'; input.placeholder='Role name...';
      const addFn = () => { const v=input.value.trim(); if(v){currentRoles.push(v);input.value='';renderRoles();} };
      input.addEventListener('keydown', e => { if(e.key==='Enter') addFn(); });
      addRow.appendChild(input);
      addRow.appendChild(btn('Add role','dark', addFn));
      body.appendChild(addRow);

      if (currentRoles.length >= 2) {
        body.appendChild(btn('Deal roles','dark', () => { assigned = shuffle(currentRoles); revealed={}; renderRoles(); }));
      }
      return;
    }

    const grid = el('div',{class:'role-grid'});
    assigned.forEach((role, i) => {
      const card = el('div',{class:'role-card' + (revealed[i] ? ' role-card--revealed' : '')});
      card.appendChild(el('div',{class:'role-card__player'}, 'Player ' + (i+1)));
      card.appendChild(el('div',{class:'role-card__role'}, revealed[i] ? role : '???'));
      card.addEventListener('click', () => { revealed[i] = !revealed[i]; renderRoles(); });
      grid.appendChild(card);
    });
    body.appendChild(grid);
    body.appendChild(el('div',{class:'role-hint'}, 'Tap a card to reveal/hide. Pass the device to each player.'));

    const btns2 = el('div',{class:'role-btns'});
    btns2.appendChild(btn('Reshuffle','dark', () => { assigned = shuffle(currentRoles); revealed={}; renderRoles(); }));
    btns2.appendChild(btn('Edit roles','outline-light', () => { assigned=null; revealed={}; renderRoles(); }));
    body.appendChild(btns2);
  }
  renderRoles();
})();

/* ── RULES REFEREE ── */
(function() {
  const body = document.getElementById('rules-body');
  let rules = JSON.parse(localStorage.getItem('mg-house-rules') || '[]');

  const addRow = el('div',{class:'rules-add'});
  const ruleInput = document.createElement('input'); ruleInput.className='rules-add__input'; ruleInput.placeholder='Type a house rule...';
  const addFn = () => { const text = ruleInput.value.trim(); if(text){rules.push(text);save();ruleInput.value='';renderRules();} };
  ruleInput.addEventListener('keydown', e => { if(e.key==='Enter') addFn(); });
  addRow.appendChild(ruleInput);
  addRow.appendChild(btn('Add Rule','red',addFn));
  body.appendChild(addRow);

  const searchRow = el('div',{class:'rules-search'});
  const searchInput = document.createElement('input'); searchInput.className='rules-search__input'; searchInput.placeholder='Search rules...';
  searchInput.addEventListener('input', () => renderRules(searchInput.value.toLowerCase()));
  searchRow.appendChild(searchInput);
  body.appendChild(searchRow);

  const list = el('div',{class:'rules-list'});
  body.appendChild(list);

  function save() { localStorage.setItem('mg-house-rules', JSON.stringify(rules)); }

  function renderRules(filter) {
    list.innerHTML = '';
    const filtered = filter ? rules.filter(r => r.toLowerCase().includes(filter)) : rules;
    if (filtered.length === 0) {
      list.appendChild(el('div',{class:'rules-empty'}, rules.length === 0 ? 'No rules yet. Add your first house rule above.' : 'No rules match your search.'));
      return;
    }
    filtered.forEach((r) => {
      const idx = rules.indexOf(r);
      const entry = el('div',{class:'rules-entry'});
      entry.appendChild(el('span',{class:'rules-entry__num'},'#'+(idx+1)));
      entry.appendChild(el('span',{class:'rules-entry__text'},r));
      const rm = el('button',{class:'rules-entry__remove'},'×');
      rm.addEventListener('click', () => { rules.splice(idx,1); save(); renderRules(filter); });
      entry.appendChild(rm);
      list.appendChild(entry);
    });
  }
  renderRules();
})();

/* ── SEATING RANDOMIZER ── */
(function() {
  const body = document.getElementById('seating-body');
  let players = [];

  const addRow = el('div',{class:'seating-add'});
  const nameInput = document.createElement('input'); nameInput.className='seating-add__input'; nameInput.placeholder='Player name...';
  const addFn = () => { const name=nameInput.value.trim(); if(name&&!players.includes(name)){players.push(name);nameInput.value='';renderPlayers();} };
  nameInput.addEventListener('keydown', e => { if(e.key==='Enter') addFn(); });
  addRow.appendChild(nameInput);
  addRow.appendChild(btn('Add','dark',addFn));
  body.appendChild(addRow);

  const tags = el('div',{class:'seating-tags'});
  body.appendChild(tags);

  const resultEl = el('div',{class:'seating-result'});
  body.appendChild(resultEl);

  const btnsWrap = el('div',{class:'seating-buttons'});
  btnsWrap.appendChild(btn('Randomize Seats','dark', randomize));
  btnsWrap.appendChild(btn('Clear All','outline-light', () => { players=[]; renderPlayers(); resultEl.innerHTML=''; }));
  body.appendChild(btnsWrap);

  function renderPlayers() {
    tags.innerHTML = '';
    players.forEach((name, i) => {
      const tag = el('div',{class:'seating-tag'},name);
      const rm = el('button',{class:'seating-tag__remove'},'×');
      rm.addEventListener('click', () => { players.splice(i,1); renderPlayers(); resultEl.innerHTML=''; });
      tag.appendChild(rm); tags.appendChild(tag);
    });
  }

  function randomize() {
    if (players.length < 2) return;
    const shuffled = players.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    resultEl.innerHTML = '';
    const table = el('div',{class:'seating-table'});
    shuffled.forEach((name, i) => {
      const seat = el('div',{class:'seating-seat'});
      seat.appendChild(el('div',{class:'seating-seat__num'},'Seat '+(i+1)));
      seat.appendChild(el('div',{class:'seating-seat__name'},name));
      table.appendChild(seat);
    });
    resultEl.appendChild(table);
  }
})();

})();
