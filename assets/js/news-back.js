(function() {
  var NEWS_FILTERS = ['publications', 'presentations', 'media', 'other'];
  var PUB_FILTERS = ['crowdfunding', 'culture-conflict'];

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
      if (u.pathname === '/news/' || u.pathname === '/news/index.html') return 'news';
      if (u.pathname === '/research.html' || u.pathname === '/research') return 'research';
    } catch (e) {}
    return null;
  }

  function chooseOriginForNewsDetail() {
    try {
      var stored = sessionStorage.getItem('lastOrigin');
      if (stored === 'news' || stored === 'research') return stored;
    } catch (e) {}
    var ref = referrerOrigin();
    if (ref) return ref;
    // Direct visit fallback: route publications to Research, everything else to News.
    return hasPublicationCategory() ? 'research' : 'news';
  }

  function chooseOriginForBook() {
    // Book gets a back link ONLY when the user demonstrably came from Research.
    try {
      var stored = sessionStorage.getItem('lastOrigin');
      if (stored === 'research') return 'research';
    } catch (e) {}
    if (referrerOrigin() === 'research') return 'research';
    return null;
  }

  function injectBackLink(origin) {
    var title = document.getElementById('title-block-header');
    if (!title) return;

    var baseHref, label, storageKey, validFilters;
    if (origin === 'research') {
      baseHref = '/research.html';
      label = 'Back to Research';
      storageKey = 'pubFilter';
      validFilters = PUB_FILTERS;
    } else {
      baseHref = '/news/';
      label = 'Back to News';
      storageKey = 'newsFilter';
      validFilters = NEWS_FILTERS;
    }

    var remembered = null;
    try { remembered = sessionStorage.getItem(storageKey); } catch (e) {}
    var href = baseHref;
    if (remembered && validFilters.indexOf(remembered) !== -1) href += '#' + remembered;

    var link = document.createElement('a');
    link.className = 'news-back-link';
    link.href = href;
    link.setAttribute('aria-label', label);
    link.innerHTML = '<span class="news-back-arrow" aria-hidden="true">←</span> ' + label;

    title.parentNode.insertBefore(link, title);
  }

  function init() {
    if (isNewsDetail()) {
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
