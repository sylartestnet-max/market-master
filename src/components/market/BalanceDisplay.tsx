import { PlayerBalance } from '@/types/market';
import { Banknote, Building2, Coins, TrendingUp, ArrowRightLeft, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BalanceDisplayProps {
  balance: PlayerBalance;
  onPointsClick?: () => void;
  onStatsClick?: () => void;
  onTransferClick?: () => void;
  onCartClick?: () => void;
  cartItemCount?: number;
}

export const BalanceDisplay = ({ 
  balance, 
  onPointsClick, 
  onStatsClick, 
  onTransferClick,
  onCartClick,
  cartItemCount = 0,
}: BalanceDisplayProps) => {
  return (
    <div className="flex items-center gap-2">
      {/* Cash */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-primary/30 h-9">
        <Banknote className="w-4 h-4 text-primary" />
        <span className="text-xs text-muted-foreground">Nakit:</span>
        <span className="font-bold text-sm text-primary">
          ${balance.cash.toLocaleString()}
        </span>
      </div>
      
      {/* Bank */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-accent/30 h-9">
        <Building2 className="w-4 h-4 text-accent" />
        <span className="text-xs text-muted-foreground">Banka:</span>
        <span className="font-bold text-sm text-accent">
          ${balance.bank.toLocaleString()}
        </span>
      </div>

      {/* Cart Button - Same size as Cash/Bank */}
      <button
        onClick={onCartClick}
        className={cn(
          "relative flex items-center gap-2 px-3 py-1.5 rounded-lg h-9",
          "bg-primary/20 border border-primary/40 text-primary",
          "hover:bg-primary/30 transition-all duration-200"
        )}
      >
        <ShoppingCart className="w-4 h-4" />
        <span className="text-sm font-medium">Sepet</span>
        {cartItemCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center">
            {cartItemCount}
          </span>
        )}
      </button>

      {/* Separator */}
      <div className="w-px h-6 bg-border/50 mx-1" />

      {/* Points Button */}
      <button
        onClick={onPointsClick}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg h-9",
          "bg-secondary/20 border border-secondary/40 text-secondary",
          "hover:bg-secondary/30 transition-all duration-200"
        )}
        title="Para Puanı"
      >
        <Coins className="w-4 h-4" />
        <span className="text-sm font-medium">{balance.points.toLocaleString()}</span>
      </button>

      {/* Stats Button */}
      <button
        onClick={onStatsClick}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-lg",
          "bg-accent/20 border border-accent/40 text-accent",
          "hover:bg-accent/30 transition-all duration-200"
        )}
        title="Satış İstatistikleri"
      >
        <TrendingUp className="w-4 h-4" />
      </button>

      {/* Transfer Button */}
      <button
        onClick={onTransferClick}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-lg",
          "bg-muted/50 border border-border text-muted-foreground",
          "hover:bg-muted transition-all duration-200"
        )}
        title="Marketi Devret"
      >
        <ArrowRightLeft className="w-4 h-4" />
      </button>
    </div>
  );
};
