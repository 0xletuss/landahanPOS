import { showLoader, hideLoader } from './loader.js';

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

    async loadSellers() {
        const grid = document.querySelector('.sellers-grid');
        try {
            grid.innerHTML = '<div id="sellers-loader"></div>';
            showLoader('sellers-loader');
            const res = await fetch(`${this.apiUrl}/overview`, { method: 'GET', credentials: 'include' });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            this.sellers = data.sellers || [];
            this.applyFilters();
        } catch (err) {
            console.error('Error loading sellers:', err);
            this.showError('Failed to load sellers. Please try again later.');
        } finally {
            hideLoader();
            this.renderSellers();
        }
    }

    applyFilters() {
        const search = document.getElementById('searchInput').value.toLowerCase();
        const status = document.getElementById('statusFilter').value;
        const sortBy = document.getElementById('sortBy').value;

        this.filteredSellers = this.sellers.filter(s => {
            const searchMatch = !search || s.name.toLowerCase().includes(search) || 
                s.email.toLowerCase().includes(search) || (s.phone && s.phone.toLowerCase().includes(search));
            const statusMatch = !status || this.getSellerStatus(s) === status;
            return searchMatch && statusMatch;
        });

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
    
    setupEventListeners() {
        const $ = (id) => document.getElementById(id);
        const resetPage = () => { this.currentPage = 1; this.applyFilters(); this.renderSellers(); };
        
        $('searchInput').addEventListener('input', resetPage);
        $('statusFilter').addEventListener('change', resetPage);
        $('sortBy').addEventListener('change', () => { this.applyFilters(); this.renderSellers(); });
        $('refreshBtn').addEventListener('click', () => this.refreshSellers());
        $('addSellerBtn').addEventListener('click', () => this.showAddSellerModal());
        $('prevPageBtn').addEventListener('click', () => this.changePage(this.currentPage - 1));
        $('nextPageBtn').addEventListener('click', () => this.changePage(this.currentPage + 1));
        $('modalCloseBtn').addEventListener('click', () => this.closeModal());
        $('sellerModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) this.closeModal();
        });
    }
    
    setupActionListeners() {
        document.querySelectorAll('.view-btn').forEach(btn => btn.addEventListener('click', (e) => 
            this.showViewSellerModal(e.currentTarget.dataset.sellerId)));
        document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', (e) => 
            this.showEditSellerModal(e.currentTarget.dataset.sellerId)));
        document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', (e) => 
            this.showDeleteConfirmModal(e.currentTarget.dataset.sellerId)));
        document.querySelectorAll('.clickable-avatar').forEach(avatar => avatar.addEventListener('click', (e) => 
            this.showViewSellerModal(e.currentTarget.dataset.sellerId)));
    }

    renderSellers() {
        const grid = document.querySelector('.sellers-grid');
        if (!grid) return;
        hideLoader();

        if (this.filteredSellers.length === 0) {
            grid.innerHTML = `<div class="no-sellers"><i class="fas fa-store-slash"></i><h3>No sellers found</h3>
                <p>Try adjusting your search criteria or add a new seller.</p></div>`;
            this.updatePagination();
            return;
        }

        const paginated = this.paginate(this.filteredSellers, this.currentPage, this.sellersPerPage);
        grid.innerHTML = paginated.map(s => this.createSellerCard(s)).join('');
        this.updatePagination();
        this.setupActionListeners();
    }

    createSellerCard(s) {
        const status = this.getSellerStatus(s);
        const initials = s.name.split(' ').map(n => n[0]).join('').toUpperCase();
        const avatar = s.photo_url ? 
            `<img src="${s.photo_url}" alt="${s.name}" class="avatar-image clickable-avatar" data-seller-id="${s.id}" title="View Details">` :
            `<div class="avatar-placeholder clickable-avatar" data-seller-id="${s.id}" title="View Details"><span class="avatar-initials">${initials}</span></div>`;

        return `<div class="seller-card" data-seller-id="${s.id}">
            <div class="seller-avatar">${avatar}
                <div class="seller-header-info"><h3 class="seller-name">${s.name}</h3><p class="seller-email">${s.email}</p></div>
                <span class="status-badge ${status}">${status}</span>
            </div>
            <div class="seller-info">
                <p class="seller-phone">${s.phone || 'No phone provided'}</p>
                <p class="seller-address">${s.address || 'No address provided'}</p>
                <div class="seller-stats">
                    <div class="stat"><span class="stat-value">${s.total_quantity}</span><span class="stat-label">Quantity</span></div>
                    <div class="stat"><span class="stat-value">${this.formatCurrency(s.total_revenue)}</span><span class="stat-label">Revenue</span></div>
                    <div class="stat"><span class="stat-value">${s.transactions_count}</span><span class="stat-label">Transactions</span></div>
                </div>
                <div class="seller-actions">
                    <button class="btn-icon view-btn" title="View Details" data-seller-id="${s.id}"><i class="fas fa-eye"></i></button>
                    <button class="btn-icon edit-btn" title="Edit" data-seller-id="${s.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon delete-btn" title="Delete" data-seller-id="${s.id}"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </div>`;
    }

    updatePagination() {
        const total = Math.ceil(this.filteredSellers.length / this.sellersPerPage);
        document.querySelector('.pagination-info').textContent = total > 0 ? `Page ${this.currentPage} of ${total}` : 'Page 1 of 1';
        document.getElementById('prevPageBtn').disabled = this.currentPage === 1;
        document.getElementById('nextPageBtn').disabled = this.currentPage === total || total === 0;
    }

    changePage(page) {
        const total = Math.ceil(this.filteredSellers.length / this.sellersPerPage);
        if (page >= 1 && page <= total) {
            this.currentPage = page;
            this.renderSellers();
        }
    }
    
    paginate(arr, page, size) {
        return arr.slice((page - 1) * size, page * size);
    }
    
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

    showViewSellerModal(id) {
        const s = this.sellers.find(sel => sel.id == id);
        if (!s) return;
        
        const status = this.getSellerStatus(s);
        const initials = s.name.split(' ').map(n => n[0]).join('').toUpperCase();
        const avatar = s.photo_url ? 
            `<img src="${s.photo_url}" alt="${s.name}" class="avatar-image-large">` :
            `<div class="avatar-placeholder-large"><span class="avatar-initials">${initials}</span></div>`;
        const phone = s.phone ? `<div class="copy-wrapper"><span id="phone-to-copy">${s.phone}</span>
            <button class="copy-btn" id="copyPhoneBtn" title="Copy phone number"><i class="far fa-copy"></i></button></div>` : '<span>N/A</span>';

        const body = `<div class="view-modal-profile-header">
            <div class="view-modal-avatar">${avatar}</div>
            <div class="view-modal-info"><h3>${s.name}</h3><p>${s.email}</p></div>
        </div>
        <div class="seller-details-grid">
            <div class="detail-item"><label>Phone</label>${phone}</div>
            <div class="detail-item"><label>Address</label><span>${s.address || 'N/A'}</span></div>
            <div class="detail-item"><label>Status</label><div><span class="status-badge ${status}">${status}</span></div></div>
            <div class="detail-item"><label>Total Revenue</label><span class="revenue-amount">${this.formatCurrency(s.total_revenue)}</span></div>
            <div class="detail-item"><label>Total Quantity Sold</label><span>${s.total_quantity}</span></div>
            <div class="detail-item"><label>Total Transactions</label><span>${s.transactions_count}</span></div>
            <div class="detail-item full-width"><label>Last Transaction</label><span>${s.last_transaction_date ? new Date(s.last_transaction_date).toLocaleString() : 'None'}</span></div>
        </div>`;
        
        this.openModal('Seller Details', body, '<button class="btn btn-secondary" id="modalCloseBtnFooter">Close</button>');

        if (s.phone) {
            document.getElementById('copyPhoneBtn').addEventListener('click', () => {
                const text = document.getElementById('phone-to-copy').textContent;
                const btn = document.getElementById('copyPhoneBtn');
                navigator.clipboard.writeText(text).then(() => {
                    const orig = btn.innerHTML;
                    btn.innerHTML = '<span class="copied-feedback">Copied!</span>';
                    btn.disabled = true;
                    setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 2000);
                }).catch(() => this.showNotification('Failed to copy to clipboard.', 'error'));
            });
        }
        document.getElementById('modalCloseBtnFooter').addEventListener('click', () => this.closeModal());
    }

    showEditSellerModal(id) {
        const s = this.sellers.find(sel => sel.id == id);
        if (!s) return;
    
        this.openModal('Edit Seller', this.getSellerFormHTML(s), 
            '<button class="btn btn-secondary" id="modalCancelBtn">Cancel</button><button class="btn btn-primary" id="modalSaveBtn">Save Changes</button>');
        
        const photoInput = document.getElementById('sellerPhotoInput');
        if (photoInput) {
            photoInput.addEventListener('change', () => {
                const file = photoInput.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => document.querySelector('.photo-preview').innerHTML = `<img src="${e.target.result}" id="photoPreview" alt="Photo preview">`;
                    reader.readAsDataURL(file);
                }
            });
        }
        
        document.getElementById('modalCancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('modalSaveBtn').addEventListener('click', (e) => this.handleUpdateSeller(e, id));
    }
    
    showAddSellerModal() {
        this.openModal('Add New Seller', this.getSellerFormHTML(), 
            '<button class="btn btn-secondary" id="modalCancelBtn">Cancel</button><button class="btn btn-primary" id="modalAddBtn">Add Seller</button>');
        document.getElementById('modalCancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('modalAddBtn').addEventListener('click', (e) => this.handleCreateSeller(e));
    }
    
    showDeleteConfirmModal(id) {
        const s = this.sellers.find(sel => sel.id == id);
        if (!s) return;
    
        this.openModal('Confirm Deletion', 
            `<div class="delete-confirm-body"><i class="fas fa-exclamation-triangle"></i>
            <p>Are you sure you want to permanently delete <strong>${s.name}</strong>?</p>
            <p>This action cannot be undone.</p></div>`,
            '<button class="btn btn-secondary" id="cancelDeleteBtn">Cancel</button><button class="btn btn-danger" id="confirmDeleteBtn">Delete</button>');
    
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => this.handleDeleteSeller(id));
    }

    async handleUpdateSeller(e, id) {
        e.preventDefault();
        const btn = document.getElementById('modalSaveBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    
        const form = document.getElementById('sellerForm');
        const data = {
            name: form.querySelector('#sellerName').value,
            email: form.querySelector('#sellerEmail').value,
            phone: form.querySelector('#sellerPhone').value,
            address: form.querySelector('#sellerAddress').value,
        };
    
        try {
            const res = await fetch(`${this.apiUrl}/${id}`, {
                method: 'PUT', credentials: 'include',
                headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to update seller details.');
    
            const photoInput = document.getElementById('sellerPhotoInput');
            if (photoInput && photoInput.files.length > 0) {
                const fd = new FormData();
                fd.append('photo', photoInput.files[0]);
                const photoRes = await fetch(`${this.apiUrl}/${id}/photo`, { method: 'POST', credentials: 'include', body: fd });
                if (!photoRes.ok) throw new Error('Failed to upload photo.');
            }
            
            this.showNotification('Seller updated successfully!', 'success');
            this.closeModal();
            await this.refreshSellers();
        } catch (err) {
            console.error('Update failed:', err);
            this.showNotification(`Update failed: ${err.message}`, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Save Changes';
        }
    }
    
    async handleCreateSeller(e) {
       e.preventDefault();
       const form = document.getElementById('sellerForm');
       const data = {
         name: form.querySelector('#sellerName').value,
         email: form.querySelector('#sellerEmail').value,
         phone: form.querySelector('#sellerPhone').value,
         address: form.querySelector('#sellerAddress').value,
       };
       
       if (!data.name || !data.email) {
         this.showNotification('Name and Email are required.', 'error');
         return;
       }

        try {
            const res = await fetch(this.apiUrl, {
                method: 'POST', credentials: 'include',
                headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error(await res.json().then(d => d.message));
            this.showNotification('Seller added successfully!', 'success');
            this.closeModal();
            await this.refreshSellers();
        } catch (err) {
            console.error('Add failed:', err);
            this.showNotification(`Failed to add seller: ${err.message}`, 'error');
        }
    }
    
    async handleDeleteSeller(id) {
        this.closeModal();
        try {
            const res = await fetch(`${this.apiUrl}/${id}`, { method: 'DELETE', credentials: 'include' });
            if (!res.ok) throw new Error(await res.json().then(d => d.message));
            this.showNotification('Seller deleted successfully.', 'success');
            await this.refreshSellers();
        } catch (err) {
            console.error('Delete failed:', err);
            this.showNotification(`Delete failed: ${err.message}`, 'error');
        }
    }

    getSellerStatus(s) {
        if (!s.last_transaction_date) return 'inactive';
        const last = new Date(s.last_transaction_date);
        const sixMonths = new Date();
        sixMonths.setMonth(sixMonths.getMonth() - 6);
        return last >= sixMonths ? 'active' : 'inactive';
    }

    formatCurrency(val) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(val || 0);
    }
    
    getSellerFormHTML(s = {}) {
        const photoUrl = s.photo_url || ''; 
        const photoUploader = s.id ? `
            <div class="form-group full-width photo-uploader">
                <label>Profile Photo</label>
                <div class="photo-preview">
                    ${photoUrl ? `<img src="${photoUrl}" id="photoPreview" alt="Photo preview">` : 
                        '<div class="avatar-placeholder-large" id="photoPreview"><i class="fas fa-camera"></i></div>'}
                </div>
                <input type="file" id="sellerPhotoInput" accept="image/png, image/jpeg, image/gif">
                <label for="sellerPhotoInput" class="btn btn-secondary upload-btn">Choose Photo</label>
            </div>` : '';

        return `<form id="sellerForm" class="form-grid" onsubmit="return false;">
            ${photoUploader}
            <div class="form-group ${!s.id ? 'full-width' : ''}"><label for="sellerName">Full Name</label><input type="text" id="sellerName" value="${s.name || ''}" required></div>
            <div class="form-group ${!s.id ? 'full-width' : ''}"><label for="sellerEmail">Email Address</label><input type="email" id="sellerEmail" value="${s.email || ''}" required></div>
            <div class="form-group full-width"><label for="sellerPhone">Phone Number</label><input type="tel" id="sellerPhone" value="${s.phone || ''}"></div>
            <div class="form-group full-width"><label for="sellerAddress">Address</label><input type="text" id="sellerAddress" value="${s.address || ''}"></div>
        </form>`;
    }

    showError(msg) {
        document.querySelector('.sellers-grid').innerHTML = `<div class="error-message">
            <i class="fas fa-exclamation-triangle"></i><h3>An Error Occurred</h3><p>${msg}</p>
            <button class="btn btn-primary" onclick="location.reload()">Retry</button></div>`;
    }

    showNotification(msg, type = 'info') {
        const container = document.getElementById('notification-container');
        const notif = document.createElement('div');
        notif.className = `notification notification-${type}`;
        const icons = { success: 'fa-check-circle', error: 'fa-exclamation-triangle', info: 'fa-info-circle' };
        notif.innerHTML = `<i class="fas ${icons[type] || 'fa-info-circle'}"></i><span>${msg}</span>`;
        container.appendChild(notif);
        setTimeout(() => notif.classList.add('show'), 10);
        setTimeout(() => { notif.classList.remove('show'); setTimeout(() => notif.remove(), 500); }, 4000);
    }
}

document.addEventListener('DOMContentLoaded', () => new SellerManagement());