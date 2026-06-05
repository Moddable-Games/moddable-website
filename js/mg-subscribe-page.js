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
  hexColor: 'green',
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

/* ── SIDEBAR ── */
var sidebar = document.getElementById('sub-sidebar');

var whatCard = el('div', { class: 'sub-sidebar__card' });
whatCard.appendChild(el('div', { class: 'sub-sidebar__card-title' }, "What you'll get"));
var items = [
  'One email per milestone. We only send when something ships.',
  'Early access to closed playtests before Discord announcements.',
  'First to know when a crowdfund goes live, with early-bird links.',
  'Unsubscribe any time. One click, no questions.',
];
items.forEach(function(text) {
  var item = el('div', { class: 'sub-sidebar__item' });
  item.appendChild(el('span', { class: 'sub-sidebar__item-dot' }));
  item.appendChild(el('span', { class: 'sub-sidebar__item-text' }, text));
  whatCard.appendChild(item);
});
sidebar.appendChild(whatCard);

var linksCard = el('div', { class: 'sub-sidebar__card' });
linksCard.appendChild(el('div', { class: 'sub-sidebar__card-title' }, 'Elsewhere'));
var linksWrap = el('div', { style: 'display:flex;flex-direction:column;gap:8px' });
var links = [
  { label: 'Discord', href: url('/community/') },
  { label: 'News', href: url('/news/') },
  { label: 'About', href: url('/about/') },
];
links.forEach(function(l) {
  var a = el('a', { href: l.href, style: 'font-family:var(--mg-font-body);font-size:14px;font-weight:600;color:var(--mg-green);text-decoration:none' }, l.label + ' →');
  linksWrap.appendChild(a);
});
linksCard.appendChild(linksWrap);
sidebar.appendChild(linksCard);
})();
