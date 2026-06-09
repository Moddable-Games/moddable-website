(function() {
  var GA_ID = 'G-N0N3JPVCBE';
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID);

  /**
   * MG.track(event, params) — GA4 event helper.
   * Wraps gtag('event', ...) with a guard so pages don't throw
   * if the GA script hasn't loaded or was blocked by an ad-blocker.
   */
  function track(event, params) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', event, params || {});
    }
  }

  window.MG = window.MG || {};
  window.MG.track = track;
})();
