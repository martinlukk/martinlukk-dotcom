(function() {
  var year = new Date().getFullYear();
  document.querySelectorAll('.ml-copyright-year').forEach(function(el) {
    el.textContent = year;
  });

  // Quarto inserts listing content as a sibling AFTER the include-after-body
  // footer. On mobile (where the page footer is the visible one), this lands
  // the copyright between the title block and the listing. Move the page
  // footer to be the last child of #quarto-content so it sits below the
  // listing regardless.
  function reanchorFooter() {
    var footer = document.querySelector('.ml-page-footer');
    var container = document.getElementById('quarto-content');
    if (footer && container && footer.parentNode === container &&
        container.lastElementChild !== footer) {
      container.appendChild(footer);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', reanchorFooter);
  } else {
    reanchorFooter();
  }
})();
