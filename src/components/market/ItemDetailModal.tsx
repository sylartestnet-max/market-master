import { cn } from '@/lib/utils';
import { ShoppingCart, Plus, Info, Wrench, Zap } from 'lucide-react';
import { MarketItem } from '@/types/market';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ItemDetailModalProps {
  item: MarketItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MarketItem, quantity: number) => void;
}

export const ItemDetailModal = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
}: ItemDetailModalProps) => {
  const [selectedQuantity, setSelectedQuantity] = useState<1 | 10>(1);

  if (!item || !isOpen) return null;

  const handleAddToCart = () => {
    onAddToCart(item, selectedQuantity);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
      onClick={handleBackdropClick}
    >
      {/* Tech Grid Background */}
      <div className="absolute inset-0 tech-grid opacity-5 pointer-events-none" />
      
      {/* Modal Container */}
      <div
        className={cn(
          "relative w-full max-w-lg",
          "animate-scale-in"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Holographic Frame */}
        <div className="hex-frame data-stream pulse-ring">
          {/* Corner Decorations */}
          <div className="absolute -top-1 -left-1 w-6 h-6 border-l-2 border-t-2 border-primary" />
          <div className="absolute -top-1 -right-1 w-6 h-6 border-r-2 border-t-2 border-secondary" />
          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-2 border-b-2 border-accent" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-2 border-b-2 border-primary" />
          
          {/* Scan Line */}
          <div className="absolute inset-0 scan-line pointer-events-none rounded-xl overflow-hidden" />
          
          {/* Inner Content */}
          <div 
            className="relative glass-darker p-6 max-h-[80vh] overflow-auto"
            style={{
              clipPath: 'polygon(0 12px, 12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px))',
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className={cn(
                "absolute top-3 right-3 p-2 z-10",
                "text-muted-foreground hover:text-destructive",
                "transition-all duration-300 glitch-hover",
                "hover:bg-destructive/20 rounded"
              )}
              style={{
                clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)',
              }}
            >
              <span className="text-xl font-bold">✕</span>
            </button>

            {/* Item Image - Large with Holographic Ring */}
            <div className="flex justify-center py-6 mb-4 relative">
              {/* Rotating Ring */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div 
                  className="w-40 h-40 rounded-full border-2 border-dashed border-primary/30 animate-spin"
                  style={{ animationDuration: '20s' }}
                />
                <div 
                  className="absolute w-32 h-32 rounded-full border border-secondary/20 animate-spin"
                  style={{ animationDuration: '15s', animationDirection: 'reverse' }}
                />
              </div>
              
              <span
                className="text-8xl space-float relative z-10"
                style={{
                  filter: 'drop-shadow(0 0 40px hsl(var(--primary) / 0.6))',
                }}
              >
                {item.image}
              </span>
            </div>

            {/* Item Info */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-primary neon-text mb-2 tracking-wide">
                {item.name}
              </h2>
              <p className="text-muted-foreground text-sm">{item.description}</p>
            </div>

            {/* Detailed Info Sections with Space Theme */}
            <div className="space-y-3 mb-6">
              {/* What it does */}
              <div 
                className="relative p-4 bracket-frame"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--accent) / 0.1), transparent)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-accent" />
                  <span className="text-sm font-bold text-accent tracking-wider uppercase">Ne İşe Yarar?</span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {item.detailedDescription ||
                    `${item.name} oyunda çeşitli aktivitelerde kullanılabilir. Envanterinize ekleyerek ihtiyaç duyduğunuzda kullanabilirsiniz.`}
                </p>
              </div>

              {/* Where to use */}
              <div 
                className="relative p-4 bracket-frame"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--secondary) / 0.1), transparent)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-bold text-secondary tracking-wider uppercase">Nerede Kullanılır?</span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {item.usageInfo || `Bu ürün genel amaçlı kullanım için uygundur. Detaylı bilgi için /help komutunu kullanabilirsiniz.`}
                </p>
              </div>
            </div>

            {/* Price and Actions */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Price with Glow */}
              <div
                className={cn(
                  "px-4 py-2 text-lg font-bold",
                  "bg-gradient-to-r from-primary/20 to-accent/20",
                  "text-primary border border-primary/50",
                  "pulse-glow"
                )}
                style={{
                  clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
                }}
              >
                <Zap className="inline w-4 h-4 mr-1" />
                ${item.price.toLocaleString()}
              </div>

              {/* Quantity Selector */}
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedQuantity(1)}
                  className={cn(
                    "px-4 py-2 text-sm font-bold transition-all duration-300",
                    selectedQuantity === 1
                      ? "bg-primary/30 border-2 border-primary text-primary neon-text"
                      : "bg-muted/20 border border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary"
                  )}
                  style={{
                    clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)',
                  }}
                >
                  1x
                </button>
                <button
                  onClick={() => setSelectedQuantity(10)}
                  className={cn(
                    "px-4 py-2 text-sm font-bold transition-all duration-300",
                    selectedQuantity === 10
                      ? "bg-primary/30 border-2 border-primary text-primary neon-text"
                      : "bg-muted/20 border border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary"
                  )}
                  style={{
                    clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)',
                  }}
                >
                  10x
                </button>
              </div>

              {/* Add to Cart */}
              <Button
                onClick={handleAddToCart}
                className={cn(
                  "gap-2 font-bold tracking-wide",
                  "bg-gradient-to-r from-primary/30 to-secondary/30",
                  "hover:from-primary/50 hover:to-secondary/50",
                  "text-primary border border-primary/50",
                  "transition-all duration-300",
                  "hover:scale-105 glitch-hover"
                )}
                style={{
                  clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
                }}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Sepete Ekle</span>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
