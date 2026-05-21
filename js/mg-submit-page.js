(function() {
const { T, el, btn, linkBtn, navbar, footer } = MG;
document.getElementById('nav-root').appendChild(navbar('Mods'));
document.getElementById('footer-root').appendChild(footer());

const formData = { title:'', baseGame:'', category:'', stats:'', desc:'', rulesPdf:null, pnp:null, version:'', designer:'' };
let currentStep = 1;

// Field builder
function field(id, label, hint, required, childFn) {
  const wrap = el('div',{class:'field-wrap'});
  const lbl = el('label',{for:id,class:'field-label'});
  lbl.innerHTML = label + (required ? '<span class="field-label__required">*</span>' : '');
  wrap.appendChild(lbl);
  if (hint) wrap.appendChild(el('span',{class:'field-hint'},hint));
  wrap.appendChild(childFn(id));
  return wrap;
}
function textInput(id, placeholder, key) {
  return () => {
    const i = el('input',{type:'text',id,class:'field-input',placeholder});
    i.value = formData[key] || '';
    i.addEventListener('input',()=>{ formData[key]=i.value; });
    return i;
  };
}
function textArea(id, placeholder, key) {
  return () => {
    const t = el('textarea',{id,class:'field-input',placeholder});
    t.value = formData[key] || '';
    t.addEventListener('input',()=>{ formData[key]=t.value; });
    return t;
  };
}

// Build step 1
document.getElementById('field-title').appendChild(field('mod-title','Mod title',"What's it called?",true,textInput('mod-title','e.g. Talisman: Hexed','title')));
document.getElementById('field-game').appendChild(field('base-game','Base game','Which published game does your mod use?',true,textInput('base-game','e.g. Talisman 4e (revised)','baseGame')));

// Category picker
const catWrap = el('div',{class:'field-wrap'});
const catLbl = el('label',{class:'field-label'});
catLbl.innerHTML = 'Mod category <span class="field-label__required">*</span>';
catWrap.appendChild(catLbl);
catWrap.appendChild(el('span',{class:'field-hint'},'Pick the one that fits best.'));
const catGrid = el('div',{class:'cat-grid'});
const CATS = [{v:'Reskin',c:T.blue,desc:'Same rules, new theme or board layout.'},{v:'Rebalance',c:T.green,desc:'Same theme, tuned rules — pacing, fairness, length.'},{v:'Total conversion',c:T.red,desc:'New rules, new theme, components only.'}];
CATS.forEach(o => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'cat-btn';
  b.innerHTML = `<span class="cat-btn__title">${o.v}</span><span class="cat-btn__desc">${o.desc}</span>`;
  b.addEventListener('click',()=>{
    formData.category = o.v;
    catGrid.querySelectorAll('button').forEach(x=>{x.style.background='';x.style.color='';x.style.borderColor='';x.querySelector('.cat-btn__desc').style.color='';});
    b.style.background = o.c;
    b.style.color = '#fff';
    b.style.borderColor = o.c;
    b.querySelector('.cat-btn__desc').style.color = 'rgba(255,255,255,0.82)';
  });
  catGrid.appendChild(b);
});
catWrap.appendChild(catGrid);
document.getElementById('field-cat').appendChild(catWrap);

document.getElementById('field-stats').appendChild(field('mod-stats','Player count & time','Mono format, e.g. 3–5 players · 45 min · 12+',false,textInput('mod-stats','3–5 players · 45 min · 12+','stats')));
document.getElementById('field-desc').appendChild(field('mod-desc','Pitch it in two sentences','What does your mod do and why should someone play it?',true,textArea('mod-desc','Replaces the standard Monopoly board with a fully functional Euro-game economy. No bankruptcy, just resource management and victory points.','desc')));

const n1 = document.getElementById('next-1-btn');
n1.appendChild(btn('Next: the rules →','primary',()=>goStep(2)));

// Step 2
function fileField(id, label, hint) {
  return field(id, label, hint, false, () => {
    const inp = el('input',{type:'file',id,accept:'.pdf',class:'field-file'});
    return inp;
  });
}
document.getElementById('field-rulespdf').appendChild(fileField('rules-pdf','Rules PDF','The main rulebook. PDF only, under 20 MB.'));
document.getElementById('field-pnp').appendChild(fileField('pnp-pdf','Print-and-play pack','Any printable components — tiles, cards, tokens.'));
document.getElementById('field-version').appendChild(field('version','Version','Semantic versioning preferred.',false,textInput('version','v1.0.0','version')));
document.getElementById('field-designer').appendChild(field('designer','Your handle','How should we credit you?',false,textInput('designer','@yourhandle','designer')));

const s2n = document.getElementById('step2-nav');
s2n.appendChild(btn('← Back','outline-dark',()=>goStep(1)));
s2n.appendChild(btn('Next: submit →','primary',()=>goStep(3)));

// Step 3 preview
function buildPreview() {
  const p = document.getElementById('submit-preview');
  p.innerHTML = '';
  p.appendChild(el('div',{class:'submit-preview__eyebrow'},'YOUR SUBMISSION'));
  const rows = [['Title',formData.title||'—'],['Base game',formData.baseGame||'—'],['Category',formData.category||'—'],['Stats',formData.stats||'—'],['Designer',formData.designer||'—'],['Version',formData.version||'—']];
  rows.forEach(([k,v])=>{
    const row = el('div',{class:'submit-preview__row'});
    row.appendChild(el('span',{class:'submit-preview__key'},k));
    row.appendChild(el('span',{class:'submit-preview__val'},v));
    p.appendChild(row);
  });
  if (formData.desc) {
    p.appendChild(el('div',{class:'submit-preview__desc'},formData.desc));
  }
}

const s3n = document.getElementById('step3-nav');
s3n.appendChild(btn('← Back','outline-dark',()=>goStep(2)));
const submitBtn = btn('Submit mod','green',()=>{
  if (!document.getElementById('agree-check').checked) { alert('Please confirm the agreement first.'); return; }
  goStep('success');
});
s3n.appendChild(submitBtn);

// Success
const sbw = document.getElementById('success-btns');
sbw.appendChild(linkBtn('Back to the library','/mods/','dark'));
sbw.appendChild(linkBtn('Join Discord','/community/','outline-dark'));

function goStep(n) {
  currentStep = n;
  ['step-1','step-2','step-3','step-success'].forEach(id => {
    const el2 = document.getElementById(id);
    if (el2) el2.hidden = true;
  });
  const tabs = document.querySelectorAll('.step-tab');
  tabs.forEach(t => { t.classList.remove('step-tab--active'); t.classList.add('step-tab--inactive'); });
  document.querySelectorAll('.step-tab__num').forEach(s => s.classList.remove('step-tab__num--active'));

  if (n === 1) { document.getElementById('step-1').hidden=false; tabs[0].classList.add('step-tab--active');tabs[0].classList.remove('step-tab--inactive'); document.getElementById('s1-num').classList.add('step-tab__num--active'); }
  if (n === 2) { document.getElementById('step-2').hidden=false; tabs[1].classList.add('step-tab--active');tabs[1].classList.remove('step-tab--inactive'); document.getElementById('s2-num').classList.add('step-tab__num--active'); }
  if (n === 3) { buildPreview(); document.getElementById('step-3').hidden=false; tabs[2].classList.add('step-tab--active');tabs[2].classList.remove('step-tab--inactive'); document.getElementById('s3-num').classList.add('step-tab__num--active'); }
  if (n === 'success') { document.getElementById('step-success').hidden=false; }
}
})();
