import { useEffect, useMemo, useReducer, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components
import PriceChart from '@/components/trading/PriceChart';
import SignalDisplay from '@/components/trading/SignalDisplay';
import PortfolioOverview from '@/components/trading/PortfolioOverview';
import TradeHistory from '@/components/trading/TradeHistory';
import { PerformanceMetrics } from '@/components/trading/PerformanceMetrics';
import { TradingData, Trade } from '@/types/trading';
import { calculateSharpeRatio, calculateSMA } from '@/lib/analytics';
import { simulationReducer, initialState } from '@/lib/simulation';

const SHORT_SMA_PERIOD = 50;
const LONG_SMA_PERIOD = 100;
const INITIAL_BALANCE = 100000;

// A list of companies for the dropdown
const popularSymbols = [
  { value: 'IBM', label: 'IBM' },
  { value: 'AAPL', label: 'Apple Inc.' },
  { value: 'MSFT', label: 'Microsoft Corp.' },
  { value: 'GOOGL', label: 'Alphabet Inc.' },
  { value: 'AMZN', label: 'Amazon.com, Inc.' },
  { value: 'TSLA', label: 'Tesla, Inc.' },
  { value: 'NVDA', label: 'NVIDIA Corp.' },
];

const TradingDashboard = () => {
  const [simulationState, dispatch] = useReducer(simulationReducer, initialState);
  const [isPlaying, setIsPlaying] = useState(false);
  const [symbol, setSymbol] = useState('IBM');

  // This effect fetches the data and starts the simulation
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    fetch(`${apiUrl}/api/historical-data/${symbol}`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          throw new Error("Received invalid data from server");
        }
        const formattedData: TradingData[] = data.map((item: any) => ({
          timestamp: new Date(item.date).getTime(),
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }));

        const closePrices = formattedData.map(d => d.close);
        const shortSMA = calculateSMA(closePrices, SHORT_SMA_PERIOD);
        const longSMA = calculateSMA(closePrices, LONG_SMA_PERIOD);

        const chartData = formattedData.map((d, i) => ({
          ...d,
          shortSMA: shortSMA[i],
          longSMA: longSMA[i],
        }));

        dispatch({ type: 'START', data: chartData, initialBalance: INITIAL_BALANCE });
      })
      .catch(console.error);
  }, [symbol]);

  // This is the "game loop" for the simulation
  useEffect(() => {
    if (isPlaying && simulationState.status === 'running') {
      const interval = setInterval(() => {
        dispatch({ type: 'ADVANCE_DAY' });
        
        // Auto-execute trade based on the new signal
        const { currentSignal, portfolio } = simulationState;
        if (currentSignal.type === 'BUY' && portfolio.position === 0) {
          dispatch({ type: 'EXECUTE_TRADE', tradeType: 'BUY', quantity: 10, symbol });
        } else if (currentSignal.type === 'SELL' && portfolio.position > 0) {
          dispatch({ type: 'EXECUTE_TRADE', tradeType: 'SELL', quantity: portfolio.position, symbol });
        }

      }, 100); // Advance one day every 100ms

      return () => clearInterval(interval); // Cleanup on stop
    }
  }, [isPlaying, simulationState, symbol]); // Add symbol to dependency array

  // Stop playing when the simulation finishes
  useEffect(() => {
    if (simulationState.status === 'finished') {
      setIsPlaying(false);
    }
  }, [simulationState.status]);


  // Calculate Sharpe Ratio from portfolio history
  const sharpeRatio = useMemo(() => {
    if (simulationState.portfolioHistory.length < 2) {
      return 0;
    }
    const returns: number[] = [];
    for (let i = 1; i < simulationState.portfolioHistory.length; i++) {
      const previousValue = simulationState.portfolioHistory[i - 1].value;
      const currentValue = simulationState.portfolioHistory[i].value;
      if (previousValue !== 0) {
        returns.push((currentValue - previousValue) / previousValue);
      }
    }
    return calculateSharpeRatio(returns);
  }, [simulationState.portfolioHistory]);

  const tradeHistory = simulationState.trades;

  // This function now handles the dropdown change
  const handleSymbolChange = (newSymbol: string) => {
    if (newSymbol) {
      setSymbol(newSymbol);
      setIsPlaying(false); // Stop simulation when changing symbol
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Signal Craft Simulator</h1>
          <p className="text-muted-foreground">Now Analyzing: {symbol}</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Dropdown to select a stock */}
          <Select value={symbol} onValueChange={handleSymbolChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a stock" />
            </SelectTrigger>
            <SelectContent>
              {popularSymbols.map(s => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Badge variant={simulationState.status === 'running' ? 'default' : 'secondary'}>
            {simulationState.status}
          </Badge>
          <Button 
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={simulationState.status === 'idle' || simulationState.status === 'finished'}
          >
            {isPlaying ? 'Pause Simulation' : 'Run Simulation'}
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <PerformanceMetrics
        tradeHistory={tradeHistory}
        priceData={simulationState.simulationData}
        sharpeRatio={sharpeRatio}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Price Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{symbol} Price Chart (Year: {new Date().getFullYear() - 1})</CardTitle>
            </CardHeader>
            <CardContent>
              <PriceChart data={simulationState.simulationData} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Signal, Portfolio, History */}
        <div className="space-y-6">
          <SignalDisplay
            signal={simulationState.currentSignal}
            onExecute={(tradeType) => dispatch({ type: 'EXECUTE_TRADE', tradeType, quantity: 10, symbol })}
          />
          <PortfolioOverview 
            portfolio={simulationState.portfolio} 
            currentPrice={simulationState.simulationData[simulationState.simulationData.length - 1]?.close || 0} 
          />
          <TradeHistory trades={tradeHistory} />
        </div>
      </div>
    </div>
  );
};


export default TradingDashboard;