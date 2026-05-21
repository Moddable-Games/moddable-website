(function() {
  var navRoot = document.getElementById('nav-root');
  var heroRoot = document.getElementById('page-hero');
  if (!navRoot || !heroRoot) return;

  var el = MG.el;
  var url = MG.url;

  navRoot.appendChild(MG.navbar('About'));
  document.getElementById('footer-root').appendChild(MG.footer());
  heroRoot.appendChild(MG.pageHero({
    eyebrow: 'ABOUT MODDABLE',
    title: 'Creating games you already own.',
    lede: 'A workshop of designers, modders and rule-tinkerers reshaping the boards already on your shelf.',
    withHorizon: true
  }));

  var links = [
    { label:'Discord', sub:'2,400+ members', color:'#5865f2', href:url('/community/') },
    { label:'Team',    sub:'Six humans, no AI', color:'#0c4f8d', href:url('/team/') },
    { label:'Roadmap', sub:'18-month public plan', color:'#3a9928', href:url('/about/roadmap/') },
    { label:'Mods',    sub:'12 open-source mods', color:'#d11a1a', href:url('/mods/') }
  ];
  var lg = document.getElementById('links-grid');
  if (!lg) return;
  links.forEach(function(l) {
    var a = el('a', {href:l.href, class:'about-link'});
    var icon = el('div', {class:'about-link__icon'});
    icon.style.background = l.color;
    a.appendChild(icon);
    var t = el('div');
    t.appendChild(el('div', {class:'about-link__label'}, l.label));
    t.appendChild(el('div', {class:'about-link__sub'}, l.sub));
    a.appendChild(t);
    lg.appendChild(a);
  });
})();
