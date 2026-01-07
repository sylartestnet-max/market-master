import { useState } from 'react';
import { X, UserCheck, ArrowRightLeft, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MarketTransferPanelProps {
  isOpen: boolean;
  onClose: () => void;
  marketName: string;
  currentOwner?: string;
  onTransfer: (newOwnerId: string, newOwnerName: string) => void;
}

export const MarketTransferPanel = ({
  isOpen,
  onClose,
  marketName,
  currentOwner,
  onTransfer,
}: MarketTransferPanelProps) => {
  const [newOwnerId, setNewOwnerId] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const canTransfer = newOwnerId.trim() && newOwnerName.trim() && confirmText === 'DEVRET';

  const handleTransfer = () => {
    if (canTransfer) {
      onTransfer(newOwnerId.trim(), newOwnerName.trim());
      setNewOwnerId('');
      setNewOwnerName('');
      setConfirmText('');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] z-50 glass-darker rounded-2xl border-2 border-accent/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-accent/10">
          <div className="flex items-center gap-3">
            <ArrowRightLeft className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-bold text-accent">Market Devret</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Market Info */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-sm text-muted-foreground">Devredilecek Market</p>
            <p className="text-lg font-bold text-primary">{marketName}</p>
            {currentOwner && (
              <p className="text-sm text-muted-foreground mt-1">
                Mevcut Sahip: <span className="text-foreground">{currentOwner}</span>
              </p>
            )}
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-destructive">Dikkat!</p>
              <p className="text-muted-foreground mt-1">
                Market devredildiğinde, yeni sahip tüm satışlardan <span className="text-secondary font-bold">%5 bonus puan</span> kazanacaktır.
              </p>
            </div>
          </div>

          {/* New Owner ID */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Yeni Sahip ID
            </label>
            <Input
              type="text"
              placeholder="Oyuncu ID girin..."
              value={newOwnerId}
              onChange={(e) => setNewOwnerId(e.target.value)}
              className="bg-muted/30 border-border/50 focus:border-accent/50"
            />
          </div>

          {/* New Owner Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Yeni Sahip Adı
            </label>
            <Input
              type="text"
              placeholder="Oyuncu adını girin..."
              value={newOwnerName}
              onChange={(e) => setNewOwnerName(e.target.value)}
              className="bg-muted/30 border-border/50 focus:border-accent/50"
            />
          </div>

          {/* Confirmation */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Onaylamak için <span className="text-accent font-bold">DEVRET</span> yazın
            </label>
            <Input
              type="text"
              placeholder="DEVRET"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              className="bg-muted/30 border-border/50 focus:border-accent/50"
            />
          </div>

          {/* Transfer Button */}
          <Button
            onClick={handleTransfer}
            disabled={!canTransfer}
            className={cn(
              "w-full py-6 text-lg font-bold gap-3",
              "bg-gradient-to-r from-accent to-secondary hover:from-accent/80 hover:to-secondary/80",
              "text-accent-foreground",
              "transition-all duration-300",
              canTransfer && "hover:scale-[1.02] hover:neon-glow-purple"
            )}
          >
            <UserCheck className="w-5 h-5" />
            Marketi Devret
          </Button>
        </div>
      </div>
    </>
  );
};
