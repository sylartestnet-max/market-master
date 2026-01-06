import { Category } from '@/types/market';
import { cn } from '@/lib/utils';

interface CategorySidebarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategorySidebar = ({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategorySidebarProps) => {
  return (
    <div className="w-48 flex flex-col gap-2 p-4 glass-darker rounded-xl border border-border/50">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
        Kategoriler
      </h3>
      
      {categories.map((category) => {
        const isActive = selectedCategory === category.id;
        
        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300",
              "hover:bg-primary/10 hover:scale-[1.02]",
              isActive && "bg-primary/20 neon-glow border border-primary/50",
              !isActive && "border border-transparent"
            )}
          >
            <span className="text-2xl">{category.icon}</span>
            <span className={cn(
              "font-medium transition-colors",
              isActive ? "text-primary neon-text" : "text-foreground/80"
            )}>
              {category.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};
