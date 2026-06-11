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

    // ===== FACTION NAME — measured from reference: x:700, baseline y:48, ~58px =====
    lines.push(textEl(700, 48, state.factionName, {fontSize: 58, fill: '#fff', weight: '700', anchor: 'start'}));

    // ===== FLAGSHIP CARD — measured from reference =====
    // Name (QUEEN ANNAH): x:100, y:38, bold 24px
    lines.push(textEl(100, 38, state.flagshipName, {fontSize: 24, fill: '#fff', weight: '700'}));
    // Subtitle (NOKAR FLAGSHIP): x:100, y:62, italic 14px
    lines.push(textEl(100, 62, 'FACTION FLAGSHIP', {fontSize: 14, fill: '#c8a415', weight: '600'}));
    // Ability text: x:50, y:92, 16px body, wraps at 460px
    lines.push(wrapText(50, 92, state.flagshipAbility, {fontSize: 16, maxWidth: 460, fill: '#ddd', lineHeight: 21}));
    // Ability markers (SUSTAIN DAMAGE etc): x:50, y:218
    lines.push(textEl(50, 218, state.flagshipTitle, {fontSize: 13, fill: '#00f6b1', weight: '600'}));
    // Stats: y:280, centered in each box at x:108, 218, 328, 438, 50px
    lines.push(textEl(108, 280, state.flagshipCost, {fontSize: 50, fill: '#fff', weight: '700', anchor: 'middle'}));
    lines.push(textEl(218, 280, state.flagshipCombat, {fontSize: 50, fill: '#fff', weight: '700', anchor: 'middle'}));
    lines.push(textEl(328, 280, state.flagshipMove, {fontSize: 50, fill: '#fff', weight: '700', anchor: 'middle'}));
    lines.push(textEl(438, 280, state.flagshipCapacity, {fontSize: 50, fill: '#fff', weight: '700', anchor: 'middle'}));

    // ===== HOME SYSTEM RESOURCES/INFLUENCE =====
    // From reference: resources and influence appear in the system card area
    // System card is roughly x:540-1040, y:22-295
    // Numbers don't appear on the faction back in this template — skip for now
    // (The reference shows planets with numbers but those are part of the artwork)

    // ===== QUOTE — measured: centered ~x:1850, y:200, italic 16px =====
    lines.push(wrapText(1650, 195, state.factionQuote, {fontSize: 16, fill: '#ccc', font: FONT_BODY, maxWidth: 420, lineHeight: 22}));
    // Quoter: centered ~x:1850, y:275
    lines.push(textEl(1850, 275, state.factionQuoter, {fontSize: 16, fill: '#aaa', weight: '400', font: FONT_BODY, anchor: 'middle'}));

    // ===== FACTION SYMBOL (top-right corner) =====
    // ~x:2050-2150, y:20-120 (handled by image upload, not text)

    // ===== ABILITIES — measured: title x:1600, y:375/650, 20px bold; body y+27, 15px =====
    // Ability 1
    lines.push(textEl(1600, 375, state.factionAbility1Title, {fontSize: 20, fill: '#fff', weight: '700'}));
    lines.push(wrapText(1600, 402, state.factionAbility1, {fontSize: 15, maxWidth: 480, fill: '#ddd', lineHeight: 20}));
    // Ability 2
    lines.push(textEl(1600, 620, state.factionAbility2Title, {fontSize: 20, fill: '#fff', weight: '700'}));
    lines.push(wrapText(1600, 647, state.factionAbility2, {fontSize: 15, maxWidth: 480, fill: '#ddd', lineHeight: 20}));
    // Ability 3 (if present)
    lines.push(textEl(1600, 820, state.factionAbility3Title, {fontSize: 20, fill: '#fff', weight: '700'}));
    lines.push(wrapText(1600, 847, state.factionAbility3, {fontSize: 15, maxWidth: 480, fill: '#ddd', lineHeight: 20}));

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

    // Measured from reference: name at ~38%x/12%y, subtitle 18%y, body 35%y
    lines.push(textEl(285, 65, name || label + ' Name', {fontSize: 26, fill: '#fff', weight: '700'}));
    lines.push(textEl(285, 95, label, {fontSize: 16, fill: '#00f6b1', weight: '600'}));
    lines.push(wrapText(285, 145, ability || '', {fontSize: 16, maxWidth: 420, fill: '#ddd', lineHeight: 22}));

    lines.push('</svg>');
    return lines.join('\n');
  }

  function generateTechCard(name, ability, label, req1, req2, req3, imgBase) {
    // From reference (Neural Motivator, Predictive Intelligence):
    // Title: bold caps in metallic header strip, centered, ~y:40-55
    // Ability text: centered in main body, ~y:130-380 (large text, centered)
    // Req pips: left edge, stacked vertically ~x:30, y:350-430
    // Faction symbol: bottom-right ~x:650, y:400
    var lines = [];
    lines.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + TECH_W + '" height="' + TECH_H + '" viewBox="0 0 ' + TECH_W + ' ' + TECH_H + '">');
    lines.push('<image href="' + imgBase + 'TI4-Technology-Blank.png" width="' + TECH_W + '" height="' + TECH_H + '"/>');

    // Measured from reference: title x:125 y:55, body x:85 y:185
    lines.push(textEl(125, 58, name || label, {fontSize: 30, fill: '#fff', weight: '700'}));
    lines.push(wrapText(85, 185, ability || '', {fontSize: 24, maxWidth: 580, fill: '#ddd', lineHeight: 32}));

    // Req pips (left edge, bottom area)
    var reqColors = {r: '#d11a1a', g: '#3a9928', y: '#e6c020', b: '#0c4f8d'};
    if (req1 && reqColors[req1]) lines.push('<circle cx="40" cy="350" r="14" fill="' + reqColors[req1] + '"/>');
    if (req2 && reqColors[req2]) lines.push('<circle cx="40" cy="395" r="14" fill="' + reqColors[req2] + '"/>');
    if (req3 && reqColors[req3]) lines.push('<circle cx="40" cy="440" r="14" fill="' + reqColors[req3] + '"/>');

    lines.push('</svg>');
    return lines.join('\n');
  }

  function generateMechCard(name, ability, imgBase) {
    var lines = [];
    lines.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + MECH_W + '" height="' + MECH_H + '" viewBox="0 0 ' + MECH_W + ' ' + MECH_H + '">');
    lines.push('<image href="' + imgBase + 'TI4-Mech-Blank.png" width="' + MECH_W + '" height="' + MECH_H + '"/>');

    // Mech uses same template as leader (750x500)
    lines.push(textEl(285, 65, name || 'Mech', {fontSize: 26, fill: '#fff', weight: '700'}));
    lines.push(wrapText(285, 110, ability || '', {fontSize: 16, maxWidth: 420, fill: '#ddd', lineHeight: 22}));

    lines.push('</svg>');
    return lines.join('\n');
  }

  function generateNoteCard(name, ability, imgBase) {
    // From reference (Stymie, Blood Pact):
    // Portrait card (500x750)
    // Title: bold caps, centered at top ~y:35-50
    // Body text: left-aligned, starts ~y:180, padded x:45-450
    // Faction symbol: bottom-center ~y:650
    var lines = [];
    lines.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + NOTE_W + '" height="' + NOTE_H + '" viewBox="0 0 ' + NOTE_W + ' ' + NOTE_H + '">');
    lines.push('<image href="' + imgBase + 'TI4-Note-Blank.png" width="' + NOTE_W + '" height="' + NOTE_H + '"/>');

    // Measured from reference (scaled 2.25x): title centered y:40, body x:40 y:140
    lines.push(textEl(250, 42, name || 'Note', {fontSize: 28, fill: '#fff', weight: '700', anchor: 'middle'}));
    lines.push(wrapText(42, 140, ability || '', {fontSize: 18, maxWidth: 415, fill: '#ddd', lineHeight: 25}));

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
