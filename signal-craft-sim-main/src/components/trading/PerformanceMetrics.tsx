import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TradingData, Trade } from '@/types/trading'; // Corrected import path

interface PerformanceMetricsProps {
  tradeHistory: Trade[];
  priceData: TradingData[]; // Use TradingData
  sharpeRatio: number;
}

export function PerformanceMetrics({ tradeHistory, priceData, sharpeRatio }: PerformanceMetricsProps) {
  const totalReturn = useMemo(() => {
    if (priceData.length < 2) return 0;
    const initialPrice = priceData[0].close;
    const finalPrice = priceData[priceData.length - 1].close;
    return ((finalPrice - initialPrice) / initialPrice) * 100;
  }, [priceData]);

  const winRate = useMemo(() => {
    const profitableTrades = tradeHistory.filter(trade => (trade.pnl ?? 0) > 0);
    return tradeHistory.length > 0 ? (profitableTrades.length / tradeHistory.length) * 100 : 0;
  }, [tradeHistory]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Return</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {totalReturn.toFixed(2)}%
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {sharpeRatio.toFixed(2)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{tradeHistory.length}</div>
        </CardContent>
      </Card>
    </div>
  );
}