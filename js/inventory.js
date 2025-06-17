class InventoryManager {
    constructor() {
        this.apiBaseUrl = 'https://landahan-5.onrender.com/api';
        this.products = [];
        this.cacheDOMElements();
        this.init();
    }

    async init() {
        await this.loadInventorySummary();
        this.setupEventListeners();
    }

    cacheDOMElements() {
        this.dom = {
            totalProductsValue: document.getElementById('totalProductsValue'),
            refreshBtn: document.getElementById('refreshBtn'),
            tableBody: document.getElementById('inventoryTableBody'),
            notificationContainer: document.getElementById('notification-container')
        };
    }

    setupEventListeners() {
        this.dom.refreshBtn.addEventListener('click', () => this.loadInventorySummary());
    }

    async loadInventorySummary() {
        this.showLoader();
        try {
            const data = await this.fetchData('/products-summary');
            this.products = data || [];
            this.render();
        } catch (error) {
            this.showNotification(`Error loading inventory summary: ${error.message}`, 'error');
            console.error(error);
        } finally {
            this.hideLoader();
        }
    }
    
    render() {
        this.renderMetrics();
        this.renderTable();
    }

    renderMetrics() {
        const totalProducts = this.products.length;
        this.dom.totalProductsValue.textContent = totalProducts;
    }

    renderTable() {
        if (this.products.length === 0) {
            // ✅ UPDATED: Colspan changed to 4
            this.dom.tableBody.innerHTML = `<tr><td colspan="4" class="no-data">No product summary found.</td></tr>`;
            return;
        }

        this.dom.tableBody.innerHTML = this.products.map(p => this.createProductRow(p)).join('');
    }

    createProductRow(product) {
        const averagePrice = product.total_quantity > 0
            ? product.total_cost / product.total_quantity
            : 0;

        return `
            <tr data-product-id="${product.id}">
                <td class="col-name"><strong>${product.name}</strong></td>
                <td class="col-qty">${product.total_quantity}</td>
                <td class="col-price">${this.formatCurrency(averagePrice)}</td>
                <td class="col-price">${this.formatCurrency(product.total_cost)}</td>
            </tr>
        `;
    }

    // --- UTILITY FUNCTIONS ---
    showLoader() {
        // ✅ UPDATED: Colspan changed to 4
        this.dom.tableBody.innerHTML = `<tr><td colspan="4" class="loading-row"><div class="loading-spinner"></div></td></tr>`;
    }
    hideLoader() {
        // This works as is.
    }
    formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency', currency: 'PHP', minimumFractionDigits: 2
        }).format(value || 0);
    }
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        const icons = { success: 'fa-check-circle', error: 'fa-exclamation-triangle', info: 'fa-info-circle' };
        notification.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
        this.dom.notificationContainer.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 4000);
    }
    async fetchData(endpoint, options = {}) {
        const defaultOptions = { credentials: 'include' };
        const res = await fetch(`${this.apiBaseUrl}${endpoint}`, { ...defaultOptions, ...options });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'API request failed');
        return data;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new InventoryManager();
});