// Configuration
const API_BASE = 'https://landahan-5.onrender.com/arima'; // Your Flask backend URL

// Global chart instance
let chart = null;

// Utility function to show error messages
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.add('active');
        setTimeout(() => errorDiv.classList.remove('active'), 5000);
    } else {
        alert(message);
    }
}

// Utility function to show/hide loading indicator
function showLoading(show) {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.classList.toggle('active', show);
    }
}

// Utility function to disable/enable buttons
function setButtonsDisabled(disabled) {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => btn.disabled = disabled);
}

// Get best model parameters as suggestions
async function getSuggestedParameters() {
    try {
        // Show loading for parameter suggestion
        const suggestionDiv = document.getElementById('parameterSuggestion');
        if (suggestionDiv) {
            suggestionDiv.textContent = 'Loading suggested parameters...';
            suggestionDiv.style.display = 'block';
            suggestionDiv.style.color = '#666';
        }

        const response = await fetch(`${API_BASE}/best-params`, {
            method: 'GET',
            credentials: 'include'
        });

        const result = await response.json();

        if (response.ok && result.success) {
            const p = result.p;
            const d = result.d;
            const q = result.q;
            const aic = result.aic;
            const bic = result.bic;
            
            // Fill in the parameter inputs
            document.getElementById('pOrder').value = p;
            document.getElementById('dOrder').value = d;
            document.getElementById('qOrder').value = q;
            
            // Show success message with model info
            if (suggestionDiv) {
                suggestionDiv.innerHTML = `✓ Suggested parameters: <strong>ARIMA(${p},${d},${q})</strong> | AIC: ${aic.toFixed(2)} | BIC: ${bic.toFixed(2)}`;
                suggestionDiv.style.color = '#10b981';
            }
            
            console.log(`Auto-filled suggested parameters: ARIMA(${p},${d},${q})`);
        } else {
            throw new Error(result.error || 'Failed to load suggestions');
        }
    } catch (error) {
        console.error('Error getting parameter suggestions:', error);
        const suggestionDiv = document.getElementById('parameterSuggestion');
        if (suggestionDiv) {
            suggestionDiv.textContent = '⚠ Could not load suggestions - using default values';
            suggestionDiv.style.color = '#f59e0b';
            // Set default values
            document.getElementById('pOrder').value = document.getElementById('pOrder').value || 1;
            document.getElementById('dOrder').value = document.getElementById('dOrder').value || 1;
            document.getElementById('qOrder').value = document.getElementById('qOrder').value || 1;
        }
    }
}

// Load historical data
async function loadHistoricalData() {
    try {
        showLoading(true);
        setButtonsDisabled(true);

        const response = await fetch(`${API_BASE}/husked-coconut-prices`, {
            method: 'GET',
            credentials: 'include' // Important for session cookies
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || result.error || 'Failed to load data');
        }

        // Render the chart with historical data only
        renderChart(
            result.data.dates,
            result.data.prices,
            null,
            null,
            null,
            'Historical Husked Coconut Prices'
        );

        // Update statistics
        updateStats(result.data);

    } catch (error) {
        console.error('Error loading historical data:', error);
        showError(error.message);
    } finally {
        showLoading(false);
        setButtonsDisabled(false);
    }
}

// Generate forecast with manual parameters
async function generateForecast() {
    try {
        showLoading(true);
        setButtonsDisabled(true);

        // Get input values
        const forecastDays = parseInt(document.getElementById('forecastDays').value);
        const p = parseInt(document.getElementById('pOrder').value);
        const d = parseInt(document.getElementById('dOrder').value);
        const q = parseInt(document.getElementById('qOrder').value);

        // Validate inputs
        if (isNaN(forecastDays) || forecastDays < 7 || forecastDays > 90) {
            throw new Error('Forecast days must be between 7 and 90');
        }

        if (isNaN(p) || isNaN(d) || isNaN(q)) {
            throw new Error('Please enter valid ARIMA parameters');
        }

        const response = await fetch(`${API_BASE}/forecast`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                forecast_days: forecastDays,
                p: p,
                d: d,
                q: q
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Forecast failed');
        }

        // Combine historical and forecast dates
        const allDates = [...result.historical.dates, ...result.forecast.dates];
        const historicalPrices = result.historical.prices;
        const forecastPrices = result.forecast.prices;
        const lowerBound = result.forecast.lower_bound;
        const upperBound = result.forecast.upper_bound;

        // Render chart with forecast
        renderChart(
            allDates,
            historicalPrices,
            forecastPrices,
            lowerBound,
            upperBound,
            `Price Forecast - ${result.model_info.order}`
        );

        // Update statistics with forecast info
        updateForecastStats(result);

    } catch (error) {
        console.error('Error generating forecast:', error);
        showError(error.message);
    } finally {
        showLoading(false);
        setButtonsDisabled(false);
    }
}

// Auto-select best ARIMA model and generate forecast
async function autoForecast() {
    try {
        showLoading(true);
        setButtonsDisabled(true);

        const response = await fetch(`${API_BASE}/auto-forecast`, {
            method: 'GET',
            credentials: 'include'
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Auto-forecast failed');
        }

        // Combine historical and forecast dates
        const allDates = [...result.historical.dates, ...result.forecast.dates];
        const historicalPrices = result.historical.prices;
        const forecastPrices = result.forecast.prices;
        const lowerBound = result.forecast.lower_bound;
        const upperBound = result.forecast.upper_bound;

        // Render chart with forecast
        renderChart(
            allDates,
            historicalPrices,
            forecastPrices,
            lowerBound,
            upperBound,
            `Best Model: ${result.model_info.order}`
        );

        // Update statistics with forecast info
        updateForecastStats(result);

    } catch (error) {
        console.error('Error in auto-forecast:', error);
        showError(error.message);
    } finally {
        showLoading(false);
        setButtonsDisabled(false);
    }
}

// Render the chart using Chart.js
function renderChart(dates, historical, forecast, lower, upper, title) {
    const ctx = document.getElementById('forecastChart');
    if (!ctx) {
        console.error('Chart canvas not found');
        return;
    }

    // Destroy existing chart if it exists
    if (chart) {
        chart.destroy();
    }

    // Prepare datasets
    const datasets = [{
        label: 'Historical Prices',
        data: historical,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.4,
        fill: false
    }];

    // Add forecast data if available
    if (forecast && forecast.length > 0) {
        // Create forecast data array with nulls for historical period
        const forecastData = new Array(historical.length).fill(null).concat(forecast);
        
        datasets.push({
            label: 'Forecast',
            data: forecastData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 3,
            pointHoverRadius: 5,
            tension: 0.4,
            fill: false
        });

        // Add confidence intervals if available
        if (lower && upper) {
            const lowerData = new Array(historical.length).fill(null).concat(lower);
            const upperData = new Array(historical.length).fill(null).concat(upper);

            datasets.push({
                label: 'Lower Bound (95% CI)',
                data: lowerData,
                borderColor: 'rgba(239, 68, 68, 0.3)',
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                borderWidth: 1,
                borderDash: [2, 2],
                pointRadius: 0,
                fill: false,
                tension: 0.4
            });

            datasets.push({
                label: 'Upper Bound (95% CI)',
                data: upperData,
                borderColor: 'rgba(239, 68, 68, 0.3)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 1,
                borderDash: [2, 2],
                pointRadius: 0,
                fill: '-1', // Fill to previous dataset (lower bound)
                tension: 0.4
            });
        }
    }

    // Create the chart
    chart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: dates,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += '₱' + context.parsed.y.toFixed(2);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Price (PHP)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '₱' + value.toFixed(2);
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// Update statistics for historical data only
function updateStats(data) {
    const prices = data.prices;
    const currentPrice = prices[prices.length - 1];
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const statsHTML = `
        <div class="stat-card">
            <h3>Current Price</h3>
            <div class="value">₱${currentPrice.toFixed(2)}</div>
        </div>
        <div class="stat-card">
            <h3>Average Price</h3>
            <div class="value">₱${avgPrice.toFixed(2)}</div>
        </div>
        <div class="stat-card">
            <h3>Minimum Price</h3>
            <div class="value">₱${minPrice.toFixed(2)}</div>
        </div>
        <div class="stat-card">
            <h3>Maximum Price</h3>
            <div class="value">₱${maxPrice.toFixed(2)}</div>
        </div>
    `;

    const statsGrid = document.getElementById('statsGrid');
    if (statsGrid) {
        statsGrid.innerHTML = statsHTML;
    }
}

// Update statistics with forecast information
function updateForecastStats(result) {
    const historical = result.historical.prices;
    const forecast = result.forecast.prices;
    const currentPrice = historical[historical.length - 1];
    const avgForecast = forecast.reduce((a, b) => a + b, 0) / forecast.length;
    const endPrice = forecast[forecast.length - 1];
    const priceChange = ((endPrice - currentPrice) / currentPrice * 100);

    const statsHTML = `
        <div class="stat-card">
            <h3>Current Price</h3>
            <div class="value">₱${currentPrice.toFixed(2)}</div>
        </div>
        <div class="stat-card">
            <h3>Forecast Average</h3>
            <div class="value">₱${avgForecast.toFixed(2)}</div>
        </div>
        <div class="stat-card">
            <h3>End Forecast Price</h3>
            <div class="value">₱${endPrice.toFixed(2)}</div>
            <div class="change ${priceChange >= 0 ? 'positive' : 'negative'}">
                ${priceChange >= 0 ? '↑' : '↓'} ${Math.abs(priceChange).toFixed(2)}%
            </div>
        </div>
        <div class="stat-card">
            <h3>Model Quality</h3>
            <div class="value" style="font-size: 20px;">${result.model_info.order}</div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">
                AIC: ${result.model_info.aic.toFixed(2)}<br>
                BIC: ${result.model_info.bic.toFixed(2)}
            </div>
        </div>
    `;

    const statsGrid = document.getElementById('statsGrid');
    if (statsGrid) {
        statsGrid.innerHTML = statsHTML;
    }
}

// Predict price for a specific day
async function predictSpecificDay() {
    try {
        showLoading(true);
        setButtonsDisabled(true);

        const specificDay = parseInt(document.getElementById('specificDay').value);
        const p = parseInt(document.getElementById('pOrder').value);
        const d = parseInt(document.getElementById('dOrder').value);
        const q = parseInt(document.getElementById('qOrder').value);

        if (isNaN(specificDay) || specificDay < 1 || specificDay > 90) {
            throw new Error('Please enter a valid day between 1 and 90');
        }

        // We need to forecast up to that specific day
        const response = await fetch(`${API_BASE}/forecast`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                forecast_days: specificDay,
                p: p,
                d: d,
                q: q
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Forecast failed');
        }

        // Get the price for the specific day (last day of forecast)
        const predictedPrice = result.forecast.prices[specificDay - 1];
        const lowerBound = result.forecast.lower_bound[specificDay - 1];
        const upperBound = result.forecast.upper_bound[specificDay - 1];
        const targetDate = result.forecast.dates[specificDay - 1];

        // Display the result
        const resultDiv = document.getElementById('specificDayResult');
        const dateDiv = document.getElementById('specificDayDate');
        const priceDiv = document.getElementById('specificDayPrice');
        const rangeDiv = document.getElementById('specificDayRange');

        dateDiv.textContent = `📅 Prediction for ${targetDate} (${specificDay} days from now)`;
        priceDiv.textContent = `₱${predictedPrice.toFixed(2)}`;
        rangeDiv.textContent = `₱${lowerBound.toFixed(2)} - ₱${upperBound.toFixed(2)}`;

        resultDiv.style.display = 'block';

        // Scroll to result
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Also show the full forecast chart
        const allDates = [...result.historical.dates, ...result.forecast.dates];
        const historicalPrices = result.historical.prices;
        const forecastPrices = result.forecast.prices;
        const allLowerBound = result.forecast.lower_bound;
        const allUpperBound = result.forecast.upper_bound;

        renderChart(
            allDates,
            historicalPrices,
            forecastPrices,
            allLowerBound,
            allUpperBound,
            `Forecast with Day ${specificDay} Highlighted - ${result.model_info.order}`
        );

    } catch (error) {
        console.error('Error predicting specific day:', error);
        showError(error.message);
    } finally {
        showLoading(false);
        setButtonsDisabled(false);
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    console.log('ARIMA page loaded');
    // Load initial historical data
    loadHistoricalData();
    // Auto-fill suggested parameters
    getSuggestedParameters();
});