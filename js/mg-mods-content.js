/* =========================================================================
   Moddable.Games — Mod Page Content (single source of truth)
   Extends window.MG with MOD_PAGES lookup used by mg-mod-page.js
   ========================================================================= */

(function() {
  window.MG.MOD_PAGES = {

    'talisman-hexed': {
      accent: 'blue',
      heroTitle: 'Talisman: <em>Hexed</em>.',
      lede: 'An open-world hex system that replaces the Talisman game boards with 61 individual hexagonal tiles — arranged in concentric rings so every game lays out differently. Built for <em>Talisman 4th Edition (revised)</em> by Fantasy Flight Games.',
      buttons: [['Read the rules', 'https://rules.moddable.games/dist/talisman-hexed/', 'primary'], ['Hex generator', 'https://hex.moddable.games/generate/?game=talisman', 'outline-dark']],
      stats: [['Players','2–6'],['Time','90 min'],['Age','13+'],['Tiles','61 hex'],['Designer','Moddable team'],['Updated','Apr 2024']],
      sections: [
        { id:'1', title:'Why hex?', body:"The square Talisman board gets boring fast — same path, same encounters, same finale every game. Hexagonal tiles let us deal a new map each session and keep the journey unpredictable." },
        { id:'2', title:'The four rings', body:"61 tiles arranged in concentric rings: 24 outer (the world), 18 river, 12 middle (the highlands), 6 inner (the dungeon approach), plus one central tile (the Crown of Command)." },
        { id:'3', title:'Special tiles', body:"10 water tiles connect across rings via the river. 4 desert tiles act as Talisman’s traditional ‘Desert’ region. The rest map onto the original board’s encounter spaces, redistributed each game." },
        { id:'4', title:'Movement', body:"Roll 1d6 and move that many tiles in any direction along legal edges. You may cross river tiles only with a boat token, raft, or relevant character ability." },
        { id:'5', title:"What hasn't changed", body:"All Talisman 4e (revised) cards, characters, spell decks, and adventure cards work as-is. Hexed only replaces the board — your encounter library is untouched." }
      ],
      components: [
        { kind:'Required', list:['Talisman 4e (revised) base game','Card decks (Adventure, Spell, Purchase, Stranger, Warlock Quest)','Character cards + miniatures'] },
        { kind:'Printable', list:['61 × hexagonal tiles (PDF, included)','Tile inventory + assembly diagram','River movement tokens'] },
        { kind:'House', list:['1d6 standard die','A large flat surface — 4ft × 3ft minimum','Patience for tile shuffling'] }
      ],
      related: ['Hyper Imperium', 'Econopoly']
    },

    'hyper-imperium': {
      accent: 'green',
      heroTitle: 'Hyper <em>Imperium</em>.',
      lede: 'Hyper Movement, Hyper Trades, Hyper Objectives, Hyper Factions, Hyper Agendas. A faster ruleset for TI4 + Prophecy of Kings that keeps the politics intact.',
      buttons: [['Read the rules', 'https://rules.moddable.games/dist/hyper-imperium/', 'primary'], ['TI4 tools', '/tools/ti/', 'outline-dark']],
      stats: [['Players','3–6'],['Time','4–6 hr'],['Age','14+'],['Source','Moddable.Games'],['License','CC BY-NC-SA']],
      sections: [
        { id:'1', title:'Hyper Movement', body:"Ships move +1 hex per activation. This applies to all ship types, including fighters and war suns. The result is faster fleet positioning and more aggressive early-game posturing, making turtling less viable." },
        { id:'2', title:'Hyper Trades', body:"The trade window opens every strategy phase, not just when the Trade strategy card is picked. Any player may negotiate trades freely during the strategy phase. Trade agreements still require mutual consent and can be broken at any time." },
        { id:'3', title:'Hyper Objectives', body:"Two public objectives are revealed per round instead of one. The victory point target is raised to 12 VP (up from 10). This creates more paths to victory and rewards flexible strategy over single-minded rushing." },
        { id:'4', title:'Hyper Factions', body:"Rebalanced faction abilities across all 25 factions. Weaker factions (Arborec, Winnu, Yin) receive meaningful buffs. Dominant factions (Saar, Jol-Nar, Nekro) are toned down without losing their identity. Full balance notes included in the PDF." },
        { id:'5', title:'Hyper Agendas', body:"The agenda phase triggers every round, not just after Mecatol Rex is taken. Two agendas are voted on per agenda phase as normal. This keeps politics relevant from round one and gives the Speaker role consistent value throughout the game." }
      ],
      components: [
        { kind:'Required', list:['Twilight Imperium 4th Edition base game','Prophecy of Kings expansion (recommended)','All faction sheets and tokens'] },
        { kind:'Printable', list:['Hyper Imperium rules reference (PDF, included)','Faction balance cheat sheet','Updated strategy card reference'] },
        { kind:'House', list:['Large table (6ft minimum recommended)','VP tracker going to 12','Timer for strategy phases (optional)'] }
      ],
      related: ['Talisman: Hexed', 'Shattered Ascension']
    },



    'anti-monopoly': {
      accent: 'red',
      heroTitle: 'Anti-Monopoly.',
      lede: 'Two teams play by different rules on the same board: Monopolists charge high rent on monopolies; Competitors charge cost-price only. Published by Ralph Anspach in 1973.',
      buttons: [['View on Wikipedia', 'https://en.wikipedia.org/wiki/Anti-Monopoly', 'primary'], ['BGG page', 'https://boardgamegeek.com/boardgame/1932/anti-monopoly', 'outline-dark']],
      stats: [['Players','2–6'],['Time','60 min'],['Age','10+'],['Source','Public domain variant'],['License','Public domain']],
      sections: [
        { id:'1', title:'Team selection', body:"At game start, each player secretly chooses Monopolist or Competitor. Their choice is revealed when they purchase their first property. This creates early-game uncertainty — you don't know who's on which team until money starts changing hands." },
        { id:'2', title:'Monopolist rules', body:"Monopolists can form monopolies, charge full rent, and build houses and hotels. In exchange, they pay higher fees and taxes. Their strategy is aggressive: accumulate, dominate, and squeeze opponents." },
        { id:'3', title:'Competitor rules', body:"Competitors charge cost-price rent only and cannot form monopolies. They pay lower fees and collect a higher salary when passing Go. Their strategy is defensive: survive, spread out, and outlast the Monopolists." },
        { id:'4', title:'Antitrust', body:"If Monopolists collectively control too many properties (more than 60% of a colour group across all Monopolist players), a \"trust-busting\" event triggers. One Monopolist property is redistributed via auction to non-Monopolist players." },
        { id:'5', title:'Victory', body:"Monopolists win by bankrupting all Competitors. Competitors win by bankrupting all Monopolists. If elimination is mixed (some from each team), the game goes to a points tally based on remaining assets." }
      ],
      components: [
        { kind:'Required', list:['Monopoly base game (any edition)','Standard board, property cards, and money','Player tokens and dice'] },
        { kind:'Printable', list:['Team selection cards (PDF, included)','Monopolist vs Competitor rules summary','Antitrust trigger reference sheet'] },
        { kind:'House', list:['Secret role tokens (coins in envelopes work)','Separate rent charts for each team','Notepad for tracking team affiliations once revealed'] }
      ],
      related: ['Econopoly', 'CivRisk']
    },

    'econopoly': {
      accent: 'green',
      heroTitle: 'Econopoly.',
      lede: 'Monopoly with a working economy. Anti-monopoly rules, dynamic property pricing, and a tax band that actually does something.',
      buttons: [['Read the rules', 'https://rules.moddable.games/dist/econopoly/', 'primary'], ['GitHub', 'https://github.com/Moddable-Games/moddable-rules', 'outline-dark']],
      stats: [['Players','2–6'],['Time','60 min'],['Age','10+'],['Source','Moddable.Games'],['License','CC BY-NC-SA']],
      sections: [
        { id:'1', title:'Dynamic pricing', body:"Property prices fluctuate based on how many times they've been landed on. Popular properties become expensive; neglected ones drop in value. Prices update at the start of each round." },
        { id:'2', title:'Tax bands', body:"Income tax scales with net worth. The richest player pays the highest rate each time they pass Go. Three bands: 10% (under $1000), 20% ($1000–$3000), 35% (over $3000). This keeps runaway leaders in check." },
        { id:'3', title:'Anti-monopoly clause', body:"Owning all properties of one colour triggers a government intervention — one property from that set is forcibly auctioned to the other players. Monopolies are powerful but temporary." },
        { id:'4', title:'Bankruptcy reform', body:"Bankrupt players enter \"debt mode\" for 3 turns before elimination. During debt mode, they can still trade, sell, and negotiate their way back to solvency. This prevents early-game knockouts from ruining the experience." },
        { id:'5', title:'Game timer', body:"The game ends after 90 minutes or when 2 players are eliminated, whichever comes first. The richest player wins. No more 4-hour Monopoly marathons that end in family arguments." }
      ],
      components: [
        { kind:'Required', list:['Monopoly base game (any edition)','Standard property cards and money','All player tokens and dice'] },
        { kind:'Printable', list:['Dynamic pricing tracker sheet (PDF, included)','Tax band reference card','Debt mode reminder tokens'] },
        { kind:'House', list:['90-minute timer (phone or kitchen timer)','Pencil for price tracking each round','Calculator for tax band percentages'] }
      ],
      related: ['Anti-Monopoly', 'Talisman: Hexed']
    },

    'flooded-catan': {
      accent: 'green',
      heroTitle: 'Flooded Catan.',
      lede: 'Community variant from the Catan Wiki: tiles flood every few rounds. Players can win by being the last settlement standing, not just by hitting 10 VP.',
      buttons: [['View on Catan Wiki', 'https://catan.fandom.com/wiki/Flooded_Catan', 'primary'], ['Catan subreddit', 'https://www.reddit.com/r/Catan/', 'outline-dark']],
      stats: [['Players','3–4'],['Time','75 min'],['Age','10+'],['Source','catan.fandom.com'],['License','Community / fan-made']],
      sections: [
        { id:'1', title:'Flood timer', body:"Every 4 turns, the lowest-numbered coastal hex floods — flip it face-down. Flooded hexes produce no resources, and no new buildings can be placed on their edges or vertices. The island is shrinking." },
        { id:'2', title:'Rising waters', body:"After turn 16, two hexes flood per cycle instead of one. The pace of destruction accelerates, forcing players toward the centre of the island and creating desperate last-stand scenarios." },
        { id:'3', title:'Survival victory', body:"If only one player has settlements or cities on non-flooded hexes, they win immediately — regardless of VP count. This alternate win condition rewards geographic strategy over pure economic play." },
        { id:'4', title:'Seawalls', body:"New structure: costs 2 brick + 1 wood. Placed on a hex edge, a seawall delays flooding of the adjacent hex by one full cycle. Limited to 3 per player. Placement timing is critical." },
        { id:'5', title:'Refugees', body:"When a settlement is flooded, the owning player may relocate it to any legal empty intersection for 1 grain + 1 wood. Cities cannot be relocated — they are lost permanently. Plan your city upgrades carefully." }
      ],
      components: [
        { kind:'Required', list:['Catan base game (any edition)','All hex tiles, number tokens, and resource cards','Standard building pieces and roads'] },
        { kind:'Printable', list:['Flood tracker sheet (PDF, included)','Seawall tokens (cut-out sheet)','Turn counter strip'] },
        { kind:'House', list:['Blue tokens or coins to mark flooded hexes','Numbered list of coastal hexes for flood order','Timer or turn counter (app recommended)'] }
      ],
      related: ['The Diamond Mine', 'Hyper Imperium']
    },

    'the-diamond-mine': {
      accent: 'red',
      heroTitle: 'The Diamond <em>Mine</em>.',
      lede: 'A single-hex unofficial expansion: swap one pasture for the diamond mine. Diamonds substitute for ore in development card purchases. Self-contained rules, free to print.',
      buttons: [['View on Scribd', 'https://www.scribd.com/doc/the-diamond-mine-catan', 'primary'], ['Catan fan expansions', 'https://catan.fandom.com/wiki/Fan_Expansions', 'outline-dark']],
      stats: [['Players','3–4'],['Time','60 min'],['Age','10+'],['Source','scribd / meepleeater'],['License','Fan-made / free to print']],
      sections: [
        { id:'1', title:'Setup', body:"Replace one pasture hex with the diamond mine hex (any number you choose). The diamond mine produces diamonds instead of wool when its number is rolled." },
        { id:'2', title:'Diamond production', body:"When the diamond mine's number is rolled, adjacent settlements receive 1 diamond token. Cities receive 2 diamond tokens, as with any other resource." },
        { id:'3', title:'Diamond usage', body:"Diamonds substitute for ore when buying development cards (1 diamond = 1 ore). They cannot be used for any other purchase — settlements, cities, or roads still require standard resources." },
        { id:'4', title:'Trading', body:"Diamonds cannot be traded with other players or via port. They are personal resources only. This keeps the diamond mine from becoming an overpowered trade engine." },
        { id:'5', title:'Robber interaction', body:"If the robber is placed on the diamond mine, no diamonds are produced AND the robber steals 1 diamond (if the target has any). If the target has no diamonds, the robber steals a random resource as normal." }
      ],
      components: [
        { kind:'Required', list:['Catan base game (any edition)','All standard hex tiles and number tokens','Resource cards and building pieces'] },
        { kind:'Printable', list:['Diamond mine hex tile (PDF, included)','Diamond resource tokens (cut-out sheet)','Quick-reference rules card'] },
        { kind:'House', list:['Small gems or glass beads as diamond tokens','Number token for the mine hex (your choice)','Pencil and paper for diamond tracking (optional)'] }
      ],
      related: ['Flooded Catan', 'Econopoly']
    },

    'shattered-ascension': {
      accent: 'green',
      heroTitle: 'Shattered <em>Ascension</em>.',
      lede: "PsiComa's decade-long TI3 remix — rebalanced factions, overhauled agenda phase, new card sets. The most thorough community TI variant in existence. Tabletop Simulator module available.",
      buttons: [['View on BGG', 'https://boardgamegeek.com/thread/811684/shattered-ascension-community-mod', 'primary'], ['TTS module', 'https://steamcommunity.com/sharedfiles/filedetails/?id=shattered-ascension', 'outline-dark']],
      stats: [['Players','3–8'],['Time','6–12 hr'],['Age','16+'],['Source','boardgamegeek.com'],['License','Community / BoardGameGeek']],
      sections: [
        { id:'1', title:'Faction rebalance', body:"Every faction receives point-cost balancing. Weaker factions get starting bonuses; dominant factions face constraints. No faction is auto-pick or auto-ban in competitive play." },
        { id:'2', title:'Strategy card overhaul', body:"All 8 strategy cards reworked. Secondary abilities are more impactful, reducing the \"must-pick\" problem. Every strategy card is now viable depending on game state." },
        { id:'3', title:'Agenda phase 2.0', body:"Agendas now have permanent, game-changing effects. Political maneuvering becomes a genuine win condition path. The speaker role carries real weight every round." },
        { id:'4', title:'New objectives', body:"40+ custom objectives replacing the base set. More diverse paths to victory, fewer VP-denial strategies. Both public and secret objectives have been redesigned for variety." },
        { id:'5', title:'Combat revision', body:"Space combat uses a modified dice system with critical hits. Ground invasions are faster but riskier. Flagship abilities have been retuned to avoid snowball victories." }
      ],
      components: [
        { kind:'Required', list:['Twilight Imperium 3rd or 4th Edition base game','All expansion content (Shattered Empire recommended)','Faction sheets and plastic units for up to 8 players'] },
        { kind:'Printable', list:['Shattered Ascension rulebook (PDF, 80+ pages)','Custom objective cards (print-and-cut)','Rebalanced strategy card overlays'] },
        { kind:'House', list:['Tabletop Simulator (digital alternative available)','Large table for 8-player games','Full day blocked out (6–12 hours minimum)'] }
      ],
      related: ['Hyper Imperium', 'Talisman: Hexed', 'CivRisk']
    },

    'civrisk': {
      accent: 'green',
      heroTitle: 'Civ<em>Risk</em>.',
      lede: 'Risk rewritten to play like Civilisation: choose a civilisation and leader, build through growth tiers, discover ruins and barbarian camps. Chris Grey, 2023. ePub rules free to download.',
      buttons: [['Download ePub', 'https://chrisgrey.itch.io/civrisk', 'primary'], ['Author site', 'https://chrisgrey.itch.io/', 'outline-dark']],
      stats: [['Players','3–5'],['Time','180 min'],['Age','14+'],['Designer','Chris Grey'],['Year','2023']],
      sections: [
        { id:'1', title:'Civilisations', body:"20 unique civilisations with asymmetric abilities. Each starts with a capital territory and a unique leader power. Leaders grant a one-time ability that can swing early-game positioning." },
        { id:'2', title:'Growth tiers', body:"Progress through Ancient → Classical → Medieval → Industrial → Modern. Each tier unlocks new unit types and abilities. Advancing requires controlling a minimum number of territories plus spending gold." },
        { id:'3', title:'Ruins & barbarians', body:"The map starts with hidden discovery tokens. Reveal them by occupying a territory: gold, technologies, or barbarian ambushes. Barbarians spawn as neutral armies that must be defeated before claiming the territory." },
        { id:'4', title:'Technologies', body:"Spend gold to research techs (one per turn). Techs give permanent bonuses: +1 defense, naval movement, siege weapons, etc. The tech tree has 15 nodes arranged in three branches: military, economic, and cultural." },
        { id:'5', title:'Victory', body:"Control 60% of territories OR complete 3 civilisation-specific objectives (unique per civ). Objectives range from controlling specific continents to reaching the Modern tier first to accumulating gold thresholds." }
      ],
      components: [
        { kind:'Required', list:['Risk base game (any edition with world map)','Army pieces for 3–5 players','Standard Risk cards and dice'] },
        { kind:'Printable', list:['Civilisation cards (20 unique, PDF included)','Tech tree reference board','Discovery tokens (cut-out sheet)'] },
        { kind:'House', list:['Gold tokens (coins, beads, or paper chits)','Hidden discovery tokens (face-down on map)','Growth tier tracker (one per player)'] }
      ],
      related: ['Custom World Risk', 'Shattered Ascension', 'Hyper Imperium']
    },

    'custom-world-risk': {
      accent: 'blue',
      heroTitle: 'Custom World <em>Risk</em>.',
      lede: 'Replace the standard board with your own map — Middle-earth, a fantasy continent, your neighbourhood. The rules stay identical, only the geography changes.',
      buttons: [['BGG templates', 'https://boardgamegeek.com/thread/custom-risk-maps', 'primary'], ['Map generator guide', 'https://www.reddit.com/r/Risk/wiki/custom_maps', 'outline-dark']],
      stats: [['Players','2–6'],['Time','120 min'],['Age','12+'],['Source','Community'],['License','Public domain']],
      sections: [
        { id:'1', title:'Choose your world', body:"Any map works — draw your own, print a fantasy continent, or use a historical map. Divide it into 30–50 territories with clear borders and connections. The more territories, the longer the game." },
        { id:'2', title:'Define continents', body:"Group territories into 4–6 continents. Assign continent bonuses proportional to difficulty of holding them (fewer borders = higher bonus). Balance is key — test with a few rounds before committing." },
        { id:'3', title:'Connection rules', body:"Adjacent territories can attack each other. For islands or separated regions, mark sea routes (dashed lines) that function as single-territory crossings. Limit sea routes to prevent overpowered naval shortcuts." },
        { id:'4', title:'Setup & play', body:"Standard Risk rules apply from here: deal territories, place armies, take turns (reinforce, attack, fortify). All card mechanics unchanged. Mission cards can be adapted to reference your custom continents." },
        { id:'5', title:'Sharing your map', body:"Upload your custom board to the community. Include: territory list, continent groupings, connection diagram, and recommended player count. The best custom maps get featured in the Moddable library." }
      ],
      components: [
        { kind:'Required', list:['Risk base game (any edition, for pieces and cards)','Custom map (printed or hand-drawn)','Army pieces and dice from base game'] },
        { kind:'Printable', list:['Blank map template (PDF, included)','Territory planning worksheet','Continent bonus calculator sheet'] },
        { kind:'House', list:['Large paper or poster board for your map','Coloured markers for territory borders','Clear ruler for sea route markings'] }
      ],
      related: ['CivRisk', 'Hyper Imperium', 'Talisman: Hexed']
    }

  };
})();
