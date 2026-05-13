(function() {
  var NEWS_FILTERS = ['publications', 'presentations', 'media', 'other'];
  var PUB_FILTERS = ['crowdfunding', 'culture-conflict', 'disability-policy'];
  var VALID_ORIGINS = ['home', 'news', 'research', 'media', 'book'];

  var ORIGINS = {
    home: { href: '/', label: 'Back to Home' },
    news: { href: '/news/', label: 'Back to News', storageKey: 'newsFilter', filters: NEWS_FILTERS },
    research: { href: '/research.html', label: 'Back to Research', storageKey: 'pubFilter', filters: PUB_FILTERS },
    media: { href: '/media/', label: 'Back to Media' },
    book: { href: '/book/', label: 'Back to Book' }
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
      if (p === '/book/' || p === '/book/index.html') return 'book';
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
    // Book gets a back link ONLY when the user explicitly clicked through
    // either the Research publication list or the News timeline (the
    // GoFailMe news entry links straight to /book/). Top-nav clicks clear
    // lastOrigin, so direct visits stay arrow-less.
    try {
      var stored = sessionStorage.getItem('lastOrigin');
      if (stored === 'research' || stored === 'news') return stored;
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

  function recordOriginOn(container, origin, hrefFilter) {
    if (!container) return;
    container.addEventListener('click', function(e) {
      var a = e.target.closest && e.target.closest('a');
      if (!a) return;
      if (hrefFilter && !hrefFilter(a)) return;
      try { sessionStorage.setItem('lastOrigin', origin); } catch (err) {}
    });
  }

  function isNewsDetailHref(a) {
    // Resolve against the current page so this works regardless of whether
    // Quarto emits site-rooted (`/news/foo.html`), relative (`../news/foo.html`),
    // or fully qualified hrefs.
    var href = a.getAttribute('href') || '';
    if (!href) return false;
    var p;
    try { p = new URL(href, location.href).pathname; } catch (e) { return false; }
    if (p.indexOf('/news/') !== 0) return false;
    if (p === '/news/' || p === '/news/index.html') return false;
    return true;
  }

  function init() {
    if (isHome()) {
      recordOriginOn(document.querySelector('.quarto-listing'), 'home');
    } else if (isMediaListing()) {
      recordOriginOn(document.querySelector('.quarto-listing'), 'media');
    } else if (isBookPage()) {
      // Reviews on /book/ link to news detail pages. Record `book` as
      // the origin so the detail-page back arrow returns to /book/.
      // Scope to /news/* hrefs so top-nav and other links don't clobber
      // an unrelated origin.
      recordOriginOn(document.body, 'book', isNewsDetailHref);
      var origin = chooseOriginForBook();
      if (origin) injectBackLink(origin);
    } else if (isNewsDetail()) {
      injectBackLink(chooseOriginForNewsDetail());
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
