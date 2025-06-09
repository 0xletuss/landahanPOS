// POS System JavaScript
let selectedSellerId = null;

// API base URL
const API_BASE = "https://landahan-5.onrender.com/api";

// Show/Hide POS Section
function showPOSSection() {
    const posSection = document.getElementById('posSection');
    posSection.classList.remove('hidden');
    posSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hidePOSSection() {
    const posSection = document.getElementById('posSection');
    posSection.classList.add('hidden');
    
    // Reset form
    resetPOSForm();
}

function resetPOSForm() {
    // Reset all form fields
    document.getElementById("quantity").value = "";
    document.getElementById("price").value = "";
    document.getElementById("total").value = "";
    document.getElementById("sellerName").value = "";
    document.getElementById("sellerEmail").value = "";
    document.getElementById("sellerPhone").value = "";
    document.getElementById("sellerAddress").value = "";
    
    // Reset selections
    selectedSellerId = null;
    document.getElementById("sellerList").selectedIndex = 0;
    
    // Hide all sections
    document.getElementById("sellerOptions").classList.add("hidden");
    document.getElementById("sellerDropdownSection").classList.add("hidden");
    document.getElementById("addSellerForm").classList.add("hidden");
    
    // Clear messages
    const msg = document.getElementById("msg");
    msg.classList.add("hidden");
    msg.textContent = "";
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    const qty = document.getElementById("quantity");
    const price = document.getElementById("price");
    const total = document.getElementById("total");
    const msg = document.getElementById("msg");

    const sellerBtn = document.getElementById("sellerBtn");
    const sellerOptions = document.getElementById("sellerOptions");
    const sellerDropdownSection = document.getElementById("sellerDropdownSection");
    const addSellerForm = document.getElementById("addSellerForm");
    const sellerList = document.getElementById("sellerList");

    const saveSellerBtn = document.getElementById("saveSellerBtn");
    const payBtn = document.getElementById("payBtn");

    const sellerName = document.getElementById("sellerName");
    const sellerEmail = document.getElementById("sellerEmail");
    const sellerPhone = document.getElementById("sellerPhone");
    const sellerAddress = document.getElementById("sellerAddress");

    // Test server connection on load
    testServerConnection();

    // Show seller options
    sellerBtn.addEventListener("click", () => {
        sellerOptions.classList.toggle("hidden");
        // Hide other sections when showing options
        sellerDropdownSection.classList.add("hidden");
        addSellerForm.classList.add("hidden");
    });

    // Show dropdown
    document.getElementById("dropdownBtn").addEventListener("click", async () => {
        sellerDropdownSection.classList.remove("hidden");
        addSellerForm.classList.add("hidden");
        await loadSellers();
    });

    // Show add form
    document.getElementById("addFormBtn").addEventListener("click", () => {
        sellerDropdownSection.classList.add("hidden");
        addSellerForm.classList.remove("hidden");
    });

    // Test server connection
    async function testServerConnection() {
        try {
            console.log("Testing server connection...");
            const res = await fetch(`${API_BASE}/test`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                console.log("✅ Server connection successful:", data.message);
                showMessage("✅ Connected to server successfully!", "success");
            } else {
                throw new Error(`Server responded with status: ${res.status}`);
            }
        } catch (err) {
            console.error("❌ Server connection failed:", err.message);
            showMessage(`❌ Cannot connect to server: ${err.message}`, "error");
        }
    }

    // Show message helper
    function showMessage(text, type = "info") {
        msg.textContent = text;
        msg.className = `pos-message ${type}`;
        msg.classList.remove("hidden");
        
        // Auto-hide success messages after 5 seconds
        if (type === "success") {
            setTimeout(() => {
                msg.classList.add("hidden");
            }, 5000);
        }
    }

    // Load seller list
    async function loadSellers() {
        try {
            console.log("Loading sellers...");
            const res = await fetch(`${API_BASE}/sellers`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            
            const sellers = await res.json();
            console.log("Sellers loaded:", sellers);
            
            sellerList.innerHTML = '<option value="">-- Select Seller --</option>' +
                sellers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
            
            showMessage("✅ Sellers loaded successfully.", "success");
        } catch (err) {
            console.error("Error loading sellers:", err);
            showMessage(`❌ Error fetching seller list: ${err.message}`, "error");
        }
    }

    // Select from dropdown
    sellerList.addEventListener("change", (e) => {
        selectedSellerId = e.target.value;
        if (selectedSellerId) {
            const selectedOption = sellerList.options[sellerList.selectedIndex];
            showMessage(`✅ Seller selected: ${selectedOption.text}`, "info");
        }
    });

    // Save new seller
    saveSellerBtn.addEventListener("click", async () => {
        const seller = {
            name: sellerName.value.trim(),
            email: sellerEmail.value.trim(),
            phone: sellerPhone.value.trim(),
            address: sellerAddress.value.trim(),
        };

        if (!seller.name || !seller.email || !seller.phone || !seller.address) {
            showMessage("❌ Please fill all seller fields.", "error");
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(seller.email)) {
            showMessage("❌ Please enter a valid email address.", "error");
            return;
        }

        try {
            console.log("Adding seller:", seller);
            const res = await fetch(`${API_BASE}/add-seller`, {
                method: "POST",
                credentials: 'include',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(seller)
            });

            const data = await res.json();
            console.log("Add seller response:", data);
            
            if (res.ok) {
                selectedSellerId = data.id;
                sellerName.value = sellerEmail.value = sellerPhone.value = sellerAddress.value = "";
                sellerOptions.classList.add("hidden");
                addSellerForm.classList.add("hidden");
                showMessage(`✅ ${data.message} - Seller: ${seller.name}`, "success");
            } else {
                throw new Error(data.message || `HTTP ${res.status}`);
            }
        } catch (err) {
            console.error("Error adding seller:", err);
            showMessage(`❌ Failed to add seller: ${err
