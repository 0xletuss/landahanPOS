]// --- CONFIGURATION & STATE ---

const API_BASE_URL = "https://landahan-5.onrender.com/api";

const state = {
    selectedSellerId: null,
    // ✅ NEW: Track the selected product ID. Default to '2' which is 'Unhusked'.
    selectedProductId: 2,
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
    },
    verifySession() { return this._fetch("/verify-session"); },
    getSellers() { return this._fetch("/sellers"); },
    getTransactions() { return this._fetch("/transactions"); },
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
            // ✅ NEW: Cache the new toggle switch elements
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
        // ✅ NEW: Reset the toggle switch after payment
        if (elements.productTypeToggle) elements.productTypeToggle.checked = false;
        this.updateToggleLabels(false);
        state.selectedProductId = 2; // Reset state to Unhusked
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
    // ✅ NEW: A function to update the toggle labels' active state
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
            table.innerHTML = `<thead><tr><th class="date-col">🗓️ Date</th><th class="seller-col">🧑‍💼 Seller</th><th class="quantity-col">📦 Qty</th><th class="total-col">💰 Total</th></tr></thead>`;
            const tbody = document.createElement("tbody");
            const rows = transactions.map((t) => {
                const totalCostAsNumber = parseFloat(t.total_cost) || 0;
                return `<tr><td class="date-col">${new Date(t.created_at).toLocaleDateString()}</td><td class="seller-col">${t.seller_name || "N/A"}</td><td class="quantity-col">${t.quantity}</td><td class="total-col">₱${totalCostAsNumber.toFixed(2)}</td></tr>`;
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
            await Promise.all([handlers.loadSellers(), handlers.loadTransactions()]);
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
        if (Object.values(sellerData).some((val) => !val)) {
            return ui.showMessage("❌ All seller fields are required.", "error");
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
        const { quantityInput, priceInput, totalInput } = ui.elements;
        const transactionData = {
            seller_id: state.selectedSellerId,
            product_id: state.selectedProductId,
            quantity: parseInt(quantityInput.value, 10),
            price_per_unit: parseFloat(priceInput.value), // Renamed from 'price'
            total_cost: parseFloat(totalInput.value.replace("₱", "")),
        };
        if (!transactionData.seller_id || !transactionData.product_id || !transactionData.quantity || !transactionData.price_per_unit) {
            return ui.showMessage("❌ Please select seller/product and enter quantity/price.", "error");
        }
        try {
            const data = await api.submitTransaction(transactionData);
            ui.showMessage(`✅ ${data.message || "Transaction successful!"}`, "success");
            ui.resetForm();
            await handlers.loadTransactions();
        } catch (error) {
            console.error("Payment failed:", error);
            ui.showMessage(`❌ Payment failed: ${error.message}`, "error");
        }
    },
    // ✅ NEW: A handler for when the toggle switch is clicked
    handleProductToggle(event) {
        const isHusked = event.target.checked;
        // Your database has Husked as ID 1, Unhusked as ID 2
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
    
    // ✅ NEW: Add event listener for our new toggle switch
    el.productTypeToggle?.addEventListener("change", handlers.handleProductToggle);
    
    handlers.initialPageLoad();
    // Set the initial active state for the label
    ui.updateToggleLabels(false);
});
