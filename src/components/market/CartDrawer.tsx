import { CartItem, PaymentMethod, PlayerBalance } from '@/types/market';
import { cn } from '@/lib/utils';
import { X, Trash2, ShoppingBag, Minus, Plus, CreditCard, Zap } from 'lucide-react';
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
          "fixed inset-0 bg-background/70 backdrop-blur-md z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Drawer with Holographic Frame */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-[400px] z-50",
          "transition-transform duration-300 ease-out",
          "flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Holographic Border Effect */}
        <div className="absolute inset-0 holo-frame data-stream" />
        
        {/* Corner Decorations */}
        <div className="absolute top-2 left-2 w-8 h-8 border-l-2 border-t-2 border-primary z-10" />
        <div className="absolute top-2 right-2 w-8 h-8 border-r-2 border-t-2 border-secondary z-10" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-l-2 border-b-2 border-accent z-10" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-r-2 border-b-2 border-primary z-10" />
        
        {/* Scan Line */}
        <div className="absolute inset-0 scan-line pointer-events-none" />
        
        {/* Inner Container */}
        <div 
          className="relative flex flex-col h-full glass-darker m-1"
          style={{
            clipPath: 'polygon(0 20px, 20px 0, calc(100% - 20px) 0, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0 calc(100% - 20px))',
          }}
        >
          {/* Tech Grid Background */}
          <div className="absolute inset-0 tech-grid opacity-5 pointer-events-none" />
          
          {/* Header */}
          <div className="relative flex items-center justify-between p-4 border-b border-primary/30">
            {/* Decorative Line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="w-6 h-6 text-primary" />
                <div className="absolute inset-0 animate-ping opacity-30">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-primary neon-text tracking-wider">SEPET</h2>
              <span 
                className="px-3 py-0.5 bg-primary/20 text-primary text-sm font-bold border border-primary/50"
                style={{
                  clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)',
                }}
              >
                {items.length}
              </span>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all duration-300 glitch-hover"
              style={{
                clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)',
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Cart Items */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <div className="relative">
                    <ShoppingBag className="w-20 h-20 opacity-20" />
                    <div className="absolute inset-0 pulse-ring opacity-30" />
                  </div>
                  <p className="mt-4 text-sm tracking-wide">SEPET BOŞ</p>
                </div>
              ) : (
                items.map((cartItem, index) => (
                  <div
                    key={cartItem.item.id}
                    className="relative group"
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    {/* Item Card with Bracket Frame */}
                    <div className="bracket-frame p-3 bg-muted/10 hover:bg-primary/5 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        {/* Item Icon */}
                        <div className="relative">
                          <span className="text-3xl">{cartItem.item.image}</span>
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-full h-full pulse-ring" />
                          </div>
                        </div>
                        
                        {/* Item Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-foreground truncate text-sm tracking-wide">
                            {cartItem.item.name}
                          </h4>
                          <p className="text-xs text-primary font-medium">
                            ${cartItem.item.price.toLocaleString()} / adet
                          </p>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onUpdateQuantity(cartItem.item.id, cartItem.quantity - 1)}
                            className="p-1.5 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all duration-300 border border-transparent hover:border-primary/30"
                            style={{
                              clipPath: 'polygon(2px 0, 100% 0, calc(100% - 2px) 100%, 0 100%)',
                            }}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={cartItem.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              onUpdateQuantity(cartItem.item.id, Math.max(1, val));
                            }}
                            className="w-10 text-center font-bold bg-muted/30 border border-primary/30 px-1 py-0.5 text-xs focus:border-primary focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            onClick={() => onUpdateQuantity(cartItem.item.id, cartItem.quantity + 1)}
                            className="p-1.5 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all duration-300 border border-transparent hover:border-primary/30"
                            style={{
                              clipPath: 'polygon(2px 0, 100% 0, calc(100% - 2px) 100%, 0 100%)',
                            }}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        {/* Subtotal */}
                        <span 
                          className="font-bold text-primary text-sm min-w-[60px] text-right px-2 py-1 bg-primary/10 border border-primary/30"
                          style={{
                            clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)',
                          }}
                        >
                          ${(cartItem.item.price * cartItem.quantity).toLocaleString()}
                        </span>
                        
                        {/* Remove Button */}
                        <button
                          onClick={() => onRemoveItem(cartItem.item.id)}
                          className="p-2 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all duration-300 glitch-hover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          
          {/* Footer - Total & Payment */}
          {items.length > 0 && (
            <div className="relative p-4 border-t border-primary/30 space-y-4">
              {/* Decorative Line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              
              {/* Total with Space Theme */}
              <div 
                className="relative p-4 bracket-frame"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--accent) / 0.1))',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground tracking-wide">TOPLAM</span>
                  <span className="text-2xl font-bold text-primary neon-text">
                    <Zap className="inline w-5 h-5 mr-1" />
                    ${totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Points to be earned */}
              <div 
                className="flex items-center justify-between px-4 py-2 border border-secondary/30"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--secondary) / 0.1), transparent)',
                  clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)',
                }}
              >
                <span className="text-xs text-muted-foreground tracking-wide">KAZANILACAK PUAN</span>
                <span className="font-bold text-secondary">
                  +{Math.floor(totalPrice * 0.05).toLocaleString()} puan
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
                  "w-full py-6 text-lg font-bold gap-3 tracking-wider",
                  "bg-gradient-to-r from-primary/40 via-accent/30 to-secondary/40",
                  "hover:from-primary/60 hover:via-accent/50 hover:to-secondary/60",
                  "text-primary-foreground border border-primary/50",
                  "transition-all duration-300",
                  canAfford && items.length > 0 && "hover:scale-[1.02] pulse-glow glitch-hover"
                )}
                style={{
                  clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)',
                }}
              >
                <CreditCard className="w-5 h-5" />
                SATIN AL
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
