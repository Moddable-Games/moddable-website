import { el, url } from './mg-core.js';
import { data } from './mg-core.js';
import { track } from './mg-analytics.js';

const SEARCH_INDEX = [
  {type:'mod', title:'Talisman Worlds', desc:'Open-world hex system replacing the Talisman board with 61 tiles', href:url('/mods/talisman-worlds/')},
  {type:'mod', title:'Hyper Imperium', desc:'Faster ruleset for TI4 + Prophecy of Kings', href:url('/mods/hyper-imperium/')},
  {type:'mod', title:'Econopoly', desc:'Monopoly with a working economy and dynamic pricing', href:url('/mods/econopoly/')},
  {type:'mod', title:'Dungeon Chess', desc:'Conversion — chess reimagined as asymmetric dungeon skirmish', href:url('/mods/dungeon-chess/')},
  {type:'mod', title:'Turkish Draughts', desc:'Orthogonal draughts with mandatory captures and flying kings', href:url('/mods/turkish-draughts/')},
  {type:'mod', title:'Lasca', desc:'Column checkers — captured pieces stack, all 22 stay in play', href:url('/mods/lasca/')},
  {type:'mod', title:'Toroidal Go', desc:'Go on a wraparound board — no corners, no edges, all groups float', href:url('/mods/toroidal-go/')},
  {type:'mod', title:'Phantom Go', desc:'Fog-of-war Go — players cannot see opponent stones', href:url('/mods/phantom-go/')},
  {type:'game', title:'Nukes', desc:'Cold-war territory control on a hex map. Hostages fuel your moves but reinforce your enemy', href:url('/games/nukes/')},
  {type:'game', title:'Planet Mongo', desc:'Hex-based territory control in the Flash Gordon universe. 8 factions, hidden orders, central market', href:url('/games/planet-mongo/')},
  {type:'game', title:'Endless Skies', desc:'4X space exploration with worker placement and fleet management. 8 asymmetric factions', href:url('/games/endless-skies/')},
  {type:'engine', title:'Moddable Chess', desc:'74 variants, one moddable engine', href:url('/engines/moddable-chess/')},
  {type:'engine', title:'Moddable Hexmaps', desc:'Hex map generation for 6 supported games', href:url('/engines/moddable-hexmaps/')},
  {type:'tool', title:'Dice Roller', desc:'Roll any combination of dice', href:url('/tools/dice/')},
  {type:'tool', title:'Deck Builder', desc:'Build and shuffle custom card decks', href:url('/tools/decks/')},
  {type:'tool', title:'TI4 Faction Picker', desc:'Random faction draft for Twilight Imperium', href:url('/tools/ti/')},
  {type:'tool', title:'TI4 Faction Designer', desc:'Design custom TI4 factions with auto-scaling text', href:url('/tools/ti/factions/')},
  {type:'tool', title:'Talisman Character Lottery', desc:'Random character selection for Talisman', href:url('/tools/talisman/')},
  {type:'tool', title:'Chess Variant Explorer', desc:'Load and play from 74 chess variants with 5 AI difficulties', href:url('/tools/chess/')},
  {type:'tool', title:'Nukes Tools', desc:'Target picker, fallout tracker, resource converter', href:url('/tools/nukes/')},
  {type:'page', title:'About', desc:'Our story and what we believe', href:url('/about/')},
  {type:'page', title:'Developers', desc:'AI-callable tools, MCP protocol, REST API', href:url('/developers/')},
  {type:'page', title:'Community', desc:'Join the Discord — designers, playtesters, rule-tinkerers', href:url('/community/')},
  {type:'page', title:'Submit a Mod', desc:'Share your homebrew with the community', href:url('/submit/')},
];

let newsIndex = null;
const TOOLS_API = 'https://tools.moddable.games/api/call';

function loadNewsIndex() {
  if (newsIndex) return;
  data.get('news').then(items => {
    newsIndex = items.map(p => ({type:'news', title:p.title, desc:p.excerpt, href:url('/news/' + p.slug + '/')}));
  });
}

function searchRulesAPI(query) {
  return fetch(TOOLS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool: 'rules_search', args: { query, limit: 8 } }),
  })
    .then(r => r.json())
    .then(d => (d.results || []).map(entry => ({
      type: 'rule',
      title: entry.heading,
      desc: entry.gameTitle + ' — ' + entry.section,
      href: 'https://rules.moddable.games/' + (entry.variantUrl || ('dist/' + entry.game + '/')) + '#' + entry.anchor
    })))
    .catch(() => []);
}

function getSearchIndex() {
  let idx = SEARCH_INDEX;
  if (newsIndex) idx = idx.concat(newsIndex);
  return idx;
}

let searchOverlay = null;

export function openSearch() {
  loadNewsIndex();
  if (searchOverlay) { searchOverlay.remove(); searchOverlay = null; }

  const overlay = el('div', {class:'mg-search-overlay'});
  const panel = el('div', {class:'mg-search-panel'});
  const header = el('div', {class:'mg-search-panel__header'});
  const input = el('input', {type:'text', class:'mg-search-panel__input', placeholder:'Search mods, games, rules, tools…', autofocus:'true'});
  header.appendChild(input);
  panel.appendChild(header);

  const results = el('div', {class:'mg-search-panel__results'});
  panel.appendChild(results);

  const ft = el('div', {class:'mg-search-panel__footer'});
  ft.innerHTML = '<div class="mg-search-panel__footer-hint"><span><kbd>↑↓</kbd> navigate</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></div>';
  panel.appendChild(ft);

  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  searchOverlay = overlay;

  requestAnimationFrame(() => { overlay.classList.add('mg-search-overlay--visible'); input.focus(); });

  function renderResults(query, rulesHits) {
    results.innerHTML = '';
    if (!query) {
      results.innerHTML = '<div class="mg-search-panel__empty"><div class="mg-search-panel__empty-title">Start typing to search</div><div class="mg-search-panel__empty-hint">Mods, games, rules, news, and tools</div></div>';
      return;
    }
    const q = query.toLowerCase();
    const localMatches = getSearchIndex().filter(item => item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q));
    const matches = localMatches.concat(rulesHits || []).slice(0, 10);
    if (matches.length === 0) {
      results.innerHTML = '<div class="mg-search-panel__empty"><div class="mg-search-panel__empty-title">No results</div><div class="mg-search-panel__empty-hint">Try a different search term</div></div>';
      return;
    }
    matches.forEach((item, i) => {
      const a = el('a', {href:item.href, class:'mg-search-result' + (i===0?' mg-search-result--active':'')});
      a.addEventListener('click', function() { track('select_content', { content_type: item.type, item_id: item.title }); });
      const badge = el('span', {class:'mg-search-result__type mg-search-result__type--'+item.type}, item.type);
      const content = el('div', {class:'mg-search-result__content'});
      content.appendChild(el('div', {class:'mg-search-result__title'}, item.title));
      content.appendChild(el('div', {class:'mg-search-result__desc'}, item.desc));
      a.appendChild(badge);
      a.appendChild(content);
      results.appendChild(a);
    });
  }

  renderResults('', []);
  let searchDebounce = null;
  let rulesDebounce = null;
  input.addEventListener('input', () => {
    const val = input.value.trim();
    renderResults(val, []);
    clearTimeout(searchDebounce);
    clearTimeout(rulesDebounce);
    if (val.length >= 2) {
      rulesDebounce = setTimeout(() => {
        searchRulesAPI(val).then(rulesHits => { renderResults(val, rulesHits); });
      }, 300);
    }
    if (val.length >= 3) {
      searchDebounce = setTimeout(() => { track('search', { search_term: val }); }, 800);
    }
  });

  let activeIdx = 0;
  input.addEventListener('keydown', (e) => {
    const items = results.querySelectorAll('.mg-search-result');
    if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = Math.min(activeIdx+1, items.length-1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx = Math.max(activeIdx-1, 0); }
    else if (e.key === 'Enter' && items[activeIdx]) { e.preventDefault(); items[activeIdx].click(); return; }
    else if (e.key === 'Escape') { closeSearch(); return; }
    else return;
    items.forEach((it, i) => it.classList.toggle('mg-search-result--active', i===activeIdx));
  });

  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSearch(); });
}

export function closeSearch() {
  if (!searchOverlay) return;
  searchOverlay.classList.remove('mg-search-overlay--visible');
  setTimeout(() => { if (searchOverlay) { searchOverlay.remove(); searchOverlay = null; } }, 200);
}

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
  if (e.key === 'Escape') closeSearch();
});

window.__mgOpenSearch = openSearch;
