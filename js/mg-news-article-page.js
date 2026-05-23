(function() {
  var body = document.body;
  var tocData = body.getAttribute('data-toc');
  if (!tocData) return;

  var el = MG.el;
  var linkBtn = MG.linkBtn;
  var url = MG.url;

  document.getElementById('nav-root').appendChild(MG.navbar('News'));
  document.getElementById('footer-root').appendChild(MG.footer());

  // Share buttons
  var shareBtns = document.getElementById('share-btns');
  if (shareBtns) {
    ['X','FB','LI','Copy'].forEach(function(s) {
      var b = document.createElement('button');
      b.textContent = s;
      b.className = 'post-share-btn';
      shareBtns.appendChild(b);
    });
  }

  // TOC
  var TOC = JSON.parse(tocData);
  var tul = document.getElementById('toc-list');
  if (tul) {
    TOC.forEach(function(t) {
      var li = el('li', {class:'post-toc__item'});
      var a = el('a', {href:'#' + t.id, class:'post-toc__link post-toc__link--inactive'}, t.label);
      a.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById(t.id).scrollIntoView({behavior:'smooth', block:'start'});
      });
      li.appendChild(a);
      tul.appendChild(li);
    });

    var items = tul.querySelectorAll('.post-toc__item');
    var links = tul.querySelectorAll('.post-toc__link');
    var ids = TOC.map(function(t) { return t.id; });
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

  // Mod download button
  var dlBtnWrap = document.getElementById('mod-dl-btn');
  if (dlBtnWrap) {
    var dlBtn = linkBtn('Download rules', '#', 'red');
    dlBtn.classList.add('post-mod-card__dl');
    dlBtnWrap.appendChild(dlBtn);
  }

  // Hero parallax
  var header = document.querySelector('.post-header');
  var img = document.querySelector('.post-header__img');
  var inner = document.querySelector('.post-header__inner');
  if (header && img && inner) {
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

  // Topic tags and related posts (depend on news data)
  var pathParts = window.location.pathname.split('/news/');
  var currentSlug = pathParts[1] ? pathParts[1].replace(/\//g, '') : '';

  MG.data.load(['news']).then(function(store) {
    var NEWS_POSTS = store.news;
    var currentPost = NEWS_POSTS.find(function(p) { return p.slug === currentSlug; });
    if (currentPost) {
      var rails = document.querySelectorAll('.post-rail');
      var rightRail = rails[1];
      if (rightRail) {
        var tagSection = el('div', {class:'post-rail__topics'});
        tagSection.appendChild(el('div', {class:'post-rail__eyebrow'}, 'TOPICS'));
        var tagList = el('ul', {class:'post-rail__tags'});
        currentPost.tags.forEach(function(t) {
          var li = el('li');
          li.appendChild(el('a', {href:url('/news/#topic=' + encodeURIComponent(t)), class:'post-rail__tag'}, t));
          tagList.appendChild(li);
        });
        tagSection.appendChild(tagList);
        rightRail.appendChild(tagSection);
      }
    }

    var related = NEWS_POSTS
      .filter(function(p) { return p.slug !== currentSlug; })
      .map(function(p) {
        var score = currentPost ? p.tags.filter(function(t) { return currentPost.tags.indexOf(t) !== -1; }).length : 0;
        return {slug:p.slug, tags:p.tags, date:p.date, cover:p.cover, img:p.img, title:p.title, score:score};
      })
      .sort(function(a, b) { return b.score - a.score; })
      .slice(0, 3);
    var mp = document.getElementById('more-posts');
    if (mp) {
      related.forEach(function(p) {
        var a = el('a', {href:url('/news/' + p.slug + '/'), class:'post-more-card'});
        var cover = el('div', {class:'post-more-card__cover'});
        cover.style.background = 'linear-gradient(135deg,#0a0d2a 0%,' + p.cover + ' 100%)';
        if (p.img) {
          var imgEl = el('img', {src:url('/img/news/' + p.img), alt:'', class:'post-more-card__img'});
          cover.appendChild(imgEl);
        }
        a.appendChild(cover);
        a.appendChild(el('div', {class:'post-more-card__meta'}, p.tags.slice(0,2).join(' · ').toUpperCase() + ' · ' + p.date));
        a.appendChild(el('h3', {class:'post-more-card__title'}, p.title));
        mp.appendChild(a);
      });
    }
  });
})();
