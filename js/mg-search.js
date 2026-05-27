/* =========================================================================
   Moddable.Games — Global Search (Cmd+K)
   Extends window.MG (created by mg-core.js)
   ========================================================================= */

(function() {
  const { el, url } = window.MG;

  const SEARCH_INDEX = [
    {type:'mod', title:'Talisman: Hexed', desc:'Open-world hex system replacing the Talisman board with 61 tiles', href:url('/mods/talisman-hexed/')},
    {type:'mod', title:'Hyper Imperium', desc:'Faster ruleset for TI4 + Prophecy of Kings', href:url('/mods/hyper-imperium/')},
    {type:'mod', title:'Nuke Catan', desc:'Post-apocalyptic total conversion of Catan', href:url('/mods/nuke-catan/')},
    {type:'mod', title:'Econopoly', desc:'Monopoly with a working economy and dynamic pricing', href:url('/mods/econopoly/')},
    {type:'mod', title:'Anti-Monopoly', desc:'Public domain competitive variant of Monopoly', href:url('/mods/anti-monopoly/')},
    {type:'mod', title:'Flooded Catan', desc:'Rising sea levels slowly reduce the board', href:url('/mods/flooded-catan/')},
    {type:'mod', title:'The Diamond Mine', desc:'Total conversion turning Catan into a mining game', href:url('/mods/the-diamond-mine/')},
    {type:'mod', title:'Shattered Ascension', desc:'Community overhaul of TI4 with rebalanced factions', href:url('/mods/shattered-ascension/')},
    {type:'mod', title:'CivRisk', desc:'Risk rewritten to play like Civilisation', href:url('/mods/civrisk/')},
    {type:'game', title:'Nukes', desc:'Our original nuclear strategy game', href:url('/games/nukes/')},
    {type:'game', title:'Mongo', desc:'Fast-paced card battler', href:url('/games/mongo/')},
    {type:'game', title:'Endless Skies', desc:'Cooperative airship exploration', href:url('/games/endless-skies/')},
    {type:'engine', title:'Moddable Chess', desc:'2000+ variants, one moddable engine', href:url('/engines/moddable-chess/')},
    {type:'engine', title:'Moddable Hexmaps', desc:'Hex map generation for any game', href:url('/engines/moddable-hexmaps/')},
    {type:'tool', title:'Dice Roller', desc:'Roll any combination of dice', href:url('/tools/')},
    {type:'tool', title:'Turn Timer', desc:'Configurable player timer with presets', href:url('/tools/')},
    {type:'tool', title:'TI4 Faction Picker', desc:'Random faction draft for Twilight Imperium', href:url('/tools/ti/')},
    {type:'tool', title:'Talisman Character Lottery', desc:'Random character selection for Talisman', href:url('/tools/talisman/')},
    {type:'page', title:'About', desc:'Our story and what we believe', href:url('/about/')},
    {type:'page', title:'Community', desc:'Join the Discord — 2400+ members', href:url('/community/')},
    {type:'page', title:'Submit a Mod', desc:'Share your homebrew with the community', href:url('/submit/')},
  ];

  let newsIndex = null;

  function loadNewsIndex() {
    if (newsIndex) return;
    window.MG.data.get('news').then(items => {
      newsIndex = items.map(p => ({type:'news', title:p.title, desc:p.excerpt, href:url('/news/' + p.slug + '/')}));
    });
  }

  function getSearchIndex() {
    return newsIndex ? SEARCH_INDEX.concat(newsIndex) : SEARCH_INDEX;
  }

  let searchOverlay = null;

  function openSearch() {
    loadNewsIndex();
    if (searchOverlay) { searchOverlay.remove(); searchOverlay = null; }

    const overlay = el('div', {class:'mg-search-overlay'});
    const panel = el('div', {class:'mg-search-panel'});
    const header = el('div', {class:'mg-search-panel__header'});
    const input = el('input', {type:'text', class:'mg-search-panel__input', placeholder:'Search mods, games, news, tools…', autofocus:'true'});
    header.appendChild(input);
    panel.appendChild(header);

    const results = el('div', {class:'mg-search-panel__results'});
    panel.appendChild(results);

    const footer = el('div', {class:'mg-search-panel__footer'});
    footer.innerHTML = '<div class="mg-search-panel__footer-hint"><span><kbd>↑↓</kbd> navigate</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></div>';
    panel.appendChild(footer);

    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    searchOverlay = overlay;

    requestAnimationFrame(() => { overlay.classList.add('mg-search-overlay--visible'); input.focus(); });

    function renderResults(query) {
      results.innerHTML = '';
      if (!query) {
        results.innerHTML = '<div class="mg-search-panel__empty"><div class="mg-search-panel__empty-title">Start typing to search</div><div class="mg-search-panel__empty-hint">Mods, games, news articles, and tools</div></div>';
        return;
      }
      const q = query.toLowerCase();
      const matches = getSearchIndex().filter(item => item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q));
      if (matches.length === 0) {
        results.innerHTML = '<div class="mg-search-panel__empty"><div class="mg-search-panel__empty-title">No results</div><div class="mg-search-panel__empty-hint">Try a different search term</div></div>';
        return;
      }
      matches.slice(0, 8).forEach((item, i) => {
        const a = el('a', {href:item.href, class:'mg-search-result' + (i===0?' mg-search-result--active':'')});
        const badge = el('span', {class:'mg-search-result__type mg-search-result__type--'+item.type}, item.type);
        const content = el('div', {class:'mg-search-result__content'});
        content.appendChild(el('div', {class:'mg-search-result__title'}, item.title));
        content.appendChild(el('div', {class:'mg-search-result__desc'}, item.desc));
        a.appendChild(badge);
        a.appendChild(content);
        results.appendChild(a);
      });
    }

    renderResults('');
    input.addEventListener('input', () => renderResults(input.value.trim()));

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

  function closeSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.remove('mg-search-overlay--visible');
    setTimeout(() => { if (searchOverlay) { searchOverlay.remove(); searchOverlay = null; } }, 200);
  }

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
    if (e.key === 'Escape') closeSearch();
  });

  Object.assign(window.MG, { openSearch, closeSearch });
})();
