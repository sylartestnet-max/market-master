import { useState } from 'react';
import { useMarket } from '@/hooks/useMarket';
import { useCart } from '@/hooks/useCart';
import { cn } from '@/lib/utils';
import { ShoppingCart, X } from 'lucide-react';

import { BalanceDisplay } from './BalanceDisplay';
import { CategorySidebar } from './CategorySidebar';
import { ProductGrid } from './ProductGrid';
import { CartDrawer } from './CartDrawer';
import { NotificationToast } from './NotificationToast';
import { MarketSelector } from './MarketSelector';
import { ScrollArea } from '@/components/ui/scroll-area';

export const MarketUI = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const {
    config,
    balance,
    selectedCategory,
    setSelectedCategory,
    filteredItems,
    handlePurchase,
    notification,
    canAfford,
    switchMarket,
    availableMarkets,
    closeMarket,
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

  const handlePurchaseClick = () => {
    const cartData = getCartData();
    const success = handlePurchase(
      cartData.items,
      cartData.paymentMethod,
      cartData.totalPrice
    );
    
    if (success) {
      clearCart();
      setIsCartOpen(false);
    }
  };

  const isAffordable = canAfford(totalPrice, paymentMethod);

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-background/50 backdrop-blur-sm">
      {/* Main Container with Animated Border */}
      <div className="relative w-full max-w-7xl h-[85vh] rounded-2xl overflow-hidden animated-border">
        {/* Inner Container */}
        <div className="absolute inset-[2px] rounded-2xl glass-darker flex flex-col overflow-hidden">
          {/* Header Bar */}
          <header className="flex items-center justify-between p-4 border-b border-border/50">
            {/* Left: Market Selector */}
            <MarketSelector
              currentMarket={config.id}
              markets={availableMarkets}
              onSelect={switchMarket}
            />
            
            {/* Center: Market Name */}
            <h1 className="text-2xl font-bold text-foreground">
              <span className="text-primary neon-text">{config.name}</span>
            </h1>
            
            {/* Right: Balance & Cart */}
            <div className="flex items-center gap-4">
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
          
          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Category Sidebar */}
            <div className="p-4">
              <CategorySidebar
                categories={config.categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>
            
            {/* Product Grid */}
            <ScrollArea className="flex-1">
              <ProductGrid
                items={filteredItems}
                onAddToCart={addItem}
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
