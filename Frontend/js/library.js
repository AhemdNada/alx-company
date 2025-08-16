// Library slider (What We Offer)
(function(){
  function attachSlider(trackId, prevId, nextId, dotsId){
    var track = document.getElementById(trackId);
    if (!track) return;
    var container = track.parentElement; // has slider-draggable
    var slides = Array.prototype.slice.call(track.children);
    var total = slides.length;
    var index = 0;
    var prevBtn = document.getElementById(prevId);
    var nextBtn = document.getElementById(nextId);
    var dotsWrap = document.getElementById(dotsId);
    var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.children) : [];

    function update(){
      var offset = -index * track.clientWidth;
      track.style.transform = 'translateX(' + offset + 'px)';
      if (dots.length) dots.forEach(function(d, i){ if (i===index) d.setAttribute('aria-current','true'); else d.removeAttribute('aria-current'); });
    }
    function goTo(i){ index = (i + total) % total; update(); }
    window.addEventListener('resize', update);
    if (prevBtn) prevBtn.addEventListener('click', function(){ goTo(index - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function(){ goTo(index + 1); });
    if (dotsWrap) dots.forEach(function(d, i){ d.addEventListener('click', function(){ goTo(i); }); });

    // swipe/drag support with grab cursor
    var startX=0, down=false; 
    track.addEventListener('pointerdown', function(e){ 
      down=true; startX=e.clientX; track.setPointerCapture(e.pointerId); 
      if (container) container.classList.add('is-grabbing');
    });
    track.addEventListener('pointerup', function(e){ 
      if(!down) return; down=false; var dx=e.clientX-startX; 
      if (container) container.classList.remove('is-grabbing');
      if (Math.abs(dx)>40) { if (dx<0) goTo(index+1); else goTo(index-1);} 
    });
    track.addEventListener('pointercancel', function(){ down=false; if (container) container.classList.remove('is-grabbing'); });

    update();
  }

  attachSlider('offer-slider','offer-prev','offer-next','offer-dots');
})();

