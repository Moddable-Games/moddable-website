(function() {
var el = MG.el;
var url = MG.url;
var linkBtn = MG.linkBtn;

document.getElementById('nav-root').appendChild(MG.navbar('About'));
document.getElementById('footer-root').appendChild(MG.footer());
document.getElementById('page-hero').appendChild(MG.sectionHero({
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

var sidebar = document.getElementById('roadmap-sidebar');

var visionCard = el('div', { class: 'roadmap-sidebar__card' });
visionCard.appendChild(el('div', { class: 'roadmap-sidebar__card-title' }, 'The bigger picture'));
var visionItems = [
  { num: '01 · ENGINE', title: 'Host any hex-based game online.', body: 'A universal runtime for hex-grid games with drag pieces, resolved rules, and live spectating.' },
  { num: '02 · MARKETPLACE', title: 'Designers sell mods and expansions.', body: 'Upload your creation, set a price or go free, and reach thousands of players instantly.' },
  { num: '03 · COMMUNITY', title: 'Players find groups and run tournaments.', body: 'Matchmaking, leaderboards, and event scheduling built into the platform.' },
];
visionItems.forEach(function(v) {
  var card = el('div', { class: 'vision-card' });
  card.appendChild(el('div', { class: 'vision-number' }, v.num));
  card.appendChild(el('div', { class: 'vision-title' }, v.title));
  card.appendChild(el('div', { class: 'vision-body' }, v.body));
  visionCard.appendChild(card);
});
sidebar.appendChild(visionCard);

var linksCard = el('div', { class: 'roadmap-sidebar__card' });
linksCard.appendChild(el('div', { class: 'roadmap-sidebar__card-title' }, 'Related'));
var linksWrap = el('div', { style: 'display:flex;flex-direction:column;gap:8px' });
var relLinks = [
  { label: 'About', href: url('/about/') },
  { label: 'Team', href: url('/team/') },
  { label: 'Community', href: url('/community/') },
];
relLinks.forEach(function(l) {
  var a = el('a', { href: l.href, style: 'font-family:var(--mg-font-body);font-size:14px;font-weight:600;color:var(--mg-blue);text-decoration:none' }, l.label + ' →');
  linksWrap.appendChild(a);
});
linksCard.appendChild(linksWrap);
sidebar.appendChild(linksCard);
})();
