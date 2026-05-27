(function() {
  var pathParts = window.location.pathname.replace(/\/$/, '').split('/');
  var slug = pathParts[pathParts.length - 1];
  if (!slug || slug === 'news') return;

  var el = MG.el;
  var linkBtn = MG.linkBtn;
  var url = MG.url;

  document.getElementById('nav-root').appendChild(MG.navbar('News'));
  document.getElementById('footer-root').appendChild(MG.footer());

  MG.data.load(['news', 'team', 'mods']).then(function(store) {
    var posts = store.news;
    var team = store.team;
    var mods = store.mods;
    var post = posts.find(function(p) { return p.slug === slug; });
    if (!post) return;

    document.title = post.title + ' — Moddable.Games';
    renderHeader(post);
    renderLeftRail(post, team);
    renderRightRail(post, mods);
    renderArticleBody(post);
    renderRelated(posts, post);
    initParallax();
  });

  function renderHeader(post) {
    var header = document.querySelector('.post-header');
    if (!header) return;

    var img = el('img', {src: url('/img/news/' + post.img), alt: '', class: 'post-header__img'});
    var bloom = el('div', {class: 'post-header__bloom'});
    var inner = el('div', {class: 'post-header__inner'});

    var backLink = el('a', {href: url('/news/'), class: 'post-header__back'});
    backLink.innerHTML = '&larr; All posts';
    inner.appendChild(backLink);

    var tags = el('div', {class: 'post-header__tags'});
    tags.appendChild(el('span', {class: 'post-header__cat'}, post.category));
    tags.appendChild(el('span', {class: 'post-header__meta'}, post.date + ' · ' + post.readTime));
    inner.appendChild(tags);

    var titleEl = el('h1', {class: 'post-header__title'});
    titleEl.innerHTML = post.heroTitle;
    inner.appendChild(titleEl);
    inner.appendChild(el('p', {class: 'post-header__lede'}, post.lede));

    header.appendChild(img);
    header.appendChild(bloom);
    header.appendChild(inner);
  }

  function renderLeftRail(post, team) {
    var rail = document.getElementById('left-rail');
    if (!rail) return;

    var member = team.find(function(t) { return t.slug === post.teamSlug; });

    var authorCard = el('div', {class: 'post-author-card'});
    var avatarWrap = el('a', {class: 'post-author-card__avatar', href: member ? url('/team/' + member.slug + '/') : '#'});
    if (member) {
      avatarWrap.style.background = 'linear-gradient(135deg, ' + member.color + ', #0a0d2a)';
      var img = el('img', {
        src: url('/assets/team/' + member.img),
        alt: member.name,
        class: 'post-author-card__img'
      });
      avatarWrap.appendChild(img);
    }
    authorCard.appendChild(avatarWrap);

    var info = el('div', {class: 'post-author-card__info'});
    var name = member ? member.name : post.author;
    var role = member ? member.role : post.authorHandle;
    info.appendChild(el('div', {class: 'post-author-card__name'}, name));
    info.appendChild(el('div', {class: 'post-author-card__role'}, role));
    authorCard.appendChild(info);

    if (member) {
      var profileLink = el('a', {
        href: url('/team/' + member.slug + '/'),
        class: 'post-author-card__link'
      }, 'View profile →');
      authorCard.appendChild(profileLink);
    }
    rail.appendChild(authorCard);

    rail.appendChild(el('div', {class: 'post-rail__eyebrow post-rail__eyebrow--green'}, 'SHARE'));
    var pageUrl = encodeURIComponent(window.location.href);
    var pageTitle = encodeURIComponent(post.title + ' — Moddable.Games');
    var shares = [
      {label: 'X', icon: '𝕏', href: 'https://x.com/intent/tweet?url=' + pageUrl + '&text=' + pageTitle},
      {label: 'Facebook', icon: 'f', href: 'https://www.facebook.com/sharer/sharer.php?u=' + pageUrl},
      {label: 'LinkedIn', icon: 'in', href: 'https://www.linkedin.com/sharing/share-offsite/?url=' + pageUrl},
      {label: 'Copy', icon: '⎘', action: 'copy'}
    ];
    var shareBtns = el('div', {class: 'post-share-btns'});
    shares.forEach(function(s) {
      if (s.action === 'copy') {
        var b = el('button', {class: 'post-share-btn', 'aria-label': 'Copy link', title: 'Copy link'});
        b.textContent = s.icon;
        b.addEventListener('click', function() {
          navigator.clipboard.writeText(window.location.href).then(function() {
            b.textContent = '✓';
            setTimeout(function() { b.textContent = s.icon; }, 2000);
          });
        });
        shareBtns.appendChild(b);
      } else {
        var a = el('a', {
          href: s.href,
          target: '_blank',
          rel: 'noopener',
          class: 'post-share-btn',
          'aria-label': 'Share on ' + s.label,
          title: 'Share on ' + s.label
        });
        a.textContent = s.icon;
        shareBtns.appendChild(a);
      }
    });
    rail.appendChild(shareBtns);
  }

  function renderRightRail(post, mods) {
    var rail = document.getElementById('right-rail');
    if (!rail) return;

    rail.appendChild(el('div', {class: 'post-rail__eyebrow'}, 'IN THIS POST'));
    var tocList = el('ul', {class: 'post-toc', id: 'toc-list'});
    if (post.toc) {
      post.toc.forEach(function(t) {
        var li = el('li', {class: 'post-toc__item'});
        var a = el('a', {href: '#' + t.id, class: 'post-toc__link post-toc__link--inactive'}, t.label);
        a.addEventListener('click', function(e) {
          e.preventDefault();
          var target = document.getElementById(t.id);
          if (target) target.scrollIntoView({behavior: 'smooth', block: 'start'});
        });
        li.appendChild(a);
        tocList.appendChild(li);
      });
    }
    rail.appendChild(tocList);

    if (post.tags) {
      var tagSection = el('div', {class: 'post-rail__topics'});
      tagSection.appendChild(el('div', {class: 'post-rail__eyebrow'}, 'TOPICS'));
      var tagList = el('ul', {class: 'post-rail__tags'});
      post.tags.forEach(function(t) {
        var li = el('li');
        li.appendChild(el('a', {href: url('/news/#topic=' + encodeURIComponent(t)), class: 'post-rail__tag'}, t));
        tagList.appendChild(li);
      });
      tagSection.appendChild(tagList);
      rail.appendChild(tagSection);
    }

    var cardData = post.modCard || deriveModCard(post, mods);
    if (cardData) {
      var mc = el('div', {class: 'post-mod-card'});
      mc.appendChild(el('div', {class: 'post-mod-card__eyebrow'}, 'THE MOD'));
      mc.appendChild(el('div', {class: 'post-mod-card__title'}, cardData.title));
      mc.appendChild(el('div', {class: 'post-mod-card__version'}, cardData.version));
      var dlWrap = el('div');
      var dlBtn = linkBtn(cardData.btnLabel || 'View the mod', cardData.href || '/mods/', 'red');
      dlBtn.classList.add('post-mod-card__dl');
      dlWrap.appendChild(dlBtn);
      mc.appendChild(dlWrap);
      rail.appendChild(mc);
    }
  }

  function deriveModCard(post, mods) {
    if (!post.tags || !mods) return {title: 'Moddable Community', version: 'Discord · Open to all', href: '/community/', btnLabel: 'Join the Discord'};
    var match = null;
    for (var i = 0; i < mods.length; i++) {
      if (post.tags.indexOf(mods[i].baseGame) !== -1) { match = mods[i]; break; }
    }
    if (match) {
      return {title: match.title, version: match.category, href: match.path, btnLabel: 'View the mod'};
    }
    return {title: 'Moddable Community', version: 'Discord · Open to all', href: '/community/', btnLabel: 'Join the Discord'};
  }

  function renderArticleBody(post) {
    var article = document.getElementById('article-body');
    if (!article) return;

    fetch(url('/data/articles/' + slug + '.html'))
      .then(function(r) { return r.text(); })
      .then(function(html) {
        article.innerHTML = html;
        initTocSpy(post);
      });
  }

  function initTocSpy(post) {
    if (!post.toc) return;
    var tocList = document.getElementById('toc-list');
    if (!tocList) return;

    var items = tocList.querySelectorAll('.post-toc__item');
    var links = tocList.querySelectorAll('.post-toc__link');
    var ids = post.toc.map(function(t) { return t.id; });

    function setActive(idx) {
      items.forEach(function(li, i) {
        li.classList.toggle('post-toc__item--active', i === idx);
        links[i].classList.toggle('post-toc__link--active', i === idx);
        links[i].classList.toggle('post-toc__link--inactive', i !== idx);
      });
    }
    setActive(0);

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var idx = ids.indexOf(entry.target.id);
          if (idx !== -1) setActive(idx);
        }
      });
    }, {rootMargin: '-20% 0px -60% 0px'});

    ids.forEach(function(id) {
      var sec = document.getElementById(id);
      if (sec) observer.observe(sec);
    });
  }

  function renderRelated(posts, current) {
    var mp = document.getElementById('more-posts');
    if (!mp) return;

    var related = posts
      .filter(function(p) { return p.slug !== current.slug; })
      .map(function(p) {
        var score = current.tags ? p.tags.filter(function(t) { return current.tags.indexOf(t) !== -1; }).length : 0;
        return Object.assign({}, p, {score: score});
      })
      .sort(function(a, b) { return b.score - a.score; })
      .slice(0, 3);

    related.forEach(function(p) {
      var a = el('a', {href: url('/news/' + p.slug + '/'), class: 'post-more-card'});
      var cover = el('div', {class: 'post-more-card__cover'});
      cover.style.background = 'linear-gradient(135deg,#0a0d2a 0%,' + p.cover + ' 100%)';
      if (p.img) {
        cover.appendChild(el('img', {src: url('/img/news/' + p.img), alt: '', class: 'post-more-card__img', loading:'lazy'}));
      }
      a.appendChild(cover);
      a.appendChild(el('div', {class: 'post-more-card__meta'}, p.tags.slice(0,2).join(' · ').toUpperCase() + ' · ' + p.date));
      a.appendChild(el('h3', {class: 'post-more-card__title'}, p.title));
      mp.appendChild(a);
    });
  }

  function initParallax() {
    var header = document.querySelector('.post-header');
    var img = document.querySelector('.post-header__img');
    var inner = document.querySelector('.post-header__inner');
    if (!header || !img || !inner) return;

    var ticking = false;
    window.addEventListener('scroll', function() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function() {
        var rect = header.getBoundingClientRect();
        var h = header.offsetHeight;
        var progress = Math.max(0, Math.min(1, -rect.top / h));
        var scale = 1.08 + progress * 0.12;
        img.style.transform = 'scale(' + scale + ')';
        img.style.opacity = 0.5 - progress * 0.35;
        inner.style.transform = 'translateY(' + (progress * -40) + 'px)';
        inner.style.opacity = 1 - progress * 0.9;
        ticking = false;
      });
    });
  }
})();
