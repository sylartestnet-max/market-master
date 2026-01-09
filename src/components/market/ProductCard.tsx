import { useState, useMemo } from 'react';
import { MarketItem } from '@/types/market';
import { cn } from '@/lib/utils';
import { Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  item: MarketItem;
  onAddToCart: (item: MarketItem, quantity: number) => void;
  onImageClick: (item: MarketItem) => void;
  animationDelay?: number;
}

// Get consistent color variant based on item id
const getColorVariant = (id: string): 'cyan' | 'green' | 'purple' => {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const variants: ('cyan' | 'green' | 'purple')[] = ['cyan', 'green', 'purple'];
  return variants[hash % 3];
};

export const ProductCard = ({ item, onAddToCart, onImageClick, animationDelay = 0 }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState<1 | 10>(1);

  const colorVariant = useMemo(() => getColorVariant(item.id), [item.id]);

  const handleAddToCart = () => {
    onAddToCart(item, selectedQuantity);
  };

  const handleImageClick = () => {
    onImageClick(item);
  };

  const colorClasses = {
    cyan: {
      card: 'card-gradient-cyan hover-glow-cyan',
      border: 'border-primary/40 hover:border-primary',
      text: 'text-primary neon-text',
      price: 'bg-primary/20 text-primary border-primary/50',
      button: 'bg-primary/20 hover:bg-primary/40 text-primary border-primary/50',
    },
    green: {
      card: 'card-gradient-green hover-glow-green',
      border: 'border-accent/40 hover:border-accent',
      text: 'text-accent neon-text-green',
      price: 'bg-accent/20 text-accent border-accent/50',
      button: 'bg-accent/20 hover:bg-accent/40 text-accent border-accent/50',
    },
    purple: {
      card: 'card-gradient-purple hover-glow-purple',
      border: 'border-secondary/40 hover:border-secondary',
      text: 'text-secondary neon-text-purple',
      price: 'bg-secondary/20 text-secondary border-secondary/50',
      button: 'bg-secondary/20 hover:bg-secondary/40 text-secondary border-secondary/50',
    },
  };

  const colors = colorClasses[colorVariant];

  return (
    <div
      className={cn(
        "relative group rounded-xl overflow-hidden transition-all duration-500",
        colors.card,
        colors.border,
        "product-sway",
        isHovered && "scale-105 z-10"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        animationDelay: `${animationDelay * 200}ms`,
      }}
    >
      {/* Discount Badge */}
      {item.hasDiscount && (
        <div className="absolute top-2 right-2 z-10 px-2 py-1 rounded-md bg-destructive text-destructive-foreground text-xs font-bold neon-glow-purple">
          %5 İNDİRİM
        </div>
      )}

      {/* Hover Glow Overlay */}
      <div className={cn(
        "absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none rounded-xl",
        isHovered && "opacity-100"
      )} 
      style={{
        boxShadow: `inset 0 0 30px hsl(var(--neon-${colorVariant}) / 0.15)`
      }}
      />
      
      {/* Content */}
      <div className="relative p-4 flex flex-col gap-3">
        {/* Item Image/Icon - Clickable */}
        <div 
          className="relative flex justify-center py-4 cursor-pointer"
          onClick={handleImageClick}
        >
          <span 
            className={cn(
              "text-6xl transition-all duration-500",
              isHovered && "scale-125"
            )}
            style={{ 
              animationDelay: `${animationDelay * 100}ms`,
              filter: isHovered 
                ? `drop-shadow(0 0 20px hsl(var(--neon-${colorVariant}))) drop-shadow(0 0 40px hsl(var(--neon-${colorVariant}) / 0.5))`
                : 'none',
              transition: 'all 0.5s ease'
            }}
          >
            {item.image}
          </span>
          {/* Click hint */}
          <div className={cn(
            "absolute bottom-0 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-xs",
            colors.price,
            "opacity-0 transition-opacity duration-300",
            isHovered && "opacity-100"
          )}>
            Detay için tıkla
          </div>
        </div>
        
        {/* Item Info */}
        <div className="space-y-1">
          <h4 className={cn(
            "font-bold text-lg transition-all duration-300",
            isHovered ? colors.text : "text-foreground"
          )}>
            {item.name}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        </div>
        
        {/* Price Tag */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "px-3 py-1 rounded-full text-sm font-bold border",
              colors.price
            )}>
              ${item.price.toLocaleString()}
            </div>
            {item.hasDiscount && item.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${item.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          
          {/* Quantity Selector */}
          <div className="flex gap-1">
            <button
              onClick={() => setSelectedQuantity(1)}
              className={cn(
                "px-3 py-1 rounded-lg text-sm font-medium transition-all border",
                selectedQuantity === 1 
                  ? colors.price
                  : "bg-muted/30 border-border text-muted-foreground hover:border-primary/50"
              )}
            >
              1x
            </button>
            <button
              onClick={() => setSelectedQuantity(10)}
              className={cn(
                "px-3 py-1 rounded-lg text-sm font-medium transition-all border",
                selectedQuantity === 10 
                  ? colors.price
                  : "bg-muted/30 border-border text-muted-foreground hover:border-primary/50"
              )}
            >
              10x
            </button>
          </div>
        </div>
        
        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          className={cn(
            "w-full mt-2 gap-2 transition-all duration-300 border",
            colors.button,
            "hover:scale-[1.02]"
          )}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Sepete Ekle</span>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
