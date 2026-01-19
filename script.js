console.log('Akwadra Crypto Exchange Initialized');

// State
let currentPrice = 45230.50;
let walletBalance = 10000.00;
let holdings = 0.00;

document.addEventListener('DOMContentLoaded', () => {
    // --- EXISTING FUNCTIONALITY PRESERVED ---
    const card = document.querySelector('.card');
    if (card) {
        card.addEventListener('click', () => {
            console.log('تم النقر على البطاقة!');
            alert('أهلاً بك في أكوادرا! منصة التداول الأسرع نمواً.');
        });
    }

    // --- NEW CRYPTO FUNCTIONALITY ---
    
    // 1. Initialize Components
    initChart();
    initOrderBook();
    setInterval(updateMarket, 2000);
    
    // 2. Event Listeners for Trade
    document.getElementById('btn-buy').addEventListener('click', () => executeTrade('buy'));
    document.getElementById('btn-sell').addEventListener('click', () => executeTrade('sell'));
});

// --- Chart Simulation ---
function initChart() {
    const container = document.getElementById('chart-container');
    const barsCount = 30;
    
    for(let i=0; i<barsCount; i++) {
        const bar = document.createElement('div');
        const height = Math.floor(Math.random() * 80) + 10;
        const isGreen = Math.random() > 0.45;
        
        bar.className = `w-full mx-0.5 rounded-t-sm transition-all duration-1000 ${isGreen ? 'bg-emerald-500/50' : 'bg-rose-500/50'}`;
        bar.style.height = `${height}%`;
        container.appendChild(bar);
    }
}

function updateChart() {
    const container = document.getElementById('chart-container');
    const bars = container.children;
    // Update random bar
    const randomIndex = Math.floor(Math.random() * bars.length);
    const newHeight = Math.floor(Math.random() * 80) + 10;
    const isGreen = Math.random() > 0.45;
    
    bars[randomIndex].style.height = `${newHeight}%`;
    bars[randomIndex].className = `w-full mx-0.5 rounded-t-sm transition-all duration-500 ${isGreen ? 'bg-emerald-500/50' : 'bg-rose-500/50'}`;
}

// --- Order Book ---
function initOrderBook() {
    renderOrderRows('order-book-asks', true);
    renderOrderRows('order-book-bids', false);
}

function renderOrderRows(elementId, isAsk) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    const count = 5;
    
    for(let i=0; i<count; i++) {
        const row = document.createElement('div');
        row.className = 'flex justify-between relative overflow-hidden p-1 rounded hover:bg-slate-800 cursor-pointer transition-colors';
        
        // Price calculation based on spread
        const offset = (i + 1) * (Math.random() * 50);
        const price = isAsk ? currentPrice + offset : currentPrice - offset;
        const amount = (Math.random() * 1.5).toFixed(4);
        
        // Background volume bar simulation
        const volumeWidth = Math.floor(Math.random() * 60);
        const bgBar = document.createElement('div');
        bgBar.className = `absolute top-0 right-0 h-full opacity-10 ${isAsk ? 'bg-rose-500' : 'bg-emerald-500'}`;
        bgBar.style.width = `${volumeWidth}%`;
        
        row.innerHTML = `
            <span class="${isAsk ? 'text-rose-400' : 'text-emerald-400'}">${price.toFixed(2)}</span>
            <span class="text-slate-300 relative z-10">${amount}</span>
        `;
        row.appendChild(bgBar);
        container.appendChild(row);
    }
}

// --- Market Logic ---
function updateMarket() {
    // Fluctuate Price
    const change = (Math.random() - 0.5) * 50;
    currentPrice += change;
    
    // Update DOM
    const priceEls = [document.getElementById('btc-price'), document.getElementById('main-price'), document.getElementById('mid-price')];
    const priceStr = '$' + currentPrice.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    
    priceEls.forEach(el => {
        if(el) {
            el.innerText = el.id === 'mid-price' ? currentPrice.toFixed(2) : priceStr;
            el.classList.remove('flash-up', 'flash-down');
            void el.offsetWidth; // trigger reflow
            el.classList.add(change > 0 ? 'flash-up' : 'flash-down');
        }
    });
    
    updateChart();
    initOrderBook(); // Refresh order book
}

// --- Trading Logic ---
function executeTrade(type) {
    const amountInput = document.getElementById('trade-amount');
    const amount = parseFloat(amountInput.value);
    
    if (!amount || amount <= 0) {
        alert('الرجاء إدخال كمية صحيحة');
        return;
    }
    
    const totalCost = amount * currentPrice;
    
    if (type === 'buy') {
        if (totalCost > walletBalance) {
            alert('عذراً، رصيدك غير كافي!');
            return;
        }
        walletBalance -= totalCost;
        holdings += amount;
        addToHistory('BTC', 'شراء', currentPrice, amount);
    } else {
        if (amount > holdings) {
            alert('عذراً، لا تملك ما يكفي من العملات!');
            return;
        }
        walletBalance += totalCost;
        holdings -= amount;
        addToHistory('BTC', 'بيع', currentPrice, amount);
    }
    
    // Update UI
    document.getElementById('wallet-balance').innerText = '$' + walletBalance.toLocaleString('en-US', {minimumFractionDigits: 2});
    amountInput.value = '';
    alert(`تم تنفيذ عملية ${type === 'buy' ? 'الشراء' : 'البيع'} بنجاح!`);
}

function addToHistory(coin, type, price, amount) {
    const list = document.getElementById('history-list');
    const row = document.createElement('tr');
    const isBuy = type === 'شراء';
    
    row.className = 'hover:bg-slate-800/50 transition-colors animate-pulse-fast';
    row.innerHTML = `
        <td class="px-4 py-3 font-medium">${coin}</td>
        <td class="px-4 py-3 ${isBuy ? 'text-emerald-500' : 'text-rose-500'}">${type}</td>
        <td class="px-4 py-3">$${price.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td class="px-4 py-3">${amount}</td>
        <td class="px-4 py-3 text-slate-500">الآن</td>
    `;
    
    // Add to top
    list.insertBefore(row, list.firstChild);
    
    // Remove animation class after delay
    setTimeout(() => {
        row.classList.remove('animate-pulse-fast');
    }, 1500);
}