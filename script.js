console.log('Akwadra Crypto Exchange Initialized');

/**
 * Application State
 * Stores current wallet and market information
 */
let state = {
    currentPrice: 45230.50,
    walletBalance: 10000.00,
    holdings: 0.00,
    history: []
};

/**
 * Initialize Application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Components
    initChart();
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
}

/**
 * Visual Components Logic
 */

// --- Chart Simulation ---
function initChart() {
    const container = document.getElementById('chart-container');
    if (!container) return;
    
    const barsCount = 24;
    container.innerHTML = ''; // Clear existing
    
    // Add Grid and Lines back
    container.innerHTML += `
        <div class="absolute inset-0 pointer-events-none">
            <div class="h-full w-full" style="background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 50px 50px;"></div>
        </div>
        <div class="absolute top-1/2 left-0 w-full h-px bg-indigo-500/50 border-t border-dashed border-indigo-400/50 z-10 flex items-center opacity-50">
             <span class="absolute left-0 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-r-md font-mono">LIVE</span>
        </div>
    `;

    for(let i = 0; i < barsCount; i++) {
        const barWrapper = document.createElement('div');
        barWrapper.className = 'relative flex flex-col justify-end items-center mx-1 flex-1 h-full group';
        
        const height = Math.floor(Math.random() * 60) + 15;
        const isGreen = Math.random() > 0.48;
        const colorClass = isGreen ? 'bg-emerald-500' : 'bg-rose-500';
        const wickColor = isGreen ? 'text-emerald-500' : 'text-rose-500';
        
        // Candle body
        const bar = document.createElement('div');
        bar.className = `w-full rounded-sm transition-all duration-1000 ${colorClass} opacity-80 group-hover:opacity-100 shadow-lg`;
        bar.style.height = `${height}%`;
        
        // Wick
        const wickHeight = height + Math.floor(Math.random() * 20);
        const wick = document.createElement('div');
        wick.className = `candle-wick ${wickColor}`;
        wick.style.height = `${wickHeight}%`;
        wick.style.bottom = '0';

        barWrapper.appendChild(wick);
        barWrapper.appendChild(bar);
        container.appendChild(barWrapper);
    }
}

function updateChart() {
    const container = document.getElementById('chart-container');
    if (!container) return;
    
    // We are looking for the bar wrappers, skipping the absolute grid/lines
    const bars = Array.from(container.children).filter(el => el.classList.contains('group'));
    
    if (bars.length > 0) {
        const randomIndex = Math.floor(Math.random() * bars.length);
        const barWrapper = bars[randomIndex];
        const bar = barWrapper.lastElementChild;
        const wick = barWrapper.firstElementChild;
        
        const newHeight = Math.floor(Math.random() * 60) + 15;
        const isGreen = Math.random() > 0.5;
        
        // Update Classes
        bar.className = `w-full rounded-sm transition-all duration-1000 ${isGreen ? 'bg-emerald-500' : 'bg-rose-500'} opacity-80 group-hover:opacity-100 shadow-lg`;
        bar.style.height = `${newHeight}%`;
        
        wick.className = `candle-wick ${isGreen ? 'text-emerald-500' : 'text-rose-500'}`;
        wick.style.height = `${newHeight + 10}%`;
    }
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
            } সদ্য
        }, 300);
    }, 3000);
}
