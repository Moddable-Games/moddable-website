/* =========================================================================
   Moddable.Games — Buttons: btn(), linkBtn()
   Extends window.MG (created by mg-core.js)
   ========================================================================= */

(function() {
  const { T, F, el, css, url } = window.MG;

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

  Object.assign(window.MG, { btn, linkBtn });
})();
