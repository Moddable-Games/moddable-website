const puppeteer = require('puppeteer');
const path = require('path');

const URL = 'http://localhost/MODDABLE/moddable-website/tools/ti/factions/?factionName=The+Xxcha+Kingdom&factionQuote=In+patience+lies+the+power+to+outlast+all+who+would+oppose+us.&factionQuoter=Xxekir+Grom&factionAbility1Title=Peace+Accords&factionAbility1=After+an+agenda+is+revealed%2C+you+may+spend+1+influence+to+discard+that+agenda+and+reveal+a+new+one+from+the+top+of+the+deck.&factionAbility2Title=Quash&factionAbility2=When+a+player+would+resolve+a+political+action+card%2C+you+may+spend+3+influence+to+cancel+that+card.&factionAbility3Title=Instinct&factionAbility3=You+may+exhaust+your+planets+to+cancel+hits+during+space+combat.&factionCommodities=4&factionResources=3&factionInfluence=5&flagshipName=Loncara+Ssodu&flagshipTitle=Sustain+Damage&flagshipAbility=This+ship+can+use+its+Sustain+Damage+ability+to+cancel+a+hit+during+Space+Cannon.&flagshipCost=8&flagshipCombat=7X2&flagshipMove=1&flagshipCapacity=3&agentName=Ggrocuto+Ransen&agentAbility=When+a+player+would+cast+votes%3A+You+may+exhaust+this+card+to+allow+that+player+to+cast+3+additional+votes.&commanderName=Elder+Qanoj&commanderAbility=At+the+start+of+each+agenda+phase%2C+you+may+look+at+the+top+card+of+the+agenda+deck.&heroName=Xxekir+Grom&heroAbility=ACTION%3A+For+each+planet+you+control%2C+choose+1+technology+on+a+command+sheet+in+that+planets+system.+That+player+loses+that+technology.&tech1Name=Instinct+Training&tech1Ability=You+may+exhaust+this+card+and+1+planet+you+control+when+another+player+activates+a+system+that+contains+1+or+more+of+your+ships.&tech1Req1=g&tech1Req2=g&tech2Name=Nullification+Field&tech2Ability=After+another+player+activates+a+system+that+contains+1+or+more+of+your+ships%2C+you+may+spend+2+influence+to+place+1+command+token+from+that+players+reinforcements.&tech2Req1=y&tech2Req2=y&mechName=Indomitus&mechAbility=During+combat+in+a+system+that+contains+this+unit%2C+hits+cannot+be+produced+against+your+flagship+or+your+dreadnoughts.&mechKeywords=Sustain+Damage&mechCost=2&mechCombat=6&noteName=Elder+Council&noteAbility=The+Xxcha+Kingdom+places+great+value+on+diplomacy+and+patience.+Their+councillors+serve+for+centuries%2C+accumulating+wisdom+that+other+civilisations+can+only+dream+of.';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1200 });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.fc-sheet');
  const sheet = await page.$('.fc-sheet');
  await sheet.screenshot({ path: '/tmp/faction-sheet.png' });
  const editor = await page.$('.fd-editor');
  await editor.screenshot({ path: '/tmp/faction-editor.png' });
  await page.screenshot({ path: '/tmp/faction-debug.png', fullPage: true });
  await browser.close();
  console.log('Screenshot saved to /tmp/faction-debug.png');
})();
