import { useState, useCallback, useEffect } from 'react';
import type { MarketConfig, PlayerBalance } from '@/types/market';
import { demoMarkets, demoBalance, getDefaultMarket } from '@/config/marketConfig';
import { fetchNui, isNui } from '@/lib/nui';

export const useMarket = () => {
  const nui = isNui();

  const [isOpen, setIsOpen] = useState(!nui); // FiveM'de default kapalı; web preview'da açık
  const [config, setConfig] = useState<MarketConfig>(getDefaultMarket());
  const [balance, setBalance] = useState<PlayerBalance>(demoBalance);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [marketOwner, setMarketOwner] = useState<string | undefined>(undefined);

  // FiveM -> NUI mesajlarını dinle
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const payload = event.data as any;
      if (!payload?.action) return;

      switch (payload.action) {
        case 'openMarket': {
          const d = payload.data || {};
          const marketConfig: MarketConfig = {
            id: d.marketId,
            name: d.name,
            ownerId: d.ownerId ?? undefined,
            ownerName: d.ownerName ?? undefined,
            categories: Array.isArray(d.categories) ? d.categories : [],
            items: Array.isArray(d.items) ? d.items : [],
          };

          setConfig(marketConfig);
          setSelectedCategory(marketConfig.categories?.[0]?.id || '');
          setMarketOwner(marketConfig.ownerName);

          // FiveM tarafı minPointWithdraw göndermiyor; local default'u koruyoruz
          const incoming = d.balance || {};
          setBalance((prev) => ({
            ...prev,
            cash: incoming.cash ?? prev.cash,
            bank: incoming.bank ?? prev.bank,
            points: incoming.points ?? prev.points,
          }));

          setIsOpen(true);
          break;
        }

        case 'updateBalance': {
          const b = payload.data || {};
          setBalance((prev) => ({
            ...prev,
            cash: b.cash ?? prev.cash,
            bank: b.bank ?? prev.bank,
            points: b.points ?? prev.points,
          }));
          break;
        }

        case 'updateOwner': {
          const o = payload.data || {};
          setConfig((prev) => ({
            ...prev,
            ownerId: o.ownerId ?? prev.ownerId,
            ownerName: o.ownerName ?? prev.ownerName,
          }));
          setMarketOwner(o.ownerName);
          break;
        }

        case 'closeMarket': {
          setIsOpen(false);
          break;
        }
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // Set default category when config changes
  useEffect(() => {
    if (config.categories.length > 0 && !selectedCategory) {
      setSelectedCategory(config.categories[0].id);
    }
    setMarketOwner(config.ownerName);
  }, [config, selectedCategory]);

  // Open market with specific config (web demo)
  const openMarket = useCallback((marketId: string) => {
    const marketConfig = demoMarkets[marketId];
    if (marketConfig) {
      setConfig(marketConfig);
      setSelectedCategory(marketConfig.categories[0]?.id || '');
      setIsOpen(true);
    }
  }, []);

  // Close market
  const closeMarket = useCallback(async () => {
    if (nui) {
      try {
        await fetchNui('closeMarket');
      } catch {
        // ignore
      }
    }
    setIsOpen(false);
  }, [nui]);

  // Check if player can afford
  const canAfford = useCallback(
    (amount: number, method: 'cash' | 'bank') => {
      return method === 'cash' ? balance.cash >= amount : balance.bank >= amount;
    },
    [balance]
  );

  // Show notification
  const showNotification = useCallback((message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Purchase handler
  const handlePurchase = useCallback(
    async (
      items: { itemId: string; quantity: number }[],
      paymentMethod: 'cash' | 'bank',
      totalPrice: number
    ) => {
      if (nui) {
        const result = await fetchNui<{ success?: boolean; message?: string }>('purchase', {
          items,
          paymentMethod,
        });

        if (result?.success) {
          showNotification(result.message || 'Satın alma isteği gönderildi!', 'success');
          return true;
        }

        showNotification(result?.message || 'Satın alma başarısız!', 'error');
        return false;
      }

      // Demo: local balance update
      if (!canAfford(totalPrice, paymentMethod)) {
        showNotification('Yetersiz bakiye!', 'error');
        return false;
      }

      setBalance((prev) => ({
        ...prev,
        [paymentMethod]: prev[paymentMethod] - totalPrice,
      }));

      showNotification(`${items.length} ürün satın alındı! (-$${totalPrice.toLocaleString()})`, 'success');
      return true;
    },
    [canAfford, nui, showNotification]
  );

  // Transfer market to new owner
  const transferMarket = useCallback(
    async (newOwnerId: string, newOwnerName: string) => {
      if (nui) {
        const result = await fetchNui<{ success?: boolean }>('transferMarket', { newOwnerId });
        if (!result?.success) {
          showNotification('Devir başarısız!', 'error');
        }
        return;
      }

      setConfig((prev) => ({
        ...prev,
        ownerId: newOwnerId,
        ownerName: newOwnerName,
      }));
      setMarketOwner(newOwnerName);

      console.log(`Market transferred to ${newOwnerName} (ID: ${newOwnerId})`);
      console.log('New owner will receive 5% bonus points on all sales');
    },
    [nui, showNotification]
  );

  // Switch market (for demo)
  const switchMarket = useCallback(
    (marketId: string) => {
      openMarket(marketId);
    },
    [openMarket]
  );

  // Available markets for demo
  const availableMarkets = Object.keys(demoMarkets).map((id) => ({
    id,
    name: demoMarkets[id].name,
  }));

  return {
    isOpen,
    config,
    balance,
    setBalance,
    selectedCategory,
    setSelectedCategory,
    filteredItems: config.items.filter((item) => item.category === selectedCategory),
    openMarket,
    closeMarket,
    canAfford,
    handlePurchase,
    notification,
    showNotification,
    switchMarket,
    availableMarkets,
    transferMarket,
    marketOwner,
  };
};

