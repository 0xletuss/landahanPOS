document.addEventListener("DOMContentLoaded", () => {
    const nav = `
    <nav class="navbar">
        <ul class="nav-items">
            <li class="nav-item" data-page="home">
                   <a href="Arima.html"><i class="fas fa-chart-line"></i><span>Analyze</span></a>
            </li>
            <li class="nav-item" data-page="price">
                <a href="Arima.html"><i class="fas fa-peso-sign"></i><span>Profit</span></a>
            </li>
            <li class="nav-item main-pos" data-page="pos">
                <a href="home.html"><i class="fas fa-calculator"></i><span>POS</span></a>
            </li>
            <li class="nav-item" data-page="sellers">
                <a href="seller_management.html"><i class="fas fa-users"></i><span>Sellers</span></a>
            </li>
            <li class="nav-item" data-page="inventory">
<<<<<<< HEAD
                <a href="inventory.html"><i class="fas fa-boxes"></i><span>Inventory</span></a>
=======
                <a href="Arima.html"><i class="fas fa-boxes"></i><span>Inventory</span></a>
>>>>>>> 14fc7f51bd905e6946ffdd0aa966c73555d4f2d8
            </li>
        </ul>
    </nav>`;
    
    document.getElementById("nav-placeholder").innerHTML = nav;

    // Optional: highlight active nav
    const path = window.location.pathname.split("/").pop();
    document.querySelectorAll(".nav-item").forEach(item => {
        const page = item.getAttribute("data-page");
        if (path.includes(page)) {
            item.classList.add("active");
        }
    });
});
