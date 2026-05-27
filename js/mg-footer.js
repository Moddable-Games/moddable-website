(function() {
  const { el, url } = window.MG;

  function footer() {
    const COLS = [
      { title:'Mods',      links:[['Total conversions',url('/mods/#Total conversion')],['Rebalances',url('/mods/#Rebalance')],['Reskins',url('/mods/#Reskin')],['Submit a mod',url('/submit/')]] },
      { title:'Games',     links:[['Endless Skies',url('/games/endless-skies/')],['Mongo',url('/games/mongo/')],['Nukes',url('/games/nukes/')],['Dungeon Chess',url('/games/dungeon-chess/')]] },
      { title:'Engines',   links:[['Moddable Chess',url('/engines/moddable-chess/')],['Moddable Hexmaps',url('/engines/moddable-hexmaps/')]] },
      { title:'Tools',     links:[['Workbench',url('/tools/')],['TI4 tools',url('/tools/ti/')],['Talisman tools',url('/tools/talisman/')],['Nukes tools',url('/tools/nukes/')],['Deck builder',url('/tools/decks/')],['Chess variants',url('/tools/chess/')]] },
      { title:'Community', links:[['Discord',url('/community/')],['News',url('/news/')],['About',url('/about/')],['Team',url('/team/')],['Press',url('/press/')],['Subscribe',url('/subscribe/')]] },
    ];

    const f = el('footer', { role:'contentinfo', 'aria-label':'Site footer', class:'mg-footer' });
    f.appendChild(el('div', { class:'mg-footer__hex', style:`background-image:url("${url('/img/hex-grid-blue.svg')}")` }));

    const inner = el('div', { class:'mg-footer__inner' });
    const grid = el('div', { class:'mg-footer__grid' });

    const brand = el('div');
    const logoWrap = el('div', { class:'mg-footer__logo-wrap' });
    logoWrap.appendChild(el('img', { src:url('/img/moddable-logo-white.png'), alt:'Moddable Games', class:'mg-footer__logo' }));
    brand.appendChild(logoWrap);
    brand.appendChild(el('p', { class:'mg-footer__tagline' }, 'Creating games you already own. Twelve mods. Three originals. One Discord.'));
    grid.appendChild(brand);

    for (const col of COLS) {
      const c = el('div');
      c.appendChild(el('h4', { class:'mg-footer__col-title' }, col.title));
      const ul = el('ul', { class:'mg-footer__col-list' });
      for (const [text, href] of col.links) {
        ul.appendChild(el('li', {}, el('a', { href, class:'mg-footer__col-link' }, text)));
      }
      c.appendChild(ul);
      grid.appendChild(c);
    }
    inner.appendChild(grid);

    const bottom = el('div', { class:'mg-footer__bottom' });
    bottom.appendChild(el('span', {}, '© 2026 Moddable.Games'));
    bottom.appendChild(el('span', {}, 'v' + window.MG.VERSION));
    inner.appendChild(bottom);
    f.appendChild(inner);
    return f;
  }

  Object.assign(window.MG, { footer });
})();
