(function() {
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
      // Hide year headings whose section is now empty
      headings.forEach(function(h) {
        var ul = h.nextElementSibling;
        if (!ul) return;
        var anyVisible = Array.from(ul.querySelectorAll(':scope > li'))
          .some(function(li) { return li.style.display !== 'none'; });
        h.style.display = anyVisible ? '' : 'none';
        ul.style.display = anyVisible ? '' : 'none';
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
