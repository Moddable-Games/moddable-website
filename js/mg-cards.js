(function() {
  const { T, CATEGORY_COLORS, el, url } = window.MG;

  function modCard({ category, title, baseGame, stats, body, href = '#', source = '' }) {
    const accent = CATEGORY_COLORS[category] || T.blue;
    const card = el('article', { 'data-reveal':'up', class:'mod-card' });

    card.addEventListener('mouseenter', () => { card.style.borderColor = accent; });
    card.addEventListener('mouseleave', () => { card.style.borderColor = ''; });

    card.appendChild(el('div', { class:'mod-card__accent', style:`background:${accent}` }));

    const inner = el('div', { class:'mod-card__inner' });

    const thumb = el('div', { class:'mod-card__thumb', style:`background:linear-gradient(135deg, #0a0d2a 0%, ${accent} 100%)` });
    thumb.appendChild(el('div', { class:'mod-card__thumb-hex', style:`background-image:url("${url('/img/hex-grid-white.svg')}")` }));
    inner.appendChild(thumb);

    const meta = el('div', { class:'mod-card__meta' });
    meta.appendChild(el('span', { class:'mod-card__category', style:`background:${accent}` }, category));
    meta.appendChild(el('span', { class:'mod-card__base-game' }, baseGame));
    inner.appendChild(meta);

    inner.appendChild(el('h3', { html: title, class:'mod-card__title' }));
    inner.appendChild(el('p', { class:'mod-card__body' }, body));

    const statsRow = el('div', { class:'mod-card__stats' });
    statsRow.appendChild(document.createTextNode(stats));
    if (source) statsRow.appendChild(el('span', { class:'mod-card__source' }, `via ${source}`));
    inner.appendChild(statsRow);

    const link = el('a', { href, class:'mod-card__link', style:`color:${accent}` });
    link.innerHTML = 'View the rules <span aria-hidden="true">→</span>';
    inner.appendChild(link);

    card.appendChild(inner);
    card.addEventListener('click', (e) => { if (e.target.tagName !== 'A') window.location.href = href; });
    return card;
  }

  function pageHero({ eyebrow, title, lede, accent = T.cosmicGlow, withHorizon = false, minHeight = 420 }) {
    const sec = el('section', { class:'page-hero', style:`min-height:${minHeight}px` });

    if (withHorizon) {
      sec.appendChild(el('div', { class:'page-hero__bg', style:`background:linear-gradient(180deg, ${T.cosmicDeep} 0%, ${T.cosmicMid} 50%, #000 100%)` }));
      sec.appendChild(el('div', { class:'page-hero__hex-land', style:`background:url("${url('/img/hex-land.jpg')}") center bottom / cover no-repeat` }));
      sec.appendChild(el('div', { class:'page-hero__hex-layer', style:`background-image:${window.MG.HEX_BG}` }));
      sec.appendChild(el('div', { class:'page-hero__fade' }));
      sec.appendChild(el('div', { class:'page-hero__fade-bottom' }));
    } else {
      sec.appendChild(el('div', { class:'page-hero__glow' }));
    }

    const content = el('div', { class:'page-hero__content hero-anim' });
    content.appendChild(el('div', { class:'page-hero__eyebrow', style:`color:${accent};text-shadow:0 0 12px ${accent}55` }, eyebrow));
    const h = el('h1', { html:title, class:'page-hero__title' });
    content.appendChild(h);
    if (lede) content.appendChild(el('p', { class:'page-hero__lede' }, lede));
    sec.appendChild(content);
    return sec;
  }

  Object.assign(window.MG, { modCard, pageHero });
})();
