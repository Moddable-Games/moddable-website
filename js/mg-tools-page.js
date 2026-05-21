(function() {
const { el, btn, linkBtn, navbar, footer, url } = MG;
document.getElementById('nav-root').appendChild(navbar('Tools'));
document.getElementById('footer-root').appendChild(footer());

// Mod-specific tool links
const MOD_TOOLS = [
  { title:'Twilight Imperium', sub:'Faction picker · Objective tracker · Agenda voter', color:'#0c4f8d', href:url('/tools/ti/') },
  { title:'Talisman: Hexed',   sub:'Character lottery · Hex board · Encounter draw', color:'#5d2a8a', href:url('/tools/talisman/') },
  { title:'Nuke Catan',        sub:'Target picker · Fallout tracker · Resource converter', color:'#d11a1a', href:url('/tools/nukes/') },
];
const mtg = document.getElementById('mod-tools-grid');
MOD_TOOLS.forEach(t => {
  const a = el('a',{href:t.href,class:'mod-tool-card'});
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

/* ── DICE ROLLER ── */
const DICE = [4,6,8,10,12,20,100];
let selectedDie = 6, diceCount = 1, modifier = 0;

const diceRow = document.getElementById('dice-row');
DICE.forEach(d => {
  const b = document.createElement('button');
  b.className = 'die-face';
  b.setAttribute('data-d', d);
  b.innerHTML = `<span class="die-face__label${d===100?' die-face__label--sm':''}">d${d}</span>`;
  b.addEventListener('click', () => { selectedDie = d; updateDiceButtons(); });
  diceRow.appendChild(b);
});

function updateDiceButtons() {
  document.querySelectorAll('.die-face').forEach(b => {
    const d = parseInt(b.getAttribute('data-d'));
    b.style.borderColor = d === selectedDie ? '#6fb5ff' : 'rgba(255,255,255,0.15)';
    b.style.background = d === selectedDie ? '#161721' : '#0a0a0a';
  });
}
updateDiceButtons();

const countSlider = document.getElementById('dice-count');
const countLabel = document.getElementById('dice-count-label');
countSlider.addEventListener('input', e => { diceCount = parseInt(e.target.value); countLabel.textContent = diceCount; });
document.getElementById('mod-minus').addEventListener('click', () => { modifier--; document.getElementById('modifier-val').textContent = modifier >= 0 ? '+'+modifier : modifier; });
document.getElementById('mod-plus').addEventListener('click', () => { modifier++; document.getElementById('modifier-val').textContent = modifier >= 0 ? '+'+modifier : modifier; });

const rollResult = document.getElementById('roll-result');
const rollBreak = document.getElementById('roll-breakdown');

function rollDice() {
  const rolls = Array.from({length: diceCount}, () => Math.floor(Math.random() * selectedDie) + 1);
  const total = rolls.reduce((a,b)=>a+b,0) + modifier;
  rollResult.textContent = total;
  rollBreak.textContent = `[${rolls.join(', ')}]${modifier !== 0 ? (modifier>0?'+':'')+modifier : ''} = ${total}`;
  // Animate dice buttons
  document.querySelectorAll('.die-face').forEach(b => {
    if (parseInt(b.getAttribute('data-d')) === selectedDie) {
      b.classList.add('rolling');
      setTimeout(() => b.classList.remove('rolling'), 400);
    }
  });
}

document.getElementById('roll-btn-wrap').appendChild(btn('Roll the dice', 'primary', rollDice));

/* ── NAME GENERATOR ── */
const NAME_PARTS = {
  fantasy:  { first:['Aerin','Brax','Calder','Dusk','Evren','Fenn','Gara','Hex','Ivar','Jora'], last:['of the Outer Ring','the Unmapped','Voidwalker','Stormcaller','Ironquill','the Hexed','Far-Shore'] },
  sci_fi:   { first:['Vega','Krix','Oryn','Zael','Pyx','Cade','Thorn','Sola','Nx-7','Clio'],    last:['of Sector Nine','Drifter','Null-Class','the Salvager','Protocol-Break','Station-Born'] },
  tabletop: { first:['The Merchant','The Cartographer','The Bandit','The Diplomat','The Engineer','The Warlord'], last:['of Catan','of the Void','of House Salvager','of the Outer Colonies','the Undefeated'] },
};
let nameStyle = 'fantasy';

const styleFilters = document.getElementById('style-filters');
Object.keys(NAME_PARTS).forEach(s => {
  const label = s.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase());
  const isA = s === nameStyle;
  const b = document.createElement('button');
  b.textContent = label; b.setAttribute('data-style', s);
  Object.assign(b.style, {fontFamily:'var(--mg-font-body)',fontWeight:600,fontSize:'13px',height:'34px',padding:'0 14px',borderRadius:'9999px',border:isA?'none':'1px solid #c3c5cc',background:isA?'#000':'transparent',color:isA?'#fff':'#14161c',cursor:'pointer',transition:'all 150ms'});
  b.addEventListener('click', () => { nameStyle=s; refreshStyleBtns(); generateName(); });
  styleFilters.appendChild(b);
});
function refreshStyleBtns(){document.querySelectorAll('[data-style]').forEach(b=>{const a=b.getAttribute('data-style')===nameStyle;b.style.background=a?'#000':'transparent';b.style.color=a?'#fff':'#14161c';b.style.border=a?'none':'1px solid #c3c5cc';});}

function generateName() {
  const parts = NAME_PARTS[nameStyle];
  const first = parts.first[Math.floor(Math.random()*parts.first.length)];
  const last = parts.last[Math.floor(Math.random()*parts.last.length)];
  document.getElementById('generated-name').textContent = first;
  document.getElementById('name-sub').textContent = last;
}
generateName();
const nbw = document.getElementById('name-btn-wrap');
nbw.appendChild(btn('Generate', 'primary', generateName));
nbw.appendChild(btn('Regenerate first', 'outline-light', () => {
  const parts = NAME_PARTS[nameStyle];
  document.getElementById('generated-name').textContent = parts.first[Math.floor(Math.random()*parts.first.length)];
}));

/* ── SCORE TRACKER ── */
const MAX_PLAYERS = 6;
const PLAYER_COLORS = ['#d11a1a','#0c4f8d','#3a9928','#e89a1a','#5d2a8a','#936d62'];
let players = [
  {name:'Player 1',score:0,color:PLAYER_COLORS[0]},
  {name:'Player 2',score:0,color:PLAYER_COLORS[1]},
];

function renderScoreboard() {
  const board = document.getElementById('score-board');
  board.innerHTML = '';
  players.forEach((p,i) => {
    const c = el('div',{style:{background:'#f5f4ef',borderRadius:'16px',padding:'16px',display:'flex',flexDirection:'column',gap:'8px',position:'relative',border:`2px solid ${p.color}22`}});
    const nameEl = el('div',{contenteditable:'true',style:{fontFamily:'var(--mg-font-body)',fontWeight:600,fontSize:'14px',color:'#14161c',outline:'none',borderBottom:'1px dashed #c3c5cc',paddingBottom:'4px'}},p.name);
    nameEl.addEventListener('blur',()=>{players[i].name=nameEl.textContent.trim()||`Player ${i+1}`;});
    c.appendChild(nameEl);
    const score = el('div',{style:{fontFamily:'var(--mg-font-display)',fontWeight:600,fontSize:'48px',lineHeight:'1',letterSpacing:'-1px',color:p.color,textAlign:'center'}},p.score.toString());
    c.appendChild(score);
    const btns = el('div',{style:{display:'flex',gap:'8px'}});
    const minus = el('button',{style:{flex:1,height:'36px',borderRadius:'9999px',background:'#fff',border:`1px solid ${T.hairlineLight}`,fontFamily:'var(--mg-font-body)',fontWeight:600,fontSize:'18px',cursor:'pointer',color:'#14161c'}},'-');
    minus.addEventListener('click',()=>{players[i].score=Math.max(0,players[i].score-1);renderScoreboard();});
    const plus = el('button',{style:{flex:1,height:'36px',borderRadius:'9999px',background:p.color,border:'none',color:'#fff',fontFamily:'var(--mg-font-body)',fontWeight:600,fontSize:'18px',cursor:'pointer'}},'+');
    plus.addEventListener('click',()=>{players[i].score++;renderScoreboard();});
    btns.appendChild(minus); btns.appendChild(plus);
    c.appendChild(btns);
    board.appendChild(c);
  });
}
const {T} = MG;
renderScoreboard();

const sb2 = document.getElementById('score-btns');
sb2.appendChild(btn('Add player', 'dark', () => {
  if (players.length < MAX_PLAYERS) {
    players.push({name:`Player ${players.length+1}`,score:0,color:PLAYER_COLORS[players.length]});
    renderScoreboard();
  }
}));
sb2.appendChild(btn('Reset scores', 'outline-light', () => {
  players.forEach(p => p.score = 0); renderScoreboard();
}));

/* ── VOTING BOOTH ── */
(function() {
  const setupEl = document.getElementById('vote-setup');
  const activeEl = document.getElementById('vote-active');
  const resultsEl = document.getElementById('vote-results');

  let voteQuestion = '';
  let voteOptions = ['', ''];
  let votes = [];
  let voterCount = 0;

  function renderSetup() {
    setupEl.innerHTML = '';
    activeEl.innerHTML = '';
    resultsEl.innerHTML = '';

    const qRow = el('div', {class: 'vote-setup__row'});
    const qInput = document.createElement('input');
    qInput.className = 'vote-setup__input';
    qInput.placeholder = 'Your question...';
    qInput.value = voteQuestion;
    qInput.addEventListener('input', () => { voteQuestion = qInput.value; });
    qRow.appendChild(qInput);
    setupEl.appendChild(qRow);

    const optWrap = el('div', {class: 'vote-setup__options'});
    voteOptions.forEach((opt, i) => {
      const row = el('div', {class: 'vote-setup__option-row'});
      const inp = document.createElement('input');
      inp.className = 'vote-setup__input';
      inp.placeholder = `Option ${i + 1}`;
      inp.value = opt;
      inp.addEventListener('input', () => { voteOptions[i] = inp.value; });
      row.appendChild(inp);
      if (voteOptions.length > 2) {
        const rm = el('button', {class: 'vote-setup__remove'}, '×');
        rm.addEventListener('click', () => { voteOptions.splice(i, 1); renderSetup(); });
        row.appendChild(rm);
      }
      optWrap.appendChild(row);
    });
    setupEl.appendChild(optWrap);

    const btnsWrap = el('div', {class: 'vote-setup__btns'});
    if (voteOptions.length < 6) {
      btnsWrap.appendChild(btn('Add option', 'outline-light', () => {
        voteOptions.push('');
        renderSetup();
      }));
    }
    btnsWrap.appendChild(btn('Start Vote', 'green', () => {
      if (!voteQuestion.trim()) return;
      const filled = voteOptions.filter(o => o.trim());
      if (filled.length < 2) return;
      voteOptions = filled;
      votes = new Array(voteOptions.length).fill(0);
      voterCount = 0;
      renderVoting();
    }));
    setupEl.appendChild(btnsWrap);
  }

  function renderVoting() {
    setupEl.innerHTML = '';
    resultsEl.innerHTML = '';
    activeEl.innerHTML = '';

    const q = el('div', {class: 'vote-active__question'}, voteQuestion);
    activeEl.appendChild(q);

    const info = el('div', {class: 'vote-active__info'}, `Voter ${voterCount + 1} — tap your choice, then pass the device.`);
    activeEl.appendChild(info);

    const optWrap = el('div', {class: 'vote-active__options'});
    voteOptions.forEach((opt, i) => {
      const b = el('button', {class: 'vote-option'}, opt);
      b.addEventListener('click', () => {
        votes[i]++;
        voterCount++;
        renderVoting();
      });
      optWrap.appendChild(b);
    });
    activeEl.appendChild(optWrap);

    const endBtn = btn('End Voting & Show Results', 'green', () => {
      renderResults();
    });
    activeEl.appendChild(endBtn);
  }

  function renderResults() {
    setupEl.innerHTML = '';
    activeEl.innerHTML = '';
    resultsEl.innerHTML = '';

    const q = el('div', {class: 'vote-results__question'}, voteQuestion);
    resultsEl.appendChild(q);

    const totalVotes = votes.reduce((a, b) => a + b, 0);
    voteOptions.forEach((opt, i) => {
      const pct = totalVotes > 0 ? Math.round((votes[i] / totalVotes) * 100) : 0;
      const wrap = el('div', {class: 'vote-results__bar-wrap'});
      const label = el('div', {class: 'vote-results__bar-label'});
      label.appendChild(el('span', {}, opt));
      label.appendChild(el('span', {}, `${votes[i]} (${pct}%)`));
      wrap.appendChild(label);
      const track = el('div', {class: 'vote-results__bar-track'});
      const fill = el('div', {class: 'vote-results__bar-fill'});
      fill.style.width = pct + '%';
      track.appendChild(fill);
      wrap.appendChild(track);
      resultsEl.appendChild(wrap);
    });

    const total = el('div', {class: 'vote-results__total'}, `${totalVotes} vote${totalVotes !== 1 ? 's' : ''} cast`);
    resultsEl.appendChild(total);

    const btnsWrap = el('div', {class: 'vote-results__btns'});
    btnsWrap.appendChild(btn('New Vote', 'green', () => {
      voteQuestion = '';
      voteOptions = ['', ''];
      votes = [];
      voterCount = 0;
      renderSetup();
    }));
    resultsEl.appendChild(btnsWrap);
  }

  renderSetup();
})();

/* ── SEATING RANDOMIZER ── */
(function() {
  const inputEl = document.getElementById('seat-input');
  const resultEl = document.getElementById('seat-result');
  const controlsEl = document.getElementById('seat-controls');

  let seatPlayers = [];
  let shuffled = [];

  function renderInput() {
    inputEl.innerHTML = '';
    resultEl.innerHTML = '';
    controlsEl.innerHTML = '';

    const row = el('div', {class: 'seat-input__row'});
    const field = document.createElement('input');
    field.className = 'seat-input__field';
    field.placeholder = 'Enter player name...';
    field.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && field.value.trim() && seatPlayers.length < 8) {
        seatPlayers.push(field.value.trim());
        field.value = '';
        renderInput();
      }
    });
    row.appendChild(field);
    const addBtn = btn('Add', 'primary', () => {
      if (field.value.trim() && seatPlayers.length < 8) {
        seatPlayers.push(field.value.trim());
        field.value = '';
        renderInput();
      }
    });
    row.appendChild(addBtn);
    inputEl.appendChild(row);

    if (seatPlayers.length > 0) {
      const list = el('div', {class: 'seat-input__list'});
      seatPlayers.forEach((name, i) => {
        const tag = el('div', {class: 'seat-input__tag'}, name);
        const rm = el('button', {class: 'seat-input__tag-remove'}, '×');
        rm.addEventListener('click', () => { seatPlayers.splice(i, 1); renderInput(); });
        tag.appendChild(rm);
        list.appendChild(tag);
      });
      inputEl.appendChild(list);
    }

    const btnsWrap = el('div', {class: 'seat-input__btns'});
    if (seatPlayers.length >= 3) {
      btnsWrap.appendChild(btn('Randomize', 'primary', () => {
        shuffle();
      }));
    }
    inputEl.appendChild(btnsWrap);
  }

  function shuffle() {
    shuffled = [...seatPlayers];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    renderResult();
  }

  function renderResult() {
    resultEl.innerHTML = '';
    controlsEl.innerHTML = '';

    const circle = el('div', {class: 'seat-circle'});
    const table = el('div', {class: 'seat-circle__table'}, 'TABLE');
    circle.appendChild(table);

    const radius = 120;
    const cx = 140;
    const cy = 140;
    shuffled.forEach((name, i) => {
      const angle = (2 * Math.PI * i / shuffled.length) - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      const player = el('div', {class: 'seat-circle__player' + (i === 0 ? ' seat-circle__player--first' : '')});
      player.style.left = x + 'px';
      player.style.top = y + 'px';
      if (i === 0) {
        player.appendChild(el('div', {class: 'seat-circle__star'}, '★'));
      }
      player.appendChild(el('div', {class: 'seat-circle__player-name'}, name));
      player.appendChild(el('div', {class: 'seat-circle__player-num'}, '#' + (i + 1)));
      circle.appendChild(player);
    });

    resultEl.appendChild(circle);

    const btnsWrap = el('div', {class: 'seat-controls__btns'});
    btnsWrap.appendChild(btn('Shuffle Again', 'primary', shuffle));
    btnsWrap.appendChild(btn('Reset', 'outline-light', () => {
      shuffled = [];
      renderInput();
    }));
    controlsEl.appendChild(btnsWrap);
  }

  renderInput();
})();

/* ── TURN TIMER ── */
(function() {
  const playersEl = document.getElementById('timer-players');
  const displayEl = document.getElementById('timer-display');
  const controlsEl = document.getElementById('timer-controls');

  let timerPlayers = [];
  let timePerTurn = 60;
  let currentPlayerIdx = 0;
  let timeRemaining = 60;
  let interval = null;
  let running = false;
  let cumulativeTime = {};

  function renderSetup() {
    playersEl.innerHTML = '';
    displayEl.innerHTML = '';
    controlsEl.innerHTML = '';

    // Player input row
    const row = el('div', {class: 'timer-players'});
    const input = document.createElement('input');
    input.className = 'timer-players__input';
    input.placeholder = 'Player name...';
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        addPlayer(input.value.trim());
        input.value = '';
      }
    });
    row.appendChild(input);
    row.appendChild(btn('Add', 'red', () => {
      if (input.value.trim()) {
        addPlayer(input.value.trim());
        input.value = '';
      }
    }));
    playersEl.appendChild(row);

    // Player tags
    if (timerPlayers.length > 0) {
      const tags = el('div', {class: 'timer-players'});
      timerPlayers.forEach((name, i) => {
        const tag = el('div', {class: 'timer-players__tag'}, name);
        const rm = el('button', {class: 'timer-players__tag-remove'}, '×');
        rm.addEventListener('click', () => { timerPlayers.splice(i, 1); delete cumulativeTime[name]; renderSetup(); });
        tag.appendChild(rm);
        tags.appendChild(tag);
      });
      playersEl.appendChild(tags);
    }

    // Time presets
    const presets = el('div', {class: 'timer-presets'});
    [30, 60, 90, 120].forEach(sec => {
      const b = document.createElement('button');
      b.className = 'timer-preset-btn' + (sec === timePerTurn ? ' timer-preset-btn--active' : '');
      b.textContent = sec + 's';
      b.addEventListener('click', () => {
        timePerTurn = sec;
        timeRemaining = sec;
        renderSetup();
      });
      presets.appendChild(b);
    });
    displayEl.appendChild(presets);

    // Display
    const display = el('div', {class: 'timer-display'}, formatTime(timePerTurn));
    displayEl.appendChild(display);

    // Current player label
    if (timerPlayers.length > 0) {
      const current = el('div', {class: 'timer-current'}, timerPlayers[currentPlayerIdx] + "'s turn");
      displayEl.appendChild(current);
    }

    // Controls
    if (timerPlayers.length >= 2) {
      const btnsWrap = el('div', {class: 'timer-buttons'});
      btnsWrap.appendChild(btn('Start', 'red', startTimer));
      controlsEl.appendChild(btnsWrap);
    }

    renderStats();
  }

  function addPlayer(name) {
    if (timerPlayers.length < 8) {
      timerPlayers.push(name);
      cumulativeTime[name] = 0;
      renderSetup();
    }
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return (m > 0 ? m + ':' : '') + (m > 0 ? String(s).padStart(2, '0') : s + 's');
  }

  function startTimer() {
    if (timerPlayers.length < 2) return;
    running = true;
    timeRemaining = timePerTurn;
    renderRunning();
    interval = setInterval(tick, 1000);
  }

  function tick() {
    timeRemaining--;
    cumulativeTime[timerPlayers[currentPlayerIdx]]++;
    if (timeRemaining <= 0) {
      clearInterval(interval);
      running = false;
      renderExpired();
    } else {
      updateDisplay();
    }
  }

  function updateDisplay() {
    const display = document.querySelector('.timer-display');
    if (display) display.textContent = formatTime(timeRemaining);
    renderStats();
  }

  function renderRunning() {
    displayEl.innerHTML = '';
    controlsEl.innerHTML = '';

    const display = el('div', {class: 'timer-display'}, formatTime(timeRemaining));
    displayEl.appendChild(display);

    const current = el('div', {class: 'timer-current'}, timerPlayers[currentPlayerIdx] + "'s turn");
    displayEl.appendChild(current);

    const btnsWrap = el('div', {class: 'timer-buttons'});
    btnsWrap.appendChild(btn('Pause', 'outline-light', () => {
      clearInterval(interval);
      running = false;
      const resumeWrap = el('div', {class: 'timer-buttons'});
      resumeWrap.appendChild(btn('Resume', 'red', () => {
        running = true;
        interval = setInterval(tick, 1000);
        renderRunning();
      }));
      resumeWrap.appendChild(btn('Next Player', 'outline-light', nextPlayer));
      controlsEl.innerHTML = '';
      controlsEl.appendChild(resumeWrap);
      renderStats();
    }));
    btnsWrap.appendChild(btn('Next Player', 'primary', nextPlayer));
    controlsEl.innerHTML = '';
    controlsEl.appendChild(btnsWrap);

    renderStats();
  }

  function renderExpired() {
    displayEl.innerHTML = '';
    controlsEl.innerHTML = '';

    const display = el('div', {class: 'timer-display timer-display--expired'}, '0s');
    displayEl.appendChild(display);

    const current = el('div', {class: 'timer-current'}, timerPlayers[currentPlayerIdx] + " — time expired!");
    displayEl.appendChild(current);

    const btnsWrap = el('div', {class: 'timer-buttons'});
    btnsWrap.appendChild(btn('Next Player', 'red', nextPlayer));
    btnsWrap.appendChild(btn('Reset', 'outline-light', () => {
      clearInterval(interval);
      running = false;
      currentPlayerIdx = 0;
      Object.keys(cumulativeTime).forEach(k => cumulativeTime[k] = 0);
      renderSetup();
    }));
    controlsEl.innerHTML = '';
    controlsEl.appendChild(btnsWrap);

    renderStats();
  }

  function nextPlayer() {
    clearInterval(interval);
    currentPlayerIdx = (currentPlayerIdx + 1) % timerPlayers.length;
    timeRemaining = timePerTurn;
    running = true;
    interval = setInterval(tick, 1000);
    renderRunning();
  }

  function renderStats() {
    let statsEl = document.querySelector('.timer-stats');
    if (statsEl) statsEl.remove();
    if (timerPlayers.length === 0) return;

    statsEl = el('div', {class: 'timer-stats'});
    timerPlayers.forEach(name => {
      const entry = el('div', {class: 'timer-stats__entry'});
      entry.appendChild(el('div', {class: 'timer-stats__name'}, name));
      entry.appendChild(el('div', {class: 'timer-stats__time'}, formatTime(cumulativeTime[name] || 0)));
      statsEl.appendChild(entry);
    });
    controlsEl.appendChild(statsEl);
  }

  renderSetup();
})();

/* ── INITIATIVE TRACKER ── */
(function() {
  const listEl = document.getElementById('init-list');
  const controlsEl = document.getElementById('init-controls');

  let combatants = [];
  let currentTurn = 0;
  let round = 1;

  function render() {
    listEl.innerHTML = '';
    controlsEl.innerHTML = '';

    // Add combatant form
    const addRow = el('div', {class: 'init-add'});
    const nameInput = document.createElement('input');
    nameInput.className = 'init-add__input init-add__input--name';
    nameInput.placeholder = 'Name...';
    const initInput = document.createElement('input');
    initInput.className = 'init-add__input init-add__input--number';
    initInput.type = 'number';
    initInput.placeholder = 'Init';
    const addFn = () => {
      const name = nameInput.value.trim();
      const init = parseInt(initInput.value) || 0;
      if (name) {
        combatants.push({name, initiative: init});
        combatants.sort((a, b) => b.initiative - a.initiative);
        nameInput.value = '';
        initInput.value = '';
        render();
      }
    };
    nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addFn(); });
    initInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addFn(); });
    addRow.appendChild(nameInput);
    addRow.appendChild(initInput);
    addRow.appendChild(btn('Add', 'blue', addFn));
    listEl.appendChild(addRow);

    // Round counter
    if (combatants.length > 0) {
      const roundEl = el('div', {class: 'init-round'}, 'Round ' + round);
      listEl.appendChild(roundEl);
    }

    // Combatant list
    const list = el('div', {class: 'init-list'});
    combatants.forEach((c, i) => {
      const entry = el('div', {class: 'init-entry' + (i === currentTurn ? ' init-entry--active' : '')});
      entry.appendChild(el('div', {class: 'init-entry__rank'}, c.initiative.toString()));
      entry.appendChild(el('div', {class: 'init-entry__name'}, c.name));
      const rm = el('button', {class: 'init-entry__remove'}, '×');
      rm.addEventListener('click', () => {
        combatants.splice(i, 1);
        if (currentTurn >= combatants.length) currentTurn = 0;
        render();
      });
      entry.appendChild(rm);
      list.appendChild(entry);
    });
    listEl.appendChild(list);

    // Control buttons
    if (combatants.length > 0) {
      const btnsWrap = el('div', {class: 'init-buttons'});
      btnsWrap.appendChild(btn('Next Turn', 'blue', () => {
        currentTurn++;
        if (currentTurn >= combatants.length) {
          currentTurn = 0;
          round++;
        }
        render();
      }));
      btnsWrap.appendChild(btn('New Round', 'outline-light', () => {
        currentTurn = 0;
        round++;
        render();
      }));
      btnsWrap.appendChild(btn('Randomize All', 'outline-light', () => {
        combatants.forEach(c => {
          c.initiative = Math.floor(Math.random() * 20) + 1;
        });
        combatants.sort((a, b) => b.initiative - a.initiative);
        currentTurn = 0;
        render();
      }));
      btnsWrap.appendChild(btn('Clear All', 'outline-light', () => {
        combatants = [];
        currentTurn = 0;
        round = 1;
        render();
      }));
      controlsEl.appendChild(btnsWrap);
    }
  }

  render();
})();

/* ── MAP GRID GENERATOR ── */
(function() {
  const controlsEl = document.getElementById('grid-controls');
  const previewEl = document.getElementById('grid-preview');
  previewEl.className = 'grid-preview';

  let gridType = 'square';
  let cellSize = 20;
  let gridRows = 10;
  let gridCols = 10;
  let lineColor = '#999999';

  const COLORS = [
    { label: 'Grey', value: '#999999' },
    { label: 'Blue', value: '#0c4f8d' },
    { label: 'Black', value: '#000000' }
  ];

  function buildControls() {
    controlsEl.innerHTML = '';

    // Grid type pills
    const typeRow = el('div', {class: 'grid-control'});
    typeRow.appendChild(el('span', {class: 'grid-control__label'}, 'Type:'));
    ['Square', 'Hex', 'Isometric'].forEach(function(t) {
      const val = t.toLowerCase();
      const pill = document.createElement('button');
      pill.className = 'grid-control__pill' + (gridType === val ? ' grid-control__pill--active' : '');
      pill.textContent = t;
      pill.addEventListener('click', function() { gridType = val; buildControls(); renderGrid(); });
      typeRow.appendChild(pill);
    });
    controlsEl.appendChild(typeRow);

    // Cell size slider
    const sizeRow = el('div', {class: 'grid-control'});
    sizeRow.appendChild(el('span', {class: 'grid-control__label'}, 'Cell size:'));
    const sizeRange = document.createElement('input');
    sizeRange.type = 'range';
    sizeRange.min = '10';
    sizeRange.max = '40';
    sizeRange.value = cellSize;
    sizeRange.className = 'grid-control__range';
    const sizeVal = el('span', {class: 'grid-control__value'}, cellSize + 'px');
    sizeRange.addEventListener('input', function() { cellSize = parseInt(sizeRange.value); sizeVal.textContent = cellSize + 'px'; renderGrid(); });
    sizeRow.appendChild(sizeRange);
    sizeRow.appendChild(sizeVal);
    controlsEl.appendChild(sizeRow);

    // Grid dimensions
    const dimRow = el('div', {class: 'grid-control'});
    dimRow.appendChild(el('span', {class: 'grid-control__label'}, 'Grid:'));
    const rowsInput = document.createElement('input');
    rowsInput.type = 'number';
    rowsInput.min = '2';
    rowsInput.max = '30';
    rowsInput.value = gridRows;
    rowsInput.className = 'grid-control__input';
    rowsInput.addEventListener('input', function() { gridRows = Math.max(2, Math.min(30, parseInt(rowsInput.value) || 2)); renderGrid(); });
    dimRow.appendChild(rowsInput);
    dimRow.appendChild(el('span', {class: 'grid-control__label'}, '×'));
    const colsInput = document.createElement('input');
    colsInput.type = 'number';
    colsInput.min = '2';
    colsInput.max = '30';
    colsInput.value = gridCols;
    colsInput.className = 'grid-control__input';
    colsInput.addEventListener('input', function() { gridCols = Math.max(2, Math.min(30, parseInt(colsInput.value) || 2)); renderGrid(); });
    dimRow.appendChild(colsInput);
    controlsEl.appendChild(dimRow);

    // Line color
    const colorRow = el('div', {class: 'grid-control'});
    colorRow.appendChild(el('span', {class: 'grid-control__label'}, 'Color:'));
    COLORS.forEach(function(c) {
      const swatch = document.createElement('button');
      swatch.className = 'grid-control__color' + (lineColor === c.value ? ' grid-control__color--active' : '');
      swatch.style.background = c.value;
      swatch.title = c.label;
      swatch.addEventListener('click', function() { lineColor = c.value; buildControls(); renderGrid(); });
      colorRow.appendChild(swatch);
    });
    controlsEl.appendChild(colorRow);

    // Action buttons
    const btnsRow = el('div', {class: 'grid-control__btns'});
    btnsRow.appendChild(btn('Download SVG', 'primary', downloadSVG));
    btnsRow.appendChild(btn('Print', 'outline-light', printGrid));
    controlsEl.appendChild(btnsRow);
  }

  function generateSquareSVG() {
    const w = gridCols * cellSize;
    const h = gridRows * cellSize;
    var paths = '';
    for (var r = 0; r <= gridRows; r++) {
      paths += '<line x1="0" y1="' + (r * cellSize) + '" x2="' + w + '" y2="' + (r * cellSize) + '" stroke="' + lineColor + '" stroke-width="1"/>';
    }
    for (var c = 0; c <= gridCols; c++) {
      paths += '<line x1="' + (c * cellSize) + '" y1="0" x2="' + (c * cellSize) + '" y2="' + h + '" stroke="' + lineColor + '" stroke-width="1"/>';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' + paths + '</svg>';
  }

  function generateHexSVG() {
    const size = cellSize;
    const hexW = size * Math.sqrt(3);
    const hexH = size * 2;
    const totalW = Math.ceil(hexW * gridCols + hexW / 2);
    const totalH = Math.ceil(hexH * 0.75 * gridRows + hexH * 0.25);
    var paths = '';
    for (var row = 0; row < gridRows; row++) {
      for (var col = 0; col < gridCols; col++) {
        var offsetX = row % 2 === 1 ? hexW / 2 : 0;
        var cx = col * hexW + hexW / 2 + offsetX;
        var cy = row * (hexH * 0.75) + size;
        var points = '';
        for (var i = 0; i < 6; i++) {
          var angle = (Math.PI / 180) * (60 * i - 30);
          var px = cx + size * Math.cos(angle);
          var py = cy + size * Math.sin(angle);
          points += (i === 0 ? '' : ' ') + px.toFixed(2) + ',' + py.toFixed(2);
        }
        paths += '<polygon points="' + points + '" fill="none" stroke="' + lineColor + '" stroke-width="1"/>';
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + totalW + '" height="' + totalH + '" viewBox="0 0 ' + totalW + ' ' + totalH + '">' + paths + '</svg>';
  }

  function generateIsoSVG() {
    const w = gridCols * cellSize;
    const h = gridRows * cellSize;
    var paths = '';
    // Faint orthogonal guides
    for (var r = 0; r <= gridRows; r++) {
      paths += '<line x1="0" y1="' + (r * cellSize) + '" x2="' + w + '" y2="' + (r * cellSize) + '" stroke="' + lineColor + '" stroke-width="0.5" stroke-opacity="0.3"/>';
    }
    for (var c = 0; c <= gridCols; c++) {
      paths += '<line x1="' + (c * cellSize) + '" y1="0" x2="' + (c * cellSize) + '" y2="' + h + '" stroke="' + lineColor + '" stroke-width="0.5" stroke-opacity="0.3"/>';
    }
    // Diagonal lines (down-right)
    for (var i = -(gridRows); i <= gridCols; i++) {
      var x1 = i * cellSize, y1 = 0, x2 = i * cellSize + h, y2 = h;
      paths += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + lineColor + '" stroke-width="1"/>';
    }
    // Diagonal lines (down-left)
    for (var j = 0; j <= gridCols + gridRows; j++) {
      var lx1 = j * cellSize, ly1 = 0, lx2 = j * cellSize - h, ly2 = h;
      paths += '<line x1="' + lx1 + '" y1="' + ly1 + '" x2="' + lx2 + '" y2="' + ly2 + '" stroke="' + lineColor + '" stroke-width="1"/>';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' + paths + '</svg>';
  }

  function renderGrid() {
    var svg;
    if (gridType === 'square') svg = generateSquareSVG();
    else if (gridType === 'hex') svg = generateHexSVG();
    else svg = generateIsoSVG();
    previewEl.innerHTML = svg;
  }

  function getSVGString() {
    if (gridType === 'square') return generateSquareSVG();
    if (gridType === 'hex') return generateHexSVG();
    return generateIsoSVG();
  }

  function downloadSVG() {
    const svgStr = getSVGString();
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u;
    a.download = 'grid-' + gridType + '-' + gridCols + 'x' + gridRows + '.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(u);
  }

  function printGrid() {
    const svgStr = getSVGString();
    const pw = window.open('', '_blank');
    pw.document.write('<!doctype html><html><head><title>Grid Print</title><style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;}svg{max-width:100%;max-height:100vh;}</style></head><body>' + svgStr + '</body></html>');
    pw.document.close();
    pw.focus();
    pw.print();
  }

  buildControls();
  renderGrid();
})();

/* ── RULES REFEREE ── */
(function() {
  const inputEl = document.getElementById('rules-input');
  const listEl = document.getElementById('rules-list-container');
  const STORAGE_KEY = 'mg_house_rules';

  function loadRules() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch(e) { return []; }
  }

  function saveRules(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  var houseRules = loadRules();
  var searchQuery = '';

  function buildForm() {
    inputEl.innerHTML = '';
    const form = el('div', {class: 'rules-form'});

    const row1 = el('div', {class: 'rules-form__row'});
    const gameInput = document.createElement('input');
    gameInput.className = 'rules-form__input';
    gameInput.placeholder = 'Game name';
    row1.appendChild(gameInput);

    const titleInput = document.createElement('input');
    titleInput.className = 'rules-form__input';
    titleInput.placeholder = 'Rule title';
    row1.appendChild(titleInput);
    form.appendChild(row1);

    const descArea = document.createElement('textarea');
    descArea.className = 'rules-form__textarea';
    descArea.placeholder = 'Describe the rule...';
    form.appendChild(descArea);

    const row2 = el('div', {class: 'rules-form__row'});
    const catSelect = document.createElement('select');
    catSelect.className = 'rules-form__select';
    ['Gameplay', 'Setup', 'Scoring', 'Disputes'].forEach(function(c) {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      catSelect.appendChild(opt);
    });
    row2.appendChild(catSelect);
    form.appendChild(row2);

    const btnsRow = el('div', {class: 'rules-form__btns'});
    btnsRow.appendChild(btn('Add Rule', 'primary', function() {
      const game = gameInput.value.trim();
      const title = titleInput.value.trim();
      const desc = descArea.value.trim();
      const cat = catSelect.value;
      if (!game || !title || !desc) return;
      houseRules.push({ id: Date.now(), game: game, title: title, desc: desc, category: cat, timestamp: new Date().toISOString() });
      saveRules(houseRules);
      gameInput.value = '';
      titleInput.value = '';
      descArea.value = '';
      renderRulesList();
    }));
    btnsRow.appendChild(btn('Export JSON', 'outline-light', exportRules));
    form.appendChild(btnsRow);

    inputEl.appendChild(form);
  }

  function renderRulesList() {
    listEl.innerHTML = '';

    // Search bar
    const searchWrap = el('div', {class: 'rules-search'});
    const searchInput = document.createElement('input');
    searchInput.className = 'rules-search__input';
    searchInput.placeholder = 'Search rules...';
    searchInput.value = searchQuery;
    searchInput.addEventListener('input', function() { searchQuery = searchInput.value; renderRulesList(); });
    searchWrap.appendChild(searchInput);
    listEl.appendChild(searchWrap);

    // Filter rules
    const filtered = houseRules.filter(function(r) {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return r.game.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
    });

    if (filtered.length === 0) {
      const empty = el('div', {class: 'rules-empty'}, houseRules.length === 0 ? 'No house rules yet. Add your first one above.' : 'No rules match your search.');
      listEl.appendChild(empty);
      return;
    }

    const list = el('div', {class: 'rules-list'});
    filtered.forEach(function(r) {
      const card = el('div', {class: 'rules-card'});

      const header = el('div', {class: 'rules-card__header'});
      header.appendChild(el('span', {class: 'rules-card__game'}, r.game));
      header.appendChild(el('span', {class: 'rules-card__tag'}, r.category));
      card.appendChild(header);

      card.appendChild(el('div', {class: 'rules-card__title'}, r.title));
      card.appendChild(el('div', {class: 'rules-card__desc'}, r.desc));

      const footer = el('div', {class: 'rules-card__footer'});
      const date = new Date(r.timestamp);
      footer.appendChild(el('span', {class: 'rules-card__time'}, date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})));
      const delBtn = document.createElement('button');
      delBtn.className = 'rules-card__delete';
      delBtn.textContent = 'Delete';
      delBtn.addEventListener('click', function() {
        if (confirm('Delete this rule?')) {
          houseRules = houseRules.filter(function(x) { return x.id !== r.id; });
          saveRules(houseRules);
          renderRulesList();
        }
      });
      footer.appendChild(delBtn);
      card.appendChild(footer);

      list.appendChild(card);
    });
    listEl.appendChild(list);
  }

  function exportRules() {
    if (houseRules.length === 0) return;
    const blob = new Blob([JSON.stringify(houseRules, null, 2)], { type: 'application/json' });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u;
    a.download = 'house-rules.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(u);
  }

  buildForm();
  renderRulesList();
})();
})();
