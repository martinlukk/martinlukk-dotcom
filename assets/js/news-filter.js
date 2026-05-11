(function() {
  var VALID = ['all', 'publications', 'presentations', 'media', 'other'];
  var STORAGE_KEY = 'newsFilter';

  function init() {
    var bar = document.querySelector('[data-news-filter]');
    if (!bar) return;
    var groups = document.querySelectorAll('.news-list .news-year-group');
    var items = document.querySelectorAll('.news-list .news-item');

    function applyFilter(f) {
      items.forEach(function(it) {
        var g = it.getAttribute('data-group') || '';
        it.style.display = (f === 'all' || g === f) ? '' : 'none';
      });
      groups.forEach(function(grp) {
        var anyVisible = Array.from(grp.querySelectorAll('.news-item'))
          .some(function(it) { return it.style.display !== 'none'; });
        grp.style.display = anyVisible ? '' : 'none';
      });
    }

    function setActive(f) {
      bar.querySelectorAll('button').forEach(function(b) {
        b.classList.toggle('active', b.getAttribute('data-filter') === f);
      });
    }

    function readHash() {
      var h = (location.hash || '').replace(/^#/, '');
      return VALID.indexOf(h) !== -1 ? h : null;
    }

    function persist(f) {
      try {
        if (f && f !== 'all') sessionStorage.setItem(STORAGE_KEY, f);
        else sessionStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
    }

    function updateHash(f) {
      var newHash = (f && f !== 'all') ? '#' + f : '';
      var url = location.pathname + location.search + newHash;
      history.replaceState(null, '', url);
    }

    // Initial state: prefer URL hash, then sessionStorage, else "all".
    var initial = readHash();
    if (!initial) {
      try { initial = sessionStorage.getItem(STORAGE_KEY); } catch (e) {}
      if (VALID.indexOf(initial) === -1) initial = null;
    }
    if (!initial) initial = 'all';
    setActive(initial);
    applyFilter(initial);
    persist(initial);

    bar.addEventListener('click', function(e) {
      if (e.target.tagName !== 'BUTTON') return;
      var f = e.target.getAttribute('data-filter');
      setActive(f);
      applyFilter(f);
      persist(f);
      updateHash(f);
    });

    // If the user navigates back/forward to a different hash, re-apply.
    window.addEventListener('hashchange', function() {
      var f = readHash() || 'all';
      setActive(f);
      applyFilter(f);
      persist(f);
    });

    // Record the origin so detail-page back links know where to return.
    var list = document.querySelector('.news-list');
    if (list) {
      list.addEventListener('click', function(e) {
        var a = e.target.closest && e.target.closest('a');
        if (!a) return;
        try { sessionStorage.setItem('lastOrigin', 'news'); } catch (err) {}
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
