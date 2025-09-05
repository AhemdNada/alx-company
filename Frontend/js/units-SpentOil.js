// Slider 
(function(){
    function onReady(fn){ if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded', fn);} else { fn(); } }
    onReady(function(){
        var slider = document.querySelector('.uds-slider .uds-track');
        var prevBtn = document.querySelector('.uds-slider .uds-prev');
        var nextBtn = document.querySelector('.uds-slider .uds-next');
        var dotsWrap = document.querySelector('.uds-slider .uds-dots');
        if(!slider) return;
        var isDown=false, startX=0, startLeft=0;
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.uds-slide'));
        var activeIndex = 0;

        slider.addEventListener('mousedown', function(e){ isDown=true; slider.classList.add('cursor-grabbing'); startX=e.pageX; startLeft=slider.scrollLeft; });
        slider.addEventListener('mouseleave', function(){ isDown=false; slider.classList.remove('cursor-grabbing'); });
        slider.addEventListener('mouseup', function(){ isDown=false; slider.classList.remove('cursor-grabbing'); });
        slider.addEventListener('mousemove', function(e){ if(!isDown) return; e.preventDefault(); slider.scrollLeft = startLeft - (e.pageX - startX)*1.2; });

        slider.addEventListener('touchstart', function(e){ var t=e.touches[0]; startX=t.pageX; startLeft=slider.scrollLeft; }, {passive:true});
        slider.addEventListener('touchmove', function(e){ var t=e.touches[0]; slider.scrollLeft = startLeft - (t.pageX - startX)*1.1; }, {passive:true});

        function slideTo(i){ if(i<0) i=0; if(i>slides.length-1) i=slides.length-1; activeIndex=i; slider.scrollTo({left: slider.clientWidth*i, behavior:'smooth'}); updateDots(); }
        function slideBy(d){ slideTo(activeIndex + d); }

        function buildDots(){ if(!dotsWrap) return; dotsWrap.innerHTML=''; slides.forEach(function(_,i){ var b=document.createElement('button'); b.type='button'; b.className='uds-dot'; b.addEventListener('click', function(){ slideTo(i); }); dotsWrap.appendChild(b); }); updateDots(); }
        function updateDots(){ if(!dotsWrap) return; var ds=dotsWrap.querySelectorAll('.uds-dot'); ds.forEach(function(d,i){ if(i===activeIndex) d.classList.add('active'); else d.classList.remove('active'); }); }

        slider.addEventListener('scroll', function(){ var idx=Math.round(slider.scrollLeft/(slider.clientWidth||1)); if(idx!==activeIndex){ activeIndex=idx; updateDots(); } });

        buildDots();
        if(prevBtn) prevBtn.addEventListener('click', function(){ slideBy(-1); });
        if(nextBtn) nextBtn.addEventListener('click', function(){ slideBy(1); });
    });
})();

