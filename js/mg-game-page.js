(function() {
const { T, F, el, css, linkBtn, navbar, footer, url, rulesUrl, modCard } = MG;

const slug = document.body.dataset.game;
if (!slug) return;

fetch(url('/data/games-content.json'))
  .then(r => r.json())
  .then(allGames => {
    const game = allGames[slug];
    if (!game) { console.warn(`No game data for: ${slug}`); return; }
    render(game);
  });

function resolveHref(href) {
  if (href.startsWith('rules:')) return rulesUrl(href.slice(6));
  return href;
}

function render(game) {
  const accent = T[game.accent] || game.accent;

  document.getElementById('nav-root').appendChild(navbar('Games'));
  document.getElementById('footer-root').appendChild(footer());

  const gradientEl = document.querySelector('[data-gradient]');
  const hexEl = document.querySelector('[data-hex]');
  const accentEl = document.querySelector('[data-accent]');
  const colorEl = document.querySelector('[data-color]');
  const bloomEl = document.querySelector('[data-bloom]');

  if (gradientEl) gradientEl.style.background = game.colors.gradient;
  if (hexEl) hexEl.style.backgroundImage = `url('../../img/${game.colors.hexGrid}')`;
  if (accentEl) accentEl.style.background = accent;
  if (colorEl) {
    colorEl.style.color = game.colors.textColor;
    if (game.colors.textShadow) colorEl.style.textShadow = game.colors.textShadow;
  }
  if (bloomEl && game.colors.bloom) bloomEl.style.background = game.colors.bloom;

  // Hero buttons
  const heroBtns = document.getElementById('hero-btns');
  if (heroBtns && game.buttons.hero) {
    game.buttons.hero.forEach(([label, href, variant]) => {
      heroBtns.appendChild(linkBtn(label, resolveHref(href), variant));
    });
  }

  // Stats bar
  const sb = document.getElementById('stats-bar');
  if (sb && game.stats) {
    game.stats.forEach(([k, v], i) => {
      if (i > 0) sb.appendChild(el('span', {class: 'stats-row__divider'}));
      const d = el('div', {class: 'stats-row__item'});
      d.appendChild(el('span', {class: 'stats-row__label'}, k));
      d.appendChild(el('span', {class: 'stats-row__value'}, v));
      sb.appendChild(d);
    });
  }

  // Steps grid
  const sg = document.getElementById('steps-grid');
  if (sg && game.steps) {
    game.steps.forEach(s => {
      const a = el('article', {class: 'mg-card'});
      a.appendChild(el('div', {class: `mg-card__eyebrow mg-eyebrow--${game.accent}`}, s.n));
      a.appendChild(el('h3', {class: 'mg-card__title'}, s.title));
      a.appendChild(el('p', {class: 'mg-card__body'}, s.body));
      sg.appendChild(a);
    });
  }

  // CTA buttons
  const ctaEl = document.getElementById('button-cta');
  if (ctaEl && game.buttons.cta) {
    game.buttons.cta.forEach(([label, href, variant]) => {
      ctaEl.appendChild(linkBtn(label, resolveHref(href), variant));
    });
  }

  // Hooks grid
  const hg = document.getElementById('hooks-grid');
  if (hg && game.hooks) {
    game.hooks.forEach(h => {
      const d = el('div', {class: 'mg-card mg-card--row'});
      const icon = el('div', {class: 'mg-card__icon'});
      icon.style.background = accent;
      icon.textContent = '◈';
      d.appendChild(icon);
      const txt = el('div');
      const title = el('div', {class: 'mg-card__mono-title'});
      title.style.color = accent;
      title.textContent = h.name;
      txt.appendChild(title);
      txt.appendChild(el('div', {class: 'mg-card__desc'}, h.desc));
      d.appendChild(txt);
      hg.appendChild(d);
    });
  }

  // Community mods
  const cg = document.getElementById('comm-grid');
  if (cg && game.community) {
    game.community.forEach(m => cg.appendChild(modCard(m)));
  }

  // Races/variants grid
  const rg = document.getElementById('races-grid');
  if (rg && game.races) {
    game.races.forEach(r => {
      const d = el('div', {class: 'mg-card mg-card--light mg-card--row'});
      const icon = el('div', {class: 'mg-card__icon'});
      icon.style.background = r.accent;
      icon.textContent = r.icon || '♟';
      d.appendChild(icon);
      const txt = el('div');
      const title = el('div', {class: 'mg-card__mono-title'});
      title.style.color = r.accent;
      title.textContent = r.name;
      txt.appendChild(title);
      txt.appendChild(el('div', {class: 'mg-card__desc'}, r.desc));
      d.appendChild(txt);
      rg.appendChild(d);
    });
  }

  // Extra button sections (playtest-btns, engine-cta, etc.)
  if (game.buttons.extra) {
    for (const [id, btns] of Object.entries(game.buttons.extra)) {
      const container = document.getElementById(id);
      if (container) {
        btns.forEach(([label, href, variant]) => {
          container.appendChild(linkBtn(label, resolveHref(href), variant));
        });
      }
    }
  }
}
})();
