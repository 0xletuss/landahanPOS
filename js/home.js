
// POS System JavaScript
let selectedSellerId = null;

// API base URL - your server is running on Render
const API_BASE = "https://landahan-5.onrender.com/api";

// Show POS section
function showPOSSection() {
    const posSection = document.getElementById('posSection');
    posSection.classList.toggle('hidden');
}

// Test function to call protected API
async function testProtectedAPI() {
    try {
        const response = await fetch('https://landahan-5.onrender.com/api/protected', {
            method: 'GET',
            credentials: 'include'
        });
        
        const data = await response.json();
        const resultDiv = document.getElementById('apiResult');
        
        if (response.ok) {
            resultDiv.innerHTML = `
                <div class="success">
                    <h4>✅ Protected API Response:</h4>
                    <p><strong>Message:</strong> ${data.message}</p>
                    <p><strong>User ID:</strong> ${data.user_id}</p>
                    <p><strong>User Name:</strong> ${data.user_name}</p>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="error">
                    <h4>❌ API Error:</h4>
                    <p>${data.message}</p>
                </div>
            `;
        }
    } catch (error) {
        document.getElementById('apiResult').innerHTML = `
            <div class="error">
                <h4>❌ Network Error:</h4>
                <p>${error.message}</p>
            </div>
        `;
    }
}

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

    // Only initialize POS if elements exist (for home.html)
    if (sellerBtn && qty && price && total && msg
