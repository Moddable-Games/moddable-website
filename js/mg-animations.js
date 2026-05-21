/* =========================================================================
   Moddable.Games — Animations: Scroll reveal, IntersectionObserver
   Extends window.MG (created by mg-core.js)
   ========================================================================= */

(function() {
  function initReveal() {
    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;

    document.querySelectorAll('[data-stagger]').forEach(parent => {
      Array.from(parent.children).forEach((child, i) => {
        if (child.hasAttribute('data-reveal')) {
          child.style.setProperty('--stagger-index', i);
        }
      });
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => observer.observe(el));
  }

  function initTocSpy() {
    var toc = document.getElementById('toc');
    if (!toc) return;
    var links = toc.querySelectorAll('.toc-list__link');
    var sections = [];
    links.forEach(function(a) {
      var id = a.getAttribute('href').slice(1);
      var sec = document.getElementById(id);
      if (sec) sections.push({ el: sec, link: a });
    });
    if (!sections.length) return;

    var activeLink = null;
    function activate(link) {
      if (activeLink === link) return;
      if (activeLink) activeLink.classList.remove('toc-list__link--active');
      link.classList.add('toc-list__link--active');
      activeLink = link;
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var match = sections.find(function(s) { return s.el === entry.target; });
          if (match) activate(match.link);
        }
      });
    }, { rootMargin: '-80px 0px -60% 0px', threshold: 0 });

    sections.forEach(function(s) { observer.observe(s.el); });

    links.forEach(function(a) {
      a.addEventListener('click', function() {
        activate(a);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    initReveal();
    setTimeout(initTocSpy, 0);
  });

  window.MG.initReveal = initReveal;
  window.MG.initTocSpy = initTocSpy;
})();
