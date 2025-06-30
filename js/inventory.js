class InventoryManager {
    constructor() {
        console.log('1. InventoryManager class instantiated.');
        this.apiBaseUrl = 'https://landahan-5.onrender.com/api'; // Make sure this is your correct API URL
        this.products = [];
        this.currentDelivery = {}; // NEW: To hold temporary delivery data
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
            inventoryAlerts: document.getElementById('inventoryAlerts'),
            
            // MODIFIED: Replaced old deliver modal with new modals
            huskModal: document.getElementById('huskModal'),
            huskForm: document.getElementById('huskForm'),
            
            // NEW: Confirmation modal for delivery
            confirmDeliverModal: document.getElementById('confirmDeliverModal'),
            confirmDeliverForm: document.getElementById('confirmDeliverForm'),
            deliverAllProductName: document.getElementById('deliverAllProductName'),
            deliverAllStockQuantity: document.getElementById('deliverAllStockQuantity'),

            // NEW: Profit calculation modal
            profitModal: document.getElementById('profitModal'),
            profitForm: document.getElementById('profitForm'),
            costOfGoodsSold: document.getElementById('costOfGoodsSold'),
            totalEarned: document.getElementById('totalEarned'),
            calculatedProfit: document.getElementById('calculatedProfit'),
        };
    }

    setupEventListeners() {
        console.log('4. Setting up event listeners.');
        this.dom.refreshBtn.addEventListener('click', () => this.loadInventoryData());

        this.dom.tableBody.addEventListener('click', (e) => {
            const deliverButton = e.target.closest('.deliver-btn');
            const huskButton = e.target.closest('.husk-btn');
            if (deliverButton) {
                const product = this.getProductFromButton(deliverButton);
                if (product) this.openConfirmDeliverModal(product); // MODIFIED
            }
            if (huskButton) {
                const product = this.getProductFromButton(huskButton);
                if (product) this.openHuskModal(product);
            }
        });

        // MODIFIED: Listen to new forms and remove old ones
        this.dom.confirmDeliverForm.addEventListener('submit', (e) => this.handleConfirmDeliverSubmit(e));
        this.dom.profitForm.addEventListener('submit', (e) => this.handleProfitSubmit(e));
        this.dom.huskForm.addEventListener('submit', (e) => this.handleHuskSubmit(e));
        
        // NEW: Real-time profit calculation
        this.dom.totalEarned.addEventListener('input', () => this.updateProfitDisplay());

        // MODIFIED: Add new modals to close listeners
        this.setupModalCloseListeners(this.dom.huskModal);
        this.setupModalCloseListeners(this.dom.confirmDeliverModal);
        this.setupModalCloseListeners(this.dom.profitModal);
    }

    async loadInventoryData() {
        // This function remains the same
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
    
    // --- All render functions (render, renderMetrics, renderAlerts, renderTable, createProductRow) remain the same ---
    render() {
        this.renderMetrics();
        this.renderAlerts();
        this.renderTable(); 
    }
    renderMetrics() {
        const totalQuantity = this.products.reduce((sum, p) => sum + parseInt(p.total_quantity, 10), 0);
        const totalCost = this.products.reduce((sum, p) => sum + parseFloat(p.total_cost), 0);
        this.dom.totalQuantityValue.textContent = totalQuantity.toLocaleString();
        this.dom.totalCostValue.textContent = this.formatCurrency(totalCost);
    }
    renderAlerts() {
        const highStockProducts = this.products.filter(p => p.current_stock >= p.high_stock_threshold && p.high_stock_threshold > 0);
        if (highStockProducts.length === 0) {
            this.dom.inventoryAlerts.innerHTML = ''; return;
        }
        const alertMessages = highStockProducts.map(p => {
            const actionText = p.name === 'Unhusked Coconut' ? 'process (husk)' : 'deliver';
            return `<div class="alert alert-warning"><i class="fas fa-exclamation-triangle"></i><span><strong>High Stock Warning:</strong> The stock for <strong>${p.name}</strong> (${p.current_stock}) has reached the threshold of ${p.high_stock_threshold}. Consider to ${actionText}.</span></div>`;
        }).join('');
        this.dom.inventoryAlerts.innerHTML = alertMessages;
    }
    renderTable() {
        if (this.products.length === 0) {
            this.dom.tableBody.innerHTML = `<tr><td colspan="4" class="no-data">No product data found.</td></tr>`;
            return;
        }
        this.dom.tableBody.innerHTML = this.products.map(p => this.createProductRow(p)).join('');
    }
    createProductRow(product) {
        if (!product || typeof product.id === 'undefined') {
            console.error('Invalid product data passed to createProductRow:', product);
            return '';
        }
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
        return `<tr data-product-id="${product.id}" class="${isHighStock ? 'high-stock-warning' : ''}"><td class="col-name" data-label="Product Name"><strong>${product.name}</strong></td><td class="col-qty" data-label="Current Stock">${currentStockNum}</td><td class="col-price" data-label="Est. Stock Value">${this.formatCurrency(estimatedStockValue)}</td><td class="col-actions" data-label="Actions">${actionButtonHTML}</td></tr>`;
    }

    // --- MODIFIED & NEW MODAL LOGIC STARTS HERE ---

    // NEW: Opens the simple "deliver all" confirmation modal
    openConfirmDeliverModal(product) {
        this.dom.deliverAllProductName.textContent = product.name;
        this.dom.deliverAllStockQuantity.textContent = product.current_stock;
        this.dom.confirmDeliverForm.dataset.productId = product.id;
        this.dom.confirmDeliverModal.classList.add('show');
    }

    // NEW: Handles Stage 1 of delivery - Calculating Cost
    // In inventory.js, inside the InventoryManager class...

    // ...

    async handleConfirmDeliverSubmit(event) {
        event.preventDefault();
        const productId = event.target.dataset.productId;
        const product = this.products.find(p => p.id == productId);

        if (!product) {
            this.showNotification('Could not find product data.', 'error');
            return;
        }
        
        try {
            this.showNotification('Calculating cost of goods...', 'info');
            // We only need to send the product ID now
            const payload = { productId: product.id };
            
            const result = await this.fetchData('/inventory/calculate-delivery-cost', {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json' }
            });
            
            // ✅ MODIFIED: Store all data from the backend's response
            this.currentDelivery = {
                productId: product.id,
                quantity: result.quantity_to_deliver, // Use quantity from backend
                costOfGoodsSold: result.cost_of_goods_sold // Use cost from backend
            };
            
            this.dom.confirmDeliverModal.classList.remove('show');
            this.openProfitModal();

        } catch (error) {
            this.showNotification(`Error calculating cost: ${error.message}`, 'error');
            this.dom.confirmDeliverModal.classList.remove('show');
        }
    }
    
    // ...

    // NEW: Opens the profit modal and populates it with data
    openProfitModal() {
        this.dom.costOfGoodsSold.textContent = this.formatCurrency(this.currentDelivery.costOfGoodsSold);
        this.dom.totalEarned.value = '';
        this.dom.calculatedProfit.textContent = this.formatCurrency(0);
        this.dom.profitModal.classList.add('show');
    }

    // NEW: Handles Stage 2 of delivery - Confirming Sale and Profit
    async handleProfitSubmit(event) {
        event.preventDefault();
        const totalEarned = parseFloat(this.dom.totalEarned.value);

        if (isNaN(totalEarned) || totalEarned < 0) {
            this.showNotification('Please enter a valid amount earned.', 'error');
            return;
        }

        const finalPayload = {
            ...this.currentDelivery,
            total_earned: totalEarned
        };

        try {
            this.showNotification('Saving sale...', 'info');
            // This is the SECOND API call to the backend
            const result = await this.fetchData('/inventory/confirm-delivery', {
                method: 'POST',
                body: JSON.stringify(finalPayload),
                headers: { 'Content-Type': 'application/json' }
            });
            
            this.showNotification(result.message, 'success');
            this.dom.profitModal.classList.remove('show');
            this.currentDelivery = {}; // Clear temp data
            await this.loadInventoryData(); // Refresh dashboard

        } catch (error) {
            this.showNotification(`Error saving sale: ${error.message}`, 'error');
            this.dom.profitModal.classList.remove('show');
        }
    }
    
    // NEW: Helper to calculate profit in real-time in the UI
    updateProfitDisplay() {
        const totalEarned = parseFloat(this.dom.totalEarned.value) || 0;
        const cost = this.currentDelivery.costOfGoodsSold || 0;
        const profit = totalEarned - cost;
        this.dom.calculatedProfit.textContent = this.formatCurrency(profit);
    }

    // --- Husk functions and other utilities remain the same ---
    openHuskModal(product) {
        const modal = this.dom.huskModal;
        modal.querySelector('#huskCurrentStock').textContent = product.current_stock;
        this.dom.huskForm.dataset.productId = product.id;
        modal.classList.add('show');
    }
    async handleHuskSubmit(event) {
        event.preventDefault();
        const product_id = event.target.dataset.productId;
        if (!product_id) {
            this.showNotification('Error: Could not process husk. Missing data.', 'error');
            return;
        }
        try {
            const payload = { product_id: parseInt(product_id, 10) };
            const result = await this.fetchData('/inventory/husk', {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json' }
            });
            this.showNotification(result.message, 'success');
            this.dom.huskModal.classList.remove('show');
            await this.loadInventoryData();
        } catch (error) {
            this.showNotification(`Error: ${error.message}`, 'error');
            this.dom.huskModal.classList.remove('show');
        }
    }
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