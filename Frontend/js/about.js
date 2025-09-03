/* Start Dynamic Sharing Rates */
(function(){
    var API_BASE = ((window && window.API_BASE) ? window.API_BASE : '/api').replace(/\/$/, '');

    var dynamicGrid = document.getElementById('sharing-grid');
    
    function renderSharing(rows){ 
        if (!dynamicGrid) return; 
        dynamicGrid.innerHTML = ''; 
        rows.forEach(function(row){ 
            var item = document.createElement('div'); 
            item.className = 'sr-item bg-white rounded-xl p-4 shadow-sm ring-1 ring-black/5'; 
            item.innerHTML = '\n          <div class="radial mx-auto" data-percentage="' + Number(row.percentage) + '">\n            <span class="percent text-gray-900">0%</span>\n          </div>\n          <div class="mt-3 text-center text-sm font-semibold text-gray-700">' + (row.title || '') + '</div>\n          <div class="mt-3 progress" data-percentage="' + Number(row.percentage) + '"><div class="fill"></div></div>\n        '; 
            dynamicGrid.appendChild(item); 
        }); 
        initSharingAnimations(); 
    }
    
    async function loadSharing(){ 
        try { 
            const r = await fetch(API_BASE + '/sharing-rates'); 
            const rows = await r.json(); 
            renderSharing(rows); 
        } catch(e){} 
    }

    var observer;
    
    function hexToRgb(hex){ 
        var res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); 
        return res ? { r: parseInt(res[1],16), g: parseInt(res[2],16), b: parseInt(res[3],16) } : { r:0,g:0,b:0 }; 
    }
    
    function getPalette(value){ 
        var v = Math.max(0, Math.min(100, value)); 
        if (v <= 20) return { key:'low', color:'#ef4444', from:'#fca5a5', to:'#ef4444' }; 
        if (v <= 40) return { key:'medium', color:'#f59e0b', from:'#fcd34d', to:'#f59e0b' }; 
        if (v <= 60) return { key:'good', color:'#10b981', from:'#6ee7b7', to:'#10b981' }; 
        if (v <= 80) return { key:'high', color:'#3b82f6', from:'#93c5fd', to:'#3b82f6' }; 
        return { key:'vhigh', color:'#8b5cf6', from:'#c4b5fd', to:'#8b5cf6' }; 
    }
    
    function animateItem(el){ 
        var radial = el.querySelector('.radial'); 
        var percentEl = el.querySelector('.radial .percent'); 
        var progress = el.querySelector('.progress'); 
        var fill = progress ? progress.querySelector('.fill') : null; 
        var target = parseInt((radial && radial.getAttribute('data-percentage')) || (progress && progress.getAttribute('data-percentage')) || '0', 10); 
        target = Math.max(0, Math.min(100, target)); 
        var pal = getPalette(target); 
        var rgb = hexToRgb(pal.color); 
        var rgbaSoft = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.15)'; 
        
        if (radial) { 
            radial.style.setProperty('--color', pal.color); 
            radial.style.setProperty('--track', '#e5e7eb'); 
            var current = 0; 
            var steps = 40; 
            var stepVal = target / steps; 
            var tick = function(){ 
                current += stepVal; 
                if (current >= target) current = target; 
                radial.style.setProperty('--p', current); 
                if (percentEl) { 
                    percentEl.textContent = Math.round(current) + '%'; 
                    percentEl.style.color = pal.color; 
                } 
                if (current < target) requestAnimationFrame(tick); 
            }; 
            requestAnimationFrame(tick); 
        } 
        
        if (fill) { 
            requestAnimationFrame(function(){ 
                fill.style.width = target + '%'; 
                fill.style.background = 'linear-gradient(90deg, ' + pal.from + ', ' + pal.to + ')'; 
                if (progress) progress.style.background = rgbaSoft; 
            }); 
        } 
        
        try { 
            el.style.position = 'relative'; 
            el.style.boxShadow = 'inset 0 0 0 1px rgba(0,0,0,0.04), 0 6px 16px ' + rgbaSoft; 
        } catch(e){} 
    }
    
    function onEnter(entries){ 
        entries.forEach(function(entry){ 
            if (entry.isIntersecting) { 
                animateItem(entry.target); 
                if (observer) observer.unobserve(entry.target); 
            } 
        }); 
    }
    
    function initSharingAnimations(){ 
        var items = Array.prototype.slice.call(document.querySelectorAll('.sr-item')); 
        if (!items.length) return; 
        observer = new IntersectionObserver(onEnter, { root: null, threshold: 0.25 }); 
        items.forEach(function(el){ observer.observe(el); }); 
    }

    loadSharing();
})();
/* End Dynamic Sharing Rates */

/* Start History Slider */
(function(){
    var track = document.getElementById('history-slider');
    if (!track) return;
    
    var slides = Array.prototype.slice.call(track.children);
    var total = slides.length; 
    var index = 0;
    var prevBtn = document.getElementById('history-prev');
    var nextBtn = document.getElementById('history-next');
    var dotsWrap = document.getElementById('history-dots');
    var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.children) : [];
    
    function update(){ 
        var offset = -index * track.clientWidth; 
        track.style.transform = 'translateX(' + offset + 'px)'; 
        if (dots.length){ 
            dots.forEach(function(d,i){ 
                if (i===index) d.setAttribute('aria-current','true'); 
                else d.removeAttribute('aria-current'); 
            }); 
        } 
    }
    
    function goTo(i){ 
        index = (i + total) % total; 
        update(); 
    }
    
    function onResize(){ 
        update(); 
    }
    
    window.addEventListener('resize', onResize);
    if (prevBtn) prevBtn.addEventListener('click', function(){ goTo(index - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function(){ goTo(index + 1); });
    if (dotsWrap) dots.forEach(function(d,i){ d.addEventListener('click', function(){ goTo(i); }); });
    
    var startX = 0; 
    var isDown = false;
    track.addEventListener('pointerdown', function(e){ 
        isDown = true; 
        startX = e.clientX; 
        track.setPointerCapture(e.pointerId); 
        track.classList.add('grabbing'); 
    });
    track.addEventListener('pointerup', function(e){ 
        if (!isDown) { 
            track.classList.remove('grabbing'); 
            return; 
        } 
        isDown = false; 
        var dx = e.clientX - startX; 
        if (Math.abs(dx) > 40) { 
            if (dx < 0) goTo(index + 1); 
            else goTo(index - 1); 
        } 
        track.classList.remove('grabbing'); 
    });
    track.addEventListener('pointercancel', function(){ 
        isDown = false; 
        track.classList.remove('grabbing'); 
    });
    
    var autoplay = setInterval(function(){ goTo(index + 1); }, 6000);
    var container = track.parentElement;
    if (container) { 
        container.addEventListener('mouseenter', function(){ 
            clearInterval(autoplay); 
            autoplay = null; 
        }); 
        container.addEventListener('mouseleave', function(){ 
            if (!autoplay) autoplay = setInterval(function(){ goTo(index + 1); }, 6000); 
        }); 
    }
    update();
})();
/* End History Slider */

/* Start ISO Slider */
(function(){
    var track = document.getElementById('iso-slider');
    if (!track) return;
    
    var slides = Array.prototype.slice.call(track.children);
    var total = slides.length; 
    var index = 0;
    var prevBtn = document.getElementById('iso-prev');
    var nextBtn = document.getElementById('iso-next');
    var dotsWrap = document.getElementById('iso-dots');
    var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.children) : [];
    
    function update(){ 
        var offset = -index * track.clientWidth; 
        track.style.transform = 'translateX(' + offset + 'px)'; 
        if (dots.length){ 
            dots.forEach(function(d,i){ 
                if (i===index) d.setAttribute('aria-current','true'); 
                else d.removeAttribute('aria-current'); 
            }); 
        } 
    }
    
    function goTo(i){ 
        index = (i + total) % total; 
        update(); 
    }
    
    function onResize(){ 
        update(); 
    }
    
    window.addEventListener('resize', onResize);
    if (prevBtn) prevBtn.addEventListener('click', function(){ goTo(index - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function(){ goTo(index + 1); });
    if (dotsWrap) dots.forEach(function(d,i){ d.addEventListener('click', function(){ goTo(i); }); });
    
    var startX = 0; 
    var isDown = false;
    track.addEventListener('pointerdown', function(e){ 
        isDown = true; 
        startX = e.clientX; 
        track.setPointerCapture(e.pointerId); 
        track.classList.add('grabbing'); 
    });
    track.addEventListener('pointerup', function(e){ 
        if (!isDown) { 
            track.classList.remove('grabbing'); 
            return; 
        } 
        isDown = false; 
        var dx = e.clientX - startX; 
        if (Math.abs(dx) > 40) { 
            if (dx < 0) goTo(index + 1); 
            else goTo(index - 1); 
        } 
        track.classList.remove('grabbing'); 
    });
    track.addEventListener('pointercancel', function(){ 
        isDown = false; 
        track.classList.remove('grabbing'); 
    });
    
    var autoplay = setInterval(function(){ goTo(index + 1); }, 7000);
    var container = track.parentElement;
    if (container) { 
        container.addEventListener('mouseenter', function(){ 
            clearInterval(autoplay); 
            autoplay = null; 
        }); 
        container.addEventListener('mouseleave', function(){ 
            if (!autoplay) autoplay = setInterval(function(){ goTo(index + 1); }, 7000); 
        }); 
    }
    update();
})();
/* End ISO Slider */

/* Start Chairmen Center Stage Slider */
(function(){
    var API_BASE = ((window && window.API_BASE) ? window.API_BASE : '/api').replace(/\/$/, '');
    var stage = document.getElementById('chairmen-stage');
    if (!stage) return;
    
    function renderChairmen(cards){ 
        stage.innerHTML = ''; 
        cards.forEach(function(item, idx){ 
            var wrapper = document.createElement('div'); 
            wrapper.className = 'chairman-item'; 
            wrapper.setAttribute('data-index', String(idx)); 
            wrapper.innerHTML = '\n        <div class="photo">' + (item.imageUrl ? ('<img src="' + item.imageUrl + '" alt="' + (item.name || '') + '" />') : '') + '</div>\n        <div class="caption"><h4>' + (item.name || '') + '</h4><p>' + (item.subtitle || '') + '</p><p>' + (item.description || '') + '</p></div>'; 
            stage.appendChild(wrapper); 
        }); 
    }
    
    function initSlider(featureIndex){ 
        var items = Array.prototype.slice.call(stage.querySelectorAll('.chairman-item')); 
        if (!items.length) return; 
        
        var prevBtn = document.getElementById('chairmen-prev'); 
        var nextBtn = document.getElementById('chairmen-next'); 
        var index = Math.max(0, Math.min(items.length-1, typeof featureIndex==='number' ? featureIndex : 0)); 
        
        function applyClasses(){ 
            items.forEach(function(it){ 
                it.classList.remove('active','prev','next'); 
            }); 
            var active = items[index]; 
            var prev = items[(index - 1 + items.length) % items.length]; 
            var next = items[(index + 1) % items.length]; 
            if (active) active.classList.add('active'); 
            if (prev) prev.classList.add('prev'); 
            if (next) next.classList.add('next'); 
        } 
        
        function go(delta){ 
            index = (index + delta + items.length) % items.length; 
            applyClasses(); 
        } 
        
        if (prevBtn) prevBtn.addEventListener('click', function(){ go(-1); }); 
        if (nextBtn) nextBtn.addEventListener('click', function(){ go(1); }); 
        
        items.forEach(function(it, i){ 
            it.addEventListener('click', function(){ 
                index = i; 
                applyClasses(); 
            }); 
        }); 
        
        var startX = 0; 
        var isDown = false;
        stage.addEventListener('pointerdown', function(e){ 
            isDown = true; 
            startX = e.clientX; 
            stage.setPointerCapture(e.pointerId); 
            stage.classList.add('grabbing'); 
        });
        stage.addEventListener('pointerup', function(e){ 
            if (!isDown) { 
                stage.classList.remove('grabbing'); 
                return; 
            } 
            isDown = false; 
            var dx = e.clientX - startX; 
            if (Math.abs(dx) > 40) { 
                if (dx < 0) go(1); 
                else go(-1); 
            } 
            stage.classList.remove('grabbing'); 
        });
        stage.addEventListener('pointercancel', function(){ 
            isDown = false; 
            stage.classList.remove('grabbing'); 
        });
        
        applyClasses(); 
    }
    
    async function loadAndInit(){ 
        try { 
            const r = await fetch(API_BASE + '/chairmen'); 
            const rows = await r.json(); 
            renderChairmen(rows); 
            var fIndex = rows.findIndex(function(r){ return r.isFeatured; }); 
            initSlider(fIndex >= 0 ? fIndex : 0); 
        } catch(e){} 
    }
    
    loadAndInit();
    try { 
        var es2 = new EventSource('/api/stream'); 
        es2.addEventListener('chairmen:update', function(){ loadAndInit(); }); 
    } catch(e){}
})();
/* End Chairmen Center Stage Slider */

/* Start FAQs Accordion */
(function(){
    var faqItems = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));
    if (faqItems.length === 0) return;
    
    var questions = faqItems.map(function(item){ return item.querySelector('.faq-question'); });
    var answers = faqItems.map(function(item){ return item.querySelector('.faq-answer'); });
    var icons = faqItems.map(function(item){ return item.querySelector('.faq-icon'); });
    var openIndex = 0;
    
    function closeAll(){ 
        answers.forEach(function(a){ 
            if (a) a.style.maxHeight = '0px'; 
        }); 
        icons.forEach(function(ic){ 
            if (ic) ic.classList.remove('rotate-180'); 
        }); 
    }
    
    function openAt(idx){ 
        if (!answers[idx]) return; 
        answers[idx].style.maxHeight = answers[idx].scrollHeight + 'px'; 
        if (icons[idx]) icons[idx].classList.add('rotate-180'); 
        openIndex = idx; 
    }
    
    closeAll(); 
    openAt(0);
    
    questions.forEach(function(q,i){ 
        if (!q) return; 
        q.addEventListener('click', function(){ 
            if (i===openIndex) { 
                closeAll(); 
                openIndex=-1; 
            } else { 
                closeAll(); 
                openAt(i); 
            } 
        }); 
    });
    
    window.addEventListener('resize', function(){ 
        if (openIndex>=0 && answers[openIndex]) { 
            answers[openIndex].style.maxHeight = answers[openIndex].scrollHeight + 'px'; 
        } 
    });
})();
/* End FAQs Accordion */

