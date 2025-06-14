// Import your loader functions
import { showLoader, hideLoader } from './loader.js';

// Seller Management JavaScript
class SellerManagement {
    constructor() {
        this.sellers = [];
        this.filteredSellers = [];
        this.currentPage = 1;
        this.sellersPerPage = 6;
        this.apiUrl = 'https://landahan-5.onrender.com/api/sellers/overview';
        this.init();
    }

    async init() {
        await this.loadSellers();
        this.setupEventListeners();
        this.renderSellers();
    }

    async loadSellers() {
        try {
            // Clear the grid and show your custom loader
            const sellersGrid = document.querySelector('.sellers-grid');
            if (sellersGrid) {
                sellersGrid.innerHTML = '<div id="sellers-loader"></div>';
                showLoader('sellers-loader');
            }
            
            const response = await fetch(this.apiUrl, {
                method: 'GET',
                credentials: 'include', // Include cookies for session
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.sellers = data.sellers || [];
            this.filteredSellers = [...this.sellers];
            
            console.log('Sellers loaded:', this.sellers);
            
            // Hide loader after successful load
            hideLoader();
            
        } catch (error) {
            console.error('Error loading sellers:', error);
            hideLoader(); // Hide loader even on error
            this.showError('Failed to load sellers. Please try again later.');
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterSellers(e.target.value);
            });
        }

        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filterByStatus(e.target.value);
            });
        }

        // Sort functionality
        const sortBy = document.getElementById('sortBy');
        if (sortBy) {
            sortBy.addEventListener('change', (e) => {
                this.sortSellers(e.target.value);
            });
        }

        // Add seller button
        const addSellerBtn = document.getElementById('addSellerBtn');
        if (addSellerBtn) {
            addSellerBtn.addEventListener('click', () => {
                this.showAddSellerModal();
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshSellers();
            });
        }
    }

    filterSellers(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredSellers = [...this.sellers];
        } else {
            const term = searchTerm.toLowerCase();
            this.filteredSellers = this.sellers.filter(seller => 
                seller.name.toLowerCase().includes(term) ||
                seller.email.toLowerCase().includes(term) ||
                (seller.phone && seller.phone.toLowerCase().includes(term))
            );
        }
        this.currentPage = 1;
        this.renderSellers();
    }

    filterByStatus(status) {
        if (!status) {
            this.filteredSellers = [...this.sellers];
        } else {
            // Since we don't have status in the database yet, we'll simulate it
            // You can modify this when you add status to your database
            this.filteredSellers = this.sellers.filter(seller => {
                // For now, we'll consider sellers with revenue > 0 as active
                const simulatedStatus = seller.total_revenue > 0 ? 'active' : 'inactive';
                return simulatedStatus === status;
            });
        }
        this.currentPage = 1;
        this.renderSellers();
    }

    sortSellers(sortBy) {
        switch (sortBy) {
            case 'name':
                this.filteredSellers.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'revenue':
                this.filteredSellers.sort((a, b) => b.total_revenue - a.total_revenue);
                break;
            case 'transactions':
                this.filteredSellers.sort((a, b) => b.transactions_count - a.transactions_count);
                break;
            case 'quantity':
                this.filteredSellers.sort((a, b) => b.total_quantity - a.total_quantity);
                break;
            default:
                break;
        }
        this.renderSellers();
    }

    renderSellers() {
        const sellersGrid = document.querySelector('.sellers-grid');
        if (!sellersGrid) return;

        if (this.filteredSellers.length === 0) {
            sellersGrid.innerHTML = `
                <div class="no-sellers">
                    <i class="fas fa-store-slash"></i>
                    <h3>No sellers found</h3>
                    <p>Try adjusting your search criteria or add a new seller.</p>
                </div>
            `;
            return;
        }

        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.sellersPerPage;
        const endIndex = startIndex + this.sellersPerPage;
        const paginatedSellers = this.filteredSellers.slice(startIndex, endIndex);

        // Render seller cards
        sellersGrid.innerHTML = paginatedSellers.map(seller => this.createSellerCard(seller)).join('');

        // Update pagination
        this.updatePagination();

        // Add event listeners to action buttons
        this.setupSellerActions();
    }

    createSellerCard(seller) {
    // Determine status: inactive if last transaction > 6 months ago or none
    let status = 'inactive';
    if (seller.last_transaction_date) {
        const lastTransaction = new Date(seller.last_transaction_date);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        if (lastTransaction >= sixMonthsAgo) {
            status = 'active';
        }
    }
    const statusClass = status;

    // Format revenue
    const formattedRevenue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(seller.total_revenue);

    // Generate initials for avatar placeholder
    const initials = seller.name.split(' ').map(n => n[0]).join('').toUpperCase();

    return `
        <div class="seller-card" data-seller-id="${seller.id}">
            <div class="seller-avatar">
                <div class="avatar-placeholder">
                    <span class="avatar-initials">${initials}</span>
                </div>
                <span class="status-badge ${statusClass}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
            </div>
            <div class="seller-info">
                <h3 class="seller-name">${seller.name}</h3>
                <p class="seller-email">${seller.email}</p>
                <p class="seller-phone">${seller.phone || 'No phone provided'}</p>
                <p class="seller-address">${seller.address || 'No address provided'}</p>
                <div class="seller-stats">
                    <div class="stat">
                        <span class="stat-value">${seller.total_quantity}</span>
                        <span class="stat-label">Total Quantity</span>
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
                    <button class="btn-icon view-btn" title="View Details" data-seller-id="${seller.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon edit-btn" title="Edit" data-seller-id="${seller.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-btn" title="Delete" data-seller-id="${seller.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}


    setupSellerActions() {
        // View buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sellerId = e.currentTarget.dataset.sellerId;
                this.viewSeller(sellerId);
            });
        });

        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sellerId = e.currentTarget.dataset.sellerId;
                this.editSeller(sellerId);
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sellerId = e.currentTarget.dataset.sellerId;
                this.deleteSeller(sellerId);
            });
        });
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredSellers.length / this.sellersPerPage);
        const paginationInfo = document.querySelector('.pagination-info');
        const prevBtn = document.querySelector('.pagination-btn:first-child');
        const nextBtn = document.querySelector('.pagination-btn:last-child');

        if (paginationInfo) {
            paginationInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
        }

        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
            prevBtn.onclick = () => this.changePage(this.currentPage - 1);
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPage === totalPages;
            nextBtn.onclick = () => this.changePage(this.currentPage + 1);
        }
    }

    changePage(page) {
        const totalPages = Math.ceil(this.filteredSellers.length / this.sellersPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderSellers();
        }
    }

    viewSeller(sellerId) {
        const seller = this.sellers.find(s => s.id == sellerId);
        if (seller) {
            alert(`Viewing seller: ${seller.name}\nEmail: ${seller.email}\nRevenue: $${seller.total_revenue}`);
            // You can implement a proper modal or navigation here
        }
    }

    editSeller(sellerId) {
        const seller = this.sellers.find(s => s.id == sellerId);
        if (seller) {
            // You can implement edit functionality here
            console.log('Edit seller:', seller);
            alert('Edit functionality to be implemented');
        }
    }

    deleteSeller(sellerId) {
        const seller = this.sellers.find(s => s.id == sellerId);
        if (seller && confirm(`Are you sure you want to delete ${seller.name}?`)) {
            // You can implement delete functionality here
            console.log('Delete seller:', seller);
            alert('Delete functionality to be implemented');
        }
    }

    showAddSellerModal() {
        // You can implement add seller functionality here
        alert('Add seller functionality to be implemented');
    }

    showError(message) {
        const sellersGrid = document.querySelector('.sellers-grid');
        if (sellersGrid) {
            sellersGrid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">Retry</button>
                </div>
            `;
        }
    }

    async refreshSellers() {
        await this.loadSellers();
        this.renderSellers();
    }
}

// Initialize the seller management when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SellerManagement();
});
