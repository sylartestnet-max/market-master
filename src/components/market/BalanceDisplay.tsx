import { PlayerBalance } from '@/types/market';
import { Banknote, Building2 } from 'lucide-react';

interface BalanceDisplayProps {
  balance: PlayerBalance;
}

export const BalanceDisplay = ({ balance }: BalanceDisplayProps) => {
  return (
    <div className="flex items-center gap-4">
      {/* Cash */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-primary/30 neon-glow">
        <Banknote className="w-5 h-5 text-primary" />
        <span className="text-sm text-muted-foreground">Nakit:</span>
        <span className="font-bold text-primary neon-text">
          ${balance.cash.toLocaleString()}
        </span>
      </div>
      
      {/* Bank */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-accent/30 neon-glow-blue">
        <Building2 className="w-5 h-5 text-accent" />
        <span className="text-sm text-muted-foreground">Banka:</span>
        <span className="font-bold text-accent neon-text-blue">
          ${balance.bank.toLocaleString()}
        </span>
      </div>
    </div>
  );
};
