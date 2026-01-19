console.log('Akwadra Crypto Exchange Initialized');

/**
 * Application State
 * Stores current wallet and market information
 */
let state = {
    currentPrice: 45230.50,
    walletBalance: 10000.00,
    holdings: 0.00,
    history: [],
    chart: null,
    chartData: []
};

/**
 * Initialize Application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Components
    initChartJS();
    initOrderBook();
    
    // Start live updates
    setInterval(updateMarket, 2000);
    
    // Event Listeners
    setupEventListeners();
    
    // Initial Render
    updateUI();
});

function setupEventListeners() {
    const btnBuy = document.getElementById('btn-buy');
    const btnSell = document.getElementById('btn-sell');
    const card = document.querySelector('.card');
    const maxBuyBtn = document.getElementById('max-buy-btn');

    if (btnBuy) btnBuy.addEventListener('click', () => executeTrade('buy'));
    if (btnSell) btnSell.addEventListener('click', () => executeTrade('sell'));
    
    if (card) {
        card.addEventListener('click', () => {
            showToast('جاري تحويلك إلى مركز المساعدة...', 'info');
        });
    }

    if (maxBuyBtn) {
        maxBuyBtn.addEventListener('click', () => {
            const maxAmount = state.walletBalance / state.currentPrice;
            document.getElementById('trade-amount').value = maxAmount.toFixed(4);
        });
    }

    // Notification Logic
    const notifBtn = document.getElementById('notification-btn');
    const notifDropdown = document.getElementById('notification-dropdown');

    if(notifBtn && notifDropdown) {
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = notifDropdown.classList.contains('invisible');
            if(isHidden) {
                notifDropdown.classList.remove('invisible', 'scale-95', 'opacity-0');
                notifDropdown.classList.add('scale-100', 'opacity-100');
                renderNotifications();
            } else {
                closeNotifications();
            }
        });

        document.addEventListener('click', (e) => {
            if(!notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
                closeNotifications();
            }
        });
    }
}

function closeNotifications() {
    const el = document.getElementById('notification-dropdown');
    if(el) {
        el.classList.add('invisible', 'scale-95', 'opacity-0');
        el.classList.remove('scale-100', 'opacity-100');
    }
}

function renderNotifications() {
    const list = document.getElementById('notification-list');
    if(!list) return;
    
    const items = [
        { title: 'تم استلام إيداع', msg: 'تم إيداع 0.5 BTC بنجاح في محفظتك', time: 'منذ 2 دقيقة', type: 'success' },
        { title: 'تنبيه أمان', msg: 'تم تسجيل دخول جديد من جهاز غير معروف', time: 'منذ 1 ساعة', type: 'warning' },
        { title: 'تحديث السوق', msg: 'ارتفع سعر BTC بنسبة 5% خلال الساعة الماضية', time: 'منذ 3 ساعات', type: 'info' },
        { title: 'توصية شراء', msg: 'تحليل جديد: فرصة شراء قوية لعملة ETH', time: 'منذ 5 ساعات', type: 'info' }
    ];
    
    list.innerHTML = items.map(item => `
        <div class="p-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer group">
            <div class="flex items-start gap-3">
                <div class="mt-1 w-2 h-2 rounded-full ${item.type === 'success' ? 'bg-emerald-500' : item.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'}"></div>
                <div>
                    <h4 class="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">${item.title}</h4>
                    <p class="text-[10px] text-slate-400 mt-1 leading-relaxed">${item.msg}</p>
                    <span class="text-[9px] text-slate-500 mt-2 block">${item.time}</span>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Visual Components Logic
 */

// --- Chart.js Integration ---
function initChartJS() {
    const ctx = document.getElementById('cryptoChart');
    if (!ctx) return;

    // Generate initial history data
    const initialPoints = 50;
    let price = 45230.50;
    const labels = [];
    const dataPoints = [];

    for (let i = 0; i < initialPoints; i++) {
        labels.push(i);
        // Create some random movement
        price = price + (Math.random() - 0.5) * 100;
        dataPoints.push(price);
    }

    state.chartData = dataPoints;

    // Gradient Fill
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)'); // Indigo
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

    // Create Chart
    state.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Bitcoin Price (USD)',
                data: dataPoints,
                borderColor: '#818cf8',
                backgroundColor: gradient,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#6366f1',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index',
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#94a3b8',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return '$' + context.parsed.y.toLocaleString('en-US', {minimumFractionDigits: 2});
                        },
                        title: function() {
                            return 'BTC/USD';
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: false,
                    grid: {
                        display: false
                    }
                },
                y: {
                    display: true,
                    position: 'right',
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#64748b',
                        font: {
                            family: 'monospace'
                        },
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function updateChart() {
    if (!state.chart) return;

    // Add new data point
    const newData = state.currentPrice;
    
    // Update dataset
    const dataset = state.chart.data.datasets[0];
    const labels = state.chart.data.labels;

    // Remove oldest
    if (dataset.data.length > 50) {
        dataset.data.shift();
        labels.shift();
    }

    // Add new
    dataset.data.push(newData);
    labels.push(labels[labels.length - 1] + 1);

    // Dynamic color based on trend
    const startPrice = dataset.data[0];
    const endPrice = dataset.data[dataset.data.length - 1];
    const isPositive = endPrice >= startPrice;

    // Update gradient and colors if trend changes (optional visual flair)
    // For now we keep it indigo to match theme, but you could swap to Emerald/Rose here

    state.chart.update('none'); // 'none' mode for performance
}

// --- Order Book ---
function initOrderBook() {
    renderOrderRows('order-book-asks', true);
    renderOrderRows('order-book-bids', false);
}

function renderOrderRows(elementId, isAsk) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    container.innerHTML = '';
    const count = 6;
    
    for(let i=0; i<count; i++) {
        const row = document.createElement('div');
        row.className = 'grid grid-cols-3 gap-2 relative overflow-hidden p-1.5 rounded hover:bg-slate-800 cursor-pointer transition-colors text-xs font-mono';
        
        const offset = (i + 1) * (Math.random() * 40);
        const price = isAsk ? state.currentPrice + offset : state.currentPrice - offset;
        const amount = (Math.random() * 0.8).toFixed(4);
        const total = (price * parseFloat(amount) / 1000).toFixed(1) + 'k';
        
        // Volume Bar
        const volumePercent = Math.floor(Math.random() * 90) + 10;
        const bgBar = document.createElement('div');
        bgBar.className = `absolute top-0 right-0 h-full opacity-10 ${isAsk ? 'bg-rose-500' : 'bg-emerald-500'}`;
        bgBar.style.width = `${volumePercent}%`;
        
        row.innerHTML = `
            <span class="${isAsk ? 'text-rose-400' : 'text-emerald-400'} font-bold z-10">${price.toFixed(2)}</span>
            <span class="text-slate-300 z-10 text-center">${amount}</span>
            <span class="text-slate-500 z-10 text-left">${total}</span>
        `;
        row.appendChild(bgBar);
        container.appendChild(row);
    }
}

// --- Market Simulation ---
function updateMarket() {
    // Simulate Price Change
    const change = (Math.random() - 0.5) * 65;
    state.currentPrice += change;
    
    // Update UI elements
    const priceEls = [
        document.getElementById('btc-price'), 
        document.getElementById('main-price'), 
        document.getElementById('mid-price')
    ];
    
    const priceStr = '$' + state.currentPrice.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    
    priceEls.forEach(el => {
        if(el) {
            el.innerText = el.id === 'mid-price' ? state.currentPrice.toFixed(2) : priceStr;
            
            // Visual Flash Effect
            el.classList.remove('flash-up', 'flash-down');
            void el.offsetWidth; // Trigger reflow to restart animation
            el.classList.add(change > 0 ? 'flash-up' : 'flash-down');
        }
    });
    
    // Update input field placeholder value
    const priceInput = document.querySelector('input[readonly]');
    if (priceInput) priceInput.value = state.currentPrice.toFixed(2);

    updateChart();
    initOrderBook();
}

// --- Trade Execution ---
function executeTrade(type) {
    const amountInput = document.getElementById('trade-amount');
    const amount = parseFloat(amountInput.value);
    
    if (isNaN(amount) || amount <= 0) {
        showToast('الرجاء إدخال كمية صحيحة للتداول', 'error');
        return;
    }
    
    const totalCost = amount * state.currentPrice;
    
    if (type === 'buy') {
        if (totalCost > state.walletBalance) {
            showToast('عذراً، رصيدك غير كافي لإتمام العملية', 'error');
            return;
        }
        state.walletBalance -= totalCost;
        state.holdings += amount;
        addToHistory('BTC', 'شراء', state.currentPrice, amount);
        showToast(`تم شراء ${amount} BTC بنجاح!`, 'success');
    } else {
        if (amount > state.holdings) {
            showToast('عذراً، لا تملك رصيد كافي من العملة', 'error');
            return;
        }
        state.walletBalance += totalCost;
        state.holdings -= amount;
        addToHistory('BTC', 'بيع', state.currentPrice, amount);
        showToast(`تم بيع ${amount} BTC بنجاح!`, 'success');
    }
    
    updateUI();
    amountInput.value = '';
}

function updateUI() {
    const balanceEl = document.getElementById('wallet-balance');
    if (balanceEl) {
        balanceEl.innerText = '$' + state.walletBalance.toLocaleString('en-US', {minimumFractionDigits: 2});
        balanceEl.classList.add('flash-up');
        setTimeout(() => balanceEl.classList.remove('flash-up'), 500);
    }
}

function addToHistory(coin, type, price, amount) {
    const list = document.getElementById('history-list');
    if (!list) return;
    
    const row = document.createElement('tr');
    const isBuy = type === 'شراء';
    
    row.className = 'hover:bg-slate-800/30 transition-colors group animate-pulse bg-indigo-500/10';
    row.innerHTML = `
        <td class="px-4 py-4 font-bold text-slate-200 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center text-xs">₿</span>
            ${coin}
        </td>
        <td class="px-4 py-4"><span class="${isBuy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'} px-2 py-1 rounded-md text-xs font-bold">${type}</span></td>
        <td class="px-4 py-4 font-mono text-slate-300">$${price.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td class="px-4 py-4 font-mono text-slate-300">${amount}</td>
        <td class="px-4 py-4 text-slate-500 text-xs">الآن</td>
    `;
    
    list.insertBefore(row, list.firstChild);
    
    // Remove pulse class
    setTimeout(() => {
        row.classList.remove('animate-pulse', 'bg-indigo-500/10');
    }, 2000);
    
    // Limit list size
    if (list.children.length > 10) {
        list.removeChild(list.lastChild);
    }
}

// --- Utilities ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    
    // Colors based on type
    let colors = 'border-indigo-500 bg-slate-800';
    let icon = '<svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    
    if (type === 'success') {
        colors = 'border-emerald-500 bg-slate-800';
        icon = '<svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    } else if (type === 'error') {
        colors = 'border-rose-500 bg-slate-800';
        icon = '<svg class="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    }
    
    toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl border-r-4 shadow-2xl transform translate-x-full transition-all duration-300 pointer-events-auto min-w-[300px] ${colors}`;
    toast.innerHTML = `
        ${icon}
        <span class="text-sm font-bold text-white">${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
        toast.classList.remove('translate-x-full');
    });
    
    // Remove after 3s
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
            if (toast.parentNode === container) {
                container.removeChild(toast);
            }тном
        }, 300);
    }, 3000);
}

// Placeholder for timeframe buttons
function changeTimeframe(period) {
    showToast(`تم تغيير الفاصل الزمني إلى ${period}`, 'info');
    // In a real app, this would fetch new data for the chart
}