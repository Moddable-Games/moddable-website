/* =========================================================================
   Moddable.Games — Core: Tokens, Fonts, Helpers
   ========================================================================= */

window._MG_CORE = (() => {

  const BASE = (document.querySelector('meta[name="mg-base"]') || {}).content || '';
  function url(path) { return BASE + path; }

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

  function css(obj) { return obj; }

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

  return { BASE, url, T, F, CATEGORY_COLORS, HEX_BG, HEX_BG_RED, HEX_BG_GREEN, el, css, cubeSVG };
})();
