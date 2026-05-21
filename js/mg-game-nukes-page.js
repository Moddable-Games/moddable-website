(function() {
const { T, el, linkBtn, navbar, footer, url, modCard } = MG;
document.getElementById('nav-root').appendChild(navbar('Games'));
document.getElementById('footer-root').appendChild(footer());

document.querySelector('[data-gradient]').style.background = 'linear-gradient(180deg,#2a0a0a 0%,#3a0d0d 40%,#000 100%)';
document.querySelector('[data-hex]').style.backgroundImage = `url('../../img/hex-grid-red.svg')`;
document.querySelector('[data-accent]').style.background = T.red;
document.querySelector('[data-color]').style.color = '#e63232';
document.querySelector('[data-color]').style.textShadow = '0 0 8px rgba(230,50,50,0.5)';
document.querySelector('[data-bloom]').style.background = 'radial-gradient(ellipse,rgba(209,26,26,0.35) 0%,transparent 65%)';

document.getElementById('hero-btns').appendChild(linkBtn('Download Print-and-Play','#','red'));
document.getElementById('hero-btns').appendChild(linkBtn('Browse on GitHub','#','outline-dark'));

const STATS = [['Players','3'],['Turns','15'],['Time','60–90 min'],['Age','14+'],['Designer','Moddable team'],['Released','Jan 2026']];
const sb = document.getElementById('stats-bar');
STATS.forEach(([k,v],i) => {
  if(i>0) sb.appendChild(el('span',{class:'stats-row__divider'}));
  const d = el('div',{class:'stats-row__item'});
  d.appendChild(el('span',{class:'stats-row__label'},k));
  d.appendChild(el('span',{class:'stats-row__value'},v));
  sb.appendChild(d);
});

const STEPS = [
  {n:'01', title:'Divide the map',    body:'61 hexes dealt face-down. Each superpower places its capital on a starting hex. Claim three adjacent hexes as your heartland.'},
  {n:'02', title:'Build and expand',  body:'Spend resources to build units, fortify hexes, or research the one upgrade your superpower gets. Expand by conquest or diplomacy.'},
  {n:'03', title:'Negotiate',         body:"Every turn has a diplomacy phase before combat. Superpowers can form two-turn non-aggression pacts. They can break them. That's the game."},
  {n:'04', title:'Press or survive',  body:'After turn 15, or when The Button is pressed, the game ends. Points for hexes held, capitals standing, and alliances honoured.'},
];
const sg = document.getElementById('steps-grid');
STEPS.forEach(s => {
  const a = el('article',{class:'mg-card'});
  a.appendChild(el('div',{class:'mg-card__eyebrow mg-eyebrow--red'},`${s.n}`));
  a.appendChild(el('h3',{class:'mg-card__title'},s.title));
  a.appendChild(el('p',{class:'mg-card__body'},s.body));
  sg.appendChild(a);
});

document.getElementById('button-cta').appendChild(linkBtn('Download the rules','#','red'));
document.getElementById('button-cta').appendChild(linkBtn('See the tools','/tools/nukes/','outline-dark'));

const HOOKS = [
  {name:'superpowers.yaml', desc:'Three factions with asymmetric abilities. Add a fourth, reshape all three, or make them symmetric for a purer strategy game.'},
  {name:'map.yaml',         desc:'The starting hex layout and heartland rules. Change it to a linear strip, concentric rings, or a randomised deal.'},
  {name:'button.lua',       desc:'The Button rules — when it can be pressed, how large the fallout radius is, what the point penalty for losing your capital is.'},
  {name:'endgame.md',       desc:'Victory conditions and scoring formula. Default scores hexes + capitals. Override to make alliances worth more, or war worth less.'},
];
const hg = document.getElementById('hooks-grid');
HOOKS.forEach(h => {
  const d = el('div',{class:'mg-card mg-card--row'});
  const icon = el('div',{class:'mg-card__icon'});
  icon.style.background = T.red;
  icon.textContent = '◈';
  d.appendChild(icon);
  const txt = el('div');
  const title = el('div',{class:'mg-card__mono-title'});
  title.style.color = T.red;
  title.textContent = h.name;
  txt.appendChild(title);
  txt.appendChild(el('div',{class:'mg-card__desc'},h.desc));
  d.appendChild(txt); hg.appendChild(d);
});

const COMM = [
  {category:'Rebalance',baseGame:'Nukes',title:'Nukes: Diplomacy Mode',body:'Extended negotiation phase. Three-turn pacts become binding contracts with penalties for breaking them.',stats:'3 players · 90 min · 14+'},
  {category:'Total conversion',baseGame:'Nukes',title:'Nukes: Cold Space',body:'The same mechanics on a star map. Planets instead of hexes, fleets instead of armies, and the button launches a supernova.',stats:'2–4 players · 120 min · 14+'},
  {category:'Reskin',baseGame:'Nukes',title:'Nukes: Retro',body:'1950s propaganda art style. Same rules, different aesthetic. Print-and-play with period-accurate typography.',stats:'3 players · 60 min · 14+'},
];
const cg = document.getElementById('comm-grid');
COMM.forEach(m => cg.appendChild(MG.modCard(m)));
})();
