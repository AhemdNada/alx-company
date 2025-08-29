// ===============================
// Navbar & Mobile Menu Interactions
// ===============================
(function () {
  const mobileMenuButton = document.querySelector('.mobile-menu-button');
  const mobileMenuClose = document.querySelector('.mobile-menu-close');
  const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
  const mobileMenuContainer = document.querySelector('.mobile-menu-container');

  // Debug logging
  console.log('Mobile menu elements found:', {
    button: !!mobileMenuButton,
    close: !!mobileMenuClose,
    overlay: !!mobileMenuOverlay,
    container: !!mobileMenuContainer,
  });

  // ===============================
  // Utility
  // ===============================
  const elementsExist = () => mobileMenuOverlay && mobileMenuContainer;

  // ===============================
  // Menu Open/Close Functions
  // ===============================
  const openMobileMenu = () => {
    console.log('Opening mobile menu...');
    if (!elementsExist()) return console.error('Mobile menu elements not found');

    mobileMenuOverlay.classList.add('active');
    mobileMenuContainer.classList.add('open');
    document.body.classList.add('menu-open');
    console.log('Mobile menu opened');
  };

  const closeMobileMenu = () => {
    console.log('Closing mobile menu...');
    if (!elementsExist()) return console.error('Mobile menu elements not found');

    mobileMenuOverlay.classList.remove('active');
    mobileMenuContainer.classList.remove('open');
    document.body.classList.remove('menu-open');
    console.log('Mobile menu closed');
  };

  // ===============================
  // Event Listeners (Open/Close)
  // ===============================
  const menuEvents = [
    { el: mobileMenuButton, type: 'click', handler: openMobileMenu, name: 'button' },
    { el: mobileMenuClose, type: 'click', handler: closeMobileMenu, name: 'close button' },
    { el: mobileMenuOverlay, type: 'click', handler: closeMobileMenu, name: 'overlay' },
  ];

  menuEvents.forEach(({ el, type, handler, name }) => {
    if (el) {
      el.addEventListener(type, (e) => {
        if (type === 'click') e.preventDefault();
        handler();
      });
      console.log(`Mobile menu ${name} event listener added`);
    } else {
      console.error(`Mobile menu ${name} not found`);
    }
  });

  // ===============================
  // Close menu when clicking any link inside it
  // ===============================
  const menuLinks = document.querySelectorAll('.mobile-menu-container a');
  menuLinks.forEach((link) => link.addEventListener('click', closeMobileMenu));
  console.log(`Added event listeners to ${menuLinks.length} menu links`);

  // ===============================
  // Close menu on ESC key
  // ===============================
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });

  // ===============================
  // Set active menu item based on current page
  // ===============================
  const setActiveMenuItem = () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const menuLinks = document.querySelectorAll('.menu-link');

    menuLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
      }
    });

    console.log(`Set active menu item for: ${currentPage}`);
  };
  setActiveMenuItem();

  // ===============================
  // Smooth scroll for anchor links
  // ===============================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      e.preventDefault();
      targetElement.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // ===============================
  // Scroll progress bar
  // ===============================
  (function () {
    if (document.querySelector('.scroll-progress')) return;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .scroll-progress{position:fixed;top:0;left:0;right:0;height:3px;z-index:9999;pointer-events:none;opacity:1;transition:opacity .2s ease}
      .scroll-progress.is-hidden{opacity:0}
      .scroll-progress__bar{height:100%;background:linear-gradient(90deg,#3b82f6,#60a5fa);box-shadow:0 0 0 1px rgba(59,130,246,.15),0 0 8px rgba(59,130,246,.35) inset;transform:scaleX(0);transform-origin:0 50%;transition:transform .1s ease-out,width .1s ease-out;border-bottom-left-radius:2px;border-bottom-right-radius:2px}
    `;
    document.head.appendChild(style);

    // Create progress bar
    const progressContainer = document.createElement('div');
    progressContainer.className = 'scroll-progress is-hidden';
    progressContainer.setAttribute('aria-hidden', 'true');

    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress__bar';
    progressContainer.appendChild(progressBar);

    const navEl = document.querySelector('nav');
    if (navEl) navEl.appendChild(progressContainer);

    // Position bar below navbar
    const positionBarBelowNavbar = () => {
      const navEl = document.querySelector('nav');
      let topOffset = navEl ? (navEl.offsetHeight || navEl.getBoundingClientRect().height || 0) : 0;
      progressContainer.style.top = `${Math.max(topOffset, 0)}px`;
    };
    positionBarBelowNavbar();
    window.addEventListener('resize', positionBarBelowNavbar);

    // Update scroll progress
    const prefersReducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ticking = false;

    const update = () => {
      const doc = document.documentElement;
      const scrollTop = window.pageYOffset || doc.scrollTop || 0;
      const viewportHeight = window.innerHeight || doc.clientHeight || 0;
      const scrollHeight = doc.scrollHeight || 0;
      const scrollable = Math.max(scrollHeight - viewportHeight, 0);
      const progress = scrollable > 0 ? Math.min(scrollTop / scrollable, 1) : 0;

      if (prefersReducedMotion) {
        progressBar.style.width = `${progress * 100}%`;
      } else {
        progressBar.style.width = '';
        progressBar.style.transform = `scaleX(${progress})`;
      }

      progressContainer.classList.toggle('is-hidden', scrollable <= 8);
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
// ===============================
// End Navbar & Mobile Menu Interactions
// ===============================
