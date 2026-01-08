import { useState, useMemo, useEffect } from 'react';
import { useMarket } from '@/hooks/useMarket';
import { useCart } from '@/hooks/useCart';
import { useSalesData } from '@/hooks/useSalesData';
import { cn } from '@/lib/utils';
import { ShoppingCart, X, Percent } from 'lucide-react';
import { MarketItem } from '@/types/market';

import { BalanceDisplay } from './BalanceDisplay';
import { CategorySidebar } from './CategorySidebar';
import { ProductGrid } from './ProductGrid';
import { CartDrawer } from './CartDrawer';
import { NotificationToast } from './NotificationToast';
import { MarketSelector } from './MarketSelector';
import { SearchBar } from './SearchBar';
import { PointsPanel } from './PointsPanel';
import { ItemDetailModal } from './ItemDetailModal';
import { SalesChart } from './SalesChart';
import { MarketTransferPanel } from './MarketTransferPanel';
import { ScrollArea } from '@/components/ui/scroll-area';

export const MarketUI = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPointsPanelOpen, setIsPointsPanelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isSalesChartOpen, setIsSalesChartOpen] = useState(false);
  const [isTransferPanelOpen, setIsTransferPanelOpen] = useState(false);
  
  const {
    config,
    balance,
    setBalance,
    selectedCategory,
    setSelectedCategory,
    filteredItems,
    handlePurchase,
    notification,
    canAfford,
    switchMarket,
    availableMarkets,
    closeMarket,
    showNotification,
    transferMarket,
    marketOwner,
  } = useMarket();
  
  const {
    items: cartItems,
    paymentMethod,
    setPaymentMethod,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalPrice,
    totalItems,
    getCartData,
  } = useCart();

  const { salesData, itemNames, recordSale } = useSalesData();

  // Daily discount item - random item with 5% discount
  const [dailyDiscountItemId, setDailyDiscountItemId] = useState<string | null>(null);
  
  useEffect(() => {
    // Select random daily discount item
    if (config.items.length > 0) {
      const randomIndex = Math.floor(Math.random() * config.items.length);
      setDailyDiscountItemId(config.items[randomIndex].id);
    }
  }, [config.id]); // Reset when market changes

  // Apply discount to items
  const itemsWithDiscount = useMemo(() => {
    return config.items.map(item => ({
      ...item,
      originalPrice: item.price,
      price: item.id === dailyDiscountItemId ? Math.floor(item.price * 0.95) : item.price,
      hasDiscount: item.id === dailyDiscountItemId,
    }));
  }, [config.items, dailyDiscountItemId]);

  // Filter items by search query and category
  const displayItems = useMemo(() => {
    let items = itemsWithDiscount;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    } else {
      items = items.filter(item => item.category === selectedCategory);
    }
    
    return items;
  }, [itemsWithDiscount, searchQuery, selectedCategory]);

  const handlePurchaseClick = () => {
    const cartData = getCartData();
    const success = handlePurchase(
      cartData.items,
      cartData.paymentMethod,
      cartData.totalPrice
    );
    
    if (success) {
      // Record sales
      cartData.items.forEach(item => {
        const marketItem = config.items.find(i => i.id === item.itemId);
        if (marketItem) {
          recordSale(item.itemId, marketItem.name, item.quantity);
        }
      });

      // Calculate points earned (5% of total)
      const pointsEarned = Math.floor(cartData.totalPrice * 0.05);
      if (pointsEarned > 0) {
        setBalance(prev => ({
          ...prev,
          points: prev.points + pointsEarned
        }));
        showNotification(`+${pointsEarned} puan kazandınız!`, 'success');
      }
      
      clearCart();
      setIsCartOpen(false);
    }
  };

  const handlePointsWithdraw = (amount: number) => {
    if (amount <= balance.points && amount >= balance.minPointWithdraw) {
      setBalance(prev => ({
        ...prev,
        points: prev.points - amount,
        bank: prev.bank + amount
      }));
      showNotification(`${amount.toLocaleString()} puan bankaya aktarıldı!`, 'success');
      setIsPointsPanelOpen(false);
    }
  };

  const handleImageClick = (item: MarketItem) => {
    setSelectedItem(item);
    setIsItemModalOpen(true);
  };

  const handleMarketTransfer = (newOwnerId: string, newOwnerName: string) => {
    transferMarket(newOwnerId, newOwnerName);
    showNotification(`Market ${newOwnerName} kişisine devredildi!`, 'success');
    setIsTransferPanelOpen(false);
  };

  const isAffordable = canAfford(totalPrice, paymentMethod);

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-background/50 backdrop-blur-sm">
      {/* Main Container with Animated Border */}
      <div className="relative w-full max-w-7xl h-[85vh] rounded-2xl overflow-hidden animated-border">
        {/* Inner Container */}
        <div className="absolute inset-[4px] rounded-2xl glass-darker flex flex-col overflow-hidden">
          {/* Header Bar */}
          <header className="flex items-center justify-between p-4 border-b-2 border-border/50">
            {/* Left: Market Selector */}
            <MarketSelector
              currentMarket={config.id}
              markets={availableMarkets}
              onSelect={switchMarket}
            />
            
            {/* Center: Market Name & Owner */}
            <div className="flex flex-col items-center gap-1">
              <h1 className="text-2xl font-bold text-foreground">
                <span className="text-primary neon-text">{config.name}</span>
              </h1>
              {marketOwner && (
                <p className="text-xs text-muted-foreground">
                  Sahip: <span className="text-secondary">{marketOwner}</span>
                </p>
              )}
            </div>
            
            {/* Right: Balance & Cart */}
            <div className="flex items-center gap-4">
              {/* Daily Discount Badge */}
              {dailyDiscountItemId && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/20 border border-destructive/40 text-destructive">
                  <Percent className="w-4 h-4" />
                  <span className="text-sm font-medium">Günün İndirimi: %5</span>
                </div>
              )}

              <BalanceDisplay 
                balance={balance} 
                onPointsClick={() => setIsPointsPanelOpen(true)}
                onStatsClick={() => setIsSalesChartOpen(true)}
                onTransferClick={() => setIsTransferPanelOpen(true)}
              />
              
              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 rounded-lg",
                  "bg-primary/20 border border-primary/50 text-primary",
                  "hover:bg-primary/30 transition-all duration-300"
                )}
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="font-medium">Sepet</span>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
              
              {/* Close Button (for FiveM) */}
              <button
                onClick={closeMarket}
                className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                title="Marketi Kapat"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </header>
          
          {/* Search Bar - Below Header */}
          <div className="px-4 py-3 border-b border-border/30">
            <div className="max-w-md mx-auto">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Ürün ara... (isim veya açıklama)"
              />
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Category Sidebar */}
            <div className="p-4 border-r-2 border-border/30">
              <CategorySidebar
                categories={config.categories}
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  setSearchQuery(''); // Clear search when changing category
                }}
              />
            </div>
            
            {/* Product Grid */}
            <ScrollArea className="flex-1">
              <ProductGrid
                items={displayItems}
                onAddToCart={addItem}
                onImageClick={handleImageClick}
              />
            </ScrollArea>
          </div>
        </div>
      </div>
      
      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={removeItem}
        onUpdateQuantity={updateQuantity}
        totalPrice={totalPrice}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        balance={balance}
        onPurchase={handlePurchaseClick}
        canAfford={isAffordable}
      />
      
      {/* Points Panel */}
      <PointsPanel
        isOpen={isPointsPanelOpen}
        onClose={() => setIsPointsPanelOpen(false)}
        points={balance.points}
        minWithdraw={balance.minPointWithdraw}
        onWithdraw={handlePointsWithdraw}
      />
      
      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onAddToCart={addItem}
      />

      {/* Sales Chart */}
      <SalesChart
        isOpen={isSalesChartOpen}
        onClose={() => setIsSalesChartOpen(false)}
        salesData={salesData}
        itemNames={itemNames}
      />

      {/* Market Transfer Panel */}
      <MarketTransferPanel
        isOpen={isTransferPanelOpen}
        onClose={() => setIsTransferPanelOpen(false)}
        marketName={config.name}
        currentOwner={marketOwner}
        onTransfer={handleMarketTransfer}
      />
      
      {/* Notification Toast */}
      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          isVisible={!!notification}
        />
      )}
    </div>
  );
};
