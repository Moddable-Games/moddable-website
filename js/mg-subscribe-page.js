(function() {
const { T, el, btn, navbar, footer } = MG;
document.getElementById('nav-root').appendChild(navbar('About'));
document.getElementById('footer-root').appendChild(footer());

const formWrap = document.getElementById('sub-form');

const emailRow = el('div', { class: 'sub-form__email-row' });
const emailInput = document.createElement('input');
emailInput.type = 'email';
emailInput.className = 'sub-form__email';
emailInput.placeholder = 'your@email.com';
emailRow.appendChild(emailInput);
formWrap.appendChild(emailRow);

const checks = el('div', { class: 'sub-form__checks' });
const options = ['Game launches', 'Playtest invites', 'Community news', 'Mod releases'];
options.forEach(label => {
  const lbl = document.createElement('label');
  lbl.className = 'sub-form__check';
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.checked = true;
  lbl.appendChild(cb);
  lbl.appendChild(document.createTextNode(label));
  checks.appendChild(lbl);
});
formWrap.appendChild(checks);

const submitBtn = btn('Subscribe', 'green', () => {
  const email = emailInput.value.trim();
  if (!email || !email.includes('@')) {
    emailInput.focus();
    return;
  }
  formWrap.style.display = 'none';
  document.getElementById('sub-success').classList.add('sub-success--show');
});
submitBtn.classList.add('sub-form__submit');
formWrap.appendChild(submitBtn);
})();
