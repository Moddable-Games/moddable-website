const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost/MODDABLE/moddable-website/tools/ti/factions/';
const OUT_DIR = '/tmp/ti4-export';
const DPI = 300;
const CARD_W_MM = 88;
const CARD_H_MM = 63.5;
const CARD_W_PX = Math.round(CARD_W_MM / 25.4 * DPI); // 1039px
const CARD_H_PX = Math.round(CARD_H_MM / 25.4 * DPI); // 750px
const NOTE_W_PX = CARD_H_PX; // 750px (portrait width = landscape height)
const NOTE_H_PX = CARD_W_PX; // 1039px (portrait height = landscape width)

// Faction sheet: A4 landscape full bleed (297mm x 210mm) at 300dpi
const SHEET_W_PX = Math.round(297 / 25.4 * DPI); // 3508px
const SHEET_H_PX = Math.round(210 / 25.4 * DPI); // 2480px

const params = process.argv[2] || 'factionName=The+Xxcha+Kingdom&factionQuote=In+patience+lies+the+power+to+outlast+all+who+would+oppose+us.&factionQuoter=Xxekir+Grom&factionAbility1Title=Peace+Accords&factionAbility1=After+an+agenda+is+revealed%2C+you+may+spend+1+influence+to+discard+that+agenda+and+reveal+a+new+one+from+the+top+of+the+deck.&factionAbility2Title=Quash&factionAbility2=When+a+player+would+resolve+a+political+action+card%2C+you+may+spend+3+influence+to+cancel+that+card.&factionAbility3Title=Instinct&factionAbility3=You+may+exhaust+your+planets+to+cancel+hits+during+space+combat.&factionCommodities=4&factionResources=3&factionInfluence=5&flagshipName=Loncara+Ssodu&flagshipTitle=Sustain+Damage&flagshipAbility=This+ship+can+use+its+Sustain+Damage+ability+to+cancel+a+hit+during+Space+Cannon.&flagshipCost=8&flagshipCombat=7X2&flagshipMove=1&flagshipCapacity=3&agentName=Ggrocuto+Ransen&agentAbility=When+a+player+would+cast+votes%3A+You+may+exhaust+this+card+to+allow+that+player+to+cast+3+additional+votes.&commanderName=Elder+Qanoj&commanderAbility=At+the+start+of+each+agenda+phase%2C+you+may+look+at+the+top+card+of+the+agenda+deck.&heroName=Xxekir+Grom&heroAbility=ACTION%3A+For+each+planet+you+control%2C+choose+1+technology+on+a+command+sheet+in+that+planets+system.+That+player+loses+that+technology.&tech1Name=Instinct+Training&tech1Ability=You+may+exhaust+this+card+and+1+planet+you+control+when+another+player+activates+a+system+that+contains+1+or+more+of+your+ships.&tech1Req1=g&tech1Req2=g&tech1Req3=&tech2Name=Nullification+Field&tech2Ability=After+another+player+activates+a+system+that+contains+1+or+more+of+your+ships%2C+you+may+spend+2+influence+to+place+1+command+token+from+that+players+reinforcements.&tech2Req1=y&tech2Req2=y&tech2Req3=&mechName=Indomitus&mechAbility=During+combat+in+a+system+that+contains+this+unit%2C+hits+cannot+be+produced+against+your+flagship+or+your+dreadnoughts.&noteName=Elder+Council&noteAbility=The+Xxcha+Kingdom+places+great+value+on+diplomacy+and+patience.';

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Large viewport to fit all cards at print resolution
  await page.setViewport({ width: SHEET_W_PX + 100, height: 6000, deviceScaleFactor: 1 });

  const url = BASE_URL + '?' + params;
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.fc-sheet');

  // Override to print dimensions
  await page.addStyleTag({
    content: `
      :root { --fc-card-w: ${CARD_W_PX}px; --fc-card-h: ${CARD_H_PX}px; }
      .fd-editor, #nav-root, #footer-root { display: none !important; }
      .fd-app { display: block !important; grid-template-columns: 1fr !important; }
      .fd-preview { padding: 20px !important; }
      .fd-preview__inner { max-width: none !important; gap: 40px; }
      .fc-sheet { width: ${SHEET_W_PX}px !important; }
    `
  });

  await new Promise(r => setTimeout(r, 500));

  // Export faction sheet
  const sheet = await page.$('.fc-sheet');
  if (sheet) {
    await sheet.screenshot({ path: path.join(OUT_DIR, '01-faction-sheet.png') });
    console.log('Exported: 01-faction-sheet.png');
  }

  // Export leader cards
  const leaders = await page.$$('.fc-leader');
  const leaderNames = ['agent', 'commander', 'hero'];
  for (let i = 0; i < leaders.length; i++) {
    const fname = `02-leader-${leaderNames[i]}.png`;
    await leaders[i].screenshot({ path: path.join(OUT_DIR, fname) });
    console.log('Exported: ' + fname);
  }

  // Export note card
  const note = await page.$('.fc-note');
  if (note) {
    await note.screenshot({ path: path.join(OUT_DIR, '03-promissory-note.png') });
    console.log('Exported: 03-promissory-note.png');
  }

  // Export tech cards
  const techs = await page.$$('.fc-tech');
  for (let i = 0; i < techs.length; i++) {
    const fname = `04-tech-${i + 1}.png`;
    await techs[i].screenshot({ path: path.join(OUT_DIR, fname) });
    console.log('Exported: ' + fname);
  }

  // Export mech
  const mech = await page.$('.fc-mech');
  if (mech) {
    await mech.screenshot({ path: path.join(OUT_DIR, '05-mech.png') });
    console.log('Exported: 05-mech.png');
  }

  // Generate PDF with all cards on print-ready pages
  // A4 landscape can fit the faction sheet; individual cards on a second page
  const pdfPage = await browser.newPage();
  await pdfPage.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @page { size: A3 landscape; margin: 10mm; }
        body { margin: 0; font-family: sans-serif; }
        .page { page-break-after: always; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .page:last-child { page-break-after: auto; }
        img { max-width: 100%; height: auto; }
        .cards-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4mm; }
        .cards-grid img { width: 88mm; height: auto; }
        .cards-grid .portrait { width: auto; height: 88mm; }
        h2 { font-size: 14px; margin: 4mm 0; color: #333; }
      </style>
    </head>
    <body>
      <div class="page">
        <h2>Faction Sheet</h2>
        <img src="file://${path.join(OUT_DIR, '01-faction-sheet.png')}">
      </div>
      <div class="page">
        <h2>Cards</h2>
        <div class="cards-grid">
          <img src="file://${path.join(OUT_DIR, '02-leader-agent.png')}">
          <img src="file://${path.join(OUT_DIR, '02-leader-commander.png')}">
          <img src="file://${path.join(OUT_DIR, '02-leader-hero.png')}">
          <img class="portrait" src="file://${path.join(OUT_DIR, '03-promissory-note.png')}">
          <img src="file://${path.join(OUT_DIR, '04-tech-1.png')}">
          <img src="file://${path.join(OUT_DIR, '04-tech-2.png')}">
          <img src="file://${path.join(OUT_DIR, '05-mech.png')}">
        </div>
      </div>
    </body>
    </html>
  `, { waitUntil: 'networkidle0' });

  await pdfPage.pdf({
    path: path.join(OUT_DIR, 'faction-print.pdf'),
    format: 'A3',
    landscape: true,
    printBackground: true,
    margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
  });
  console.log('Exported: faction-print.pdf');

  await browser.close();
  console.log('\nAll exports in: ' + OUT_DIR);
})();
