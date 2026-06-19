(function() {
  const { el, url } = window.MG;

  function footer() {
    const COLS = [
      { title:'Mods',      href:url('/mods/'),      links:[['Conversions',url('/mods/#Conversion')],['Rebalances',url('/mods/#Rebalance')],['Reskins',url('/mods/#Reskin')],['Submit Mod',url('/submit/')]] },
      { title:'Games',     href:url('/games/'),     links:[['Endless Skies',url('/games/endless-skies/')],['Planet Mongo',url('/games/planet-mongo/')],['Nukes',url('/games/nukes/')],['Rulebooks','https://rules.moddable.games/']] },
      { title:'Engines',   href:url('/engines/'),   links:[['Chess',url('/engines/moddable-chess/')],['Hexmaps',url('/engines/moddable-hexmaps/')]] },
      { title:'Developers', href:url('/developers/'), links:[['Tools API',url('/developers/api/')],['Examples',url('/developers/examples/')],['Live Server','https://tools.moddable.games/'],['GitHub','https://github.com/Moddable-Games']] },
      { title:'Tools',     href:url('/tools/'),     links:[['Twilight',url('/tools/ti/')],['Talisman',url('/tools/talisman/')],['Nukes',url('/tools/nukes/')],['Dice',url('/tools/dice/')],['Decks',url('/tools/decks/')],['Chess',url('/tools/chess/')]] },
      { title:'Community', href:url('/community/'), links:[['News',url('/news/')],['About',url('/about/')],['Roadmap',url('/about/roadmap/')],['Team',url('/team/')],['Press',url('/press/')],['Subscribe',url('/subscribe/')]] },
    ];

    const f = el('footer', { role:'contentinfo', 'aria-label':'Site footer', class:'mg-footer' });
    f.appendChild(el('div', { class:'mg-footer__hex', style:`background-image:url("${url('/img/hex-grid-blue.svg')}")` }));

    const inner = el('div', { class:'mg-footer__inner' });
    const grid = el('div', { class:'mg-footer__grid' });

    for (const col of COLS) {
      const c = el('div');
      const titleEl = el('h4', { class:'mg-footer__col-title' });
      const titleLink = el('a', { href:col.href, class:'mg-footer__col-title-link' }, col.title);
      titleEl.appendChild(titleLink);
      c.appendChild(titleEl);
      const ul = el('ul', { class:'mg-footer__col-list' });
      for (const [text, href] of col.links) {
        const attrs = { href, class:'mg-footer__col-link' };
        if (href.startsWith('http')) { attrs.target = '_blank'; attrs.rel = 'noopener'; }
        ul.appendChild(el('li', {}, el('a', attrs, text)));
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
