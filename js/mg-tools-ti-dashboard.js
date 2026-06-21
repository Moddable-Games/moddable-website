/* =========================================================================
   TI4 Dashboard — Entry point (orchestrates modular files)
   ========================================================================= */
(function () {
'use strict';
const { url } = MG;
const S = window.TiDash;

function render() {
  if (!S.dashRoot) return;
  S.dashRoot.innerHTML = '';
  if (!S.session) window.TiDash_renderSetup(); else window.TiDash_renderDashboard();
}

function open() {
  S.dashRoot = document.getElementById('dashboard-root');
  if (!S.dashRoot) return;
  S.setup.enabledExpansions = { base: true };
  Promise.all([
    fetch(url('/data/ti4.json')).then(function(r) { return r.json(); }),
    fetch(url('/data/ti4-objectives.json')).then(function(r) { return r.json(); })
  ]).then(function(results) {
    S.ti4Data = results[0];
    S.objData = results[1];
    if (S.ti4Data.expansions) {
      S.ti4Data.expansions.forEach(function(e) { S.setup.enabledExpansions[e.key] = e.default !== false; });
    }
    S.syncSetupPlayers();
    render();
  });
}

window.TiDash_render = render;
window.MG_Dashboard = { open: open };
})();
