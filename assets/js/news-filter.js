(function() {
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

    bar.addEventListener('click', function(e) {
      if (e.target.tagName !== 'BUTTON') return;
      bar.querySelectorAll('button').forEach(function(b) { b.classList.remove('active'); });
      e.target.classList.add('active');
      applyFilter(e.target.getAttribute('data-filter'));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
