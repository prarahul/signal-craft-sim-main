import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Signal } from "@/types/trading";
import { TrendingUp, TrendingDown, Minus, Target } from "lucide-react";

interface SignalDisplayProps {
  signal: Signal;
  onExecute: (type: "BUY" | "SELL") => void;
}

const SignalDisplay = ({ signal, onExecute }: SignalDisplayProps) => {
  const getSignalColor = (type: Signal["type"]) => {
    switch (type) {
      case "BUY":
        return "bg-gradient-to-r from-profit/20 to-profit/5 border-profit/30";
      case "SELL":
        return "bg-gradient-to-r from-loss/20 to-loss/5 border-loss/30";
      default:
        return "bg-gradient-to-r from-muted/20 to-muted/5 border-muted/30";
    }
  };

  const getSignalIcon = (type: Signal["type"]) => {
    switch (type) {
      case "BUY":
        return <TrendingUp className="h-6 w-6 text-profit" />;
      case "SELL":
        return <TrendingDown className="h-6 w-6 text-loss" />;
      default:
        return <Minus className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getSignalVariant = (type: Signal["type"]) => {
    switch (type) {
      case "BUY":
        return "default";
      case "SELL":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const confidenceLevel = signal.confidence > 70 ? "High" : signal.confidence > 40 ? "Medium" : "Low";
  const confidenceColor = signal.confidence > 70 ? "text-profit" : signal.confidence > 40 ? "text-warning" : "text-loss";

  return (
    <Card className={`${getSignalColor(signal.type)} transition-all duration-300`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Current Signal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Signal Type */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getSignalIcon(signal.type)}
            <div>
              <Badge variant={getSignalVariant(signal.type)} className="text-sm font-semibold">
                {signal.type}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(signal.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Confidence */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Confidence</span>
            <span className={`text-sm font-medium ${confidenceColor}`}>
              {signal.confidence.toFixed(1)}% ({confidenceLevel})
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-chart-primary to-profit"
              style={{ width: `${signal.confidence}%` }}
            />
          </div>
        </div>

        {/* Reason */}
        {signal.reason && (
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Reason</span>
            <p className="text-sm font-medium">{signal.reason}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onExecute("BUY")}
            variant="default"
            size="sm"
            className="flex-1 bg-profit hover:bg-profit/90"
            disabled={signal.type === "SELL"}
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Buy
          </Button>
          <Button
            onClick={() => onExecute("SELL")}
            variant="destructive"
            size="sm"
            className="flex-1"
            disabled={signal.type === "BUY"}
          >
            <TrendingDown className="h-4 w-4 mr-1" />
            Sell
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2">
          Paper trading only - No real money at risk
        </p>
      </CardContent>
    </Card>
  );
};

export default SignalDisplay;