(function() {
var el = MG.el;
var btn = MG.btn;
var url = MG.url;
var T = MG.T;

document.getElementById('nav-root').appendChild(MG.navbar('About'));
document.getElementById('footer-root').appendChild(MG.footer());
document.getElementById('page-hero').appendChild(MG.sectionHero({
  section: 'subscribe',
  tier: 2,
  hexColor: 'blue',
  eyebrow: 'NEWSLETTER',
  title: 'Stay in the loop.',
  lede: 'Crowdfunding updates, playtest invites, and new game announcements. No spam.'
}));

/* ── FORM ── */
var formWrap = document.getElementById('sub-form');

var emailRow = el('div', { class: 'sub-form__email-row' });
var emailInput = document.createElement('input');
emailInput.type = 'email';
emailInput.className = 'sub-form__email';
emailInput.placeholder = 'your@email.com';
emailRow.appendChild(emailInput);
formWrap.appendChild(emailRow);

var checks = el('div', { class: 'sub-form__checks' });
var options = ['Game launches', 'Playtest invites', 'Community news', 'Mod releases'];
options.forEach(function(label) {
  var lbl = document.createElement('label');
  lbl.className = 'sub-form__check';
  var cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.checked = true;
  lbl.appendChild(cb);
  lbl.appendChild(document.createTextNode(label));
  checks.appendChild(lbl);
});
formWrap.appendChild(checks);

var submitBtn = btn('Subscribe', 'green', function() {
  var email = emailInput.value.trim();
  if (!email || email.indexOf('@') === -1) {
    emailInput.focus();
    return;
  }
  formWrap.style.display = 'none';
  document.getElementById('sub-success').classList.add('sub-success--show');
});
submitBtn.classList.add('sub-form__submit');
formWrap.appendChild(submitBtn);

/* ── BENEFITS (full-width section) ── */
var benefitsGrid = document.getElementById('benefits-grid');
var benefits = [
  { title: 'One per milestone', body: 'We only send when something actually ships. A game, a playtest, a crowdfund launch.', color: T.green },
  { title: 'Playtest priority', body: 'Subscribers get early access to closed playtests before Discord announcements.', color: T.blue },
  { title: 'Crowdfund alerts', body: 'First to know when a Kickstarter or Gamefound goes live. Early-bird pricing links.', color: T.red },
  { title: 'Unsubscribe any time', body: 'One click, no questions. We don\'t sell data or share lists.', color: T.ink },
];
benefits.forEach(function(b) {
  var card = el('div', { class: 'sub-benefit-card' });
  var dot = el('div', { class: 'sub-benefit-card__dot' });
  dot.style.background = b.color;
  card.appendChild(dot);
  card.appendChild(el('div', { class: 'sub-benefit-card__title' }, b.title));
  card.appendChild(el('div', { class: 'sub-benefit-card__body' }, b.body));
  benefitsGrid.appendChild(card);
});

/* ── SIDEBAR ── */
var sidebar = document.getElementById('sub-sidebar');

var linksCard = el('div', { class: 'sub-sidebar__card' });
linksCard.appendChild(el('div', { class: 'sub-sidebar__card-title' }, 'Elsewhere'));
var linksWrap = el('div', { class: 'sub-sidebar__links' });
var links = [
  { label: 'Discord', sub: 'Join Community', href: url('/community/'), color: T.red },
  { label: 'News', sub: 'Read Latest', href: url('/news/'), color: T.green },
  { label: 'About', sub: 'Our story', href: url('/about/'), color: T.blue },
];
links.forEach(function(l) {
  var a = el('a', { href: l.href, class: 'sub-sidebar__link' });
  var dot = el('span', { class: 'sub-sidebar__link-dot' });
  dot.style.background = l.color;
  a.appendChild(dot);
  var text = el('div');
  text.appendChild(el('div', { class: 'sub-sidebar__link-label' }, l.label));
  text.appendChild(el('div', { class: 'sub-sidebar__link-sub' }, l.sub));
  a.appendChild(text);
  linksWrap.appendChild(a);
});
linksCard.appendChild(linksWrap);
sidebar.appendChild(linksCard);
})();
