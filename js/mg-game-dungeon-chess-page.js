(function() {
const { T, el, linkBtn, navbar, footer, rulesUrl } = MG;
document.getElementById('nav-root').appendChild(navbar('Games'));
document.getElementById('footer-root').appendChild(footer());

document.querySelector('[data-gradient]').style.background = 'linear-gradient(180deg,#0a1f0a 0%,#0d2a0d 40%,#000 100%)';
document.querySelector('[data-hex]').style.backgroundImage = `url('../../img/hex-grid-green.svg')`;
document.querySelector('[data-accent]').style.background = T.green;
document.querySelector('[data-color]').style.color = '#4db83a';
document.querySelector('[data-color]').style.textShadow = '0 0 8px rgba(58,153,40,0.5)';

document.getElementById('hero-btns').appendChild(linkBtn('Play Online','https://dungeon.moddable.games','green'));
document.getElementById('hero-btns').appendChild(linkBtn('Read the Rules', rulesUrl('dungeon-chess'),'outline-dark'));

const STATS = [['Players','2–4'],['Factions','4'],['Time','30–120 min'],['Age','12+'],['Status','Live'],['Engine','MCE v0.4.2'],['Updated','May 2026']];
const sb = document.getElementById('stats-bar');
STATS.forEach(([k,v],i) => {
  if(i>0) sb.appendChild(el('span',{class:'stats-row__divider'}));
  const d = el('div',{class:'stats-row__item'});
  d.appendChild(el('span',{class:'stats-row__label'},k));
  d.appendChild(el('span',{class:'stats-row__value'},v));
  sb.appendChild(d);
});

const STEPS = [
  {n:'01', title:'Choose your faction',  body:'Humans, Undead, Demonics, or Greenskins. Each has 6 unique unit types with different costs, movements, and special abilities.'},
  {n:'02', title:'Draft your warband',   body:'Spend 75 XP to build your team. Must include a King and at least one Pawn. Every point is a tactical commitment — no two warbands are alike.'},
  {n:'03', title:'Deploy and battle',    body:'Place your units in your spawn zone, then take turns moving one piece. Capture enemies by moving onto their square. Terrain matters — water blocks, gaps divide, corridors create chokepoints.'},
  {n:'04', title:'Capture the King',     body:'The game ends the moment a King is captured. Protect yours, hunt theirs. Check forces a response — but there is no stalemate here.'},
];
const sg = document.getElementById('steps-grid');
STEPS.forEach(s => {
  const a = el('article',{class:'mg-card'});
  a.appendChild(el('div',{class:'mg-card__eyebrow mg-eyebrow--green'},`${s.n}`));
  a.appendChild(el('h3',{class:'mg-card__title'},s.title));
  a.appendChild(el('p',{class:'mg-card__body'},s.body));
  sg.appendChild(a);
});

const RACES = [
  {name:'Humans',    accent:'#c0c8d0', desc:'Balanced generalists. Archers attack across gaps, the Wizard splits movement and attack, and the Princess slides like a bishop.'},
  {name:'Undead',    accent:'#6b4fa0', desc:'Movement trickery. Wraiths phase through gaps, the Vampire reverses move/attack axes, and the Warlock attacks diagonally at range.'},
  {name:'Demonics',  accent:'#d11a1a', desc:'Devastating firepower. Kobolds and Iron Golems use cannon attacks — sliding through a screen piece to strike at range. The Red Dragon attacks as a knight.'},
  {name:'Greenskins',accent:'#3a9928', desc:'Brute force. Goblins and Ogres bring cannon attacks, while the Shaman commands full queen movement. The Warlord strikes as a knight.'},
];
const rg = document.getElementById('races-grid');
RACES.forEach(r => {
  const d = el('div',{class:'mg-card mg-card--light mg-card--row'});
  const icon = el('div',{class:'mg-card__icon'});
  icon.style.background = r.accent;
  icon.textContent = '♟';
  d.appendChild(icon);
  const txt = el('div');
  const title = el('div',{class:'mg-card__mono-title'});
  title.style.color = r.accent;
  title.textContent = r.name;
  txt.appendChild(title);
  txt.appendChild(el('div',{class:'mg-card__desc'},r.desc));
  d.appendChild(txt); rg.appendChild(d);
});

const HOOKS = [
  {name:'factions.json',  desc:'Four playable factions with distinct piece types, abilities, and XP trees. Fork one, rewrite all four, or add a fifth.'},
  {name:'maps.json',      desc:'Modular dungeon boards with terrain types. Change the shape, add hazards, or create entirely new battlegrounds.'},
  {name:'abilities.json', desc:'Hex abilities and unit specials. Rebalance, remove, or add new faction-specific powers.'},
  {name:'units.json',     desc:'Every unit definition — cost, movement, attack pattern, and special rules. The core data that drives the game.'},
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
})();
