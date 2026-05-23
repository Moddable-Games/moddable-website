(function() {
const { T, el, linkBtn, navbar, footer, modCard, url, rulesUrl } = MG;
document.getElementById('nav-root').appendChild(navbar('Games'));
document.getElementById('footer-root').appendChild(footer());

document.querySelector('[data-gradient]').style.background = 'linear-gradient(180deg,#0a0d2a 0%,#1a3680 45%,#000 100%)';
document.querySelector('[data-hex]').style.backgroundImage = `url('../../img/hex-grid-blue.svg')`;
document.querySelector('[data-accent]').style.background = T.green;
document.querySelector('[data-color]').style.color = '#6fb5ff';
document.querySelector('[data-color]').style.textShadow = '0 0 8px rgba(111,181,255,0.5)';

document.getElementById('hero-btns').appendChild(linkBtn('Read the Rules', rulesUrl('endless-skies'),'primary'));
document.getElementById('hero-btns').appendChild(linkBtn('Browse community mods','/mods/','outline-dark'));

const STATS = [['Players','1–4'],['Time','60 min'],['Age','10+'],['Designer','Moddable team'],['Released','Mar 2025'],['Updated','May 2026']];
const sb = document.getElementById('stats-bar');
STATS.forEach(([k,v],i) => {
  if(i>0) sb.appendChild(el('span',{class:'stats-row__divider'}));
  const d = el('div',{class:'stats-row__item'});
  d.appendChild(el('span',{class:'stats-row__label'},k));
  d.appendChild(el('span',{class:'stats-row__value'},v));
  sb.appendChild(d);
});

const STEPS = [
  {n:'01',title:'Lay the world',body:'19 hex tiles dealt face-down into a 3-ring spiral. No two games start the same.'},
  {n:'02',title:'Pick a faction',body:'Twelve faction decks: Cartographers, Storm-callers, Salvagers, Iron Banks… each breaks one rule.'},
  {n:'03',title:'Trade and tile',body:"Flip a tile to reveal a biome (sky, sea, surface). Trade resources — the speaker can veto one deal per round."},
  {n:'04',title:'End in the void',body:'Whoever reaches the Void first triggers endgame. Two more full rounds, then count points.'},
];
const sg = document.getElementById('steps-grid');
STEPS.forEach(s => {
  const a = el('article',{class:'mg-card'});
  a.appendChild(el('div',{class:'mg-card__eyebrow mg-eyebrow--green'},`${s.n}`));
  a.appendChild(el('h3',{class:'mg-card__title'},s.title));
  a.appendChild(el('p',{class:'mg-card__body'},s.body));
  sg.appendChild(a);
});

const HOOKS = [
  {name:'factions.yaml',desc:'Add a faction deck with one rule-breaker line. Validates against the base ruleset.'},
  {name:'biomes.yaml',desc:'Define new tile biomes — terrain, resources, victory contribution.'},
  {name:'endgame.lua',desc:'Override how the endgame is triggered. Useful for short-game variants.'},
  {name:'rules.md',desc:'Your version of the rulebook. Diffs are reviewed by the maintainers.'},
];
const hg = document.getElementById('hooks-grid');
HOOKS.forEach(h => {
  const d = el('div',{class:'hooks-card'});
  const icon = el('div',{class:'hooks-card__icon'});
  icon.textContent = '◈';
  d.appendChild(icon);
  const txt = el('div');
  txt.appendChild(el('div',{class:'hooks-card__name'},h.name));
  txt.appendChild(el('div',{class:'hooks-card__desc'},h.desc));
  d.appendChild(txt); hg.appendChild(d);
});

const COMM = [
  {category:'Reskin',baseGame:'Endless Skies',title:'Endless Skies: Inkwell',body:'All-monochrome tile set. Every faction recoloured into Edo-period woodblock palette.',stats:'2–4 players · 90 min · 12+'},
  {category:'Rebalance',baseGame:'Endless Skies',title:'Solo Skies',body:'A solo-mode bot using a 32-card AI deck. Three difficulty tiers.',stats:'1 player · 60 min · 14+'},
  {category:'Total conversion',baseGame:'Endless Skies',title:'Subterranean',body:'Same engine, underground theme. The Void becomes the Magma Heart. Hex tiles flipped sides.',stats:'2–4 players · 90 min · 12+'},
];
const cg = document.getElementById('comm-grid');
COMM.forEach(m => cg.appendChild(modCard(m)));
})();
