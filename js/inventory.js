class InventoryManager {
    constructor() {
        console.log('1. InventoryManager class instantiated.');
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
        console.log('2. Caching DOM elements.');
        this.dom = {
            totalQuantityValue: document.getElementById('totalQuantityValue'),
            totalCostValue: document.getElementById('totalCostValue'),
            refreshBtn: document.getElementById('refreshBtn'),
            tableBody: document.getElementById('inventoryTableBody'),
            notificationContainer: document.getElementById('notification-container'),
            deliverModal: document.getElementById('deliverModal'),
            huskModal: document.getElementById('huskModal'),
            deliverForm: document.getElementById('deliverForm'),
            huskForm: document.getElementById('huskForm'),
        };
    }

    setupEventListeners() {
        console.log('4. Setting up event listeners.');
        this.dom.refreshBtn.addEventListener('click', () => this.loadInventoryData());

        // Event delegation for action buttons in the table
        this.dom.tableBody.addEventListener('click', (e) => {
            console.log('5. Click detected inside table body.');
            const deliverButton = e.target.closest('.deliver-btn');
            const huskButton = e.target.closest('.husk-btn');

            if (deliverButton) {
                console.log('6a. Deliver button clicked.');
                const product = this.getProductFromButton(deliverButton);
                if (product) {
                    console.log('7a. Product found:', product);
                    this.openDeliverModal(product);
                } else {
                    console.error('Error: Could not find product for this deliver button.');
                }
            }
            if (huskButton) {
                console.log('6b. Husk button clicked.');
                const product = this.getProductFromButton(huskButton);
                if (product) {
                    console.log('7b. Product found:', product);
                    this.openHuskModal(product);
                } else {
                    console.error('Error: Could not find product for this husk button.');
                }
            }
        });

        // Event listeners for form submissions
        this.dom.deliverForm.addEventListener('submit', (e) => this.handleDeliverSubmit(e));
        this.dom.huskForm.addEventListener('submit', (e) => this.handleHuskSubmit(e));
        
        // Event listeners to handle closing the modals
        this.setupModalCloseListeners(this.dom.deliverModal);
        this.setupModalCloseListeners(this.dom.huskModal);
    }

    async loadInventoryData() {
        this.showLoader();
        try {
            console.log('3. Loading inventory data...');
            const data = await this.fetchData('/products-summary');
            this.products = data || [];
            this.render();
            console.log('Data loaded successfully.');
        } catch (error) {
            this.showNotification(`Error loading inventory: ${error.message}`, 'error');
            console.error('Error loading inventory:', error);
        } finally {
            this.hideLoader();
        }
    }
    
    render() {
        this.renderMetrics();
        this.renderTable();
    }

    renderMetrics() {
        const totalQuantity = this.products.reduce((sum, p) => sum + parseInt(p.total_quantity, 10), 0);
        const totalCost = this.products.reduce((sum, p) => sum + parseFloat(p.total_cost), 0);
        this.dom.totalQuantityValue.textContent = totalQuantity.toLocaleString();
        this.dom.totalCostValue.textContent = this.formatCurrency(totalCost);
    }

    renderTable() {
        if (this.products.length === 0) {
            this.dom.tableBody.innerHTML = `<tr><td colspan="4" class="no-data">No product data found.</td></tr>`;
            return;
        }
        this.dom.tableBody.innerHTML = this.products.map(p => this.createProductRow(p)).join('');
    }

    createProductRow(product) {
        const isHighStock = product.current_stock >= product.high_stock_threshold && product.high_stock_threshold > 0;
        let actionButtonHTML = `<span class="no-action">-</span>`;

        if (isHighStock) {
            if (product.name === 'Husked Coconut') {
                actionButtonHTML = `<button class="btn btn-primary deliver-btn" data-id="${product.id}">Deliver</button>`;
            } else if (product.name === 'Unhusked Coconut') {
                actionButtonHTML = `<button class="btn btn-secondary husk-btn" data-id="${product.id}">Husk All</button>`;
            }
        }
        const currentStockNum = parseInt(product.current_stock, 10);
        const estimatedStockValue = currentStockNum * (parseFloat(product.total_cost) / parseInt(product.total_quantity, 10) || 0);

        return `
            <tr data-product-id="${product.id}">
                <td class="col-name" data-label="Product Name"><strong>${product.name}</strong></td>
                <td class="col-qty" data-label="Current Stock">${currentStockNum}</td>
                <td class="col-price" data-label="Est. Stock Value">${this.formatCurrency(estimatedStockValue)}</td>
                <td class="col-actions" data-label="Actions">${actionButtonHTML}</td>
            </tr>
        `;
    }

    // --- MODAL AND ACTION HANDLERS ---
    
    openDeliverModal(product) {
        console.log('8a. Opening Deliver Modal.');
        const modal = this.dom.deliverModal;
        modal.querySelector('#deliverProductName').textContent = product.name;
        modal.querySelector('#deliverCurrentStock').textContent = product.current_stock;
        const quantityInput = modal.querySelector('#deliverQuantity');
        quantityInput.max = product.current_stock;
        quantityInput.value = '';
        this.dom.deliverForm.dataset.productId = product.id;
        console.log('Set deliverForm.dataset.productId =', product.id);
        modal.classList.add('show');
    }

    async handleDeliverSubmit(event) {
        event.preventDefault();
        console.log('9a. Deliver form submitted.');
        const product_id = event.target.dataset.productId;
        const quantity = this.dom.deliverModal.querySelector('#deliverQuantity').value;
        console.log('Attempting to deliver. Product ID:', product_id, 'Quantity:', quantity);

        if (!product_id || !quantity) {
             console.error('CRITICAL: Missing product_id or quantity before fetch.');
             this.showNotification('Error: Could not process delivery. Missing data.', 'error');
             return;
        }

        try {
            console.log('10a. Sending FETCH request to /inventory/deliver');
            const result = await this.fetchData('/inventory/deliver', {
                method: 'POST',
                body: JSON.stringify({ product_id, quantity }),
                headers: { 'Content-Type': 'application/json' }
            });
            this.showNotification(result.message, 'success');
            this.dom.deliverModal.classList.remove('show');
            this.loadInventoryData();
        } catch (error) {
            console.error('FETCH Error in handleDeliverSubmit:', error);
            this.showNotification(`Error: ${error.message}`, 'error');
        }
    }
    
    openHuskModal(product) {
        console.log('8b. Opening Husk Modal.');
        const modal = this.dom.huskModal;
        modal.querySelector('#huskCurrentStock').textContent = product.current_stock;
        this.dom.huskForm.dataset.productId = product.id; // This was the fix from before
        console.log('Set huskForm.dataset.productId =', product.id);
        modal.classList.add('show');
    }

    async handleHuskSubmit(event) {
        event.preventDefault();
        console.log('9b. Husk form submitted.');
        const product_id = event.target.dataset.productId;
        console.log('Attempting to husk. Product ID:', product_id);
        
        if (!product_id) {
             console.error('CRITICAL: Missing product_id before fetch.');
             this.showNotification('Error: Could not process husk. Missing data.', 'error');
             return;
        }

        try {
            console.log('10b. Sending FETCH request to /inventory/husk');
            const result = await this.fetchData('/inventory/husk', {
                method: 'POST',
                body: JSON.stringify({ product_id: product_id }), // Ensure body sends the id
                headers: { 'Content-Type': 'application/json' }
            });
            this.showNotification(result.message, 'success');
            this.dom.huskModal.classList.remove('show');
            this.loadInventoryData();
        } catch (error) {
            console.error('FETCH Error in handleHuskSubmit:', error);
            this.showNotification(`Error: ${error.message}`, 'error');
        }
    }

    // --- UTILITY FUNCTIONS ---

    getProductFromButton(button) {
        const productId = parseInt(button.dataset.id, 10);
        return this.products.find(p => p.id === productId);
    }
    
    setupModalCloseListeners(modalElement) {
        modalElement.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('close-btn') || e.target.classList.contains('cancel-btn')) {
                modalElement.classList.remove('show');
            }
        });
    }
    
    showLoader() {
        this.dom.tableBody.innerHTML = `<tr><td colspan="4" class="loading-row"><div class="loading-spinner"></div></td></tr>`;
    }

    hideLoader() {}

    formatCurrency(value) {
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value || 0);
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
        if (!res.ok) {
            console.error("API Error Response:", data);
            throw new Error(data.message || 'API request failed');
        }
        return data;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new InventoryManager();
});