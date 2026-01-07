import { MarketItem } from '@/types/market';
import { ProductCard } from './ProductCard';
import { PackageOpen } from 'lucide-react';

interface ProductGridProps {
  items: MarketItem[];
  onAddToCart: (item: MarketItem, quantity: number) => void;
  onImageClick: (item: MarketItem) => void;
}

export const ProductGrid = ({ items, onAddToCart, onImageClick }: ProductGridProps) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground">
        <PackageOpen className="w-16 h-16 opacity-50" />
        <p className="text-lg">Bu kategoride ürün bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {items.map((item, index) => (
        <ProductCard
          key={item.id}
          item={item}
          onAddToCart={onAddToCart}
          onImageClick={onImageClick}
          animationDelay={index * 0.5}
        />
      ))}
    </div>
  );
};
