(function() {
  var year = new Date().getFullYear();
  document.querySelectorAll('.ml-copyright-year').forEach(function(el) {
    el.textContent = year;
  });
})();
