// Projects page filtering + hover interactions
(function(){
  var btns = Array.prototype.slice.call(document.querySelectorAll('.filter-btn'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.project-card'));
  if (btns.length === 0 || cards.length === 0) return;

  function applyFilter(filter) {
    cards.forEach(function(card){
      var cat = card.getAttribute('data-category');
      var show = (filter === 'all') || (cat === filter);
      if (show) {
        card.removeAttribute('data-hidden');
      } else {
        card.setAttribute('data-hidden', 'true');
      }
    });
  }

  btns.forEach(function(btn){
    btn.addEventListener('click', function(){
      var filter = btn.getAttribute('data-filter');
      btns.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      applyFilter(filter);
    });
  });

  // Initialize to current active
  var active = document.querySelector('.filter-btn.active');
  applyFilter(active ? active.getAttribute('data-filter') : 'all');
})();

