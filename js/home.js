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
        document.getElementById(id).value = "";
    });
    selectedSellerId = null;
    document.getElementById("sellerList").selectedIndex = 0;
    document.getElementById("sellerOptions").classList.add("hidden");
    document.getElementById("sellerDropdownSection").classList.add("hidden");
    document.getElementById("addSellerForm").classList.add("hidden");
    document.getElementById("msg").classList.add("hidden");
    document.getElementById("msg").textContent = "";
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
            if (!res.ok) throw new Error(data.message);
            showMessage(`✅ ${data.message}`, "success");
            resetPOSForm();
            await loadSellers();
        } catch (err) {
            showMessage(`❌ Failed to add seller: ${err.message}`, "error");
        }
    });

    document.getElementById("sellerList").addEventListener("change", (e) => {
        selectedSellerId = e.target.value;
        const selectedOption = e.target.options[e.target.selectedIndex];
        showMessage(`✅ Seller selected: ${selectedOption.text}`, "info");
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

    loadSellers();
    loadMyTransactions();

    async function loadSellers() {
        try {
            const res = await fetch(`${API_BASE}/sellers`, {
                credentials: 'include',
            });
            const sellers = await res.json();
            document.getElementById("sellerList").innerHTML = '<option value="">-- Select Seller --</option>' +
                sellers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        } catch (err) {
            showMessage("❌ Error loading sellers: " + err.message, "error");
        }
    }

    async function loadMyTransactions() {
        try {
            const res = await fetch(`${API_BASE}/my-transactions`, { credentials: "include" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            displayTransactions(data.transactions);
        } catch (err) {
            showMessage("❌ Could not load transactions: " + err.message, "error");
        }
    }

    function displayTransactions(transactions) {
        const container = document.createElement("div");
        container.className = "transactions";
        container.innerHTML = `<h3>📋 Your Transactions</h3>`;
        if (!transactions.length) {
            container.innerHTML += "<p>No transactions yet.</p>";
        } else {
            container.innerHTML += `<ul>${transactions.map(t =>
                `<li>🗓 ${t.created_at} — Qty: ${t.quantity}, Price: ₱${t.price}, Total: ₱${t.total_cost}</li>`
            ).join("")}</ul>`;
        }
        document.querySelector(".main-content").appendChild(container);
    }

    function getVal(id) {
        return document.getElementById(id).value.trim();
    }

    function show(id) {
        document.getElementById(id).classList.remove("hidden");
    }

    function hide(id) {
        document.getElementById(id).classList.add("hidden");
    }

    function toggle(id) {
        document.getElementById(id).classList.toggle("hidden");
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
