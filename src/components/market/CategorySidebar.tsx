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
    <div className="w-52 flex flex-col gap-2 p-4 holo-frame relative">
      {/* Tech Grid Background */}
      <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none" />
      
      {/* Header */}
      <div className="relative mb-3">
        <h3 className="text-xs font-bold text-primary uppercase tracking-[0.3em] px-2 neon-text">
          KATEGORİLER
        </h3>
        <div className="mt-2 h-px bg-gradient-to-r from-primary/60 via-primary/20 to-transparent" />
      </div>
      
      {categories.map((category, index) => {
        const isActive = selectedCategory === category.id;
        
        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "relative flex items-center gap-3 px-4 py-3 transition-all duration-300",
              "hover:bg-primary/10 group",
              isActive && "bg-primary/15"
            )}
            style={{
              clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
              animationDelay: `${index * 100}ms`,
            }}
          >
            {/* Active indicator line */}
            <div className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-primary transition-all duration-300",
              isActive && "h-8 neon-glow",
              "group-hover:h-4"
            )} />

            {/* Corner accents */}
            <div className={cn(
              "absolute top-0 right-0 w-3 h-3 border-t border-r transition-all duration-300",
              isActive ? "border-primary/80" : "border-transparent group-hover:border-primary/40"
            )} />
            <div className={cn(
              "absolute bottom-0 left-0 w-3 h-3 border-b border-l transition-all duration-300",
              isActive ? "border-primary/80" : "border-transparent group-hover:border-primary/40"
            )} />

            <span className={cn(
              "text-2xl transition-all duration-300",
              isActive && "scale-110",
              "group-hover:scale-105"
            )}
            style={{
              filter: isActive 
                ? 'drop-shadow(0 0 8px hsl(var(--neon-cyan)))' 
                : 'none'
            }}
            >
              {category.icon}
            </span>
            
            <span className={cn(
              "font-medium tracking-wide transition-all duration-300",
              isActive ? "text-primary neon-text" : "text-foreground/80 group-hover:text-foreground"
            )}>
              {category.name}
            </span>

            {/* Scan line on active */}
            {isActive && (
              <div className="absolute inset-0 scan-line pointer-events-none" />
            )}
          </button>
        );
      })}

      {/* Bottom decoration */}
      <div className="mt-auto pt-4">
        <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="flex justify-center gap-1 mt-3">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary/40"
              style={{
                animation: `pulse-glow-cyan 2s ease-in-out infinite ${i * 0.2}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
