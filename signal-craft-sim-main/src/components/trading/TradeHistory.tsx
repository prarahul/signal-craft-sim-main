import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trade } from "@/types/trading";
import { formatPrice } from "@/utils/tradingUtils";
import { History, TrendingUp, TrendingDown } from "lucide-react";

interface TradeHistoryProps {
  trades: Trade[];
}

const TradeHistory = ({ trades }: TradeHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Trade History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {trades.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-2">No trades yet</div>
            <p className="text-sm text-muted-foreground">
              Execute your first trade using the signals above
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {trades.map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50"
              >
                <div className="flex items-center gap-3">
                  {trade.type === "BUY" ? (
                    <TrendingUp className="h-4 w-4 text-profit" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-loss" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={trade.type === "BUY" ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {trade.type}
                      </Badge>
                      <span className="font-medium text-sm">{trade.symbol}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(trade.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-medium text-sm">
                    {trade.quantity} × {formatPrice(trade.price)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total: {formatPrice(trade.quantity * trade.price)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TradeHistory;