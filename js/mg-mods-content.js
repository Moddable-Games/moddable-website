/* =========================================================================
   Moddable.Games — Mod Page Content (single source of truth)
   Extends window.MG with MOD_PAGES lookup used by mg-mod-page.js
   ========================================================================= */

(function() {
  window.MG.MOD_PAGES = {

    'flooded-catan': {
      accent: 'green',
      heroTitle: 'Flooded Catan.',
      lede: 'A survival variant for Catan where the island sinks beneath you. Tiles flood every few rounds, destroying settlements and reshaping strategy. Win by 10 VP or be the last player standing.',
      buttons: [['Catan fan expansions', 'https://catan.fandom.com/wiki/Fan_Expansions', 'primary'], ['Catan subreddit', 'https://www.reddit.com/r/Catan/', 'outline-dark']],
      stats: [['Players','3–4'],['Time','75 min'],['Age','10+'],['Source','catan.fandom.com'],['License','CC-BY-SA']],
      sections: [
        { id:'1', title:'Flood timer', body:"Every 4 turns, the lowest-numbered coastal hex floods. Flip it face-down. Flooded hexes produce no resources. No new buildings can be placed on their edges or vertices. The island is shrinking and the clock is ticking." },
        { id:'2', title:'Rising waters', body:"After turn 16, two hexes flood per cycle instead of one. The pace of destruction accelerates, forcing players toward the centre of the island and creating desperate last-stand scenarios. Plan your expansion path carefully." },
        { id:'3', title:'Survival victory', body:"If only one player has settlements or cities on non-flooded hexes, they win immediately regardless of VP count. This alternate win condition rewards geographic strategy over pure economic play. You can also still win at 10 VP as normal." },
        { id:'4', title:'Seawalls', body:"New structure: costs 2 brick + 1 wood. Placed on a hex edge, a seawall delays flooding of the adjacent hex by one full cycle. Limited to 3 per player. Placement timing is critical. Once used, a seawall is consumed when the flood arrives." },
        { id:'5', title:'Refugees', body:"When a settlement is flooded, the owning player may relocate it to any legal empty intersection for 1 grain + 1 wood. Cities cannot be relocated and are lost permanently. This makes city upgrades a calculated risk in flood-prone areas." },
        { id:'6', title:'Flood order', body:"Number all coastal hexes at setup (the number tokens already provide this). Flood from lowest to highest. Desert hexes flood last. If two hexes share a number, the one with fewer adjacent buildings floods first." },
        { id:'7', title:'Trading under pressure', body:"All standard Catan trading rules apply. However, ports on flooded hexes are destroyed. Maritime trade ratios increase by 1 for each port lost (4:1 becomes 5:1, etc.). Scarcity drives desperation." },
        { id:'8', title:'Robber on flooded hexes', body:"The robber cannot be placed on a flooded hex. If the robber is already on a hex when it floods, the robber is removed from the board entirely until the next 7 is rolled. No safe harbours." }
      ],
      components: [
        { kind:'Required', list:['Catan base game (any edition)','All hex tiles, number tokens, and resource cards','Standard building pieces and roads'] },
        { kind:'Printable', list:['Flood tracker sheet','Seawall tokens (3 per player)','Turn counter strip'] },
        { kind:'House', list:['Blue tokens or coins to mark flooded hexes','Numbered list of coastal hexes for flood order','Timer or turn counter (app recommended)'] }
      ],
    },

    'the-diamond-mine': {
      accent: 'red',
      heroTitle: 'The Diamond <em>Mine</em>.',
      lede: 'A single-hex unofficial expansion for Catan: swap one pasture for the diamond mine. Diamonds substitute for ore in development card purchases. Complete rules below.',
      buttons: [['Catan fan expansions', 'https://catan.fandom.com/wiki/Fan_Expansions', 'primary'], ['Catan subreddit', 'https://www.reddit.com/r/Catan/', 'outline-dark']],
      stats: [['Players','3–4'],['Time','60 min'],['Age','10+'],['Source','meepleeater'],['License','Fan-made']],
      sections: [
        { id:'1', title:'Setup', body:"Replace one pasture hex with the diamond mine hex. Choose any number token you like for it. The diamond mine produces diamonds instead of wool when its number is rolled. All other setup is standard Catan." },
        { id:'2', title:'Diamond production', body:"When the diamond mine's number is rolled, adjacent settlements receive 1 diamond token. Cities receive 2 diamond tokens, exactly as with any other resource hex. On a 7, the robber rules apply as normal." },
        { id:'3', title:'Diamond usage', body:"Diamonds substitute for ore when buying development cards only (1 diamond = 1 ore). They cannot be used for any other purchase. Settlements, cities, and roads still require their standard resources." },
        { id:'4', title:'No trading', body:"Diamonds cannot be traded with other players or via port. They are personal resources only. This prevents the diamond mine from becoming an overpowered trade engine and keeps its benefit localised." },
        { id:'5', title:'Robber interaction', body:"If the robber is placed on the diamond mine, no diamonds are produced. When stealing, the robber takes 1 diamond if the target has any. If no diamonds, steal a random resource as normal. Diamonds count toward the 7-card hand limit." }
      ],
      components: [
        { kind:'Required', list:['Catan base game (any edition)','All standard hex tiles and number tokens','Resource cards and building pieces'] },
        { kind:'Printable', list:['Diamond mine hex tile','Diamond resource tokens (cut-out sheet)','Quick-reference rules card'] },
        { kind:'House', list:['Small gems or glass beads as diamond tokens','Number token for the mine hex (your choice)','Pencil and paper for diamond tracking (optional)'] }
      ],
    },

    'shattered-ascension': {
      accent: 'green',
      heroTitle: 'Shattered <em>Ascension</em>.',
      lede: "Cyrusa's decade-long TI3 remix. Rebalanced factions, overhauled agenda phase, 40+ new objectives, revised combat. The most thorough community variant in existence. Full rulebook on GitHub.",
      buttons: [['Full rulebook (GitHub)', 'https://github.com/Astral-Cyrusa/TwilightImperium3-ShatteredAscension4.2-CompactRulebook', 'primary'], ['Discord community', 'https://discord.gg/pYYQQCz', 'outline-dark']],
      stats: [['Players','3–8'],['Time','6–12 hr'],['Age','16+'],['Source','GitHub / Cyrusa'],['License','Community']],
      sections: [
        { id:'1', title:'Faction rebalance', body:"Every faction receives point-cost balancing. Weaker factions get starting bonuses; dominant factions face constraints. No faction is auto-pick or auto-ban in competitive play." },
        { id:'2', title:'Strategy card overhaul', body:"All 8 strategy cards reworked. Secondary abilities are more impactful, reducing the \"must-pick\" problem. Every strategy card is now viable depending on game state." },
        { id:'3', title:'Agenda phase 2.0', body:"Agendas now have permanent, game-changing effects. Political maneuvering becomes a genuine win condition path. The speaker role carries real weight every round." },
        { id:'4', title:'New objectives', body:"40+ custom objectives replacing the base set. More diverse paths to victory, fewer VP-denial strategies. Both public and secret objectives have been redesigned for variety." },
        { id:'5', title:'Combat revision', body:"Space combat uses a modified dice system with critical hits. Ground invasions are faster but riskier. Flagship abilities have been retuned to avoid snowball victories." }
      ],
      components: [
        { kind:'Required', list:['Twilight Imperium 3rd or 4th Edition base game','All expansion content (Shattered Empire recommended)','Faction sheets and plastic units for up to 8 players'] },
        { kind:'Printable', list:['Shattered Ascension rulebook (3000+ lines, GitHub)','Custom objective cards (print-and-cut)','Rebalanced strategy card overlays'] },
        { kind:'House', list:['Tabletop Simulator (digital alternative available)','Large table for 8-player games','Full day blocked out (6–12 hours minimum)'] }
      ],
    }

  };
})();
