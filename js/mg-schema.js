(function() {
  function inject(data) {
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }

  var BASE = 'https://web.moddable.games';

  inject({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Moddable.Games",
    "url": BASE,
    "logo": BASE + "/img/cube-logo.svg",
    "description": "Open-source engines, community-built mods, and original games designed to be taken apart.",
    "sameAs": [
      "https://discord.com/invite/WXENAywsQb",
      "https://github.com/Moddable-Games"
    ]
  });

  var path = location.pathname.replace(/index\.html$/, '');

  if (path === '/' || path === '') {
    inject({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Moddable.Games",
      "url": BASE,
      "description": "Open-source rulebook mods for existing board games, plus three original games designed to be modded from day one.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": BASE + "/mods/?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    });
  }

  if (path.startsWith('/mods') && path !== '/mods/') {
    var slug = path.replace('/mods/', '').replace(/\/$/, '');
    if (slug) {
      var title = document.querySelector('h1');
      var desc = document.querySelector('meta[name="description"]');
      inject({
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "name": title ? title.textContent : slug,
        "description": desc ? desc.content : '',
        "url": BASE + path,
        "publisher": { "@type": "Organization", "name": "Moddable.Games" },
        "isAccessibleForFree": true,
        "license": "https://creativecommons.org/licenses/by-sa/4.0/"
      });
    }
  }

  if (path.startsWith('/games/') && path !== '/games/') {
    var title = document.querySelector('h1');
    var desc = document.querySelector('meta[name="description"]');
    inject({
      "@context": "https://schema.org",
      "@type": "Game",
      "name": title ? title.textContent : '',
      "description": desc ? desc.content : '',
      "url": BASE + path,
      "publisher": { "@type": "Organization", "name": "Moddable.Games" },
      "isAccessibleForFree": true
    });
  }

  if (path.startsWith('/news/') && path !== '/news/') {
    var title = document.querySelector('h1');
    var desc = document.querySelector('meta[name="description"]');
    var date = document.querySelector('time');
    inject({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title ? title.textContent : '',
      "description": desc ? desc.content : '',
      "url": BASE + path,
      "datePublished": date ? date.getAttribute('datetime') : '',
      "publisher": { "@type": "Organization", "name": "Moddable.Games", "logo": { "@type": "ImageObject", "url": BASE + "/img/cube-logo.svg" } },
      "author": { "@type": "Organization", "name": "Moddable.Games" }
    });
  }

  if (path.startsWith('/tools/') && path !== '/tools/') {
    var title = document.querySelector('h1');
    var desc = document.querySelector('meta[name="description"]');
    inject({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": title ? title.textContent : '',
      "description": desc ? desc.content : '',
      "url": BASE + path,
      "applicationCategory": "GameApplication",
      "operatingSystem": "Any",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
    });
  }
})();
