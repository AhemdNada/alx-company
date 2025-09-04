(function(){
  function attachSlider(trackId, prevId, nextId, dotsId){
    var track = document.getElementById(trackId);
    if (!track) return;
    var container = track.parentElement; 
    var total = track.children.length;
    var index = 0;
    var prevBtn = document.getElementById(prevId);
    var nextBtn = document.getElementById(nextId);
    var dotsWrap = document.getElementById(dotsId);
    var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.children) : [];
    var autoTimer = null;

    function getSlideWidth(){ return container ? container.clientWidth : 0; }
    function update(){
      track.style.transform = 'translateX(' + (-index * getSlideWidth()) + 'px)';
      if (dots.length) dots.forEach(function(d,i){ if(i===index) d.setAttribute('aria-current','true'); else d.removeAttribute('aria-current'); });
    }
    function goTo(i){ index = (i + total) % total; update(); }
    function next(){ goTo(index + 1); }
    function prev(){ goTo(index - 1); }
    function startAuto(){ stopAuto(); autoTimer = setInterval(next, 4000);} 
    function stopAuto(){ if(autoTimer) clearInterval(autoTimer); autoTimer=null; }

    window.addEventListener('resize', update);
    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);
    if (dotsWrap) dots.forEach(function(d,i){ d.addEventListener('click', function(){ goTo(i); }); });

    var startX=0, down=false, startTransform=0;
    function onPointerDown(e){ down=true; startX=e.clientX; startTransform=-index*getSlideWidth(); track.style.transition='none'; track.setPointerCapture && track.setPointerCapture(e.pointerId); if(container) container.classList.add('is-grabbing'); stopAuto(); }
    function onPointerMove(e){ if(!down) return; var dx=e.clientX-startX; track.style.transform='translateX('+(startTransform+dx)+'px)'; if(e.cancelable) e.preventDefault(); }
    function onPointerUp(e){ if(!down) return; down=false; var dx=e.clientX-startX; var th=Math.max(40, getSlideWidth()*0.15); track.style.transition=''; if(container) container.classList.remove('is-grabbing'); if(Math.abs(dx)>th){ if(dx<0) next(); else prev(); } else update(); startAuto(); }
    function onPointerCancel(){ down=false; track.style.transition=''; if(container) container.classList.remove('is-grabbing'); update(); }

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

  
  for (var i=1;i<=21;i++){
    attachSlider('qs'+i+'-slider','qs'+i+'-prev','qs'+i+'-next','qs'+i+'-dots');
  }

 
  document.querySelectorAll('a[data-scroll]').forEach(function(a){
    a.addEventListener('click', function(e){ var href=a.getAttribute('href')||''; if(href.charAt(0) !== '#') return; e.preventDefault(); var el=document.getElementById(href.slice(1)); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); });
  });
})();


