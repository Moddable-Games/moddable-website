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

  // Channels as pill groups
  var CHANNELS = [
    { label: 'Boardgames', slug: 'boardgames', names: ['viticulture','twilight','catan','monopoly','print-n-play'] },
    { label: 'Community', slug: 'community', names: ['design','showcase','playtesting','online'] },
    { label: 'Events', slug: 'events', names: ['events-uk','events-usa','events-malaysia'] }
  ];

  var cl = document.getElementById('channels-list');
  cl.className = 'channels-wrap';
  CHANNELS.forEach(function(cat) {
    var group = el('div', {class: 'channel-group'});
    group.appendChild(el('span', {class: 'channel-group__label channel-group__label--' + cat.slug}, cat.label));
    cat.names.forEach(function(name) {
      group.appendChild(el('span', {class: 'channel-pill'}, '#' + name));
    });
    cl.appendChild(group);
  });

  // Featured resources shared in channels
  var FEATURED = [
    { type: 'video', title: 'Behind the scenes: card game production', user: 'djkaspa', source: 'YouTube', url: 'https://www.youtube.com/watch?v=joMpOOZAz9c' },
    { type: 'link', title: 'Deciding card stock for your games', user: 'darktalon8', source: 'Article', url: 'https://www.qpmarketnetwork.com/card-design' },
    { type: 'link', title: 'Simple card maker with free tier', user: 'darktalon8', source: 'Tool', url: 'https://www.dextrous.com.au/' }
  ];

  var fg = document.getElementById('featured-grid');
  FEATURED.forEach(function(f) {
    var a = el('a', {class: 'featured-card', href: f.url, target: '_blank', rel: 'noopener'});
    var thumb = el('div', {class: 'featured-card__thumb'});
    if (f.type === 'video') {
      thumb.appendChild(el('div', {class: 'featured-card__play'}));
    }
    a.appendChild(thumb);
    var body = el('div', {class: 'featured-card__body'});
    body.appendChild(el('div', {class: 'featured-card__source'}, f.source));
    body.appendChild(el('div', {class: 'featured-card__title'}, f.title));
    body.appendChild(el('div', {class: 'featured-card__user'}, 'Shared by ' + f.user));
    a.appendChild(body);
    fg.appendChild(a);
  });

  // Activity feed
  var ACTIVITY = [
    { channel: '#design', user: 'djkaspa', initial: 'DJ', msg: 'Nice BTS video on card game production workflows', date: 'May 22' },
    { channel: '#design', user: 'darktalon8', initial: 'DT', msg: 'Great article on deciding card stock for your games', date: 'May 20' },
    { channel: '#design', user: 'darktalon8', initial: 'DT', msg: 'Simple card maker with a free layer to test it out', date: 'May 11' },
    { channel: '#general', user: 'arjitraj_', initial: 'AR', msg: 'Thanks Kevin for the invite.', date: 'Jun 3' },
    { channel: '#print-n-play', user: 'reshwindblade', initial: 'RB', msg: 'First prototype printed — card alignment is tricky', date: 'Jun 1' },
    { channel: '#monopoly', user: 'wundercover', initial: 'WC', msg: 'Econopoly v1.4 playtest report — variable objectives feel great', date: 'May 8' }
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

  // Members
  var MEMBERS = [
    { name: 'djkaspa', initial: 'DK', date: 'Oct 2025' },
    { name: 'darktalon8', initial: 'DT', date: 'Oct 2025' },
    { name: 'akmalfikri', initial: 'AF', date: 'Oct 2025' },
    { name: 'kimlime', initial: 'KL', date: 'Nov 2025' },
    { name: 'wundercover', initial: 'WC', date: 'Oct 2025' },
    { name: 'reshwindblade', initial: 'RB', date: 'Apr 2026' },
    { name: 'arzyyyy', initial: 'AZ', date: 'Feb 2026' },
    { name: 'gunslingersteve', initial: 'GS', date: 'May 2026' },
    { name: 'arjitraj_', initial: 'AR', date: 'Jun 2026' }
  ];

  var mr = document.getElementById('members-row');
  MEMBERS.forEach(function(m) {
    var badge = el('div', {class: 'member-badge'});
    badge.appendChild(el('div', {class: 'member-badge__avatar'}, m.initial));
    var info = el('div');
    info.appendChild(el('div', {class: 'member-badge__name'}, m.name));
    info.appendChild(el('div', {class: 'member-badge__date'}, 'Joined ' + m.date));
    badge.appendChild(info);
    mr.appendChild(badge);
  });

  var cb = document.getElementById('cta-btns');
  cb.appendChild(linkBtn('Join Discord', 'https://discord.gg/moddable', 'primary'));
  cb.appendChild(linkBtn('Submit Mod', '/submit/', 'outline-dark'));
})();
