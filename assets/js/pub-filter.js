(function() {
  var VALID = ['all', 'crowdfunding', 'culture-conflict', 'disability-policy'];
  var STORAGE_KEY = 'pubFilter';

  function init() {
    var bar = document.querySelector('[data-pub-filter]');
    if (!bar) return;
    var items = document.querySelectorAll('.pub-list > li');
    var headings = document.querySelectorAll('.pub-year');

    function applyFilter(f) {
      items.forEach(function(li) {
        var tags = (li.getAttribute('data-projects') || '').split(/\s+/);
        li.style.display = (f === 'all' || tags.indexOf(f) !== -1) ? '' : 'none';
      });
      headings.forEach(function(h) {
        var ul = h.nextElementSibling;
        if (!ul) return;
        var anyVisible = Array.from(ul.querySelectorAll(':scope > li'))
          .some(function(li) { return li.style.display !== 'none'; });
        h.style.display = anyVisible ? '' : 'none';
        ul.style.display = anyVisible ? '' : 'none';
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

    // Initial state: prefer URL hash, else "all". sessionStorage is
    // intentionally NOT used as a fallback here — it exists only so the
    // detail-page back-link can re-attach the active filter via a hash.
    // Restoring it on a fresh /research/ visit would surprise users who
    // arrive from the homepage or topnav after filtering earlier in the
    // session. Mirrors news-filter.js.
    var initial = readHash() || 'all';
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

    window.addEventListener('hashchange', function() {
      var f = readHash() || 'all';
      setActive(f);
      applyFilter(f);
      persist(f);
    });

    // Record the origin so detail-page back links know where to return.
    var pubs = document.getElementById('listing-pubs');
    if (pubs) {
      pubs.addEventListener('click', function(e) {
        var a = e.target.closest && e.target.closest('a');
        if (!a) return;
        try { sessionStorage.setItem('lastOrigin', 'research'); } catch (err) {}
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
