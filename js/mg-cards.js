/* =========================================================================
   Moddable.Games — Cards: modCard(), pageHero()
   Extends window.MG (created by mg-core.js)
   ========================================================================= */

(function() {
  const { T, F, CATEGORY_COLORS, HEX_BG, el, css, url } = window.MG;

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

    card.appendChild(el('div', { style:{ height:'4px', background:accent }}));

    const inner = el('div', { style:{ padding:'20px', display:'flex', flexDirection:'column', gap:'14px', flex:1 }});

    const thumb = el('div', { style:{ width:'100%', aspectRatio:'1.6', borderRadius:'12px', overflow:'hidden', position:'relative', background:`linear-gradient(135deg, #0a0d2a 0%, ${accent} 100%)` }});
    const hexPat = el('div', { style:{ position:'absolute', inset:0, backgroundImage:`url("${url('/img/hex-grid-white.svg')}")`, backgroundSize:'28px 32px' }});
    thumb.appendChild(hexPat);
    inner.appendChild(thumb);

    const meta = el('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'10px' }});
    meta.appendChild(el('span', { style:{ fontFamily:F.body, fontWeight:600, fontSize:'11px', background:accent, color:'#fff', padding:'4px 10px', borderRadius:'9999px', letterSpacing:'0.2px' }}, category));
    meta.appendChild(el('span', { style:{ fontFamily:F.mono, fontSize:'11px', color:T.stone }}, baseGame));
    inner.appendChild(meta);

    inner.appendChild(el('h3', { html: title, style:{ fontFamily:F.display, fontWeight:600, fontSize:'22px', lineHeight:'1.2', letterSpacing:'-0.25px', color:T.ink, margin:0 }}));
    inner.appendChild(el('p', { style:{ fontFamily:F.body, fontSize:'14px', lineHeight:'1.55', color:T.mute, margin:0, flex:1 }}, body));

    const statsRow = el('div',{style:{fontFamily:F.mono, fontSize:'12px', color:T.mute, paddingTop:'12px', borderTop:`1px solid ${T.hairlineLight}`, display:'flex', flexDirection:'column', gap:'4px'}});
    statsRow.appendChild(document.createTextNode(stats));
    if (source) statsRow.appendChild(el('span',{style:{fontSize:'11px',color:T.stone}},`via ${source}`));
    inner.appendChild(statsRow);

    const link = el('a', { href, style:{ fontFamily:F.body, fontWeight:600, fontSize:'14px', color:accent, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'6px' }});
    link.innerHTML = 'View the rules <span aria-hidden="true">→</span>';
    inner.appendChild(link);

    card.appendChild(inner);
    card.addEventListener('click', (e) => { if (e.target.tagName !== 'A') window.location.href = href; });
    return card;
  }

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

  Object.assign(window.MG, { modCard, pageHero });
})();
