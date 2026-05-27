(function() {
var HEX_BASE = location.hostname === 'localhost'
  ? '/MODDABLE/moddable-hexmaps/generate/'
  : 'https://hex.moddable.games/generate/';

var GAME_CONFIG = {
  nukes: { sizes: [2,3,4,5,6], defaultSize: 4, players: [2,3,4,5,6], defaultPlayers: 4 },
  talisman: { sizes: [4,5], defaultSize: 4, players: [2,3,4,5,6], defaultPlayers: 4 },
  twilight: { sizes: [3], defaultSize: 3, players: [3,4,5,6,7,8], defaultPlayers: 6 }
};

function initHexmapEmbed(game) {
  var config = GAME_CONFIG[game];
  if (!config) return;

  var params = new URLSearchParams(location.search);
  var currentSeed = parseInt(params.get('seed')) || Math.floor(Math.random() * 9999);
  var currentSize = parseInt(params.get('size')) || config.defaultSize;
  var currentPlayers = parseInt(params.get('players')) || config.defaultPlayers;

  var controlsEl = document.getElementById('hexmap-controls');
  var frameWrap = document.getElementById('hexmap-frame-wrap');
  var actionsEl = document.getElementById('hexmap-actions');
  if (!controlsEl || !frameWrap) return;

  function buildUrl() {
    return HEX_BASE + '?game=' + game
      + '&seed=' + currentSeed
      + '&size=' + currentSize
      + '&players=' + currentPlayers
      + '&boardonly=1&bg=ffffff&mode=edit';
  }

  function renderControls() {
    controlsEl.innerHTML = '';
    var { el, btn } = MG;

    if (config.sizes.length > 1) {
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

    var seedEl = el('span', { class: 'hexmap-embed__seed' }, 'seed: ' + String(currentSeed).padStart(4, '0'));
    controlsEl.appendChild(seedEl);
  }

  function renderFrame() {
    frameWrap.innerHTML = '';
    var iframe = document.createElement('iframe');
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
      renderFrame();
    }));
    actionsEl.appendChild(btn('Copy seed link', 'outline-dark', function() {
      var shareUrl = 'https://hex.moddable.games/generate/?game=' + game
        + '&seed=' + currentSeed + '&size=' + currentSize + '&players=' + currentPlayers;
      navigator.clipboard.writeText(shareUrl);
    }));
    var fullLink = MG.linkBtn('Open in Hexmaps', HEX_BASE + '?game=' + game + '&seed=' + currentSeed, 'outline-dark');
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
