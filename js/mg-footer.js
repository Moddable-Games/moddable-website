(function() {
  const { el, url } = window.MG;

  function footer() {
    const COLS = [
      { title:'Mods',      href:url('/mods/'),      links:[['Conversions',url('/mods/#Conversion')],['Rebalances',url('/mods/#Rebalance')],['Reskins',url('/mods/#Reskin')],['Submit Mod',url('/submit/')]] },
      { title:'Games',     href:url('/games/'),     links:[['Endless Skies',url('/games/endless-skies/')],['Planet Mongo',url('/games/planet-mongo/')],['Nukes',url('/games/nukes/')]] },
      { title:'Engines',   href:url('/engines/'),   links:[['Chess',url('/engines/moddable-chess/')],['Hexmaps',url('/engines/moddable-hexmaps/')]] },
      { title:'Tools',     href:url('/tools/'),     links:[['Twilight',url('/tools/ti/')],['Talisman',url('/tools/talisman/')],['Nukes',url('/tools/nukes/')],['Dice',url('/tools/dice/')],['Decks',url('/tools/decks/')],['Chess',url('/tools/chess/')]] },
      { title:'Community', href:url('/community/'), links:[['News',url('/news/')],['About',url('/about/')],['Roadmap',url('/about/roadmap/')],['Team',url('/team/')],['Press',url('/press/')],['Subscribe',url('/subscribe/')]] },
    ];

    const f = el('footer', { role:'contentinfo', 'aria-label':'Site footer', class:'mg-footer' });
    f.appendChild(el('div', { class:'mg-footer__hex', style:`background-image:url("${url('/img/hex-grid-blue.svg')}")` }));

    const inner = el('div', { class:'mg-footer__inner' });
    const grid = el('div', { class:'mg-footer__grid' });

    const brand = el('div');
    const logoWrap = el('div', { class:'mg-footer__logo-wrap' });
    logoWrap.appendChild(el('img', { src:url('/img/moddable-logo-white.png'), alt:'Moddable Games', class:'mg-footer__logo' }));
    brand.appendChild(logoWrap);
    brand.appendChild(el('p', { class:'mg-footer__tagline' }, 'Open-source engines, community-built mods, and original games designed to be taken apart.'));
    grid.appendChild(brand);

    for (const col of COLS) {
      const c = el('div');
      const titleEl = el('h4', { class:'mg-footer__col-title' });
      const titleLink = el('a', { href:col.href, class:'mg-footer__col-title-link' }, col.title);
      titleEl.appendChild(titleLink);
      c.appendChild(titleEl);
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
