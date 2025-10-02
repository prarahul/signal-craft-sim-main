export type TradingData = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type Trade = {
  id: string;
  timestamp: number;
  type: 'BUY' | 'SELL';
  symbol: string;
  quantity: number;
  price: number;
  pnl: number;
};

export type Portfolio = {
  balance: number;
  position: number;
  value: number;
  totalPnL: number;
  dailyPnL: number;
};

export interface Signal {
    type: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    timestamp: number;
}