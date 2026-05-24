(function() {
  const { el, navbar, footer, url, T } = MG;
  const container = document.getElementById('team-detail');
  const slug = container.getAttribute('data-member');

  document.getElementById('nav-root').appendChild(navbar('About'));
  document.getElementById('footer-root').appendChild(footer());

  Promise.all([MG.data.get('team'), MG.data.get('news')]).then(function([team, news]) {
    const member = team.find(m => m.slug === slug || m.handle === slug);
    if (!member) { container.textContent = 'Member not found.'; return; }

    const posts = news.filter(p => p.author === member.name);
    const teammates = team.filter(m => m.handle !== member.handle);

    // Hero
    const hero = el('section', {class: 'td-hero'});
    const glowClip = el('div', {class: 'td-hero__glow-clip'});
    const glow = el('div', {class: 'td-hero__glow'});
    glow.style.background = member.color;
    glowClip.appendChild(glow);
    hero.appendChild(glowClip);

    const inner = el('div', {class: 'td-hero__inner'});
    inner.appendChild(el('a', {href: url('/team/'), class: 'td-hero__back'}, '← Back to team'));

    const text = el('div', {class: 'td-hero__text'});
    text.appendChild(el('h1', {class: 'td-hero__name'}, member.name));
    text.appendChild(el('div', {class: 'td-hero__role'}, member.role));
    inner.appendChild(text);

    const avatar = el('div', {class: 'td-hero__avatar'});
    avatar.appendChild(el('img', {
      src: url('/assets/team/' + member.img),
      alt: member.name
    }));
    inner.appendChild(avatar);

    hero.appendChild(inner);
    container.appendChild(hero);

    // Body
    const body = el('div', {class: 'td-body'});
    const bodyInner = el('div', {class: 'td-body__inner'});

    // Bio
    bodyInner.appendChild(el('p', {class: 'td-bio'}, member.longBio || member.bio));

    // Authored posts
    if (posts.length > 0) {
      const postsSection = el('div', {class: 'td-posts'});
      postsSection.appendChild(el('h2', {class: 'td-posts__heading'},
        'Posts by ' + member.name.split(' ')[0]));
      const list = el('div', {class: 'td-posts__list'});
      posts.forEach(function(p) {
        const card = el('a', {
          href: url('/news/' + p.slug + '/'),
          class: 'td-post-card'
        });
        card.appendChild(el('span', {class: 'td-post-card__date'}, p.date));
        const right = el('div');
        right.appendChild(el('div', {class: 'td-post-card__title'}, p.title));
        right.appendChild(el('div', {class: 'td-post-card__cat'}, p.category));
        card.appendChild(right);
        list.appendChild(card);
      });
      postsSection.appendChild(list);
      bodyInner.appendChild(postsSection);
    }

    // Teammates
    const tmSection = el('div', {class: 'td-teammates'});
    tmSection.appendChild(el('h2', {class: 'td-teammates__heading'}, 'The rest of the team'));
    const grid = el('div', {class: 'td-teammates__grid'});
    teammates.forEach(function(t) {
      const card = el('a', {href: url('/team/' + t.handle + '/'), class: 'td-teammate'});
      const av = el('div', {class: 'td-teammate__avatar'});
      av.appendChild(el('img', {
        src: url('/assets/team/' + t.img),
        alt: t.name,
        loading: 'lazy'
      }));
      card.appendChild(av);
      const info = el('div');
      info.appendChild(el('div', {class: 'td-teammate__name'}, t.name));
      info.appendChild(el('div', {class: 'td-teammate__role'}, t.role));
      card.appendChild(info);
      grid.appendChild(card);
    });
    tmSection.appendChild(grid);
    bodyInner.appendChild(tmSection);

    body.appendChild(bodyInner);
    container.appendChild(body);
  });
})();
