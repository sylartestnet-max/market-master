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
        availableMarkets: [],
        salesData: [],
        selectedSalesItemId: null
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
        statsBtn: $('#stats-btn'),
        transferBtn: $('#transfer-btn'),
        searchInput: $('#search-input'),
        searchClear: $('#search-clear'),
        categoriesList: $('#categories-list'),
        productsGrid: $('#products-grid'),
        noProducts: $('#no-products'),
        cartDrawer: $('#cart-drawer'),
        cartItems: $('#cart-items'),
        cartEmpty: $('#cart-empty'),
        cartTotalPrice: $('#cart-total-price'),
        cartUniqueCount: $('#cart-unique-count'),
        cartTotalQty: $('#cart-total-qty'),
        cartEarnedPoints: $('#cart-earned-points'),
        purchaseBtn: $('#purchase-btn'),
        payCash: $('#pay-cash'),
        payBank: $('#pay-bank'),
        pointsPanel: $('#points-panel'),
        pointsValue: $('#points-value'),
        minWithdraw: $('#min-withdraw'),
        pointsPresets: $('#points-presets'),
        withdrawAmount: $('#withdraw-amount'),
        withdrawBtn: $('#withdraw-btn'),
        salesPanel: $('#sales-panel'),
        salesItemsList: $('#sales-items-list'),
        salesEmpty: $('#sales-empty'),
        salesDetailContent: $('#sales-detail-content'),
        salesDetailName: $('#sales-detail-name'),
        salesDetailTotal: $('#sales-detail-total'),
        salesDaysGrid: $('#sales-days-grid'),
        transferPanel: $('#transfer-panel'),
        transferMarketName: $('#transfer-market-name'),
        transferCurrentOwner: $('#transfer-current-owner'),
        transferStatus: $('#transfer-status'),
        transferOwnerId: $('#transfer-owner-id'),
        transferOwnerName: $('#transfer-owner-name'),
        transferConfirm: $('#transfer-confirm'),
        transferSubmit: $('#transfer-submit'),
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

    // Detect whether a string is an image path (.png/.jpg/.svg/.webp/.gif or http/nui)
    function isImagePath(str) {
        if (!str || typeof str !== 'string') return false;
        const s = str.trim().toLowerCase();
        if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('nui://') || s.startsWith('./') || s.startsWith('/') || s.startsWith('assets/')) return true;
        return /\.(png|jpe?g|svg|webp|gif)$/i.test(s);
    }

    // Render image cell: emoji as text, paths as <img>, fallback emoji on error
    function renderImage(image, fallback) {
        const fb = fallback || '📦';
        if (!image) return `<span class="emoji-icon">${fb}</span>`;
        if (isImagePath(image)) {
            // If it's just a filename (e.g. bread.png), assume it's in assets/ui/
            let src = image;
            if (!/^(https?:|nui:|\.\/|\/|assets\/)/i.test(src)) {
                src = './assets/ui/' + src;
            }
            return `<img src="${src}" alt="" class="img-icon" onerror="this.outerHTML='<span class=&quot;emoji-icon&quot;>${fb}</span>'">`;
        }
        return `<span class="emoji-icon">${image}</span>`;
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
        return window.GetParentResourceName ? window.GetParentResourceName() : 'fivem-market';
    }

    function fetchNUI(eventName, data = {}) {
        return fetch(`https://${getResourceName()}/${eventName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => res.json()).catch(() => ({}));
    }

    function getLast7Days() {
        const days = [];
        const now = new Date();
        for (let i = 6; i >= 0; i -= 1) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            days.push({
                key: date.toISOString().slice(0, 10),
                label: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'][date.getDay()]
            });
        }
        return days;
    }

    function createEmptySalesData() {
        return getLast7Days().map(day => ({
            date: day.key,
            label: day.label,
            items: {}
        }));
    }

    function getSelectedSalesItem() {
        if (!state.selectedSalesItemId || !state.config) return null;
        const item = state.config.items.find(entry => entry.id === state.selectedSalesItemId);
        if (!item) return null;

        const total = state.salesData.reduce((sum, day) => sum + (day.items[state.selectedSalesItemId] || 0), 0);
        return { item, total };
    }

    function getSalesTotals() {
        if (!state.config) return [];

        return state.config.items
            .map(item => ({
                id: item.id,
                name: item.name,
                image: item.image,
                total: state.salesData.reduce((sum, day) => sum + (day.items[item.id] || 0), 0)
            }))
            .filter(item => item.total > 0)
            .sort((a, b) => b.total - a.total);
    }

    function recordSales(cartItems) {
        if (!Array.isArray(cartItems) || cartItems.length === 0) return;

        if (!state.salesData.length) {
            state.salesData = createEmptySalesData();
        }

        const todayKey = new Date().toISOString().slice(0, 10);
        const dayEntry = state.salesData.find(entry => entry.date === todayKey);
        if (!dayEntry) return;

        cartItems.forEach(cartItem => {
            dayEntry.items[cartItem.itemId] = (dayEntry.items[cartItem.itemId] || 0) + cartItem.quantity;
        });

        if (!state.selectedSalesItemId) {
            state.selectedSalesItemId = cartItems[0].itemId;
        }
    }

    function renderPointsPresets() {
        if (!elements.pointsPresets) return;

        const presets = [500, 1000, 2500, state.balance.points].filter((amount, index, arr) => {
            return amount >= state.balance.minPointWithdraw && amount <= state.balance.points && arr.indexOf(amount) === index;
        });

        elements.pointsPresets.innerHTML = presets.map(amount => `
            <button class="points-preset-btn" data-amount="${amount}">${amount.toLocaleString()}</button>
        `).join('');

        elements.pointsPresets.querySelectorAll('.points-preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                elements.withdrawAmount.value = btn.dataset.amount;
                elements.withdrawBtn.disabled = false;
            });
        });
    }

    function renderSalesPanel() {
        if (!elements.salesItemsList || !elements.salesDaysGrid) return;

        const totals = getSalesTotals();

        if (!totals.length) {
            elements.salesItemsList.innerHTML = '<div class="sales-item-card is-empty">Henüz satış yapılmadı</div>';
            elements.salesEmpty.classList.remove('hidden');
            elements.salesDetailContent.classList.add('hidden');
            return;
        }

        if (!state.selectedSalesItemId || !totals.some(item => item.id === state.selectedSalesItemId)) {
            state.selectedSalesItemId = totals[0].id;
        }

        elements.salesItemsList.innerHTML = totals.map(item => `
            <button class="sales-item-card ${item.id === state.selectedSalesItemId ? 'active' : ''}" data-item-id="${item.id}">
                <span class="sales-item-icon">${renderImage(item.image, '📦')}</span>
                <span class="sales-item-name">${item.name}</span>
                <span class="sales-item-total">${item.total}</span>
            </button>
        `).join('');

        elements.salesItemsList.querySelectorAll('.sales-item-card[data-item-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                state.selectedSalesItemId = btn.dataset.itemId;
                renderSalesPanel();
            });
        });

        const selected = getSelectedSalesItem();
        if (!selected) {
            elements.salesEmpty.classList.remove('hidden');
            elements.salesDetailContent.classList.add('hidden');
            return;
        }

        elements.salesEmpty.classList.add('hidden');
        elements.salesDetailContent.classList.remove('hidden');
        elements.salesDetailName.textContent = selected.item.name;
        elements.salesDetailTotal.textContent = selected.total.toLocaleString();
        elements.salesDaysGrid.innerHTML = state.salesData.map(day => `
            <div class="sales-day-card">
                <span class="sales-day-label">${day.label}</span>
                <strong>${(day.items[selected.item.id] || 0).toLocaleString()}</strong>
            </div>
        `).join('');
    }

    function updateTransferButtonState() {
        const canTransfer = !!(state.config && state.config.ownable);
        elements.transferBtn.classList.toggle('disabled', !canTransfer);
        elements.transferBtn.disabled = !canTransfer;
        elements.transferBtn.title = canTransfer ? 'Market Devri' : 'Bu market devredilemez';
    }

    function openSalesPanel() {
        renderSalesPanel();
        elements.salesPanel.classList.remove('hidden');
    }

    function closeSalesPanel() {
        elements.salesPanel.classList.add('hidden');
    }

    function openTransferPanel() {
        if (!state.config) return;

        elements.transferMarketName.textContent = state.config.name;
        elements.transferCurrentOwner.textContent = state.marketOwner || 'Bu marketin sahibi yok.';
        elements.transferOwnerId.value = '';
        elements.transferOwnerName.value = '';
        elements.transferConfirm.value = '';
        elements.transferStatus.classList.add('hidden');
        elements.transferStatus.textContent = '';
        elements.transferSubmit.disabled = !state.config.ownable;

        if (!state.config.ownable) {
            elements.transferStatus.textContent = 'Bu market devredilebilir olarak ayarlanmamış.';
            elements.transferStatus.className = 'transfer-status error';
            elements.transferStatus.classList.remove('hidden');
        }

        elements.transferPanel.classList.remove('hidden');
    }

    function closeTransferPanel() {
        elements.transferPanel.classList.add('hidden');
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
        renderPointsPresets();
        const amount = parseInt(elements.withdrawAmount.value, 10) || 0;
        elements.withdrawBtn.disabled = amount < state.balance.minPointWithdraw || amount > state.balance.points;
    }

    function renderCategories() {
        if (!state.config) return;

        elements.categoriesList.innerHTML = state.config.categories.map(cat => `
            <button class="category-btn ${cat.id === state.selectedCategory ? 'active' : ''}" 
                    data-category="${cat.id}">
                <span class="category-icon">${renderImage(cat.icon, '📁')}</span>
                <span class="category-name">${cat.name}</span>
            </button>
        `).join('');

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

        elements.productsGrid.innerHTML = items.map((item, idx) => `
            <div class="product-card product-sway ${item.hasDiscount ? 'has-discount' : ''}" data-item-id="${item.id}" style="animation-delay:${idx * 60}ms">
                <span class="corner corner-tl"></span>
                <span class="corner corner-tr"></span>
                <span class="corner corner-bl"></span>
                <span class="corner corner-br"></span>
                <div class="card-grid-bg"></div>
                <div class="card-glow"></div>
                ${item.hasDiscount ? '<div class="discount-badge">✨ %5 İNDİRİM</div>' : ''}
                <div class="product-image-wrap" data-detail="${item.id}">
                    <div class="product-halo"></div>
                    <div class="product-pulse-ring"></div>
                    <div class="product-image">${renderImage(item.image, '📦')}</div>
                    <div class="product-detail-hint">DETAY</div>
                </div>
                <div class="product-name">${item.name}</div>
                <div class="product-desc">${item.description}</div>
                <div class="product-price-row">
                    <div class="product-price-wrap">
                        <span class="product-price ${item.hasDiscount ? 'discounted' : ''}">${formatMoney(item.price)}</span>
                        ${item.hasDiscount ? `<span class="product-original-price">${formatMoney(item.originalPrice)}</span>` : ''}
                    </div>
                    <div class="product-qty-selector">
                        <button class="qty-pill-sm active" data-qty="1" data-item-id="${item.id}">1x</button>
                        <button class="qty-pill-sm" data-qty="10" data-item-id="${item.id}">10x</button>
                    </div>
                </div>
                <button class="add-to-cart-full" data-item-id="${item.id}">
                    <span class="atc-icon">🛒</span>
                    <span class="atc-text">SEPETE EKLE</span>
                    <span class="atc-icon">+</span>
                </button>
            </div>
        `).join('');

        // Card body click → open modal (but not on buttons)
        elements.productsGrid.querySelectorAll('.product-image-wrap[data-detail]').forEach(wrap => {
            wrap.addEventListener('click', (e) => {
                e.stopPropagation();
                openItemModal(wrap.dataset.detail);
            });
        });

        elements.productsGrid.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.add-to-cart-full') || e.target.closest('.qty-pill-sm') || e.target.closest('.product-image-wrap')) return;
                openItemModal(card.dataset.itemId);
            });
        });

        // Quantity pill toggling per-card
        elements.productsGrid.querySelectorAll('.qty-pill-sm').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.product-card');
                card.querySelectorAll('.qty-pill-sm').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Full sepete ekle button → use selected qty
        elements.productsGrid.querySelectorAll('.add-to-cart-full').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.product-card');
                const activePill = card.querySelector('.qty-pill-sm.active');
                const qty = activePill ? parseInt(activePill.dataset.qty, 10) : 1;
                addToCart(btn.dataset.itemId, qty);
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

        // Update cart count badge (header pill)
        if (totalItems > 0) {
            elements.cartCount.textContent = totalItems;
            elements.cartCount.classList.remove('hidden');
        } else {
            elements.cartCount.classList.add('hidden');
        }

        // Update header SEPET badge inside drawer
        const headerBadge = document.getElementById('cart-header-badge');
        if (headerBadge) headerBadge.textContent = totalItems;

        // Update cart total
        elements.cartTotalPrice.textContent = formatMoney(totalPrice);

        // Update cart summary (unique count, total qty, earned points)
        const uniqueCount = state.cart.length;
        const pointsRate = (state.balance.pointsPerDollar || 1) * (state.balance.pointsMultiplier || 1);
        const earnedPoints = Math.floor(totalPrice * 0.05 * pointsRate) || Math.floor(totalPrice * 0.05);
        if (elements.cartUniqueCount) elements.cartUniqueCount.textContent = uniqueCount;
        if (elements.cartTotalQty) elements.cartTotalQty.textContent = totalItems;
        if (elements.cartEarnedPoints) elements.cartEarnedPoints.textContent = '+' + earnedPoints.toLocaleString() + ' puan';

        // Update payment-card amounts
        const payCashAmount = document.getElementById('pay-cash-amount');
        const payBankAmount = document.getElementById('pay-bank-amount');
        if (payCashAmount) payCashAmount.textContent = formatMoney(state.balance.cash || 0);
        if (payBankAmount) payBankAmount.textContent = formatMoney(state.balance.bank || 0);

        // Check if can afford
        const canAfford = state.paymentMethod === 'cash' 
            ? state.balance.cash >= totalPrice 
            : state.balance.bank >= totalPrice;
        
        elements.purchaseBtn.disabled = state.cart.length === 0 || !canAfford;
        const purchaseTextEl = elements.purchaseBtn.querySelector('.purchase-text');
        const purchaseLabel = !canAfford && state.cart.length > 0 ? 'YETERSİZ BAKİYE' : 'SATIN AL';
        if (purchaseTextEl) purchaseTextEl.textContent = purchaseLabel;
        else elements.purchaseBtn.textContent = purchaseLabel;

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
            const subtotal = price * cartItem.quantity;
            return `
                <div class="cart-item-v2" data-item-id="${item.id}">
                    <div class="cart-item-image">${renderImage(item.image, '📦')}</div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">${formatMoney(price)} / adet</div>
                    </div>
                    <div class="cart-item-controls-v2">
                        <button class="qty-btn-v2 qty-minus" data-item-id="${item.id}">−</button>
                        <input type="number" class="qty-input" data-item-id="${item.id}" value="${cartItem.quantity}" min="1" />
                        <button class="qty-btn-v2 qty-plus" data-item-id="${item.id}">+</button>
                    </div>
                    <div class="cart-item-subtotal">${formatMoney(subtotal)}</div>
                    <button class="cart-item-trash" data-item-id="${item.id}" title="Sil">🗑️</button>
                </div>
            `;
        }).join('');

        // Event listeners
        elements.cartItems.querySelectorAll('.qty-minus').forEach(btn => {
            btn.addEventListener('click', () => updateQuantity(btn.dataset.itemId, -1));
        });
        elements.cartItems.querySelectorAll('.qty-plus').forEach(btn => {
            btn.addEventListener('click', () => updateQuantity(btn.dataset.itemId, 1));
        });
        elements.cartItems.querySelectorAll('.qty-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const val = parseInt(e.target.value, 10);
                if (isNaN(val) || val <= 0) {
                    removeFromCart(input.dataset.itemId);
                } else {
                    setQuantity(input.dataset.itemId, val);
                }
            });
            input.addEventListener('click', (e) => e.target.select());
        });
        elements.cartItems.querySelectorAll('.cart-item-trash').forEach(btn => {
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
            elements.marketDropdown.querySelectorAll('[data-market-id]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const selected = state.availableMarkets.find(market => market.id === btn.dataset.marketId);
                    if (!selected || selected.id === state.config.id) {
                        elements.marketDropdown.classList.add('hidden');
                        return;
                    }

                    openMarket({
                        config: selected,
                        balance: state.balance,
                        availableMarkets: state.availableMarkets,
                        salesData: state.salesData
                    });
                    elements.marketDropdown.classList.add('hidden');
                });
            });
        }
    }

    // ============================================
    // CART OPERATIONS
    // ============================================
    function addToCart(itemId, qty) {
        const quantity = qty && qty > 0 ? qty : 1;
        const existing = state.cart.find(item => item.itemId === itemId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            state.cart.push({ itemId, quantity });
        }
        renderCart();
        showNotification(quantity > 1 ? `${quantity} ürün sepete eklendi` : 'Ürün sepete eklendi', 'success');
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
    let currentModalQty = 1;
    let pendingPurchaseItems = [];
    let pendingWithdrawAmount = 0;

    function openItemModal(itemId) {
        const item = state.config.items.find(i => i.id === itemId);
        if (!item) return;

        currentModalItem = item;
        currentModalQty = 1;
        const hasDiscount = item.id === state.dailyDiscountItemId;
        const price = hasDiscount ? Math.floor(item.price * 0.95) : item.price;

        elements.modalImage.innerHTML = renderImage(item.image, '📦');
        elements.modalName.textContent = item.name;
        elements.modalDescription.textContent = item.description || '';

        // Detailed description (with fallback)
        const detailedText = item.detailedDescription
            || `${item.name} oyunda çeşitli aktivitelerde kullanılabilir. Envanterinize ekleyerek ihtiyaç duyduğunuzda kullanabilirsiniz.`;
        elements.modalDetailed.textContent = detailedText;

        // Usage info (with fallback)
        const usageText = item.usageInfo
            || 'Bu ürün genel amaçlı kullanım için uygundur. Detaylı bilgi için /help komutunu kullanabilirsiniz.';
        elements.modalUsage.textContent = usageText;

        elements.modalPrice.textContent = formatMoney(price);

        if (hasDiscount) {
            elements.modalOriginalPrice.textContent = formatMoney(item.price);
            elements.modalOriginalPrice.classList.remove('hidden');
        } else {
            elements.modalOriginalPrice.classList.add('hidden');
        }

        // Reset quantity pills
        document.querySelectorAll('.qty-pill').forEach(p => {
            p.classList.toggle('active', parseInt(p.dataset.qty) === 1);
        });

        elements.itemModal.classList.remove('hidden');
    }

    function closeItemModal() {
        elements.itemModal.classList.add('hidden');
        currentModalItem = null;
        currentModalQty = 1;
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
        renderPointsPresets();
        elements.pointsPanel.classList.remove('hidden');
    }

    function closePointsPanel() {
        elements.pointsPanel.classList.add('hidden');
    }

    // ============================================
    // PURCHASE HANDLER
    // ============================================
    let purchaseTimeoutHandle = null;

    function resetPurchaseButton() {
        if (purchaseTimeoutHandle) {
            clearTimeout(purchaseTimeoutHandle);
            purchaseTimeoutHandle = null;
        }
        elements.purchaseBtn.disabled = state.cart.length === 0;
        renderCart();
    }

    async function handlePurchase() {
        if (state.cart.length === 0) return;

        const cartSnapshot = state.cart.map(item => ({ itemId: item.itemId, quantity: item.quantity }));

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
            pendingPurchaseItems = cartSnapshot;
            elements.purchaseBtn.disabled = true;
            elements.purchaseBtn.textContent = 'İşleniyor...';

            // Safety timeout: if server doesn't respond in 12s, reset UI
            if (purchaseTimeoutHandle) clearTimeout(purchaseTimeoutHandle);
            purchaseTimeoutHandle = setTimeout(() => {
                pendingPurchaseItems = [];
                resetPurchaseButton();
                showNotification('Sunucu yanıt vermedi. Lütfen tekrar deneyin.', 'error');
            }, 12000);

            const result = await fetchNUI('purchase', purchaseData);
            if (result && result.success === false) {
                pendingPurchaseItems = [];
                resetPurchaseButton();
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
            recordSales(cartSnapshot);
            
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
            pendingWithdrawAmount = amount;
            const result = await fetchNUI('withdrawPoints', { amount });
            if (result.success === false) {
                pendingWithdrawAmount = 0;
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
        state.availableMarkets = data.availableMarkets || [data.config];
        state.salesData = data.salesData || state.salesData || createEmptySalesData();
        if (!state.salesData.length) {
            state.salesData = createEmptySalesData();
        }
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
        renderSalesPanel();
        updateTransferButtonState();

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
        elements.statsBtn.addEventListener('click', openSalesPanel);
        elements.transferBtn.addEventListener('click', openTransferPanel);
        $('#sales-close').addEventListener('click', closeSalesPanel);
        elements.salesPanel.querySelector('.modal-overlay').addEventListener('click', closeSalesPanel);
        $('#transfer-close').addEventListener('click', closeTransferPanel);
        elements.transferPanel.querySelector('.modal-overlay').addEventListener('click', closeTransferPanel);
        const handleTransferInput = () => {
            const canTransfer = !!(
                state.config &&
                state.config.ownable &&
                elements.transferOwnerId.value.trim() &&
                elements.transferOwnerName.value.trim() &&
                elements.transferConfirm.value.trim().toUpperCase() === 'DEVRET'
            );
            elements.transferSubmit.disabled = !canTransfer;
        };
        elements.transferOwnerId.addEventListener('input', handleTransferInput);
        elements.transferOwnerName.addEventListener('input', handleTransferInput);
        elements.transferConfirm.addEventListener('input', () => {
            elements.transferConfirm.value = elements.transferConfirm.value.toUpperCase();
            handleTransferInput();
        });
        elements.transferSubmit.addEventListener('click', async () => {
            if (elements.transferSubmit.disabled) return;
            const result = await fetchNUI('transferMarket', {
                newOwnerId: elements.transferOwnerId.value.trim(),
                newOwnerName: elements.transferOwnerName.value.trim()
            });
            if (result && result.message && !result.success) {
                elements.transferStatus.textContent = result.message;
                elements.transferStatus.className = 'transfer-status error';
                elements.transferStatus.classList.remove('hidden');
            }
        });

        // Item modal
        $('#modal-close').addEventListener('click', closeItemModal);
        elements.itemModal.querySelector('.modal-overlay').addEventListener('click', closeItemModal);
        elements.modalAddCart.addEventListener('click', () => {
            if (currentModalItem) {
                addToCart(currentModalItem.id, currentModalQty);
                closeItemModal();
            }
        });

        // Quantity pills inside modal
        document.querySelectorAll('.qty-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                currentModalQty = parseInt(pill.dataset.qty) || 1;
                document.querySelectorAll('.qty-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
            });
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
                } else if (!elements.salesPanel.classList.contains('hidden')) {
                    closeSalesPanel();
                } else if (!elements.transferPanel.classList.contains('hidden')) {
                    closeTransferPanel();
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
        if (!data || !data.action) return;

        switch (data.action) {
            case 'openMarket':
                // Support both {config, balance} (new) and {data: {...}} (old) shapes
                if (data.config) {
                    openMarket({
                        config: data.config,
                        balance: data.balance,
                        availableMarkets: data.availableMarkets,
                        salesData: data.salesData
                    });
                } else if (data.data) {
                    const d = data.data;
                    openMarket({
                        config: {
                            id: d.marketId,
                            name: d.name,
                            ownerId: d.ownerId,
                            ownerName: d.ownerName,
                            ownable: d.ownable,
                            items: d.items || [],
                            categories: d.categories || []
                        },
                        balance: d.balance || { cash: 0, bank: 0, points: 0, minPointWithdraw: 500 }
                    });
                }
                break;
            case 'closeMarket':
                closeMarket();
                break;
            case 'updateBalance':
                state.balance = { ...state.balance, ...(data.data || data.balance || {}) };
                renderBalance();
                renderCart();
                break;
            case 'withdrawResult':
                if (data.success) {
                    if (data.balance || data.newBalance) {
                        state.balance = { ...state.balance, ...(data.balance || data.newBalance) };
                    } else if (pendingWithdrawAmount > 0) {
                        state.balance.points -= pendingWithdrawAmount;
                        state.balance.bank += pendingWithdrawAmount;
                    }
                    renderBalance();
                    elements.withdrawAmount.value = '';
                    closePointsPanel();
                }
                pendingWithdrawAmount = 0;
                if (data.message) {
                    showNotification(data.message, data.success ? 'success' : 'error');
                }
                break;
            case 'updateOwner':
                const ownerData = data.data || data;
                state.marketOwner = ownerData.ownerName;
                if (state.config && ownerData.marketId === state.config.id) {
                    state.config.ownerId = ownerData.ownerId;
                    state.config.ownerName = ownerData.ownerName;
                }
                if (state.marketOwner) {
                    elements.marketOwner.querySelector('span').textContent = state.marketOwner;
                    elements.marketOwner.classList.remove('hidden');
                } else {
                    elements.marketOwner.classList.add('hidden');
                }
                if (!elements.transferPanel.classList.contains('hidden')) {
                    elements.transferCurrentOwner.textContent = state.marketOwner || 'Bu marketin sahibi yok.';
                }
                break;
            case 'purchaseResult':
                if (purchaseTimeoutHandle) {
                    clearTimeout(purchaseTimeoutHandle);
                    purchaseTimeoutHandle = null;
                }
                if (data.success) {
                    recordSales(pendingPurchaseItems);
                    if (data.balance || data.newBalance) {
                        state.balance = { ...state.balance, ...(data.balance || data.newBalance) };
                        renderBalance();
                    }
                    clearCart();
                    closeCartDrawer();
                } else {
                    resetPurchaseButton();
                }
                pendingPurchaseItems = [];
                if (data.message) {
                    showNotification(data.message, data.success ? 'success' : 'error');
                }
                break;
            case 'transferResult':
                elements.transferStatus.textContent = data.message || (data.success ? 'Market devredildi.' : 'Market devri başarısız.');
                elements.transferStatus.className = `transfer-status ${data.success ? 'success' : 'error'}`;
                elements.transferStatus.classList.remove('hidden');
                if (data.success) {
                    closeTransferPanel();
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
    });

})();
