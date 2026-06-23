import { el, data, btn, linkBtn, navbar, footer, sectionHero } from './mg.js';
document.getElementById('nav-root').appendChild(navbar('Developers'));
document.getElementById('footer-root').appendChild(footer());

// Sub-page hero
var hero = document.getElementById('dev-hero');
hero.appendChild(sectionHero({
  section: 'developers',
  tier: 2,
  hexColor: 'purple',
  eyebrow: 'TOOLS API',
  title: 'Connect and call',
  lede: 'One endpoint, 39 tools. MCP protocol for AI agents, REST for everything else.'
}));

// Copy buttons
document.querySelectorAll('.dev-connect__copy').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var code = btn.parentElement.querySelector('code');
    navigator.clipboard.writeText(code.textContent.trim());
    btn.textContent = 'Copied';
    setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
  });
});

// Load tools data
data.get('mcp-tools').then(function(namespaces) {
  var grid = document.getElementById('tools-grid');
  namespaces.forEach(function(ns) {
    ns.tools.forEach(function(tool) {
      var accentClass = ns.accent === 'green' ? ' green' : ns.accent === 'red' ? ' red' : '';
      var card = el('div', { class: 'dev-tool-card' },
        el('div', { class: 'dev-tool-card__name' + accentClass }, tool.name),
        el('div', { class: 'dev-tool-card__desc' }, tool.description),
        el('div', { class: 'dev-tool-card__example' }, '"' + tool.example + '"')
      );
      grid.appendChild(card);
    });
  });
});

// CTA below tools grid
var toolsCta = document.getElementById('tools-cta');
toolsCta.appendChild(linkBtn('Full Docs', 'https://tools.moddable.games/', 'blue'));
toolsCta.appendChild(linkBtn('OpenAPI Spec', 'https://tools.moddable.games/openapi.json', 'outline-dark'));