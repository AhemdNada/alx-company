// Simple, reusable card slider with autoplay, dots, and drag/swipe support
(function () {
  class CardSliderController {
    constructor(root) {
      this.root = root;
      this.slides = Array.from(root.querySelectorAll('.slide'));
      this.dotsContainer = root.querySelector('.dots');
      this.index = 0;
      this.timer = null;
      this.intervalMs = parseInt(root.getAttribute('data-autoplay') || '5000', 10);
      this.isDragging = false;
      this.startX = 0;
      this.deltaX = 0;

      this.init();
    }

    init() {
      if (this.slides.length === 0) return;
      this.createDots();
      this.update();
      this.bindEvents();
      this.start();
    }

    createDots() {
      if (!this.dotsContainer) return;
      this.dotsContainer.innerHTML = '';
      this.slides.forEach((_, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('aria-label', `Go to image ${i + 1}`);
        btn.addEventListener('click', () => {
          this.goTo(i);
          this.restart();
        });
        this.dotsContainer.appendChild(btn);
      });
    }

    bindEvents() {
      // Pause on hover
      this.root.addEventListener('mouseenter', () => this.stop());
      this.root.addEventListener('mouseleave', () => this.start());

      // Drag with mouse
      this.root.addEventListener('mousedown', (e) => this.onDragStart(e.clientX));
      window.addEventListener('mousemove', (e) => this.onDragMove(e.clientX));
      window.addEventListener('mouseup', () => this.onDragEnd());

      // Touch
      this.root.addEventListener('touchstart', (e) => this.onDragStart(e.touches[0].clientX), { passive: true });
      this.root.addEventListener('touchmove', (e) => this.onDragMove(e.touches[0].clientX), { passive: true });
      this.root.addEventListener('touchend', () => this.onDragEnd());

      // Visibility change (save CPU)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.stop(); else this.start();
      });
    }

    onDragStart(x) {
      this.isDragging = true;
      this.startX = x;
      this.deltaX = 0;
      this.stop();
    }

    onDragMove(x) {
      if (!this.isDragging) return;
      this.deltaX = x - this.startX;
    }

    onDragEnd() {
      if (!this.isDragging) return;
      const threshold = 40; // px
      if (this.deltaX < -threshold) {
        this.next();
      } else if (this.deltaX > threshold) {
        this.prev();
      }
      this.isDragging = false;
      this.deltaX = 0;
      this.start();
    }

    start() {
      if (this.timer) clearInterval(this.timer);
      this.timer = setInterval(() => this.next(), this.intervalMs);
    }

    stop() {
      if (this.timer) clearInterval(this.timer);
      this.timer = null;
    }

    restart() {
      this.stop();
      this.start();
    }

    goTo(i) {
      this.index = (i + this.slides.length) % this.slides.length;
      this.update();
    }

    next() { this.goTo(this.index + 1); }
    prev() { this.goTo(this.index - 1); }

    update() {
      this.slides.forEach((s, i) => s.classList.toggle('active', i === this.index));
      if (this.dotsContainer) {
        const dots = Array.from(this.dotsContainer.children);
        dots.forEach((d, i) => d.setAttribute('aria-current', i === this.index ? 'true' : 'false'));
      }
    }
  }

  function initAll() {
    const sliders = Array.from(document.querySelectorAll('.card-slider'));
    sliders.forEach(root => new CardSliderController(root));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();

