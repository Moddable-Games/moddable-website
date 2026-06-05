(function() {
  var el = MG.el;
  var linkBtn = MG.linkBtn;

  document.getElementById('nav-root').appendChild(MG.navbar('About'));
  document.getElementById('footer-root').appendChild(MG.footer());
  document.getElementById('page-hero').appendChild(MG.sectionHero({
    section: 'community',
    tier: 2,
    hexColor: 'blue',
    eyebrow: 'COMMUNITY',
    title: 'Ground floor.',
    lede: 'Designers, playtesters, and rule-tinkerers building open-source board games together.'
  }));

  var CHANNELS = [
    { category: 'Boardgames', channels: [
      { name: 'viticulture', desc: 'Strategy wine-making and worker placement' },
      { name: 'twilight', desc: 'Twilight Imperium strategy and session reports' },
      { name: 'catan', desc: 'Catan mods, variants, and hex experiments' },
      { name: 'monopoly', desc: 'Econopoly playtesting and Monopoly fixes' },
      { name: 'print-n-play', desc: 'PnP builds, card stock tips, and DIY production' }
    ]},
    { category: 'Community', channels: [
      { name: 'design', desc: 'Game design discussion and prototyping', topic: true },
      { name: 'showcase', desc: 'Share your artwork, designs, or ideas', topic: true },
      { name: 'playtesting', desc: 'Looking for testers, finding testers' },
      { name: 'online', desc: 'Online games: ours and other open-source titles' }
    ]},
    { category: 'Events', channels: [
      { name: 'events-uk', desc: 'UK meetups and conventions' },
      { name: 'events-usa', desc: 'US meetups and conventions' },
      { name: 'events-malaysia', desc: 'Malaysia meetups and game nights' }
    ]}
  ];

  var cl = document.getElementById('channels-list');
  CHANNELS.forEach(function(cat) {
    var catEl = el('div', {class: 'channel-category'});
    catEl.appendChild(el('div', {class: 'channel-category__name'}, cat.category));
    cat.channels.forEach(function(ch) {
      var row = el('div', {class: 'channel-link'});
      row.appendChild(el('div', {class: 'channel-link__name'}, '#' + ch.name));
      row.appendChild(el('div', {class: 'channel-link__desc'}, ch.desc));
      catEl.appendChild(row);
    });
    cl.appendChild(catEl);
  });

  var ACTIVITY = [
    { channel: '#design', user: 'djkaspa', msg: 'Nice BTS video on card game production workflows', date: 'May 22' },
    { channel: '#design', user: 'darktalon8', msg: 'Great article on deciding card stock for your games', date: 'May 20' },
    { channel: '#design', user: 'darktalon8', msg: 'Simple card maker with a free layer to test it out', date: 'May 11' },
    { channel: '#general', user: 'arjitraj_', msg: 'Thanks Kevin for the invite.', date: 'Jun 3' },
    { channel: '#print-n-play', user: 'reshwindblade', msg: 'First prototype printed — card alignment is tricky', date: 'Jun 1' }
  ];

  var al = document.getElementById('activity-list');
  ACTIVITY.forEach(function(a) {
    var row = el('div', {class: 'activity-item'});
    var meta = el('div', {class: 'activity-item__meta'});
    meta.appendChild(el('span', {class: 'activity-item__channel'}, a.channel));
    meta.appendChild(el('span', {class: 'activity-item__date'}, a.date));
    row.appendChild(meta);
    var body = el('div', {class: 'activity-item__body'});
    body.appendChild(el('strong', {}, a.user + ': '));
    body.appendChild(document.createTextNode(a.msg));
    row.appendChild(body);
    al.appendChild(row);
  });

  var cb = document.getElementById('cta-btns');
  cb.appendChild(linkBtn('Join Discord', 'https://discord.gg/moddable', 'primary'));
  cb.appendChild(linkBtn('Submit Mod', '/submit/', 'outline-dark'));
})();
