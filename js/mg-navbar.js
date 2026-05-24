/* =========================================================================
   Moddable.Games — Navbar
   Extends window.MG (created by mg-core.js, needs mg-buttons.js)
   ========================================================================= */

(function() {
  const { T, F, el, css, url, linkBtn } = window.MG;

  function navbar(activeId) {
    const NAV_ITEMS = [
      { id:'Mods', href:url('/mods/'), children:[['Total conversions',url('/mods/#Total conversion')],['Rebalances',url('/mods/#Rebalance')],['Reskins',url('/mods/#Reskin')],['Submit a mod',url('/submit/')]] },
      { id:'Games', href:url('/games/'), children:[['Nukes',url('/games/nukes/')],['Mongo',url('/games/mongo/')],['Endless Skies',url('/games/endless-skies/')],['Moddable Chess',url('/games/moddable-chess/')]] },
      { id:'Tools', href:url('/tools/'), children:[['TI tools',url('/tools/ti/')],['Talisman tools',url('/tools/talisman/')],['Nukes tools',url('/tools/nukes/')],['Deck builder',url('/tools/decks/')],['Chess variants',url('/tools/chess/')]] },
      { id:'News', href:url('/news/') },
      { id:'About', href:url('/about/'), children:[['Team',url('/team/')],['Roadmap',url('/about/roadmap/')],['Community',url('/community/')],['Press',url('/press/')]] },
    ];

    const header = el('header', { role:'banner', 'aria-label':'Site header', style: css({
      height:'64px', background:'#000', position:'fixed', top:0, left:0, right:0, zIndex:50,
      borderBottom:'1px solid rgba(255,255,255,0.08)',
      display:'flex', alignItems:'center', padding:'0 24px', gap:'24px',
      boxSizing:'border-box',
    })});

    const skip = el('a', { href:'#main-content', class:'mg-skip-link' }, 'Skip to content');
    header.appendChild(skip);

    const logoWrap = el('a', { href:url('/'), style:{ display:'flex', alignItems:'center', textDecoration:'none' }});
    logoWrap.appendChild(el('img', { src:url('/img/moddable-logo-white.png'), alt:'Moddable Games', style:{ height:'32px', width:'auto' }}));
    header.appendChild(logoWrap);

    const nav = el('nav', { 'aria-label':'Main navigation', style:{ display:'flex', gap:'24px', marginLeft:'12px' }});
    for (const item of NAV_ITEMS) {
      const isActive = activeId === item.id;
      const wrap = el('div', { style:{ position:'relative' }});
      const a = el('a', {
        href: item.href,
        style: css({
          fontFamily:F.body, fontWeight:500, fontSize:'14px',
          color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
          textDecoration:'none', letterSpacing:'0.8px', textTransform:'uppercase',
          position:'relative', paddingBottom:'4px',
        }),
      }, item.id);
      if (isActive) {
        a.appendChild(el('span', { style:{ position:'absolute', bottom:'-22px', left:0, right:0, height:'2px', background:T.cosmicGlow }}));
      }
      wrap.appendChild(a);
      if (item.children) {
        const dd = el('div', { style:{ position:'absolute', top:'100%', left:'50%', transform:'translateX(-50%)', paddingTop:'12px', display:'none', zIndex:100 }});
        const menu = el('div', { style:{ background:'#14161c', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'14px', padding:'10px 0', minWidth:'200px', boxShadow:'0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(111,181,255,0.06)', backdropFilter:'blur(12px)' }});
        item.children.forEach(([label, href]) => {
          const link = el('a', { href, style:{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 18px', fontFamily:F.body, fontSize:'13px', color:'rgba(255,255,255,0.8)', textDecoration:'none', transition:'all 150ms cubic-bezier(.2,.8,.2,1)', borderLeft:'2px solid transparent', margin:'0 6px', borderRadius:'6px' }}, label);
          link.addEventListener('mouseenter', () => { link.style.background = 'rgba(111,181,255,0.08)'; link.style.borderLeftColor = T.cosmicGlow; link.style.color = '#fff'; link.style.paddingLeft = '20px'; });
          link.addEventListener('mouseleave', () => { link.style.background = 'transparent'; link.style.borderLeftColor = 'transparent'; link.style.color = 'rgba(255,255,255,0.8)'; link.style.paddingLeft = '18px'; });
          menu.appendChild(link);
        });
        dd.appendChild(menu);
        dd.style.opacity = '0';
        dd.style.transform = 'translateX(-50%) translateY(-4px)';
        dd.style.transition = 'opacity 180ms ease, transform 180ms cubic-bezier(.2,.8,.2,1)';
        wrap.appendChild(dd);
        wrap.addEventListener('mouseenter', () => { dd.style.display = 'block'; requestAnimationFrame(() => { dd.style.opacity = '1'; dd.style.transform = 'translateX(-50%) translateY(0)'; }); });
        wrap.addEventListener('mouseleave', () => { dd.style.opacity = '0'; dd.style.transform = 'translateX(-50%) translateY(-4px)'; setTimeout(() => { if (dd.style.opacity === '0') dd.style.display = 'none'; }, 180); });
      }
      nav.appendChild(wrap);
    }
    header.appendChild(nav);

    const right = el('div', { style:{ marginLeft:'auto', display:'flex', gap:'12px', alignItems:'center' }});
    const discordLink = el('a', { href:url('/community/'), style:{ fontFamily:F.pixel, fontSize:'8px', color:T.cosmicGlow, letterSpacing:'1.5px', textDecoration:'none' }}, 'DISCORD');
    right.appendChild(discordLink);

    const searchBtn = el('button', { class:'mg-search-trigger', 'aria-label':'Search the site' });
    searchBtn.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
    searchBtn.addEventListener('click', () => { if (window.MG.openSearch) window.MG.openSearch(); });
    right.appendChild(searchBtn);

    right.appendChild(linkBtn('MOD A GAME', url('/submit/'), 'primary', { height:'38px', fontSize:'13px', padding:'0 16px' }));
    header.appendChild(right);

    const style = el('style');
    style.textContent = `
      @media (max-width:900px) {
        #mg-nav-desktop { display:none !important; }
        #mg-nav-right-full { display:none !important; }
        #mg-hamburger { display:flex !important; }
      }
      @media (min-width:901px) {
        #mg-mobile-drawer { display:none !important; }
      }
    `;
    document.head.appendChild(style);
    nav.id = 'mg-nav-desktop';
    right.id = 'mg-nav-right-full';

    const hamburger = el('button', {
      id:'mg-hamburger',
      'aria-label':'Menu',
      style: css({ display:'none', marginLeft:'auto', width:'40px', height:'40px', background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'9999px', cursor:'pointer', alignItems:'center', justifyContent:'center', fontSize:'18px' }),
    }, '☰');
    header.appendChild(hamburger);

    const drawer = el('div', {
      id:'mg-mobile-drawer',
      style: css({ position:'fixed', top:'64px', left:0, right:0, bottom:0, background:'#000', zIndex:49, padding:'32px 24px', overflowY:'auto' }),
    });
    const drawerNav = el('nav', { 'aria-label':'Main navigation', style:{ display:'flex', flexDirection:'column', gap:'4px' }});
    for (const item of NAV_ITEMS) {
      drawerNav.appendChild(el('a', { href:item.href, style:{ fontFamily:F.body, fontWeight:600, fontSize:'20px', color: activeId===item.id?'#fff':'rgba(255,255,255,0.65)', textDecoration:'none', padding:'12px 0', display:'block' }}, item.id));
    }
    drawer.appendChild(drawerNav);

    let drawerOpen = false;
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.addEventListener('click', () => {
      drawerOpen = !drawerOpen;
      drawer.style.display = drawerOpen ? 'block' : 'none';
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

    return el('div', { style:{ position:'sticky', top:0, zIndex:50 }}, header, drawer);
  }

  Object.assign(window.MG, { navbar });
})();
