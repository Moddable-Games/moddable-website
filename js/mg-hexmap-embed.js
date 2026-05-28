(function() {
var HEX_BASE = location.hostname === 'localhost'
  ? '/MODDABLE/moddable-hexmaps/generate/'
  : 'https://hex.moddable.games/generate/';

var GAME_CONFIG = {
  nukes: {
    sizes: [2,3,4,5,6], defaultSize: 4,
    players: [2,3,4,5,6], defaultPlayers: 4,
    styles: ['artistic', 'classic', 'kenney', 'realistic'], defaultStyle: 'artistic'
  },
  talisman: {
    sizes: [4,5], defaultSize: 4,
    players: [2,3,4,5,6], defaultPlayers: 4,
    styles: ['artistic', 'classic'], defaultStyle: 'artistic'
  },
  colony: {
    sizes: [3,4,5], defaultSize: 4,
    players: [2,3,4], defaultPlayers: 3,
    styles: ['classic', 'kenney', 'realistic'], defaultStyle: 'classic'
  },
  twilight: {
    layouts: [
      { value: '3p', label: '3 Players' },
      { value: '4p', label: '4 Players' },
      { value: '5p', label: '5 Players' },
      { value: '6p', label: '6 Players (Standard)' },
      { value: '7p', label: '7 Players (PoK)' },
      { value: '8p', label: '8 Players (PoK)' },
      { value: 'hyper8', label: '8 Players (Hyper Imperium)' }
    ],
    defaultLayout: '6p',
    styles: ['artistic', 'classic'], defaultStyle: 'artistic'
  }
};

function initHexmapEmbed(game) {
  var config = GAME_CONFIG[game];
  if (!config) return;

  var params = new URLSearchParams(location.search);
  var currentSeed = parseInt(params.get('seed')) || Math.floor(Math.random() * 9999);
  var currentSize = parseInt(params.get('size')) || (config.defaultSize || 3);
  var currentPlayers = parseInt(params.get('players')) || (config.defaultPlayers || 4);
  var currentLayout = params.get('layout') || (config.defaultLayout || null);
  var currentStyle = params.get('style') || config.defaultStyle;
  var useLayouts = !!config.layouts;

  var controlsEl = document.getElementById('hexmap-controls');
  var frameWrap = document.getElementById('hexmap-frame-wrap');
  var actionsEl = document.getElementById('hexmap-actions');
  if (!controlsEl || !frameWrap) return;

  var iframe = null;

  function buildUrl() {
    var url = HEX_BASE + '?game=' + game + '&seed=' + currentSeed
      + '&style=' + currentStyle + '&boardonly=1&bg=ffffff';
    if (useLayouts) {
      url += '&layout=' + currentLayout;
    } else {
      url += '&size=' + currentSize + '&players=' + currentPlayers;
    }
    url += '&mode=edit';
    return url;
  }

  function regenerate() {
    if (iframe && iframe.contentWindow) {
      var msg = { type: 'hexmap:regenerate', seed: String(currentSeed), style: currentStyle };
      if (useLayouts) {
        msg.layout = currentLayout;
      } else {
        msg.players = currentPlayers;
        msg.size = currentSize;
      }
      iframe.contentWindow.postMessage(msg, '*');
    } else {
      renderFrame();
    }
    var seedSpan = controlsEl.querySelector('.hexmap-embed__seed');
    if (seedSpan) seedSpan.textContent = 'seed: ' + String(currentSeed).padStart(4, '0');
  }

  function renderControls() {
    controlsEl.innerHTML = '';
    var { el } = MG;

    if (useLayouts) {
      var layoutGroup = el('div', { class: 'hexmap-embed__control-group' });
      layoutGroup.appendChild(el('span', { class: 'hexmap-embed__label' }, 'Layout:'));
      var layoutSel = document.createElement('select');
      layoutSel.className = 'hexmap-embed__select';
      config.layouts.forEach(function(l) {
        var opt = document.createElement('option');
        opt.value = l.value; opt.textContent = l.label;
        if (l.value === currentLayout) opt.selected = true;
        layoutSel.appendChild(opt);
      });
      layoutSel.addEventListener('change', function() {
        currentLayout = layoutSel.value;
        renderFrame();
      });
      layoutGroup.appendChild(layoutSel);
      controlsEl.appendChild(layoutGroup);
    } else {
      if (config.sizes && config.sizes.length > 1) {
        var sizeGroup = el('div', { class: 'hexmap-embed__control-group' });
        sizeGroup.appendChild(el('span', { class: 'hexmap-embed__label' }, 'Rings:'));
        var sizeSel = document.createElement('select');
        sizeSel.className = 'hexmap-embed__select';
        config.sizes.forEach(function(s) {
          var opt = document.createElement('option');
          opt.value = s; opt.textContent = s;
          if (s === currentSize) opt.selected = true;
          sizeSel.appendChild(opt);
        });
        sizeSel.addEventListener('change', function() {
          currentSize = parseInt(sizeSel.value);
          renderFrame();
        });
        sizeGroup.appendChild(sizeSel);
        controlsEl.appendChild(sizeGroup);
      }

      if (config.players) {
        var playerGroup = el('div', { class: 'hexmap-embed__control-group' });
        playerGroup.appendChild(el('span', { class: 'hexmap-embed__label' }, 'Players:'));
        var playerSel = document.createElement('select');
        playerSel.className = 'hexmap-embed__select';
        config.players.forEach(function(p) {
          var opt = document.createElement('option');
          opt.value = p; opt.textContent = p;
          if (p === currentPlayers) opt.selected = true;
          playerSel.appendChild(opt);
        });
        playerSel.addEventListener('change', function() {
          currentPlayers = parseInt(playerSel.value);
          renderFrame();
        });
        playerGroup.appendChild(playerSel);
        controlsEl.appendChild(playerGroup);
      }
    }

    if (config.styles && config.styles.length > 1) {
      var styleGroup = el('div', { class: 'hexmap-embed__control-group' });
      styleGroup.appendChild(el('span', { class: 'hexmap-embed__label' }, 'Style:'));
      var styleSel = document.createElement('select');
      styleSel.className = 'hexmap-embed__select';
      config.styles.forEach(function(s) {
        var opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s.charAt(0).toUpperCase() + s.slice(1);
        if (s === currentStyle) opt.selected = true;
        styleSel.appendChild(opt);
      });
      styleSel.addEventListener('change', function() {
        currentStyle = styleSel.value;
        renderFrame();
      });
      styleGroup.appendChild(styleSel);
      controlsEl.appendChild(styleGroup);
    }

    var seedEl = el('span', { class: 'hexmap-embed__seed' }, 'seed: ' + String(currentSeed).padStart(4, '0'));
    controlsEl.appendChild(seedEl);
  }

  function renderFrame() {
    frameWrap.innerHTML = '';
    iframe = document.createElement('iframe');
    iframe.src = buildUrl();
    iframe.className = 'hexmap-embed__iframe';
    iframe.setAttribute('title', 'Hex map generator — ' + game);
    iframe.setAttribute('scrolling', 'no');
    frameWrap.appendChild(iframe);
    var seedSpan = controlsEl.querySelector('.hexmap-embed__seed');
    if (seedSpan) seedSpan.textContent = 'seed: ' + String(currentSeed).padStart(4, '0');
  }

  function renderActions() {
    if (!actionsEl) return;
    actionsEl.innerHTML = '';
    var { btn } = MG;
    actionsEl.appendChild(btn('New map', 'dark', function() {
      currentSeed = Math.floor(Math.random() * 9999);
      regenerate();
    }));
    actionsEl.appendChild(btn('Copy seed link', 'outline-dark', function() {
      var shareUrl = 'https://hex.moddable.games/generate/?game=' + game
        + '&seed=' + currentSeed + '&style=' + currentStyle;
      if (useLayouts) {
        shareUrl += '&layout=' + currentLayout;
      } else {
        shareUrl += '&size=' + currentSize + '&players=' + currentPlayers;
      }
      navigator.clipboard.writeText(shareUrl);
    }));
    var fullLink = MG.linkBtn('Open in Hexmaps',
      HEX_BASE + '?game=' + game + '&seed=' + currentSeed + '&style=' + currentStyle,
      'outline-dark');
    fullLink.setAttribute('target', '_blank');
    fullLink.setAttribute('rel', 'noopener');
    actionsEl.appendChild(fullLink);
  }

  renderControls();
  renderFrame();
  renderActions();
}

function renderHexEngineBtns() {
  var btnsEl = document.getElementById('hex-engine-btns');
  if (!btnsEl) return;
  var engineLink = MG.linkBtn('Moddable Hexmaps', '/engines/moddable-hexmaps/', 'primary');
  var srcLink = MG.linkBtn('View source on GitHub', 'https://github.com/Moddable-Games/moddable-hexmaps', 'dark');
  srcLink.setAttribute('target', '_blank');
  srcLink.setAttribute('rel', 'noopener');
  btnsEl.appendChild(engineLink);
  btnsEl.appendChild(srcLink);
}

window.MG_HexEmbed = { init: initHexmapEmbed, renderBtns: renderHexEngineBtns };
})();
