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
    { category: 'Boardgames', slug: 'boardgames', channels: [
      { name: 'viticulture', desc: 'Strategy wine-making and worker placement' },
      { name: 'twilight', desc: 'Twilight Imperium strategy and sessions' },
      { name: 'catan', desc: 'Catan mods, variants, and hex experiments' },
      { name: 'monopoly', desc: 'Econopoly playtesting and Monopoly fixes' },
      { name: 'print-n-play', desc: 'PnP builds, card stock, and DIY production' }
    ]},
    { category: 'Community', slug: 'community', channels: [
      { name: 'design', desc: 'Game design discussion and prototyping' },
      { name: 'showcase', desc: 'Share artwork, designs, or ideas' },
      { name: 'playtesting', desc: 'Looking for testers, finding testers' },
      { name: 'online', desc: 'Online games: ours and open-source titles' }
    ]},
    { category: 'Events', slug: 'events', channels: [
      { name: 'events-uk', desc: 'UK meetups and conventions' },
      { name: 'events-usa', desc: 'US meetups and conventions' },
      { name: 'events-malaysia', desc: 'Malaysia meetups and game nights' }
    ]}
  ];

  var cl = document.getElementById('channels-list');
  cl.className = 'channels-grid';
  CHANNELS.forEach(function(cat) {
    var card = el('div', {class: 'channel-category channel-category--' + cat.slug});
    var header = el('div', {class: 'channel-category__header'});
    header.appendChild(el('div', {class: 'channel-category__name'}, cat.category));
    header.appendChild(el('div', {class: 'channel-category__count'}, cat.channels.length + ' channels'));
    card.appendChild(header);
    var list = el('div', {class: 'channel-category__list'});
    cat.channels.forEach(function(ch) {
      var row = el('div', {class: 'channel-link'});
      row.appendChild(el('span', {class: 'channel-link__hash'}, '#'));
      var txt = el('div', {class: 'channel-link__text'});
      txt.appendChild(el('div', {class: 'channel-link__name'}, ch.name));
      txt.appendChild(el('div', {class: 'channel-link__desc'}, ch.desc));
      row.appendChild(txt);
      list.appendChild(row);
    });
    card.appendChild(list);
    cl.appendChild(card);
  });

  var ACTIVITY = [
    { channel: '#design', user: 'djkaspa', initial: 'DJ', msg: 'Nice BTS video on card game production workflows', date: 'May 22' },
    { channel: '#design', user: 'darktalon8', initial: 'DT', msg: 'Great article on deciding card stock for your games', date: 'May 20' },
    { channel: '#design', user: 'darktalon8', initial: 'DT', msg: 'Simple card maker with a free layer to test it out', date: 'May 11' },
    { channel: '#general', user: 'arjitraj_', initial: 'AR', msg: 'Thanks Kevin for the invite.', date: 'Jun 3' },
    { channel: '#print-n-play', user: 'reshwindblade', initial: 'RB', msg: 'First prototype printed — card alignment is tricky', date: 'Jun 1' }
  ];

  var al = document.getElementById('activity-list');
  al.className = 'activity-feed';
  ACTIVITY.forEach(function(a) {
    var row = el('div', {class: 'activity-item'});
    row.appendChild(el('div', {class: 'activity-item__avatar'}, a.initial));
    var content = el('div', {class: 'activity-item__content'});
    var header = el('div', {class: 'activity-item__header'});
    header.appendChild(el('span', {class: 'activity-item__user'}, a.user));
    header.appendChild(el('span', {class: 'activity-item__channel'}, a.channel));
    header.appendChild(el('span', {class: 'activity-item__date'}, a.date));
    content.appendChild(header);
    content.appendChild(el('div', {class: 'activity-item__body'}, a.msg));
    row.appendChild(content);
    al.appendChild(row);
  });

  var cb = document.getElementById('cta-btns');
  cb.appendChild(linkBtn('Join Discord', 'https://discord.gg/moddable', 'primary'));
  cb.appendChild(linkBtn('Submit Mod', '/submit/', 'outline-dark'));
})();
