// In js/announcement.js

class AnnouncementUIManager {
    constructor() {
        // Main button in the page header
        this.announcementBtn = document.getElementById('announcementBtn');

        // Modal elements
        this.modal = document.getElementById('announcementModal');
        this.closeBtn = document.getElementById('closeAnnouncementModalBtn');

        // Buttons inside the modal
        this.priceDecreaseBtn = document.getElementById('priceDecreaseBtn');
        this.priceIncreaseBtn = document.getElementById('priceIncreaseBtn');
        this.notAvailableBtn = document.getElementById('notAvailableBtn');

        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listener to open the modal
        if (this.announcementBtn) {
            this.announcementBtn.addEventListener('click', () => this.openModal());
        }

        // Listeners to close the modal
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeModal());
        }
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-overlay')) {
                    this.closeModal();
                }
            });
        }

        // Listeners for the three action buttons inside the modal
        // For now, they just print a message to the developer console.
        if (this.priceDecreaseBtn) {
            this.priceDecreaseBtn.addEventListener('click', () => {
                console.log('Price Decrease button clicked. Ready for SMS API.');
                alert('Action: Price Decrease (Backend not connected yet)');
            });
        }
        if (this.priceIncreaseBtn) {
            this.priceIncreaseBtn.addEventListener('click', () => {
                console.log('Price Increase button clicked. Ready for SMS API.');
                alert('Action: Price Increase (Backend not connected yet)');
            });
        }
        if (this.notAvailableBtn) {
            this.notAvailableBtn.addEventListener('click', () => {
                console.log('Not Available Today button clicked. Ready for SMS API.');
                alert('Action: Not Available Today WALA PAY KWARTA PANG SMS');
            });
        }
    }

    openModal() {
        if (this.modal) {
            this.modal.classList.add('active');
            document.body.classList.add('modal-is-open');
        }
    }

    closeModal() {
        if (this.modal) {
            this.modal.classList.remove('active');
            document.body.classList.remove('modal-is-open');
        }
    }
}

// Initialize the announcement manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AnnouncementUIManager();
});
