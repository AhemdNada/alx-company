// Smooth scroll
(function(){
    function onReady(fn){
        if(document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', fn); } else { fn(); }
    }

    onReady(function(){
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
    });
})();


