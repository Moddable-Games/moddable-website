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

  const HEX_BG = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='56' height='64' viewBox='0 0 56 64'><path d='M28 1 54 16v32L28 63 2 48V16z' fill='none' stroke='%233a7be8' stroke-opacity='0.18' stroke-width='1'/></svg>")`;

  const F = {
    display: `"Inter Tight", system-ui, sans-serif`,
    body: `"Inter", system-ui, sans-serif`,
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
        transition:'background 180ms cubic-bezier(.2,.8,.2,1), transform 180ms',
        ...extraStyle,
      }),
    });
    b.innerHTML = label;
    b.addEventListener('mouseenter', () => b.style.background = BTN_HOVER[variant] || v.bg);
    b.addEventListener('mouseleave', () => b.style.background = v.bg);
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
        transition:'background 180ms cubic-bezier(.2,.8,.2,1)',
        ...extraStyle,
      }),
    });
    a.innerHTML = label;
    a.addEventListener('mouseenter', () => a.style.background = BTN_HOVER[variant] || v.bg);
    a.addEventListener('mouseleave', () => a.style.background = v.bg);
    return a;
  }

  /* ── NavBar ──────────────────────────────────────────────────────────── */
  function navbar(activeId) {
    const NAV_ITEMS = [
      { id:'Mods', href:url('/mods/') },
      { id:'Games', href:url('/games/endless-skies/') },
      { id:'Tools', href:url('/tools/') },
      { id:'News', href:url('/news/') },
      { id:'About', href:url('/about/') },
    ];

    const header = el('header', { style: css({
      height:'64px', background:'#000', position:'sticky', top:0, zIndex:50,
      borderBottom:'1px solid rgba(255,255,255,0.08)',
      display:'flex', alignItems:'center', padding:'0 24px', gap:'24px',
      boxSizing:'border-box',
    })});

    // Logo
    const logoWrap = el('a', { href:url('/'), style:{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none' }});
    logoWrap.appendChild(cubeSVG(28));
    logoWrap.appendChild(el('span', { style:{ fontFamily:F.display, fontWeight:700, fontSize:'17px', color:'#fff', letterSpacing:'-0.3px' }}, 'Moddable.Games'));
    header.appendChild(logoWrap);

    // Desktop nav
    const nav = el('nav', { style:{ display:'flex', gap:'24px', marginLeft:'12px' }});
    for (const item of NAV_ITEMS) {
      const isActive = activeId === item.id;
      const a = el('a', {
        href: item.href,
        style: css({
          fontFamily:F.body, fontWeight:500, fontSize:'14px',
          color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
          textDecoration:'none', letterSpacing:'0.2px',
          position:'relative', paddingBottom:'4px',
        }),
      }, item.id);
      if (isActive) {
        a.appendChild(el('span', { style:{ position:'absolute', bottom:'-22px', left:0, right:0, height:'2px', background:T.cosmicGlow }}));
      }
      nav.appendChild(a);
    }
    header.appendChild(nav);

    // Right side
    const right = el('div', { style:{ marginLeft:'auto', display:'flex', gap:'12px', alignItems:'center' }});
    const discordLink = el('a', { href:url('/community/'), style:{ fontFamily:F.pixel, fontSize:'8px', color:T.cosmicGlow, letterSpacing:'1.5px', textDecoration:'none' }}, '▲ DISCORD');
    right.appendChild(discordLink);
    right.appendChild(linkBtn('Mod a game', url('/submit/'), 'primary', { height:'38px', fontSize:'13px', padding:'0 16px' }));
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
      { title:'Mods',      links:[['All mods',url('/mods/')],['Submit a mod',url('/submit/')]] },
      { title:'Games',     links:[['Endless Skies',url('/games/endless-skies/')],['Mongo',url('/games/mongo/')],['Nukes',url('/games/nukes/')]] },
      { title:'Tools',     links:[['Workbench',url('/tools/')]] },
      { title:'Community', links:[['Discord',url('/community/')],['News',url('/news/')],['About',url('/about/')],['Team',url('/team/')]] },
    ];

    const f = el('footer', { style:{ background:'#000', color:'#fff', padding:'80px 24px 40px', boxSizing:'border-box' }});
    const inner = el('div', { style:{ maxWidth:'1200px', margin:'0 auto' }});

    const grid = el('div', { style:{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'32px', paddingBottom:'56px', borderBottom:'1px solid rgba(255,255,255,0.12)' }});

    // Brand column
    const brand = el('div');
    const logoWrap = el('div', { style:{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'18px' }});
    logoWrap.appendChild(cubeSVG(28));
    logoWrap.appendChild(el('span', { style:{ fontFamily:F.display, fontWeight:700, fontSize:'16px', color:'#fff', letterSpacing:'-0.3px' }}, 'Moddable.Games'));
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
    const card = el('article', { style: css({
      background:'#fff', borderRadius:'20px', overflow:'hidden',
      border:`1px solid ${T.hairlineLight}`,
      display:'flex', flexDirection:'column',
      transition:'border-color 180ms cubic-bezier(.2,.8,.2,1), transform 180ms',
      cursor:'pointer',
    })});

    card.addEventListener('mouseenter', () => { card.style.borderColor = accent; card.style.transform = 'translateY(-3px)'; });
    card.addEventListener('mouseleave', () => { card.style.borderColor = T.hairlineLight; card.style.transform = 'translateY(0)'; });

    // Top stripe
    card.appendChild(el('div', { style:{ height:'4px', background:accent }}));

    const inner = el('div', { style:{ padding:'20px', display:'flex', flexDirection:'column', gap:'14px', flex:1 }});

    // Thumb
    const thumb = el('div', { style:{ width:'100%', aspectRatio:'1.6', borderRadius:'12px', overflow:'hidden', position:'relative', background:`linear-gradient(135deg, #0a0d2a 0%, ${accent} 100%)` }});
    const hexPat = el('div', { style:{ position:'absolute', inset:0, backgroundImage:`url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='32' viewBox='0 0 56 64'><path d='M28 1 54 16v32L28 63 2 48V16z' fill='none' stroke='%23fff' stroke-opacity='0.25' stroke-width='1'/></svg>")`, backgroundSize:'28px 32px' }});
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
    const link = el('a', { href: href.startsWith('/') ? url(href) : href, style:{ fontFamily:F.body, fontWeight:600, fontSize:'14px', color:accent, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'6px' }});
    link.innerHTML = 'View the rules <span aria-hidden="true">→</span>';
    inner.appendChild(link);

    card.appendChild(inner);
    return card;
  }

  /* ── PageHero (dark banner with optional hex horizon) ────────────────── */
  function pageHero({ eyebrow, title, lede, accent = T.cosmicGlow, withHorizon = false, minHeight = 420 }) {
    const sec = el('section', { style:{ position:'relative', background:'#000', color:'#fff', overflow:'hidden', isolation:'isolate', minHeight:minHeight+'px' }});

    if (withHorizon) {
      const bg = el('div', { style:{ position:'absolute', inset:0, background:`linear-gradient(180deg, ${T.cosmicDeep} 0%, ${T.cosmicMid} 50%, #000 100%)` }});
      const hexLayer = el('div', { style:{ position:'absolute', inset:0, backgroundImage:HEX_BG, backgroundSize:'56px 64px', opacity:'0.6' }});
      const fade = el('div', { style:{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(8,10,30,0.5) 0%, transparent 60%)', pointerEvents:'none' }});
      const fadeBottom = el('div', { style:{ position:'absolute', inset:0, background:'linear-gradient(180deg, transparent 60%, #000 100%)', pointerEvents:'none' }});
      sec.appendChild(bg); sec.appendChild(hexLayer); sec.appendChild(fade); sec.appendChild(fadeBottom);
    } else {
      const glow = el('div', { style:{ position:'absolute', right:'-150px', top:'30%', width:'700px', height:'700px', background:`radial-gradient(circle, rgba(58,123,232,0.22) 0%, transparent 65%)`, pointerEvents:'none' }});
      sec.appendChild(glow);
    }

    const content = el('div', { style:{ position:'relative', zIndex:2, padding:'72px 32px 96px', maxWidth:'1200px', margin:'0 auto', boxSizing:'border-box' }});
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

  /* ── Expose ──────────────────────────────────────────────────────────── */
  return { T, F, HEX_BG, CATEGORY_COLORS, el, btn, linkBtn, navbar, footer, modCard, pageHero, cubeSVG, url };

})();
