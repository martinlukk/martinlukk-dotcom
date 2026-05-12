// Open every inline external link in a new tab, with the safe rel.
// Same shape as chips.js, but applied to ordinary body links (not chips).
// Skips: links to the same host, mailto/tel/local-anchor links, links that
// already set `target`. Scoped to `#quarto-content` so the topbar/sidebar
// (which manage their own target attrs) are untouched.
(function () {
  var root = document.querySelector('#quarto-content');
  if (!root) return;
  var here = window.location.hostname;

  root.querySelectorAll('a[href]').forEach(function (a) {
    if (a.hasAttribute('target')) return;
    var href = a.getAttribute('href') || '';
    if (!/^https?:\/\//i.test(href)) return; // skip mailto:, /, #, relative
    var host;
    try { host = new URL(href).hostname; } catch (e) { return; }
    if (!host || host === here) return;
    a.setAttribute('target', '_blank');
    if (!a.hasAttribute('rel')) a.setAttribute('rel', 'noopener');
  });
})();
