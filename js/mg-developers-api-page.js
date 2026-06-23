import { el, data, navbar, footer, sectionHero } from './mg.js';

document.getElementById('nav-root').appendChild(navbar('Developers'));
document.getElementById('footer-root').appendChild(footer());

document.getElementById('dev-hero').appendChild(sectionHero({
  section: 'developers',
  tier: 2,
  hexColor: 'purple',
  eyebrow: 'TOOLS API',
  title: 'Connect and call',
  lede: 'One endpoint, 39 tools. MCP protocol for AI agents, REST for everything else.'
}));

document.querySelectorAll('.dev-connect__copy').forEach(function(b) {
  b.addEventListener('click', function() {
    var code = b.parentElement.querySelector('code');
    navigator.clipboard.writeText(code.textContent.trim());
    b.textContent = 'Copied';
    setTimeout(function() { b.textContent = 'Copy'; }, 2000);
  });
});

const API_BASE = 'https://tools.moddable.games';
const NAMESPACE_META = {
  'moddable-chess': { label: 'Chess', accent: '#3b82f6' },
  'moddable-hexmaps': { label: 'Hexmaps', accent: '#22c55e' },
  'moddable-rules': { label: 'Rules', accent: '#f59e0b' },
  'game-tools': { label: 'Game Tools', accent: '#ef4444' },
  'moddable-tools': { label: 'Utilities', accent: '#8b5cf6' }
};

let allTools = [];
let selectedTool = null;

async function loadTools() {
  const sidebar = document.getElementById('api-sidebar');
  let usingFallback = false;
  try {
    const res = await fetch(API_BASE + '/api/tools');
    const json = await res.json();
    allTools = json.tools;
  } catch (e) {
    usingFallback = true;
    const fallback = await data.get('mcp-tools');
    allTools = fallback.flatMap(ns => ns.tools.map(t => ({
      name: t.name, description: t.description, inputSchema: { type: 'object', properties: {} }
    })));
  }
  if (usingFallback) {
    const notice = el('div', { class: 'api-explorer__notice' },
      'Schema unavailable locally. Deploy to moddable.games to test with live API schemas.');
    document.querySelector('.api-explorer__chrome').prepend(notice);
  }
  const randomTool = allTools[Math.floor(Math.random() * allTools.length)];
  renderSidebar(sidebar, randomTool);
  selectTool(randomTool);
}

function getNamespace(toolName) {
  if (toolName.startsWith('chess_')) return 'moddable-chess';
  if (toolName.startsWith('hex_')) return 'moddable-hexmaps';
  if (toolName.startsWith('rules_')) return 'moddable-rules';
  if (/^(ti4|mancala|morris|ur|pachisi|nukes|colony)_/.test(toolName)) return 'game-tools';
  return 'moddable-tools';
}

function renderSidebar(sidebar, initialTool) {
  sidebar.innerHTML = '';
  const grouped = {};
  for (const tool of allTools) {
    const ns = getNamespace(tool.name);
    if (!grouped[ns]) grouped[ns] = [];
    grouped[ns].push(tool);
  }
  const activeNs = initialTool ? getNamespace(initialTool.name) : null;

  for (const [ns, meta] of Object.entries(NAMESPACE_META)) {
    const tools = grouped[ns];
    if (!tools || !tools.length) continue;
    const isActiveGroup = ns === activeNs;

    const group = el('div', { class: 'api-sidebar__group' });
    const header = el('button', { class: 'api-sidebar__ns' + (isActiveGroup ? '' : ' api-sidebar__ns--collapsed') });
    header.innerHTML = `<span class="api-sidebar__ns-dot" style="background:${meta.accent}"></span>${meta.label}<span class="api-sidebar__ns-count">${tools.length}</span>`;
    group.appendChild(header);

    const list = el('div', { class: 'api-sidebar__list' + (isActiveGroup ? '' : ' api-sidebar__list--collapsed') });
    for (const tool of tools) {
      const item = el('button', {
        class: 'api-sidebar__tool',
        'data-tool': tool.name
      });
      item.textContent = tool.name.replace(/^(chess|hex|rules|game|ti4|mancala|morris|ur|pachisi|nukes|colony|jam|coin|dice|faction|team)_/, '');
      item.addEventListener('click', () => selectTool(tool));
      list.appendChild(item);
    }
    group.appendChild(list);

    header.addEventListener('click', () => {
      const wasCollapsed = list.classList.contains('api-sidebar__list--collapsed');
      sidebar.querySelectorAll('.api-sidebar__list').forEach(l => l.classList.add('api-sidebar__list--collapsed'));
      sidebar.querySelectorAll('.api-sidebar__ns').forEach(h => h.classList.add('api-sidebar__ns--collapsed'));
      if (wasCollapsed) {
        list.classList.remove('api-sidebar__list--collapsed');
        header.classList.remove('api-sidebar__ns--collapsed');
      }
    });

    sidebar.appendChild(group);
  }
}

function selectTool(tool) {
  selectedTool = tool;
  document.querySelectorAll('.api-sidebar__tool--active').forEach(e => e.classList.remove('api-sidebar__tool--active'));
  const active = document.querySelector(`[data-tool="${tool.name}"]`);
  if (active) active.classList.add('api-sidebar__tool--active');
  renderMain(tool);
}

function renderMain(tool) {
  const main = document.getElementById('api-main');
  const argsPanel = document.getElementById('api-args');
  main.innerHTML = '';
  argsPanel.innerHTML = '';

  const ns = getNamespace(tool.name);
  const meta = NAMESPACE_META[ns] || NAMESPACE_META['moddable-tools'];

  const header = el('div', { class: 'api-detail__header' });
  const badge = el('span', { class: 'api-detail__badge' });
  badge.style.background = meta.accent;
  badge.textContent = meta.label;
  header.appendChild(badge);
  header.appendChild(el('h2', { class: 'api-detail__name' }, tool.name));
  header.appendChild(el('p', { class: 'api-detail__desc' }, tool.description));
  main.appendChild(header);

  const actions = el('div', { class: 'api-detail__actions' });
  const runBtn = el('button', { class: 'api-detail__run' }, 'Run');
  runBtn.addEventListener('click', () => runTool(tool));
  actions.appendChild(runBtn);
  main.appendChild(actions);

  const schema = tool.inputSchema || { type: 'object', properties: {} };
  const props = schema.properties || {};
  const required = schema.required || [];
  const propKeys = Object.keys(props);

  if (propKeys.length > 0) {
    argsPanel.appendChild(el('div', { class: 'api-explorer__args-title' }, 'ARGUMENTS'));
    const form = el('div', { class: 'api-detail__form', id: 'api-form' });
    for (const key of propKeys) {
      const prop = props[key];
      const row = el('div', { class: 'api-detail__field' });

      const labelRow = el('div', { class: 'api-detail__field-top' });
      const label = el('label', { class: 'api-detail__field-label' });
      label.textContent = key;
      if (required.includes(key)) {
        label.appendChild(el('span', { class: 'api-detail__required' }, ' required'));
      }
      labelRow.appendChild(label);
      const typeBadge = el('span', { class: 'api-detail__type-badge' }, prop.type || 'string');
      labelRow.appendChild(typeBadge);
      row.appendChild(labelRow);

      if (prop.description) {
        row.appendChild(el('div', { class: 'api-detail__field-desc' }, prop.description));
      }

      if (prop.type === 'boolean') {
        const cb = el('input', { type: 'checkbox', class: 'api-detail__checkbox', 'data-key': key });
        cb.addEventListener('change', updateCurl);
        row.appendChild(cb);
      } else if (prop.type === 'number' || prop.type === 'integer') {
        const input = el('input', {
          type: 'number', class: 'api-detail__input', 'data-key': key,
          placeholder: prop.default !== undefined ? 'Default: ' + prop.default : key
        });
        input.addEventListener('input', updateCurl);
        row.appendChild(input);
      } else if (prop.enum) {
        const select = el('select', { class: 'api-detail__select', 'data-key': key });
        select.appendChild(el('option', { value: '' }, '— select —'));
        for (const v of prop.enum) {
          select.appendChild(el('option', { value: v }, v));
        }
        select.addEventListener('change', updateCurl);
        row.appendChild(select);
      } else if (prop.type === 'array') {
        const input = el('input', {
          type: 'text', class: 'api-detail__input', 'data-key': key, 'data-type': 'array',
          placeholder: 'Comma-separated values'
        });
        input.addEventListener('input', updateCurl);
        row.appendChild(input);
      } else {
        const input = el('input', {
          type: 'text', class: 'api-detail__input', 'data-key': key,
          placeholder: prop.default !== undefined ? 'Default: ' + prop.default : key
        });
        input.addEventListener('input', updateCurl);
        row.appendChild(input);
      }

      form.appendChild(row);
    }
    argsPanel.appendChild(form);
  } else {
    argsPanel.appendChild(el('div', { class: 'api-explorer__args-title' }, 'ARGUMENTS'));
    argsPanel.appendChild(el('div', { class: 'api-detail__no-args' }, 'No arguments.'));
  }

  const curlSection = el('div', { class: 'api-detail__section' });
  curlSection.appendChild(el('div', { class: 'api-detail__section-label' }, 'CURL'));
  const curlBlock = el('pre', { class: 'api-detail__code', id: 'api-curl' });
  curlBlock.textContent = buildCurl(tool, {});
  curlSection.appendChild(curlBlock);
  main.appendChild(curlSection);

  const responseSection = el('div', { class: 'api-detail__section', id: 'api-response-section' });
  responseSection.style.display = 'none';
  responseSection.appendChild(el('div', { class: 'api-detail__section-label' }, 'RESPONSE'));
  responseSection.appendChild(el('pre', { class: 'api-detail__code api-detail__code--response', id: 'api-response' }));
  main.appendChild(responseSection);
}

function getFormArgs() {
  const args = {};
  const form = document.getElementById('api-form');
  if (!form) return args;
  form.querySelectorAll('[data-key]').forEach(input => {
    const key = input.dataset.key;
    if (input.type === 'checkbox') {
      if (input.checked) args[key] = true;
    } else if (input.type === 'number') {
      if (input.value !== '') args[key] = Number(input.value);
    } else if (input.dataset.type === 'array') {
      if (input.value.trim()) args[key] = input.value.split(',').map(s => s.trim()).filter(Boolean);
    } else {
      if (input.value.trim()) args[key] = input.value.trim();
    }
  });
  return args;
}

function buildCurl(tool, args) {
  const body = JSON.stringify({ tool: tool.name, args }, null, 2);
  return `curl -X POST ${API_BASE}/api/call \\\n  -H "Content-Type: application/json" \\\n  -d '${body}'`;
}

function updateCurl() {
  const curlEl = document.getElementById('api-curl');
  if (!curlEl || !selectedTool) return;
  curlEl.textContent = buildCurl(selectedTool, getFormArgs());
}

async function runTool(tool) {
  const args = getFormArgs();
  const responseSection = document.getElementById('api-response-section');
  const responseEl = document.getElementById('api-response');
  responseSection.style.display = '';
  responseEl.textContent = 'Running...';
  responseEl.className = 'api-detail__code api-detail__code--response';

  try {
    const res = await fetch(API_BASE + '/api/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: tool.name, args })
    });
    const json = await res.json();
    responseEl.textContent = JSON.stringify(json, null, 2);
    responseEl.classList.add(res.ok ? 'api-detail__code--success' : 'api-detail__code--error');
  } catch (e) {
    responseEl.textContent = 'Error: ' + e.message;
    responseEl.classList.add('api-detail__code--error');
  }
}

loadTools();
