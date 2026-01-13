/**
 * ═══════════════════════════════════════════════════════════════════
 * MARKET NUI BRIDGE SCRIPT
 * This script handles communication between FiveM client and React UI
 * ═══════════════════════════════════════════════════════════════════
 */

// Global state
let marketData = null;
let balance = { cash: 0, bank: 0, points: 0 };
let cart = [];

// Listen for FiveM NUI messages
window.addEventListener('message', function(event) {
    const data = event.data;
    
    switch(data.action) {
        case 'openMarket':
            marketData = data.data;
            balance = data.data.balance;
            showMarket();
            break;
            
        case 'updateBalance':
            balance = data.data;
            updateBalanceDisplay();
            break;
            
        case 'updateOwner':
            if (marketData) {
                marketData.ownerId = data.data.ownerId;
                marketData.ownerName = data.data.ownerName;
                updateOwnerDisplay();
            }
            break;
            
        case 'closeMarket':
            hideMarket();
            break;
    }
});

// Close on ESC key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeMarket();
    }
});

/**
 * Send NUI callback to FiveM client
 */
function nuiCallback(eventName, data = {}) {
    return fetch(`https://${GetParentResourceName()}/${eventName}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(resp => resp.json());
}

/**
 * Get parent resource name (FiveM function)
 */
function GetParentResourceName() {
    return window.GetParentResourceName ? window.GetParentResourceName() : 'market';
}

/**
 * Close market and notify client
 */
function closeMarket() {
    nuiCallback('closeMarket');
    hideMarket();
}

/**
 * Purchase items from cart
 */
async function purchaseItems(paymentMethod) {
    if (cart.length === 0) return;
    
    const items = cart.map(item => ({
        itemId: item.id,
        quantity: item.quantity
    }));
    
    const result = await nuiCallback('purchase', {
        items: items,
        paymentMethod: paymentMethod
    });
    
    if (result.success) {
        cart = [];
        updateCartDisplay();
    }
}

/**
 * Transfer market ownership
 */
async function transferMarket(newOwnerId) {
    const result = await nuiCallback('transferMarket', {
        newOwnerId: newOwnerId
    });
    
    return result.success;
}

/**
 * UI Functions (to be replaced by React app)
 */
function showMarket() {
    document.getElementById('app').style.display = 'block';
    console.log('Market opened:', marketData);
}

function hideMarket() {
    document.getElementById('app').style.display = 'none';
    cart = [];
}

function updateBalanceDisplay() {
    console.log('Balance updated:', balance);
}

function updateOwnerDisplay() {
    console.log('Owner updated:', marketData?.ownerName);
}

function updateCartDisplay() {
    console.log('Cart updated:', cart);
}

/**
 * Cart management
 */
function addToCart(itemId, quantity = 1) {
    const item = marketData?.items.find(i => i.id === itemId);
    if (!item) return;
    
    const existingIndex = cart.findIndex(i => i.id === itemId);
    if (existingIndex >= 0) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({
            ...item,
            quantity: quantity
        });
    }
    
    updateCartDisplay();
}

function removeFromCart(itemId) {
    cart = cart.filter(i => i.id !== itemId);
    updateCartDisplay();
}

function updateCartQuantity(itemId, quantity) {
    const index = cart.findIndex(i => i.id === itemId);
    if (index >= 0) {
        if (quantity <= 0) {
            cart.splice(index, 1);
        } else {
            cart[index].quantity = quantity;
        }
    }
    updateCartDisplay();
}

function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Export for React integration
window.MarketBridge = {
    closeMarket,
    purchaseItems,
    transferMarket,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    getCartTotal,
    getMarketData: () => marketData,
    getBalance: () => balance,
    getCart: () => cart,
};

console.log('[Market NUI] Bridge script loaded');
