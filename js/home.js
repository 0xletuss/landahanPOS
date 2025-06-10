let selectedSellerId = null;
const API_BASE = "https://landahan-5.onrender.com/api";

function showPOSSection() {
    document.getElementById('posSection').classList.remove('hidden');
}

function hidePOSSection() {
    document.getElementById('posSection').classList.add('hidden');
    resetPOSForm();
}

function resetPOSForm() {
    ["quantity", "price", "total", "sellerName", "sellerEmail", "sellerPhone", "sellerAddress"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
    selectedSellerId = null;
    const sellerList = document.getElementById("sellerList");
    if (sellerList) sellerList.selectedIndex = 0;
    hide("sellerOptions");
    hide("sellerDropdownSection");
    hide("addSellerForm");
    const msg = document.getElementById("msg");
    if (msg) {
        msg.classList.add("hidden");
        msg.textContent = "";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const msg = document.getElementById("msg");
    const qty = document.getElementById("quantity");
    const price = document.getElementById("price");
    const total = document.getElementById("total");

    qty.addEventListener("input", updateTotal);
    price.addEventListener("input", updateTotal);

    function updateTotal() {
        const q = parseFloat(qty.value) || 0;
        const p = parseFloat(price.value) || 0;
        total.value = (q * p).toFixed(2);
    }

    document.getElementById("sellerBtn").addEventListener("click", () => {
        toggle("sellerOptions");
        hide("sellerDropdownSection");
        hide("addSellerForm");
    });

    document.getElementById("dropdownBtn").addEventListener("click", async () => {
        show("sellerDropdownSection");
        hide("addSellerForm");
        await loadSellers();
    });

    document.getElementById("addFormBtn").addEventListener("click", () => {
        show("addSellerForm");
        hide("sellerDropdownSection");
    });

    document.getElementById("saveSellerBtn").addEventListener("click", async () => {
        const seller = {
            name: getVal("sellerName"),
            email: getVal("sellerEmail"),
            phone: getVal("sellerPhone"),
            address: getVal("sellerAddress"),
        };

        if (Object.values(seller).some(v => !v)) {
            return showMessage("❌ All fields are required", "error");
        }

        try {
            const res = await fetch(`${API_BASE}/add-seller`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(seller),
            });
            const data = await res.json();
            
            if (!res.ok) {
                console.error('Add seller error:', data);
                throw new Error(data.message || `Server error: ${res.status}`);
            }
            
            showMessage(`✅ ${data.message}`, "success");
            resetPOSForm();
            await loadSellers();
        } catch (err) {
            console.error('Add seller failed:', err);
            showMessage(`❌ Failed to add seller: ${err.message}`, "error");
        }
    });

    document.getElementById("sellerList").addEventListener("change", (e) => {
        selectedSellerId = e.target.value;
        const selectedOption = e.target.options[e.target.selectedIndex];
        if (selectedSellerId) {
            showMessage(`✅ Seller selected: ${selectedOption.text}`, "info");
        }
    });

    document.getElementById("payBtn").addEventListener("click", async () => {
        const transaction = {
            quantity: parseInt(getVal("quantity")),
            price: parseFloat(getVal("price")),
            total_cost: parseFloat(getVal("total")),
            seller_id: selectedSellerId,
        };

        if (!transaction.seller_id || !transaction.quantity || !transaction.price) {
            return showMessage("❌ Complete all fields before payment", "error");
        }

        try {
            const res = await fetch(`${API_BASE}/submit-pos`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(transaction),
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message);
            
            showMessage(`✅ ${data.message}`, "success");
            resetPOSForm();
            await loadMyTransactions();
        } catch (err) {
            showMessage(`❌ Payment failed: ${err.message}`, "error");
        }
    });

    // Initial load
    loadSellers();
    loadMyTransactions();

    async function loadSellers() {
        try {
            const res = await fetch(`${API_BASE}/sellers`, {
                credentials: 'include',
            });
            const result = await res.json();
            
            if (!res.ok) {
                throw new Error(result.message || "Failed to load sellers");
            }
            
            if (!Array.isArray(result)) {
                throw new Error("Invalid server response.");
            }

            document.getElementById("sellerList").innerHTML = '<option value="">-- Select Seller --</option>' +
                result.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        } catch (err) {
            console.error('Load sellers error:', err);
            showMessage("❌ Error loading sellers: " + err.message, "error");
        }
    }

    // FIXED: Changed endpoint from '/my-transactions' to '/transactions'
    async function loadMyTransactions() {
        try {
            const res = await fetch(`${API_BASE}/transactions`, { 
                credentials: "include" 
            });
            const data = await res.json();
            
            if (!res.ok) {
                console.error('Load transactions error:', data);
                throw new Error(data.message || "Failed to load transactions");
            }
            
            displayTransactions(data.transactions || []);
        } catch (err) {
            console.error('Load transactions failed:', err);
            showMessage("❌ Could not load transactions: " + err.message, "error");
        }
    }

    function displayTransactions(transactions) {
        const existing = document.querySelector(".transactions");
        if (existing) existing.remove();

        const container = document.createElement("div");
        container.className = "transactions";
        container.innerHTML = `<h3>📋 Your Transactions</h3>`;

        if (!transactions.length) {
            container.innerHTML += "<p>No transactions yet.</p>";
        } else {
            container.innerHTML += `<ul>${transactions.map(t =>
                `<li>🗓 ${t.created_at} — ${t.seller_name || 'Unknown Seller'} — Qty: ${t.quantity}, Price: ₱${t.price}, Total: ₱${t.total_cost}</li>`
            ).join("")}</ul>`;
        }

        document.querySelector(".main-content").appendChild(container);
    }

    function getVal(id) {
        return document.getElementById(id)?.value.trim() || "";
    }

    function show(id) {
        document.getElementById(id)?.classList.remove("hidden");
    }

    function hide(id) {
        document.getElementById(id)?.classList.add("hidden");
    }

    function toggle(id) {
        document.getElementById(id)?.classList.toggle("hidden");
    }

    function showMessage(text, type = "info") {
        msg.textContent = text;
        msg.className = `pos-message ${type}`;
        msg.classList.remove("hidden");
        if (type === "success") {
            setTimeout(() => msg.classList.add("hidden"), 5000);
        }
    }
});
