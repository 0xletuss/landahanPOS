// Import your loader functions
import { showLoader, hideLoader } from './loader.js';

// --- MAIN CLASS FOR SELLER MANAGEMENT ---
class SellerManagement {
    constructor() {
        this.sellers = [];
        this.filteredSellers = [];
        this.currentPage = 1;
        this.sellersPerPage = 6;
        this.apiUrl = 'https://landahan-5.onrender.com/api/sellers';

        this.init();
    }

    async init() {
        await this.loadSellers();
        this.setupEventListeners();
        this.renderSellers();
    }

    // --- DATA FETCHING AND STATE MANAGEMENT ---
    async loadSellers() {
        const sellersGrid = document.querySelector('.sellers-grid');
        try {
            sellersGrid.innerHTML = '<div id="sellers-loader"></div>';
            showLoader('sellers-loader');

            const response = await fetch(`${this.apiUrl}/overview`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.sellers = data.sellers || [];
            this.applyFilters(); // Apply current filters to new data

        } catch (error) {
            console.error('Error loading sellers:', error);
            this.showError('Failed to load sellers. Please try again later.');
        } finally {
            hideLoader();
            this.renderSellers();
        }
    }

    applyFilters() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const status = document.getElementById('statusFilter').value;
        const sortBy = document.getElementById('sortBy').value;

        // Filter by search and status
        this.filteredSellers = this.sellers.filter(seller => {
            const searchMatch = !searchTerm ||
                seller.name.toLowerCase().includes(searchTerm) ||
                seller.email.toLowerCase().includes(searchTerm) ||
                (seller.phone && seller.phone.toLowerCase().includes(searchTerm));

            const statusMatch = !status || this.getSellerStatus(seller) === status;
            
            return searchMatch && statusMatch;
        });

        // Sort
        this.sortSellers(sortBy);
    }
    
    sortSellers(sortBy) {
        this.filteredSellers.sort((a, b) => {
            switch (sortBy) {
                case 'name': return a.name.localeCompare(b.name);
                case 'revenue': return b.total_revenue - a.total_revenue;
                case 'transactions': return b.transactions_count - a.transactions_count;
                case 'quantity': return b.total_quantity - a.total_quantity;
                default: return 0;
            }
        });
    }

    async refreshSellers() {
        this.showNotification('Refreshing sellers...', 'info');
        await this.loadSellers();
    }
    
    // --- EVENT LISTENERS ---
    setupEventListeners() {
        // Filter and Sort controls
        document.getElementById('searchInput').addEventListener('input', () => {
            this.currentPage = 1;
            this.applyFilters();
            this.renderSellers();
        });
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.currentPage = 1;
            this.applyFilters();
            this.renderSellers();
        });
        document.getElementById('sortBy').addEventListener('change', () => {
            this.applyFilters();
            this.renderSellers();
        });

        // Header buttons
        document.getElementById('refreshBtn').addEventListener('click', () => this.refreshSellers());
        document.getElementById('addSellerBtn').addEventListener('click', () => this.showAddSellerModal());

        // Pagination buttons
        document.getElementById('prevPageBtn').addEventListener('click', () => this.changePage(this.currentPage - 1));
        document.getElementById('nextPageBtn').addEventListener('click', () => this.changePage(this.currentPage + 1));
        
        // Modal close button
        document.getElementById('modalCloseBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('sellerModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });
    }
    
    setupActionListeners() {
        // For the view, edit, and delete icon buttons
        document.querySelectorAll('.view-btn').forEach(btn => btn.addEventListener('click', (e) => {
            const sellerId = e.currentTarget.dataset.sellerId;
            this.showViewSellerModal(sellerId);
        }));
        document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', (e) => {
            const sellerId = e.currentTarget.dataset.sellerId;
            this.showEditSellerModal(sellerId);
        }));
        document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', (e) => {
            const sellerId = e.currentTarget.dataset.sellerId;
            this.showDeleteConfirmModal(sellerId);
        }));

        // For the avatars themselves
        document.querySelectorAll('.clickable-avatar').forEach(avatar => avatar.addEventListener('click', (e) => {
            const sellerId = e.currentTarget.dataset.sellerId;
            this.showViewSellerModal(sellerId);
        }));
    }

    // --- RENDERING ---
    renderSellers() {
        const sellersGrid = document.querySelector('.sellers-grid');
        if (!sellersGrid) return;
        
        hideLoader();

        if (this.filteredSellers.length === 0) {
            sellersGrid.innerHTML = `
                <div class="no-sellers">
                    <i class="fas fa-store-slash"></i>
                    <h3>No sellers found</h3>
                    <p>Try adjusting your search criteria or add a new seller.</p>
                </div>
            `;
            this.updatePagination();
            return;
        }

        const paginatedSellers = this.paginate(this.filteredSellers, this.currentPage, this.sellersPerPage);
        sellersGrid.innerHTML = paginatedSellers.map(seller => this.createSellerCard(seller)).join('');
        
        this.updatePagination();
        this.setupActionListeners();
    }

    createSellerCard(seller) {
        const status = this.getSellerStatus(seller);
        const formattedRevenue = this.formatCurrency(seller.total_revenue);
        const initials = seller.name.split(' ').map(n => n[0]).join('').toUpperCase();

        // FIX HERE: Use seller.photo_url directly
        const avatarHTML = seller.photo_url ?
            `<img src="${seller.photo_url}" alt="${seller.name}" class="avatar-image clickable-avatar" data-seller-id="${seller.id}" title="View Details">` :
            `<div class="avatar-placeholder clickable-avatar" data-seller-id="${seller.id}" title="View Details"><span class="avatar-initials">${initials}</span></div>`;

        return `
            <div class="seller-card" data-seller-id="${seller.id}">
                <div class="seller-avatar">
                    ${avatarHTML}
                    <div class="seller-header-info">
                        <h3 class="seller-name">${seller.name}</h3>
                        <p class="seller-email">${seller.email}</p>
                    </div>
                    <span class="status-badge ${status}">${status}</span>
                </div>
                <div class="seller-info">
                    <p class="seller-phone">${seller.phone || 'No phone provided'}</p>
                    <p class="seller-address">${seller.address || 'No address provided'}</p>
                    <div class="seller-stats">
                        <div class="stat">
                            <span class="stat-value">${seller.total_quantity}</span>
                            <span class="stat-label">Quantity</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${formattedRevenue}</span>
                            <span class="stat-label">Revenue</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${seller.transactions_count}</span>
                            <span class="stat-label">Transactions</span>
                        </div>
                    </div>
                    <div class="seller-actions">
                        <button class="btn-icon view-btn" title="View Details" data-seller-id="${seller.id}"><i class="fas fa-eye"></i></button>
                        <button class="btn-icon edit-btn" title="Edit" data-seller-id="${seller.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon delete-btn" title="Delete" data-seller-id="${seller.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
    }

    // --- PAGINATION ---
    updatePagination() {
        const totalPages = Math.ceil(this.filteredSellers.length / this.sellersPerPage);
        const paginationInfo = document.querySelector('.pagination-info');
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');

        paginationInfo.textContent = totalPages > 0 ? `Page ${this.currentPage} of ${totalPages}` : 'Page 1 of 1';
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;
    }

    changePage(page) {
        const totalPages = Math.ceil(this.filteredSellers.length / this.sellersPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderSellers();
        }
    }
    
    paginate(array, page_number, page_size) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }
    
    // --- MODAL MANAGEMENT ---
    openModal(title, body, footer) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = body;
        document.getElementById('modalFooter').innerHTML = footer;
        document.getElementById('sellerModal').classList.add('active');
        document.body.classList.add('modal-is-open');
    }

    closeModal() {
        document.getElementById('sellerModal').classList.remove('active');
        document.body.classList.remove('modal-is-open');
    }

    // --- MODAL CONTENT AND ACTIONS ---
    // ✅ MODIFIED: To display the seller's photo at the top of the modal
    showViewSellerModal(sellerId) {
        const seller = this.sellers.find(s => s.id == sellerId);
        if (!seller) return;
        
        const status = this.getSellerStatus(seller);
        const initials = seller.name.split(' ').map(n => n[0]).join('').toUpperCase();

        // FIX HERE: Use seller.photo_url directly
        const avatarHTML = seller.photo_url ?
            `<img src="${seller.photo_url}" alt="${seller.name}" class="avatar-image-large">` :
            `<div class="avatar-placeholder-large"><span class="avatar-initials">${initials}</span></div>`;

        const phoneDetailHTML = seller.phone ? `
            <div class="copy-wrapper">
                <span id="phone-to-copy">${seller.phone}</span>
                <button class="copy-btn" id="copyPhoneBtn" title="Copy phone number">
                    <i class="far fa-copy"></i>
                </button>
            </div>
        ` : `<span>N/A</span>`;

        const body = `
            <div class="view-modal-profile-header">
                <div class="view-modal-avatar">
                    ${avatarHTML}
                </div>
                <div class="view-modal-info">
                    <h3>${seller.name}</h3>
                    <p>${seller.email}</p>
                </div>
            </div>
            <div class="seller-details-grid">
                <div class="detail-item"><label>Phone</label>${phoneDetailHTML}</div>
                <div class="detail-item"><label>Address</label><span>${seller.address || 'N/A'}</span></div>
                <div class="detail-item"><label>Status</label><div><span class="status-badge ${status}">${status}</span></div></div>
                <div class="detail-item"><label>Total Revenue</label><span class="revenue-amount">${this.formatCurrency(seller.total_revenue)}</span></div>
                <div class="detail-item"><label>Total Quantity Sold</label><span>${seller.total_quantity}</span></div>
                <div class="detail-item"><label>Total Transactions</label><span>${seller.transactions_count}</span></div>
                <div class="detail-item full-width"><label>Last Transaction</label><span>${seller.last_transaction_date ? new Date(seller.last_transaction_date).toLocaleString() : 'None'}</span></div>
            </div>`;
        const footer = `<button class="btn btn-secondary" id="modalCloseBtnFooter">Close</button>`;
        
        this.openModal('Seller Details', body, footer);

        if (seller.phone) {
            const copyBtn = document.getElementById('copyPhoneBtn');
            copyBtn.addEventListener('click', () => {
                const phoneText = document.getElementById('phone-to-copy').textContent;
                
                navigator.clipboard.writeText(phoneText).then(() => {
                    const originalIcon = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<span class="copied-feedback">Copied!</span>';
                    copyBtn.disabled = true;
                    setTimeout(() => {
                        copyBtn.innerHTML = originalIcon;
                        copyBtn.disabled = false;
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                    this.showNotification('Failed to copy to clipboard.', 'error');
                });
            });
        }
        document.getElementById('modalCloseBtnFooter').addEventListener('click', () => this.closeModal());
    }

    showEditSellerModal(sellerId) {
        const seller = this.sellers.find(s => s.id == sellerId);
        if (!seller) return;
    
        const body = this.getSellerFormHTML(seller);
        const footer = `
            <button class="btn btn-secondary" id="modalCancelBtn">Cancel</button>
            <button class="btn btn-primary" id="modalSaveBtn">Save Changes</button>`;
        
        this.openModal('Edit Seller', body, footer);
        
        const photoInput = document.getElementById('sellerPhotoInput');
        const photoPreviewContainer = document.querySelector('.photo-preview');
    
        if (photoInput) {
            photoInput.addEventListener('change', () => {
                const file = photoInput.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        photoPreviewContainer.innerHTML = `<img src="${e.target.result}" id="photoPreview" alt="Photo preview">`;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        document.getElementById('modalCancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('modalSaveBtn').addEventListener('click', (event) => this.handleUpdateSeller(event, sellerId));
    }
    
    showAddSellerModal() {
        const body = this.getSellerFormHTML();
        const footer = `
            <button class="btn btn-secondary" id="modalCancelBtn">Cancel</button>
            <button class="btn btn-primary" id="modalAddBtn">Add Seller</button>`;
            
        this.openModal('Add New Seller', body, footer);

        document.getElementById('modalCancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('modalAddBtn').addEventListener('click', (event) => this.handleCreateSeller(event));
    }
    
    showDeleteConfirmModal(sellerId) {
        const seller = this.sellers.find(s => s.id == sellerId);
        if (!seller) return;
    
        const title = 'Confirm Deletion';
        const body = `
            <div class="delete-confirm-body">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Are you sure you want to permanently delete <strong>${seller.name}</strong>?</p>
                <p>This action cannot be undone.</p>
            </div>
        `;
        const footer = `
            <button class="btn btn-secondary" id="cancelDeleteBtn">Cancel</button>
            <button class="btn btn-danger" id="confirmDeleteBtn">Delete</button>
        `;
    
        this.openModal(title, body, footer);
    
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            this.handleDeleteSeller(sellerId);
        });
    }

    // --- CRUD OPERATIONS ---
    async handleUpdateSeller(event, sellerId) {
        event.preventDefault();
        const saveBtn = document.getElementById('modalSaveBtn');
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving...`;
    
        const form = document.getElementById('sellerForm');
        const updatedData = {
            name: form.querySelector('#sellerName').value,
            email: form.querySelector('#sellerEmail').value,
            phone: form.querySelector('#sellerPhone').value,
            address: form.querySelector('#sellerAddress').value,
        };
    
        try {
            const textResponse = await fetch(`${this.apiUrl}/${sellerId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });
            if (!textResponse.ok) throw new Error('Failed to update seller details.');
    
            const photoInput = document.getElementById('sellerPhotoInput');
            if (photoInput && photoInput.files.length > 0) {
                const photoFile = photoInput.files[0];
                const formData = new FormData();
                formData.append('photo', photoFile);
    
                const photoResponse = await fetch(`${this.apiUrl}/${sellerId}/photo`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData,
                });
                if (!photoResponse.ok) throw new Error('Failed to upload photo.');
            }
            
            this.showNotification('Seller updated successfully!', 'success');
            this.closeModal();
            await this.refreshSellers();
    
        } catch (error) {
            console.error('Update failed:', error);
            this.showNotification(`Update failed: ${error.message}`, 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Save Changes';
        }
    }
    
    async handleCreateSeller(event) {
       event.preventDefault();
       const form = document.getElementById('sellerForm');
       const newData = {
         name: form.querySelector('#sellerName').value,
         email: form.querySelector('#sellerEmail').value,
         phone: form.querySelector('#sellerPhone').value,
         address: form.querySelector('#sellerAddress').value,
       };
       
       if (!newData.name || !newData.email) {
         this.showNotification('Name and Email are required.', 'error');
         return;
       }

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData),
            });
            
            if (!response.ok) throw new Error(await response.json().then(d => d.message));

            this.showNotification('Seller added successfully!', 'success');
            this.closeModal();
            await this.refreshSellers();
        } catch (error) {
            console.error('Add failed:', error);
            this.showNotification(`Failed to add seller: ${error.message}`, 'error');
        }
    }
    
    async handleDeleteSeller(sellerId) {
        const seller = this.sellers.find(s => s.id == sellerId);
        if (!seller) return;
        
        this.closeModal();

        try {
            const response = await fetch(`${this.apiUrl}/${sellerId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) throw new Error(await response.json().then(d => d.message));

            this.showNotification('Seller deleted successfully.', 'success');
            await this.refreshSellers();

        } catch (error) {
            console.error('Delete failed:', error);
            this.showNotification(`Delete failed: ${error.message}`, 'error');
        }
    }

    // --- UTILITY AND HELPER FUNCTIONS ---
    getSellerStatus(seller) {
        if (!seller.last_transaction_date) return 'inactive';
        const lastTransaction = new Date(seller.last_transaction_date);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return lastTransaction >= sixMonthsAgo ? 'active' : 'inactive';
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency', currency: 'PHP', minimumFractionDigits: 2
        }).format(value || 0);
    }
    
    getSellerFormHTML(seller = {}) {
        // FIX HERE: Use seller.photo_url directly
        const photoUrl = seller.photo_url ? seller.photo_url : ''; 
        
        let photoUploaderHTML = '';
        if (seller.id) {
            photoUploaderHTML = `
                <div class="form-group full-width photo-uploader">
                    <label>Profile Photo</label>
                    <div class="photo-preview">
                        ${photoUrl ? 
                            `<img src="${photoUrl}" id="photoPreview" alt="Photo preview">` : 
                            `<div class="avatar-placeholder-large" id="photoPreview"><i class="fas fa-camera"></i></div>`
                        }
                    </div>
                    <input type="file" id="sellerPhotoInput" accept="image/png, image/jpeg, image/gif">
                    <label for="sellerPhotoInput" class="btn btn-secondary upload-btn">Choose Photo</label>
                </div>
            `;
        }

        return `
            <form id="sellerForm" class="form-grid" onsubmit="return false;">
                ${photoUploaderHTML}
                <div class="form-group ${!seller.id ? 'full-width' : ''}">
                    <label for="sellerName">Full Name</label>
                    <input type="text" id="sellerName" value="${seller.name || ''}" required>
                </div>
                <div class="form-group ${!seller.id ? 'full-width' : ''}">
                    <label for="sellerEmail">Email Address</label>
                    <input type="email" id="sellerEmail" value="${seller.email || ''}" required>
                </div>
                <div class="form-group full-width">
                    <label for="sellerPhone">Phone Number</label>
                    <input type="tel" id="sellerPhone" value="${seller.phone || ''}">
                </div>
                <div class="form-group full-width">
                    <label for="sellerAddress">Address</label>
                    <input type="text" id="sellerAddress" value="${seller.address || ''}">
                </div>
            </form>`;
    }

    showError(message) {
        const sellersGrid = document.querySelector('.sellers-grid');
        sellersGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>An Error Occurred</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="location.reload()">Retry</button>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        const iconClass = icons[type] || 'fa-info-circle';
        
        notification.innerHTML = `<i class="fas ${iconClass}"></i><span>${message}</span>`;
        
        container.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 4000);
    }
}

// Initialize the seller management when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SellerManagement();
});
