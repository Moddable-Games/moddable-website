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

  document.addEventListener('DOMContentLoaded', initReveal);

  window.MG.initReveal = initReveal;
})();
