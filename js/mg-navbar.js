(function() {
  const { T, el, url, linkBtn } = window.MG;

  function navbar(activeId) {
    const NAV_ITEMS = [
      { id:'Mods', href:url('/mods/'), accent:'#e63232', children:[['Conversions',url('/mods/#Conversion')],['Rebalances',url('/mods/#Rebalance')],['Reskins',url('/mods/#Reskin')],['Submit Mod',url('/submit/')]] },
      { id:'Engines', href:url('/engines/'), accent:'#06b6d4', children:[['Chess',url('/engines/moddable-chess/')],['Hexmaps',url('/engines/moddable-hexmaps/')]] },
      { id:'Games', href:url('/games/'), accent:'#e8a91a', children:[['Nukes',url('/games/nukes/')],['Planet Mongo',url('/games/planet-mongo/')],['Endless Skies',url('/games/endless-skies/')]] },
      { id:'Tools', href:url('/tools/'), accent:'#3a9928', children:[['Twilight',url('/tools/ti/')],['Talisman',url('/tools/talisman/')],['Nukes',url('/tools/nukes/')],['Dice',url('/tools/dice/')],['Decks',url('/tools/decks/')],['Chess',url('/tools/chess/')]] },
      { id:'Developers', href:url('/developers/'), accent:'#6fb5ff', children:[['Tools API',url('/developers/')],['MCP Server','https://tools.moddable.games/'],['GitHub','https://github.com/Moddable-Games']] },
      { id:'News', href:url('/news/'), accent:'#e11d89' },
      { id:'About', href:url('/about/'), accent:'#6fb5ff', children:[['Team',url('/team/')],['Roadmap',url('/about/roadmap/')],['Community',url('/community/')],['Press',url('/press/')]] },
    ];

    const header = el('header', { role:'banner', 'aria-label':'Site header', class:'mg-navbar__header' });

    const skip = el('a', { href:'#main-content', class:'mg-skip-link' }, 'Skip to content');
    header.appendChild(skip);

    const logoWrap = el('a', { href:url('/'), class:'mg-navbar__logo-link' });
    logoWrap.appendChild(el('img', { src:url('/img/moddable-logo-white.png'), alt:'Moddable Games', class:'mg-navbar__logo-img' }));
    header.appendChild(logoWrap);

    const nav = el('nav', { 'aria-label':'Main navigation', class:'mg-navbar__nav' });
    for (const item of NAV_ITEMS) {
      const isActive = activeId === item.id;
      const wrap = el('div', { class:'mg-navbar__item' });
      const aAttrs = {
        href: item.href,
        class: 'mg-navbar__link' + (isActive ? ' mg-navbar__link--active' : ''),
      };
      if (isActive) aAttrs['aria-current'] = 'page';
      const a = el('a', aAttrs, item.id);
      a.addEventListener('click', function() { if (MG.track) MG.track('nav_click', { nav_item: item.id, nav_source: 'desktop' }); });
      if (isActive) {
        var bar = el('span', { class:'mg-navbar__active-bar' });
        if (item.accent) bar.style.background = item.accent;
        a.appendChild(bar);
      }
      wrap.appendChild(a);

      if (item.children) {
        const dd = el('div', { class:'mg-navbar__dropdown' });
        const menu = el('div', { class:'mg-navbar__dropdown-menu' });
        if (item.accent) menu.style.setProperty('--nav-accent', item.accent);
        const currentPath = window.location.pathname;
        item.children.forEach(([label, href]) => {
          const isChildActive = currentPath === href || currentPath === href.replace(/\/$/, '') || currentPath.startsWith(href);
          const linkClass = 'mg-navbar__dropdown-link' + (isChildActive ? ' mg-navbar__dropdown-link--active' : '');
          menu.appendChild(el('a', { href, class: linkClass }, label));
        });
        dd.appendChild(menu);
        wrap.appendChild(dd);
        wrap.addEventListener('mouseenter', () => { dd.classList.add('mg-navbar__dropdown--visible'); });
        wrap.addEventListener('mouseleave', () => { dd.classList.remove('mg-navbar__dropdown--visible'); });
      }
      nav.appendChild(wrap);
    }
    header.appendChild(nav);

    const right = el('div', { class:'mg-navbar__right' });
    right.appendChild(el('a', { href:url('/community/'), class:'mg-navbar__discord' }, 'DISCORD'));

    const searchBtn = el('button', { class:'mg-search-trigger', 'aria-label':'Search the site' });
    searchBtn.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
    searchBtn.addEventListener('click', () => { if (window.MG.openSearch) window.MG.openSearch(); });
    right.appendChild(searchBtn);

    const cta = linkBtn('MOD A GAME', '/submit/', 'primary');
    cta.classList.add('mg-btn--sm');
    right.appendChild(cta);
    header.appendChild(right);

    const hamburger = el('button', { class:'mg-navbar__hamburger', 'aria-label':'Menu' }, '☰');
    header.appendChild(hamburger);

    const drawer = el('div', { class:'mg-navbar__drawer' });
    const drawerNav = el('nav', { 'aria-label':'Main navigation', class:'mg-navbar__drawer-nav' });
    for (const item of NAV_ITEMS) {
      const cls = 'mg-navbar__drawer-link' + (activeId === item.id ? ' mg-navbar__drawer-link--active' : '');
      drawerNav.appendChild(el('a', { href:item.href, class:cls }, item.id));
      if (item.children) {
        const sub = el('div', { class:'mg-navbar__drawer-sub' });
        item.children.forEach(([label, href]) => {
          sub.appendChild(el('a', { href, class:'mg-navbar__drawer-sub-link' }, label));
        });
        drawerNav.appendChild(sub);
      }
    }
    drawer.appendChild(drawerNav);

    let drawerOpen = false;
    hamburger.setAttribute('aria-expanded', 'false');
    function closeDrawer() {
      drawerOpen = false;
      drawer.classList.remove('mg-navbar__drawer--open');
      hamburger.textContent = '☰';
      hamburger.setAttribute('aria-expanded', 'false');
    }
    hamburger.addEventListener('click', () => {
      drawerOpen = !drawerOpen;
      drawer.classList.toggle('mg-navbar__drawer--open', drawerOpen);
      hamburger.textContent = drawerOpen ? '✕' : '☰';
      hamburger.setAttribute('aria-expanded', String(drawerOpen));
      if (drawerOpen && MG.track) MG.track('nav_drawer_open');
    });
    drawer.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        if (MG.track) MG.track('nav_click', { nav_item: e.target.textContent, nav_source: 'drawer' });
        closeDrawer();
      }
    });

    document.addEventListener('DOMContentLoaded', () => {
      const navRoot = document.getElementById('nav-root');
      const main = navRoot && navRoot.nextElementSibling;
      if (main && !document.getElementById('main-content')) {
        main.id = 'main-content';
        main.setAttribute('role', 'main');
      }
    });

    return el('div', { class:'mg-navbar' }, header, drawer);
  }

  Object.assign(window.MG, { navbar });
})();
