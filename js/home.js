// --- CONFIGURATION & STATE ---

const API_BASE_URL = "https://landahan-5.onrender.com/api";

const state = {

    selectedSellerId: null,

};



/**

 * =================================================================

 * API SERVICE 🚀

 * Handles all communication with the backend. Centralizes fetch logic,

 * error handling, and session checks.

 * =================================================================

 */

const api = {

    async _fetch(endpoint, options = {}) {

        // Default options for every request

        const defaultOptions = {

            method: "GET",

            credentials: "include",

            headers: { "Content-Type": "application/json" },

        };



        const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...defaultOptions, ...options });



        // Centralized session expiration check

        if (res.status === 401) {

            ui.showMessage("❌ Session expired. Redirecting to login...", "error");

            setTimeout(() => (window.location.href = "/login.html"), 2000);

            // Throw an error to stop further execution in the calling function

            throw new Error("Session expired");

        }

        

        const data = await res.json();



        if (!res.ok) {

            // Throw an error with the message from the server's response

            throw new Error(data.message || `An unknown server error occurred.`);

        }



        return data; // Return the JSON data on success

    },



    verifySession() {

        return this._fetch("/verify-session");

    },

    getSellers() {

        return this._fetch("/sellers");

    },

    getTransactions() {

        // The API returns { transactions: [...] }

        return this._fetch("/transactions");

    },

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

 * Handles all direct manipulation of the DOM (showing/hiding,

 * updating text, creating elements, etc.).

 * =================================================================

 */

const ui = {

    elements: {}, // To be filled by cacheElements



    // Find all needed elements once and store them

    cacheElements() {

        this.elements = {

            // Main POS form

            quantityInput: document.getElementById("quantity"),

            priceInput: document.getElementById("price"),

            totalInput: document.getElementById("total"),

            payBtn: document.getElementById("payBtn"),

            // Message box

            messageBox: document.getElementById("msg"),

            messageContent: document.querySelector("#msg .message-content"),

            // Modal and its controls

            sellerModal: document.getElementById("sellerModal"),

            selectSellerBtn: document.getElementById("selectSellerBtn"),

            closeModalBtn: document.getElementById("closeModal"),

            confirmSellerBtn: document.getElementById("confirmSellerBtn"),

            // Modal sections

            dropdownBtn: document.getElementById("dropdownBtn"),

            addFormBtn: document.getElementById("addFormBtn"),

            sellerDropdownSection: document.getElementById("sellerDropdownSection"),

            addSellerFormSection: document.getElementById("addSellerForm"),

            // Seller selection

            sellerList: document.getElementById("sellerList"),

            selectedSellerText: document.getElementById("selectedSellerText"),

            // Add Seller form

            saveSellerBtn: document.getElementById("saveSellerBtn"),

            sellerNameInput: document.getElementById("sellerName"),

            sellerEmailInput: document.getElementById("sellerEmail"),

            sellerPhoneInput: document.getElementById("sellerPhone"),

            sellerAddressInput: document.getElementById("sellerAddress"),

            // Transactions container

            mainContent: document.querySelector(".main-content"),

        };

    },



    show(element) { element?.classList.remove("hidden"); },

    hide(element) { element?.classList.add("hidden"); },



    showMessage(text, type = "info") {

        const { messageBox, messageContent } = this.elements;

        if (!messageBox || !messageContent) return;

        

        messageContent.textContent = text;

        messageBox.className = `pos-message ${type}`;

        this.show(messageBox);



        if (type === "success") {

            setTimeout(() => this.hide(messageBox), 4000);

        }

    },

    

    resetForm() {

        const { elements } = this;

        // Reset all inputs

        [

            elements.quantityInput, elements.priceInput, elements.totalInput,

            elements.sellerNameInput, elements.sellerEmailInput,

            elements.sellerPhoneInput, elements.sellerAddressInput

        ].forEach(input => { if (input) input.value = ""; });

        

        // Reset seller selection

        if (elements.sellerList) elements.sellerList.selectedIndex = 0;

        if (elements.selectedSellerText) elements.selectedSellerText.textContent = "Select a Seller";

        if (elements.confirmSellerBtn) elements.confirmSellerBtn.disabled = true;

        

        state.selectedSellerId = null;

        

        // Hide modal sections

        this.hide(elements.sellerDropdownSection);

        this.hide(elements.addSellerFormSection);

    },



    populateSellerList(sellers = []) {

        const { sellerList } = this.elements;

        if (!sellerList) return;

        // Clear existing options and add a default

        sellerList.innerHTML = '<option value="">-- Select Seller --</option>';

        // Create and append new options

        sellers.forEach(seller => {

            const option = new Option(seller.name, seller.id);

            sellerList.add(option);

        });

    },



    displayTransactions(transactions = []) {

        const { mainContent } = this.elements;

        if (!mainContent) return;

        

        // Remove old transaction list if it exists

        mainContent.querySelector(".transactions-container")?.remove();

        

        const container = document.createElement("div");

        container.className = "transactions-container";

        container.innerHTML = '<h3>📋 Your Recent Transactions</h3>';



        if (!transactions.length) {

            container.innerHTML += '<p class="no-transactions">You have no transactions yet.</p>';

        } else {

            const list = transactions.map(t => {

                const totalCostAsNumber = parseFloat(t.total_cost) || 0;

                return `

                    <li class="transaction-item">

                        <span class="date">🗓️ ${new Date(t.created_at).toLocaleDateString()}</span>

                        <span class="seller">🧑‍💼 ${t.seller_name || 'N/A'}</span>

                        <span class="details">Qty: ${t.quantity}, Total: ₱${totalCostAsNumber.toFixed(2)}</span>

                    </li>

                `;

            }).join("");

            container.innerHTML += `<ul class="transaction-list">${list}</ul>`;

        }

        mainContent.appendChild(container);

    }

};



/**

 * =================================================================

 * EVENT HANDLERS ⚡

 * Contains the core logic that runs in response to user actions.

 * Connects the API service with the UI management.

 * =================================================================

 */

const handlers = {

    async initialPageLoad() {

        try {

            await api.verifySession();

            // Fetch initial data in parallel for speed

            await Promise.all([

                this.loadSellers(),

                this.loadTransactions()

            ]);

        } catch (error) {

            console.error("Initial page load failed:", error.message);

        }

    },



    async loadSellers() {

        try {

            const { sellers } = await api.getSellers();

            ui.populateSellerList(sellers);

        } catch (error) {

            console.error("Failed to load sellers:", error);

            ui.showMessage(`❌ Could not load sellers: ${error.message}`, "error");

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



    async handleSaveSeller() {

        const { sellerNameInput, sellerEmailInput, sellerPhoneInput, sellerAddressInput } = ui.elements;

        const sellerData = {

            name: sellerNameInput.value.trim(),

            email: sellerEmailInput.value.trim(),

            phone: sellerPhoneInput.value.trim(),

            address: sellerAddressInput.value.trim(),

        };



        if (Object.values(sellerData).some(val => !val)) {

            return ui.showMessage("❌ All seller fields are required.", "error");

        }

        

        try {

            const data = await api.addSeller(sellerData);

            ui.showMessage(`✅ ${data.message || 'Seller added successfully!'}`, "success");

            ui.hide(ui.elements.sellerModal);

            ui.resetForm();

            await this.loadSellers(); // Refresh seller list

        } catch (error) {

            console.error("Save seller failed:", error);

            ui.showMessage(`❌ Failed to save seller: ${error.message}`, "error");

        }

    },



    async handlePayment() {

        const { quantityInput, priceInput, totalInput } = ui.elements;

        const transactionData = {

            seller_id: state.selectedSellerId,

            quantity: parseInt(quantityInput.value, 10),

            price: parseFloat(priceInput.value),

            total_cost: parseFloat(totalInput.value.replace('₱','')),

        };



        if (!transactionData.seller_id || !transactionData.quantity || !transactionData.price) {

            return ui.showMessage("❌ Please select a seller and enter quantity/price.", "error");

        }

        

        try {

            const data = await api.submitTransaction(transactionData);

            ui.showMessage(`✅ ${data.message || 'Transaction successful!'}`, "success");

            ui.resetForm();

            await this.loadTransactions(); // Refresh transaction list

        } catch (error) {

            console.error("Payment failed:", error);

            ui.showMessage(`❌ Payment failed: ${error.message}`, "error");

        }

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

    }

};





/**

 * =================================================================

 * INITIALIZATION 🚀

 * Caches elements and attaches all event listeners.

 * =================================================================

 */

document.addEventListener('DOMContentLoaded', () => {

    ui.cacheElements();

    const { elements: el } = ui; // Use a shorthand for easier access



    // Main POS form listeners

    el.quantityInput?.addEventListener("input", handlers.updateTotal);

    el.priceInput?.addEventListener("input", handlers.updateTotal);

    el.payBtn?.addEventListener("click", handlers.handlePayment);



    // Modal control listeners

    el.selectSellerBtn?.addEventListener("click", () => ui.show(el.sellerModal));

    el.closeModalBtn?.addEventListener("click", () => {

        ui.hide(el.sellerModal);

        ui.resetForm(); // Also reset form state when closing modal

    });



    // Modal section toggles

    el.dropdownBtn?.addEventListener("click", () => {

        ui.show(el.sellerDropdownSection);

        ui.hide(el.addSellerFormSection);

        handlers.loadSellers();

    });

    el.addFormBtn?.addEventListener("click", () => {

        ui.show(el.addSellerFormSection);

        ui.hide(el.sellerDropdownSection);

    });



    // Action listeners inside the modal

    el.sellerList?.addEventListener("change", handlers.handleSellerSelection);

    el.confirmSellerBtn?.addEventListener("click", handlers.confirmSellerSelection);

    el.saveSellerBtn?.addEventListener("click", handlers.handleSaveSeller);



    // Initial load

    handlers.initialPageLoad();

});

