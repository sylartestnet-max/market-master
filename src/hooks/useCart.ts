import { useState, useCallback, useMemo } from 'react';
import { CartItem, MarketItem, PaymentMethod } from '@/types/market';

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  const addItem = useCallback((item: MarketItem, quantity: number = 1) => {
    setItems(current => {
      const existingIndex = current.findIndex(ci => ci.item.id === item.id);
      
      if (existingIndex >= 0) {
        const updated = [...current];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      
      return [...current, { item, quantity }];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems(current => current.filter(ci => ci.item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    setItems(current => 
      current.map(ci => 
        ci.item.id === itemId ? { ...ci, quantity } : ci
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalPrice = useMemo(() => {
    return items.reduce((sum, ci) => sum + (ci.item.price * ci.quantity), 0);
  }, [items]);

  const totalItems = useMemo(() => {
    return items.reduce((sum, ci) => sum + ci.quantity, 0);
  }, [items]);

  const getCartData = useCallback(() => {
    return {
      items: items.map(ci => ({
        itemId: ci.item.id,
        quantity: ci.quantity,
      })),
      paymentMethod,
      totalPrice,
    };
  }, [items, paymentMethod, totalPrice]);

  return {
    items,
    paymentMethod,
    setPaymentMethod,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalPrice,
    totalItems,
    getCartData,
  };
};
