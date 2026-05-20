/* =========================================================================
   Moddable.Games — Shared Component Library
   Vanilla JS, zero dependencies. All components write DOM directly.
   ========================================================================= */

const MG = (() => {

  const BASE = (document.querySelector('meta[name="mg-base"]') || {}).content || '';
  function url(path) { return BASE + path; }

  /* ── Tokens ──────────────────────────────────────────────────────────── */
  const T = {
    red:"#d11a1a", redBright:"#e63232", redDeep:"#a31212",
    green:"#3a9928", greenBright:"#4eb735",
    blue:"#0c4f8d", blueBright:"#1a6dc4", blueDeep:"#07335c",
    cosmicDeep:"#0a0d2a", cosmicMid:"#1a3680", cosmicBright:"#3a7be8",
    cosmicGlow:"#6fb5ff",
    canvasLight:"#f5f4ef", canvasDark:"#000000",
    surfaceElevated:"#161721",
    hairlineLight:"#e6e3d8",
    ink:"#14161c", body:"#1f2228", charcoal:"#3a3d44",
    mute:"#4f5764", stone:"#7a8290", faint:"#c3c5cc",
  };

  const CATEGORY_COLORS = {
    "Total conversion": T.red,
    "Rebalance": T.green,
    "Reskin": T.blue,
  };

  const HEX_BG = `url("${url('/img/hex-grid-blue.svg')}")`;
  const HEX_BG_RED = `url("${url('/img/hex-grid-red.svg')}")`;
  const HEX_BG_GREEN = `url("${url('/img/hex-grid-green.svg')}")`;

  const F = {
    display: `"Rajdhani", system-ui, sans-serif`,
    body: `"Barlow", system-ui, sans-serif`,
    mono: `"JetBrains Mono", monospace`,
    pixel: `"Press Start 2P", monospace`,
  };

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  function el(tag, attrs, ...children) {
    const e = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (k === 'style' && typeof v === 'object') {
          Object.assign(e.style, v);
        } else if (k === 'html') {
          e.innerHTML = v;
        } else if (k.startsWith('on')) {
          e.addEventListener(k.slice(2).toLowerCase(), v);
        } else {
          e.setAttribute(k, v);
        }
      }
    }
    for (const c of children) {
      if (c == null) continue;
      e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return e;
  }

  function css(obj) { return obj; } // passthrough — used for readability

  /* ── Cube SVG ─────────────────────────────────────────────────────────── */
  function cubeSVG(size = 32) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', Math.round(size * 1.1));
    svg.setAttribute('viewBox', '0 0 100 110');
    svg.setAttribute('aria-hidden', 'true');
    const polys = [
      ['50,5 92,30 50,55 8,30', T.red],
      ['8,30 50,55 50,105 8,80', T.green],
      ['92,30 50,55 50,105 92,80', T.blue],
    ];
    for (const [pts, fill] of polys) {
      const p = document.createElementNS(ns, 'polygon');
      p.setAttribute('points', pts);
      p.setAttribute('fill', fill);
      p.setAttribute('stroke', '#000');
      p.setAttribute('stroke-width', '2.5');
      svg.appendChild(p);
    }
    return svg;
  }

  /* ── Btn ─────────────────────────────────────────────────────────────── */
  const BTN_VARIANTS = {
    primary:      { bg:'#fff', fg:'#000', border:'none' },
    dark:         { bg:'#14161c', fg:'#fff', border:'none' },
    blue:         { bg:T.blue, fg:'#fff', border:'none' },
    green:        { bg:T.green, fg:'#fff', border:'none' },
    red:          { bg:T.red, fg:'#fff', border:'none' },
    'outline-dark': { bg:'transparent', fg:'#fff', border:'1px solid rgba(255,255,255,0.35)' },
    'outline-light':{ bg:'transparent', fg:T.ink, border:`1px solid ${T.hairlineLight}` },
  };
  const BTN_HOVER = {
    primary:'#e8e8e8', dark:'#2a2d36', blue:T.blueBright,
    green:T.greenBright, red:T.redBright,
    'outline-dark':'rgba(255,255,255,0.1)', 'outline-light':'rgba(0,0,0,0.04)',
  };

  function btn(label, variant = 'primary', onClick, extraStyle = {}) {
    const v = BTN_VARIANTS[variant] || BTN_VARIANTS.primary;
    const b = el('button', {
      style: css({
        display:'inline-flex', alignItems:'center', justifyContent:'center',
        height:'48px', padding:'0 22px', borderRadius:'9999px',
        border: v.border || 'none',
        background: v.bg, color: v.fg,
        fontFamily: F.body, fontWeight:600, fontSize:'15px',
        letterSpacing:'0.2px', cursor:'pointer',
        textDecoration:'none', whiteSpace:'nowrap',
        transition:'background 200ms cubic-bezier(.2,.8,.2,1), transform 200ms cubic-bezier(.34,1.56,.64,1), box-shadow 200ms ease',
        ...extraStyle,
      }),
    });
    b.innerHTML = label;
    b.addEventListener('mouseenter', () => { b.style.background = BTN_HOVER[variant] || v.bg; b.style.transform = 'scale(1.05)'; b.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)'; });
    b.addEventListener('mouseleave', () => { b.style.background = v.bg; b.style.transform = 'scale(1)'; b.style.boxShadow = 'none'; });
    b.addEventListener('mousedown', () => { b.style.transform = 'scale(0.96)'; });
    b.addEventListener('mouseup', () => { b.style.transform = 'scale(1.05)'; });
    if (onClick) b.addEventListener('click', onClick);
    return b;
  }

  function linkBtn(label, href, variant = 'primary', extraStyle = {}) {
    const v = BTN_VARIANTS[variant] || BTN_VARIANTS.primary;
    const a = el('a', {
      href: href.startsWith('/') ? url(href) : href,
      style: css({
        display:'inline-flex', alignItems:'center', justifyContent:'center',
        height:'48px', padding:'0 22px', borderRadius:'9999px',
        border: v.border || 'none',
        background: v.bg, color: v.fg,
        fontFamily: F.body, fontWeight:600, fontSize:'15px',
        letterSpacing:'0.2px', cursor:'pointer',
        textDecoration:'none', whiteSpace:'nowrap',
        transition:'background 200ms cubic-bezier(.2,.8,.2,1), transform 200ms cubic-bezier(.34,1.56,.64,1), box-shadow 200ms ease',
        ...extraStyle,
      }),
    });
    a.innerHTML = label;
    a.addEventListener('mouseenter', () => { a.style.background = BTN_HOVER[variant] || v.bg; a.style.transform = 'scale(1.05)'; a.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)'; });
    a.addEventListener('mouseleave', () => { a.style.background = v.bg; a.style.transform = 'scale(1)'; a.style.boxShadow = 'none'; });
    a.addEventListener('mousedown', () => { a.style.transform = 'scale(0.96)'; });
    a.addEventListener('mouseup', () => { a.style.transform = 'scale(1.05)'; });
    return a;
  }

  /* ── NavBar ──────────────────────────────────────────────────────────── */
  function navbar(activeId) {
    const NAV_ITEMS = [
      { id:'Mods', href:url('/mods/'), children:[['Total conversions',url('/mods/#Total conversion')],['Rebalances',url('/mods/#Rebalance')],['Reskins',url('/mods/#Reskin')],['Submit a mod',url('/submit/')]] },
      { id:'Games', href:url('/games/'), children:[['Nukes',url('/games/nukes/')],['Mongo',url('/games/mongo/')],['Endless Skies',url('/games/endless-skies/')],['Moddable Chess',url('/games/moddable-chess/')]] },
      { id:'Tools', href:url('/tools/'), children:[['Workbench',url('/tools/')],['TI tools',url('/tools/ti/')],['Talisman tools',url('/tools/talisman/')],['Nukes tools',url('/tools/nukes/')]] },
      { id:'News', href:url('/news/') },
      { id:'About', href:url('/about/'), children:[['Team',url('/team/')],['Roadmap',url('/about/roadmap/')],['Community',url('/community/')]] },
    ];

    const header = el('header', { style: css({
      height:'64px', background:'#000', position:'fixed', top:0, left:0, right:0, zIndex:50,
      borderBottom:'1px solid rgba(255,255,255,0.08)',
      display:'flex', alignItems:'center', padding:'0 24px', gap:'24px',
      boxSizing:'border-box',
    })});

    // Logo
    const logoWrap = el('a', { href:url('/'), style:{ display:'flex', alignItems:'center', textDecoration:'none' }});
    logoWrap.appendChild(el('img', { src:url('/img/moddable-logo-white.png'), alt:'Moddable Games', style:{ height:'32px', width:'auto' }}));
    header.appendChild(logoWrap);

    // Desktop nav
    const nav = el('nav', { style:{ display:'flex', gap:'24px', marginLeft:'12px' }});
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

    // Right side
    const right = el('div', { style:{ marginLeft:'auto', display:'flex', gap:'12px', alignItems:'center' }});
    const discordLink = el('a', { href:url('/community/'), style:{ fontFamily:F.pixel, fontSize:'8px', color:T.cosmicGlow, letterSpacing:'1.5px', textDecoration:'none' }}, 'DISCORD');
    right.appendChild(discordLink);

    // Search trigger button
    const searchBtn = el('button', { class:'mg-search-trigger', 'aria-label':'Search the site' });
    searchBtn.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
    searchBtn.addEventListener('click', () => { openSearch(); });
    right.appendChild(searchBtn);

    right.appendChild(linkBtn('MOD A GAME', url('/submit/'), 'primary', { height:'38px', fontSize:'13px', padding:'0 16px' }));
    header.appendChild(right);

    // Mobile hamburger (CSS media query shows/hides)
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
    const drawerNav = el('nav', { style:{ display:'flex', flexDirection:'column', gap:'4px' }});
    for (const item of NAV_ITEMS) {
      drawerNav.appendChild(el('a', { href:item.href, style:{ fontFamily:F.body, fontWeight:600, fontSize:'20px', color: activeId===item.id?'#fff':'rgba(255,255,255,0.65)', textDecoration:'none', padding:'12px 0', display:'block' }}, item.id));
    }
    drawer.appendChild(drawerNav);

    let drawerOpen = false;
    hamburger.addEventListener('click', () => {
      drawerOpen = !drawerOpen;
      drawer.style.display = drawerOpen ? 'block' : 'none';
      hamburger.textContent = drawerOpen ? '✕' : '☰';
    });

    return el('div', { style:{ position:'sticky', top:0, zIndex:50 }}, header, drawer);
  }

  /* ── Footer ──────────────────────────────────────────────────────────── */
  function footer() {
    const COLS = [
      { title:'Mods',      links:[['Total conversions',url('/mods/#Total conversion')],['Rebalances',url('/mods/#Rebalance')],['Reskins',url('/mods/#Reskin')],['Submit a mod',url('/submit/')]] },
      { title:'Games',     links:[['Endless Skies',url('/games/endless-skies/')],['Mongo',url('/games/mongo/')],['Nukes',url('/games/nukes/')],['Moddable Chess',url('/games/moddable-chess/')]] },
      { title:'Tools',     links:[['Workbench',url('/tools/')],['TI4 tools',url('/tools/ti/')],['Talisman tools',url('/tools/talisman/')],['Nukes tools',url('/tools/nukes/')]] },
      { title:'Community', links:[['Discord',url('/community/')],['News',url('/news/')],['About',url('/about/')],['Team',url('/team/')],['Roadmap',url('/about/roadmap/')]] },
    ];

    const f = el('footer', { style:{ background:'#000', color:'#fff', padding:'80px 24px 40px', boxSizing:'border-box', position:'relative', overflow:'hidden' }});
    const footerHex = el('div', { style:{ position:'absolute', inset:0, backgroundImage:`url("${url('/img/hex-grid-blue.svg')}")`, backgroundSize:'56px 64px', opacity:'0.04', pointerEvents:'none' }});
    f.appendChild(footerHex);
    const inner = el('div', { style:{ maxWidth:'1200px', margin:'0 auto', position:'relative' }});

    const grid = el('div', { style:{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'32px', paddingBottom:'56px', borderBottom:'1px solid rgba(255,255,255,0.12)' }});

    // Brand column
    const brand = el('div');
    const logoWrap = el('div', { style:{ display:'flex', alignItems:'center', marginBottom:'18px' }});
    logoWrap.appendChild(el('img', { src:url('/img/moddable-logo-white.png'), alt:'Moddable Games', style:{ height:'28px', width:'auto' }}));
    brand.appendChild(logoWrap);
    brand.appendChild(el('p', { style:{ fontFamily:F.body, fontSize:'14px', lineHeight:'1.6', color:'rgba(255,255,255,0.65)', maxWidth:'280px', margin:0 }}, 'Creating games you already own. Twelve mods. Three originals. One Discord.'));
    grid.appendChild(brand);

    for (const col of COLS) {
      const c = el('div');
      c.appendChild(el('h4', { style:{ fontFamily:F.body, fontWeight:600, fontSize:'12px', color:'#fff', letterSpacing:'0.8px', textTransform:'uppercase', margin:'0 0 18px' }}, col.title));
      const ul = el('ul', { style:{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'10px' }});
      for (const [text, href] of col.links) {
        ul.appendChild(el('li', {}, el('a', { href, style:{ fontFamily:F.body, fontSize:'14px', color:'rgba(255,255,255,0.65)', textDecoration:'none' }}, text)));
      }
      c.appendChild(ul);
      grid.appendChild(c);
    }
    inner.appendChild(grid);

    const bottom = el('div', { style:{ paddingTop:'40px', display:'flex', flexWrap:'wrap', gap:'16px', justifyContent:'space-between', fontFamily:F.mono, fontSize:'12px', color:'rgba(255,255,255,0.45)', lineHeight:'1.6' }});
    bottom.appendChild(el('span', {}, '© 2026 Moddable.Games'));
    bottom.appendChild(el('span', { style:{ maxWidth:'700px', textAlign:'right' }}, 'Fan-made. Not affiliated with Hasbro, Asmodee, Fantasy Flight, or any rights-holder of the games we mod. All trademarks belong to their respective owners.'));
    inner.appendChild(bottom);
    f.appendChild(inner);
    return f;
  }

  /* ── ModCard ─────────────────────────────────────────────────────────── */
  function modCard({ category, title, baseGame, stats, body, href = '#', source = '' }) {
    const accent = CATEGORY_COLORS[category] || T.blue;
    const card = el('article', { 'data-reveal':'up', style: css({
      background:'#fff', borderRadius:'20px', overflow:'hidden',
      border:`1px solid ${T.hairlineLight}`,
      display:'flex', flexDirection:'column',
      transition:'border-color 180ms cubic-bezier(.2,.8,.2,1), transform 250ms cubic-bezier(.2,.8,.2,1), box-shadow 250ms ease',
      cursor:'pointer',
    })});

    card.addEventListener('mouseenter', () => { card.style.borderColor = accent; card.style.transform = 'translateY(-4px)'; card.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; });
    card.addEventListener('mouseleave', () => { card.style.borderColor = T.hairlineLight; card.style.transform = 'translateY(0)'; card.style.boxShadow = 'none'; });

    // Top stripe
    card.appendChild(el('div', { style:{ height:'4px', background:accent }}));

    const inner = el('div', { style:{ padding:'20px', display:'flex', flexDirection:'column', gap:'14px', flex:1 }});

    // Thumb
    const thumb = el('div', { style:{ width:'100%', aspectRatio:'1.6', borderRadius:'12px', overflow:'hidden', position:'relative', background:`linear-gradient(135deg, #0a0d2a 0%, ${accent} 100%)` }});
    const hexPat = el('div', { style:{ position:'absolute', inset:0, backgroundImage:`url("${url('/img/hex-grid-white.svg')}")`, backgroundSize:'28px 32px' }});
    thumb.appendChild(hexPat);
    inner.appendChild(thumb);

    // Meta row
    const meta = el('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'10px' }});
    meta.appendChild(el('span', { style:{ fontFamily:F.body, fontWeight:600, fontSize:'11px', background:accent, color:'#fff', padding:'4px 10px', borderRadius:'9999px', letterSpacing:'0.2px' }}, category));
    meta.appendChild(el('span', { style:{ fontFamily:F.mono, fontSize:'11px', color:T.stone }}, baseGame));
    inner.appendChild(meta);

    // Title
    inner.appendChild(el('h3', { html: title, style:{ fontFamily:F.display, fontWeight:600, fontSize:'22px', lineHeight:'1.2', letterSpacing:'-0.25px', color:T.ink, margin:0 }}));

    // Body
    inner.appendChild(el('p', { style:{ fontFamily:F.body, fontSize:'14px', lineHeight:'1.55', color:T.mute, margin:0, flex:1 }}, body));

    // Stats + source
    const statsRow = el('div',{style:{fontFamily:F.mono, fontSize:'12px', color:T.mute, paddingTop:'12px', borderTop:`1px solid ${T.hairlineLight}`, display:'flex', flexDirection:'column', gap:'4px'}});
    statsRow.appendChild(document.createTextNode(stats));
    if (source) {
      statsRow.appendChild(el('span',{style:{fontSize:'11px',color:T.stone}},`via ${source}`));
    }
    inner.appendChild(statsRow);

    // Link
    const link = el('a', { href, style:{ fontFamily:F.body, fontWeight:600, fontSize:'14px', color:accent, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'6px' }});
    link.innerHTML = 'View the rules <span aria-hidden="true">→</span>';
    inner.appendChild(link);

    card.appendChild(inner);
    card.addEventListener('click', (e) => { if (e.target.tagName !== 'A') window.location.href = href; });
    return card;
  }

  /* ── PageHero (dark banner with optional hex horizon) ────────────────── */
  function pageHero({ eyebrow, title, lede, accent = T.cosmicGlow, withHorizon = false, minHeight = 420 }) {
    const sec = el('section', { style:{ position:'relative', background:'#000', color:'#fff', overflow:'hidden', isolation:'isolate', minHeight:minHeight+'px' }});

    if (withHorizon) {
      const bg = el('div', { style:{ position:'absolute', inset:0, background:`linear-gradient(180deg, ${T.cosmicDeep} 0%, ${T.cosmicMid} 50%, #000 100%)` }});
      const hexLand = el('div', { style:{ position:'absolute', inset:0, background:`url("${url('/img/hex-land.jpg')}") center bottom / cover no-repeat`, opacity:'0.2', mixBlendMode:'screen' }});
      const hexLayer = el('div', { style:{ position:'absolute', inset:0, backgroundImage:HEX_BG, backgroundSize:'56px 64px', opacity:'0.6' }});
      const fade = el('div', { style:{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(8,10,30,0.5) 0%, transparent 60%)', pointerEvents:'none' }});
      const fadeBottom = el('div', { style:{ position:'absolute', inset:0, background:'linear-gradient(180deg, transparent 60%, #000 100%)', pointerEvents:'none' }});
      sec.appendChild(bg); sec.appendChild(hexLand); sec.appendChild(hexLayer); sec.appendChild(fade); sec.appendChild(fadeBottom);
    } else {
      const glow = el('div', { style:{ position:'absolute', right:'-150px', top:'30%', width:'700px', height:'700px', background:`radial-gradient(circle, rgba(58,123,232,0.22) 0%, transparent 65%)`, pointerEvents:'none' }});
      sec.appendChild(glow);
    }

    const content = el('div', { class:'hero-anim', style:{ position:'relative', zIndex:2, padding:'72px 32px 96px', maxWidth:'1200px', margin:'0 auto', boxSizing:'border-box' }});
    content.appendChild(el('div', { style:{ fontFamily:F.pixel, fontSize:'10px', color:accent, letterSpacing:'1.5px', marginBottom:'18px', textShadow:`0 0 12px ${accent}55` }}, eyebrow));
    const h = el('h1', { html:title, style:{ fontFamily:F.display, fontWeight:600, fontSize:'clamp(48px, 6.5vw, 88px)', lineHeight:'1.0', letterSpacing:'-0.025em', margin:'0 0 20px' }});
    content.appendChild(h);
    if (lede) content.appendChild(el('p', { style:{ fontFamily:F.body, fontStyle:'italic', fontSize:'20px', lineHeight:'1.5', color:'rgba(255,255,255,0.82)', margin:0, maxWidth:'680px' }}, lede));
    sec.appendChild(content);
    return sec;
  }

  if (BASE) {
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('a[href^="/"]').forEach(a => {
        const h = a.getAttribute('href');
        if (!h.startsWith(BASE + '/')) a.setAttribute('href', BASE + h);
      });
      document.querySelectorAll('link[href^="/"]').forEach(l => {
        const h = l.getAttribute('href');
        if (!h.startsWith(BASE + '/')) l.setAttribute('href', BASE + h);
      });
    });
  }

  /* ── Scroll Reveal Observer ───────────────────────────────────────────── */
  function initReveal() {
    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;

    // Assign stagger indices to children of [data-stagger] parents
    document.querySelectorAll('[data-stagger]').forEach(parent => {
      Array.from(parent.children).forEach((child, i) => {
        if (child.hasAttribute('data-reveal')) {
          child.style.setProperty('--stagger-index', i);
        }
      });
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => observer.observe(el));
  }

  document.addEventListener('DOMContentLoaded', initReveal);

  /* ── Global Search ──────────────────────────────────────────────────── */
  const SEARCH_INDEX = [
    {type:'mod', title:'Talisman: Hexed', desc:'Open-world hex system replacing the Talisman board with 61 tiles', href:url('/mods/talisman-hexed/')},
    {type:'mod', title:'Hyper Imperium', desc:'Faster ruleset for TI4 + Prophecy of Kings', href:url('/mods/hyper-imperium/')},
    {type:'mod', title:'Nuke Catan', desc:'Post-apocalyptic total conversion of Catan', href:url('/mods/nuke-catan/')},
    {type:'mod', title:'Fog of War Chess', desc:'Players see only squares their pieces can legally move to', href:url('/mods/fog-of-war-chess/')},
    {type:'mod', title:'4-Player Chess', desc:'Two teams or free-for-all on a cross-shaped board', href:url('/mods/4-player-chess/')},
    {type:'mod', title:'Hexagonal Chess', desc:'Glinski variant — pieces move along hex edges', href:url('/mods/hexagonal-chess/')},
    {type:'mod', title:'Econopoly', desc:'Monopoly with a working economy and dynamic pricing', href:url('/mods/econopoly/')},
    {type:'mod', title:'Anti-Monopoly', desc:'Public domain competitive variant of Monopoly', href:url('/mods/anti-monopoly/')},
    {type:'mod', title:'Flooded Catan', desc:'Rising sea levels slowly reduce the board', href:url('/mods/flooded-catan/')},
    {type:'mod', title:'The Diamond Mine', desc:'Total conversion turning Catan into a mining game', href:url('/mods/the-diamond-mine/')},
    {type:'mod', title:'Shattered Ascension', desc:'Community overhaul of TI4 with rebalanced factions', href:url('/mods/shattered-ascension/')},
    {type:'mod', title:'CivRisk', desc:'Risk rewritten to play like Civilisation', href:url('/mods/civrisk/')},
    {type:'game', title:'Nukes', desc:'Our original nuclear strategy game', href:url('/games/nukes/')},
    {type:'game', title:'Mongo', desc:'Fast-paced card battler', href:url('/games/mongo/')},
    {type:'game', title:'Endless Skies', desc:'Cooperative airship exploration', href:url('/games/endless-skies/')},
    {type:'game', title:'Moddable Chess', desc:'2000+ variants, one moddable engine', href:url('/games/moddable-chess/')},
    {type:'news', title:'Beyond The Box', desc:'The art of board game design begins and ends with the box', href:url('/news/beyond-the-box/')},
    {type:'news', title:'The Ancients', desc:'Games older than history itself', href:url('/news/the-ancients/')},
    {type:'news', title:'Making Mods Matter', desc:'Why modders deserve better tools', href:url('/news/making-mods-matter/')},
    {type:'news', title:'Nuking Catan', desc:'A meditation on the gateway game', href:url('/news/nuking-catan/')},
    {type:'news', title:'Open Sourcing Tabletop Games', desc:'Should board games be open source?', href:url('/news/open-sourcing-tabletop-games/')},
    {type:'news', title:"Twilight's Prophecies Thunder On!", desc:'TI turns 25 — what Prophecy of Kings changed', href:url('/news/twilights-prophecies-thunder-on/')},
    {type:'tool', title:'Dice Roller', desc:'Roll any combination of dice', href:url('/tools/')},
    {type:'tool', title:'Turn Timer', desc:'Configurable player timer with presets', href:url('/tools/')},
    {type:'tool', title:'TI4 Faction Picker', desc:'Random faction draft for Twilight Imperium', href:url('/tools/ti/')},
    {type:'tool', title:'Talisman Character Lottery', desc:'Random character selection for Talisman', href:url('/tools/talisman/')},
    {type:'page', title:'About', desc:'Our story and what we believe', href:url('/about/')},
    {type:'page', title:'Community', desc:'Join the Discord — 2400+ members', href:url('/community/')},
    {type:'page', title:'Submit a Mod', desc:'Share your homebrew with the community', href:url('/submit/')},
  ];

  let searchOverlay = null;

  function openSearch() {
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

    requestAnimationFrame(() => { overlay.classList.add('mg-search-overlay--open'); input.focus(); });

    function renderResults(query) {
      results.innerHTML = '';
      if (!query) {
        results.innerHTML = '<div class="mg-search-panel__empty"><div class="mg-search-panel__empty-title">Start typing to search</div><div class="mg-search-panel__empty-hint">Mods, games, news articles, and tools</div></div>';
        return;
      }
      const q = query.toLowerCase();
      const matches = SEARCH_INDEX.filter(item => item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q));
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
    searchOverlay.classList.remove('mg-search-overlay--open');
    setTimeout(() => { if (searchOverlay) { searchOverlay.remove(); searchOverlay = null; } }, 200);
  }

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
    if (e.key === 'Escape') closeSearch();
  });

  /* ── Expose ──────────────────────────────────────────────────────────── */
  return { T, F, HEX_BG, HEX_BG_RED, HEX_BG_GREEN, CATEGORY_COLORS, el, btn, linkBtn, navbar, footer, modCard, pageHero, cubeSVG, url, initReveal };

})();
