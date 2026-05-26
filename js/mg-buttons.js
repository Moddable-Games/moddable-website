/* =========================================================================
   Moddable.Games — Buttons: btn(), linkBtn()
   Extends window.MG (created by mg-core.js)
   ========================================================================= */

(function() {
  const { T, el, url } = window.MG;

  const BTN_VARIANTS = {
    primary:        { bg:'#fff', fg:'#000', border:'none', hover:'#e8e8e8' },
    dark:           { bg:'#14161c', fg:'#fff', border:'none', hover:'#2a2d36' },
    blue:           { bg:T.blue, fg:'#fff', border:'none', hover:T.blueBright },
    green:          { bg:T.green, fg:'#fff', border:'none', hover:T.greenBright },
    red:            { bg:T.red, fg:'#fff', border:'none', hover:T.redBright },
    'outline-dark': { bg:'transparent', fg:'#fff', border:'1px solid rgba(255,255,255,0.35)', hover:'rgba(255,255,255,0.1)' },
    'outline-light':{ bg:'transparent', fg:T.ink, border:'1px solid ' + T.hairlineLight, hover:'rgba(0,0,0,0.04)' },
  };

  function applyVariant(node, variant) {
    const v = BTN_VARIANTS[variant] || BTN_VARIANTS.primary;
    node.style.setProperty('--btn-bg', v.bg);
    node.style.setProperty('--btn-fg', v.fg);
    node.style.setProperty('--btn-border', v.border);
    node.style.setProperty('--btn-hover-bg', v.hover);
  }

  function btn(label, variant = 'primary', onClick, extraStyle = {}) {
    const b = el('button', { class: 'mg-btn' });
    applyVariant(b, variant);
    b.innerHTML = label;
    if (onClick) b.addEventListener('click', onClick);
    return b;
  }

  function linkBtn(label, href, variant = 'primary', extraStyle = {}) {
    const isExternal = href.startsWith('http');
    const a = el('a', {
      href: href.startsWith('/') ? url(href) : href,
      ...(isExternal ? { target: '_blank', rel: 'noopener' } : {}),
      class: 'mg-btn',
    });
    applyVariant(a, variant);
    a.innerHTML = label;
    return a;
  }

  Object.assign(window.MG, { btn, linkBtn });
})();
