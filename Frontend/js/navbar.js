// Start Navbar and mobile menu interactions
(function () {
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileMenuContainer = document.querySelector('.mobile-menu-container');
  
    const openMobileMenu = () => {
      if (!mobileMenuOverlay || !mobileMenuContainer) return;
      mobileMenuOverlay.classList.add('active');
      mobileMenuContainer.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
  
    const closeMobileMenu = () => {
      if (!mobileMenuOverlay || !mobileMenuContainer) return;
      mobileMenuOverlay.classList.remove('active');
      mobileMenuContainer.classList.remove('open');
      document.body.style.overflow = '';
    };
  
    // Open & Close buttons
    if (mobileMenuButton) {
      mobileMenuButton.addEventListener('click', openMobileMenu);
    }
    if (mobileMenuClose) {
      mobileMenuClose.addEventListener('click', closeMobileMenu);
    }
    if (mobileMenuOverlay) {
      mobileMenuOverlay.addEventListener('click', closeMobileMenu);
    }
  
    // Close menu when clicking any link inside it
    document.querySelectorAll('.mobile-menu-container a').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  
    // Close menu on ESC key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    });
  
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') return;
  
        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;
  
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth' });
      });
    });
  
    // Scroll progress bar
    (function () {
      if (document.querySelector('.scroll-progress')) return;
      
      const style = document.createElement('style');
      style.textContent = `
      .scroll-progress{position:fixed;top:0;left:0;right:0;height:3px;z-index:9999;pointer-events:none;opacity:1;transition:opacity .2s ease}
      .scroll-progress.is-hidden{opacity:0}
      .scroll-progress__bar{height:100%;background:linear-gradient(90deg,#3b82f6,#60a5fa);box-shadow:0 0 0 1px rgba(59,130,246,.15),0 0 8px rgba(59,130,246,.35) inset;transform:scaleX(0);transform-origin:0 50%;transition:transform .1s ease-out,width .1s ease-out;border-bottom-left-radius:2px;border-bottom-right-radius:2px}
      `;
      document.head.appendChild(style);
      
      const progressContainer = document.createElement('div');
      progressContainer.className = 'scroll-progress is-hidden';
      progressContainer.setAttribute('aria-hidden', 'true');
      const progressBar = document.createElement('div');
      progressBar.className = 'scroll-progress__bar';
      progressContainer.appendChild(progressBar);
      document.body.appendChild(progressContainer);
      
      // Position the bar right below the sticky navbar (if present)
      const positionBarBelowNavbar = () => {
        const navEl = document.querySelector('nav');
        let topOffset = 0;
        if (navEl) {
          const height = navEl.offsetHeight || navEl.getBoundingClientRect().height || 0;
          topOffset = Math.max(height, 0);
        }
        progressContainer.style.top = topOffset + 'px';
      };
      positionBarBelowNavbar();
      window.addEventListener('resize', positionBarBelowNavbar);
      
      const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let ticking = false;
      const update = () => {
        const doc = document.documentElement;
        const scrollTop = window.pageYOffset || doc.scrollTop || 0;
        const viewportHeight = window.innerHeight || doc.clientHeight || 0;
        const scrollHeight = doc.scrollHeight || 0;
        const scrollable = Math.max(scrollHeight - viewportHeight, 0);
        const progress = scrollable > 0 ? Math.min(scrollTop / scrollable, 1) : 0;
        if (prefersReducedMotion) {
          progressBar.style.width = (progress * 100) + '%';
        } else {
          progressBar.style.width = '';
          progressBar.style.transform = 'scaleX(' + progress + ')';
        }
        if (scrollable > 8) {
          progressContainer.classList.remove('is-hidden');
        } else {
          progressContainer.classList.add('is-hidden');
        }
        ticking = false;
      };
      const requestTick = () => {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      };
      window.addEventListener('scroll', requestTick, { passive: true });
      window.addEventListener('resize', requestTick);
      update();
    })();
  })();
  // end Navbar and mobile menu interactions
  