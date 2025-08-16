// Start home section slider
(function () {
    class HeroSlider {
      constructor() {
        this.currentSlide = 1;
        this.totalSlides = 3;
        this.slideInterval = 10000;
  
        this.slides = document.querySelectorAll('.slide');
        this.progressBars = document.querySelectorAll('.progress-bar');
        this.prevBtn = document.getElementById('prevSlide');
        this.nextBtn = document.getElementById('nextSlide');
        this.heroSlider = document.querySelector('.hero-slider');
  
        this.autoSlideTimer = null;
        this.init();
      }
  
      init() {
        this.bindEvents();
        this.startSlideShow();
      }
  
      bindEvents() {
        if (this.prevBtn) {
          this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        if (this.nextBtn) {
          this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
  
        this.progressBars.forEach((bar, index) => {
          const parent = bar.parentElement;
          if (parent) {
            parent.addEventListener('click', () => this.goToSlide(index + 1));
          }
        });
  
        if (this.heroSlider) {
          this.heroSlider.addEventListener('mouseenter', () => this.pauseSlideShow());
          this.heroSlider.addEventListener('mouseleave', () => this.resumeSlideShow());
  
          let startX = 0;
          this.heroSlider.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX;
          });
          this.heroSlider.addEventListener('touchend', e => {
            this.handleSwipe(startX, e.changedTouches[0].clientX);
          });
        }
      }
  
      handleSwipe(startX, endX) {
        const diff = startX - endX;
        if (Math.abs(diff) > 50) {
          diff > 0 ? this.nextSlide() : this.prevSlide();
        }
      }
  
      goToSlide(slideNumber) {
        this.slides.forEach(slide => (slide.style.opacity = '0'));
  
        const targetSlide = document.querySelector(`[data-slide="${slideNumber}"]`);
        if (targetSlide) {
          targetSlide.style.opacity = '1';
        }
  
        this.currentSlide = slideNumber;
        this.restartSlideShow();
      }
  
      nextSlide() {
        this.goToSlide(this.currentSlide === this.totalSlides ? 1 : this.currentSlide + 1);
      }
  
      prevSlide() {
        this.goToSlide(this.currentSlide === 1 ? this.totalSlides : this.currentSlide - 1);
      }
  
      startSlideShow() {
        this.updateProgressBars();
        this.autoSlideTimer = setInterval(() => this.nextSlide(), this.slideInterval);
      }
  
      pauseSlideShow() {
        clearInterval(this.autoSlideTimer);
        this.clearProgressBars();
      }
  
      resumeSlideShow() {
        this.startSlideShow();
      }
  
      restartSlideShow() {
        this.pauseSlideShow();
        this.startSlideShow();
      }
  
      clearProgressBars() {
        this.progressBars.forEach(bar => {
          bar.style.width = '0%';
          bar.classList.remove('active');
        });
      }
  
      updateProgressBars() {
        this.clearProgressBars();
        const currentBar = document.querySelector(`.progress-bar[data-slide="${this.currentSlide}"]`);
        if (currentBar) {
          // Force reflow before animation
          void currentBar.offsetHeight;
          currentBar.style.transition = `width ${this.slideInterval}ms ease-out`;
          currentBar.style.width = '100%';
        }
      }
    }
  
    document.addEventListener('DOMContentLoaded', () => new HeroSlider());
  })();
// end home section slider

// start news banner
(function () {
    const banner = document.getElementById('cn-banner');
    if (!banner) return;
  
    const track = banner.querySelector('.cn-track');
    const ticker = banner.querySelector('.cn-ticker');
    const closeBtn = banner.querySelector('#cn-close');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
    let reShowTimer = null;
    let index = 0;
  
    // Placeholder rotating news (replace with API later)
    const newsItems = [
      'APC expands environmental programs and strengthens ISO certifications across operations.',
      'Safety milestone: 1,000,000+ working hours with zero LTI achieved this quarter.',
      'New vapour recovery enhancements reduce emissions while improving efficiency.',
      'Digital transformation: modernized lab systems accelerate quality analytics.',
      'Sustainability spotlight: energy optimization delivers measurable savings.',
      'Community initiative launched to support local technical education.'
    ];
  
    function setTopOffset() {
      const nav = document.querySelector('nav');
      const navHeight = nav?.offsetHeight || 80;
      banner.style.top = `${navHeight + 8}px`; // +8px breathing room
    }
  
    function applyText(text) {
      if (!track) return;
  
      // Reset ticker state
      track.classList.remove(
        'cn-ticker-animate',
        'whitespace-nowrap',
        'will-change-transform',
        'cn-text-enter'
      );
      track.style.removeProperty('--cn-distance');
      track.style.removeProperty('--cn-duration');
      track.innerHTML = '';
  
      // Add new text
      const span = document.createElement('span');
      span.className = 'inline-block';
      span.textContent = text;
      track.appendChild(span);
  
      // Fade-in animation
      void track.offsetHeight; // Force reflow
      track.classList.add('cn-text-enter');
  
      // Setup ticker on next frame
      requestAnimationFrame(() => setupTicker(text));
    }
  
    function setupTicker(text) {
      if (!ticker || !track) return;
  
      const containerWidth = ticker.clientWidth;
      const contentWidth = track.scrollWidth;
  
      if (!prefersReducedMotion && contentWidth > containerWidth + 12) {
        // Duplicate text for seamless loop
        track.innerHTML = '';
        const sep = '   •   ';
        const a = document.createElement('span');
        const b = document.createElement('span');
        [a, b].forEach(s => {
          s.className = 'inline-block pr-8';
          s.textContent = text + sep;
        });
        track.append(a, b);
  
        const distance = a.scrollWidth;
        const speedPxPerSec = 85;
        const duration = Math.max(12, distance / speedPxPerSec);
  
        track.style.setProperty('--cn-distance', `${distance}px`);
        track.style.setProperty('--cn-duration', `${duration}s`);
        track.classList.add('cn-ticker-animate', 'whitespace-nowrap', 'will-change-transform');
      } else {
        track.classList.add('whitespace-normal', 'break-words');
      }
    }
  
    function showBanner() {
      if (reShowTimer) {
        clearTimeout(reShowTimer);
        reShowTimer = null;
      }
      banner.style.display = '';
      banner.style.opacity = '1';
      banner.classList.remove('cn-enter');
      void banner.offsetHeight; // Force reflow
      banner.classList.add('cn-enter');
    }
  
    function hideBanner() {
      banner.style.opacity = '0';
      banner.style.display = 'none';
      if (reShowTimer) clearTimeout(reShowTimer);
      reShowTimer = setTimeout(showBanner, 30000); // Re-show after 30s
    }
  
    function rotateNews() {
      index = (index + 1) % newsItems.length;
      applyText(newsItems[index]);
    }
  
    function debounce(fn, delay) {
      let t;
      return function (...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), delay);
      };
    }
  
    function init() {
      setTopOffset();
      window.addEventListener('resize', debounce(() => {
        setTopOffset();
        setupTicker(track?.textContent || '');
      }, 150));
  
      applyText(newsItems[index]);
      showBanner();
  
      setInterval(rotateNews, 15000);
  
      if (closeBtn) {
        closeBtn.addEventListener('click', hideBanner);
      }
    }
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();
// end news banner


// start investments tabs, faq accordion, and project filter buttons
(function () {
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }
// srart  investments tabs, faq accordion, and project filter buttons
  onReady(() => {
    // Investments: tabbed content buttons
    const navButtons = Array.from(document.querySelectorAll('.nav-btn'));
    const contentSections = Array.from(document.querySelectorAll('.content-section'));

    if (navButtons.length > 0 && contentSections.length > 0) {
      navButtons.forEach((button) => {
        button.addEventListener('click', () => {
          const targetId = button.getAttribute('data-target');
          if (!targetId) return;

          // Toggle button active styles
          navButtons.forEach((b) => {
            b.classList.remove('active', 'bg-blue-600', 'text-white');
            b.classList.add('bg-gray-200', 'text-gray-700');
            b.setAttribute('aria-selected', 'false');
          });
          button.classList.add('active', 'bg-blue-600', 'text-white');
          button.classList.remove('bg-gray-200', 'text-gray-700');
          button.setAttribute('aria-selected', 'true');

          // Show target section, hide others
          contentSections.forEach((section) => {
            if (section.id === targetId) {
              section.classList.remove('hidden');
              section.classList.add('active');
            } else {
              section.classList.add('hidden');
              section.classList.remove('active');
            }
          });
        });
      });
    }

    // FAQ accordion
    const faqItems = Array.from(document.querySelectorAll('.faq-item'));
    faqItems.forEach((item) => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      const icon = item.querySelector('.faq-icon');
      if (!question || !answer) return;

      // Normalize any initially-open item to its scroll height
      const initialMax = parseInt(answer.style.maxHeight || '0', 10);
      if (initialMax > 0) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
        if (icon) icon.classList.add('rotate-180');
      } else {
        answer.style.maxHeight = '0px';
      }

      question.addEventListener('click', () => {
        const isOpen = parseInt(answer.style.maxHeight || '0', 10) > 0;
        if (isOpen) {
          // Close the currently open item
          answer.style.maxHeight = '0px';
          if (icon) icon.classList.remove('rotate-180');
        } else {
          // Close all other FAQ items to ensure only one is open at a time
          faqItems.forEach((otherItem) => {
            if (otherItem !== item) {
              const otherAnswer = otherItem.querySelector('.faq-answer');
              const otherIcon = otherItem.querySelector('.faq-icon');
              if (otherAnswer) otherAnswer.style.maxHeight = '0px';
              if (otherIcon) otherIcon.classList.remove('rotate-180');
            }
          });

          // Open the clicked item
          answer.style.maxHeight = answer.scrollHeight + 'px';
          if (icon) icon.classList.add('rotate-180');
        }
      });
    });

    // Projects filter buttons (UI active state only for now)
    const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
    if (filterButtons.length > 0) {
      filterButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          filterButtons.forEach((b) => {
            b.classList.remove('active', 'bg-blue-600', 'text-white');
            b.classList.add('bg-gray-200', 'text-gray-700');
          });
          btn.classList.add('active', 'bg-blue-600', 'text-white');
          btn.classList.remove('bg-gray-200', 'text-gray-700');
        });
      });
    }
  });
})();
// end investments tabs, faq accordion, and project filter buttons