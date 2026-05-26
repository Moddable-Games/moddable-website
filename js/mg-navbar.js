(function() {
  const { T, el, url, linkBtn } = window.MG;

  function navbar(activeId) {
    const NAV_ITEMS = [
      { id:'Mods', href:url('/mods/'), children:[['Total conversions',url('/mods/#Total conversion')],['Rebalances',url('/mods/#Rebalance')],['Reskins',url('/mods/#Reskin')],['Submit a mod',url('/submit/')]] },
      { id:'Games', href:url('/games/'), children:[['Nukes',url('/games/nukes/')],['Mongo',url('/games/mongo/')],['Endless Skies',url('/games/endless-skies/')],['Moddable Chess',url('/games/moddable-chess/')]] },
      { id:'Tools', href:url('/tools/'), children:[['TI tools',url('/tools/ti/')],['Talisman tools',url('/tools/talisman/')],['Nukes tools',url('/tools/nukes/')],['Deck builder',url('/tools/decks/')],['Chess variants',url('/tools/chess/')]] },
      { id:'News', href:url('/news/') },
      { id:'About', href:url('/about/'), children:[['Team',url('/team/')],['Roadmap',url('/about/roadmap/')],['Community',url('/community/')],['Press',url('/press/')]] },
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
      if (isActive) {
        a.appendChild(el('span', { class:'mg-navbar__active-bar' }));
      }
      wrap.appendChild(a);

      if (item.children) {
        const dd = el('div', { class:'mg-navbar__dropdown' });
        const menu = el('div', { class:'mg-navbar__dropdown-menu' });
        item.children.forEach(([label, href]) => {
          menu.appendChild(el('a', { href, class:'mg-navbar__dropdown-link' }, label));
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
    }
    drawer.appendChild(drawerNav);

    let drawerOpen = false;
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.addEventListener('click', () => {
      drawerOpen = !drawerOpen;
      drawer.classList.toggle('mg-navbar__drawer--open', drawerOpen);
      hamburger.textContent = drawerOpen ? '✕' : '☰';
      hamburger.setAttribute('aria-expanded', String(drawerOpen));
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
