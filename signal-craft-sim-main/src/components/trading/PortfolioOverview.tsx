import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Portfolio } from "@/types/trading";
import { formatPrice, formatPercentage } from "@/utils/tradingUtils";
import { Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface PortfolioOverviewProps {
  portfolio: Portfolio;
  currentPrice: number;
}

const PortfolioOverview = ({ portfolio, currentPrice }: PortfolioOverviewProps) => {
  const currentValue = portfolio.balance + (portfolio.position * currentPrice);
  const totalReturn = currentValue - 100000; // Starting with $100k
  const totalReturnPct = (totalReturn / 100000) * 100;
  const isProfit = totalReturn >= 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Portfolio Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Value */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Total Value</p>
          <p className="text-2xl font-bold">{formatPrice(currentValue)}</p>
          <div className="flex items-center gap-1">
            {isProfit ? (
              <TrendingUp className="h-4 w-4 text-profit" />
            ) : (
              <TrendingDown className="h-4 w-4 text-loss" />
            )}
            <span className={`text-sm font-medium ${isProfit ? 'text-profit' : 'text-loss'}`}>
              {formatPrice(totalReturn)} ({formatPercentage(totalReturnPct)})
            </span>
          </div>
        </div>

        {/* Portfolio Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Cash Balance</p>
            <p className="font-semibold">{formatPrice(portfolio.balance)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Position Value</p>
            <p className="font-semibold">{formatPrice(portfolio.position * currentPrice)}</p>
          </div>
        </div>

        {/* Position Details */}
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">SPY Shares</span>
            <span className="font-medium">{portfolio.position}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current Price</span>
            <span className="font-medium">{formatPrice(currentPrice)}</span>
          </div>
        </div>

        {/* Daily P&L */}
        <div className="space-y-1 pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground">Today's P&L</p>
          <div className="flex items-center gap-1">
            <DollarSign className={`h-4 w-4 ${portfolio.dailyPnL >= 0 ? 'text-profit' : 'text-loss'}`} />
            <span className={`font-semibold ${portfolio.dailyPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
              {formatPrice(portfolio.dailyPnL)}
            </span>
          </div>
        </div>

        {/* Allocation */}
        <div className="space-y-2 pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground">Allocation</p>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Cash</span>
              <span>{((portfolio.balance / currentValue) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Stocks</span>
              <span>{(((portfolio.position * currentPrice) / currentValue) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioOverview;