import { T, el, url, linkBtn, navbar, footer, sectionHero } from './mg.js';
document.getElementById('nav-root').appendChild(navbar('About'));
document.getElementById('footer-root').appendChild(footer());
document.getElementById('page-hero').appendChild(sectionHero({
section: 'roadmap',
tier: 2,
hexColor: 'blue',
eyebrow: '18-MONTH ROADMAP',
title: 'What ships when.',
lede: 'Our public roadmap, updated as milestones land.'
}));

var milestones = [
{ quarter: 'Q3 2026', text: 'Nukes: first 500-unit print run ships', color: '#d11a1a' },
{ quarter: 'Q3 2026', text: 'Moddable Chess: 70 variants playable online', color: '#3a9928' },
{ quarter: 'Q4 2026', text: 'Dungeon Chess: crowdfunding campaign live', color: '#14161c' },
{ quarter: 'Q1 2027', text: 'Marketplace beta: creators upload + sell mods', color: '#0c4f8d' },
{ quarter: 'Q2 2027', text: 'Planet Mongo: multiplayer playtest online', color: '#0c4f8d' },
{ quarter: 'Q3 2027', text: 'Print-on-demand pipeline live', color: '#0c4f8d' },
];

var timeline = document.getElementById('timeline');
milestones.forEach(function(m) {
var row = el('div', { class: 'milestone-row' });
var badge = el('span', { class: 'milestone-badge' }, m.quarter);
badge.style.background = m.color;
var text = el('div', { class: 'milestone-text' }, m.text);
row.appendChild(badge);
row.appendChild(text);
timeline.appendChild(row);
});

/* ── VISION GRID (below timeline) ── */
var visionGrid = document.getElementById('vision-grid');
var visionItems = [
{ num: '01', label: 'ENGINE', title: 'Host any hex-based game online.', body: 'A universal runtime for hex-grid games with drag pieces, resolved rules, and live spectating.', color: T.green },
{ num: '02', label: 'MARKETPLACE', title: 'Designers sell mods and expansions.', body: 'Upload your creation, set a price or go free, and reach thousands of players instantly.', color: T.blue },
{ num: '03', label: 'COMMUNITY', title: 'Players find groups and run tournaments.', body: 'Matchmaking, leaderboards, and event scheduling built into the platform.', color: T.red },
];
visionItems.forEach(function(v) {
var card = el('div', { class: 'vision-card' });
var numEl = el('div', { class: 'vision-number' }, v.num);
numEl.style.color = v.color;
card.appendChild(numEl);
card.appendChild(el('div', { class: 'vision-label' }, v.label));
card.appendChild(el('div', { class: 'vision-title' }, v.title));
card.appendChild(el('div', { class: 'vision-body' }, v.body));
visionGrid.appendChild(card);
});

/* ── SIDEBAR ── */
var sidebar = document.getElementById('roadmap-sidebar');

var linksCard = el('div', { class: 'roadmap-sidebar__card' });
linksCard.appendChild(el('div', { class: 'roadmap-sidebar__card-title' }, 'Related'));
var relLinks = [
{ label: 'About Moddable', sub: 'Our story and philosophy', href: url('/about/'), color: T.blue },
{ label: 'Team', sub: 'The people behind it', href: url('/team/'), color: T.green },
{ label: 'Community', sub: 'Join Discord', href: url('/community/'), color: T.red },
{ label: 'Engines', sub: 'Chess + Hexmaps SDKs', href: url('/engines/'), color: T.ink },
{ label: 'Press Kit', sub: 'Logos and assets', href: url('/press/'), color: T.blue },
];
var linksWrap = el('div', { class: 'roadmap-sidebar__links' });
relLinks.forEach(function(l) {
var a = el('a', { href: l.href, class: 'roadmap-sidebar__link' });
var dot = el('span', { class: 'roadmap-sidebar__link-dot' });
dot.style.background = l.color;
a.appendChild(dot);
var text = el('div');
text.appendChild(el('div', { class: 'roadmap-sidebar__link-label' }, l.label));
text.appendChild(el('div', { class: 'roadmap-sidebar__link-sub' }, l.sub));
a.appendChild(text);
linksWrap.appendChild(a);
});
linksCard.appendChild(linksWrap);
sidebar.appendChild(linksCard);