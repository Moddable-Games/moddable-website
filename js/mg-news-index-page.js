(function() {
const { T, el, linkBtn, navbar, footer, pageHero, url } = MG;
document.getElementById('nav-root').appendChild(navbar('News'));
document.getElementById('footer-root').appendChild(footer());
document.getElementById('page-hero').appendChild(pageHero({
  eyebrow: 'NEWS & UPDATES',
  title: 'News &amp; updates.',
  lede: 'Strictly written by humans.',
}));

MG.data.load(['news']).then(function(store) {
const POSTS = store.news;

let activeCat = 'All', activeMonth = null, searchVal = '';

function setFilter(cat, month) {
  activeCat = cat;
  activeMonth = month;
  const hash = cat !== 'All' ? 'topic=' + encodeURIComponent(cat) : month ? 'month=' + encodeURIComponent(month) : '';
  history.replaceState(null, '', hash ? '#' + hash : window.location.pathname);
  renderPosts(true);
  renderTopics();
  renderArchive();
}

function postCover(post, big=false) {
  const d = el('div',{class: big ? 'news-cover--big' : 'news-cover'});
  d.style.background = `linear-gradient(135deg,#0a0d2a 0%,${post.cover} 100%)`;
  if (post.img) {
    const img = el('img',{src:url(`/img/news/${post.img}`), alt:'', class:'news-cover__img', loading:'lazy'});
    d.appendChild(img);
  }
  return d;
}

const fpEl = document.getElementById('featured-post');
const feat = POSTS[0];
const fa = el('a',{href:url(`/news/${feat.slug}/`),class:'news-featured-card'});
fa.appendChild(postCover(feat, true));
const fd = el('div');
const fm = el('div',{class:'news-featured-card__meta'});
fm.appendChild(el('span',{class:'news-featured-card__badge'}, 'FEATURED'));
fm.appendChild(el('span',{class:'news-featured-card__date'},`${feat.tags.slice(0,2).join(' · ')} · ${feat.date}`));
fd.appendChild(fm);
fd.appendChild(el('h2',{class:'news-featured-card__title'},feat.title));
fd.appendChild(el('p',{class:'news-featured-card__excerpt'},feat.excerpt));
fd.appendChild(el('span',{class:'news-featured-card__link'},'Read the article →'));
fa.appendChild(fd); fpEl.appendChild(fa);

function renderPosts(scroll) {
  const q = searchVal.toLowerCase();
  const isFiltered = activeCat !== 'All' || activeMonth || q;
  const pool = isFiltered ? POSTS : POSTS.slice(1);
  const visible = pool.filter(p =>
    (activeCat === 'All' || p.tags.includes(activeCat)) &&
    (!activeMonth || p.date === activeMonth) &&
    (!q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q))
  );
  fpEl.style.display = isFiltered ? 'none' : '';
  const grid = document.getElementById('posts-grid');
  grid.innerHTML = '';

  if (isFiltered) {
    const bar = el('div',{class:'news-results-bar'});
    const label = activeCat !== 'All' ? activeCat : activeMonth ? activeMonth : '"' + searchVal + '"';
    bar.appendChild(el('span',{class:'news-results-bar__text'},
      visible.length === 0 ? 'No posts found for ' + label
        : 'Showing ' + visible.length + ' of ' + POSTS.length + ' posts for ' + label
    ));
    const clear = el('a',{href:'#',class:'news-results-bar__clear'}, '← Show all posts');
    clear.addEventListener('click',(e)=>{e.preventDefault();activeCat='All';activeMonth=null;searchVal='';inp.value='';renderPosts(true);renderTopics();renderArchive();});
    bar.appendChild(clear);
    grid.appendChild(bar);
  }

  if (visible.length === 0) {
    grid.style.gridTemplateColumns = '1fr';
  } else if (!isFiltered || visible.length <= 2) {
    grid.style.gridTemplateColumns = visible.length === 1 ? '1fr'
      : visible.length === 2 ? 'repeat(2, 1fr)'
      : 'repeat(auto-fit, minmax(260px, 1fr))';
    visible.forEach(p => {
      const a = el('a',{href:url(`/news/${p.slug}/`),class:'news-grid-card'});
      a.appendChild(postCover(p));
      const meta = el('div',{class:'news-grid-card__meta'});
      meta.appendChild(el('span',{class:'news-grid-card__cat'},p.tags.slice(0,2).join(' · ').toUpperCase()));
      meta.appendChild(el('span',{class:'news-grid-card__dot'}));
      meta.appendChild(el('span',{class:'news-grid-card__date'},p.date));
      a.appendChild(meta);
      a.appendChild(el('h3',{class:'news-grid-card__title'},p.title));
      a.appendChild(el('p',{class:'news-grid-card__excerpt'},p.excerpt));
      grid.appendChild(a);
    });
  } else {
    grid.style.gridTemplateColumns = '1fr';
    const feat = visible[0];
    const fa = el('a',{href:url(`/news/${feat.slug}/`),class:'news-featured-card'});
    fa.appendChild(postCover(feat, true));
    const fd = el('div');
    const fm = el('div',{class:'news-featured-card__meta'});
    fm.appendChild(el('span',{class:'news-featured-card__badge'}, feat.tags[0].toUpperCase()));
    fm.appendChild(el('span',{class:'news-featured-card__date'}, feat.tags.slice(0,2).join(' · ') + ' · ' + feat.date));
    fd.appendChild(fm);
    fd.appendChild(el('h2',{class:'news-featured-card__title'},feat.title));
    fd.appendChild(el('p',{class:'news-featured-card__excerpt'},feat.excerpt));
    fd.appendChild(el('span',{class:'news-featured-card__link'},'Read the article →'));
    fa.appendChild(fd);
    grid.appendChild(fa);

    const rest = visible.slice(1);
    const subgrid = el('div',{class:'news-posts-grid'});
    subgrid.style.gridTemplateColumns = rest.length === 1 ? '1fr'
      : rest.length === 2 ? 'repeat(2, 1fr)'
      : 'repeat(auto-fit, minmax(260px, 1fr))';
    rest.forEach(p => {
      const a = el('a',{href:url(`/news/${p.slug}/`),class:'news-grid-card'});
      a.appendChild(postCover(p));
      const meta = el('div',{class:'news-grid-card__meta'});
      meta.appendChild(el('span',{class:'news-grid-card__cat'},p.tags.slice(0,2).join(' · ').toUpperCase()));
      meta.appendChild(el('span',{class:'news-grid-card__dot'}));
      meta.appendChild(el('span',{class:'news-grid-card__date'},p.date));
      a.appendChild(meta);
      a.appendChild(el('h3',{class:'news-grid-card__title'},p.title));
      a.appendChild(el('p',{class:'news-grid-card__excerpt'},p.excerpt));
      subgrid.appendChild(a);
    });
    grid.appendChild(subgrid);
  }
  if (scroll) document.querySelector('.news-main').scrollIntoView({behavior:'smooth',block:'start'});
}

const sidebar = document.getElementById('sidebar');

const searchWrap = el('div');
searchWrap.appendChild(el('div',{class:'mg-eyebrow mg-eyebrow--blue'},'SEARCH'));
const si = el('div',{class:'news-search-wrap'});
const inp = el('input',{type:'search',placeholder:'Search the archive…',class:'news-search-wrap__input'});
inp.addEventListener('input',e=>{searchVal=e.target.value;renderPosts();});
si.appendChild(el('span',{class:'news-search-wrap__icon'},'⌕'));
si.appendChild(inp); searchWrap.appendChild(si); sidebar.appendChild(searchWrap);

const tagCounts = {};
POSTS.forEach(p => p.tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
const TOPICS = Object.entries(tagCounts).sort((a,b) => b[1] - a[1]);
const ht = el('div');
ht.appendChild(el('div',{class:'mg-eyebrow mg-eyebrow--blue'},'HOT TOPICS'));
const tul = el('ul',{class:'news-topic-list'});

function renderTopics() {
  tul.innerHTML = '';
  const allLi = el('li');
  const allA = el('a',{href:'#',class:'news-topic-list__link'});
  if (activeCat === 'All' && !activeMonth) allA.style.fontWeight = '700';
  allA.appendChild(el('span',{class:'news-topic-list__name'},'All'));
  allA.appendChild(el('span',{class:'news-topic-list__count'},String(POSTS.length)));
  allA.addEventListener('click',(e)=>{e.preventDefault();setFilter('All',null);});
  allLi.appendChild(allA); tul.appendChild(allLi);
  TOPICS.forEach(([t,n]) => {
    const li = el('li');
    const a = el('a',{href:'#topic='+encodeURIComponent(t),class:'news-topic-list__link'});
    if (t === activeCat) a.style.fontWeight = '700';
    a.appendChild(el('span',{class:'news-topic-list__name'},t));
    a.appendChild(el('span',{class:'news-topic-list__count'},String(n)));
    a.addEventListener('click',(e)=>{e.preventDefault();setFilter(activeCat===t?'All':t,null);});
    li.appendChild(a); tul.appendChild(li);
  });
}

ht.appendChild(tul); sidebar.appendChild(ht);

const monthCounts = {};
POSTS.forEach(p => { monthCounts[p.date] = (monthCounts[p.date] || 0) + 1; });
const ARCHIVE = Object.entries(monthCounts);

const arc = el('div');
arc.appendChild(el('div',{class:'mg-eyebrow mg-eyebrow--blue'},'ARCHIVE'));

function renderArchive() {
  const aul = arc.querySelector('.news-archive-list');
  if (aul) aul.remove();
  const ul = el('ul',{class:'news-archive-list'});
  ARCHIVE.forEach(([m,n]) => {
    const li = el('li');
    const a = el('a',{href:'#month='+encodeURIComponent(m),class:'news-archive-list__link'});
    if (m === activeMonth) a.style.fontWeight = '700';
    a.appendChild(document.createTextNode(m));
    a.appendChild(el('span',{class:'news-archive-list__count'},String(n)));
    a.addEventListener('click',(e)=>{
      e.preventDefault();
      setFilter('All', activeMonth === m ? null : m);
    });
    li.appendChild(a); ul.appendChild(li);
  });
  arc.appendChild(ul);
}

sidebar.appendChild(arc);

(function() {
  const hash = window.location.hash.slice(1);
  if (hash.startsWith('topic=')) {
    activeCat = decodeURIComponent(hash.slice(6));
  } else if (hash.startsWith('month=')) {
    activeMonth = decodeURIComponent(hash.slice(6));
  }
})();

renderPosts();
renderTopics();
renderArchive();
});
})();
