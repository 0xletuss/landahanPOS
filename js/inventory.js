class InventoryManager {
    constructor() {
        console.log('1. InventoryManager class instantiated.');
        this.apiBaseUrl = 'https://landahan-5.onrender.com/api';
        this.products = [];
        this.currentDelivery = {};
        this.cacheDOMElements();
        this.init();
    }

    async init() {
        await this.loadInventoryData();
        this.setupEventListeners();
    }

    cacheDOMElements() {
        // Caches all the necessary DOM elements
        this.dom = {
            totalQuantityValue: document.getElementById('totalQuantityValue'),
            totalCostValue: document.getElementById('totalCostValue'),
            refreshBtn: document.getElementById('refreshBtn'),
            tableBody: document.getElementById('inventoryTableBody'),
            notificationContainer: document.getElementById('notification-container'),
            inventoryAlerts: document.getElementById('inventoryAlerts'),
            huskModal: document.getElementById('huskModal'),
            huskForm: document.getElementById('huskForm'),
            confirmDeliverModal: document.getElementById('confirmDeliverModal'),
            confirmDeliverForm: document.getElementById('confirmDeliverForm'),
            deliverAllProductName: document.getElementById('deliverAllProductName'),
            deliverAllStockQuantity: document.getElementById('deliverAllStockQuantity'),
            profitModal: document.getElementById('profitModal'),
            profitForm: document.getElementById('profitForm'),
            costOfGoodsSold: document.getElementById('costOfGoodsSold'),
            totalEarned: document.getElementById('totalEarned'),
            calculatedProfit: document.getElementById('calculatedProfit'),
            addPurchaseBtn: document.getElementById('addPurchaseBtn'),
            addPurchaseModal: document.getElementById('addPurchaseModal'),
            addPurchaseForm: document.getElementById('addPurchaseForm'),
            purchaseProduct: document.getElementById('purchaseProduct'),
            purchaseSeller: document.getElementById('purchaseSeller'),
            rejectsModal: document.getElementById('rejectsModal'),
            rejectsForm: document.getElementById('rejectsForm'),
            rejectQuantity: document.getElementById('rejectQuantity')
        };
    }

    setupEventListeners() {
        // Sets up all event listeners for buttons and forms
        console.log('4. Setting up event listeners.');
        this.dom.refreshBtn.addEventListener('click', () => this.loadInventoryData());

        this.dom.tableBody.addEventListener('click', (e) => {
            const deliverButton = e.target.closest('.deliver-btn');
            const huskButton = e.target.closest('.husk-btn');
            if (deliverButton) {
                const product = this.getProductFromButton(deliverButton);
                if (product) this.openConfirmDeliverModal(product);
            }
            if (huskButton) {
                const product = this.getProductFromButton(huskButton);
                if (product) this.openHuskModal(product);
            }
        });

        this.dom.addPurchaseBtn.addEventListener('click', () => this.openAddPurchaseModal());
        this.dom.addPurchaseForm.addEventListener('submit', (e) => this.handleAddPurchaseSubmit(e));
        this.dom.confirmDeliverForm.addEventListener('submit', (e) => this.handleConfirmDeliverSubmit(e));
        this.dom.profitForm.addEventListener('submit', (e) => this.handleProfitSubmit(e));
        this.dom.huskForm.addEventListener('submit', (e) => this.handleHuskSubmit(e));
        this.dom.totalEarned.addEventListener('input', () => this.updateProfitDisplay());
        this.dom.rejectsForm.addEventListener('submit', (e) => this.handleRejectsSubmit(e));

        this.setupModalCloseListeners(this.dom.addPurchaseModal);
        this.setupModalCloseListeners(this.dom.huskModal);
        this.setupModalCloseListeners(this.dom.confirmDeliverModal);
        this.setupModalCloseListeners(this.dom.profitModal);
        this.setupModalCloseListeners(this.dom.rejectsModal);
    }

    async loadInventoryData() {
        // Fetches product data from the backend
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
        // Renders all components on the page
        this.renderMetrics();
        this.renderAlerts();
        this.renderTable();
    }

    /**
     * ✅ MODIFIED: Excludes 'Reject' products from total calculations.
     */
    renderMetrics() {
        const activeProducts = this.products.filter(p => p.name !== 'Reject');

        const totalQuantity = activeProducts.reduce((sum, p) => sum + parseInt(p.total_quantity, 10), 0);
        const totalCost = activeProducts.reduce((sum, p) => sum + parseFloat(p.total_cost), 0);
        
        this.dom.totalQuantityValue.textContent = totalQuantity.toLocaleString();
        this.dom.totalCostValue.textContent = this.formatCurrency(totalCost);
    }

    renderAlerts() {
        // Renders high-stock warning alerts
        const highStockProducts = this.products.filter(p => p.current_stock >= p.high_stock_threshold && p.high_stock_threshold > 0);
        if (highStockProducts.length === 0) {
            this.dom.inventoryAlerts.innerHTML = '';
            return;
        }
        const alertMessages = highStockProducts.map(p => {
            const actionText = p.name === 'Unhusked Coconut' ? 'process (husk)' : 'deliver';
            return `<div class="alert alert-warning"><i class="fas fa-exclamation-triangle"></i><span><strong>High Stock Warning:</strong> The stock for <strong>${p.name}</strong> (${p.current_stock}) has reached the threshold of ${p.high_stock_threshold}. Consider to ${actionText}.</span></div>`;
        }).join('');
        this.dom.inventoryAlerts.innerHTML = alertMessages;
    }

    renderTable() {
        // Renders the main inventory table
        if (this.products.length === 0) {
            this.dom.tableBody.innerHTML = `<tr><td colspan="4" class="no-data">No product data found.</td></tr>`;
            return;
        }
        this.dom.tableBody.innerHTML = this.products.map(p => this.createProductRow(p)).join('');
    }

    /**
     * ✅ MODIFIED: This function now handles displaying Copra and Rejects correctly.
     */
   /**
     * This function builds the HTML for a single row in the inventory table.
     * It needs to return a complete <tr> element with <td> cells inside.
     */
    createProductRow(product) {
        if (!product || typeof product.id === 'undefined') {
            console.error('Invalid product data passed to createProductRow:', product);
            return '';
        }

        let stockDisplay, stockValueDisplay, actionsDisplay;

        // Special handling for the "Reject" product type
        if (product.name === 'Reject') {
            stockDisplay = parseInt(product.reject_count, 10); // Use reject_count
            stockValueDisplay = `<span class="no-action">N/A</span>`; // No value for rejects
            actionsDisplay = `<span class="no-action">N/A</span>`; // No actions for rejects
        } else {
            // Normal handling for all other products (Husked, Unhusked, Copra)
            stockDisplay = parseInt(product.current_stock, 10);
            const estimatedValue = (product.total_quantity > 0) ? stockDisplay * (parseFloat(product.total_cost) / parseInt(product.total_quantity, 10)) : 0;
            stockValueDisplay = this.formatCurrency(estimatedValue);
            
            const isHighStock = product.current_stock >= product.high_stock_threshold && product.high_stock_threshold > 0;
            actionsDisplay = `<span class="no-action">-</span>`;

            if (isHighStock && product.current_stock > 0) {
                // Deliver button applies to Husked Coconut and Copra
                if (['Husked Coconut', 'Copra'].includes(product.name)) {
                    actionsDisplay = `<button class="btn btn-primary deliver-btn" data-id="${product.id}">Deliver</button>`;
                } else if (product.name === 'Unhusked Coconut') {
                    actionsDisplay = `<button class="btn btn-secondary husk-btn" data-id="${product.id}">Husk All</button>`;
                }
            }
        }
        
        // ✅ CRITICAL PART: The surrounding <tr> and <td> tags create the table structure.
        return `
            <tr data-product-id="${product.id}">
                <td class="col-name" data-label="Product Name"><strong>${product.name}</strong></td>
                <td class="col-qty" data-label="Current Stock">${stockDisplay}</td>
                <td class="col-price" data-label="Est. Stock Value">${stockValueDisplay}</td>
                <td class="col-actions" data-label="Actions">${actionsDisplay}</td>
            </tr>
        `;
    }

    // --- All other functions for handling modals and utilities are unchanged ---
    
    async openAddPurchaseModal() {
        try {
            // Filter out 'Reject' from the list of purchasable products
            const purchasableProducts = this.products.filter(p => p.name !== 'Reject');
            this.dom.purchaseProduct.innerHTML = purchasableProducts
                .map(p => `<option value="${p.id}">${p.name}</option>`)
                .join('');

            this.showNotification('Loading sellers...', 'info');
            const sellers = await this.fetchData('/sellers');
            this.dom.purchaseSeller.innerHTML = sellers
                .map(s => `<option value="${s.id}">${s.name}</option>`)
                .join('');

            this.dom.addPurchaseForm.reset();
            this.dom.addPurchaseModal.classList.add('show');
        } catch (error) {
            this.showNotification(`Error opening purchase form: ${error.message}`, 'error');
        }
    }

    async handleAddPurchaseSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const payload = {
            product_id: form.querySelector('#purchaseProduct').value,
            seller_id: form.querySelector('#purchaseSeller').value,
            quantity: form.querySelector('#purchaseQuantity').value,
            price_per_unit: form.querySelector('#purchasePrice').value
        };
        if (!payload.product_id || !payload.seller_id || !payload.quantity || !payload.price_per_unit) {
            this.showNotification('Please fill out all fields.', 'error');
            return;
        }
        try {
            this.showNotification('Saving purchase...', 'info');
            const result = await this.fetchData('/inventory/add-purchase', {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json' }
            });
            this.showNotification(result.message, 'success');
            this.dom.addPurchaseModal.classList.remove('show');
            await this.loadInventoryData();
        } catch (error) {
            this.showNotification(`Error saving purchase: ${error.message}`, 'error');
        }
    }

    openConfirmDeliverModal(product) {
        this.dom.deliverAllProductName.textContent = product.name;
        this.dom.deliverAllStockQuantity.textContent = product.current_stock;
        this.dom.confirmDeliverForm.dataset.productId = product.id;
        this.dom.confirmDeliverModal.classList.add('show');
    }

    handleConfirmDeliverSubmit(event) {
        event.preventDefault();
        const productId = event.target.dataset.productId;
        const product = this.products.find(p => p.id == productId);
        if (!product || product.current_stock <= 0) {
            this.showNotification('No stock to deliver for this product.', 'error');
            return;
        }
        const stockValue = (product.total_quantity > 0) ? product.current_stock * (product.total_cost / product.total_quantity) : 0;
        this.currentDelivery = {
            productId: product.id,
            costOfGoodsSold: stockValue
        };
        this.dom.confirmDeliverModal.classList.remove('show');
        this.openProfitModal();
    }

    openProfitModal() {
        this.dom.costOfGoodsSold.textContent = this.formatCurrency(this.currentDelivery.costOfGoodsSold);
        this.dom.totalEarned.value = '';
        this.dom.calculatedProfit.textContent = this.formatCurrency(0);
        this.dom.profitModal.classList.add('show');
    }

    handleProfitSubmit(event) {
        event.preventDefault();
        const totalEarned = parseFloat(this.dom.totalEarned.value);
        if (isNaN(totalEarned) || totalEarned < 0) {
            this.showNotification('Please enter a valid amount earned.', 'error');
            return;
        }
        this.currentDelivery.total_earned = totalEarned;
        this.dom.profitModal.classList.remove('show');
        this.openRejectsModal();
    }

    openRejectsModal() {
        this.dom.rejectQuantity.value = 0;
        this.dom.rejectsModal.classList.add('show');
    }

    async handleRejectsSubmit(event) {
        event.preventDefault();
        const rejectQuantity = parseInt(this.dom.rejectQuantity.value, 10);
        if (isNaN(rejectQuantity) || rejectQuantity < 0) {
            this.showNotification('Please enter a valid number for rejects.', 'error');
            return;
        }
        const finalPayload = {
            ...this.currentDelivery,
            reject_quantity: rejectQuantity
        };
        try {
            this.showNotification('Saving sale...', 'info');
            const result = await this.fetchData('/inventory/confirm-delivery', {
                method: 'POST',
                body: JSON.stringify(finalPayload),
                headers: { 'Content-Type': 'application/json' }
            });
            this.showNotification(result.message, 'success');
            this.dom.rejectsModal.classList.remove('show');
            this.currentDelivery = {};
            await this.loadInventoryData();
        } catch (error) {
            this.showNotification(`Error saving sale: ${error.message}`, 'error');
            this.dom.rejectsModal.classList.remove('show');
        }
    }
    
    updateProfitDisplay() {
        const totalEarned = parseFloat(this.dom.totalEarned.value) || 0;
        const cost = this.currentDelivery.costOfGoodsSold || 0;
        const profit = totalEarned - cost;
        this.dom.calculatedProfit.textContent = this.formatCurrency(profit);
    }

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
        return new Intl.NumberFormat('en-ph', { style: 'currency', currency: 'PHP' }).format(value || 0);
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
        if (!res.ok) {
            const errorData = await res.json();
            console.error("API Error Response:", errorData);
            throw new Error(errorData.message || 'API request failed');
        }
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return await res.json();
        } else {
            return {};
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new InventoryManager();
});