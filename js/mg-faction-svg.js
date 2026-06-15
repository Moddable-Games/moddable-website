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
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function wrapToLines(text, charsPerLine) {
    var words = String(text).split(' ');
    var lines = [];
    var current = '';
    words.forEach(function(word) {
      var test = current ? current + ' ' + word : word;
      if (test.length > charsPerLine && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    });
    if (current) lines.push(current);
    return lines.length ? lines : [''];
  }

  function fitText(text, boxWidth, boxHeight, maxFontSize) {
    if (!text) return { fontSize: maxFontSize, lines: [] };
    var fontSize = maxFontSize;
    while (fontSize > 6) {
      var charsPerLine = Math.floor(boxWidth / (fontSize * 0.55));
      var lines = wrapToLines(text, charsPerLine);
      if (lines.length * fontSize * 1.3 <= boxHeight) break;
      fontSize--;
    }
    var finalCharsPerLine = Math.floor(boxWidth / (fontSize * 0.55));
    return { fontSize: fontSize, lines: wrapToLines(text, finalCharsPerLine) };
  }

  // Render text into a bounding box with auto-scaling font.
  // x, y = top-left corner of box; w, h = dimensions; maxFont = max font-size
  // opts: fill, weight, center (text-anchor middle), italic, body (use FONT_BODY)
  function boxText(text, x, y, w, h, maxFont, opts) {
    if (!text) return '';
    opts = opts || {};

    var fill = opts.fill || '#eee';
    var font = opts.body ? FONT_BODY : FONT_DISPLAY;
    var weight = opts.weight || '600';
    var anchor = opts.center ? 'middle' : 'start';

    var fit = fitText(String(text), w, h, maxFont);
    if (!fit.lines.length) return '';
    var fs = fit.fontSize;
    var lines = fit.lines;
    var lh = fs * 1.3;

    var tx = opts.center ? (x + w / 2) : x;
    // Single line: vertically centre in box; multi-line: start from top
    var ty = lines.length === 1
      ? y + (h + fs * 0.72) / 2
      : y + fs;

    var out = '';
    for (var i = 0; i < lines.length; i++) {
      out += '<text x="' + tx + '" y="' + Math.round(ty + i * lh) + '"' +
        ' font-family="' + font + '" font-size="' + fs + '"' +
        ' font-weight="' + weight + '"' +
        (opts.italic ? ' font-style="italic"' : '') +
        ' fill="' + fill + '" text-anchor="' + anchor + '">' + esc(lines[i]) + '</text>\n';
    }
    return out;
  }

  function generateFactionSheet(state, imgBase) {
    var svg = [];
    svg.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + FACTION_W + '" height="' + FACTION_H + '" viewBox="0 0 ' + FACTION_W + ' ' + FACTION_H + '">');
    svg.push('<image href="' + imgBase + 'TI4-Faction-Blank.png" width="' + FACTION_W + '" height="' + FACTION_H + '"/>');

    // Faction name — top banner
    svg.push(boxText(state.factionName,          700,  20,  800,  55,  58, {fill:'#fff', weight:'700'}));

    // Flagship card — top-left section
    svg.push(boxText(state.flagshipName,           60,  25,  400,  25,  24, {fill:'#fff', weight:'700'}));
    svg.push(boxText(state.flagshipAbility,        50,  80,  460, 130,  16, {fill:'#ddd', weight:'400', body:true}));
    svg.push(boxText(state.flagshipTitle,          50, 210,  430,  18,  13, {fill:'#00f6b1', weight:'600'}));

    // Flagship stats — centred in their hex boxes
    svg.push(boxText(state.flagshipCost,           60, 235,  100,  55,  50, {fill:'#fff', weight:'700', center:true}));
    svg.push(boxText(state.flagshipCombat,        170, 235,  100,  55,  50, {fill:'#fff', weight:'700', center:true}));
    svg.push(boxText(state.flagshipMove,          280, 235,  100,  55,  50, {fill:'#fff', weight:'700', center:true}));
    svg.push(boxText(state.flagshipCapacity,      390, 235,  100,  55,  50, {fill:'#fff', weight:'700', center:true}));

    // Quote block — right side below race artwork
    svg.push(boxText(state.factionQuote,         1630, 170,  450,  80,  16, {fill:'#ccc', weight:'400', body:true, italic:true, center:true}));
    svg.push(boxText(state.factionQuoter,        1630, 255,  450,  25,  16, {fill:'#aaa', weight:'400', body:true, center:true}));

    // Abilities — right panel
    svg.push(boxText(state.factionAbility1Title, 1600, 350,  500,  30,  20, {fill:'#fff', weight:'700'}));
    svg.push(boxText(state.factionAbility1,      1600, 385,  500, 200,  15, {fill:'#ddd', weight:'400', body:true}));
    svg.push(boxText(state.factionAbility2Title, 1600, 600,  500,  30,  20, {fill:'#fff', weight:'700'}));
    svg.push(boxText(state.factionAbility2,      1600, 635,  500, 150,  15, {fill:'#ddd', weight:'400', body:true}));
    if (state.factionAbility3Title || state.factionAbility3) {
      svg.push(boxText(state.factionAbility3Title, 1600, 800, 500,  30,  20, {fill:'#fff', weight:'700'}));
      svg.push(boxText(state.factionAbility3,      1600, 835, 500, 120,  15, {fill:'#ddd', weight:'400', body:true}));
    }

    // Commodities — bottom-right
    svg.push(boxText(state.factionCommodities,   2060, 730,   80,  65,  52, {fill:'#fff', weight:'700', center:true}));

    svg.push('</svg>');
    return svg.join('\n');
  }

  function generateLeaderCard(label, name, ability, imgBase) {
    var svg = [];
    svg.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + LEADER_W + '" height="' + LEADER_H + '" viewBox="0 0 ' + LEADER_W + ' ' + LEADER_H + '">');
    svg.push('<image href="' + imgBase + 'TI4-Leader-Blank.png" width="' + LEADER_W + '" height="' + LEADER_H + '"/>');

    svg.push(boxText(name,    285,  50, 430,  35, 26, {fill:'#fff',    weight:'700'}));
    svg.push(boxText(label,   285,  85, 430,  22, 16, {fill:'#00f6b1', weight:'600'}));
    svg.push(boxText(ability, 285, 120, 420, 340, 16, {fill:'#ddd', weight:'400', body:true}));

    svg.push('</svg>');
    return svg.join('\n');
  }

  function generateTechCard(name, ability, label, req1, req2, req3, imgBase) {
    var svg = [];
    svg.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + TECH_W + '" height="' + TECH_H + '" viewBox="0 0 ' + TECH_W + ' ' + TECH_H + '">');
    svg.push('<image href="' + imgBase + 'TI4-Technology-Blank.png" width="' + TECH_W + '" height="' + TECH_H + '"/>');

    svg.push(boxText(name || label, 100,  30, 560,  45, 30, {fill:'#fff', weight:'700'}));
    svg.push(boxText(ability,        85, 150, 580, 280, 24, {fill:'#ddd', weight:'400', body:true}));

    // Req pips — stacked vertically on left edge
    var reqColors = {r:'#d11a1a', g:'#3a9928', y:'#e6c020', b:'#0c4f8d'};
    var ry = 357;
    [req1, req2, req3].forEach(function(r) {
      if (r && reqColors[r]) {
        svg.push('<circle cx="45" cy="' + ry + '" r="14" fill="' + reqColors[r] + '"/>');
        ry += 30;
      }
    });

    svg.push('</svg>');
    return svg.join('\n');
  }

  function generateMechCard(name, ability, imgBase) {
    var svg = [];
    svg.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + MECH_W + '" height="' + MECH_H + '" viewBox="0 0 ' + MECH_W + ' ' + MECH_H + '">');
    svg.push('<image href="' + imgBase + 'TI4-Mech-Blank.png" width="' + MECH_W + '" height="' + MECH_H + '"/>');

    svg.push(boxText(name,    285,  50, 430,  55, 26, {fill:'#fff',      weight:'700'}));
    svg.push(boxText(ability, 285, 120, 420, 340, 16, {fill:'#ddd', weight:'400', body:true}));

    svg.push('</svg>');
    return svg.join('\n');
  }

  function generateNoteCard(name, ability, imgBase) {
    var svg = [];
    svg.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + NOTE_W + '" height="' + NOTE_H + '" viewBox="0 0 ' + NOTE_W + ' ' + NOTE_H + '">');
    svg.push('<image href="' + imgBase + 'TI4-Note-Blank.png" width="' + NOTE_W + '" height="' + NOTE_H + '"/>');

    svg.push(boxText(name,    50,  20, 400,  45, 28, {fill:'#fff', weight:'700'}));
    svg.push(boxText(ability, 65, 250, 370, 380, 17, {fill:'#ddd', weight:'400', body:true}));

    svg.push('</svg>');
    return svg.join('\n');
  }

  function generateAll(state, imgBase) {
    imgBase = imgBase || '';
    return [
      {type: 'faction',   svg: generateFactionSheet(state, imgBase)},
      {type: 'agent',     svg: generateLeaderCard('Agent',     state.agentName,     state.agentAbility,     imgBase)},
      {type: 'commander', svg: generateLeaderCard('Commander', state.commanderName, state.commanderAbility, imgBase)},
      {type: 'hero',      svg: generateLeaderCard('Hero',      state.heroName,      state.heroAbility,      imgBase)},
      {type: 'tech1',     svg: generateTechCard(state.tech1Name, state.tech1Ability, 'Tech #1', state.tech1Req1, state.tech1Req2, state.tech1Req3, imgBase)},
      {type: 'tech2',     svg: generateTechCard(state.tech2Name, state.tech2Ability, 'Tech #2', state.tech2Req1, state.tech2Req2, state.tech2Req3, imgBase)},
      {type: 'mech',      svg: generateMechCard(state.mechName,  state.mechAbility,  imgBase)},
      {type: 'note',      svg: generateNoteCard(state.noteName,  state.noteAbility,  imgBase)}
    ];
  }

  exports.generateFactionSheet = generateFactionSheet;
  exports.generateLeaderCard = generateLeaderCard;
  exports.generateTechCard = generateTechCard;
  exports.generateMechCard = generateMechCard;
  exports.generateNoteCard = generateNoteCard;
  exports.generateAll = generateAll;

})(typeof module !== 'undefined' ? module.exports : (window.FactionSVG = {}));
