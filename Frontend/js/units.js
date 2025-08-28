// Units Page Modal Functionality
class ImageModal {
    constructor({
        modalId = 'imageModal',
        imageId = 'modalImage',
        captionId = 'modalCaption',
        closeSelector = '.close-modal',
        triggerSelector = '.view-larger-btn'
    } = {}) {
        this.modal = document.getElementById(modalId);
        this.modalImage = document.getElementById(imageId);
        this.modalCaption = document.getElementById(captionId);
        this.closeBtn = this.modal?.querySelector(closeSelector);
        this.triggerSelector = triggerSelector;

        // Bind handlers (so we can remove them later if needed)
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleModalClick = this.handleModalClick.bind(this);

        this.init();
    }

    init() {
        if (!this.modal || !this.modalImage || !this.modalCaption) return;

        this.addViewLargerListeners();
        this.addModalListeners();
        this.addKeyboardListener();

        // Accessibility attributes
        this.modal.setAttribute('role', 'dialog');
        this.modal.setAttribute('aria-hidden', 'true');
    }

    addViewLargerListeners() {
        const viewLargerButtons = document.querySelectorAll(this.triggerSelector);

        viewLargerButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const { image, caption } = button.dataset;
                if (image && caption) {
                    this.openModal(image, caption, button);
                }
            });
        });
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

    openModal(imageSrc, caption, triggerButton) {
        this.lastFocusedElement = triggerButton || document.activeElement;

        this.modalImage.src = imageSrc;
        this.modalCaption.textContent = caption;

        this.modal.style.display = 'block';
        this.modal.setAttribute('aria-hidden', 'false');

        // Trigger animation
        requestAnimationFrame(() => {
            this.modal.classList.add('show');
        });

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Move focus to modal for accessibility
        this.modal.focus();
    }

    closeModal() {
        this.modal.classList.remove('show');
        this.modal.setAttribute('aria-hidden', 'true');

        // Get CSS transition duration dynamically
        const duration = parseFloat(getComputedStyle(this.modal).transitionDuration) * 1000 || 300;

        setTimeout(() => {
            this.modal.style.display = 'none';
            document.body.style.overflow = '';

            // Restore focus to last focused element
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

// Initialize modal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImageModal();
});
