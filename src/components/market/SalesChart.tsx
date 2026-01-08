import { useMemo, useState } from 'react';
import { X, TrendingUp, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DailySales } from '@/types/market';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SalesChartProps {
  isOpen: boolean;
  onClose: () => void;
  salesData: DailySales[];
  itemNames: { [itemId: string]: string };
}

export const SalesChart = ({ isOpen, onClose, salesData, itemNames }: SalesChartProps) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Get all items with their totals
  const allItemsWithTotals = useMemo(() => {
    const itemTotals: { [itemId: string]: number } = {};
    salesData.forEach(day => {
      Object.entries(day.items).forEach(([itemId, qty]) => {
        itemTotals[itemId] = (itemTotals[itemId] || 0) + qty;
      });
    });

    return Object.entries(itemTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([id, total]) => ({ id, name: itemNames[id] || id, total }));
  }, [salesData, itemNames]);

  // Get daily data for selected item
  const selectedItemData = useMemo(() => {
    if (!selectedItemId) return [];
    
    return salesData.map(day => ({
      date: formatDate(day.date),
      fullDate: day.date,
      quantity: day.items[selectedItemId] || 0,
    }));
  }, [salesData, selectedItemId]);

  const selectedItem = allItemsWithTotals.find(item => item.id === selectedItemId);

  const chartConfig = {
    quantity: {
      label: 'Satış Adedi',
      color: 'hsl(var(--primary))',
    },
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
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[900px] max-h-[80vh] z-50 glass-darker rounded-2xl border-2 border-primary/30 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-primary">
              Haftalık Satış İstatistikleri
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Two Column Layout */}
        <div className="flex h-[500px]">
          {/* Left: Item List */}
          <div className="w-64 border-r border-border/30">
            <div className="p-3 border-b border-border/30">
              <p className="text-sm font-medium text-muted-foreground">Ürün Listesi</p>
            </div>
            <ScrollArea className="h-[calc(100%-44px)]">
              <div className="p-2 space-y-1">
                {allItemsWithTotals.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    Henüz satış yok
                  </div>
                ) : (
                  allItemsWithTotals.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-lg text-left transition-all",
                        "hover:bg-primary/10",
                        selectedItemId === item.id
                          ? "bg-primary/20 border border-primary/40"
                          : "bg-muted/30 border border-transparent"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-medium truncate",
                        selectedItemId === item.id ? "text-primary" : "text-foreground"
                      )}>
                        {item.name}
                      </span>
                      <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-full",
                        selectedItemId === item.id
                          ? "bg-primary/30 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {item.total}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right: Chart & Details */}
          <div className="flex-1 flex flex-col">
            {!selectedItemId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <Package className="w-16 h-16 opacity-30 mb-4" />
                <p>Detayları görmek için sol taraftan ürün seçin</p>
              </div>
            ) : (
              <>
                {/* Selected Item Header */}
                <div className="p-4 border-b border-border/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{selectedItem?.name}</h3>
                      <p className="text-sm text-muted-foreground">Son 7 günlük satış grafiği</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{selectedItem?.total}</p>
                      <p className="text-xs text-muted-foreground">Toplam Satış</p>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="flex-1 p-4">
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <BarChart data={selectedItemData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
                      />
                      <Bar
                        dataKey="quantity"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>

                {/* Daily Breakdown */}
                <div className="p-4 border-t border-border/30">
                  <div className="grid grid-cols-7 gap-2">
                    {selectedItemData.map((day, i) => (
                      <div key={i} className="text-center p-2 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground">{day.date}</p>
                        <p className="text-sm font-bold text-primary">{day.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Helper function to format date
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  return days[date.getDay()];
}
