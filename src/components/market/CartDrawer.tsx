import { CartItem, PaymentMethod, PlayerBalance } from '@/types/market';
import { cn } from '@/lib/utils';
import { X, Trash2, ShoppingBag, Minus, Plus, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PaymentSelector } from './PaymentSelector';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  balance: PlayerBalance;
  onPurchase: () => void;
  canAfford: boolean;
}

export const CartDrawer = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onUpdateQuantity,
  totalPrice,
  paymentMethod,
  onPaymentMethodChange,
  balance,
  onPurchase,
  canAfford,
}: CartDrawerProps) => {
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-background/60 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-96 z-50",
          "glass-darker border-l border-primary/30",
          "transition-transform duration-300 ease-out",
          "flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Animated Border */}
        <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-secondary via-accent to-primary animate-pulse" />
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-primary neon-text">Sepet</h2>
            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-sm font-medium">
              {items.length}
            </span>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Cart Items */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ShoppingBag className="w-16 h-16 opacity-30 mb-4" />
                <p>Sepetiniz boş</p>
              </div>
            ) : (
              items.map((cartItem) => (
                <div
                  key={cartItem.item.id}
                  className="flex items-center gap-3 p-3 rounded-lg glass border border-border/50 hover:border-primary/30 transition-colors"
                >
                  {/* Item Icon */}
                  <span className="text-3xl">{cartItem.item.image}</span>
                  
                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">
                      {cartItem.item.name}
                    </h4>
                    <p className="text-sm text-primary">
                      ${cartItem.item.price.toLocaleString()} / adet
                    </p>
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateQuantity(cartItem.item.id, cartItem.quantity - 1)}
                      className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={cartItem.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        onUpdateQuantity(cartItem.item.id, Math.max(1, val));
                      }}
                      className="w-12 text-center font-medium bg-muted/30 border border-border/50 rounded px-1 py-0.5 text-sm focus:border-primary/50 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() => onUpdateQuantity(cartItem.item.id, cartItem.quantity + 1)}
                      className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Subtotal */}
                  <span className="font-bold text-primary min-w-[70px] text-right">
                    ${(cartItem.item.price * cartItem.quantity).toLocaleString()}
                  </span>
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(cartItem.item.id)}
                    className="p-2 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        {/* Footer - Total & Payment */}
        {items.length > 0 && (
          <div className="p-4 border-t border-border/50 space-y-4">
            {/* Total */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/30">
              <span className="text-lg font-medium text-foreground">Toplam</span>
              <span className="text-2xl font-bold text-primary neon-text">
                ${totalPrice.toLocaleString()}
              </span>
            </div>
            
            {/* Payment Method */}
            <PaymentSelector
              selected={paymentMethod}
              onSelect={onPaymentMethodChange}
              balance={balance}
              totalPrice={totalPrice}
            />
            
            {/* Purchase Button */}
            <Button
              onClick={onPurchase}
              disabled={!canAfford || items.length === 0}
              className={cn(
                "w-full py-6 text-lg font-bold gap-3",
                "bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80",
                "text-primary-foreground",
                "transition-all duration-300",
                canAfford && items.length > 0 && "hover:scale-[1.02] hover:neon-glow"
              )}
            >
              <CreditCard className="w-5 h-5" />
              Satın Al
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
