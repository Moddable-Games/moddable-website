/* =========================================================================
   Moddable.Games — Hero System
   Tier-1 (section index) & Tier-2 (sub-page) hero builder with
   parallax scrolling and animated floating SVG elements.
   ========================================================================= */

(function() {
  const { T, el, url } = window.MG;

  const FLOAT_ICONS = {
    mods: [
      { svg: docIcon, count: 3 },
      { svg: penIcon, count: 3 },
      { svg: sparkIcon, count: 2 }
    ],
    games: [
      { svg: diceIcon, count: 4 },
      { svg: pawnIcon, count: 3 },
      { svg: cardIcon, count: 2 }
    ],
    tools: [
      { svg: gearIcon, count: 3 },
      { svg: wrenchIcon, count: 3 },
      { svg: diceIcon, count: 2 }
    ],
    news: [
      { svg: docIcon, count: 4 },
      { svg: penIcon, count: 3 },
      { svg: sparkIcon, count: 2 }
    ],
    engines: [
      { svg: cogIcon, count: 3 },
      { svg: bracketIcon, count: 3 },
      { svg: chipIcon, count: 2 }
    ],
    about: [
      { svg: sparkIcon, count: 3 },
      { svg: hexIcon, count: 3 },
      { svg: cubeIcon, count: 2 }
    ],
    submit: [
      { svg: docIcon, count: 2 },
      { svg: penIcon, count: 2 }
    ],
    community: [
      { svg: sparkIcon, count: 2 },
      { svg: hexIcon, count: 2 }
    ],
    team: [
      { svg: sparkIcon, count: 2 },
      { svg: hexIcon, count: 2 }
    ],
    press: [
      { svg: docIcon, count: 2 },
      { svg: sparkIcon, count: 2 }
    ],
    roadmap: [
      { svg: sparkIcon, count: 2 },
      { svg: hexIcon, count: 2 }
    ],
    'tool-ti': [
      { svg: hexIcon, count: 2 },
      { svg: sparkIcon, count: 2 }
    ],
    'tool-talisman': [
      { svg: hexIcon, count: 2 },
      { svg: sparkIcon, count: 2 }
    ],
    'tool-nukes': [
      { svg: hexIcon, count: 2 },
      { svg: sparkIcon, count: 2 }
    ],
    'tool-dice': [
      { svg: diceIcon, count: 2 },
      { svg: sparkIcon, count: 2 }
    ],
    'tool-decks': [
      { svg: cardIcon, count: 2 },
      { svg: sparkIcon, count: 2 }
    ],
    'tool-chess': [
      { svg: pawnIcon, count: 2 },
      { svg: sparkIcon, count: 2 }
    ]
  };

  function diceIcon(size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="40" height="40" rx="8" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="16" r="3" fill="currentColor"/><circle cx="32" cy="16" r="3" fill="currentColor"/><circle cx="24" cy="24" r="3" fill="currentColor"/><circle cx="16" cy="32" r="3" fill="currentColor"/><circle cx="32" cy="32" r="3" fill="currentColor"/></svg>`;
  }
  function pawnIcon(size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="14" r="7" stroke="currentColor" stroke-width="2"/><path d="M16 44h16l-2-14H18l-2 14z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M18 30c-2 0-4 2-4 4h20c0-2-2-4-4-4" stroke="currentColor" stroke-width="2"/></svg>`;
  }
  function cardIcon(size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="4" width="28" height="40" rx="4" stroke="currentColor" stroke-width="2"/><rect x="12" y="6" width="28" height="40" rx="4" stroke="currentColor" stroke-width="2" opacity="0.5"/><circle cx="22" cy="24" r="6" stroke="currentColor" stroke-width="2"/></svg>`;
  }
  function gearIcon(size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 16a8 8 0 100 16 8 8 0 000-16z" stroke="currentColor" stroke-width="2"/><path d="M22 4h4l1 5.2a12 12 0 013.5 2l4.7-2.4 2 3.5-3.7 3.7a12 12 0 010 4l3.7 3.7-2 3.5-4.7-2.4a12 12 0 01-3.5 2L26 44h-4l-1-5.2a12 12 0 01-3.5-2L12.8 39.2l-2-3.5 3.7-3.7a12 12 0 010-4l-3.7-3.7 2-3.5 4.7 2.4a12 12 0 013.5-2L22 4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;
  }
  function wrenchIcon(size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M30.5 6.5a10 10 0 00-12.7 12.7L8 29l11 11 9.8-9.8A10 10 0 0030.5 6.5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M28 12l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  }
  function docIcon(size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 6h16l10 10v26a2 2 0 01-2 2H12a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M28 6v10h10" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M16 24h16M16 30h12M16 36h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  }
  function penIcon(size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 40l4-16L34 2l6 6-22 22-16 4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M28 8l6 6" stroke="currentColor" stroke-width="2"/></svg>`;
  }
  function sparkIcon(size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 4l4 14h14l-11 8 4 14-11-8-11 8 4-14L6 18h14l4-14z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;
  }
  function cogIcon(size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="8" stroke="currentColor" stroke-width="2"/><circle cx="24" cy="24" r="16" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 6"/><path d="M24 4v6M24 38v6M4 24h6M38 24h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  }
  function bracketIcon(size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 8l-8 4v24l8 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M32 8l8 4v24l-8 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 30l8-12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  }
  function chipIcon(size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="12" y="12" width="24" height="24" rx="4" stroke="currentColor" stroke-width="2"/><rect x="18" y="18" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M18 8v4M24 8v4M30 8v4M18 36v4M24 36v4M30 36v4M8 18h4M8 24h4M8 30h4M36 18h4M36 24h4M36 30h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  }
  function hexIcon(size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 4l18 10v20L24 44 6 34V14L24 4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M24 14l10 6v12l-10 6-10-6V20l10-6z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" opacity="0.6"/></svg>`;
  }
  function cubeIcon(size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 6l18 10v16L24 42 6 32V16L24 6z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M24 22v20M6 16l18 6 18-6" stroke="currentColor" stroke-width="1.5" opacity="0.6"/></svg>`;
  }

  function buildFloats(section, container) {
    var icons = FLOAT_ICONS[section] || FLOAT_ICONS.about;
    var idx = 0;
    icons.forEach(function(group) {
      for (var i = 0; i < group.count; i++) {
        var size = 28 + Math.floor(Math.random() * 24);
        var floatEl = document.createElement('div');
        floatEl.className = 'mg-hero__float';
        floatEl.innerHTML = group.svg(size);
        floatEl.style.color = 'var(--hero-accent, #6fb5ff)';
        var x = 5 + (idx * 11) % 85;
        var y = 10 + Math.floor(Math.random() * 70);
        floatEl.style.setProperty('--fx', x + '%');
        floatEl.style.setProperty('--fy', y + '%');
        floatEl.style.setProperty('--fdx', (Math.random() * 40 - 20) + 'px');
        floatEl.style.setProperty('--fdy', -(20 + Math.random() * 40) + 'px');
        floatEl.style.setProperty('--fdx2', (Math.random() * 30 - 15) + 'px');
        floatEl.style.setProperty('--fdy2', -(40 + Math.random() * 50) + 'px');
        floatEl.style.setProperty('--fr', Math.floor(Math.random() * 20 - 10) + 'deg');
        floatEl.style.setProperty('--frot', Math.floor(Math.random() * 30 - 15) + 'deg');
        floatEl.style.setProperty('--frot2', Math.floor(Math.random() * 40) + 'deg');
        floatEl.style.setProperty('--fo', (0.08 + Math.random() * 0.12).toFixed(2));
        floatEl.style.setProperty('--float-dur', (14 + Math.random() * 12) + 's');
        floatEl.style.setProperty('--float-delay', (idx * 2.5) + 's');
        floatEl.style.left = x + '%';
        floatEl.style.top = y + '%';
        container.appendChild(floatEl);
        idx++;
      }
    });
  }

  function initParallax(hero) {
    var hexLayer = hero.querySelector('.mg-hero__hex');
    var floatsLayer = hero.querySelector('.mg-hero__floats');
    var content = hero.querySelector('.mg-hero__content');
    var land = hero.querySelector('.mg-hero__land');
    var glow = hero.querySelector('.mg-hero__glow');
    var gradient = hero.querySelector('.mg-hero__gradient');
    var ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function() {
        var rect = hero.getBoundingClientRect();
        var visible = rect.bottom > 0 && rect.top < window.innerHeight;
        if (visible) {
          var scrolled = Math.max(0, -rect.top);
          var ratio = Math.min(1, scrolled / (rect.height * 0.4));

          if (hexLayer) {
            hexLayer.style.transform = 'translateY(' + (ratio * 300) + 'px) scale(' + (1 + ratio * 0.35) + ') rotate(' + (ratio * 6) + 'deg)';
            hexLayer.style.opacity = (0.6 + ratio * 0.4).toFixed(2);
          }
          if (floatsLayer) {
            floatsLayer.style.transform = 'translateY(' + (ratio * -120) + 'px) scale(' + (1 + ratio * 0.4) + ')';
            floatsLayer.style.opacity = Math.max(0, 1 - ratio * 2.5).toFixed(2);
          }
          if (content) {
            content.style.transform = 'translateY(' + (ratio * -150) + 'px)';
            content.style.opacity = Math.max(0, 1 - ratio * 3).toFixed(2);
          }
          if (land) {
            land.style.transform = 'translateY(' + (ratio * 200) + 'px) scale(' + (1 + ratio * 0.5) + ')';
            land.style.opacity = (0.18 + ratio * 0.25).toFixed(2);
          }
          if (glow) {
            var glowScale = 1 + ratio * 2.5;
            glow.style.transform = 'translateX(-50%) scale(' + glowScale + ')';
            glow.style.opacity = Math.max(0, 1.3 - ratio * 2).toFixed(2);
          }
          if (gradient) {
            gradient.style.filter = 'brightness(' + (1 - ratio * 0.6) + ') saturate(' + (1 + ratio * 0.5) + ')';
          }
        }
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function sectionHero(opts) {
    var section = opts.section || 'about';
    var tier = opts.tier || 1;
    var eyebrow = opts.eyebrow || '';
    var title = opts.title || '';
    var lede = opts.lede || '';
    var hexColor = opts.hexColor || 'blue';
    var feature = opts.feature || null;

    var classes = 'mg-hero mg-hero--tier' + tier + ' mg-hero--' + section;
    if (feature) classes += ' mg-hero--has-feature';
    var hero = el('section', { class: classes });

    hero.appendChild(el('div', { class: 'mg-hero__gradient' }));

    if (tier === 1) {
      hero.appendChild(el('div', { class: 'mg-hero__land' }));
    }

    hero.appendChild(el('div', { class: 'mg-hero__hex mg-hero__hex--' + hexColor }));
    hero.appendChild(el('div', { class: 'mg-hero__fade-top' }));
    hero.appendChild(el('div', { class: 'mg-hero__fade-bottom' }));
    hero.appendChild(el('div', { class: 'mg-hero__glow' }));

    var floats = el('div', { class: 'mg-hero__floats' });
    buildFloats(section, floats);
    hero.appendChild(floats);

    var content = el('div', { class: 'mg-hero__content hero-anim' });
    var textWrap = el('div', { class: 'mg-hero__text' });
    textWrap.appendChild(el('div', { class: 'mg-hero__eyebrow' }, eyebrow));
    textWrap.appendChild(el('h1', { html: title, class: 'mg-hero__title' }));
    textWrap.appendChild(el('p', { class: 'mg-hero__lede' }, lede));
    content.appendChild(textWrap);

    if (feature) {
      var featureWrap = el('div', { class: 'mg-hero__feature' });
      featureWrap.appendChild(feature);
      content.appendChild(featureWrap);
    }

    hero.appendChild(content);

    requestAnimationFrame(function() { initParallax(hero); });

    return hero;
  }

  function makeCube(variant, faceFn) {
    var wrap = el('div', { class: 'hero-obj-wrap' });
    var obj = el('div', { class: 'hero-obj hero-obj--' + variant });
    var sides = ['front','back','left','right','top','bottom'];
    sides.forEach(function(side) {
      var face = el('div', { class: 'hero-obj__face hero-obj__face--' + side });
      if (faceFn) faceFn(face, side);
      obj.appendChild(face);
    });
    wrap.appendChild(obj);
    return wrap;
  }

  var MODS_SVG = '<svg class="mods-face-icon" viewBox="0 0 60 60"><rect x="10" y="6" width="36" height="48" rx="3"/><path d="M10 12h-3a2 2 0 00-2 2v38a2 2 0 002 2h32a2 2 0 002-2v-3"/><line x1="18" y1="18" x2="38" y2="18"/><line x1="18" y1="26" x2="34" y2="26"/><line x1="18" y1="34" x2="36" y2="34"/><line x1="18" y1="42" x2="30" y2="42"/></svg>';
  var MODS_SVG_ALT = '<svg class="mods-face-icon" viewBox="0 0 60 60"><path d="M12 8h28l8 8v36a2 2 0 01-2 2H12a2 2 0 01-2-2V10a2 2 0 012-2z"/><path d="M40 8v8h8"/><line x1="18" y1="24" x2="38" y2="24"/><line x1="18" y1="32" x2="34" y2="32"/><line x1="18" y1="40" x2="36" y2="40"/></svg>';

  var MODS_ANIM_SVG = null;

  var GEAR_SVG = '<svg class="engines-face-icon" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="7" stroke="currentColor" stroke-width="2"/><path d="M22 4h4l1 5.2a12 12 0 013.5 2l4.7-2.4 2 3.5-3.7 3.7a12 12 0 010 4l3.7 3.7-2 3.5-4.7-2.4a12 12 0 01-3.5 2L26 44h-4l-1-5.2a12 12 0 01-3.5-2L12.8 39.2l-2-3.5 3.7-3.7a12 12 0 010-4l-3.7-3.7 2-3.5 4.7 2.4a12 12 0 013.5-2L22 4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';

  function hexPoints(cx, cy, r) {
    var pts = [];
    for (var i = 0; i < 6; i++) {
      var angle = Math.PI / 180 * (60 * i - 30);
      pts.push((cx + r * Math.cos(angle)).toFixed(1) + ',' + (cy + r * Math.sin(angle)).toFixed(1));
    }
    return pts.join(' ');
  }

  function buildGamesSVG() {
    var r = 11;
    var w = r * Math.sqrt(3);
    var h = r * 2;
    var cx = 60, cy = 60;
    var grid = [
      [0,-2],[1,-2],[2,-2],
      [-0.5,-1],[0.5,-1],[1.5,-1],[2.5,-1],
      [-1,0],[0,0],[1,0],[2,0],[3,0],
      [-0.5,1],[0.5,1],[1.5,1],[2.5,1],
      [0,2],[1,2],[2,2]
    ];
    var litIndices = [4,9,10,14,17];
    var pieceIndices = [4,10,17];
    var svg = '<svg class="games-anim-svg" viewBox="0 0 120 120"><g class="board-group">';
    grid.forEach(function(pos, i) {
      var hx = cx + pos[0] * w;
      var hy = cy + pos[1] * h * 0.75;
      var lit = litIndices.indexOf(i) !== -1;
      svg += '<polygon class="hex-cell' + (lit ? ' hex-cell--lit' : '') + '" points="' + hexPoints(hx, hy, r) + '"/>';
    });
    pieceIndices.forEach(function(pi, i) {
      var pos = grid[pi];
      var px = cx + pos[0] * w;
      var py = cy + pos[1] * h * 0.75;
      svg += '<circle class="piece" cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="3.5" style="animation-delay:' + (i * 1.2) + 's"/>';
    });
    var p0 = grid[4], p1 = grid[10];
    var x0 = cx + p0[0] * w, y0 = cy + p0[1] * h * 0.75;
    var x1 = cx + p1[0] * w, y1 = cy + p1[1] * h * 0.75;
    var mx = (x0 + x1) / 2, my = (y0 + y1) / 2 - 10;
    svg += '<path class="move-path" d="M' + x0.toFixed(1) + ',' + y0.toFixed(1) + ' Q' + mx.toFixed(1) + ',' + my.toFixed(1) + ' ' + x1.toFixed(1) + ',' + y1.toFixed(1) + '"/>';
    svg += '</g></svg>';
    return svg;
  }

  var NEWS_SVG = '<svg class="news-anim-svg" viewBox="0 0 100 120"><g class="doc-float"><rect class="doc-body" x="15" y="10" width="60" height="80" rx="4"/><polygon class="doc-fold" points="55,10 75,10 75,30 55,30"/><polygon class="doc-fold" points="55,10 75,30 55,30" style="fill:rgba(225,29,137,0.08)"/><line class="doc-headline" x1="24" y1="40" x2="52" y2="40" stroke-dasharray="28"/><line class="doc-line" x1="24" y1="50" x2="66" y2="50" stroke-dasharray="42"/><line class="doc-line" x1="24" y1="57" x2="58" y2="57" stroke-dasharray="34"/><line class="doc-line" x1="24" y1="64" x2="62" y2="64" stroke-dasharray="38"/><line class="doc-line" x1="24" y1="71" x2="50" y2="71" stroke-dasharray="26"/><line class="doc-line" x1="24" y1="78" x2="56" y2="78" stroke-dasharray="32"/><rect class="doc-cursor" x="56" y="77" width="2" height="4" rx="1"/></g><g class="doc-float" style="animation-delay:-3s"><rect class="doc-body" x="30" y="25" width="60" height="80" rx="4" opacity="0.3"/></g></svg>';

  function buildFeature(section) {
    if (section === 'mods') {
      var mWrap = el('div', { class: 'mods-anim-wrap' });
      var morph = el('div', { class: 'mods-morph' });
      morph.appendChild(el('div', { class: 'mods-morph__glow' }));
      morph.appendChild(el('div', { class: 'mods-morph__ring mods-morph__ring--3' }));
      morph.appendChild(el('div', { class: 'mods-morph__ring mods-morph__ring--2' }));
      morph.appendChild(el('div', { class: 'mods-morph__ring mods-morph__ring--1' }));
      morph.appendChild(el('div', { class: 'mods-morph__shape' }));
      mWrap.appendChild(morph);
      return mWrap;

    } else if (section === 'games') {
      var gWrap = el('div', { class: 'games-anim-wrap' });
      gWrap.innerHTML = buildGamesSVG();
      return gWrap;

    } else if (section === 'developers') {
      var dWrap = el('div', { class: 'dev-anim-wrap' });
      dWrap.innerHTML = '<svg class="dev-anim-svg" viewBox="0 0 100 120"><g class="doc-float"><rect class="doc-body" x="12" y="12" width="76" height="56" rx="4"/><text class="dev-bracket" x="20" y="40" font-size="22">&lt;/&gt;</text><line class="doc-line" x1="48" y1="30" x2="78" y2="30" stroke-dasharray="30"/><line class="doc-line" x1="48" y1="38" x2="72" y2="38" stroke-dasharray="24"/><line class="doc-line" x1="48" y1="46" x2="76" y2="46" stroke-dasharray="28"/><line class="doc-line" x1="48" y1="54" x2="66" y2="54" stroke-dasharray="18"/><rect class="doc-cursor" x="66" y="52" width="2" height="5" rx="1"/></g><g class="doc-float" style="animation-delay:-2.5s"><rect class="doc-body" x="22" y="72" width="56" height="36" rx="3" opacity="0.25"/><line class="doc-line" x1="30" y1="82" x2="60" y2="82" stroke-dasharray="30" opacity="0.4"/><line class="doc-line" x1="30" y1="90" x2="52" y2="90" stroke-dasharray="22" opacity="0.4"/><line class="doc-line" x1="30" y1="98" x2="56" y2="98" stroke-dasharray="26" opacity="0.4"/></g></svg>';
      return dWrap;

    } else if (section === 'news') {
      var wrap = el('div', { class: 'news-anim-wrap' });
      wrap.innerHTML = NEWS_SVG;
      return wrap;

    } else if (section === 'engines') {
      return makeCube('engines', function(face) {
        face.innerHTML = GEAR_SVG;
      });

    } else if (section === 'about') {
      var colors = { front:'red', back:'green', left:'blue', right:'red', top:'green', bottom:'blue' };
      return makeCube('about', function(face, side) {
        face.appendChild(el('div', { class: 'cube-face-fill cube-face-fill--' + colors[side] }));
      });

    }
    return null;
  }

  Object.assign(window.MG, { sectionHero: sectionHero, buildHeroFeature: buildFeature });
})();
