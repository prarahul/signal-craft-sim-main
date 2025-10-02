export interface PriceData {
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface Signal {
    type: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    timestamp: number;
}

export interface Trade {
    id: string;
    timestamp: number;
    type: 'BUY' | 'SELL';
    symbol: string;
    quantity: number;
    price: number;
    pnl?: number;
}

export interface Portfolio {
    balance: number;
    position: number;
    value: number;
    totalPnL: number;
    dailyPnL: number;
}