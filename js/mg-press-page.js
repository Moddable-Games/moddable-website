import { T, el, url, btn, navbar, footer, sectionHero } from './mg.js';
document.getElementById('nav-root').appendChild(navbar('About'));
document.getElementById('footer-root').appendChild(footer());
document.getElementById('page-hero').appendChild(sectionHero({
section: 'press',
tier: 2,
hexColor: 'blue',
eyebrow: 'PRESS & MEDIA',
title: 'Press kit.',
lede: 'Pre-cleared assets for editorial use. Just credit Moddable.Games.'
}));

var content = document.getElementById('press-content');
var sidebar = document.getElementById('press-sidebar');

/* ── LOGOS SECTION ── */
var logosSection = el('div');
logosSection.appendChild(el('h2', { class: 'press-section__title' }, 'Moddable logos'));
var logoGrid = el('div', { class: 'press-logo-grid' });
var logos = [
{ src: '/press/logos/moddable-logo.png', label: 'Full logo (colour)', bg: '#fff' },
{ src: '/press/logos/moddable-logo-white.png', label: 'Full logo (white)', bg: '#0a0d2a' },
{ src: '/press/logos/moddable-logo-black.png', label: 'Full logo (black)', bg: '#f5f4ef' },
{ src: '/press/logos/moddable-chess-cube.svg', label: 'Chess engine mark', bg: '#fff' },
];
logos.forEach(function(l) {
var a = el('a', { href: url(l.src), target: '_blank', rel: 'noopener', class: 'press-logo-card' });
a.style.background = l.bg;
var img = el('img', { src: url(l.src), alt: l.label, class: 'press-logo-card__img' });
a.appendChild(img);
a.appendChild(el('div', { class: 'press-logo-card__label' }, l.label));
logoGrid.appendChild(a);
});
logosSection.appendChild(logoGrid);
content.appendChild(logosSection);

/* ── SCREENSHOTS SECTION ── */
var ssSection = el('div');
ssSection.appendChild(el('h2', { class: 'press-section__title' }, 'Screenshots'));
var ssGrid = el('div', { class: 'press-screenshot-grid' });
var screenshots = [
{ src: '/press/screenshots/chess-online.png', label: 'Moddable Chess — Grand Chess variant' },
{ src: '/press/screenshots/hexmaps-online.png', label: 'Moddable Hexmaps — Nukes map' },
{ src: '/press/screenshots/dungeon-chess-board.png', label: 'Dungeon Chess — 4-player board' },
{ src: '/press/screenshots/nukes-online.png', label: 'Nukes — online hex map' },
];
screenshots.forEach(function(s) {
var card = el('a', { href: url(s.src), target: '_blank', rel: 'noopener', class: 'press-screenshot' });
card.appendChild(el('img', { src: url(s.src), alt: s.label, class: 'press-screenshot__img' }));
card.appendChild(el('div', { class: 'press-screenshot__label' }, s.label));
ssGrid.appendChild(card);
});
ssSection.appendChild(ssGrid);
content.appendChild(ssSection);

/* ── DOCUMENTS SECTION ── */
var docsSection = el('div');
docsSection.appendChild(el('h2', { class: 'press-section__title' }, 'Documents'));
var docsGrid = el('div', { class: 'press-downloads' });
var docs = [
{ label: 'Press Release', meta: 'Markdown', href: '/press/documents/press-release.md', color: T.red },
{ label: 'Company Backgrounder', meta: 'Markdown', href: '/press/documents/company-backgrounder.md', color: T.blue },
{ label: 'Fact Sheet', meta: 'Markdown', href: '/press/documents/fact-sheet.md', color: T.green },
];
docs.forEach(function(d) {
var a = el('a', { href: url(d.href), target: '_blank', rel: 'noopener', class: 'press-dl' });
var icon = el('div', { class: 'press-dl__icon' }, 'MD');
icon.style.background = d.color;
a.appendChild(icon);
var text = el('div', { class: 'press-dl__text' });
text.appendChild(el('div', { class: 'press-dl__label' }, d.label));
text.appendChild(el('div', { class: 'press-dl__meta' }, d.meta));
a.appendChild(text);
a.appendChild(el('span', { class: 'press-dl__arrow' }, '↓'));
docsGrid.appendChild(a);
});
docsSection.appendChild(docsGrid);
content.appendChild(docsSection);

/* ── BRAND COLOURS SECTION ── */
var colourSection = el('div');
colourSection.appendChild(el('h2', { class: 'press-section__title' }, 'Brand colours'));
var swatches = el('div', { class: 'press-swatches' });
var colours = [
{ name: 'Red', hex: T.red },
{ name: 'Green', hex: T.green },
{ name: 'Blue', hex: T.blue },
{ name: 'Deep', hex: T.cosmicDeep },
{ name: 'Mid', hex: T.cosmicMid },
{ name: 'Glow', hex: T.cosmicGlow },
{ name: 'Canvas', hex: T.canvasLight },
{ name: 'Ink', hex: T.ink },
];
colours.forEach(function(c) {
var swatch = el('div', { class: 'press-swatch' });
var color = el('div', { class: 'press-swatch__color' });
color.style.backgroundColor = c.hex;
swatch.appendChild(color);
swatch.appendChild(el('div', { class: 'press-swatch__hex' }, c.hex));
swatch.appendChild(el('div', { class: 'press-swatch__name' }, c.name));
swatches.appendChild(swatch);
});
colourSection.appendChild(swatches);
content.appendChild(colourSection);

/* ── GAME LOGOS SECTION ── */
var gameLogosSection = el('div');
gameLogosSection.appendChild(el('h2', { class: 'press-section__title' }, 'Game logos'));
var gameLogoGrid = el('div', { class: 'press-logo-grid' });
var gameLogos = [
{ src: '/press/logos/nukes-logo.png', label: 'Nukes', bg: '#fff' },
{ src: '/press/logos/mongo-logo.png', label: 'Planet Mongo', bg: '#fff' },
{ src: '/press/logos/endless-skies-logo.png', label: 'Endless Skies', bg: '#fff' },
{ src: '/press/logos/dungeon-chess-black.png', label: 'Dungeon Chess (black)', bg: '#fff' },
{ src: '/press/logos/dungeon-chess-white.png', label: 'Dungeon Chess (white)', bg: '#0a0d2a' },
{ src: '/press/logos/hyper-imperium-logo.png', label: 'Hyper Imperium', bg: '#fff' },
{ src: '/press/logos/econopoly-logo.png', label: 'Econopoly', bg: '#fff' },
{ src: '/press/logos/talisman-worlds-logo.png', label: 'Talisman Worlds', bg: '#fff' },
];
gameLogos.forEach(function(l) {
var a = el('a', { href: url(l.src), target: '_blank', rel: 'noopener', class: 'press-logo-card' });
a.style.background = l.bg;
var img = el('img', { src: url(l.src), alt: l.label, class: 'press-logo-card__img' });
a.appendChild(img);
a.appendChild(el('div', { class: 'press-logo-card__label' }, l.label));
gameLogoGrid.appendChild(a);
});
gameLogosSection.appendChild(gameLogoGrid);
content.appendChild(gameLogosSection);

/* ── SIDEBAR ── */
var contactCard = el('div', { class: 'press-sidebar__card' });
var contactInner = el('div', { class: 'press-contact' });
contactInner.appendChild(el('div', { class: 'press-contact__email' }, 'press@moddable.games'));
var copyBtn = btn('Copy email', 'dark', function() {
navigator.clipboard.writeText('press@moddable.games').then(function() {
  var msg = document.getElementById('press-copied');
  msg.classList.add('press-copied--show');
  setTimeout(function() { msg.classList.remove('press-copied--show'); }, 2000);
});
});
contactInner.appendChild(el('div', { class: 'press-contact__btn' }, copyBtn));
contactInner.appendChild(el('span', { id: 'press-copied', class: 'press-copied' }, 'Copied'));
contactCard.appendChild(contactInner);
sidebar.appendChild(contactCard);

var factsCard = el('div', { class: 'press-sidebar__card' });
factsCard.appendChild(el('div', { class: 'press-sidebar__card-title' }, 'Quick facts'));
var facts = [
['Founded', '2024, Kuala Lumpur'],
['Incorporated', '2025, UK'],
['Team', '4 people'],
['Games', '3 original'],
['Mods', '10 published'],
['Engines', '2 open-source'],
['License', 'MIT'],
];
facts.forEach(function(f) {
var row = el('div', { class: 'press-sidebar-stat' });
row.appendChild(el('span', { class: 'press-sidebar-stat__label' }, f[0]));
row.appendChild(el('span', { class: 'press-sidebar-stat__value' }, f[1]));
factsCard.appendChild(row);
});
sidebar.appendChild(factsCard);