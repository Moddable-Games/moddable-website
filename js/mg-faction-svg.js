/* =========================================================================
   Faction SVG Generator
   Pure function: takes state object, returns SVG string.
   Works in both browser (via window.generateFactionSVG) and Node (via module.exports).
   ========================================================================= */

(function(exports) {
  var FACTION_W = 2180, FACTION_H = 1496;
  var LEADER_W = 750, LEADER_H = 500;
  var TECH_W = 760, TECH_H = 495;
  var MECH_W = 750, MECH_H = 500;
  var NOTE_W = 500, NOTE_H = 750;

  var FONT_DISPLAY = "'Inter Tight', sans-serif";
  var FONT_BODY = "'Inter', sans-serif";
  var FONT_MONO = "'JetBrains Mono', monospace";

  function esc(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function text(x, y, content, opts) {
    if (!content) return '';
    var fontSize = opts.fontSize || 28;
    var fill = opts.fill || '#eee';
    var font = opts.font || FONT_DISPLAY;
    var weight = opts.weight || '600';
    var anchor = opts.anchor || 'start';
    var maxWidth = opts.maxWidth ? ' textLength="' + opts.maxWidth + '" lengthAdjust="spacingAndGlyphs"' : '';
    return '<text x="' + x + '" y="' + y + '" font-family="' + font + '" font-size="' + fontSize + '" font-weight="' + weight + '" fill="' + fill + '" text-anchor="' + anchor + '"' + maxWidth + '>' + esc(content) + '</text>';
  }

  function generateFactionSheet(state, imgBase) {
    // The overlay region covers the top 65% of the image (y:0 to y:972)
    // All positions are calculated relative to the full 2180x1496 canvas
    // but content only occupies the top 65% (972px)
    var OW = FACTION_W; // 2180
    var OH = Math.round(FACTION_H * 0.65); // 972

    // Card regions (from old tool CSS, converted to px):
    // Card unit = (OW - 30) / 4.35 = ~494w, (OH - 30) / 4.5 = ~209h
    var CW = Math.round((OW - 30) / 4.35); // ~494
    var CH = Math.round((OH - 30) / 4.5);  // ~209

    // Flagship: top:2.4%, left:1%
    var FS_X = Math.round(15 + OW * 0.01); // ~37
    var FS_Y = Math.round(15 + OH * 0.024); // ~38
    // Flagship name: within card, top:2%, left:14%, w:75%, h:10%
    var FSN_X = FS_X + Math.round(CW * 0.14); // ~106
    var FSN_Y = FS_Y + Math.round(CH * 0.04); // ~46
    // Flagship ability title: top:31%, left:8%
    var FSAT_Y = FS_Y + Math.round(CH * 0.31); // ~103
    var FSA_X = FS_X + Math.round(CW * 0.08); // ~77
    // Flagship ability: top:40%
    var FSA_Y = FS_Y + Math.round(CH * 0.42); // ~126
    // Stats: bottom:13.5%, left:6%/28.5%/50.5%/72.5%, w:21%
    var STAT_Y = FS_Y + Math.round(CH * 0.80); // ~205 (shifted down for visual baseline)
    var STAT_X1 = FS_X + Math.round(CW * 0.165); // cost center
    var STAT_X2 = FS_X + Math.round(CW * 0.39);  // combat center
    var STAT_X3 = FS_X + Math.round(CW * 0.615); // move center
    var STAT_X4 = FS_X + Math.round(CW * 0.835); // capacity center
    // Flagship icon: top:0.6%, left:0.6%, w:14%, h:21% (for symbol image)
    var FSI_X = FS_X + Math.round(CW * 0.006);
    var FSI_Y = FS_Y + Math.round(CH * 0.006);

    // System: top:2.4%, left:25%
    var SYS_X = Math.round(15 + OW * 0.25); // ~560
    var SYS_Y = Math.round(15 + OH * 0.024); // ~38
    // Resources: bottom:0%, left:2%, h:25%, w:28%
    var RES_X = SYS_X + Math.round(CW * 0.16); // center of resources box
    var RES_Y = SYS_Y + Math.round(CH * 0.85); // near bottom
    // Influence: left:70%
    var INF_X = SYS_X + Math.round(CW * 0.84);
    var INF_Y = RES_Y;

    // Title (faction name): top:2.4%, left:49%, w: OW/2.9 centered
    var TITLE_W = Math.round(OW / 2.9); // ~752
    var TITLE_X = Math.round(15 + OW * 0.49 + TITLE_W * 0.5);
    var TITLE_Y = Math.round(15 + OH * 0.05);

    // Meta (quote area): top:0, left:74%, w:OW/5, h:CH
    var META_X = Math.round(15 + OW * 0.74); // ~1628
    var META_W = Math.round(OW / 5); // ~436
    var META_CX = META_X + Math.round(META_W * 0.5); // ~1846
    // Meta icon at top, quote at 55% of CH, quoter at 85% of CH
    var QUOTE_Y = Math.round(15 + CH * 0.55); // meta starts at y:15
    var QUOTER_Y = Math.round(15 + CH * 0.85);

    // Abilities: top:25% of OH, right:3%, w:OW/5, h:(OH-30)/3.5
    var AB_W = Math.round(OW / 5); // ~436
    var AB_RIGHT = Math.round(OW * 0.03 + 15); // right margin
    var AB_X = OW - AB_RIGHT - AB_W + Math.round(AB_W * 0.06); // left:6% inside box
    var AB_Y = Math.round(15 + OH * 0.25); // ~258
    var AB_H = Math.round((OH - 30) / 3.5); // ~269
    var AB1T_Y = AB_Y + Math.round(AB_H * 0.02);
    var AB1_Y = AB_Y + Math.round(AB_H * 0.12);
    var AB2T_Y = AB_Y + Math.round(AB_H * 0.37);
    var AB2_Y = AB_Y + Math.round(AB_H * 0.48);
    var AB3T_Y = AB_Y + Math.round(AB_H * 0.72);
    var AB3_Y = AB_Y + Math.round(AB_H * 0.83);

    // Commodities: bottom:25% of OH, right:4%, w:OW/15, h:OH/12
    var COM_W = Math.round(OW / 15); // ~145
    var COM_X = Math.round(OW - 15 - OW * 0.04 - COM_W * 0.5);
    var COM_Y = Math.round(OH - OH * 0.25);

    var lines = [];
    lines.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + FACTION_W + '" height="' + FACTION_H + '" viewBox="0 0 ' + FACTION_W + ' ' + FACTION_H + '">');
    lines.push('<image href="' + imgBase + 'TI4-Faction-Blank.png" width="' + FACTION_W + '" height="' + FACTION_H + '"/>');

    // Faction name
    lines.push(text(TITLE_X, TITLE_Y, state.factionName, {fontSize: 30, fill: '#fff', weight: '700', anchor: 'middle'}));

    // Flagship
    lines.push(text(FSN_X, FSN_Y, state.flagshipName, {fontSize: 20, fill: '#fff', weight: '700'}));
    lines.push(text(FSA_X, FSAT_Y, state.flagshipTitle, {fontSize: 14, fill: '#00f6b1', weight: '600'}));
    lines.push(text(FSA_X, FSA_Y, state.flagshipAbility, {fontSize: 11, fill: '#ddd', weight: '400', font: FONT_BODY}));
    lines.push(text(STAT_X1, STAT_Y, state.flagshipCost, {fontSize: 40, fill: '#fff', weight: '700', anchor: 'middle'}));
    lines.push(text(STAT_X2, STAT_Y, state.flagshipCombat, {fontSize: 40, fill: '#fff', weight: '700', anchor: 'middle'}));
    lines.push(text(STAT_X3, STAT_Y, state.flagshipMove, {fontSize: 40, fill: '#fff', weight: '700', anchor: 'middle'}));
    lines.push(text(STAT_X4, STAT_Y, state.flagshipCapacity, {fontSize: 40, fill: '#fff', weight: '700', anchor: 'middle'}));

    // System resources / influence
    lines.push(text(RES_X, RES_Y, state.factionResources, {fontSize: 32, fill: '#fff', weight: '700', anchor: 'middle'}));
    lines.push(text(INF_X, INF_Y, state.factionInfluence, {fontSize: 32, fill: '#fff', weight: '700', anchor: 'middle'}));

    // Meta (quote)
    lines.push(text(META_CX, QUOTE_Y, state.factionQuote, {fontSize: 11, fill: '#ddd', weight: '400', font: FONT_BODY, anchor: 'middle'}));
    lines.push(text(META_CX, QUOTER_Y, state.factionQuoter, {fontSize: 13, fill: '#fff', weight: '600', anchor: 'middle'}));

    // Abilities
    lines.push(text(AB_X, AB1T_Y, state.factionAbility1Title, {fontSize: 16, fill: '#fff', weight: '700'}));
    lines.push(text(AB_X, AB1_Y, state.factionAbility1, {fontSize: 11, fill: '#ddd', weight: '400', font: FONT_BODY}));
    lines.push(text(AB_X, AB2T_Y, state.factionAbility2Title, {fontSize: 16, fill: '#fff', weight: '700'}));
    lines.push(text(AB_X, AB2_Y, state.factionAbility2, {fontSize: 11, fill: '#ddd', weight: '400', font: FONT_BODY}));
    lines.push(text(AB_X, AB3T_Y, state.factionAbility3Title, {fontSize: 16, fill: '#fff', weight: '700'}));
    lines.push(text(AB_X, AB3_Y, state.factionAbility3, {fontSize: 11, fill: '#ddd', weight: '400', font: FONT_BODY}));

    // Commodities
    lines.push(text(COM_X, COM_Y, state.factionCommodities, {fontSize: 32, fill: '#fff', weight: '700', anchor: 'middle'}));

    lines.push('</svg>');
    return lines.join('\n');
  }

  function generateLeaderCard(label, name, ability, imgBase) {
    var lines = [];
    lines.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + LEADER_W + '" height="' + LEADER_H + '" viewBox="0 0 ' + LEADER_W + ' ' + LEADER_H + '">');
    lines.push('<image href="' + imgBase + 'TI4-Leader-Blank.png" width="' + LEADER_W + '" height="' + LEADER_H + '"/>');

    // Name and label in the bottom-right text panel
    lines.push(text(280, 365, name, {fontSize: 20, fill: '#fff', weight: '700'}));
    lines.push(text(280, 395, label, {fontSize: 16, fill: '#00f6b1', weight: '600'}));
    lines.push(text(350, 440, ability, {fontSize: 12, fill: '#ddd', weight: '400', font: FONT_BODY, anchor: 'start'}));

    lines.push('</svg>');
    return lines.join('\n');
  }

  function generateTechCard(name, ability, label, req1, req2, req3, imgBase) {
    var lines = [];
    lines.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + TECH_W + '" height="' + TECH_H + '" viewBox="0 0 ' + TECH_W + ' ' + TECH_H + '">');
    lines.push('<image href="' + imgBase + 'TI4-Technology-Blank.png" width="' + TECH_W + '" height="' + TECH_H + '"/>');

    lines.push(text(280, 365, name, {fontSize: 20, fill: '#fff', weight: '700'}));
    lines.push(text(280, 395, label, {fontSize: 16, fill: '#00f6b1', weight: '600'}));
    lines.push(text(280, 435, ability, {fontSize: 12, fill: '#ddd', weight: '400', font: FONT_BODY}));

    var reqColors = {r: '#d11a1a', g: '#3a9928', y: '#e6c020', b: '#0c4f8d'};
    if (req1 && reqColors[req1]) lines.push('<circle cx="40" cy="380" r="8" fill="' + reqColors[req1] + '"/>');
    if (req2 && reqColors[req2]) lines.push('<circle cx="40" cy="410" r="8" fill="' + reqColors[req2] + '"/>');
    if (req3 && reqColors[req3]) lines.push('<circle cx="40" cy="440" r="8" fill="' + reqColors[req3] + '"/>');

    lines.push('</svg>');
    return lines.join('\n');
  }

  function generateMechCard(name, ability, imgBase) {
    var lines = [];
    lines.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + MECH_W + '" height="' + MECH_H + '" viewBox="0 0 ' + MECH_W + ' ' + MECH_H + '">');
    lines.push('<image href="' + imgBase + 'TI4-Mech-Blank.png" width="' + MECH_W + '" height="' + MECH_H + '"/>');

    lines.push(text(280, 365, name, {fontSize: 20, fill: '#fff', weight: '700'}));
    lines.push(text(100, 420, ability, {fontSize: 12, fill: '#ddd', weight: '400', font: FONT_BODY}));

    lines.push('</svg>');
    return lines.join('\n');
  }

  function generateNoteCard(name, ability, imgBase) {
    var lines = [];
    lines.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + NOTE_W + '" height="' + NOTE_H + '" viewBox="0 0 ' + NOTE_W + ' ' + NOTE_H + '">');
    lines.push('<image href="' + imgBase + 'TI4-Note-Blank.png" width="' + NOTE_W + '" height="' + NOTE_H + '"/>');

    lines.push(text(60, 530, name, {fontSize: 20, fill: '#fff', weight: '700'}));
    lines.push(text(60, 580, ability, {fontSize: 12, fill: '#757575', weight: '400', font: FONT_BODY}));

    lines.push('</svg>');
    return lines.join('\n');
  }

  function generateAll(state, imgBase) {
    imgBase = imgBase || '';
    var parts = [];
    parts.push({type: 'faction', svg: generateFactionSheet(state, imgBase)});
    parts.push({type: 'agent', svg: generateLeaderCard('Agent', state.agentName || 'Agent', state.agentAbility, imgBase)});
    parts.push({type: 'commander', svg: generateLeaderCard('Commander', state.commanderName || 'Commander', state.commanderAbility, imgBase)});
    parts.push({type: 'hero', svg: generateLeaderCard('Hero', state.heroName || 'Hero', state.heroAbility, imgBase)});
    parts.push({type: 'tech1', svg: generateTechCard(state.tech1Name, state.tech1Ability, 'Tech #1', state.tech1Req1, state.tech1Req2, state.tech1Req3, imgBase)});
    parts.push({type: 'tech2', svg: generateTechCard(state.tech2Name, state.tech2Ability, 'Tech #2', state.tech2Req1, state.tech2Req2, state.tech2Req3, imgBase)});
    parts.push({type: 'mech', svg: generateMechCard(state.mechName, state.mechAbility, imgBase)});
    parts.push({type: 'note', svg: generateNoteCard(state.noteName, state.noteAbility, imgBase)});
    return parts;
  }

  exports.generateFactionSheet = generateFactionSheet;
  exports.generateLeaderCard = generateLeaderCard;
  exports.generateTechCard = generateTechCard;
  exports.generateMechCard = generateMechCard;
  exports.generateNoteCard = generateNoteCard;
  exports.generateAll = generateAll;

})(typeof module !== 'undefined' ? module.exports : (window.FactionSVG = {}));
