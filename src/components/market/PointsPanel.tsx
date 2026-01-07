import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Coins, ArrowRight, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PointsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  points: number;
  minWithdraw: number;
  onWithdraw: (amount: number) => void;
}

export const PointsPanel = ({ 
  isOpen, 
  onClose, 
  points, 
  minWithdraw, 
  onWithdraw 
}: PointsPanelProps) => {
  const [withdrawAmount, setWithdrawAmount] = useState<number>(minWithdraw);
  
  const canWithdraw = points >= minWithdraw && withdrawAmount >= minWithdraw && withdrawAmount <= points;
  
  const handleWithdraw = () => {
    if (canWithdraw) {
      onWithdraw(withdrawAmount);
    }
  };

  const presetAmounts = [100, 250, 500, 1000].filter(amount => amount <= points);

  return (
    <>
      {/* Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={cn(
        "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
        "w-full max-w-md p-6 rounded-2xl",
        "glass-darker border-2 border-primary/30 animated-border",
        "transition-all duration-300",
        isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Coins className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Para Puanlarım</h3>
              <p className="text-sm text-muted-foreground">Alışverişlerden %5 puan kazan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Points Display */}
        <div className={cn(
          "p-6 rounded-xl mb-6",
          "bg-gradient-to-br from-primary/20 to-secondary/10",
          "border border-primary/30"
        )}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Toplam Puanınız</span>
          </div>
          <p className="text-4xl font-bold text-center text-primary neon-text">
            {points.toLocaleString()}
          </p>
          <p className="text-sm text-center text-muted-foreground mt-2">
            = ${points.toLocaleString()} değerinde
          </p>
        </div>
        
        {/* Minimum Withdraw Info */}
        <div className="p-3 rounded-lg bg-muted/30 border border-border/50 mb-4">
          <p className="text-sm text-muted-foreground text-center">
            Minimum çekim: <span className="text-primary font-bold">{minWithdraw.toLocaleString()} puan</span>
          </p>
        </div>
        
        {/* Withdraw Section */}
        {points >= minWithdraw ? (
          <div className="space-y-4">
            {/* Preset Amounts */}
            {presetAmounts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {presetAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setWithdrawAmount(amount)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-sm font-medium transition-all",
                      "border",
                      withdrawAmount === amount
                        ? "bg-primary/30 border-primary text-primary"
                        : "bg-muted/30 border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    {amount.toLocaleString()}
                  </button>
                ))}
                <button
                  onClick={() => setWithdrawAmount(points)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-sm font-medium transition-all",
                    "border",
                    withdrawAmount === points
                      ? "bg-secondary/30 border-secondary text-secondary"
                      : "bg-muted/30 border-border text-muted-foreground hover:border-secondary/50"
                  )}
                >
                  Tümü
                </button>
              </div>
            )}
            
            {/* Custom Amount Input */}
            <div className="flex gap-2">
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Math.max(0, parseInt(e.target.value) || 0))}
                min={minWithdraw}
                max={points}
                className={cn(
                  "flex-1 px-4 py-2 rounded-lg",
                  "bg-muted/30 border border-border/50",
                  "text-foreground outline-none",
                  "focus:border-primary/50 transition-colors"
                )}
              />
              <Button
                onClick={handleWithdraw}
                disabled={!canWithdraw}
                className={cn(
                  "gap-2",
                  "bg-primary/20 hover:bg-primary/40 text-primary border border-primary/50",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <span>Bankaya Çek</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-center">
            <p className="text-sm text-destructive">
              Çekim yapabilmek için en az {minWithdraw.toLocaleString()} puan biriktirmeniz gerekiyor.
            </p>
          </div>
        )}
      </div>
    </>
  );
};
