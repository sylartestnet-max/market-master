import { useState } from 'react';
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

export const ProductCard = ({ item, onAddToCart, onImageClick, animationDelay = 0 }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState<1 | 10>(1);

  const handleAddToCart = () => {
    onAddToCart(item, selectedQuantity);
  };

  const handleImageClick = () => {
    onImageClick(item);
  };

  return (
    <div
      className={cn(
        "relative group rounded-xl overflow-hidden transition-all duration-300",
        "glass border border-border/50",
        "hover:border-primary/60 hover:scale-105",
        isHovered && "neon-glow"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Animated Border Overlay */}
      <div className={cn(
        "absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none",
        "animated-border rounded-xl",
        isHovered && "opacity-100"
      )} />
      
      {/* Content */}
      <div className="relative p-4 flex flex-col gap-3">
        {/* Item Image/Icon - Clickable */}
        <div 
          className="relative flex justify-center py-4 cursor-pointer"
          onClick={handleImageClick}
        >
          <span 
            className={cn(
              "text-6xl transition-all duration-300",
              isHovered ? "scale-110" : "floating"
            )}
            style={{ 
              animationDelay: `${animationDelay * 100}ms`,
              filter: isHovered ? 'drop-shadow(0 0 20px hsl(var(--primary)))' : 'none'
            }}
          >
            {item.image}
          </span>
          {/* Click hint */}
          <div className={cn(
            "absolute bottom-0 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-xs",
            "bg-primary/20 text-primary border border-primary/30",
            "opacity-0 transition-opacity duration-300",
            isHovered && "opacity-100"
          )}>
            Detay için tıkla
          </div>
        </div>
        
        {/* Item Info */}
        <div className="space-y-1">
          <h4 className={cn(
            "font-bold text-lg transition-colors",
            isHovered ? "text-primary neon-text" : "text-foreground"
          )}>
            {item.name}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        </div>
        
        {/* Price Tag */}
        <div className="flex items-center justify-between">
          <div className={cn(
            "px-3 py-1 rounded-full text-sm font-bold",
            "bg-primary/20 text-primary border border-primary/40",
            isHovered && "pulse-glow"
          )}>
            ${item.price.toLocaleString()}
          </div>
          
          {/* Quantity Selector */}
          <div className="flex gap-1">
            <button
              onClick={() => setSelectedQuantity(1)}
              className={cn(
                "px-3 py-1 rounded-lg text-sm font-medium transition-all",
                "border",
                selectedQuantity === 1 
                  ? "bg-primary/30 border-primary text-primary" 
                  : "bg-muted/30 border-border text-muted-foreground hover:border-primary/50"
              )}
            >
              1x
            </button>
            <button
              onClick={() => setSelectedQuantity(10)}
              className={cn(
                "px-3 py-1 rounded-lg text-sm font-medium transition-all",
                "border",
                selectedQuantity === 10 
                  ? "bg-primary/30 border-primary text-primary" 
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
            "w-full mt-2 gap-2 transition-all duration-300",
            "bg-primary/20 hover:bg-primary/40 text-primary border border-primary/50",
            "hover:neon-glow hover:scale-[1.02]"
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
