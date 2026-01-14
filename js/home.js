const API_BASE_URL = "https://landahan-5.onrender.com/api";

const state = {
    selectedSellerId: null,
    selectedProductId: 2, // Default to 'Unhusked'
};

/**
 * =================================================================
 * API SERVICE 🚀
 * =================================================================
 */
const api = {
    async _fetch(endpoint, options = {}) {
        const defaultOptions = {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        };

        try {
            const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...defaultOptions, ...options });
            if (res.status === 401) {
                ui.showMessage("❌ Session expired. Redirecting to login...", "error");
                setTimeout(() => (window.location.href = "../index.html"), 2000);
                throw new Error("Session expired");
            }
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || `An unknown server error occurred.`);
            }
            return data;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    verifySession() { return this._fetch("/verify-session"); },
    getSellers() { return this._fetch("/sellers"); },
    getTransactions() { return this._fetch("/transactions"); },
    getProductSummary() { return this._fetch("/products-summary"); },

    addSeller(sellerData) {
        return this._fetch("/add-seller", {
            method: "POST",
            body: JSON.stringify(sellerData),
        });
    },
    submitTransaction(transactionData) {
        return this._fetch("/submit-pos", {
            method: "POST",
            body: JSON.stringify(transactionData),
        });
    },
};

/**
 * =================================================================
 * UI MANAGEMENT 🎨
 * =================================================================
 */
const ui = {
    elements: {},
    cacheElements() {
        this.elements = {
            productTypeToggle: document.getElementById("productTypeToggle"),
            huskedLabel: document.getElementById("huskedLabel"),
            unhuskedLabel: document.getElementById("unhuskedLabel"),
            userName: document.getElementById("userName"),
            quantityInput: document.getElementById("quantity"),
            priceInput: document.getElementById("price"),
            totalInput: document.getElementById("total"),
            payBtn: document.getElementById("payBtn"),
            messageBox: document.getElementById("msg"),
            messageContent: document.querySelector("#msg .message-content"),
            sellerModal: document.getElementById("sellerModal"),
            selectSellerBtn: document.getElementById("selectSellerBtn"),
            closeModalBtn: document.getElementById("closeModal"),
            confirmSellerBtn: document.getElementById("confirmSellerBtn"),
            dropdownBtn: document.getElementById("dropdownBtn"),
            addFormBtn: document.getElementById("addFormBtn"),
            sellerDropdownSection: document.getElementById("sellerDropdownSection"),
            addSellerFormSection: document.getElementById("addSellerForm"),
            sellerList: document.getElementById("sellerList"),
            selectedSellerText: document.getElementById("selectedSellerText"),
            saveSellerBtn: document.getElementById("saveSellerBtn"),
            sellerNameInput: document.getElementById("sellerName"),
            sellerEmailInput: document.getElementById("sellerEmail"),
            sellerPhoneInput: document.getElementById("sellerPhone"),
            sellerAddressInput: document.getElementById("sellerAddress"),
            mainContent: document.querySelector(".main-content"),
        };
    },
    show(element) { element?.classList.add("show"); },
    hide(element) { element?.classList.remove("show"); },
    showMessage(text, type = "info") {
        const { messageBox, messageContent } = this.elements;
        if (!messageBox || !messageContent) return;
        messageContent.textContent = text;
        messageBox.className = `pos-message ${type}`;
        messageBox.classList.remove("hidden");
        if (type === "success" || type === "info") {
            setTimeout(() => messageBox.classList.add("hidden"), 3000);
        }
    },
    resetSellerFormInputs() {
        const { sellerNameInput, sellerEmailInput, sellerPhoneInput, sellerAddressInput } = this.elements;
        if (sellerNameInput) sellerNameInput.value = "";
        if (sellerEmailInput) sellerEmailInput.value = "";
        if (sellerPhoneInput) sellerPhoneInput.value = "";
        if (sellerAddressInput) sellerAddressInput.value = "";
    },
    resetForm() {
        const { elements } = this;
        if (elements.quantityInput) elements.quantityInput.value = "";
        if (elements.priceInput) elements.priceInput.value = "";
        if (elements.totalInput) elements.totalInput.value = "";
        this.resetSellerFormInputs();
        if (elements.sellerList) elements.sellerList.selectedIndex = 0;
        if (elements.selectedSellerText) elements.selectedSellerText.textContent = "Select a Seller";
        if (elements.confirmSellerBtn) elements.confirmSellerBtn.disabled = true;
        state.selectedSellerId = null;
        elements.sellerDropdownSection?.classList.add("hidden");
        elements.addSellerFormSection?.classList.add("hidden");

        if (elements.productTypeToggle) elements.productTypeToggle.checked = false;
        this.updateToggleLabels(false);
        state.selectedProductId = 2;
    },
    populateSellerList(sellers = []) {
        const { sellerList } = this.elements;
        if (!sellerList) return;
        sellerList.innerHTML = '<option value="">-- Select Seller --</option>';
        sellers.forEach((seller) => {
            const option = new Option(seller.name, seller.id);
            sellerList.add(option);
        });
    },
    updateToggleLabels(isHusked) {
        if (this.elements.huskedLabel && this.elements.unhuskedLabel) {
            if (isHusked) {
                this.elements.huskedLabel.classList.add('active');
                this.elements.unhuskedLabel.classList.remove('active');
            } else {
                this.elements.huskedLabel.classList.remove('active');
                this.elements.unhuskedLabel.classList.add('active');
            }
        }
    },
    displayTransactions(transactions = []) {
        const { mainContent } = this.elements;
        if (!mainContent) return;
        mainContent.querySelector(".transactions-container")?.remove();
        const container = document.createElement("div");
        container.className = "transactions-container";
        container.innerHTML = "<h3>📋 Your Recent Transactions</h3>";
        if (!transactions.length) {
            container.innerHTML += '<p class="no-transactions">You have no transactions yet.</p>';
        } else {
            const tableContainer = document.createElement("div");
            tableContainer.className = "table-container";
            const table = document.createElement("table");
            table.className = "transactions-table";
            table.innerHTML = `<thead><tr><th class="date-col">🗓️ Date</th><th class="seller-col">🧑‍💼 Seller</th><th class="product-col">🥥 Product</th><th class="quantity-col">📦 Qty</th><th class="total-col">💰 Total</th></tr></thead>`;
            const tbody = document.createElement("tbody");
            const rows = transactions.map((t) => {
                const totalCostAsNumber = parseFloat(t.total_cost) || 0;
                return `<tr><td class="date-col">${new Date(t.created_at).toLocaleDateString()}</td><td class="seller-col">${t.seller_name || "N/A"}</td><td class="product-col">${t.product_name || 'N/A'}</td><td class="quantity-col">${t.quantity}</td><td class="total-col">₱${totalCostAsNumber.toFixed(2)}</td></tr>`;
            }).join("");
            tbody.innerHTML = rows;
            table.appendChild(tbody);
            tableContainer.appendChild(table);
            container.appendChild(tableContainer);
        }
        mainContent.appendChild(container);
    },
};

const handlers = {
    async initialPageLoad() {
        try {
            const sessionData = await api.verifySession();
            if (sessionData && sessionData.user && sessionData.user.name) {
                const fullName = sessionData.user.name;
                const firstName = fullName.split(' ')[0];
                if (ui.elements.userName) {
                    ui.elements.userName.textContent = firstName;
                }
            }
            await Promise.all([
                handlers.loadSellers(),
                handlers.loadTransactions(),
                handlers.loadProductSummary()
            ]);
        } catch (error) {
            console.error("Initial page load failed:", error.message);
        }
    },
    async loadSellers() {
        try {
            const sellers = await api.getSellers();
            ui.populateSellerList(sellers);
            return sellers;
        } catch (error) {
            console.error("Failed to load sellers:", error);
            ui.showMessage(`❌ Could not load sellers: ${error.message}`, "error");
            return [];
        }
    },
    async loadProductSummary() {
        try {
            const products = await api.getProductSummary();
            // ui.displayProductSummary(products);
        } catch (error) {
            console.error("Failed to load product summary:", error);
            ui.showMessage(`❌ Could not load product summary: ${error.message}`, "error");
        }
    },
    async loadTransactions() {
        try {
            const { transactions } = await api.getTransactions();
            ui.displayTransactions(transactions);
        } catch (error) {
            console.error("Failed to load transactions:", error);
            ui.showMessage(`❌ Could not load transactions: ${error.message}`, "error");
        }
    },
    async handleSaveSeller(event) {
        event.preventDefault();
        const { sellerNameInput, sellerEmailInput, sellerPhoneInput, sellerAddressInput, selectedSellerText, sellerList } = ui.elements;
        const sellerData = {
            name: sellerNameInput.value.trim(),
            email: sellerEmailInput.value.trim(),
            phone: sellerPhoneInput.value.trim(),
            address: sellerAddressInput.value.trim(),
        };
        if (!sellerData.name || !sellerData.email) {
            return ui.showMessage("❌ Name and Email fields are required.", "error");
        }
        try {
            const newSellerName = sellerData.name;
            const response = await api.addSeller(sellerData);
            ui.showMessage(response.message || "Seller added successfully!", "success");
            ui.resetSellerFormInputs();
            const allSellers = await handlers.loadSellers();
            const newSeller = allSellers.find(seller => seller.name === newSellerName);
            if (newSeller) {
                state.selectedSellerId = newSeller.id;
                selectedSellerText.textContent = newSeller.name;
                sellerList.value = newSeller.id;
            }
            ui.hide(ui.elements.sellerModal);
        } catch (error) {
            console.error("Save seller failed:", error);
            ui.showMessage(`❌ Failed to save seller: ${error.message}`, "error");
        }
    },
    async handlePayment() {
        const { quantityInput, priceInput, totalInput, selectedSellerText } = ui.elements;
        const transactionData = {
            seller_id: state.selectedSellerId,
            product_id: state.selectedProductId,
            quantity: parseInt(quantityInput.value, 10),
            price_per_unit: parseFloat(priceInput.value),
            total_cost: parseFloat(totalInput.value.replace("₱", "")),
        };
        if (!transactionData.seller_id || !transactionData.product_id || !transactionData.quantity || !transactionData.price_per_unit) {
            return ui.showMessage("❌ Please select seller/product and enter quantity/price.", "error");
        }
        try {
            const data = await api.submitTransaction(transactionData);
            ui.showMessage(`✅ ${data.message || "Transaction successful!"}`, "success");
            
            // Generate and download PDF receipt
            const receiptData = {
                sellerName: selectedSellerText.textContent,
                productName: state.selectedProductId === 1 ? 'Husked Coconuts' : 'Unhusked Coconuts',
                quantity: transactionData.quantity,
                pricePerUnit: transactionData.price_per_unit,
                totalCost: transactionData.total_cost,
                date: new Date().toLocaleString()
            };
            handlers.downloadReceipt(receiptData);
            
            ui.resetForm();
            await Promise.all([
                handlers.loadTransactions(),
                handlers.loadProductSummary()
            ]);
        } catch (error) {
            console.error("Payment failed:", error);
            ui.showMessage(`❌ Payment failed: ${error.message}`, "error");
        }
    },
    downloadReceipt(receiptData) {
        // Create canvas for receipt image
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');
        
        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, 800);
        gradient.addColorStop(0, '#f8f9fa');
        gradient.addColorStop(1, '#e9ecef');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Success icon circle
        ctx.fillStyle = '#28a745';
        ctx.beginPath();
        ctx.arc(300, 80, 40, 0, Math.PI * 2);
        ctx.fill();
        
        // Checkmark
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(280, 80);
        ctx.lineTo(295, 95);
        ctx.lineTo(320, 65);
        ctx.stroke();
        
        // Title
        ctx.fillStyle = '#212529';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Payment Successful', 300, 160);
        
        // Date
        ctx.font = '16px Arial';
        ctx.fillStyle = '#6c757d';
        ctx.fillText(receiptData.date, 300, 190);
        
        // White card background
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 4;
        ctx.fillRect(40, 220, 520, 480);
        ctx.shadowColor = 'transparent';
        
        // Receipt details
        let y = 270;
        const leftX = 80;
        const rightX = 520;
        
        // Helper function to draw row
        const drawRow = (label, value, bold = false) => {
            ctx.textAlign = 'left';
            ctx.font = bold ? 'bold 18px Arial' : '16px Arial';
            ctx.fillStyle = '#6c757d';
            ctx.fillText(label, leftX, y);
            
            ctx.textAlign = 'right';
            ctx.fillStyle = '#212529';
            ctx.font = bold ? 'bold 20px Arial' : '18px Arial';
            ctx.fillText(value, rightX, y);
            y += 45;
        };
        
        // Draw divider line
        const drawDivider = () => {
            ctx.strokeStyle = '#e9ecef';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(80, y - 20);
            ctx.lineTo(520, y - 20);
            ctx.stroke();
        };
        
        // Details
        drawRow('Seller', receiptData.sellerName);
        drawRow('Product', receiptData.productName);
        drawRow('Quantity', receiptData.quantity.toString());
        drawRow('Price per Unit', `₱${receiptData.pricePerUnit.toFixed(2)}`);
        
        drawDivider();
        
        // Total with highlight background
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(60, y - 30, 480, 50);
        
        ctx.textAlign = 'left';
        ctx.font = 'bold 22px Arial';
        ctx.fillStyle = '#212529';
        ctx.fillText('Total Amount', leftX, y);
        
        ctx.textAlign = 'right';
        ctx.fillStyle = '#28a745';
        ctx.font = 'bold 28px Arial';
        ctx.fillText(`₱${receiptData.totalCost.toFixed(2)}`, rightX, y);
        
        // Footer
        ctx.textAlign = 'center';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#6c757d';
        ctx.fillText('Thank you for your business!', 300, 740);
        
        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `receipt_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
        }, 'image/png');
    },
    handleProductToggle(event) {
        const isHusked = event.target.checked;
        state.selectedProductId = isHusked ? 1 : 2;
        ui.updateToggleLabels(isHusked);
        const productName = isHusked ? 'Husked Coconuts' : 'Unhusked Coconuts';
        ui.showMessage(`✅ Switched to ${productName}`, "info");
    },
    updateTotal() {
        const quantity = parseFloat(ui.elements.quantityInput.value) || 0;
        const price = parseFloat(ui.elements.priceInput.value) || 0;
        ui.elements.totalInput.value = `₱${(quantity * price).toFixed(2)}`;
    },
    handleSellerSelection(event) {
        state.selectedSellerId = event.target.value;
        ui.elements.confirmSellerBtn.disabled = !state.selectedSellerId;
    },
    confirmSellerSelection() {
        const { sellerList, selectedSellerText } = ui.elements;
        const selectedOption = sellerList.options[sellerList.selectedIndex];
        if (state.selectedSellerId && selectedOption.value) {
            selectedSellerText.textContent = selectedOption.text;
            ui.hide(ui.elements.sellerModal);
            ui.showMessage(`✅ Seller confirmed: ${selectedOption.text}`, "success");
        } else {
            ui.showMessage("❌ Please select a valid seller.", "error");
        }
    },
};

document.addEventListener("DOMContentLoaded", () => {
    ui.cacheElements();
    const { elements: el } = ui;
    el.quantityInput?.addEventListener("input", handlers.updateTotal);
    el.priceInput?.addEventListener("input", handlers.updateTotal);
    el.payBtn?.addEventListener("click", handlers.handlePayment);
    el.selectSellerBtn?.addEventListener("click", () => ui.show(el.sellerModal));
    el.closeModalBtn?.addEventListener("click", () => {
        ui.hide(el.sellerModal);
        ui.resetForm();
    });
    el.dropdownBtn?.addEventListener("click", () => {
        el.sellerDropdownSection.classList.remove("hidden");
        el.addSellerFormSection.classList.add("hidden");
        handlers.loadSellers();
    });
    el.addFormBtn?.addEventListener("click", () => {
        el.addSellerFormSection.classList.remove("hidden");
        el.sellerDropdownSection.classList.add("hidden");
    });
    el.sellerList?.addEventListener("change", handlers.handleSellerSelection);
    el.confirmSellerBtn?.addEventListener("click", handlers.confirmSellerSelection);
    el.saveSellerBtn?.addEventListener("click", (event) => handlers.handleSaveSeller(event));
    el.productTypeToggle?.addEventListener("change", handlers.handleProductToggle);

    handlers.initialPageLoad();
    ui.updateToggleLabels(false);
});