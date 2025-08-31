// Portfolio Page Functionality
class PortfolioManager {
    constructor() {
        this.portfolioData = [
            {
                id: 1,
                title: "Lube Oil Complex Unit",
                description: "Lubricating Oil Complex Unit",
                image: "images/portfolio/1.jpg",
                category: "units",
                link: "units-LubeOil.html"
            },
            {
                id: 2,
                title: "Atmospheric Distillation Units",
                description: "ADU - Atmospheric Distillation Units",
                image: "images/portfolio/2.jpg",
                category: "units",
                link: "units-distillation.html"
            },
            {
                id: 3,
                title: "Solvent Production Complex Unit",
                description: "Hexan Production Unit",
                image: "images/portfolio/3.jpg",
                category: "units",
                link: "units-Solvents.html"
            },
            {
                id: 4,
                title: "Salt Separator Tanks",
                description: "Storage and separation tanks",
                image: "images/portfolio/4.jpg",
                category: "tanks",
                link: "units-LubeOil.html"
            },
            {
                id: 5,
                title: "Oxidized Bitumen Unit",
                description: "Packing Oxidised Asphalt",
                image: "images/portfolio/5.jpg",
                category: "units",
                link: "units-Bitumen.html"
            },
            {
                id: 6,
                title: "Atmospheric Distillation Unit",
                description: "ADU - Production facility",
                image: "images/portfolio/6.jpg",
                category: "units",
                link: "units-distillation.html"
            },
            {
                id: 7,
                title: "Atmospheric Distillation Unit",
                description: "ADU - Processing facility",
                image: "images/portfolio/7.jpg",
                category: "units",
                link: "units-distillation.html"
            },
            {
                id: 8,
                title: "Northern Tanks",
                description: "Storage facility",
                image: "images/portfolio/8.jpg",
                category: "tanks"
            },
            {
                id: 9,
                title: "Southern Tanks Pumps",
                description: "Pumping station",
                image: "images/portfolio/9.jpg",
                category: "tanks"
            },
            {
                id: 10,
                title: "Atmospheric Distillation Unit",
                description: "ADU - Production line",
                image: "images/portfolio/10.jpg",
                category: "units",
                link: "units-distillation.html"
            },
            {
                id: 11,
                title: "Re-refining Spent Oil Unit",
                description: "Environmental processing facility",
                image: "images/portfolio/11.jpg",
                category: "units",
                link: "units-SpentOil.html"
            },
            {
                id: 12,
                title: "Atmospheric Distillation Unit",
                description: "ADU - Processing unit",
                image: "images/portfolio/12.jpg",
                category: "units",
                link: "units-distillation.html"
            },
            {
                id: 13,
                title: "Solvent Production Complex Unit",
                description: "Hexan Production Unit",
                image: "images/portfolio/13.jpg",
                category: "units",
                link: "units-Solvents.html"
            },
            {
                id: 14,
                title: "Atmospheric Distillation Unit",
                description: "ADU - Production facility",
                image: "images/portfolio/14.jpg",
                category: "units",
                link: "units-distillation.html"
            },
            {
                id: 15,
                title: "Cooling Water Plant",
                description: "Utility infrastructure",
                image: "images/portfolio/15.jpg",
                category: "infrastructure"
            },
            {
                id: 16,
                title: "Lubricating Oil Complex Unit",
                description: "Lube Oil production facility",
                image: "images/portfolio/16.jpg",
                category: "units",
                link: "units-LubeOil.html"
            },
            {
                id: 17,
                title: "Lubricating Oil Complex Unit",
                description: "Lube Oil processing unit",
                image: "images/portfolio/17.jpg",
                category: "units",
                link: "units-LubeOil.html"
            },
            {
                id: 18,
                title: "Heat Exchangers",
                description: "Heat Exchanger Straps",
                image: "images/portfolio/18.jpg",
                category: "infrastructure"
            },
            {
                id: 19,
                title: "Occupational Health & Safety Sector",
                description: "Health & Safety facilities",
                image: "images/portfolio/19.jpg",
                category: "infrastructure"
            },
            {
                id: 20,
                title: "Main Workshops Area",
                description: "Workshops and maintenance facilities",
                image: "images/portfolio/20.jpg",
                category: "infrastructure"
            },
            {
                id: 21,
                title: "Facility Overview",
                description: "General facility view",
                image: "images/portfolio/21.jpg",
                category: "infrastructure"
            },
            {
                id: 22,
                title: "Wax Molding & Packaging Unit",
                description: "Wax production facility",
                image: "images/portfolio/22.jpg",
                category: "units",
                link: "units-LubeOil.html"
            },
            {
                id: 23,
                title: "Separator Tank",
                description: "Separation facility",
                image: "images/portfolio/23.jpg",
                category: "tanks"
            },
            {
                id: 24,
                title: "Northern Tanks",
                description: "Storage facility",
                image: "images/portfolio/24.jpg",
                category: "tanks"
            },
            {
                id: 25,
                title: "Solvent Production Complex Unit",
                description: "Hexan Production Unit",
                image: "images/portfolio/25.jpg",
                category: "units",
                link: "units-Solvents.html"
            },
            {
                id: 26,
                title: "Nitrogen Producing Unit",
                description: "Lube Oil Unit - Nitrogen production",
                image: "images/portfolio/26.jpg",
                category: "units",
                link: "units-LubeOil.html"
            },
            {
                id: 27,
                title: "Vapour Recovery Unit",
                description: "VRU - Environmental facility",
                image: "images/portfolio/27.jpg",
                category: "units",
                link: "units-VRU.html"
            },
            {
                id: 28,
                title: "Asphalt Tanks",
                description: "Bitumen storage facility",
                image: "images/portfolio/28.jpg",
                category: "tanks"
            },
            {
                id: 29,
                title: "Northern Tanks",
                description: "Storage facility",
                image: "images/portfolio/29.jpg",
                category: "tanks"
            },
            {
                id: 30,
                title: "Petroleum Port",
                description: "Port facilities",
                image: "images/portfolio/30.jpg",
                category: "infrastructure",
                link: "index.html#Certifications"
            },
            {
                id: 31,
                title: "Petroleum Port",
                description: "Port infrastructure",
                image: "images/portfolio/31.jpg",
                category: "infrastructure",
                link: "index.html#Certifications"
            },
            {
                id: 32,
                title: "The Company Torch",
                description: "Company landmark",
                image: "images/portfolio/32.jpg",
                category: "infrastructure"
            },
            {
                id: 33,
                title: "Chemical Laboratory",
                description: "Lab facilities",
                image: "images/portfolio/33.jpg",
                category: "infrastructure",
                link: "chemical.html"
            },
            {
                id: 34,
                title: "Asphalt Tanks",
                description: "Asphalt Area",
                image: "images/portfolio/34.jpg",
                category: "tanks",
                link: "Projects_Replacement_08.html"
            },
            {
                id: 35,
                title: "Spherical Tanks",
                description: "For Botagaz Product",
                image: "images/portfolio/35.jpg",
                category: "tanks"
            },
            {
                id: 36,
                title: "New Winch",
                description: "30 Tons Load",
                image: "images/portfolio/36.jpg",
                category: "infrastructure"
            },
            {
                id: 37,
                title: "Propane Production Unit",
                description: "Production facility",
                image: "images/portfolio/37.jpg",
                category: "units"
            },
            {
                id: 38,
                title: "Spherical Tanks",
                description: "For Botagaz Product",
                image: "images/portfolio/38.jpg",
                category: "tanks"
            },
            {
                id: 39,
                title: "Hydrogen Production Unit",
                description: "Production facility",
                image: "images/portfolio/39.jpg",
                category: "units"
            }
        ];

        this.currentFilter = 'all';
        this.modal = null;
        this.isTouchDevice = this.detectTouchDevice();
        this.init();
    }

    detectTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    init() {
        this.renderPortfolio();
        this.setupFilterButtons();
        this.setupModal();
        this.setupTouchEvents();
    }

    renderPortfolio() {
        const grid = document.getElementById('portfolio-grid');
        if (!grid) return;

        grid.innerHTML = '';

        this.portfolioData.forEach(item => {
            const portfolioItem = this.createPortfolioItem(item);
            grid.appendChild(portfolioItem);
        });
    }

    createPortfolioItem(item) {
        const div = document.createElement('div');
        div.className = 'portfolio-item';
        div.setAttribute('data-category', item.category);
        div.setAttribute('data-id', item.id);

        const actions = [];
        if (item.link) {
            actions.push(`<a href="${item.link}" class="portfolio-btn" title="View Details"><i class="fas fa-link"></i></a>`);
        }
        actions.push(`<button class="portfolio-btn view-larger" title="View Larger" data-image="${item.image}" data-caption="${item.title} - ${item.description}"><i class="fas fa-search-plus"></i></button>`);

        div.innerHTML = `
            <img src="${item.image}" alt="${item.title}" loading="lazy">
            <div class="portfolio-overlay">
                <div class="portfolio-title">${item.title}</div>
                <div class="portfolio-description">${item.description}</div>
                <div class="portfolio-actions">
                    ${actions.join('')}
                </div>
            </div>
        `;

        // Add event listeners
        const viewLargerBtn = div.querySelector('.view-larger');
        if (viewLargerBtn) {
            viewLargerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openModal(item.image, `${item.title} - ${item.description}`);
            });
        }

        // Add touch events for mobile
        if (this.isTouchDevice) {
            this.addTouchEvents(div, item);
        }

        return div;
    }

    addTouchEvents(portfolioItem, item) {
        let touchStartTime = 0;
        let touchStartX = 0;
        let touchStartY = 0;

        portfolioItem.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            
            // Add touch-active class for visual feedback
            portfolioItem.classList.add('touch-active');
        }, { passive: true });

        portfolioItem.addEventListener('touchend', (e) => {
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - touchStartTime;
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = Math.abs(touchEndX - touchStartX);
            const deltaY = Math.abs(touchEndY - touchStartY);
            
            // Remove touch-active class
            portfolioItem.classList.remove('touch-active');
            
            // Check if it's a tap (not a scroll)
            if (touchDuration < 300 && deltaX < 10 && deltaY < 10) {
                e.preventDefault();
                
                // Check if touch was on a button
                const target = e.target.closest('.portfolio-btn');
                if (target) {
                    if (target.classList.contains('view-larger')) {
                        this.openModal(item.image, `${item.title} - ${item.description}`);
                    } else if (target.tagName === 'A') {
                        // Let the link work normally
                        return;
                    }
                } else {
                    // If not on a button, open modal
                    this.openModal(item.image, `${item.title} - ${item.description}`);
                }
            }
        });

        portfolioItem.addEventListener('touchcancel', () => {
            portfolioItem.classList.remove('touch-active');
        });
    }

    setupFilterButtons() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                this.filterPortfolio(filter);
                
                // Update button states
                filterButtons.forEach(btn => {
                    btn.classList.remove('active', 'bg-blue-600', 'text-white');
                    btn.classList.add('bg-gray-200', 'text-gray-700');
                });
                button.classList.add('active', 'bg-blue-600', 'text-white');
                button.classList.remove('bg-gray-200', 'text-gray-700');
            });
        });
    }

    filterPortfolio(filter) {
        this.currentFilter = filter;
        const items = document.querySelectorAll('.portfolio-item');
        
        items.forEach(item => {
            const category = item.getAttribute('data-category');
            const shouldShow = filter === 'all' || category === filter;
            
            if (shouldShow) {
                item.style.display = 'block';
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
                item.style.pointerEvents = 'auto';
            } else {
                item.style.display = 'none';
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
                item.style.pointerEvents = 'none';
            }
        });
    }

    setupTouchEvents() {
        // Add global touch event handling for better mobile experience
        document.addEventListener('touchstart', () => {}, { passive: true });
    }

    setupModal() {
        this.modal = new ImageModal({
            modalId: 'imageModal',
            imageId: 'modalImage',
            captionId: 'modalCaption',
            closeSelector: '.close-modal'
        });
    }

    openModal(imageSrc, caption) {
        if (this.modal) {
            this.modal.openModal(imageSrc, caption);
            
            // Prevent body scrolling on mobile
            if (this.isTouchDevice) {
                document.body.style.position = 'fixed';
                document.body.style.width = '100%';
                document.body.style.top = `-${window.scrollY}px`;
            }
        }
    }
}

// Image Modal Class (reused from units.js)
class ImageModal {
    constructor({
        modalId = 'imageModal',
        imageId = 'modalImage',
        captionId = 'modalCaption',
        closeSelector = '.close-modal'
    } = {}) {
        this.modal = document.getElementById(modalId);
        this.modalImage = document.getElementById(imageId);
        this.modalCaption = document.getElementById(captionId);
        this.closeBtn = this.modal?.querySelector(closeSelector);

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleModalClick = this.handleModalClick.bind(this);

        this.init();
    }

    init() {
        if (!this.modal || !this.modalImage || !this.modalCaption) return;

        this.addModalListeners();
        this.addKeyboardListener();

        this.modal.setAttribute('role', 'dialog');
        this.modal.setAttribute('aria-hidden', 'true');
    }

    addModalListeners() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeModal());
        }
        this.modal.addEventListener('click', this.handleModalClick);
    }

    addKeyboardListener() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    handleModalClick(e) {
        if (e.target === this.modal) {
            this.closeModal();
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Escape') {
            this.closeModal();
        }
    }

    openModal(imageSrc, caption) {
        this.lastFocusedElement = document.activeElement;
        this.scrollY = window.scrollY;

        this.modalImage.src = imageSrc;
        this.modalCaption.textContent = caption;

        this.modal.style.display = 'block';
        this.modal.setAttribute('aria-hidden', 'false');

        requestAnimationFrame(() => {
            this.modal.classList.add('show');
        });

        document.body.style.overflow = 'hidden';
        this.modal.focus();
    }

    closeModal() {
        this.modal.classList.remove('show');
        this.modal.setAttribute('aria-hidden', 'true');

        const duration = parseFloat(getComputedStyle(this.modal).transitionDuration) * 1000 || 300;

        setTimeout(() => {
            this.modal.style.display = 'none';
            document.body.style.overflow = '';

            // Restore body position on mobile
            if (document.body.style.position === 'fixed') {
                document.body.style.position = '';
                document.body.style.width = '';
                document.body.style.top = '';
                window.scrollTo(0, this.scrollY || 0);
            }

            if (this.lastFocusedElement) {
                this.lastFocusedElement.focus();
            }
        }, duration);
    }

    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown);
        this.modal.removeEventListener('click', this.handleModalClick);
        this.closeBtn?.removeEventListener('click', this.closeModal);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioManager();
});
