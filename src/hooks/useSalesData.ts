import { useState, useCallback, useMemo } from 'react';
import { DailySales, SaleRecord } from '@/types/market';

// Generate demo sales data for the last 7 days
const generateDemoSalesData = (): DailySales[] => {
  const data: DailySales[] = [];
  const today = new Date();
  
  const demoItems = [
    { id: 'sandwich', name: 'Sandviç' },
    { id: 'burger', name: 'Hamburger' },
    { id: 'water', name: 'Su' },
    { id: 'cola', name: 'Kola' },
    { id: 'bandage', name: 'Bandaj' },
    { id: 'medkit', name: 'İlk Yardım Kiti' },
  ];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const items: { [itemId: string]: number } = {};
    let total = 0;

    // Random sales for each item
    demoItems.forEach(item => {
      const qty = Math.floor(Math.random() * 50) + 5;
      items[item.id] = qty;
      total += qty;
    });

    data.push({ date: dateStr, items, total });
  }

  return data;
};

export const useSalesData = () => {
  const [salesData, setSalesData] = useState<DailySales[]>(generateDemoSalesData());

  // Item names mapping
  const itemNames = useMemo(() => ({
    sandwich: 'Sandviç',
    burger: 'Hamburger',
    water: 'Su',
    cola: 'Kola',
    bandage: 'Bandaj',
    medkit: 'İlk Yardım Kiti',
    chips: 'Cips',
    energy_drink: 'Enerji İçeceği',
    pistol_ammo: 'Tabanca Mermisi',
    rifle_ammo: 'Tüfek Mermisi',
    aspirin: 'Aspirin',
    vitamins: 'Vitamin',
  }), []);

  // Record a sale
  const recordSale = useCallback((itemId: string, itemName: string, quantity: number) => {
    const today = new Date().toISOString().split('T')[0];
    
    setSalesData(prev => {
      const existingDayIndex = prev.findIndex(d => d.date === today);
      
      if (existingDayIndex >= 0) {
        const updated = [...prev];
        const day = { ...updated[existingDayIndex] };
        day.items = { ...day.items };
        day.items[itemId] = (day.items[itemId] || 0) + quantity;
        day.total += quantity;
        updated[existingDayIndex] = day;
        return updated;
      }
      
      return [
        ...prev,
        {
          date: today,
          items: { [itemId]: quantity },
          total: quantity,
        },
      ];
    });
  }, []);

  // Get last 7 days of sales
  const lastWeekSales = useMemo(() => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return salesData.filter(d => new Date(d.date) >= weekAgo);
  }, [salesData]);

  return {
    salesData: lastWeekSales,
    itemNames,
    recordSale,
  };
};
