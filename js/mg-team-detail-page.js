import { T, el, url, data, navbar, footer } from './mg.js';
const container = document.getElementById('team-detail');
const slug = container.getAttribute('data-member');

document.getElementById('nav-root').appendChild(navbar('About'));
document.getElementById('footer-root').appendChild(footer());

Promise.all([data.get('team'), data.get('news')]).then(function([team, news]) {
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

  // Body (2-column layout)
  const SOCIAL_ICONS = {
    linkedin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    x: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    instagram: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>'
  };

  const body = el('div', {class: 'td-body'});
  const bodyInner = el('div', {class: 'td-body__inner'});
  const content = el('div', {class: 'td-content'});
  const sidebar = el('div', {class: 'td-sidebar'});

  // Bio
  content.appendChild(el('p', {class: 'td-bio'}, member.longBio || member.bio));

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
    content.appendChild(postsSection);
  }


  // Sidebar — social links
  if (member.socials) {
    const socialCard = el('div', {class: 'td-sidebar__card'});
    socialCard.appendChild(el('div', {class: 'td-sidebar__card-title'}, 'Connect'));
    const socialsWrap = el('div', {class: 'td-sidebar__socials'});
    ['linkedin', 'x', 'instagram'].forEach(function(platform) {
      if (member.socials[platform]) {
        const link = el('a', {href: member.socials[platform], class: 'td-sidebar__social', target: '_blank', rel: 'noopener'});
        link.innerHTML = SOCIAL_ICONS[platform];
        socialsWrap.appendChild(link);
      }
    });
    socialCard.appendChild(socialsWrap);
    sidebar.appendChild(socialCard);
  }

  // Sidebar — other team members
  const tmCard = el('div', {class: 'td-sidebar__card'});
  tmCard.appendChild(el('div', {class: 'td-sidebar__card-title'}, 'Team'));
  const tmWrap = el('div', {class: 'td-sidebar__teammates'});
  teammates.forEach(function(t) {
    const a = el('a', {href: url('/team/' + t.handle + '/'), class: 'td-sidebar__teammate'});
    const av = el('div', {class: 'td-sidebar__teammate-avatar'});
    av.appendChild(el('img', {src: url('/assets/team/' + t.img), alt: t.name, loading: 'lazy'}));
    a.appendChild(av);
    const info = el('div');
    info.appendChild(el('div', {class: 'td-sidebar__teammate-name'}, t.name));
    info.appendChild(el('div', {class: 'td-sidebar__teammate-role'}, t.role));
    a.appendChild(info);
    tmWrap.appendChild(a);
  });
  tmCard.appendChild(tmWrap);
  sidebar.appendChild(tmCard);

  bodyInner.appendChild(content);
  bodyInner.appendChild(sidebar);
  body.appendChild(bodyInner);
  container.appendChild(body);
});