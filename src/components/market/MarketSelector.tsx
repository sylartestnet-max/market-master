import { cn } from '@/lib/utils';
import { Store, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MarketSelectorProps {
  currentMarket: string;
  markets: { id: string; name: string }[];
  onSelect: (marketId: string) => void;
}

export const MarketSelector = ({
  currentMarket,
  markets,
  onSelect,
}: MarketSelectorProps) => {
  const current = markets.find(m => m.id === currentMarket);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg",
          "glass border border-secondary/30 neon-glow-purple",
          "hover:bg-secondary/10 transition-colors"
        )}>
          <Store className="w-5 h-5 text-secondary" />
          <span className="font-medium text-foreground truncate max-w-[200px]">
            {current?.name || 'Market Seç'}
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="start" 
        className="w-64 glass-darker border-border/50"
      >
        {markets.map((market) => (
          <DropdownMenuItem
            key={market.id}
            onClick={() => onSelect(market.id)}
            className={cn(
              "cursor-pointer",
              market.id === currentMarket && "bg-primary/20 text-primary"
            )}
          >
            <Store className="w-4 h-4 mr-2" />
            {market.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
