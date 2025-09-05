// Smooth scroll 
(function(){
    function onReady(fn){
        if(document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', fn); } else { fn(); }
    }

    onReady(function(){
        // Smooth scroll quick links
        var links = Array.prototype.slice.call(document.querySelectorAll('a.prod-link[href^="#"]'));
        links.forEach(function(a){
            a.addEventListener('click', function(e){
                var targetId = a.getAttribute('href');
                if(!targetId || targetId === '#') return;
                var el = document.querySelector(targetId);
                if(!el) return;
                e.preventDefault();
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                history.pushState(null, '', targetId);
            });
        });

        
        var slider = document.querySelector('.uds-slider .uds-track');
        var prevBtn = document.querySelector('.uds-slider .uds-prev');
        var nextBtn = document.querySelector('.uds-slider .uds-next');
        var dotsWrap = document.querySelector('.uds-slider .uds-dots');
        if (slider) {
            var isDown = false;
            var startX = 0;
            var scrollLeft = 0;
            var slides = Array.prototype.slice.call(slider.querySelectorAll('.uds-slide'));
            var activeIndex = 0;

            slider.addEventListener('mousedown', function(e){
                isDown = true;
                slider.classList.add('cursor-grabbing');
                startX = e.pageX - slider.offsetLeft;
                scrollLeft = slider.scrollLeft;
            });
            slider.addEventListener('mouseleave', function(){
                isDown = false;
                slider.classList.remove('cursor-grabbing');
            });
            slider.addEventListener('mouseup', function(){
                isDown = false;
                slider.classList.remove('cursor-grabbing');
            });
            slider.addEventListener('mousemove', function(e){
                if(!isDown) return;
                e.preventDefault();
                var x = e.pageX - slider.offsetLeft;
                var walk = (x - startX) * 1.2;
                slider.scrollLeft = scrollLeft - walk;
            });

            
            var startTouchX = 0;
            var startScrollLeft = 0;
            slider.addEventListener('touchstart', function(e){
                var t = e.touches[0];
                startTouchX = t.pageX;
                startScrollLeft = slider.scrollLeft;
            }, { passive: true });
            slider.addEventListener('touchmove', function(e){
                var t = e.touches[0];
                var walk = (t.pageX - startTouchX) * 1.1;
                slider.scrollLeft = startScrollLeft - walk;
            }, { passive: true });

            function slideTo(index){
                if (index < 0) index = 0;
                if (index > slides.length - 1) index = slides.length - 1;
                activeIndex = index;
                var width = slider.clientWidth;
                slider.scrollTo({ left: width * index, behavior: 'smooth' });
                updateDots();
            }
            function slideBy(dir){ slideTo(activeIndex + dir); }

            function buildDots(){
                if (!dotsWrap) return;
                dotsWrap.innerHTML = '';
                slides.forEach(function(_, i){
                    var b = document.createElement('button');
                    b.type = 'button';
                    b.className = 'uds-dot';
                    b.setAttribute('aria-label', 'Go to slide ' + (i+1));
                    b.addEventListener('click', function(){ slideTo(i); });
                    dotsWrap.appendChild(b);
                });
                updateDots();
            }
            function updateDots(){
                if (!dotsWrap) return;
                var dots = dotsWrap.querySelectorAll('.uds-dot');
                dots.forEach(function(d, i){
                    if (i === activeIndex) d.classList.add('active'); else d.classList.remove('active');
                });
            }

            slider.addEventListener('scroll', function(){
                var width = slider.clientWidth;
                var idx = Math.round(slider.scrollLeft / (width || 1));
                if (idx !== activeIndex){ activeIndex = idx; updateDots(); }
            });

            buildDots();

            if (prevBtn) prevBtn.addEventListener('click', function(){ slideBy(-1); });
            if (nextBtn) nextBtn.addEventListener('click', function(){ slideBy(1); });
        }
    });
})();


