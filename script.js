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
    chartData: [],
    markets: [
        { pair: 'BTC/USDT', price: 45230.50, change: 2.45 },
        { pair: 'ETH/USDT', price: 2340.10, change: -1.20 },
        { pair: 'SOL/USDT', price: 102.50, change: 5.70 },
        { pair: 'BNB/USDT', price: 310.20, change: 0.80 },
        { pair: 'XRP/USDT', price: 0.52, change: -0.50 },
        { pair: 'ADA/USDT', price: 0.48, change: 1.10 },
        { pair: 'DOGE/USDT', price: 0.08, change: 3.20 },
        { pair: 'DOT/USDT', price: 6.90, change: -2.10 },
        { pair: 'MATIC/USDT', price: 0.85, change: 0.40 }
    ]
};

/**
 * Initialize Application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Components
    initChartJS();
    initOrderBook();
    initMarkets();
    
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

// --- Markets List Integration ---
function initMarkets() {
    const list = document.getElementById('markets-list');
    if(!list) return;
    renderMarkets();
}

function renderMarkets() {
    const list = document.getElementById('markets-list');
    if(!list) return;

    list.innerHTML = state.markets.map(m => {
        const isUp = m.change >= 0;
        return `
        <div class="flex justify-between items-center px-3 py-2 hover:bg-slate-800/50 cursor-pointer transition-colors group" onclick="switchPair('${m.pair}')">
            <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-300 group-hover:text-white">${m.pair.split('/')[0]}</span>
            </div>
            <div class="text-right">
                <div class="text-xs font-mono font-bold text-white">${m.price.toLocaleString()}</div>
                <div class="text-[9px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}">${isUp ? '+' : ''}${m.change}%</div>
            </div>
        </div>
        `;
    }).join('');
}

function switchPair(pair) {
    showToast(`تم الانتقال إلى سوق ${pair}`, 'info');
    // Simulate changing chart data
    if(state.chart) {
        // Reset data randomly
        state.currentPrice = state.markets.find(m => m.pair === pair).price;
        state.chartData = Array(50).fill(0).map((_, i) => state.currentPrice + (Math.random() - 0.5) * (state.currentPrice * 0.01));
        state.chart.data.datasets[0].data = state.chartData;
        state.chart.update();
        
        // Update Labels
        const nameEl = document.getElementById('active-pair-name');
        const priceEl = document.getElementById('active-pair-price');
        if(nameEl) nameEl.innerText = pair;
        if(priceEl) priceEl.innerText = '$' + state.currentPrice.toLocaleString();
        
        updateUI();
    }
}

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
                label: 'Price (USD)',
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
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: false,
                    grid: { display: false }
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
                        font: { family: 'monospace' },
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

    const newData = state.currentPrice;
    const dataset = state.chart.data.datasets[0];
    const labels = state.chart.data.labels;

    if (dataset.data.length > 50) {
        dataset.data.shift();
        labels.shift();
    }

    dataset.data.push(newData);
    labels.push(labels[labels.length - 1] + 1);
    state.chart.update('none');
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
        row.className = 'grid grid-cols-3 gap-2 relative overflow-hidden p-1 rounded hover:bg-slate-800 cursor-pointer transition-colors text-[10px] font-mono';
        
        const offset = (i + 1) * (Math.random() * (state.currentPrice * 0.001));
        const price = isAsk ? state.currentPrice + offset : state.currentPrice - offset;
        const amount = (Math.random() * 0.8).toFixed(4);
        const total = (price * parseFloat(amount) / 1000).toFixed(1) + 'k';
        
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
    // Simulate Main Price Change
    const change = (Math.random() - 0.5) * (state.currentPrice * 0.002);
    state.currentPrice += change;
    
    // Update UI elements
    const priceEls = [
        document.getElementById('btc-price'), 
        document.getElementById('main-price'), 
        document.getElementById('mid-price'),
        document.getElementById('active-pair-price')
    ];
    
    const priceStr = '$' + state.currentPrice.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    
    priceEls.forEach(el => {
        if(el) {
            el.innerText = el.id === 'mid-price' ? state.currentPrice.toFixed(2) : priceStr;
            el.classList.remove('flash-up', 'flash-down');
            void el.offsetWidth;
            el.classList.add(change > 0 ? 'flash-up' : 'flash-down');
        }
    });
    
    const priceInput = document.querySelector('input[readonly]');
    if (priceInput) priceInput.value = state.currentPrice.toFixed(2);

    // Simulate Other Markets
    state.markets.forEach(m => {
        m.price += (Math.random() - 0.5) * (m.price * 0.005);
        m.change += (Math.random() - 0.5) * 0.1;
        m.change = parseFloat(m.change.toFixed(2));
    });
    
    // Re-render markets list if visible (poor man's reactivity)
    const list = document.getElementById('markets-list');
    if(list && !list.matches(':hover')) { // Don't update if hovering to prevent jumpiness
        renderMarkets();
    }

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
    
    row.className = 'hover:bg-slate-800/30 transition-colors group animate-pulse bg-indigo-500/10 border-b border-slate-800/30';
    row.innerHTML = `
        <td class="px-3 py-2 font-bold text-slate-200 flex items-center gap-2">
            <span class="w-5 h-5 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center text-[10px]">₿</span>
            ${coin}
        </td>
        <td class="px-3 py-2"><span class="${isBuy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'} px-1.5 py-0.5 rounded text-[10px] font-bold">${type}</span></td>
        <td class="px-3 py-2 font-mono text-slate-300">$${price.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td class="px-3 py-2 font-mono text-slate-300">${amount}</td>
        <td class="px-3 py-2 text-slate-500 text-[10px]">الآن</td>
    `;
    
    list.insertBefore(row, list.firstChild);
    
    setTimeout(() => {
        row.classList.remove('animate-pulse', 'bg-indigo-500/10');
    }, 2000);
    
    if (list.children.length > 10) {
        list.removeChild(list.lastChild);
    }
}

// --- Utilities ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    
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
    
    requestAnimationFrame(() => {
        toast.classList.remove('translate-x-full');
    });
    
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
            if (toast.parentNode === container) {
                container.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function changeTimeframe(period) {
    showToast(`تم تغيير الفاصل الزمني إلى ${period}`, 'info');
}
