(function() {
  var el = MG.el;
  var linkBtn = MG.linkBtn;

  document.getElementById('nav-root').appendChild(MG.navbar('About'));
  document.getElementById('footer-root').appendChild(MG.footer());
  document.getElementById('page-hero').appendChild(MG.pageHero({
    eyebrow: 'COMMUNITY',
    title: '2,400 moddables<br>and counting.',
    lede: 'The Discord, the mod jams, the never-ending argument about whether Catan needs the Seafarers expansion.',
    withHorizon: true
  }));

  var STATS = [['2,400+','Discord members'],['12','published mods'],['3','mod jams run'],['6','team humans']];
  var sg = document.getElementById('stats-grid');
  STATS.forEach(function(pair) {
    var c = el('div', {class:'stat-card'});
    c.appendChild(el('div', {class:'stat-card__number'}, pair[0]));
    c.appendChild(el('div', {class:'stat-card__label'}, pair[1]));
    sg.appendChild(c);
  });

  var CHANNELS = [
    { name:'general',       desc:'The main table. Everything welcome.', members:342, accent:'#3a9928' },
    { name:'mod-pitches',   desc:'Share a mod idea. Get feedback.',       members:88,  accent:'#0c4f8d' },
    { name:'rules-debates', desc:'Rules arguments. Refereed by Tess.',    members:57,  accent:'#d11a1a' },
    { name:'playtesting',   desc:'Looking for testers, finding testers.', members:44,  accent:'#e89a1a' },
    { name:'nuke-catan',    desc:"It's its own channel. It needs it.",    members:210, accent:'#d11a1a' }
  ];
  var cl = document.getElementById('channels-list');
  CHANNELS.forEach(function(ch) {
    var a = el('a', {href:'#', class:'channel-link'});
    var bar = el('div', {class:'channel-link__bar'});
    bar.style.background = ch.accent;
    a.appendChild(bar);
    var txt = el('div');
    txt.appendChild(el('div', {class:'channel-link__name'}, '#' + ch.name));
    txt.appendChild(el('div', {class:'channel-link__desc'}, ch.desc));
    a.appendChild(txt);
    a.appendChild(el('div', {class:'channel-link__count'}, ch.members + ' online'));
    cl.appendChild(a);
  });

  var JAMS = [
    { n:'#1', title:'Carcassonne',  date:'Oct 2025', entries:8,  winner:'Infinite Meeple (by @hexbear)', color:'#3a9928' },
    { n:'#2', title:'Risk',         date:'Jan 2026', entries:22, winner:'Geo-political Risk (by @tessellate)', color:'#0c4f8d' },
    { n:'#3', title:'Catan',        date:'Apr 2026', entries:12, winner:'Nuke Catan v0.9 (by @ascelot)', color:'#d11a1a' }
  ];
  var jg = document.getElementById('jams-grid');
  JAMS.forEach(function(j) {
    var c = el('div', {class:'jam-card'});
    var eye = el('div', {class:'mg-card__eyebrow'});
    eye.style.color = j.color;
    eye.textContent = 'JAM ' + j.n;
    c.appendChild(eye);
    c.appendChild(el('h3', {class:'jam-card__title'}, j.title));
    var meta = el('div', {class:'jam-card__meta'});
    meta.textContent = j.date + ' · ' + j.entries + ' entries';
    c.appendChild(meta);
    var winner = el('div', {class:'jam-card__winner'});
    var winLabel = document.createElement('span');
    winLabel.className = 'jam-card__winner-label';
    winLabel.style.color = j.color;
    winLabel.textContent = 'Winner:';
    winner.appendChild(winLabel);
    winner.appendChild(document.createTextNode(' ' + j.winner));
    c.appendChild(winner);
    jg.appendChild(c);
  });

  var cb = document.getElementById('cta-btns');
  cb.appendChild(linkBtn('Open the Discord', '#', 'primary'));
  cb.appendChild(linkBtn('Submit a mod', '/submit/', 'outline-dark'));
})();
