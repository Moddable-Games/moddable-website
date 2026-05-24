/* =========================================================================
   Moddable.Games — Footer
   Extends window.MG (created by mg-core.js)
   ========================================================================= */

(function() {
  const { T, F, el, css, url } = window.MG;

  function footer() {
    const COLS = [
      { title:'Mods',      links:[['Total conversions',url('/mods/#Total conversion')],['Rebalances',url('/mods/#Rebalance')],['Reskins',url('/mods/#Reskin')],['Submit a mod',url('/submit/')]] },
      { title:'Games',     links:[['Endless Skies',url('/games/endless-skies/')],['Mongo',url('/games/mongo/')],['Nukes',url('/games/nukes/')],['Moddable Chess',url('/games/moddable-chess/')]] },
      { title:'Tools',     links:[['Workbench',url('/tools/')],['TI4 tools',url('/tools/ti/')],['Talisman tools',url('/tools/talisman/')],['Nukes tools',url('/tools/nukes/')],['Deck builder',url('/tools/decks/')],['Chess variants',url('/tools/chess/')]] },
      { title:'Community', links:[['Discord',url('/community/')],['News',url('/news/')],['About',url('/about/')],['Team',url('/team/')],['Press',url('/press/')],['Subscribe',url('/subscribe/')]] },
    ];

    const f = el('footer', { role:'contentinfo', 'aria-label':'Site footer', style:{ background:'#000', color:'#fff', padding:'80px 24px 40px', boxSizing:'border-box', position:'relative', overflow:'hidden' }});
    const footerHex = el('div', { style:{ position:'absolute', inset:0, backgroundImage:`url("${url('/img/hex-grid-blue.svg')}")`, backgroundSize:'56px 64px', opacity:'0.04', pointerEvents:'none' }});
    f.appendChild(footerHex);
    const inner = el('div', { style:{ maxWidth:'1200px', margin:'0 auto', position:'relative' }});

    const grid = el('div', { style:{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'32px', paddingBottom:'56px', borderBottom:'1px solid rgba(255,255,255,0.12)' }});

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

  Object.assign(window.MG, { footer });
})();
