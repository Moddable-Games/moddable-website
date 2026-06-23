import { T, el, linkBtn, navbar, footer, sectionHero, buildHeroFeature, url } from './mg.js';
document.getElementById('nav-root').appendChild(navbar('About'));
document.getElementById('footer-root').appendChild(footer());
document.getElementById('page-hero').appendChild(sectionHero({
  section: 'about',
  tier: 1,
  hexColor: 'blue',
  eyebrow: 'ABOUT MODDABLE',
  title: 'The <em>workshop</em> behind the rules',
  lede: 'Designers, modders, and rule-tinkerers reshaping the boards already on your shelf.',
  feature: buildHeroFeature('about')
}));

var sidebar = document.getElementById('about-sidebar');

var statsCard = el('div', { class: 'about-sidebar__card' });
statsCard.appendChild(el('div', { class: 'about-sidebar__card-title' }, 'Quick facts'));
var facts = [
  ['Founded', '2024, Kuala Lumpur'],
  ['Incorporated', '2025, UK'],
  ['Team', '4 people'],
  ['Games', '3 original'],
  ['Mods', '10 published'],
  ['License', 'MIT + CC BY-SA'],
];
facts.forEach(function(f) {
  var row = el('div', { class: 'about-stat' });
  row.appendChild(el('span', { class: 'about-stat__label' }, f[0]));
  row.appendChild(el('span', { class: 'about-stat__value' }, f[1]));
  statsCard.appendChild(row);
});
sidebar.appendChild(statsCard);

var linksCard = el('div', { class: 'about-sidebar__card' });
linksCard.appendChild(el('div', { class: 'about-sidebar__card-title' }, 'Explore'));
var linksWrap = el('div', { class: 'about-sidebar__links' });
var links = [
  { label: 'Rulebooks', sub: '21 game families', color: T.green, href: 'https://rules.moddable.games/', external: true },
  { label: 'Discord', sub: 'Join Community', color: T.red, href: url('/community/') },
  { label: 'Team', sub: 'Meet Workshop', color: T.blue, href: url('/team/') },
  { label: 'Roadmap', sub: '18-month plan', color: T.ink, href: url('/about/roadmap/') },
  { label: 'Press Kit', sub: 'Logos and assets', color: T.ink, href: url('/press/') },
];
links.forEach(function(l) {
  var attrs = { href: l.href, class: 'about-link' };
  if (l.external) { attrs.target = '_blank'; attrs.rel = 'noopener'; }
  var a = el('a', attrs);
  var icon = el('div', { class: 'about-link__icon' });
  icon.style.background = l.color;
  a.appendChild(icon);
  var t = el('div');
  t.appendChild(el('div', { class: 'about-link__label' }, l.label));
  t.appendChild(el('div', { class: 'about-link__sub' }, l.sub));
  a.appendChild(t);
  linksWrap.appendChild(a);
});
linksCard.appendChild(linksWrap);
sidebar.appendChild(linksCard);