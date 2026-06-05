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

  // Channels as cards in 2-col grid
  var CHANNELS = [
    { name: 'viticulture', desc: 'Strategy wine-making and worker placement discussion', cat: 'boardgames' },
    { name: 'twilight', desc: 'Twilight Imperium strategy, session reports, and Hyper Imperium playtesting', cat: 'boardgames' },
    { name: 'catan', desc: 'Catan mods, hex variants, and Nukes conversion guides', cat: 'boardgames' },
    { name: 'monopoly', desc: 'Econopoly playtesting, house rules, and economic fixes', cat: 'boardgames' },
    { name: 'print-n-play', desc: 'PnP builds, card stock selection, and DIY production tips', cat: 'boardgames' },
    { name: 'design', desc: 'Game design theory, prototyping, and mechanics discussion', cat: 'community' },
    { name: 'showcase', desc: 'Share your artwork, mod concepts, and board designs', cat: 'community' },
    { name: 'playtesting', desc: 'Find testers, offer feedback, and report session results', cat: 'community' },
    { name: 'online', desc: 'Online games: nukes.moddable.games, chess, and open-source titles', cat: 'community' },
    { name: 'events-uk', desc: 'UK meetups, conventions, and game nights', cat: 'events' },
    { name: 'events-usa', desc: 'US meetups, conventions, and community gatherings', cat: 'events' },
    { name: 'events-malaysia', desc: 'Malaysia meetups, cafes, and weekly game nights', cat: 'events' }
  ];

  var cl = document.getElementById('channels-list');
  cl.className = 'channels-grid';
  CHANNELS.forEach(function(ch) {
    var card = el('div', {class: 'channel-card channel-card--' + ch.cat});
    var icon = el('div', {class: 'channel-card__icon channel-card__icon--' + ch.cat}, '#');
    card.appendChild(icon);
    var txt = el('div', {class: 'channel-card__text'});
    txt.appendChild(el('div', {class: 'channel-card__name'}, ch.name));
    txt.appendChild(el('div', {class: 'channel-card__desc'}, ch.desc));
    txt.appendChild(el('div', {class: 'channel-card__category'}, ch.cat));
    card.appendChild(txt);
    cl.appendChild(card);
  });

  // Featured resources shared in channels
  var FEATURED = [
    { type: 'video', title: 'Behind the scenes: card game production', user: 'djkaspa', source: 'YouTube', url: 'https://www.youtube.com/watch?v=joMpOOZAz9c', videoId: 'joMpOOZAz9c' },
    { type: 'link', title: 'Deciding card stock for your games', user: 'darktalon8', source: 'Article', url: 'https://www.qpmarketnetwork.com/card-design', thumb: null },
    { type: 'link', title: 'Simple card maker with free tier', user: 'darktalon8', source: 'Tool', url: 'https://www.dextrous.com.au/', thumb: null }
  ];

  var fg = document.getElementById('featured-grid');
  FEATURED.forEach(function(f) {
    var card = el('div', {class: 'featured-card'});
    var thumb = el('div', {class: 'featured-card__thumb'});
    if (f.type === 'video') {
      thumb.style.backgroundImage = 'url(https://img.youtube.com/vi/' + f.videoId + '/hqdefault.jpg)';
      thumb.style.backgroundSize = 'cover';
      thumb.style.backgroundPosition = 'center';
      var playBtn = el('div', {class: 'featured-card__play'});
      thumb.appendChild(playBtn);
      thumb.addEventListener('click', function() {
        var iframe = document.createElement('iframe');
        iframe.src = 'https://www.youtube-nocookie.com/embed/' + f.videoId + '?autoplay=1&rel=0';
        iframe.setAttribute('allow', 'autoplay; encrypted-media');
        iframe.setAttribute('allowfullscreen', '');
        iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;';
        thumb.innerHTML = '';
        thumb.style.position = 'relative';
        thumb.appendChild(iframe);
      });
    } else {
      var gradients = { 'Article': 'linear-gradient(135deg, #0c4f8d 0%, #0a0d2a 100%)', 'Tool': 'linear-gradient(135deg, #3a9928 0%, #0a0d2a 100%)' };
      thumb.style.background = gradients[f.source] || 'linear-gradient(135deg, #0a0d2a 0%, #1a3680 100%)';
      thumb.appendChild(MG.cubeSVG(64));
    }
    card.appendChild(thumb);
    var body = el('div', {class: 'featured-card__body'});
    body.appendChild(el('div', {class: 'featured-card__source'}, f.source));
    var titleLink = el('a', {class: 'featured-card__title', href: f.url, target: '_blank', rel: 'noopener'}, f.title);
    body.appendChild(titleLink);
    body.appendChild(el('div', {class: 'featured-card__user'}, 'Shared by ' + f.user));
    card.appendChild(body);
    fg.appendChild(card);
  });

  // Activity feed
  var ACTIVITY = [
    { channel: '#design', user: 'djkaspa', avatar: 'https://cdn.discordapp.com/avatars/1059998798027444304/41d74062e4ad48206877b2aaba7a640e.png?size=64', msg: 'Nice BTS video on card game production workflows', date: 'May 22' },
    { channel: '#design', user: 'darktalon8', avatar: 'https://cdn.discordapp.com/avatars/433932623941730304/fbd8e6a47ac0580e0af2cf3b7d896dd9.png?size=64', msg: 'Great article on deciding card stock for your games', date: 'May 20' },
    { channel: '#design', user: 'darktalon8', avatar: 'https://cdn.discordapp.com/avatars/433932623941730304/fbd8e6a47ac0580e0af2cf3b7d896dd9.png?size=64', msg: 'Simple card maker with a free layer to test it out', date: 'May 11' },
    { channel: '#general', user: 'arjitraj_', avatar: 'https://cdn.discordapp.com/avatars/190300566046507018/4eb2498fe54b8bb8c23f7948b183ec5b.png?size=64', msg: 'Thanks Kevin for the invite.', date: 'Jun 3' },
    { channel: '#print-n-play', user: 'reshwindblade', avatar: 'https://cdn.discordapp.com/avatars/243395223898554368/14332d7f98baf422e6c2bc3d67bdedfc.png?size=64', msg: 'First prototype printed — card alignment is tricky', date: 'Jun 1' },
    { channel: '#monopoly', user: 'wundercover', avatar: 'https://cdn.discordapp.com/avatars/113239562452541440/135bed57657861016f475a42771de44f.png?size=64', msg: 'Econopoly v1.4 playtest report — variable objectives feel great', date: 'May 8' }
  ];

  var al = document.getElementById('activity-list');
  al.className = 'activity-feed';
  ACTIVITY.forEach(function(a) {
    var row = el('div', {class: 'activity-item'});
    var avatarEl = el('img', {class: 'activity-item__avatar', src: a.avatar, alt: a.user});
    row.appendChild(avatarEl);
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

  // Members — sorted by most recently active, top 10
  var MEMBERS = [
    { display: 'Darktalon', avatar: 'https://cdn.discordapp.com/avatars/433932623941730304/fbd8e6a47ac0580e0af2cf3b7d896dd9.png?size=128', role: 'management', msgs: 31, lastActive: 'Jun 5', lastMsg: 'New expansion from Stonemaier' },
    { display: 'Arjit', avatar: 'https://cdn.discordapp.com/avatars/190300566046507018/4eb2498fe54b8bb8c23f7948b183ec5b.png?size=128', role: 'member', msgs: 1, lastActive: 'Jun 3', lastMsg: 'Thanks Kevin for the invite.' },
    { display: 'djkaspa', avatar: 'https://cdn.discordapp.com/avatars/1059998798027444304/41d74062e4ad48206877b2aaba7a640e.png?size=128', role: 'management', msgs: 16, lastActive: 'May 22', lastMsg: 'Nice BTS video on card game production' },
    { display: 'GunslingerSteve', avatar: 'https://cdn.discordapp.com/avatars/797065987677618196/f2b88a6fd4a448ab2ec98cdeecba9aef.png?size=128', role: 'member', msgs: 0, lastActive: 'May 22', lastMsg: '' },
    { display: 'akmalfikri', avatar: 'https://cdn.discordapp.com/avatars/316810906619346946/a26197f40c12e5cca4c0104413374181.png?size=128', role: 'management', msgs: 1, lastActive: 'Oct 22', lastMsg: 'welcome Joe' },
    { display: 'Wunder', avatar: 'https://cdn.discordapp.com/avatars/113239562452541440/135bed57657861016f475a42771de44f.png?size=128', role: 'member', msgs: 1, lastActive: 'Oct 19', lastMsg: 'Hi from the ara group' },
    { display: 'KimLime', avatar: 'https://cdn.discordapp.com/avatars/157827693553909760/0ba5735ab85051fce0f0456fda7dc468.png?size=128', role: 'member', msgs: 0, lastActive: 'Nov 2025', lastMsg: '' },
    { display: 'Resh', avatar: 'https://cdn.discordapp.com/avatars/243395223898554368/14332d7f98baf422e6c2bc3d67bdedfc.png?size=128', role: 'member', msgs: 0, lastActive: 'Apr 2026', lastMsg: '' },
    { display: 'Ms. Terri', avatar: 'https://cdn.discordapp.com/avatars/553968271687417856/3c4b1ce7fe0514ec7246b14b46e50c7c.png?size=128', role: 'member', msgs: 0, lastActive: 'Apr 2026', lastMsg: '' },
    { display: 'Arzyy', avatar: 'https://cdn.discordapp.com/avatars/157625204317749259/7779d338200515f7a75de88fd9ffa272.png?size=128', role: 'member', msgs: 0, lastActive: 'Feb 2026', lastMsg: '' }
  ];

  var mr = document.getElementById('members-grid');
  MEMBERS.forEach(function(m) {
    var card = el('div', {class: 'member-card'});
    card.appendChild(el('img', {class: 'member-card__avatar', src: m.avatar, alt: m.display}));
    var info = el('div', {class: 'member-card__info'});
    info.appendChild(el('div', {class: 'member-card__name'}, m.display));
    var meta = el('div', {class: 'member-card__meta'});
    var roleEl = el('span', {class: 'member-card__role member-card__role--' + m.role});
    roleEl.textContent = m.role === 'management' ? 'Management' : 'Member';
    meta.appendChild(roleEl);
    if (m.msgs > 0) meta.appendChild(el('span', {class: 'member-card__stat'}, m.msgs + ' posts'));
    meta.appendChild(el('span', {class: 'member-card__stat'}, 'Active ' + m.lastActive));
    info.appendChild(meta);
    if (m.lastMsg) info.appendChild(el('div', {class: 'member-card__msg'}, '"' + m.lastMsg + '"'));
    card.appendChild(info);
    mr.appendChild(card);
  });

  var cb = document.getElementById('cta-btns');
  cb.appendChild(linkBtn('Join Discord', 'https://discord.gg/moddable', 'primary'));
  cb.appendChild(linkBtn('Submit Mod', '/submit/', 'outline-dark'));
})();
