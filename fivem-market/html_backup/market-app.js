/**
 * ═══════════════════════════════════════════════════════════════════
 * FIVEM MARKET - VANILLA JS APPLICATION
 * No React, No Build - Pure JavaScript
 * ═══════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    // ============================================
    // STATE MANAGEMENT
    // ============================================
    const state = {
        isOpen: false,
        config: null,
        balance: { cash: 0, bank: 0, points: 0, minPointWithdraw: 500 },
        cart: [],
        paymentMethod: 'cash',
        selectedCategory: null,
        searchQuery: '',
        dailyDiscountItemId: null,
        marketOwner: null,
        availableMarkets: []
    };

    // ============================================
    // DOM ELEMENTS
    // ============================================
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const elements = {
        app: $('#market-app'),
        marketName: $('#market-name'),
        marketOwner: $('#market-owner'),
        currentMarketName: $('#current-market-name'),
        marketDropdown: $('#market-dropdown'),
        selectorBtn: $('#market-selector-btn'),
        balanceCash: $('#balance-cash'),
        balanceBank: $('#balance-bank'),
        balancePoints: $('#balance-points'),
        cartBtn: $('#cart-btn'),
        cartCount: $('#cart-count'),
        closeBtn: $('#close-btn'),
        searchInput: $('#search-input'),
        searchClear: $('#search-clear'),
        categoriesList: $('#categories-list'),
        productsGrid: $('#products-grid'),
        noProducts: $('#no-products'),
        cartDrawer: $('#cart-drawer'),
        cartItems: $('#cart-items'),
        cartEmpty: $('#cart-empty'),
        cartTotalPrice: $('#cart-total-price'),
        purchaseBtn: $('#purchase-btn'),
        payCash: $('#pay-cash'),
        payBank: $('#pay-bank'),
        pointsPanel: $('#points-panel'),
        pointsValue: $('#points-value'),
        minWithdraw: $('#min-withdraw'),
        withdrawAmount: $('#withdraw-amount'),
        withdrawBtn: $('#withdraw-btn'),
        itemModal: $('#item-modal'),
        modalImage: $('#modal-image'),
        modalName: $('#modal-name'),
        modalDescription: $('#modal-description'),
        modalDetailed: $('#modal-detailed'),
        modalUsage: $('#modal-usage'),
        modalPrice: $('#modal-price'),
        modalOriginalPrice: $('#modal-original-price'),
        modalAddCart: $('#modal-add-cart'),
        notification: $('#notification'),
        notificationIcon: $('#notification-icon'),
        notificationMessage: $('#notification-message')
    };

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    function formatMoney(amount) {
        return '$' + amount.toLocaleString();
    }

    function showNotification(message, type = 'success') {
        elements.notification.className = 'notification ' + type;
        elements.notificationIcon.textContent = type === 'success' ? '✓' : '✕';
        elements.notificationMessage.textContent = message;
        elements.notification.classList.remove('hidden');

        setTimeout(() => {
            elements.notification.classList.add('hidden');
        }, 3000);
    }

    function getResourceName() {
        return window.GetParentResourceName ? window.GetParentResourceName() : 'market';
    }

    function fetchNUI(eventName, data = {}) {
        return fetch(`https://${getResourceName()}/${eventName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => res.json()).catch(() => ({}));
    }

    // ============================================
    // RENDER FUNCTIONS
    // ============================================
    function renderBalance() {
        elements.balanceCash.textContent = formatMoney(state.balance.cash);
        elements.balanceBank.textContent = formatMoney(state.balance.bank);
        elements.balancePoints.textContent = state.balance.points.toLocaleString();
        elements.pointsValue.textContent = state.balance.points.toLocaleString();
        elements.minWithdraw.textContent = state.balance.minPointWithdraw.toLocaleString();
    }

    function renderCategories() {
        if (!state.config) return;

        elements.categoriesList.innerHTML = state.config.categories.map(cat => `
            <button class="category-btn ${cat.id === state.selectedCategory ? 'active' : ''}" 
                    data-category="${cat.id}">
                <span class="category-icon">${cat.icon}</span>
                <span>${cat.name}</span>
            </button>
        `).join('');

        // Add event listeners
        elements.categoriesList.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.selectedCategory = btn.dataset.category;
                state.searchQuery = '';
                elements.searchInput.value = '';
                elements.searchClear.classList.add('hidden');
                renderCategories();
                renderProducts();
            });
        });
    }

    function renderProducts() {
        if (!state.config) return;

        let items = state.config.items.map(item => ({
            ...item,
            originalPrice: item.price,
            price: item.id === state.dailyDiscountItemId ? Math.floor(item.price * 0.95) : item.price,
            hasDiscount: item.id === state.dailyDiscountItemId
        }));

        // Filter by search or category
        if (state.searchQuery.trim()) {
            const query = state.searchQuery.toLowerCase();
            items = items.filter(item =>
                item.name.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query)
            );
        } else {
            items = items.filter(item => item.category === state.selectedCategory);
        }

        if (items.length === 0) {
            elements.productsGrid.classList.add('hidden');
            elements.noProducts.classList.remove('hidden');
            return;
        }

        elements.noProducts.classList.add('hidden');
        elements.productsGrid.classList.remove('hidden');

        elements.productsGrid.innerHTML = items.map(item => `
            <div class="product-card ${item.hasDiscount ? 'has-discount' : ''}" data-item-id="${item.id}">
                <div class="product-image">${item.image}</div>
                <div class="product-name">${item.name}</div>
                <div class="product-desc">${item.description}</div>
                <div class="product-footer">
                    <div>
                        <span class="product-price ${item.hasDiscount ? 'discounted' : ''}">${formatMoney(item.price)}</span>
                        ${item.hasDiscount ? `<span class="product-original-price">${formatMoney(item.originalPrice)}</span>` : ''}
                    </div>
                    <button class="add-to-cart-btn" data-item-id="${item.id}" title="Sepete Ekle">+</button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        elements.productsGrid.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('add-to-cart-btn')) return;
                openItemModal(card.dataset.itemId);
            });
        });

        elements.productsGrid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                addToCart(btn.dataset.itemId);
            });
        });
    }

    function renderCart() {
        const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = state.cart.reduce((sum, item) => {
            const marketItem = state.config.items.find(i => i.id === item.itemId);
            if (!marketItem) return sum;
            const price = item.itemId === state.dailyDiscountItemId 
                ? Math.floor(marketItem.price * 0.95) 
                : marketItem.price;
            return sum + (price * item.quantity);
        }, 0);

        // Update cart count badge
        if (totalItems > 0) {
            elements.cartCount.textContent = totalItems;
            elements.cartCount.classList.remove('hidden');
        } else {
            elements.cartCount.classList.add('hidden');
        }

        // Update cart total
        elements.cartTotalPrice.textContent = formatMoney(totalPrice);

        // Check if can afford
        const canAfford = state.paymentMethod === 'cash' 
            ? state.balance.cash >= totalPrice 
            : state.balance.bank >= totalPrice;
        
        elements.purchaseBtn.disabled = state.cart.length === 0 || !canAfford;
        elements.purchaseBtn.textContent = !canAfford && state.cart.length > 0 
            ? 'Yetersiz Bakiye' 
            : 'Satın Al';

        // Render cart items
        if (state.cart.length === 0) {
            elements.cartItems.classList.add('hidden');
            elements.cartEmpty.classList.remove('hidden');
            return;
        }

        elements.cartEmpty.classList.add('hidden');
        elements.cartItems.classList.remove('hidden');

        elements.cartItems.innerHTML = state.cart.map(cartItem => {
            const item = state.config.items.find(i => i.id === cartItem.itemId);
            if (!item) return '';
            const price = cartItem.itemId === state.dailyDiscountItemId 
                ? Math.floor(item.price * 0.95) 
                : item.price;
            return `
                <div class="cart-item" data-item-id="${item.id}">
                    <div class="cart-item-image">${item.image}</div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">${formatMoney(price)} × ${cartItem.quantity}</div>
                    </div>
                    <div class="cart-item-controls">
                        <button class="qty-btn qty-minus" data-item-id="${item.id}">−</button>
                        <span class="cart-item-qty">${cartItem.quantity}</span>
                        <button class="qty-btn qty-plus" data-item-id="${item.id}">+</button>
                        <button class="cart-item-remove" data-item-id="${item.id}">✕</button>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners
        elements.cartItems.querySelectorAll('.qty-minus').forEach(btn => {
            btn.addEventListener('click', () => updateQuantity(btn.dataset.itemId, -1));
        });
        elements.cartItems.querySelectorAll('.qty-plus').forEach(btn => {
            btn.addEventListener('click', () => updateQuantity(btn.dataset.itemId, 1));
        });
        elements.cartItems.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', () => removeFromCart(btn.dataset.itemId));
        });
    }

    function renderMarketSelector() {
        elements.currentMarketName.textContent = state.config ? state.config.name.split(' - ')[0] : 'Market';
        
        if (state.availableMarkets.length > 0) {
            elements.marketDropdown.innerHTML = state.availableMarkets.map(market => `
                <button class="${market.id === state.config?.id ? 'active' : ''}" data-market-id="${market.id}">
                    ${market.name}
                </button>
            `).join('');
        }
    }

    // ============================================
    // CART OPERATIONS
    // ============================================
    function addToCart(itemId) {
        const existing = state.cart.find(item => item.itemId === itemId);
        if (existing) {
            existing.quantity++;
        } else {
            state.cart.push({ itemId, quantity: 1 });
        }
        renderCart();
        showNotification('Ürün sepete eklendi', 'success');
    }

    function removeFromCart(itemId) {
        state.cart = state.cart.filter(item => item.itemId !== itemId);
        renderCart();
    }

    function updateQuantity(itemId, delta) {
        const item = state.cart.find(i => i.itemId === itemId);
        if (!item) return;
        
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            renderCart();
        }
    }

    function clearCart() {
        state.cart = [];
        renderCart();
    }

    // ============================================
    // MODAL FUNCTIONS
    // ============================================
    let currentModalItem = null;

    function openItemModal(itemId) {
        const item = state.config.items.find(i => i.id === itemId);
        if (!item) return;

        currentModalItem = item;
        const hasDiscount = item.id === state.dailyDiscountItemId;
        const price = hasDiscount ? Math.floor(item.price * 0.95) : item.price;

        elements.modalImage.textContent = item.image;
        elements.modalName.textContent = item.name;
        elements.modalDescription.textContent = item.description;
        elements.modalDetailed.textContent = item.detailedDescription || '';
        elements.modalUsage.textContent = item.usageInfo || '';
        elements.modalDetailed.classList.toggle('hidden', !item.detailedDescription);
        elements.modalUsage.classList.toggle('hidden', !item.usageInfo);
        elements.modalPrice.textContent = formatMoney(price);
        
        if (hasDiscount) {
            elements.modalOriginalPrice.textContent = formatMoney(item.price);
            elements.modalOriginalPrice.classList.remove('hidden');
        } else {
            elements.modalOriginalPrice.classList.add('hidden');
        }

        elements.itemModal.classList.remove('hidden');
    }

    function closeItemModal() {
        elements.itemModal.classList.add('hidden');
        currentModalItem = null;
    }

    // ============================================
    // DRAWER FUNCTIONS
    // ============================================
    function openCartDrawer() {
        elements.cartDrawer.classList.remove('hidden');
    }

    function closeCartDrawer() {
        elements.cartDrawer.classList.add('hidden');
    }

    function openPointsPanel() {
        elements.pointsPanel.classList.remove('hidden');
    }

    function closePointsPanel() {
        elements.pointsPanel.classList.add('hidden');
    }

    // ============================================
    // PURCHASE HANDLER
    // ============================================
    async function handlePurchase() {
        if (state.cart.length === 0) return;

        const totalPrice = state.cart.reduce((sum, cartItem) => {
            const item = state.config.items.find(i => i.id === cartItem.itemId);
            if (!item) return sum;
            const price = cartItem.itemId === state.dailyDiscountItemId 
                ? Math.floor(item.price * 0.95) 
                : item.price;
            return sum + (price * cartItem.quantity);
        }, 0);

        const purchaseData = {
            items: state.cart.map(item => ({
                itemId: item.itemId,
                quantity: item.quantity
            })),
            paymentMethod: state.paymentMethod,
            totalPrice: totalPrice
        };

        // Check if in FiveM
        if (window.GetParentResourceName) {
            const result = await fetchNUI('purchase', purchaseData);
            if (result.success) {
                showNotification('Satın alma başarılı!', 'success');
                
                // Award points
                const pointsEarned = Math.floor(totalPrice * 0.05);
                if (pointsEarned > 0) {
                    setTimeout(() => {
                        showNotification(`+${pointsEarned} puan kazandınız!`, 'success');
                    }, 500);
                }
                
                clearCart();
                closeCartDrawer();
            } else {
                showNotification(result.message || 'Satın alma başarısız!', 'error');
            }
        } else {
            // Demo mode - deduct from local balance
            if (state.paymentMethod === 'cash') {
                state.balance.cash -= totalPrice;
            } else {
                state.balance.bank -= totalPrice;
            }
            
            // Award points
            const pointsEarned = Math.floor(totalPrice * 0.05);
            state.balance.points += pointsEarned;
            
            renderBalance();
            showNotification('Satın alma başarılı!', 'success');
            
            if (pointsEarned > 0) {
                setTimeout(() => {
                    showNotification(`+${pointsEarned} puan kazandınız!`, 'success');
                }, 500);
            }
            
            clearCart();
            closeCartDrawer();
        }
    }

    // ============================================
    // POINTS WITHDRAW
    // ============================================
    async function handleWithdraw() {
        const amount = parseInt(elements.withdrawAmount.value) || 0;
        if (amount < state.balance.minPointWithdraw || amount > state.balance.points) {
            showNotification('Geçersiz miktar!', 'error');
            return;
        }

        if (window.GetParentResourceName) {
            const result = await fetchNUI('withdrawPoints', { amount });
            if (result.success) {
                showNotification(`${amount} puan bankaya aktarıldı!`, 'success');
                closePointsPanel();
            } else {
                showNotification(result.message || 'İşlem başarısız!', 'error');
            }
        } else {
            // Demo mode
            state.balance.points -= amount;
            state.balance.bank += amount;
            renderBalance();
            showNotification(`${amount} puan bankaya aktarıldı!`, 'success');
            elements.withdrawAmount.value = '';
            closePointsPanel();
        }
    }

    // ============================================
    // MARKET CONTROL
    // ============================================
    function openMarket(data) {
        state.isOpen = true;
        state.config = data.config;
        state.balance = data.balance;
        state.marketOwner = data.config.ownerName || null;
        state.cart = [];
        state.paymentMethod = 'cash';
        state.searchQuery = '';

        // Set default category
        if (data.config.categories.length > 0) {
            state.selectedCategory = data.config.categories[0].id;
        }

        // Set daily discount item
        if (data.config.items.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.config.items.length);
            state.dailyDiscountItemId = data.config.items[randomIndex].id;
        }

        // Update UI
        elements.marketName.textContent = data.config.name;
        
        if (state.marketOwner) {
            elements.marketOwner.querySelector('span').textContent = state.marketOwner;
            elements.marketOwner.classList.remove('hidden');
        } else {
            elements.marketOwner.classList.add('hidden');
        }

        renderBalance();
        renderCategories();
        renderProducts();
        renderCart();
        renderMarketSelector();

        elements.app.classList.remove('hidden');
    }

    function closeMarket() {
        state.isOpen = false;
        elements.app.classList.add('hidden');
        
        if (window.GetParentResourceName) {
            fetchNUI('closeMarket');
        }
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    function initEventListeners() {
        // Close button
        elements.closeBtn.addEventListener('click', closeMarket);

        // Cart button
        elements.cartBtn.addEventListener('click', openCartDrawer);
        $('#cart-close').addEventListener('click', closeCartDrawer);
        elements.cartDrawer.querySelector('.drawer-overlay').addEventListener('click', closeCartDrawer);

        // Points button
        $('#points-btn').addEventListener('click', openPointsPanel);
        $('#points-close').addEventListener('click', closePointsPanel);
        elements.pointsPanel.querySelector('.drawer-overlay').addEventListener('click', closePointsPanel);

        // Item modal
        $('#modal-close').addEventListener('click', closeItemModal);
        elements.itemModal.querySelector('.modal-overlay').addEventListener('click', closeItemModal);
        elements.modalAddCart.addEventListener('click', () => {
            if (currentModalItem) {
                addToCart(currentModalItem.id);
                closeItemModal();
            }
        });

        // Search
        elements.searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            elements.searchClear.classList.toggle('hidden', !e.target.value);
            renderProducts();
        });
        elements.searchClear.addEventListener('click', () => {
            state.searchQuery = '';
            elements.searchInput.value = '';
            elements.searchClear.classList.add('hidden');
            renderProducts();
        });

        // Payment method
        elements.payCash.addEventListener('click', () => {
            state.paymentMethod = 'cash';
            elements.payCash.classList.add('active');
            elements.payBank.classList.remove('active');
            renderCart();
        });
        elements.payBank.addEventListener('click', () => {
            state.paymentMethod = 'bank';
            elements.payBank.classList.add('active');
            elements.payCash.classList.remove('active');
            renderCart();
        });

        // Purchase
        elements.purchaseBtn.addEventListener('click', handlePurchase);

        // Withdraw
        elements.withdrawAmount.addEventListener('input', () => {
            const amount = parseInt(elements.withdrawAmount.value) || 0;
            elements.withdrawBtn.disabled = amount < state.balance.minPointWithdraw || amount > state.balance.points;
        });
        elements.withdrawBtn.addEventListener('click', handleWithdraw);

        // Market selector
        elements.selectorBtn.addEventListener('click', () => {
            elements.marketDropdown.classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            if (!elements.selectorBtn.contains(e.target)) {
                elements.marketDropdown.classList.add('hidden');
            }
        });

        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (!elements.itemModal.classList.contains('hidden')) {
                    closeItemModal();
                } else if (!elements.cartDrawer.classList.contains('hidden')) {
                    closeCartDrawer();
                } else if (!elements.pointsPanel.classList.contains('hidden')) {
                    closePointsPanel();
                } else if (state.isOpen) {
                    closeMarket();
                }
            }
        });
    }

    // ============================================
    // NUI MESSAGE HANDLER
    // ============================================
    window.addEventListener('message', (event) => {
        const data = event.data;

        switch (data.action) {
            case 'openMarket':
                openMarket(data);
                break;
            case 'closeMarket':
                closeMarket();
                break;
            case 'updateBalance':
                state.balance = { ...state.balance, ...data.balance };
                renderBalance();
                renderCart();
                break;
            case 'updateOwner':
                state.marketOwner = data.ownerName;
                if (state.marketOwner) {
                    elements.marketOwner.querySelector('span').textContent = state.marketOwner;
                    elements.marketOwner.classList.remove('hidden');
                } else {
                    elements.marketOwner.classList.add('hidden');
                }
                break;
        }
    });

    // ============================================
    // DEMO MODE (for testing outside FiveM)
    // ============================================
    function initDemo() {
        // Demo data for testing
        const demoConfig = {
            id: 'market_247',
            name: '24/7 Market - Sandy Shores',
            categories: [
                { id: 'food', name: 'Yiyecek', icon: '🍔' },
                { id: 'drinks', name: 'İçecek', icon: '🥤' },
                { id: 'health', name: 'Sağlık', icon: '💊' },
                { id: 'electronics', name: 'Elektronik', icon: '📱' },
                { id: 'tools', name: 'Araçlar', icon: '🔧' }
            ],
            items: [
                { id: 'burger', name: 'Burger', description: 'Lezzetli ızgara burger', detailedDescription: 'Bu lezzetli ızgara burger açlık barınızı %30 oranında doldurur. Taze malzemeler ve özel sosla hazırlanmıştır.', usageInfo: 'Envanterinizden kullanarak açlık seviyenizi artırabilirsiniz.', price: 25, image: '🍔', category: 'food' },
                { id: 'pizza', name: 'Pizza Dilimi', description: 'Sıcak peynirli pizza', price: 30, image: '🍕', category: 'food' },
                { id: 'hotdog', name: 'Sosisli', description: 'Klasik sokak lezzeti', price: 15, image: '🌭', category: 'food' },
                { id: 'sandwich', name: 'Sandviç', description: 'Taze malzemelerle', price: 20, image: '🥪', category: 'food' },
                { id: 'donut', name: 'Donut', description: 'Tatlı ve yumuşak', price: 10, image: '🍩', category: 'food' },
                { id: 'fries', name: 'Patates Kızartması', description: 'Çıtır çıtır', price: 12, image: '🍟', category: 'food' },
                { id: 'cola', name: 'Cola', description: 'Soğuk ve ferahlatıcı', price: 8, image: '🥤', category: 'drinks' },
                { id: 'water', name: 'Su', description: 'Saf kaynak suyu', price: 5, image: '💧', category: 'drinks' },
                { id: 'coffee', name: 'Kahve', description: 'Sıcak espresso', price: 15, image: '☕', category: 'drinks' },
                { id: 'energy', name: 'Enerji İçeceği', description: 'Güç ver!', price: 20, image: '⚡', category: 'drinks' },
                { id: 'juice', name: 'Meyve Suyu', description: 'Taze sıkılmış', price: 12, image: '🧃', category: 'drinks' },
                { id: 'bandage', name: 'Bandaj', description: 'İlk yardım bandajı', price: 50, image: '🩹', category: 'health' },
                { id: 'medkit', name: 'İlk Yardım Kiti', description: 'Tam iyileşme sağlar', price: 250, image: '🏥', category: 'health' },
                { id: 'painkiller', name: 'Ağrı Kesici', description: 'Ağrıları dindirir', price: 75, image: '💊', category: 'health' },
                { id: 'phone', name: 'Telefon', description: 'Akıllı telefon', price: 500, image: '📱', category: 'electronics' },
                { id: 'radio', name: 'Telsiz', description: 'İletişim cihazı', price: 150, image: '📻', category: 'electronics' },
                { id: 'flashlight', name: 'El Feneri', description: 'Karanlığı aydınlat', price: 45, image: '🔦', category: 'electronics' },
                { id: 'lockpick', name: 'Maymuncuk', description: 'Kilit açma aleti', price: 100, image: '🔓', category: 'tools' },
                { id: 'repairkit', name: 'Tamir Kiti', description: 'Araç tamiri için', price: 500, image: '🔧', category: 'tools' },
                { id: 'rope', name: 'İp', description: 'Çok amaçlı ip', price: 35, image: '🪢', category: 'tools' }
            ]
        };

        const demoBalance = {
            cash: 5000,
            bank: 25000,
            points: 350,
            minPointWithdraw: 500
        };

        // Check if not in FiveM and no market data
        if (!window.GetParentResourceName) {
            // Auto-open in demo mode after 1 second
            setTimeout(() => {
                openMarket({
                    config: demoConfig,
                    balance: demoBalance
                });
            }, 500);
        }
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    document.addEventListener('DOMContentLoaded', () => {
        initEventListeners();
        initDemo();
        console.log('[Market] Vanilla JS application initialized');
    });

})();
