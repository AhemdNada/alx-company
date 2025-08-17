// Evaluation & Studies Sector sliders & smooth scroll
(function(){
  function attachSlider(trackId, prevId, nextId, dotsId){
    var track = document.getElementById(trackId);
    if (!track) return;
    var container = track.parentElement; // viewport with overflow-hidden & slider-draggable
    var slides = Array.prototype.slice.call(track.children);
    var total = slides.length;
    var index = 0;
    var prevBtn = document.getElementById(prevId);
    var nextBtn = document.getElementById(nextId);
    var dotsWrap = document.getElementById(dotsId);
    var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.children) : [];
    var autoTimer = null;

    function getSlideWidth(){ return container ? container.clientWidth : 0; }

    function update(){
      var offset = -index * getSlideWidth();
      track.style.transform = 'translateX(' + offset + 'px)';
      if (dots.length) dots.forEach(function(d, i){ if (i===index) d.setAttribute('aria-current','true'); else d.removeAttribute('aria-current'); });
    }
    function goTo(i){ index = (i + total) % total; update(); }
    function next(){ goTo(index + 1); }
    function prev(){ goTo(index - 1); }

    function startAuto(){ stopAuto(); autoTimer = setInterval(next, 4000); }
    function stopAuto(){ if (autoTimer) clearInterval(autoTimer); autoTimer = null; }

    window.addEventListener('resize', update);
    if (prevBtn) prevBtn.addEventListener('click', function(){ prev(); });
    if (nextBtn) nextBtn.addEventListener('click', function(){ next(); });
    if (dotsWrap) dots.forEach(function(d, i){ d.addEventListener('click', function(){ goTo(i); }); });

    // swipe/drag with real-time dragging
    var startX=0, down=false, startTransform=0;
    function onPointerDown(e){
      down = true;
      startX = e.clientX;
      startTransform = -index * getSlideWidth();
      track.style.transition = 'none';
      track.setPointerCapture && track.setPointerCapture(e.pointerId);
      if (container) container.classList.add('is-grabbing');
      stopAuto();
    }
    function onPointerMove(e){
      if(!down) return;
      var dx = e.clientX - startX;
      track.style.transform = 'translateX(' + (startTransform + dx) + 'px)';
      if (e.cancelable) e.preventDefault();
    }
    function onPointerUp(e){
      if(!down) return;
      down = false;
      var dx = e.clientX - startX;
      var threshold = Math.max(40, getSlideWidth() * 0.15);
      track.style.transition = '';
      if (container) container.classList.remove('is-grabbing');
      if (Math.abs(dx) > threshold) { if (dx < 0) next(); else prev(); } else { update(); }
      startAuto();
    }
    function onPointerCancel(){ down=false; track.style.transition=''; if (container) container.classList.remove('is-grabbing'); update(); }

    track.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, {passive:false});
    window.addEventListener('pointerup', onPointerUp);
    track.addEventListener('pointercancel', onPointerCancel);

    if (container){
      container.addEventListener('mouseenter', stopAuto);
      container.addEventListener('mouseleave', startAuto);
      container.addEventListener('touchstart', stopAuto, {passive:true});
      container.addEventListener('touchend', startAuto);
    }

    update();
    startAuto();
  }

  attachSlider('ev1-slider','ev1-prev','ev1-next','ev1-dots');
  attachSlider('ev2-slider','ev2-prev','ev2-next','ev2-dots');
  attachSlider('ev3-slider','ev3-prev','ev3-next','ev3-dots');
  attachSlider('ev4-slider','ev4-prev','ev4-next','ev4-dots');
  attachSlider('ev5-slider','ev5-prev','ev5-next','ev5-dots');

  // Smooth scroll for in-page quick links
  document.querySelectorAll('a[data-scroll]')
    .forEach(function(a){ a.addEventListener('click', function(e){ var href=a.getAttribute('href')||''; if(href.charAt(0) !== '#') return; e.preventDefault(); var el=document.getElementById(href.slice(1)); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); }); });
})();


