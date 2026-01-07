import { useMemo } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DailySales } from '@/types/market';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface SalesChartProps {
  isOpen: boolean;
  onClose: () => void;
  salesData: DailySales[];
  itemNames: { [itemId: string]: string };
}

export const SalesChart = ({ isOpen, onClose, salesData, itemNames }: SalesChartProps) => {
  // Transform data for chart - show top 5 items
  const chartData = useMemo(() => {
    // Aggregate all items across all days
    const itemTotals: { [itemId: string]: number } = {};
    salesData.forEach(day => {
      Object.entries(day.items).forEach(([itemId, qty]) => {
        itemTotals[itemId] = (itemTotals[itemId] || 0) + qty;
      });
    });

    // Get top 5 items by total sales
    const topItems = Object.entries(itemTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    // Create daily data with top items
    return salesData.map(day => {
      const dayData: { [key: string]: string | number } = {
        date: formatDate(day.date),
        fullDate: day.date,
      };
      topItems.forEach(itemId => {
        dayData[itemId] = day.items[itemId] || 0;
      });
      return dayData;
    });
  }, [salesData]);

  // Get unique items for chart config
  const chartConfig = useMemo(() => {
    const itemTotals: { [itemId: string]: number } = {};
    salesData.forEach(day => {
      Object.entries(day.items).forEach(([itemId, qty]) => {
        itemTotals[itemId] = (itemTotals[itemId] || 0) + qty;
      });
    });

    const topItems = Object.entries(itemTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    const colors = [
      'hsl(var(--primary))',
      'hsl(var(--secondary))',
      'hsl(var(--accent))',
      'hsl(142, 76%, 36%)',
      'hsl(48, 96%, 53%)',
    ];

    const config: { [key: string]: { label: string; color: string } } = {};
    topItems.forEach((itemId, index) => {
      config[itemId] = {
        label: itemNames[itemId] || itemId,
        color: colors[index % colors.length],
      };
    });
    return config;
  }, [salesData, itemNames]);

  const topItemIds = Object.keys(chartConfig);

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
            <h2 className="text-xl font-bold text-primary neon-text">
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

        {/* Chart */}
        <div className="p-6">
          {salesData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <TrendingUp className="w-16 h-16 opacity-30 mb-4" />
              <p>Henüz satış verisi bulunmuyor</p>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
              <BarChart data={chartData}>
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
                  tickFormatter={(value) => `${value}`}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
                />
                <ChartLegend content={<ChartLegendContent />} />
                {topItemIds.map((itemId, index) => (
                  <Bar
                    key={itemId}
                    dataKey={itemId}
                    fill={chartConfig[itemId]?.color || 'hsl(var(--primary))'}
                    radius={[4, 4, 0, 0]}
                    stackId="sales"
                  />
                ))}
              </BarChart>
            </ChartContainer>
          )}
        </div>

        {/* Summary */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {topItemIds.map(itemId => {
              const total = salesData.reduce((sum, day) => sum + (day.items[itemId] || 0), 0);
              return (
                <div
                  key={itemId}
                  className="p-3 rounded-lg glass border border-border/50"
                  style={{ borderColor: chartConfig[itemId]?.color }}
                >
                  <p className="text-xs text-muted-foreground truncate">
                    {chartConfig[itemId]?.label}
                  </p>
                  <p
                    className="text-lg font-bold"
                    style={{ color: chartConfig[itemId]?.color }}
                  >
                    {total} adet
                  </p>
                </div>
              );
            })}
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
