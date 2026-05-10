(function() {
  function norm(p) {
    return (p || '/').replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  }

  function highlightActiveLink() {
    var here = norm(window.location.pathname);
    var links = document.querySelectorAll('.ml-topnav .ml-nav-link');
    var bestMatch = null;
    var bestLength = -1;
    links.forEach(function(a) {
      var href = a.getAttribute('href') || '';
      // Skip downloads / external resources from active-state matching
      if (href.endsWith('.pdf')) return;
      var resolved = norm(new URL(a.href, window.location.href).pathname);
      var match = resolved === here
        || (resolved !== '/' && here.indexOf(resolved) === 0)
        || (resolved === '/' && here === '/');
      if (match && resolved.length > bestLength) {
        bestMatch = a;
        bestLength = resolved.length;
      }
    });
    if (bestMatch) {
      bestMatch.classList.add('active');
      bestMatch.setAttribute('aria-current', 'page');
    }
  }

  function wireMobileToggle() {
    var toggle = document.querySelector('.ml-topnav-toggle');
    var nav = document.getElementById('ml-topnav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function() {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.classList.toggle('open', open);
    });
  }

  highlightActiveLink();
  wireMobileToggle();
})();
