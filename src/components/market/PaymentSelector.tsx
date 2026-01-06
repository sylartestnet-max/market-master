import { PaymentMethod, PlayerBalance } from '@/types/market';
import { cn } from '@/lib/utils';
import { Banknote, Building2 } from 'lucide-react';

interface PaymentSelectorProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  balance: PlayerBalance;
  totalPrice: number;
}

export const PaymentSelector = ({
  selected,
  onSelect,
  balance,
  totalPrice,
}: PaymentSelectorProps) => {
  const canPayCash = balance.cash >= totalPrice;
  const canPayBank = balance.bank >= totalPrice;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">
        Ödeme Yöntemi
      </label>
      
      <div className="flex gap-2">
        {/* Cash Option */}
        <button
          onClick={() => onSelect('cash')}
          disabled={!canPayCash}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg",
            "border transition-all duration-300",
            selected === 'cash' && canPayCash
              ? "bg-primary/20 border-primary text-primary neon-glow"
              : "bg-muted/20 border-border text-muted-foreground",
            !canPayCash && "opacity-50 cursor-not-allowed",
            canPayCash && selected !== 'cash' && "hover:border-primary/50 hover:bg-primary/10"
          )}
        >
          <Banknote className="w-5 h-5" />
          <div className="flex flex-col items-start">
            <span className="font-medium">Nakit</span>
            <span className="text-xs opacity-70">
              ${balance.cash.toLocaleString()}
            </span>
          </div>
        </button>
        
        {/* Bank Option */}
        <button
          onClick={() => onSelect('bank')}
          disabled={!canPayBank}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg",
            "border transition-all duration-300",
            selected === 'bank' && canPayBank
              ? "bg-accent/20 border-accent text-accent neon-glow-blue"
              : "bg-muted/20 border-border text-muted-foreground",
            !canPayBank && "opacity-50 cursor-not-allowed",
            canPayBank && selected !== 'bank' && "hover:border-accent/50 hover:bg-accent/10"
          )}
        >
          <Building2 className="w-5 h-5" />
          <div className="flex flex-col items-start">
            <span className="font-medium">Banka</span>
            <span className="text-xs opacity-70">
              ${balance.bank.toLocaleString()}
            </span>
          </div>
        </button>
      </div>
      
      {!canPayCash && !canPayBank && (
        <p className="text-xs text-destructive text-center">
          ⚠️ Yetersiz bakiye! Toplam: ${totalPrice.toLocaleString()}
        </p>
      )}
    </div>
  );
};
