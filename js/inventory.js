class InventoryManager {
    constructor() {
        this.apiBaseUrl = 'https://landahan-5.onrender.com/api';
        this.products = [];
        this.cacheDOMElements();
        this.init();
    }

    async init() {
        await this.loadInventoryData();
        this.setupEventListeners();
    }

    cacheDOMElements() {
        this.dom = {
            totalQuantityValue: document.getElementById('totalQuantityValue'),
            totalCostValue: document.getElementById('totalCostValue'),
            refreshBtn: document.getElementById('refreshBtn'),
            tableBody: document.getElementById('inventoryTableBody'),
            notificationContainer: document.getElementById('notification-container'),
            inventoryAlerts: document.getElementById('inventoryAlerts'),
        };
    }

    setupEventListeners() {
        this.dom.refreshBtn.addEventListener('click', () => this.loadInventoryData());
    }

    async loadInventoryData() {
        this.showLoader();
        try {
            const data = await this.fetchData('/products-summary');
            this.products = data || [];
            this.render();
        } catch (error) {
            this.showNotification(`Error loading inventory: ${error.message}`, 'error');
            console.error(error);
        } finally {
            this.hideLoader();
        }
    }
    
    render() {
        this.renderAlerts();
        this.renderMetrics();
        this.renderTable();
    }

    renderAlerts() {
        if (!this.dom.inventoryAlerts) return;
        this.dom.inventoryAlerts.innerHTML = ''; 
        
        const highStockProducts = this.products.filter(p => p.current_stock >= p.high_stock_threshold && p.high_stock_threshold > 0);

        if (highStockProducts.length === 0) {
            return; 
        }

        highStockProducts.forEach(product => {
            let alertMessage = '';
            let alertClass = 'alert-warning';

            if (product.name === 'Husked Coconut') {
                alertMessage = `<strong>High Stock Alert:</strong> Husked Coconut stock is at ${product.current_stock}. Time to schedule deliveries.`;
            } else if (product.name === 'Unhusked Coconut') {
                alertMessage = `<strong>High Stock Alert:</strong> Unhusked Coconut stock is at ${product.current_stock}. Needs to be processed for husking.`;
            }

            if(alertMessage) {
                const alertDiv = document.createElement('div');
                alertDiv.className = `alert ${alertClass}`;
                alertDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${alertMessage}`;
                this.dom.inventoryAlerts.appendChild(alertDiv);
            }
        });
    }

    renderMetrics() {
        const totalQuantity = this.products.reduce((sum, p) => sum + parseInt(p.total_quantity, 10), 0);
        const totalCost = this.products.reduce((sum, p) => sum + parseFloat(p.total_cost), 0);
        
        this.dom.totalQuantityValue.textContent = totalQuantity.toLocaleString();
        this.dom.totalCostValue.textContent = this.formatCurrency(totalCost);
    }

    renderTable() {
        if (this.products.length === 0) {
            this.dom.tableBody.innerHTML = `<tr><td colspan="3" class="no-data">No product data found.</td></tr>`;
            return;
        }
        this.dom.tableBody.innerHTML = this.products.map(p => this.createProductRow(p)).join('');
    }

    createProductRow(product) {
        const totalQuantityNum = parseInt(product.total_quantity, 10);
        const totalCostNum = parseFloat(product.total_cost);
        const currentStockNum = parseInt(product.current_stock, 10);

        const averagePrice = totalQuantityNum > 0
            ? totalCostNum / totalQuantityNum
            : 0;
            
        const estimatedStockValue = currentStockNum * averagePrice;

        // ✅ UPDATED: Added 'data-label' attributes to each <td> for mobile view
        return `
            <tr data-product-id="${product.id}">
                <td class="col-name" data-label="Product Name"><strong>${product.name}</strong></td>
                <td class="col-qty" data-label="Current Stock">${currentStockNum}</td>
                <td class="col-price" data-label="Est. Stock Value">${this.formatCurrency(estimatedStockValue)}</td>
            </tr>
        `;
    }

    // --- UTILITY FUNCTIONS ---
    showLoader() {
        this.dom.tableBody.innerHTML = `<tr><td colspan="3" class="loading-row"><div class="loading-spinner"></div></td></tr>`;
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