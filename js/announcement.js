// announcement.js
class AnnouncementSystem {
    constructor() {
        this.priceApiUrl = 'https://landahan-5.onrender.com/api/mail/price-announcement';
        this.notAvailableApiUrl = 'https://landahan-5.onrender.com/api/mail/not-available-announcement';
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Main announcement button
        const announcementBtn = document.getElementById('announcementBtn');
        if (announcementBtn) {
            announcementBtn.addEventListener('click', () => this.showAnnouncementModal());
        }

        // Close announcement modal
        const closeBtn = document.getElementById('closeAnnouncementModalBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeAnnouncementModal());
        }

        // Announcement options
        const priceDecreaseBtn = document.getElementById('priceDecreaseBtn');
        if (priceDecreaseBtn) {
            priceDecreaseBtn.addEventListener('click', () => this.showPriceChangeForm('decrease'));
        }

        const priceIncreaseBtn = document.getElementById('priceIncreaseBtn');
        if (priceIncreaseBtn) {
            priceIncreaseBtn.addEventListener('click', () => this.showPriceChangeForm('increase'));
        }

        const notAvailableBtn = document.getElementById('notAvailableBtn');
        if (notAvailableBtn) {
            notAvailableBtn.addEventListener('click', () => this.showNotAvailableForm());
        }

        // Close modal on overlay click
        const modal = document.getElementById('announcementModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-overlay')) {
                    this.closeAnnouncementModal();
                }
            });
        }
    }

    showAnnouncementModal() {
        const modal = document.getElementById('announcementModal');
        if (modal) {
            modal.classList.add('active');
            document.body.classList.add('modal-is-open');
        }
    }

    closeAnnouncementModal() {
        const modal = document.getElementById('announcementModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.classList.remove('modal-is-open');
        }
    }

    showPriceChangeForm(type) {
        const modal = document.getElementById('announcementModal');
        const modalBody = modal.querySelector('.modal-body');
        const title = type === 'increase' ? 'Price Increase Announcement' : 'Price Decrease Announcement';
        
        document.getElementById('announcementModalTitle').textContent = title;
        
        modalBody.innerHTML = `
            <form id="priceChangeForm" class="announcement-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="oldPrice">Current Price (₱) *</label>
                        <input type="number" id="oldPrice" class="form-input" step="0.01" required placeholder="0.00">
                    </div>
                    <div class="form-group">
                        <label for="newPrice">New Price (₱) *</label>
                        <input type="number" id="newPrice" class="form-input" step="0.01" required placeholder="0.00">
                    </div>
                </div>

                <div class="price-comparison" id="priceComparison" style="display: none;">
                    <div class="price-row">
                        <div class="price-item">
                            <div class="price-label">Current Price</div>
                            <div class="price-value price-old" id="displayOldPrice">₱0.00</div>
                        </div>
                        <div class="price-arrow">→</div>
                        <div class="price-item">
                            <div class="price-label">New Price</div>
                            <div class="price-value price-new" id="displayNewPrice">₱0.00</div>
                        </div>
                    </div>
                    <div id="priceChangeBadge"></div>
                </div>

                <div class="form-group">
                    <label for="effectiveDate">Effective Date *</label>
                    <input type="date" id="effectiveDate" class="form-input" required>
                </div>

                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    <span>This announcement will be sent to all sellers via email.</span>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="cancelAnnouncementBtn">
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-primary" id="sendAnnouncementBtn">
                        <i class="fas fa-paper-plane"></i> Send to All Sellers
                    </button>
                </div>
            </form>
        `;

        // Set up form event listeners
        const form = document.getElementById('priceChangeForm');
        const oldPriceInput = document.getElementById('oldPrice');
        const newPriceInput = document.getElementById('newPrice');

        // Real-time price comparison
        const updatePriceComparison = () => {
            const oldPrice = parseFloat(oldPriceInput.value);
            const newPrice = parseFloat(newPriceInput.value);

            if (oldPrice && newPrice && !isNaN(oldPrice) && !isNaN(newPrice) && oldPrice > 0 && newPrice > 0) {
                const comparison = document.getElementById('priceComparison');
                comparison.style.display = 'block';

                document.getElementById('displayOldPrice').textContent = `₱${oldPrice.toFixed(2)}`;
                document.getElementById('displayNewPrice').textContent = `₱${newPrice.toFixed(2)}`;

                const change = ((newPrice - oldPrice) / oldPrice) * 100;
                const badgeDiv = document.getElementById('priceChangeBadge');
                
                if (change > 0) {
                    badgeDiv.innerHTML = `<span class="price-change-badge price-increase">
                        <i class="fas fa-arrow-up"></i> ${Math.abs(change).toFixed(1)}% Increase
                    </span>`;
                } else if (change < 0) {
                    badgeDiv.innerHTML = `<span class="price-change-badge price-decrease">
                        <i class="fas fa-arrow-down"></i> ${Math.abs(change).toFixed(1)}% Decrease
                    </span>`;
                } else {
                    badgeDiv.innerHTML = `<span class="price-change-badge" style="background: #e0e0e0; color: #666;">
                        No Change
                    </span>`;
                }
            }
        };

        oldPriceInput.addEventListener('input', updatePriceComparison);
        newPriceInput.addEventListener('input', updatePriceComparison);

        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('effectiveDate').setAttribute('min', today);

        // Cancel button handler
        const cancelBtn = document.getElementById('cancelAnnouncementBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeAnnouncementModal());
        }

        // Form submit handler
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendPriceChangeAnnouncement(type);
        });
    }

    showNotAvailableForm() {
        const modal = document.getElementById('announcementModal');
        const modalBody = modal.querySelector('.modal-body');
        
        document.getElementById('announcementModalTitle').textContent = 'Product Not Available Announcement';
        
        modalBody.innerHTML = `
            <form id="notAvailableForm" class="announcement-form">
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>This will notify all sellers that coconut products are not available.</span>
                </div>

                <div class="form-group">
                    <label for="unavailableDate">Date *</label>
                    <input type="date" id="unavailableDate" class="form-input" required>
                </div>

                <div class="form-group">
                    <label for="unavailableReason">Reason (Optional)</label>
                    <textarea id="unavailableReason" class="form-input" rows="4" placeholder="e.g., Supply shortage, Weather conditions, Maintenance, etc."></textarea>
                    <small style="color: #999; display: block; margin-top: 5px;">
                        Provide a brief explanation for the unavailability (optional)
                    </small>
                </div>

                <div class="preview-box" style="background: #f9f5f1; border: 2px solid #E17055; border-radius: 12px; padding: 20px; margin: 20px 0;">
                    <div style="text-align: center; margin-bottom: 15px;">
                        <div style="font-size: 40px; margin-bottom: 10px;">🚫</div>
                        <h3 style="color: #E17055; margin: 0; font-size: 18px;">Preview</h3>
                    </div>
                    <p style="margin: 10px 0; color: #666; font-size: 14px;">
                        Sellers will receive an email notification about product unavailability with the date and reason you provide.
                    </p>
                </div>

                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    <span>This announcement will be sent to all sellers via email.</span>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="cancelNotAvailableBtn">
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-primary" id="sendNotAvailableBtn">
                        <i class="fas fa-paper-plane"></i> Send to All Sellers
                    </button>
                </div>
            </form>
        `;

        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('unavailableDate').value = today;

        // Cancel button handler
        const cancelBtn = document.getElementById('cancelNotAvailableBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeAnnouncementModal());
        }

        // Form submit handler
        const form = document.getElementById('notAvailableForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendNotAvailableAnnouncement();
        });
    }

    async sendPriceChangeAnnouncement(type) {
        const btn = document.getElementById('sendAnnouncementBtn');
        const originalText = btn.innerHTML;
        
        try {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            const oldPrice = parseFloat(document.getElementById('oldPrice').value);
            const newPrice = parseFloat(document.getElementById('newPrice').value);
            const effectiveDate = document.getElementById('effectiveDate').value;

            // Validate price change matches the type
            if (type === 'increase' && newPrice <= oldPrice) {
                this.showNotification('New price must be higher than current price for a price increase.', 'error');
                return;
            }
            if (type === 'decrease' && newPrice >= oldPrice) {
                this.showNotification('New price must be lower than current price for a price decrease.', 'error');
                return;
            }

            // Format effective date
            const dateObj = new Date(effectiveDate);
            const formattedDate = dateObj.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });

            const response = await fetch(this.priceApiUrl, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    old_price: oldPrice,
                    new_price: newPrice,
                    effective_date: formattedDate,
                    send_to_all_sellers: true
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.showNotification(
                    `Price announcement sent successfully to ${data.recipients_count} sellers!`, 
                    'success'
                );
                this.closeAnnouncementModal();
            } else {
                throw new Error(data.error || 'Failed to send announcement');
            }

        } catch (error) {
            console.error('Error sending announcement:', error);
            this.showNotification(
                `Failed to send announcement: ${error.message}`, 
                'error'
            );
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }

    async sendNotAvailableAnnouncement() {
        const btn = document.getElementById('sendNotAvailableBtn');
        const originalText = btn.innerHTML;
        
        try {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            const unavailableDate = document.getElementById('unavailableDate').value;
            const reason = document.getElementById('unavailableReason').value.trim();

            // Format date
            const dateObj = new Date(unavailableDate);
            const formattedDate = dateObj.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });

            const response = await fetch(this.notAvailableApiUrl, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    date: formattedDate,
                    reason: reason,
                    send_to_all_sellers: true
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.showNotification(
                    `"Not Available" announcement sent successfully to ${data.recipients_count} sellers!`, 
                    'success'
                );
                this.closeAnnouncementModal();
            } else {
                throw new Error(data.error || 'Failed to send announcement');
            }

        } catch (error) {
            console.error('Error sending announcement:', error);
            this.showNotification(
                `Failed to send announcement: ${error.message}`, 
                'error'
            );
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }

    showNotification(msg, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) {
            console.log(msg);
            return;
        }

        const notif = document.createElement('div');
        notif.className = `notification notification-${type}`;
        const icons = { 
            success: 'fa-check-circle', 
            error: 'fa-exclamation-triangle', 
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        };
        notif.innerHTML = `<i class="fas ${icons[type] || 'fa-info-circle'}"></i><span>${msg}</span>`;
        container.appendChild(notif);
        
        setTimeout(() => notif.classList.add('show'), 10);
        setTimeout(() => { 
            notif.classList.remove('show'); 
            setTimeout(() => notif.remove(), 500); 
        }, 5000);
    }
}

// Initialize the announcement system
const announcementSystem = new AnnouncementSystem();