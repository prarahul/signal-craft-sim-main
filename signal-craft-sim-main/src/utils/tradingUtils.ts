import { TradingData } from "@/types/trading";

export const generateMockPriceData = (count: number): TradingData[] => {
  const data: TradingData[] = [];
  let basePrice = 450; // SPY approximate price
  let timestamp = Date.now() - (count * 24 * 60 * 60 * 1000); // Start from 'count' days ago

  for (let i = 0; i < count; i++) {
    const volatility = 0.02;
    const change = (Math.random() - 0.5) * volatility;
    const open = basePrice;
    const close = basePrice * (1 + change);
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    const volume = Math.floor(Math.random() * 2000000) + 1000000;

    data.push({
      timestamp: timestamp + (i * 24 * 60 * 60 * 1000),
      open,
      high,
      low,
      close,
      volume
    });

    basePrice = close;
  }

  return data;
};

export const calculateSMA = (data: number[], period: number): number[] => {
  const sma: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(NaN);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
  }
  
  return sma;
};

export const calculateRSI = (closes: number[], period: number = 14): number[] => {
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  rsi.push(NaN); // First value is NaN
  for (let i = 0; i < period; i++) {
    rsi.push(NaN);
  }

  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    
    const rs = avgGain / (avgLoss || 0.0001);
    const rsiValue = 100 - (100 / (1 + rs));
    rsi.push(rsiValue);
  }

  return rsi;
};

export const calculateTechnicalIndicators = (data: TradingData[]): TradingData[] => {
  const closes = data.map(d => d.close);
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const rsi = calculateRSI(closes, 14);

  return data.map((item, index) => ({
    ...item,
    sma20: sma20[index],
    sma50: sma50[index],
    rsi: rsi[index]
  }));
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};