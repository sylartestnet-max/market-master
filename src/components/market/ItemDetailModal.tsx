import { cn } from '@/lib/utils';
import { ShoppingCart, Plus, Info, Wrench } from 'lucide-react';
import { MarketItem } from '@/types/market';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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

  if (!item) return null;

  const handleAddToCart = () => {
    onAddToCart(item, selectedQuantity);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className={cn(
          "w-[90vw] max-w-lg rounded-2xl p-6",
          "glass-darker border-2 border-primary/30 animated-border",
          "shadow-none",
          "max-h-[85vh] overflow-auto"
        )}
      >
        {/* Item Image - Large */}
        <div className="flex justify-center py-8 mb-4">
          <span
            className="text-9xl floating"
            style={{
              filter: 'drop-shadow(0 0 30px hsl(var(--primary) / 0.5))',
            }}
          >
            {item.image}
          </span>
        </div>

        {/* Item Info */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-primary neon-text mb-2">{item.name}</h2>
          <p className="text-muted-foreground">{item.description}</p>
        </div>

        {/* Detailed Info Sections */}
        <div className="space-y-3 mb-6">
          {/* What it does */}
          <div className={cn("p-4 rounded-xl", "bg-muted/20 border border-border/50")}>
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Ne İşe Yarar?</span>
            </div>
            <p className="text-sm text-foreground">
              {item.detailedDescription ||
                `${item.name} oyunda çeşitli aktivitelerde kullanılabilir. Envanterinize ekleyerek ihtiyaç duyduğunuzda kullanabilirsiniz.`}
            </p>
          </div>

          {/* Where to use */}
          <div className={cn("p-4 rounded-xl", "bg-muted/20 border border-border/50")}>
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">Nerede Kullanılır?</span>
            </div>
            <p className="text-sm text-foreground">
              {item.usageInfo || `Bu ürün genel amaçlı kullanım için uygundur. Detaylı bilgi için /help komutunu kullanabilirsiniz.`}
            </p>
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between gap-4">
          {/* Price */}
          <div
            className={cn(
              "px-4 py-2 rounded-lg text-lg font-bold",
              "bg-primary/20 text-primary border border-primary/40",
              "pulse-glow"
            )}
          >
            ${item.price.toLocaleString()}
          </div>

          {/* Quantity Selector */}
          <div className="flex gap-1">
            <button
              onClick={() => setSelectedQuantity(1)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
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
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                "border",
                selectedQuantity === 10
                  ? "bg-primary/30 border-primary text-primary"
                  : "bg-muted/30 border-border text-muted-foreground hover:border-primary/50"
              )}
            >
              10x
            </button>
          </div>

          {/* Add to Cart */}
          <Button
            onClick={handleAddToCart}
            className={cn(
              "gap-2 transition-all duration-300",
              "bg-primary/20 hover:bg-primary/40 text-primary border border-primary/50",
              "hover:neon-glow hover:scale-105"
            )}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Sepete Ekle</span>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

