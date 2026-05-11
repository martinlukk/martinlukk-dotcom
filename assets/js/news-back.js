(function() {
  var NEWS_FILTERS = ['publications', 'presentations', 'media', 'other'];
  var PUB_FILTERS = ['crowdfunding', 'culture-conflict'];
  var VALID_ORIGINS = ['home', 'news', 'research', 'media'];

  var ORIGINS = {
    home: { href: '/', label: 'Back to Home' },
    news: { href: '/news/', label: 'Back to News', storageKey: 'newsFilter', filters: NEWS_FILTERS },
    research: { href: '/research.html', label: 'Back to Research', storageKey: 'pubFilter', filters: PUB_FILTERS },
    media: { href: '/media/', label: 'Back to Media' }
  };

  function isHome() {
    var p = location.pathname;
    return p === '/' || p === '/index.html';
  }

  function isMediaListing() {
    var p = location.pathname;
    return p === '/media/' || p === '/media/index.html';
  }

  function isNewsDetail() {
    var p = location.pathname;
    if (p.indexOf('/news/') !== 0) return false;
    if (p === '/news/' || p === '/news/index.html') return false;
    return true;
  }

  function isBookPage() {
    var p = location.pathname;
    return p === '/book/' || p === '/book/index.html';
  }

  function hasPublicationCategory() {
    var cats = document.querySelectorAll('.quarto-category');
    for (var i = 0; i < cats.length; i++) {
      if ((cats[i].textContent || '').trim() === 'publication') return true;
    }
    return false;
  }

  function referrerOrigin() {
    if (!document.referrer) return null;
    try {
      var u = new URL(document.referrer);
      if (u.origin !== location.origin) return null;
      var p = u.pathname;
      if (p === '/' || p === '/index.html') return 'home';
      if (p === '/news/' || p === '/news/index.html') return 'news';
      if (p === '/research' || p === '/research.html') return 'research';
      if (p === '/media/' || p === '/media/index.html') return 'media';
    } catch (e) {}
    return null;
  }

  function chooseOriginForNewsDetail() {
    try {
      var stored = sessionStorage.getItem('lastOrigin');
      if (VALID_ORIGINS.indexOf(stored) !== -1) return stored;
    } catch (e) {}
    var ref = referrerOrigin();
    if (ref) return ref;
    // Direct visit fallback: route publications to Research, everything else to News.
    return hasPublicationCategory() ? 'research' : 'news';
  }

  function chooseOriginForBook() {
    // Book gets a back link ONLY when the user explicitly clicked through the
    // Research publication list (top-nav clicks clear lastOrigin).
    try {
      var stored = sessionStorage.getItem('lastOrigin');
      if (stored === 'research') return 'research';
    } catch (e) {}
    return null;
  }

  function injectBackLink(origin) {
    var title = document.getElementById('title-block-header');
    if (!title) return;
    var cfg = ORIGINS[origin];
    if (!cfg) return;

    var href = cfg.href;
    if (cfg.storageKey && cfg.filters) {
      var remembered = null;
      try { remembered = sessionStorage.getItem(cfg.storageKey); } catch (e) {}
      if (remembered && cfg.filters.indexOf(remembered) !== -1) {
        href += '#' + remembered;
      }
    }

    var link = document.createElement('a');
    link.className = 'news-back-link';
    link.href = href;
    link.setAttribute('aria-label', cfg.label);
    link.innerHTML = '<span class="news-back-arrow" aria-hidden="true">←</span> ' + cfg.label;

    title.parentNode.insertBefore(link, title);
  }

  function recordOriginOn(container, origin) {
    if (!container) return;
    container.addEventListener('click', function(e) {
      var a = e.target.closest && e.target.closest('a');
      if (!a) return;
      try { sessionStorage.setItem('lastOrigin', origin); } catch (err) {}
    });
  }

  function init() {
    if (isHome()) {
      recordOriginOn(document.querySelector('.quarto-listing'), 'home');
    } else if (isMediaListing()) {
      recordOriginOn(document.querySelector('.quarto-listing'), 'media');
    } else if (isNewsDetail()) {
      injectBackLink(chooseOriginForNewsDetail());
    } else if (isBookPage()) {
      var origin = chooseOriginForBook();
      if (origin) injectBackLink(origin);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
