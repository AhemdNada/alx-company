// Minimal JS for details news page: gallery thumbs and cards slider
(function () {
  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  onReady(() => {
    // Gallery thumbnail -> main image swap
    const mainImg = document.getElementById('gallery-main');
    const thumbs = Array.from(document.querySelectorAll('#gallery-thumbs .thumb-btn img'));
    thumbs.forEach((img) => {
      img.addEventListener('click', () => {
        const full = img.getAttribute('data-full') || img.src;
        if (mainImg) {
          // Simple fade transition
          mainImg.style.opacity = '0';
          setTimeout(() => {
            mainImg.src = full;
            mainImg.alt = img.alt || 'Gallery image';
            mainImg.style.opacity = '1';
          }, 150);
        }
      });
    });

    // Gallery prev/next and active highlighting
    const galleryPrev = document.getElementById('gallery-prev');
    const galleryNext = document.getElementById('gallery-next');
    let activeIndex = 0;

    function setActive(index) {
      const imgs = thumbs;
      if (imgs.length === 0) return;
      activeIndex = (index + imgs.length) % imgs.length;
      const target = imgs[activeIndex];
      const full = target.getAttribute('data-full') || target.src;
      if (mainImg) {
        mainImg.style.opacity = '0';
        setTimeout(() => {
          mainImg.src = full;
          mainImg.alt = target.alt || 'Gallery image';
          mainImg.style.opacity = '1';
        }, 150);
      }
      // Update highlight styles
      thumbs.forEach((el, i) => {
        const btn = el.closest('.thumb-btn');
        if (!btn) return;
        if (i === activeIndex) {
          btn.classList.add('ring-2', 'ring-blue-500', 'shadow-md');
          btn.classList.remove('ring-1');
        } else {
          btn.classList.remove('ring-2', 'ring-blue-500', 'shadow-md');
          btn.classList.add('ring-1');
        }
      });
    }

    thumbs.forEach((img, i) => {
      img.addEventListener('click', () => setActive(i));
    });

    if (galleryPrev) galleryPrev.addEventListener('click', () => setActive(activeIndex - 1));
    if (galleryNext) galleryNext.addEventListener('click', () => setActive(activeIndex + 1));
    // Initialize active state
    setActive(0);

    // Cards slider
    const viewport = document.getElementById('cards-viewport');
    const track = document.getElementById('cards-track');
    const dotsContainer = document.getElementById('cards-dots');
    if (!viewport || !track || !dotsContainer) return;

    // Single-card centered slider (one slide visible at a time)
    const slides = Array.from(track.querySelectorAll('.slide'));
    let slideIndex = 0;

    function goToSlide(i) {
      slideIndex = (i + slides.length) % slides.length;
      const slideWidth = viewport.clientWidth;
      // Set widths
      track.style.width = `${slides.length * slideWidth}px`;
      slides.forEach((s) => (s.style.width = `${slideWidth}px`));
      // Animate translate
      track.style.transition = 'transform 500ms ease';
      track.style.transform = `translateX(-${slideIndex * slideWidth}px)`;
      updateDots2();
    }

    function buildDots2() {
      dotsContainer.innerHTML = '';
      for (let i = 0; i < slides.length; i++) {
        const dot = document.createElement('button');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.className = 'h-2.5 w-2.5 rounded-full bg-gray-300 hover:bg-blue-400 transition-colors';
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
      }
      updateDots2();
    }

    function updateDots2() {
      const dots = Array.from(dotsContainer.children);
      dots.forEach((d, i) => {
        if (i === slideIndex) {
          d.classList.add('bg-blue-600');
          d.classList.remove('bg-gray-300');
        } else {
          d.classList.remove('bg-blue-600');
          d.classList.add('bg-gray-300');
        }
      });
    }

    function onResizeSlides() {
      clearTimeout(onResizeSlides._t);
      onResizeSlides._t = setTimeout(() => goToSlide(slideIndex), 100);
    }

    window.addEventListener('resize', onResizeSlides);
    buildDots2();
    goToSlide(0);

    // Per-slide thumbnails behavior (each slide has its own small gallery)
    slides.forEach((slide) => {
      const main = slide.querySelector('img.slide-main');
      const thumbImgs = Array.from(slide.querySelectorAll('.slide-thumbs img'));
      if (!main || thumbImgs.length === 0) return;
      // highlight first
      function highlight(active) {
        thumbImgs.forEach((t) => {
          const btn = t.closest('button');
          if (!btn) return;
          if (t === active) {
            btn.classList.add('ring-2', 'ring-blue-500', 'shadow');
            btn.classList.remove('ring-1');
          } else {
            btn.classList.remove('ring-2', 'ring-blue-500', 'shadow');
            btn.classList.add('ring-1');
          }
        });
      }
      highlight(thumbImgs[0]);
      thumbImgs.forEach((ti) => {
        ti.addEventListener('click', () => {
          const full = ti.getAttribute('data-full') || ti.src;
          main.style.opacity = '0';
          setTimeout(() => {
            main.src = full;
            main.alt = ti.alt || 'Slide image';
            main.style.opacity = '1';
          }, 150);
          highlight(ti);
        });
      });
    });
  });
})();

