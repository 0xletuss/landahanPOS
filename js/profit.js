// ============================================
// PROFIT PAGE JAVASCRIPT - COOKIE AUTHENTICATION
// ============================================

class ProfitManager {
    constructor() {
        // API Configuration - Match exactly with home.js pattern
        this.API_BASE_URL = 'https://landahan-5.onrender.com/api';
        
        this.currentGroupBy = 'daily';
        this.filters = {
            startDate: null,
            endDate: null,
            productId: null
        };  
        this.transactions = [];
        this.stats = null;
        this.products = [];
        this.chart = null;
        // Pagination state to avoid extremely long pages when there are many items
        this.pagination = {
            pageSize: 20,
            currentPage: 1
        };
    }

    // ============================================
    // AUTHENTICATION HELPER (Updated to match home.js)
    // ============================================

    getFetchOptions(method = 'GET', body = null) {
        const options = {
            method: method,
            credentials: 'include', // CRITICAL: Send cookies with request
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        return options;
    }

    async checkAuthentication() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/auth-status`, {
                method: 'GET',
                credentials: 'include'
            });
            
            if (response.status === 401) {
                this.showError('Session expired. Redirecting to login...');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
                return false;
            }
            
            const data = await response.json();
            
            if (!data.authenticated) {
                this.showError('Please log in to view profit data');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
                return false;
            }
            return true;
        } catch (error) {
            console.error('Auth check failed:', error);
            this.showError('Authentication failed. Redirecting to login...');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
            return false;
        }
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    async init() {
        try {
            // Check authentication before proceeding
            const isAuthenticated = await this.checkAuthentication();
            if (!isAuthenticated) {
                return;
            }

            await this.loadProducts();
            this.initChart();
            this.setDefaultDateRange();
            await this.loadData();
            this.setupEventListeners();
        } catch (error) {
            console.error('Initialization error:', error);
            
            // Handle authentication errors specifically
            if (error.message.includes('401') || error.message.includes('403')) {
                this.showError('Session expired. Please log in again.');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
            } else {
                this.showError('Failed to initialize profit page: ' + error.message);
            }
        }
    }

    // ============================================
    // API CALLS WITH COOKIE AUTHENTICATION
    // ============================================

    async loadTransactions() {
        try {
            const params = new URLSearchParams({
                group_by: this.currentGroupBy
            });

            if (this.filters.startDate) {
                params.append('start_date', this.filters.startDate);
            }
            if (this.filters.endDate) {
                params.append('end_date', this.filters.endDate);
            }
            if (this.filters.productId) {
                params.append('product_id', this.filters.productId);
            }

            const response = await fetch(
                `${this.API_BASE_URL}/profit/transactions?${params}`,
                this.getFetchOptions('GET')
            );
            
            if (response.status === 401 || response.status === 403) {
                this.showError('Session expired. Redirecting to login...');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
                throw new Error('Authentication failed');
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();

            if (result.success) {
                this.transactions = result.data;
                return result.data;
            } else {
                throw new Error(result.message || 'Failed to load transactions');
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
            throw error;
        }
    }

    async loadStatistics() {
        try {
            const params = new URLSearchParams();

            if (this.filters.startDate) {
                params.append('start_date', this.filters.startDate);
            }
            if (this.filters.endDate) {
                params.append('end_date', this.filters.endDate);
            }

            const response = await fetch(
                `${this.API_BASE_URL}/profit/stats?${params}`,
                this.getFetchOptions('GET')
            );
            
            if (response.status === 401 || response.status === 403) {
                this.showError('Session expired. Redirecting to login...');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
                throw new Error('Authentication failed');
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();

            if (result.success) {
                this.stats = result.stats;
                return result;
            } else {
                throw new Error(result.message || 'Failed to load statistics');
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
            throw error;
        }
    }

    async loadProducts() {
        try {
            const response = await fetch(
                `${this.API_BASE_URL}/profit/products`,
                this.getFetchOptions('GET')
            );
            
            if (response.status === 401 || response.status === 403) {
                this.showError('Session expired. Redirecting to login...');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
                throw new Error('Authentication failed');
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();

            if (result.success) {
                this.products = result.products;
                this.populateProductFilter();
            } else {
                throw new Error(result.message || 'Failed to load products');
            }
        } catch (error) {
            console.error('Error loading products:', error);
            throw error;
        }
    }

    async loadData() {
        try {
            this.showLoading();
            
            const [transactions, statsData] = await Promise.all([
                this.loadTransactions(),
                this.loadStatistics()
            ]);

            this.renderStatistics(statsData);
            // render transactions with pagination applied
            this.pagination.currentPage = 1; // reset to first page when filters/load change
            this.renderTransactions(transactions);
            this.updateChart();
            
            this.hideLoading();
        } catch (error) {
            this.hideLoading();
            
            if (error.message.includes('401') || error.message.includes('403') || error.message.includes('Authentication failed')) {
                this.showError('Session expired. Redirecting to login...');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
            } else {
                this.showError('Failed to load data: ' + error.message);
            }
        }
    }

    // ============================================
    // RENDERING FUNCTIONS
    // ============================================

    renderStatistics(data) {
        const stats = data.stats;
        const bestDelivery = data.best_delivery;
        const worstDelivery = data.worst_delivery;
        const productPerformance = data.product_performance;

        document.getElementById('total-sales').textContent = this.formatCurrency(stats.total_sales);
        document.getElementById('total-cogs').textContent = this.formatCurrency(stats.total_cogs);
        document.getElementById('total-profit').textContent = this.formatCurrency(stats.total_profit);
        document.getElementById('profit-margin').textContent = `${stats.profit_margin}%`;
        document.getElementById('total-deliveries').textContent = stats.total_deliveries;
        document.getElementById('avg-profit').textContent = this.formatCurrency(stats.avg_profit_per_delivery);

        const marginElement = document.getElementById('profit-margin');
        marginElement.className = 'value ' + this.getMarginColorClass(stats.profit_margin);

        this.renderBestWorstDeliveries(bestDelivery, worstDelivery);
        this.renderProductPerformance(productPerformance);
    }

    renderBestWorstDeliveries(best, worst) {
        const bestContainer = document.getElementById('best-delivery');
        const worstContainer = document.getElementById('worst-delivery');

        if (best) {
            bestContainer.innerHTML = `
                <div class="delivery-card best">
                    <div class="delivery-header">
                        <span class="product-name">${best.product_name}</span>
                        <span class="profit-amount positive">${this.formatCurrency(best.profit)}</span>
                    </div>
                    <div class="delivery-details">
                        <span>${this.formatDate(best.date)}</span>
                        <span>${best.time}</span>
                    </div>
                </div>
            `;
        } else {
            bestContainer.innerHTML = '<p class="no-data">No data available</p>';
        }

        if (worst) {
            worstContainer.innerHTML = `
                <div class="delivery-card worst">
                    <div class="delivery-header">
                        <span class="product-name">${worst.product_name}</span>
                        <span class="profit-amount ${worst.profit < 0 ? 'negative' : ''}">${this.formatCurrency(worst.profit)}</span>
                    </div>
                    <div class="delivery-details">
                        <span>${this.formatDate(worst.date)}</span>
                        <span>${worst.time}</span>
                    </div>
                </div>
            `;
        } else {
            worstContainer.innerHTML = '<p class="no-data">No data available</p>';
        }
    }

    renderProductPerformance(products) {
        const container = document.getElementById('product-performance');

        if (!products || products.length === 0) {
            container.innerHTML = '<tr><td colspan="7" class="no-data">No product data available</td></tr>';
            return;
        }

        container.innerHTML = products.map(product => `
            <tr>
                <td>${product.product_name}</td>
                <td>${product.deliveries}</td>
                <td>${product.total_quantity}</td>
                <td>${this.formatCurrency(product.total_sales)}</td>
                <td>${this.formatCurrency(product.total_cogs)}</td>
                <td class="${product.total_profit >= 0 ? 'positive' : 'negative'}">
                    ${this.formatCurrency(product.total_profit)}
                </td>
                <td class="${this.getMarginColorClass(product.margin)}">
                    ${product.margin}%
                </td>
            </tr>
        `).join('');
    }

    renderTransactions(data) {
        const container = document.getElementById('transactions-container');

        if (!data || data.length === 0) {
            container.innerHTML = '<div class="no-data">No transactions found</div>';
            return;
        }

        // Apply pagination on the outer array (works for raw transactions or grouped arrays like daily/weekly/monthly)
        const totalItems = data.length;
        const pageSize = this.pagination.pageSize;
        const currentPage = this.pagination.currentPage || 1;
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        const pageData = data.slice(start, end);

        let html = '';
        if (this.currentGroupBy === 'raw') {
            html = this.renderRawTransactions(pageData);
        } else if (this.currentGroupBy === 'daily') {
            html = this.renderDailyTransactions(pageData);
        } else if (this.currentGroupBy === 'weekly') {
            html = this.renderWeeklyTransactions(pageData);
        } else if (this.currentGroupBy === 'monthly') {
            html = this.renderMonthlyTransactions(pageData);
        }

        // Append pagination controls under the transactions
        container.innerHTML = html + this.getPaginationHtml(totalItems, pageSize, currentPage);
    }

    // Build pagination HTML
    getPaginationHtml(totalItems, pageSize, currentPage) {
        if (!totalItems || totalItems <= pageSize) return '';
        const totalPages = Math.ceil(totalItems / pageSize);
        const maxButtons = 7; // show up to 7 numbered buttons
        let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let end = start + maxButtons - 1;
        if (end > totalPages) {
            end = totalPages;
            start = Math.max(1, end - maxButtons + 1);
        }

        let buttons = '';
        buttons += `<button class="pagination-btn" data-page="1">«</button>`;
        buttons += `<button class="pagination-btn" data-page="${Math.max(1, currentPage - 1)}">‹</button>`;

        for (let p = start; p <= end; p++) {
            buttons += `<button class="pagination-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
        }

        buttons += `<button class="pagination-btn" data-page="${Math.min(totalPages, currentPage + 1)}">›</button>`;
        buttons += `<button class="pagination-btn" data-page="${totalPages}">»</button>`;

        // container for pagination
        return `
            <div class="pagination-container">
                <div class="pagination-info">Page ${currentPage} of ${totalPages} — ${totalItems} items</div>
                <div class="pagination-controls">${buttons}</div>
            </div>
        `;
    }

    // Handle page change (called by click handlers)
    changePage(page) {
        const totalItems = this.transactions ? this.transactions.length : 0;
        const totalPages = Math.max(1, Math.ceil(totalItems / this.pagination.pageSize));
        const newPage = Math.min(Math.max(1, page), totalPages);
        this.pagination.currentPage = newPage;
        // Re-render transactions using current dataset without re-fetching
        this.renderTransactions(this.transactions);
        // Re-attach pagination handlers after DOM update
        this.attachPaginationEvents();
    }

    attachPaginationEvents() {
        const container = document.querySelector('.pagination-container');
        if (!container) return;
        container.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.currentTarget.dataset.page, 10);
                if (!isNaN(page)) this.changePage(page);
            });
        });
    }

    // ============================================
    // CHART HELPERS (Chart.js)
    // ============================================

    initChart() {
        const canvas = document.getElementById('profit-chart');
        if (!canvas) {
            console.warn('Profit chart canvas not found.');
            return;
        }

        try {
            const ctx = canvas.getContext('2d');
            if (typeof Chart === 'undefined') {
                console.warn('Chart.js not loaded. Please include Chart.js script.');
                return;
            }

            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Profit',
                        data: [],
                        borderColor: '#16a34a',
                        backgroundColor: 'rgba(22,101,52,0.08)',
                        tension: 0.25,
                        pointRadius: 4,
                        pointBackgroundColor: []
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => {
                                    return `${this.formatCurrency(ctx.raw)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            display: true
                        },
                        y: {
                            beginAtZero: false,
                            ticks: {
                                callback: (val) => this.formatCurrency(val)
                            }
                        }
                    }
                }
            });
        } catch (err) {
            console.error('Failed to initialize profit chart:', err);
        }
    }

    buildChartSeriesFromTransactions() {
        if (!this.transactions || this.transactions.length === 0) {
            return { labels: [], data: [] };
        }

        let labels = [];
        let data = [];

        if (this.currentGroupBy === 'raw') {
            labels = this.transactions.map(t => `${this.formatDate(t.date)} ${t.time}`);
            data = this.transactions.map(t => Number(t.profit) || 0);
        } else if (this.currentGroupBy === 'daily') {
            labels = this.transactions.map(d => this.formatDate(d.date));
            data = this.transactions.map(d => Number(d.total_profit) || 0);
        } else if (this.currentGroupBy === 'weekly') {
            labels = this.transactions.map(w => w.week_label || w.label || w.week || 'Week');
            data = this.transactions.map(w => Number(w.total_profit) || 0);
        } else if (this.currentGroupBy === 'monthly') {
            labels = this.transactions.map(m => m.month_label || m.label || m.month || 'Month');
            data = this.transactions.map(m => Number(m.total_profit) || 0);
        } else {
            labels = this.transactions.map((t, i) => this.formatDate(t.date) || `#${i+1}`);
            data = this.transactions.map(t => Number(t.profit) || 0);
        }

        return { labels, data };
    }

    updateChart() {
        try {
            if (!this.chart) {
                this.initChart();
                if (!this.chart) return;
            }

            const series = this.buildChartSeriesFromTransactions();
            this.chart.data.labels = series.labels;
            this.chart.data.datasets[0].data = series.data;
            this.chart.data.datasets[0].pointBackgroundColor = series.data.map(v => v >= 0 ? '#16a34a' : '#dc2626');
            const positiveCount = series.data.filter(v => v >= 0).length;
            this.chart.data.datasets[0].borderColor = positiveCount >= (series.data.length / 2) ? '#16a34a' : '#dc2626';
            this.chart.update();
        } catch (err) {
            console.error('Failed to update profit chart:', err);
        }
    }

    renderRawTransactions(transactions) {
        return `
            <table class="transactions-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Sales</th>
                        <th>COGS</th>
                        <th>Profit</th>
                        <th>Margin</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactions.map(t => `
                        <tr>
                            <td>${this.getMobileIconHtml('date')}${this.formatDate(t.date)}</td>
                            <td>${this.getMobileIconHtml('time')}${t.time}</td>
                            <td>${this.getMobileIconHtml('product')}${t.product_name}</td>
                            <td>${this.getMobileIconHtml('quantity')}${t.quantity}</td>
                            <td>${this.getMobileIconHtml('sales')}${this.formatCurrency(t.selling_price)}</td>
                            <td>${this.getMobileIconHtml('cogs')}${this.formatCurrency(t.cost_of_goods_sold)}</td>
                            <td class="${t.profit >= 0 ? 'positive' : 'negative'}">${this.getMobileIconHtml('profit')}${this.formatCurrency(t.profit)}</td>
                            <td class="${this.getMarginColorClass(t.margin)}">${this.getMobileIconHtml('margin')}${t.margin}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderDailyTransactions(dailyData) {
        return dailyData.map(day => `
            <div class="transaction-group">
                <div class="group-header" onclick="profitManager.toggleGroup(this)">
                    <div class="group-info">
                        <h3>${this.formatDate(day.date)}</h3>
                        <span class="group-stats">
                            ${day.total_deliveries} deliveries • 
                            ${day.total_quantity} items
                        </span>
                    </div>
                    <div class="group-summary">
                        <span class="summary-item">
                            Sales: <strong>${this.formatCurrency(day.total_sales)}</strong>
                        </span>
                        <span class="summary-item">
                            Profit: <strong class="${day.total_profit >= 0 ? 'positive' : 'negative'}">
                                ${this.formatCurrency(day.total_profit)}
                            </strong>
                        </span>
                        <span class="summary-item">
                            Margin: <strong class="${this.getMarginColorClass(day.margin)}">
                                ${day.margin}%
                            </strong>
                        </span>
                        <span class="toggle-icon">▼</span>
                    </div>
                </div>
                <div class="group-content">
                    <table class="transactions-table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Sales</th>
                                <th>COGS</th>
                                <th>Profit</th>
                                <th>Margin</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${day.deliveries.map(t => `
                                <tr>
                                    <td>${this.getMobileIconHtml('time')}${t.time}</td>
                                    <td>${this.getMobileIconHtml('product')}${t.product_name}</td>
                                    <td>${this.getMobileIconHtml('quantity')}${t.quantity}</td>
                                    <td>${this.getMobileIconHtml('sales')}${this.formatCurrency(t.selling_price)}</td>
                                    <td>${this.getMobileIconHtml('cogs')}${this.formatCurrency(t.cost_of_goods_sold)}</td>
                                    <td class="${t.profit >= 0 ? 'positive' : 'negative'}">${this.getMobileIconHtml('profit')}${this.formatCurrency(t.profit)}</td>
                                    <td class="${this.getMarginColorClass(t.margin)}">${this.getMobileIconHtml('margin')}${t.margin}%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `).join('');
    }

    renderWeeklyTransactions(weeklyData) {
        return weeklyData.map(week => `
            <div class="transaction-group">
                <div class="group-header" onclick="profitManager.toggleGroup(this)">
                    <div class="group-info">
                        <h3>${week.week_label}</h3>
                        <span class="group-stats">
                            ${week.total_deliveries} deliveries • 
                            ${week.total_quantity} items
                        </span>
                    </div>
                    <div class="group-summary">
                        <span class="summary-item">
                            Sales: <strong>${this.formatCurrency(week.total_sales)}</strong>
                        </span>
                        <span class="summary-item">
                            Profit: <strong class="${week.total_profit >= 0 ? 'positive' : 'negative'}">
                                ${this.formatCurrency(week.total_profit)}
                            </strong>
                        </span>
                        <span class="summary-item">
                            Margin: <strong class="${this.getMarginColorClass(week.margin)}">
                                ${week.margin}%
                            </strong>
                        </span>
                        <span class="toggle-icon">▼</span>
                    </div>
                </div>
                <div class="group-content">
                    <table class="transactions-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Sales</th>
                                <th>COGS</th>
                                <th>Profit</th>
                                <th>Margin</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${week.transactions.map(t => `
                                <tr>
                                    <td>${this.getMobileIconHtml('date')}${this.formatDate(t.date)}</td>
                                    <td>${this.getMobileIconHtml('time')}${t.time}</td>
                                    <td>${this.getMobileIconHtml('product')}${t.product_name}</td>
                                    <td>${this.getMobileIconHtml('quantity')}${t.quantity}</td>
                                    <td>${this.getMobileIconHtml('sales')}${this.formatCurrency(t.selling_price)}</td>
                                    <td>${this.getMobileIconHtml('cogs')}${this.formatCurrency(t.cost_of_goods_sold)}</td>
                                    <td class="${t.profit >= 0 ? 'positive' : 'negative'}">${this.getMobileIconHtml('profit')}${this.formatCurrency(t.profit)}</td>
                                    <td class="${this.getMarginColorClass(t.margin)}">${this.getMobileIconHtml('margin')}${t.margin}%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `).join('');
    }

    renderMonthlyTransactions(monthlyData) {
        return monthlyData.map(month => `
            <div class="transaction-group">
                <div class="group-header" onclick="profitManager.toggleGroup(this)">
                    <div class="group-info">
                        <h3>${month.month_label}</h3>
                        <span class="group-stats">
                            ${month.total_deliveries} deliveries • 
                            ${month.total_quantity} items
                        </span>
                    </div>
                    <div class="group-summary">
                        <span class="summary-item">
                            Sales: <strong>${this.formatCurrency(month.total_sales)}</strong>
                        </span>
                        <span class="summary-item">
                            Profit: <strong class="${month.total_profit >= 0 ? 'positive' : 'negative'}">
                                ${this.formatCurrency(month.total_profit)}
                            </strong>
                        </span>
                        <span class="summary-item">
                            Margin: <strong class="${this.getMarginColorClass(month.margin)}">
                                ${month.margin}%
                            </strong>
                        </span>
                        <span class="toggle-icon">▼</span>
                    </div>
                </div>
                <div class="group-content">
                    <table class="transactions-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Sales</th>
                                <th>COGS</th>
                                <th>Profit</th>
                                <th>Margin</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${month.transactions.map(t => `
                                <tr>
                                    <td>${this.getMobileIconHtml('date')}${this.formatDate(t.date)}</td>
                                    <td>${this.getMobileIconHtml('time')}${t.time}</td>
                                    <td>${this.getMobileIconHtml('product')}${t.product_name}</td>
                                    <td>${this.getMobileIconHtml('quantity')}${t.quantity}</td>
                                    <td>${this.getMobileIconHtml('sales')}${this.formatCurrency(t.selling_price)}</td>
                                    <td>${this.getMobileIconHtml('cogs')}${this.formatCurrency(t.cost_of_goods_sold)}</td>
                                    <td class="${t.profit >= 0 ? 'positive' : 'negative'}">${this.getMobileIconHtml('profit')}${this.formatCurrency(t.profit)}</td>
                                    <td class="${this.getMarginColorClass(t.margin)}">${this.getMobileIconHtml('margin')}${t.margin}%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `).join('');
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    setupEventListeners() {
        document.querySelectorAll('.group-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const groupBy = e.target.dataset.group;
                this.changeGroupBy(groupBy);
            });
        });

        document.getElementById('start-date')?.addEventListener('change', (e) => {
            this.filters.startDate = e.target.value;
            this.loadData();
        });

        document.getElementById('end-date')?.addEventListener('change', (e) => {
            this.filters.endDate = e.target.value;
            this.loadData();
        });

        document.getElementById('product-filter')?.addEventListener('change', (e) => {
            this.filters.productId = e.target.value || null;
            this.loadData();
        });

        document.getElementById('clear-filters')?.addEventListener('click', () => {
            this.clearFilters();
        });

        document.getElementById('export-btn')?.addEventListener('click', () => {
            this.exportData();
        });

        // Delegate pagination clicks (works after pagination controls are rendered)
        document.addEventListener('click', (e) => {
            const target = e.target.closest && e.target.closest('.pagination-btn');
            if (target) {
                const page = parseInt(target.dataset.page, 10);
                if (!isNaN(page)) this.changePage(page);
            }
        });
    }

    changeGroupBy(groupBy) {
        this.currentGroupBy = groupBy;

        document.querySelectorAll('.group-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.group === groupBy);
        });

        this.loadData();
    }

    toggleGroup(header) {
        const group = header.parentElement;
        const content = group.querySelector('.group-content');
        const icon = header.querySelector('.toggle-icon');

        group.classList.toggle('collapsed');
        
        if (group.classList.contains('collapsed')) {
            content.style.maxHeight = '0';
            icon.textContent = '▶';
        } else {
            content.style.maxHeight = content.scrollHeight + 'px';
            icon.textContent = '▼';
        }
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    // Return HTML for a small mobile icon label for a given column key
    getMobileIconHtml(key) {
        // Use FontAwesome 6 class names (included in the page)
        const icons = {
            date: '<i class="fa-solid fa-calendar"></i>',
            time: '<i class="fa-solid fa-clock"></i>',
            product: '<i class="fa-solid fa-box"></i>',
            quantity: '<i class="fa-solid fa-hashtag"></i>',
            sales: '<i class="fa-solid fa-money-bill-wave"></i>',
            cogs: '<i class="fa-solid fa-coins"></i>',
            profit: '<i class="fa-solid fa-chart-line"></i>',
            margin: '<i class="fa-solid fa-percent"></i>'
        };

        const icon = icons[key] || '';
        return `<span class="cell-label">${icon}</span>`;
    }

    populateProductFilter() {
        const select = document.getElementById('product-filter');
        if (!select) return;

        select.innerHTML = '<option value="">All Products</option>' +
            this.products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }

    setDefaultDateRange() {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const startInput = document.getElementById('start-date');
        const endInput = document.getElementById('end-date');

        if (startInput) {
            startInput.value = this.formatDateInput(thirtyDaysAgo);
            this.filters.startDate = startInput.value;
        }

        if (endInput) {
            endInput.value = this.formatDateInput(today);
            this.filters.endDate = endInput.value;
        }
    }

    clearFilters() {
        this.filters = {
            startDate: null,
            endDate: null,
            productId: null
        };

        document.getElementById('start-date').value = '';
        document.getElementById('end-date').value = '';
        document.getElementById('product-filter').value = '';

        this.loadData();
    }

    formatCurrency(amount) {
        return '₱' + parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    formatDateInput(date) {
        return date.toISOString().split('T')[0];
    }

    getMarginColorClass(margin) {
        if (margin >= 30) return 'margin-high';
        if (margin >= 15) return 'margin-medium';
        if (margin >= 0) return 'margin-low';
        return 'margin-negative';
    }

    showLoading() {
        const loader = document.getElementById('loading-overlay');
        if (loader) loader.style.display = 'flex';
    }

    hideLoading() {
        const loader = document.getElementById('loading-overlay');
        if (loader) loader.style.display = 'none';
    }

    showError(message) {
        alert(message);
        console.error(message);
    }

    exportData() {
        let csv = 'Date,Time,Product,Quantity,Sales,COGS,Profit,Margin\n';
        
        this.transactions.forEach(t => {
            if (this.currentGroupBy === 'raw') {
                csv += `${t.date},${t.time},${t.product_name},${t.quantity},${t.selling_price},${t.cost_of_goods_sold},${t.profit},${t.margin}%\n`;
            } else {
                if (t.deliveries) {
                    t.deliveries.forEach(d => {
                        csv += `${d.date},${d.time},${d.product_name},${d.quantity},${d.selling_price},${d.cost_of_goods_sold},${d.profit},${d.margin}%\n`;
                    });
                } else if (t.transactions) {
                    t.transactions.forEach(tr => {
                        csv += `${tr.date},${tr.time},${tr.product_name},${tr.quantity},${tr.selling_price},${tr.cost_of_goods_sold},${tr.profit},${tr.margin}%\n`;
                    });
                }
            }
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `profit_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}

// Initialize on page load
let profitManager;

document.addEventListener('DOMContentLoaded', () => {
    profitManager = new ProfitManager();
    profitManager.init();
});