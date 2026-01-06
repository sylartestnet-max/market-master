// FiveM Market Types

export interface MarketItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock?: number; // Optional: for limited stock items
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface CartItem {
  item: MarketItem;
  quantity: number;
}

export interface MarketConfig {
  id: string;
  name: string;
  categories: Category[];
  items: MarketItem[];
}

export interface PlayerBalance {
  cash: number;
  bank: number;
}

export type PaymentMethod = 'cash' | 'bank';

// NUI Callback types (for FiveM integration)
export interface NUIMessage {
  action: string;
  data?: unknown;
}

export interface OpenMarketData {
  marketId: string;
  config: MarketConfig;
  balance: PlayerBalance;
}

export interface PurchaseData {
  items: { itemId: string; quantity: number }[];
  paymentMethod: PaymentMethod;
  totalPrice: number;
}
