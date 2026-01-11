import { useState } from 'react';
import { MarketItem } from '@/types/market';
import { cn } from '@/lib/utils';
import { Plus, ShoppingCart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  item: MarketItem;
  onAddToCart: (item: MarketItem, quantity: number) => void;
  onImageClick: (item: MarketItem) => void;
  animationDelay?: number;
}

export const ProductCard = ({ item, onAddToCart, onImageClick, animationDelay = 0 }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState<1 | 10>(1);

  // Only discounted items get purple, all others get cyan
  const colorVariant = item.hasDiscount ? 'purple' : 'cyan';

  const colorClasses = {
    cyan: {
      card: 'card-gradient-cyan hover-glow-cyan',
      border: 'border-primary/40 hover:border-primary',
      text: 'text-primary neon-text',
      price: 'bg-primary/20 text-primary border-primary/50',
      button: 'bg-primary/20 hover:bg-primary/40 text-primary border-primary/50',
      glow: 'neon-cyan',
    },
    purple: {
      card: 'card-gradient-purple hover-glow-purple',
      border: 'border-secondary/40 hover:border-secondary',
      text: 'text-secondary neon-text-purple',
      price: 'bg-secondary/20 text-secondary border-secondary/50',
      button: 'bg-secondary/20 hover:bg-secondary/40 text-secondary border-secondary/50',
      glow: 'neon-purple',
    },
  };

  const colors = colorClasses[colorVariant];

  const handleAddToCart = () => {
    onAddToCart(item, selectedQuantity);
  };

  const handleImageClick = () => {
    onImageClick(item);
  };

  return (
    <div
      className={cn(
        "relative group overflow-hidden transition-all duration-500",
        "hex-frame scan-line data-stream",
        colors.card,
        "product-sway",
        isHovered && "scale-105 z-10"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        animationDelay: `${animationDelay * 200}ms`,
        perspective: '1000px',
      }}
    >
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/60 transition-all duration-300 group-hover:w-8 group-hover:h-8 group-hover:border-primary" />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/60 transition-all duration-300 group-hover:w-8 group-hover:h-8 group-hover:border-primary" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/60 transition-all duration-300 group-hover:w-8 group-hover:h-8 group-hover:border-primary" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/60 transition-all duration-300 group-hover:w-8 group-hover:h-8 group-hover:border-primary" />

      {/* Discount Badge */}
      {item.hasDiscount && (
        <div className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-secondary/90 text-secondary-foreground text-xs font-bold flex items-center gap-1.5 neon-glow-purple"
          style={{
            clipPath: 'polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px)',
          }}
        >
          <Sparkles className="w-3 h-3" />
          %5 İNDİRİM
        </div>
      )}

      {/* Hover Glow Overlay */}
      <div className={cn(
        "absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none",
        isHovered && "opacity-100"
      )} 
      style={{
        background: `radial-gradient(circle at center, hsl(var(--${colors.glow}) / 0.15) 0%, transparent 70%)`
      }}
      />

      {/* Tech Grid Background */}
      <div className="absolute inset-0 tech-grid opacity-30 pointer-events-none" />
      
      {/* Content */}
      <div className="relative p-5 flex flex-col gap-4">
        {/* Item Image/Icon - Clickable */}
        <div 
          className="relative flex justify-center py-6 cursor-pointer"
          onClick={handleImageClick}
        >
          {/* Holographic ring behind icon */}
          <div className={cn(
            "absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-500",
            isHovered && "scale-110"
          )}>
            <div className={cn(
              "w-24 h-24 rounded-full border opacity-0 transition-all duration-500",
              isHovered && "opacity-100 pulse-ring",
              colorVariant === 'cyan' ? 'border-primary/40' : 'border-secondary/40'
            )} />
          </div>

          <span 
            className={cn(
              "text-7xl transition-all duration-500 space-float",
              isHovered && "scale-125"
            )}
            style={{ 
              animationDelay: `${animationDelay * 100}ms`,
              filter: isHovered 
                ? `drop-shadow(0 0 25px hsl(var(--${colors.glow}))) drop-shadow(0 0 50px hsl(var(--${colors.glow}) / 0.5))`
                : `drop-shadow(0 0 10px hsl(var(--${colors.glow}) / 0.3))`,
              transition: 'all 0.5s ease'
            }}
          >
            {item.image}
          </span>

          {/* Click hint */}
          <div className={cn(
            "absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-medium tracking-wide",
            colors.price,
            "opacity-0 transition-all duration-300 border",
            isHovered && "opacity-100",
            "backdrop-blur-sm"
          )}
          style={{
            clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
          }}
          >
            DETAY
          </div>
        </div>
        
        {/* Item Info */}
        <div className="space-y-2">
          <h4 className={cn(
            "font-bold text-lg tracking-wide transition-all duration-300",
            isHovered ? colors.text : "text-foreground"
          )}>
            {item.name}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>
        
        {/* Price Tag & Quantity */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "px-4 py-1.5 text-sm font-bold border backdrop-blur-sm",
              colors.price
            )}
            style={{
              clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
            }}
            >
              ${item.price.toLocaleString()}
            </div>
            {item.hasDiscount && item.originalPrice && (
              <span className="text-sm text-muted-foreground line-through opacity-60">
                ${item.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          
          {/* Quantity Selector */}
          <div className="flex gap-1">
            <button
              onClick={() => setSelectedQuantity(1)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium transition-all border",
                selectedQuantity === 1 
                  ? colors.price
                  : "bg-muted/20 border-border text-muted-foreground hover:border-primary/50"
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
                "px-3 py-1.5 text-sm font-medium transition-all border",
                selectedQuantity === 10 
                  ? colors.price
                  : "bg-muted/20 border-border text-muted-foreground hover:border-primary/50"
              )}
              style={{
                clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)',
              }}
            >
              10x
            </button>
          </div>
        </div>
        
        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          className={cn(
            "w-full mt-1 gap-2 transition-all duration-300 border font-semibold tracking-wide",
            colors.button,
            "hover:scale-[1.02] glitch-hover"
          )}
          style={{
            clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)',
          }}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>SEPETE EKLE</span>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
