/* =========================================================================
   Faction SVG Generator
   Pure function: takes state object, returns SVG string.
   Works in both browser (via window.FactionSVG) and Node (via module.exports).
   ========================================================================= */

(function(exports) {
  var FACTION_W = 2180, FACTION_H = 1496;
  var LEADER_W = 750, LEADER_H = 500;
  var TECH_W = 760, TECH_H = 495;
  var MECH_W = 750, MECH_H = 500;
  var NOTE_W = 500, NOTE_H = 750;

  var FONT_DISPLAY = "'Inter Tight', sans-serif";
  var FONT_BODY = "'Inter', sans-serif";

  function esc(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function textEl(x, y, content, opts) {
    if (!content) return '';
    var fontSize = opts.fontSize || 28;
    var fill = opts.fill || '#eee';
    var font = opts.font || FONT_DISPLAY;
    var weight = opts.weight || '600';
    var anchor = opts.anchor || 'start';
    return '<text x="' + x + '" y="' + y + '" font-family="' + font + '" font-size="' + fontSize + '" font-weight="' + weight + '" fill="' + fill + '" text-anchor="' + anchor + '">' + esc(content) + '</text>';
  }

  function wrapText(x, y, content, opts) {
    if (!content) return '';
    var fontSize = opts.fontSize || 12;
    var fill = opts.fill || '#ddd';
    var font = opts.font || FONT_BODY;
    var weight = opts.weight || '400';
    var maxWidth = opts.maxWidth || 300;
    var lineHeight = opts.lineHeight || (fontSize * 1.4);

    var charsPerLine = Math.floor(maxWidth / (fontSize * 0.55));
    var words = content.split(' ');
    var lines = [];
    var currentLine = '';

    words.forEach(function(word) {
      if ((currentLine + ' ' + word).trim().length > charsPerLine) {
        if (currentLine) lines.push(currentLine.trim());
        currentLine = word;
      } else {
        currentLine = (currentLine + ' ' + word).trim();
      }
    });
    if (currentLine) lines.push(currentLine.trim());

    var result = '';
    lines.forEach(function(line, i) {
      result += '<text x="' + x + '" y="' + (y + i * lineHeight) + '" font-family="' + font + '" font-size="' + fontSize + '" font-weight="' + weight + '" fill="' + fill + '">' + esc(line) + '</text>\n';
    });
    return result;
  }

  function generateFactionSheet(state, imgBase) {
    var lines = [];
    lines.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + FACTION_W + '" height="' + FACTION_H + '" viewBox="0 0 ' + FACTION_W + ' ' + FACTION_H + '">');
    lines.push('<image href="' + imgBase + 'TI4-Faction-Blank.png" width="' + FACTION_W + '" height="' + FACTION_H + '"/>');

    // ===== FACTION NAME (top center, large bold) =====
    lines.push(textEl(780, 55, state.factionName, {fontSize: 52, fill: '#fff', weight: '700', anchor: 'start'}));

    // ===== FLAGSHIP CARD (top-left, x:38-505, y:22-295) =====
    // Name: top of card, centered in header strip
    lines.push(textEl(270, 42, state.flagshipName, {fontSize: 16, fill: '#fff', weight: '700', anchor: 'middle'}));
    // Ability description: below ship image, above stats. Area: x:55-490, y:95-185
    lines.push(wrapText(55, 82, state.flagshipAbility, {fontSize: 11, maxWidth: 430, fill: '#ddd'}));
    // Ability markers (sustain damage etc): y:~190
    lines.push(textEl(65, 195, state.flagshipTitle, {fontSize: 10, fill: '#00f6b1', weight: '600'}));
    // Stats in green boxes: y:230-275, 4 boxes centered at x:108, 218, 328, 438
    lines.push(textEl(108, 270, state.flagshipCost, {fontSize: 38, fill: '#fff', weight: '700', anchor: 'middle'}));
    lines.push(textEl(218, 270, state.flagshipCombat, {fontSize: 38, fill: '#fff', weight: '700', anchor: 'middle'}));
    lines.push(textEl(328, 270, state.flagshipMove, {fontSize: 38, fill: '#fff', weight: '700', anchor: 'middle'}));
    lines.push(textEl(438, 270, state.flagshipCapacity, {fontSize: 38, fill: '#fff', weight: '700', anchor: 'middle'}));

    // ===== HOME SYSTEM RESOURCES/INFLUENCE =====
    // From reference: resources and influence appear in the system card area
    // System card is roughly x:540-1040, y:22-295
    // Numbers don't appear on the faction back in this template — skip for now
    // (The reference shows planets with numbers but those are part of the artwork)

    // ===== QUOTE (top-right, italic, small) =====
    // From reference: quote appears right of faction name, right-aligned
    // Approximately x:1700-2080, y:25-80
    lines.push(wrapText(1680, 30, state.factionQuote, {fontSize: 12, fill: '#ccc', font: FONT_BODY, maxWidth: 380, lineHeight: 16}));
    // Quoter: below quote, right-aligned style
    lines.push(textEl(2060, 80, state.factionQuoter, {fontSize: 11, fill: '#aaa', weight: '400', font: FONT_BODY, anchor: 'end'}));

    // ===== FACTION SYMBOL (top-right corner) =====
    // ~x:2050-2150, y:20-120 (handled by image upload, not text)

    // ===== ABILITIES (right panel) =====
    // From reference: right column, starting below quote area
    // Panel inner area: x:1700-2120, y:110-700
    // Each ability: TITLE (bold caps) + multi-line description
    // Ability 1
    lines.push(textEl(1700, 140, state.factionAbility1Title, {fontSize: 16, fill: '#fff', weight: '700'}));
    lines.push(wrapText(1700, 163, state.factionAbility1, {fontSize: 12, maxWidth: 400, fill: '#ddd', lineHeight: 16}));
    // Ability 2
    lines.push(textEl(1700, 340, state.factionAbility2Title, {fontSize: 16, fill: '#fff', weight: '700'}));
    lines.push(wrapText(1700, 363, state.factionAbility2, {fontSize: 12, maxWidth: 400, fill: '#ddd', lineHeight: 16}));
    // Ability 3
    lines.push(textEl(1700, 520, state.factionAbility3Title, {fontSize: 16, fill: '#fff', weight: '700'}));
    lines.push(wrapText(1700, 543, state.factionAbility3, {fontSize: 12, maxWidth: 400, fill: '#ddd', lineHeight: 16}));

    // ===== COMMODITIES (bottom-right) =====
    // Large number, approximately x:2080-2140, y:700-800
    lines.push(textEl(2110, 770, state.factionCommodities, {fontSize: 52, fill: '#fff', weight: '700', anchor: 'middle'}));

    lines.push('</svg>');
    return lines.join('\n');
  }

  function generateLeaderCard(label, name, ability, imgBase) {
    // From reference: Leader cards have portrait left, text panel right
    // Text panel starts at approximately x:280
    // Name: large bold at top of text area (~y:80-100)
    // Label (Agent/Commander/Hero): below name in accent color (~y:110-125)
    // Ability: wrapped text filling the rest (~y:145+)
    var lines = [];
    lines.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + LEADER_W + '" height="' + LEADER_H + '" viewBox="0 0 ' + LEADER_W + ' ' + LEADER_H + '">');
    lines.push('<image href="' + imgBase + 'TI4-Leader-Blank.png" width="' + LEADER_W + '" height="' + LEADER_H + '"/>');

    lines.push(textEl(300, 95, name || label + ' Name', {fontSize: 20, fill: '#fff', weight: '700'}));
    lines.push(textEl(300, 120, label, {fontSize: 14, fill: '#00f6b1', weight: '600'}));
    lines.push(wrapText(300, 150, ability || '', {fontSize: 12, maxWidth: 400, fill: '#ddd', lineHeight: 16}));

    lines.push('</svg>');
    return lines.join('\n');
  }

  function generateTechCard(name, ability, label, req1, req2, req3, imgBase) {
    // Tech cards: similar layout to leaders but with req pips on left
    // Title at top, label below, ability text filling main area
    // Req pips in left column
    var lines = [];
    lines.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + TECH_W + '" height="' + TECH_H + '" viewBox="0 0 ' + TECH_W + ' ' + TECH_H + '">');
    lines.push('<image href="' + imgBase + 'TI4-Technology-Blank.png" width="' + TECH_W + '" height="' + TECH_H + '"/>');

    lines.push(textEl(140, 95, name || label, {fontSize: 20, fill: '#fff', weight: '700'}));
    lines.push(textEl(140, 120, label, {fontSize: 14, fill: '#00f6b1', weight: '600'}));
    lines.push(wrapText(140, 150, ability || '', {fontSize: 12, maxWidth: 560, fill: '#ddd', lineHeight: 16}));

    var reqColors = {r: '#d11a1a', g: '#3a9928', y: '#e6c020', b: '#0c4f8d'};
    if (req1 && reqColors[req1]) lines.push('<circle cx="45" cy="320" r="12" fill="' + reqColors[req1] + '"/>');
    if (req2 && reqColors[req2]) lines.push('<circle cx="45" cy="365" r="12" fill="' + reqColors[req2] + '"/>');
    if (req3 && reqColors[req3]) lines.push('<circle cx="45" cy="410" r="12" fill="' + reqColors[req3] + '"/>');

    lines.push('</svg>');
    return lines.join('\n');
  }

  function generateMechCard(name, ability, imgBase) {
    var lines = [];
    lines.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + MECH_W + '" height="' + MECH_H + '" viewBox="0 0 ' + MECH_W + ' ' + MECH_H + '">');
    lines.push('<image href="' + imgBase + 'TI4-Mech-Blank.png" width="' + MECH_W + '" height="' + MECH_H + '"/>');

    lines.push(textEl(300, 95, name || 'Mech', {fontSize: 20, fill: '#fff', weight: '700'}));
    lines.push(wrapText(100, 150, ability || '', {fontSize: 12, maxWidth: 550, fill: '#ddd', lineHeight: 16}));

    lines.push('</svg>');
    return lines.join('\n');
  }

  function generateNoteCard(name, ability, imgBase) {
    // Note card is portrait (500x750)
    // Title near top of content panel, ability below
    var lines = [];
    lines.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + NOTE_W + '" height="' + NOTE_H + '" viewBox="0 0 ' + NOTE_W + ' ' + NOTE_H + '">');
    lines.push('<image href="' + imgBase + 'TI4-Note-Blank.png" width="' + NOTE_W + '" height="' + NOTE_H + '"/>');

    lines.push(textEl(60, 130, name || 'Note', {fontSize: 20, fill: '#fff', weight: '700'}));
    lines.push(wrapText(60, 165, ability || '', {fontSize: 12, maxWidth: 380, fill: '#757575', lineHeight: 16}));

    lines.push('</svg>');
    return lines.join('\n');
  }

  function generateAll(state, imgBase) {
    imgBase = imgBase || '';
    var parts = [];
    parts.push({type: 'faction', svg: generateFactionSheet(state, imgBase)});
    parts.push({type: 'agent', svg: generateLeaderCard('Agent', state.agentName, state.agentAbility, imgBase)});
    parts.push({type: 'commander', svg: generateLeaderCard('Commander', state.commanderName, state.commanderAbility, imgBase)});
    parts.push({type: 'hero', svg: generateLeaderCard('Hero', state.heroName, state.heroAbility, imgBase)});
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
