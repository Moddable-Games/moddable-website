/* =========================================================================
   Faction SVG Generator — bounding-box text layout with auto-scaling
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

  function wrapToLines(text, charsPerLine) {
    var words = text.split(' ');
    var lines = [];
    var current = '';
    words.forEach(function(word) {
      var candidate = current ? current + ' ' + word : word;
      if (candidate.length > charsPerLine && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    });
    if (current) lines.push(current);
    return lines;
  }

  // Auto-scale font size so wrapped text fits within boxWidth x boxHeight.
  // Uses 0.55 * fontSize as estimated character width (matches Inter proportions).
  function fitText(text, boxWidth, boxHeight, maxFontSize) {
    if (!text) return { fontSize: maxFontSize, lines: [] };
    var fontSize = maxFontSize;
    while (fontSize > 6) {
      var charsPerLine = Math.floor(boxWidth / (fontSize * 0.55));
      var lines = wrapToLines(text, charsPerLine);
      if (lines.length * fontSize * 1.3 <= boxHeight) break;
      fontSize--;
    }
    var cpl = Math.floor(boxWidth / (fontSize * 0.55));
    return { fontSize: fontSize, lines: wrapToLines(text, cpl) };
  }

  // Render multi-line auto-scaled text within a bounding box.
  // x, y are the top-left corner of the box; w, h are the dimensions.
  function textBox(x, y, w, h, text, opts) {
    if (!text) return '';
    opts = opts || {};
    var fill = opts.fill || '#eee';
    var font = opts.font || FONT_DISPLAY;
    var weight = opts.weight || '600';
    var italic = opts.italic ? ' font-style="italic"' : '';
    var maxFont = opts.maxFont || 16;

    var fit = fitText(text, w, h, maxFont);
    var fontSize = fit.fontSize;
    var lines = fit.lines;
    var lineHeight = fontSize * 1.3;

    var result = '';
    lines.forEach(function(line, i) {
      var ty = y + fontSize + i * lineHeight;
      result += '<text x="' + x + '" y="' + ty + '" font-family="' + font + '" font-size="' + fontSize + '" font-weight="' + weight + '" fill="' + fill + '"' + italic + '>' + esc(line) + '</text>\n';
    });
    return result;
  }

  // Render a single line of text, auto-scaling down if it exceeds the box width.
  // When anchor='middle', the text is horizontally centered within the box.
  function textLine(x, y, w, h, text, opts) {
    if (!text) return '';
    opts = opts || {};
    var fill = opts.fill || '#eee';
    var font = opts.font || FONT_DISPLAY;
    var weight = opts.weight || '600';
    var anchor = opts.anchor || 'start';
    var italic = opts.italic ? ' font-style="italic"' : '';
    var maxFont = opts.maxFont || 16;

    var fontSize = maxFont;
    while (text.length * fontSize * 0.55 > w && fontSize > 6) fontSize--;

    var tx = anchor === 'middle' ? x + w / 2 : x;
    var ty = y + fontSize;

    return '<text x="' + tx + '" y="' + ty + '" font-family="' + font + '" font-size="' + fontSize + '" font-weight="' + weight + '" fill="' + fill + '" text-anchor="' + anchor + '"' + italic + '>' + esc(text) + '</text>\n';
  }

  function generateFactionSheet(state, imgBase) {
    var out = [];
    out.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + FACTION_W + '" height="' + FACTION_H + '" viewBox="0 0 ' + FACTION_W + ' ' + FACTION_H + '">');
    out.push('<image href="' + imgBase + 'TI4-Faction-Blank.png" width="' + FACTION_W + '" height="' + FACTION_H + '"/>');

    // Faction name — bold, top banner area
    out.push(textLine(700, 20, 800, 55, state.factionName, { maxFont: 58, fill: '#fff', weight: '700' }));

    // Flagship name — header strip of flagship card
    out.push(textLine(60, 25, 400, 25, state.flagshipName, { maxFont: 24, fill: '#fff', weight: '700' }));

    // Flagship ability — multi-line, auto-scaled
    out.push(textBox(50, 80, 460, 130, state.flagshipAbility, { maxFont: 16, fill: '#ddd', font: FONT_BODY, weight: '400' }));

    // Flagship markers (e.g. "Sustain Damage") — green accent
    out.push(textLine(50, 210, 430, 18, state.flagshipTitle, { maxFont: 13, fill: '#00f6b1', weight: '600' }));

    // Stat boxes — cost, combat, move, capacity — centered in each hex box
    out.push(textLine(60,  235, 100, 55, state.flagshipCost,     { maxFont: 50, fill: '#fff', weight: '700', anchor: 'middle' }));
    out.push(textLine(170, 235, 100, 55, state.flagshipCombat,   { maxFont: 50, fill: '#fff', weight: '700', anchor: 'middle' }));
    out.push(textLine(280, 235, 100, 55, state.flagshipMove,     { maxFont: 50, fill: '#fff', weight: '700', anchor: 'middle' }));
    out.push(textLine(390, 235, 100, 55, state.flagshipCapacity, { maxFont: 50, fill: '#fff', weight: '700', anchor: 'middle' }));

    // Quote — italic, right panel
    out.push(textBox(1630, 170, 450, 80, state.factionQuote, { maxFont: 16, fill: '#ccc', font: FONT_BODY, weight: '400', italic: true }));

    // Quoter — centered attribution below quote
    out.push(textLine(1630, 255, 450, 25, state.factionQuoter, { maxFont: 16, fill: '#aaa', font: FONT_BODY, weight: '400', anchor: 'middle' }));

    // Ability 1
    out.push(textLine(1600, 350, 500, 30, state.factionAbility1Title, { maxFont: 20, fill: '#fff', weight: '700' }));
    out.push(textBox(1600, 385, 500, 200, state.factionAbility1, { maxFont: 15, fill: '#ddd', font: FONT_BODY, weight: '400' }));

    // Ability 2
    out.push(textLine(1600, 600, 500, 30, state.factionAbility2Title, { maxFont: 20, fill: '#fff', weight: '700' }));
    out.push(textBox(1600, 635, 500, 150, state.factionAbility2, { maxFont: 15, fill: '#ddd', font: FONT_BODY, weight: '400' }));

    // Ability 3 (optional — estimated coordinates following the same cadence)
    if (state.factionAbility3Title) {
      out.push(textLine(1600, 800, 500, 30, state.factionAbility3Title, { maxFont: 20, fill: '#fff', weight: '700' }));
      out.push(textBox(1600, 835, 500, 130, state.factionAbility3, { maxFont: 15, fill: '#ddd', font: FONT_BODY, weight: '400' }));
    }

    // Commodities — large centered number, bottom-right
    out.push(textLine(2060, 730, 80, 65, state.factionCommodities, { maxFont: 52, fill: '#fff', weight: '700', anchor: 'middle' }));

    out.push('</svg>');
    return out.join('\n');
  }

  function generateLeaderCard(label, name, ability, imgBase) {
    var out = [];
    out.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + LEADER_W + '" height="' + LEADER_H + '" viewBox="0 0 ' + LEADER_W + ' ' + LEADER_H + '">');
    out.push('<image href="' + imgBase + 'TI4-Leader-Blank.png" width="' + LEADER_W + '" height="' + LEADER_H + '"/>');

    // Name: x:285, y:50, w:430, h:35, maxFont:26
    out.push(textLine(285, 50, 430, 35, name || label + ' Name', { maxFont: 26, fill: '#fff', weight: '700' }));

    // Label (Agent / Commander / Hero): x:285, y:85, w:430, h:22, maxFont:16
    out.push(textLine(285, 85, 430, 22, label, { maxFont: 16, fill: '#00f6b1', weight: '600' }));

    // Ability: x:285, y:120, w:420, h:340, maxFont:16
    out.push(textBox(285, 120, 420, 340, ability || '', { maxFont: 16, fill: '#ddd', font: FONT_BODY, weight: '400' }));

    out.push('</svg>');
    return out.join('\n');
  }

  function generateTechCard(name, ability, label, req1, req2, req3, imgBase) {
    var out = [];
    out.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + TECH_W + '" height="' + TECH_H + '" viewBox="0 0 ' + TECH_W + ' ' + TECH_H + '">');
    out.push('<image href="' + imgBase + 'TI4-Technology-Blank.png" width="' + TECH_W + '" height="' + TECH_H + '"/>');

    // Name: x:100, y:30, w:560, h:45, maxFont:30
    out.push(textLine(100, 30, 560, 45, name || label, { maxFont: 30, fill: '#fff', weight: '700' }));

    // Ability: x:85, y:150, w:580, h:280, maxFont:24
    out.push(textBox(85, 150, 580, 280, ability || '', { maxFont: 24, fill: '#ddd', font: FONT_BODY, weight: '400' }));

    // Req pips — left edge, stacked vertically
    var reqColors = { r: '#d11a1a', g: '#3a9928', y: '#e6c020', b: '#0c4f8d' };
    if (req1 && reqColors[req1]) out.push('<circle cx="40" cy="350" r="14" fill="' + reqColors[req1] + '"/>');
    if (req2 && reqColors[req2]) out.push('<circle cx="40" cy="395" r="14" fill="' + reqColors[req2] + '"/>');
    if (req3 && reqColors[req3]) out.push('<circle cx="40" cy="440" r="14" fill="' + reqColors[req3] + '"/>');

    out.push('</svg>');
    return out.join('\n');
  }

  function generateMechCard(name, ability, imgBase) {
    var out = [];
    out.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + MECH_W + '" height="' + MECH_H + '" viewBox="0 0 ' + MECH_W + ' ' + MECH_H + '">');
    out.push('<image href="' + imgBase + 'TI4-Mech-Blank.png" width="' + MECH_W + '" height="' + MECH_H + '"/>');

    // Mech uses same template dimensions as leader (750x500)
    out.push(textLine(285, 50, 430, 35, name || 'Mech', { maxFont: 26, fill: '#fff', weight: '700' }));
    out.push(textBox(285, 120, 420, 340, ability || '', { maxFont: 16, fill: '#ddd', font: FONT_BODY, weight: '400' }));

    out.push('</svg>');
    return out.join('\n');
  }

  function generateNoteCard(name, ability, imgBase) {
    var out = [];
    out.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + NOTE_W + '" height="' + NOTE_H + '" viewBox="0 0 ' + NOTE_W + ' ' + NOTE_H + '">');
    out.push('<image href="' + imgBase + 'TI4-Note-Blank.png" width="' + NOTE_W + '" height="' + NOTE_H + '"/>');

    // Title: x:50, y:20, w:400, h:45, maxFont:28
    out.push(textLine(50, 20, 400, 45, name || 'Note', { maxFont: 28, fill: '#fff', weight: '700' }));

    // Body: x:65, y:250, w:370, h:380, maxFont:17
    out.push(textBox(65, 250, 370, 380, ability || '', { maxFont: 17, fill: '#ddd', font: FONT_BODY, weight: '400' }));

    out.push('</svg>');
    return out.join('\n');
  }

  function generateAll(state, imgBase) {
    imgBase = imgBase || '';
    return [
      { type: 'faction',   svg: generateFactionSheet(state, imgBase) },
      { type: 'agent',     svg: generateLeaderCard('Agent',     state.agentName,      state.agentAbility,      imgBase) },
      { type: 'commander', svg: generateLeaderCard('Commander', state.commanderName,   state.commanderAbility,  imgBase) },
      { type: 'hero',      svg: generateLeaderCard('Hero',      state.heroName,        state.heroAbility,        imgBase) },
      { type: 'tech1',     svg: generateTechCard(state.tech1Name, state.tech1Ability, 'Tech #1', state.tech1Req1, state.tech1Req2, state.tech1Req3, imgBase) },
      { type: 'tech2',     svg: generateTechCard(state.tech2Name, state.tech2Ability, 'Tech #2', state.tech2Req1, state.tech2Req2, state.tech2Req3, imgBase) },
      { type: 'mech',      svg: generateMechCard(state.mechName, state.mechAbility, imgBase) },
      { type: 'note',      svg: generateNoteCard(state.noteName, state.noteAbility, imgBase) }
    ];
  }

  exports.generateFactionSheet = generateFactionSheet;
  exports.generateLeaderCard = generateLeaderCard;
  exports.generateTechCard = generateTechCard;
  exports.generateMechCard = generateMechCard;
  exports.generateNoteCard = generateNoteCard;
  exports.generateAll = generateAll;

})(typeof module !== 'undefined' ? module.exports : (window.FactionSVG = {}));
