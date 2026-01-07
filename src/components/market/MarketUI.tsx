import { useState, useMemo } from 'react';
import { useMarket } from '@/hooks/useMarket';
import { useCart } from '@/hooks/useCart';
import { cn } from '@/lib/utils';
import { ShoppingCart, X, Coins } from 'lucide-react';
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
import { ScrollArea } from '@/components/ui/scroll-area';

export const MarketUI = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPointsPanelOpen, setIsPointsPanelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  
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

  // Filter items by search query
  const displayItems = useMemo(() => {
    if (!searchQuery.trim()) return filteredItems;
    
    const query = searchQuery.toLowerCase();
    return config.items.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  }, [filteredItems, searchQuery, config.items]);

  const handlePurchaseClick = () => {
    const cartData = getCartData();
    const success = handlePurchase(
      cartData.items,
      cartData.paymentMethod,
      cartData.totalPrice
    );
    
    if (success) {
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
            
            {/* Center: Market Name & Search */}
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                <span className="text-primary neon-text">{config.name}</span>
              </h1>
            </div>
            
            {/* Right: Balance, Points & Cart */}
            <div className="flex items-center gap-4">
              {/* Points Button */}
              <button
                onClick={() => setIsPointsPanelOpen(true)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg",
                  "bg-secondary/20 border border-secondary/50 text-secondary",
                  "hover:bg-secondary/30 transition-all duration-300",
                  "hover:neon-glow-purple hover:scale-105"
                )}
              >
                <Coins className="w-4 h-4" />
                <span className="font-medium">{balance.points.toLocaleString()}</span>
              </button>
              
              <BalanceDisplay balance={balance} />
              
              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 rounded-lg",
                  "bg-primary/20 border border-primary/50 text-primary",
                  "hover:bg-primary/30 transition-all duration-300",
                  "hover:neon-glow hover:scale-105",
                  totalItems > 0 && "pulse-glow"
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
