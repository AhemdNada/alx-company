/* Start Hero Slider */
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
                void currentBar.offsetHeight;
                currentBar.style.transition = `width ${this.slideInterval}ms ease-out`;
                currentBar.style.width = '100%';
            }
        }
    }

    document.addEventListener('DOMContentLoaded', () => new HeroSlider());
})();
/* End Hero Slider */

/* Start News Banner */
(function () {
    const banner = document.getElementById('cn-banner');
    if (!banner) return;

    const track = banner.querySelector('.cn-track');
    const ticker = banner.querySelector('.cn-ticker');
    const closeBtn = banner.querySelector('#cn-close');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let reShowTimer = null;
    let index = 0;

    let newsItems = [];

    function setTopOffset() {
        const nav = document.querySelector('nav');
        const navHeight = nav?.offsetHeight || 80;
        banner.style.top = `${navHeight + 8}px`;
    }

    function applyText(text) {
        if (!track) return;

        track.classList.remove(
            'cn-ticker-animate',
            'whitespace-nowrap',
            'will-change-transform',
            'cn-text-enter'
        );
        track.style.removeProperty('--cn-distance');
        track.style.removeProperty('--cn-duration');
        track.innerHTML = '';

        const span = document.createElement('span');
        span.className = 'inline-block';
        span.textContent = text;
        track.appendChild(span);

        void track.offsetHeight;
        track.classList.add('cn-text-enter');

        requestAnimationFrame(() => setupTicker(text));
    }

    function setupTicker(text) {
        if (!ticker || !track) return;

        const containerWidth = ticker.clientWidth;
        const contentWidth = track.scrollWidth;

        if (!prefersReducedMotion && contentWidth > containerWidth + 12) {
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
        void banner.offsetHeight;
        banner.classList.add('cn-enter');
    }

    function hideBanner() {
        banner.style.opacity = '0';
        banner.style.display = 'none';
        if (reShowTimer) clearTimeout(reShowTimer);
        reShowTimer = setTimeout(showBanner, 30000);
    }

    function rotateNews() {
        if (!newsItems.length) return;
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

    async function init() {
        setTopOffset();
        window.addEventListener('resize', debounce(() => {
            setTopOffset();
            setupTicker(track?.textContent || '');
        }, 150));

        try {
            const API = (window && window.API_BASE ? window.API_BASE : '/api').replace(/\/$/, '');
            const res = await fetch(API + '/news/ticker');
            if (res.ok) {
                const rows = await res.json();
                newsItems = rows.map(r => r.message).filter(Boolean);
            }
        } catch {}

        if (newsItems.length) {
            applyText(newsItems[index]);
            showBanner();
            setInterval(rotateNews, 15000);
        } else {
            banner.style.display = 'none';
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', hideBanner);
        }
    }

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
/* End News Banner */

/* Start Main Functionality */
(function () {
    function onReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    onReady(() => {
        const navButtons = Array.from(document.querySelectorAll('.nav-btn'));
        const contentSections = Array.from(document.querySelectorAll('.content-section'));

        if (navButtons.length > 0 && contentSections.length > 0) {
            navButtons.forEach((button) => {
                button.addEventListener('click', () => {
                    const targetId = button.getAttribute('data-target');
                    if (!targetId) return;

                    navButtons.forEach((b) => {
                        b.classList.remove('active', 'bg-blue-600', 'text-white');
                        b.classList.add('bg-gray-200', 'text-gray-700');
                        b.setAttribute('aria-selected', 'false');
                    });
                    button.classList.add('active', 'bg-blue-600', 'text-white');
                    button.classList.remove('bg-gray-200', 'text-gray-700');
                    button.setAttribute('aria-selected', 'true');

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

        const faqItems = Array.from(document.querySelectorAll('.faq-item'));
        faqItems.forEach((item) => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            const icon = item.querySelector('.faq-icon');
            if (!question || !answer) return;

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
                    answer.style.maxHeight = '0px';
                    if (icon) icon.classList.remove('rotate-180');
                } else {
                    faqItems.forEach((otherItem) => {
                        if (otherItem !== item) {
                            const otherAnswer = otherItem.querySelector('.faq-answer');
                            const otherIcon = otherItem.querySelector('.faq-icon');
                            if (otherAnswer) otherAnswer.style.maxHeight = '0px';
                            if (otherIcon) otherIcon.classList.remove('rotate-180');
                        }
                    });

                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    if (icon) icon.classList.add('rotate-180');
                }
            });
        });

        const API = ((window && window.API_BASE) ? window.API_BASE : '/api').replace(/\/$/, '');
        let homeProjects = [];
        let filteredHomeProjects = [];

        async function loadHomeProjects(category = 'all') {
            try {
                const url = category === 'all' ? API + '/projects' : API + '/projects?category=' + category;
                const res = await fetch(url);
                if (!res.ok) throw new Error('Failed to load projects');
                homeProjects = await res.json();
                filteredHomeProjects = [...homeProjects];
                renderHomeProjects();
            } catch (error) {
                console.error('Error loading home projects:', error);
                const grid = document.getElementById('home-projects-grid');
                if (grid) {
                    grid.innerHTML = '<div class="col-span-full text-center text-gray-500 py-12">Failed to load projects</div>';
                }
            }
        }

        function renderHomeProjects() {
            const grid = document.getElementById('home-projects-grid');
            if (!grid) return;

            if (!filteredHomeProjects.length) {
                grid.innerHTML = '<div class="col-span-full text-center text-gray-500 py-12">No projects found</div>';
                return;
            }

            grid.innerHTML = filteredHomeProjects.map(project => {
                const coverImage = project.coverImage || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=2070&q=80';
                const description = project.description && project.description.length > 0 && project.description[0].paragraphs && project.description[0].paragraphs.length > 0 
                    ? project.description[0].paragraphs[0] 
                    : '';
                
                const categoryLabels = {
                    'major_projects': 'MAJOR PROJECTS',
                    'replacement_renovation': 'REPLACEMENT RENOVATION & UNIT DEVELOPMENT',
                    'geographical_region': 'GEOGRAPHICAL REGION'
                };
                
                const categoryBadge = project.category ? `
                    <div class="absolute top-4 right-4">
                        <span class="px-2 py-1 text-xs font-medium rounded-full ${project.category === 'major_projects' ? 'bg-blue-600 text-white' : project.category === 'replacement_renovation' ? 'bg-green-600 text-white' : 'bg-purple-600 text-white'}">
                            ${categoryLabels[project.category] || project.category}
                        </span>
                    </div>
                ` : '';
                
                return `
                    <div class="project-card group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer" data-id="${project.id}">
                        <div class="relative h-64 overflow-hidden">
                            <img src="${coverImage}" alt="${project.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div class="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                <h3 class="text-xl font-bold mb-2">${project.title}</h3>
                                <p class="text-sm text-gray-200 leading-relaxed">
                                    ${description}
                                </p>
                            </div>
                            ${categoryBadge}
                        </div>
                    </div>
                `;
            }).join('');

            document.querySelectorAll('#home-projects-grid .project-card').forEach(card => {
                card.addEventListener('click', () => {
                    const projectId = card.getAttribute('data-id');
                    window.location.href = `/projects-details.html?id=${projectId}`;
                });
            });
        }

        function applyHomeFilter(filter) {
            loadHomeProjects(filter);
        }

        const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
        if (filterButtons.length > 0) {
            filterButtons.forEach((btn) => {
                btn.addEventListener('click', () => {
                    const filter = btn.getAttribute('data-filter');
                    
                    filterButtons.forEach((b) => {
                        b.classList.remove('active', 'bg-blue-600', 'text-white');
                        b.classList.add('bg-gray-200', 'text-gray-700');
                    });
                    btn.classList.add('active', 'bg-blue-600', 'text-white');
                    btn.classList.remove('bg-gray-200', 'text-gray-700');
                    
                    if (filter) {
                        applyHomeFilter(filter);
                    }
                });
            });
        }

        loadHomeProjects();
    });
})();
/* End Main Functionality */