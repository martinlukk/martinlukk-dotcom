(function() {
  // DOM post-processing on publication detail pages, keyed by the
  // `.pub-marker` element that the pub-detail Lua filter prepends to
  // the body. Three jobs:
  //   1. Bold the self-author in the auto-rendered author list.
  //      (Quarto normalizes `authors:` into a structured `by-author`
  //      table at metadata processing time, so this can't easily be
  //      done server-side via a Pandoc filter.)
  //   2. Append a project tag pill to the venue line. The filter
  //      exposes `pub_project` as `data-project` on the marker.
  //   3. Wire up the Cite chip: clicking it copies the BibTeX entry
  //      (stashed in a sibling <template>) to the clipboard and
  //      briefly flashes a "Copied!" confirmation.
  var SELF = ['Martin Lukk', 'M. Lukk', 'Lukk, M.'];

  // KEEP-IN-SYNC with `_includes/pub-filter.html` and `_templates/pub-list.ejs`.
  // Project pill display labels — keys are the `pub_project` slug from
  // frontmatter, values are the human-readable label.
  var PROJECT_LABELS = {
    'crowdfunding':     'Crowdfunding',
    'culture-conflict': 'Culture & conflict',
  };

  function boldSelf() {
    document.querySelectorAll(
      'header#title-block-header .quarto-title-meta-contents > p'
    ).forEach(function(p) {
      var t = (p.textContent || '').trim();
      if (SELF.indexOf(t) !== -1) {
        p.innerHTML = '<span class="pub-self">' + t + '</span>';
      }
    });
  }

  function appendProjectTag(project) {
    if (!project) return;
    var sub = document.querySelector(
      'header#title-block-header .subtitle'
    );
    if (!sub) return;
    var tag = document.createElement('span');
    tag.className = 'pub-tag pub-project-tag';
    tag.textContent = PROJECT_LABELS[project] || project;
    sub.appendChild(document.createTextNode(' '));
    sub.appendChild(tag);
  }

  function wireCiteChips() {
    document.querySelectorAll('.pub-cite[data-cite-target]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var el = document.getElementById(btn.dataset.citeTarget);
        if (!el) return;
        // <template> and <script> both expose .textContent of their
        // text children. <template> additionally has a parsed
        // DocumentFragment under .content; prefer that when present
        // (older detail pages may still ship a <template>).
        var text = (el.content && el.content.textContent) || el.textContent || '';
        if (!text) return;

        var orig = btn.textContent;
        var settle = function(state, label) {
          btn.classList.remove('pub-cite-copied', 'pub-cite-failed');
          if (state) btn.classList.add(state);
          btn.textContent = label;
          setTimeout(function() {
            btn.classList.remove('pub-cite-copied', 'pub-cite-failed');
            btn.textContent = orig;
          }, 1500);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text)
            .then(function() { settle('pub-cite-copied', 'Copied!'); })
            .catch(function() { settle('pub-cite-failed', 'Copy failed'); });
        } else {
          settle('pub-cite-failed', 'Copy failed');
        }
      });
    });
  }

  function init() {
    // Self-author bolding and the project pill are detail-page only:
    // they depend on the .pub-marker the Lua filter prepends to each
    // pub qmd. The Cite handler is wired on any page — pub detail
    // pages and the Research listing both render Copy BibTeX chips.
    var marker = document.querySelector('.pub-marker');
    if (marker) {
      boldSelf();
      appendProjectTag(marker.getAttribute('data-project'));
    }
    wireCiteChips();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
