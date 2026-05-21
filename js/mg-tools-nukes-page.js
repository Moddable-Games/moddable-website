(function() {
const { T, el, btn, navbar, footer } = MG;
document.getElementById('nav-root').appendChild(navbar('Tools'));
document.getElementById('footer-root').appendChild(footer());

/* ── HEX TARGET PICKER ── */
const COLS = 9, ROWS = 5;
const hexes = [];
for (let r=0; r<ROWS; r++) {
  for (let c=0; c<COLS; c++) {
    hexes.push({ r, c, x: c*36 + (r%2)*18 + 25, y: r*31 + 22, id:`${r}-${c}` });
  }
}
const strikes = new Set();

function isFallout(h) {
  return [...strikes].some(id => {
    const [sr,sc] = id.split('-').map(Number);
    return (Math.abs(sr-h.r)+Math.abs(sc-h.c))===1;
  });
}

function renderHexMap() {
  const svg = document.getElementById('hex-svg');
  svg.innerHTML = '';
  const ns = 'http://www.w3.org/2000/svg';
  hexes.forEach(h => {
    const struck = strikes.has(h.id);
    const fall = !struck && isFallout(h);
    const g = document.createElementNS(ns,'g');
    const poly = document.createElementNS(ns,'polygon');
    poly.setAttribute('transform',`translate(${h.x},${h.y})`);
    poly.setAttribute('points','0,-16 14,-8 14,8 0,16 -14,8 -14,-8');
    poly.setAttribute('fill', struck?'#d11a1a': fall?'#7a3a18':'rgba(255,255,255,0.06)');
    poly.setAttribute('stroke', struck?'#e63232':'rgba(255,255,255,0.25)');
    poly.setAttribute('stroke-width', struck?'2':'1');
    g.appendChild(poly);
    if (struck) {
      const t = document.createElementNS(ns,'text');
      t.setAttribute('x',h.x); t.setAttribute('y',h.y+5);
      t.setAttribute('font-size','14'); t.setAttribute('fill','#fff');
      t.setAttribute('text-anchor','middle'); t.setAttribute('pointer-events','none');
      t.textContent='☢'; g.appendChild(t);
    }
    if (fall) {
      const c2 = document.createElementNS(ns,'circle');
      c2.setAttribute('cx',h.x); c2.setAttribute('cy',h.y);
      c2.setAttribute('r','4'); c2.setAttribute('fill','#e89a1a');
      c2.setAttribute('pointer-events','none'); g.appendChild(c2);
    }
    g.addEventListener('click',()=>{
      if (!strikes.has(h.id)) { strikes.add(h.id); renderHexMap(); updateCount(); }
    });
    svg.appendChild(g);
  });
}

function updateCount() {
  const fallCount = hexes.filter(h => !strikes.has(h.id) && isFallout(h)).length;
  document.getElementById('strike-count').innerHTML = `Strikes: <strong class="nukes-card__eyebrow--red">${strikes.size}</strong> · Fallout hexes: <strong>${fallCount}</strong>`;
}

document.getElementById('clear-btn').appendChild(btn('Clear board','outline-dark',()=>{ strikes.clear(); renderHexMap(); updateCount(); }));
renderHexMap();

/* ── FALLOUT TRACKER ── */
let zones = [
  { name:'Sector 4-Charlie', turns:3, severity:3 },
  { name:'Sector 7-Foxtrot', turns:2, severity:2 },
  { name:'Ore Mountains', turns:1, severity:1 },
];
const SEV_COLORS = ['#3a9928','#e89a1a','#d11a1a'];
const SEV_LABELS = ['Light','Moderate','Heavy'];

function renderFallout() {
  const list = document.getElementById('fallout-list');
  list.innerHTML = '';
  zones.forEach((z,i) => {
    const row = el('div',{class:'fallout-row'});
    row.style.borderLeft = `4px solid ${SEV_COLORS[z.severity-1]}`;
    const info = el('div');
    info.appendChild(el('div',{class:'fallout-row__name'},z.name));
    info.appendChild(el('div',{class:'fallout-row__meta'},`${SEV_LABELS[z.severity-1]} fallout · ${z.turns} turn${z.turns===1?'':'s'} remaining`));
    row.appendChild(info);
    const advBtn = document.createElement('button');
    advBtn.textContent='Next turn';
    advBtn.className='fallout-row__advance';
    advBtn.addEventListener('click',()=>{ zones[i].turns=Math.max(0,zones[i].turns-1); if(zones[i].turns===0) zones.splice(i,1); renderFallout(); });
    const rmBtn = document.createElement('button');
    rmBtn.textContent='✕';
    rmBtn.className='fallout-row__remove';
    rmBtn.addEventListener('click',()=>{ zones.splice(i,1); renderFallout(); });
    row.appendChild(advBtn); row.appendChild(rmBtn); list.appendChild(row);
  });
  if (zones.length===0) {
    list.appendChild(el('div',{class:'fallout-empty'},'No active fallout zones.'));
  }
}

const fb = document.getElementById('fallout-btns');
fb.appendChild(btn('Add zone','dark',()=>{
  const name = prompt('Zone name:','Sector '+(zones.length+1));
  if (name) { zones.push({name,turns:3,severity:2}); renderFallout(); }
}));
fb.appendChild(btn('Advance all turns','outline-dark',()=>{
  zones = zones.map(z=>({...z,turns:z.turns-1})).filter(z=>z.turns>0); renderFallout();
}));
renderFallout();

/* ── RESOURCE TABLE ── */
const RESOURCES = [
  ['Original','Nuke Catan','Notes'],
  ['Sheep','Scrap','Extinct post-event'],
  ['Wheat','Rations','Rationed per turn'],
  ['Wool','Salvage','Pulled from ruins'],
  ['Ore','Ore','Unchanged — still mined'],
  ['Brick','Currency','Now literal currency'],
  ['Wood','Timber','Pre-war stockpile only'],
];
const rt = document.getElementById('resource-table');
RESOURCES.forEach((row,ri) => {
  row.forEach((cell,ci) => {
    let cls = 'resource-cell';
    if (ri===0) cls += ' resource-cell--header';
    else if (ci===1) cls += ' resource-cell--nuke-name';
    else cls += ' resource-cell--body';
    const d = el('div',{class:cls},cell);
    rt.appendChild(d);
  });
});
})();
