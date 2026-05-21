(function() {
const { T, el, linkBtn, navbar, footer, modCard } = MG;
document.getElementById('nav-root').appendChild(navbar('Games'));
document.getElementById('footer-root').appendChild(footer());

document.querySelector('[data-gradient]').style.background = 'linear-gradient(180deg,#0a2a10 0%,#0d3a15 40%,#000 100%)';
document.querySelector('[data-hex]').style.backgroundImage = `url('../../img/hex-grid-green.svg')`;
document.querySelector('[data-accent]').style.background = T.green;
document.querySelector('[data-color]').style.color = '#4eb735';
document.querySelector('[data-color]').style.textShadow = '0 0 8px rgba(78,183,53,0.5)';
document.querySelector('[data-bloom]').style.background = 'radial-gradient(ellipse,rgba(58,153,40,0.25) 0%,transparent 65%)';

document.getElementById('hero-btns').appendChild(linkBtn('Sign up for playtest','#','green'));
document.getElementById('hero-btns').appendChild(linkBtn('Browse the GitHub','#','outline-dark'));

const STATS = [['Players','3–5'],['Time','30–45 min'],['Age','12+'],['Mechanism','Trick-taking'],['Status','Open beta'],['Spots left','143 / 200']];
const sb = document.getElementById('stats-bar');
STATS.forEach(([k,v],i) => {
  if(i>0) sb.appendChild(el('span',{class:'stats-row__divider'}));
  const d = el('div',{class:'stats-row__item'});
  d.appendChild(el('span',{class:'stats-row__label'},k));
  d.appendChild(el('span',{class:'stats-row__value'},v));
  sb.appendChild(d);
});

const STEPS = [
  {n:'01', title:'Deal the deck',     body:'54 cards, shuffled. Each player gets 7. The remaining stack is the Mongo pile — it changes shape every round.'},
  {n:'02', title:'Name the rule',     body:'The winner of the previous trick names one new rule for the next trick only. Anything within the Rule Book bounds.'},
  {n:'03', title:'Play a trick',      body:'Standard trick-taking: lead a card, follow suit if you can, highest card wins. Except the rule from step 2 overrides.'},
  {n:'04', title:'Stack the Mongo',   body:'Tricks are worth points based on cards played, not cards won. After 7 tricks, score. First to 50 wins.'},
];
const sg = document.getElementById('steps-grid');
STEPS.forEach(s => {
  const a = el('article',{class:'mg-card'});
  a.appendChild(el('div',{class:'mg-card__eyebrow mg-eyebrow--green'},`${s.n}`));
  a.appendChild(el('h3',{class:'mg-card__title'},s.title));
  a.appendChild(el('p',{class:'mg-card__body'},s.body));
  sg.appendChild(a);
});

const pb = document.getElementById('playtest-btns');
pb.appendChild(linkBtn('Sign up for playtest','#','green'));
pb.appendChild(linkBtn('Download the beta rules','#','outline-dark'));

const HOOKS = [
  {name:'rules.md',    desc:'The Rule Book: the constraints a rule-namer must stay within. Fork it to expand or restrict what rules are legal.'},
  {name:'deck.yaml',   desc:'Card definitions — suits, values, special behaviours. Add a fifth suit, remove the Jokers, invent wildcards.'},
  {name:'scoring.lua', desc:'The points formula. Default is pip-based. Override it to make tricks matter more, or turns, or anything else.'},
];
const hg = document.getElementById('hooks-grid');
HOOKS.forEach(h => {
  const d = el('div',{class:'mg-card mg-card--row'});
  const icon = el('div',{class:'mg-card__icon'});
  icon.style.background = T.green;
  icon.textContent = '◈';
  d.appendChild(icon);
  const txt = el('div');
  const title = el('div',{class:'mg-card__mono-title'});
  title.style.color = T.green;
  title.textContent = h.name;
  txt.appendChild(title);
  txt.appendChild(el('div',{class:'mg-card__desc'},h.desc));
  d.appendChild(txt); hg.appendChild(d);
});

const COMM = [
  {category:'Rebalance',baseGame:'Mongo',title:'Mongo: Quick Draw',body:'5-card hands instead of 7. Faster rounds, more volatile rule changes. Lunch-break mode.',stats:'3–5 players · 15 min · 10+'},
  {category:'Total conversion',baseGame:'Mongo',title:'Mongo: Spell Deck',body:'Fantasy theme. Rules become spells — "all cards played face-down" becomes "Fog of War", etc.',stats:'3–5 players · 45 min · 12+'},
  {category:'Reskin',baseGame:'Mongo',title:'Mongo: Neon',body:'Cyberpunk card art. Same rules, UV-reactive card backs for night sessions.',stats:'3–5 players · 30 min · 12+'},
];
const cg = document.getElementById('comm-grid');
COMM.forEach(m => cg.appendChild(MG.modCard(m)));
})();
