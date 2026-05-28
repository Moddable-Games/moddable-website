/* =========================================================================
   Moddable.Games — Core: Tokens, Fonts, Helpers
   Must load first. Creates window.MG namespace.
   ========================================================================= */

window.MG = (() => {
  const VERSION = '1.0.54';
  const META_BASE = (document.querySelector('meta[name="mg-base"]') || {}).content;
  const BASE = META_BASE != null ? META_BASE
    : location.pathname.includes('/MODDABLE/moddable-website')
      ? '/MODDABLE/moddable-website' : '';
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
    mute:"#4f5764", stone:"#636b78", faint:"#c3c5cc",
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

  const ACCENT_MAP = { red: T.red, green: T.green, blue: T.blue };

  const data = (() => {
    const cache = {};
    const inflight = {};

    function transform(name, items) {
      if (name === 'mods') {
        return items.map(m => Object.assign({}, m, { href: url(m.path) }));
      }
      if (name === 'games') {
        return items.map(g => Object.assign({}, g, { accent: ACCENT_MAP[g.accent] || g.accent, href: url(g.path) }));
      }
      return items;
    }

    function fetchOne(name) {
      if (cache[name]) return Promise.resolve(cache[name]);
      if (inflight[name]) return inflight[name];
      inflight[name] = fetch(url('/data/' + name + '.json'))
        .then(r => r.json())
        .then(items => {
          cache[name] = transform(name, items);
          delete inflight[name];
          return cache[name];
        });
      return inflight[name];
    }

    function get(name, slug) {
      if (slug !== undefined) {
        return fetchOne(name === 'mod' ? 'mods' : name + 's').then(items =>
          items.find(item => item.slug === slug) || null
        );
      }
      return fetchOne(name);
    }

    function load(names) {
      return Promise.all(names.map(fetchOne)).then(() => ({
        mods: cache.mods || null,
        games: cache.games || null,
        engines: cache.engines || null,
        news: cache.news || null,
        team: cache.team || null,
      }));
    }

    return { get, load };
  })();

  const isLocal = Boolean(BASE);
  const RULES_BASE = isLocal
    ? 'http://localhost/MODDABLE/moddable-rules/dist'
    : 'https://rules.moddable.games/dist';

  function rulesUrl(slug) {
    return `${RULES_BASE}/${slug}/`;
  }

  return { VERSION, T, F, HEX_BG, HEX_BG_RED, HEX_BG_GREEN, CATEGORY_COLORS, el, css, cubeSVG, url, rulesUrl, data };
})();
