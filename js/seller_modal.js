const openModalBtn = document.getElementById("selectSellerBtn");
const closeModalBtn = document.getElementById("closeModal");
const modal = document.getElementById("sellerModal");

const dropdownBtn = document.getElementById("dropdownBtn");
const addFormBtn = document.getElementById("addFormBtn");

const dropdownSection = document.getElementById("sellerDropdownSection");
const addSellerForm = document.getElementById("addSellerForm");

const sellerList = document.getElementById("sellerList");
const confirmSellerBtn = document.getElementById("confirmSellerBtn");

const saveSellerBtn = document.getElementById("saveSellerBtn");

const selectedSellerText = document.getElementById("selectedSellerText");

// Open Modal
openModalBtn.addEventListener("click", () => {
    modal.classList.add("show");
});

// Close Modal
closeModalBtn.addEventListener("click", () => {
    modal.classList.remove("show");
    resetModalSections();
});

// Toggle to Dropdown
dropdownBtn.addEventListener("click", () => {
    dropdownSection.classList.remove("hidden");
    addSellerForm.classList.add("hidden");
});

// Toggle to Add Form
addFormBtn.addEventListener("click", () => {
    addSellerForm.classList.remove("hidden");
    dropdownSection.classList.add("hidden");
});

// Enable Confirm Button on Seller Select
sellerList.addEventListener("change", () => {
    confirmSellerBtn.disabled = sellerList.value === "";
});

// Confirm Seller Selection
confirmSellerBtn.addEventListener("click", () => {
    const selectedText = sellerList.options[sellerList.selectedIndex].text;
    selectedSellerText.textContent = selectedText;
    modal.classList.remove("show");
    resetModalSections();
});

// Save New Seller
saveSellerBtn.addEventListener("click", () => {
    const name = document.getElementById("sellerName").value.trim();
    const email = document.getElementById("sellerEmail").value.trim();
    const phone = document.getElementById("sellerPhone").value.trim();
    const address = document.getElementById("sellerAddress").value.trim();

    if (!name || !email || !phone || !address) {
        showMessage("Please fill in all seller details.");
        return;
    }

    if (!isValidEmail(email)) {
        showMessage("Invalid email format.");
        return;
    }

    const exists = [...sellerList.options].some(opt => opt.value === name);
    if (exists) {
        showMessage("Seller already exists.");
        return;
    }

    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    sellerList.appendChild(option);
    sellerList.value = name;
    selectedSellerText.textContent = name;

    modal.classList.remove("show");
    resetModalSections();
    clearFormFields();
    showMessage("Seller saved successfully!");
});

// Helpers
function resetModalSections() {
    dropdownSection.classList.add("hidden");
    addSellerForm.classList.add("hidden");
    confirmSellerBtn.disabled = true;
}

function clearFormFields() {
    document.getElementById("sellerName").value = "";
    document.getElementById("sellerEmail").value = "";
    document.getElementById("sellerPhone").value = "";
    document.getElementById("sellerAddress").value = "";
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showMessage(text) {
    const msgBox = document.getElementById("msg");
    const msgContent = msgBox.querySelector(".message-content");
    msgContent.textContent = text;
    msgBox.classList.remove("hidden");

    setTimeout(() => msgBox.classList.add("hidden"), 3000);
}
