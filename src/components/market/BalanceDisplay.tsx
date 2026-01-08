import { PlayerBalance } from '@/types/market';
import { Banknote, Building2, Coins, TrendingUp, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BalanceDisplayProps {
  balance: PlayerBalance;
  onPointsClick?: () => void;
  onStatsClick?: () => void;
  onTransferClick?: () => void;
}

export const BalanceDisplay = ({ 
  balance, 
  onPointsClick, 
  onStatsClick, 
  onTransferClick 
}: BalanceDisplayProps) => {
  return (
    <div className="flex flex-col gap-2">
      {/* Main Balance Row */}
      <div className="flex items-center gap-3">
        {/* Cash */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-primary/30">
          <Banknote className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">Nakit:</span>
          <span className="font-bold text-primary">
            ${balance.cash.toLocaleString()}
          </span>
        </div>
        
        {/* Bank */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-accent/30">
          <Building2 className="w-5 h-5 text-accent" />
          <span className="text-sm text-muted-foreground">Banka:</span>
          <span className="font-bold text-accent">
            ${balance.bank.toLocaleString()}
          </span>
        </div>
      </div>
      
      {/* Action Buttons Row - Below Balance */}
      <div className="flex items-center justify-end gap-2">
        {/* Points Button */}
        <button
          onClick={onPointsClick}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm",
            "bg-secondary/20 border border-secondary/40 text-secondary",
            "hover:bg-secondary/30 transition-all duration-200"
          )}
        >
          <Coins className="w-4 h-4" />
          <span className="font-medium">{balance.points.toLocaleString()}</span>
        </button>

        {/* Stats Button */}
        <button
          onClick={onStatsClick}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm",
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
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm",
            "bg-muted/50 border border-border text-muted-foreground",
            "hover:bg-muted transition-all duration-200"
          )}
          title="Marketi Devret"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
