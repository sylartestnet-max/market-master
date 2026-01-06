import { useState, useCallback, useEffect } from 'react';
import { MarketConfig, PlayerBalance, MarketItem } from '@/types/market';
import { demoMarkets, demoBalance, getDefaultMarket } from '@/config/marketConfig';

export const useMarket = () => {
  const [isOpen, setIsOpen] = useState(true); // Default open for demo
  const [config, setConfig] = useState<MarketConfig>(getDefaultMarket());
  const [balance, setBalance] = useState<PlayerBalance>(demoBalance);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Set default category when config changes
  useEffect(() => {
    if (config.categories.length > 0 && !selectedCategory) {
      setSelectedCategory(config.categories[0].id);
    }
  }, [config, selectedCategory]);

  // Filter items by selected category
  const filteredItems = config.items.filter(
    item => item.category === selectedCategory
  );

  // Open market with specific config
  const openMarket = useCallback((marketId: string) => {
    const marketConfig = demoMarkets[marketId];
    if (marketConfig) {
      setConfig(marketConfig);
      setSelectedCategory(marketConfig.categories[0]?.id || '');
      setIsOpen(true);
    }
  }, []);

  // Close market
  const closeMarket = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Check if player can afford
  const canAfford = useCallback((amount: number, method: 'cash' | 'bank') => {
    return method === 'cash' ? balance.cash >= amount : balance.bank >= amount;
  }, [balance]);

  // Show notification
  const showNotification = useCallback((message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Purchase handler (demo - in real FiveM this would be NUI callback)
  const handlePurchase = useCallback((
    items: { itemId: string; quantity: number }[],
    paymentMethod: 'cash' | 'bank',
    totalPrice: number
  ) => {
    if (!canAfford(totalPrice, paymentMethod)) {
      showNotification('Yetersiz bakiye!', 'error');
      return false;
    }

    // Demo: Update balance
    setBalance(prev => ({
      ...prev,
      [paymentMethod]: prev[paymentMethod] - totalPrice,
    }));

    showNotification(`${items.length} ürün satın alındı! (-$${totalPrice.toLocaleString()})`, 'success');
    return true;
  }, [canAfford, showNotification]);

  // Switch market (for demo)
  const switchMarket = useCallback((marketId: string) => {
    openMarket(marketId);
  }, [openMarket]);

  // Available markets for demo
  const availableMarkets = Object.keys(demoMarkets).map(id => ({
    id,
    name: demoMarkets[id].name,
  }));

  return {
    isOpen,
    config,
    balance,
    selectedCategory,
    setSelectedCategory,
    filteredItems,
    openMarket,
    closeMarket,
    canAfford,
    handlePurchase,
    notification,
    showNotification,
    switchMarket,
    availableMarkets,
  };
};
