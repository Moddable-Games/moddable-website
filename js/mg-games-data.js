/* =========================================================================
   Moddable.Games — Games Data (single source of truth)
   Extends window.MG (created by mg-core.js)
   ========================================================================= */

(function() {
  var T = window.MG.T;
  var url = window.MG.url;

  window.MG.GAMES = [
    { title:'Nukes', accent:T.red, status:'Open alpha · Live', desc:'Cold-war territory control on a hex map. Three superpowers, fifteen turns, one button that ends everything.', players:'2–3', time:'45+ min', href:url('/games/nukes/') },
    { title:'Mongo', accent:T.green, status:'Playtest · Q3 2026', desc:'Global conquest in the Flash Gordon universe — Risk × Catan in a public-domain setting.', players:'3–6', time:'90 min', href:url('/games/mongo/') },
    { title:'Endless Skies', accent:T.green, status:'In development', desc:'Cooperative survival in procedurally generated skies. Tile-laying meets resource management.', players:'1–4', time:'60 min', href:url('/games/endless-skies/') },
    { title:'Moddable Chess', accent:T.blue, status:'Open alpha · Live', desc:'2000+ chess variants, one engine. Regular, 4-Player, Hexagonal, and more — playable online.', players:'2–4', time:'10–60 min', href:url('/games/moddable-chess/') },
    { title:'Dungeon Chess', accent:T.green, status:'Pre-alpha · Q4 2026', desc:'Chess as an asymmetric skirmish and dungeon crawler. Four races, XP, spells, modular boards.', players:'2–6', time:'30–120 min', href:url('/games/dungeon-chess/') },
  ];
})();
