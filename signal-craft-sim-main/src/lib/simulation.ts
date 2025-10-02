import { Portfolio, Signal, Trade, TradingData } from "@/types/trading";

// The data for the chart, including our SMA indicators
export type ChartData = TradingData & {
  shortSMA?: number | null;
  longSMA?: number | null;
};

// Defines all the data we need to track for the simulation
export interface SimulationState {
  status: 'idle' | 'running' | 'finished';
  allData: ChartData[];
  simulationData: ChartData[]; // The data currently visible on the chart
  currentIndex: number;
  portfolio: Portfolio;
  portfolioHistory: { timestamp: number; value: number }[]; // Add portfolio history
  trades: Trade[];
  currentSignal: Signal;
}

// Defines all the possible actions that can change the simulation state
export type SimulationAction =
  | { type: 'START'; data: ChartData[]; initialBalance: number }
  | { type: 'ADVANCE_DAY' }
  | { type: 'RESET' }
  | { type: 'EXECUTE_TRADE'; tradeType: 'BUY' | 'SELL'; quantity: number; symbol: string };

// The initial state of our simulation before it begins
export const initialState: SimulationState = {
  status: 'idle',
  allData: [],
  simulationData: [],
  currentIndex: 0,
  portfolio: { balance: 0, position: 0, value: 0, totalPnL: 0, dailyPnL: 0 },
  portfolioHistory: [], // Initialize as empty
  trades: [],
  currentSignal: { type: 'HOLD', confidence: 0, timestamp: 0 },
};

// The reducer function: the heart of the simulation logic.
// It takes the current state and an action, and returns the new state.
export function simulationReducer(state: SimulationState, action: SimulationAction): SimulationState {
  switch (action.type) {
    case 'START': {
      const initialIndex = 100; // Start simulation after SMA periods
      const initialPortfolio = {
        balance: action.initialBalance,
        value: action.initialBalance,
        position: 0,
        totalPnL: 0,
        dailyPnL: 0,
      };
      return {
        ...initialState,
        status: 'running',
        allData: action.data,
        simulationData: action.data.slice(0, initialIndex),
        currentIndex: initialIndex,
        portfolio: initialPortfolio,
        portfolioHistory: [{ // Start history with initial value
          timestamp: action.data[initialIndex]?.timestamp, 
          value: initialPortfolio.value 
        }],
      };
    }

    case 'ADVANCE_DAY': {
      if (state.status !== 'running' || state.currentIndex >= state.allData.length - 1) {
        return { ...state, status: 'finished' };
      }

      const newIndex = state.currentIndex + 1;
      const currentDataPoint = state.allData[newIndex];
      const prevDataPoint = state.allData[state.currentIndex];
      const currentPrice = currentDataPoint.close;

      // Determine the signal from the SMA crossover strategy
      let signalType: Signal['type'] = 'HOLD';
      const { shortSMA: currentShort, longSMA: currentLong } = currentDataPoint;
      const { shortSMA: prevShort, longSMA: prevLong } = prevDataPoint;

      if (prevShort && prevLong && currentShort && currentLong) {
        if (prevShort < prevLong && currentShort > currentLong) {
          signalType = 'BUY';
        } else if (prevShort > prevLong && currentShort < currentLong) {
          signalType = 'SELL';
        }
      }
      
      const newPortfolioValue = state.portfolio.balance + (state.portfolio.position * currentPrice);

      return {
        ...state,
        currentIndex: newIndex,
        simulationData: state.allData.slice(0, newIndex + 1),
        currentSignal: { type: signalType, confidence: 0.85, timestamp: currentDataPoint.timestamp },
        portfolio: {
          ...state.portfolio,
          value: newPortfolioValue,
        },
        portfolioHistory: [ // Add new day's value to history
          ...state.portfolioHistory,
          { timestamp: currentDataPoint.timestamp, value: newPortfolioValue },
        ],
      };
    }

    case 'EXECUTE_TRADE': {
      if (state.status !== 'running') return state;

      const currentPrice = state.allData[state.currentIndex].close;
      const { portfolio, trades } = state;
      const tradeCost = action.quantity * currentPrice;

      // BUY Logic
      if (action.tradeType === 'BUY' && portfolio.balance >= tradeCost) {
        const newBalance = portfolio.balance - tradeCost;
        const newPosition = portfolio.position + action.quantity;
        const newTrade: Trade = {
          id: String(trades.length + 1),
          timestamp: state.allData[state.currentIndex].timestamp,
          type: 'BUY',
          symbol: action.symbol, // Use the symbol from the actionction
          quantity: action.quantity,
          price: currentPrice,
          pnl: 0,
        };
        return {
          ...state,
          portfolio: { ...portfolio, balance: newBalance, position: newPosition },
          trades: [...trades, newTrade],
        };
      }

      // SELL Logic
      if (action.tradeType === 'SELL' && portfolio.position >= action.quantity) {
        const lastBuy = trades.filter(t => t.type === 'BUY').pop();
        const pnl = lastBuy ? (currentPrice - lastBuy.price) * action.quantity : 0;
        
        const newBalance = portfolio.balance + tradeCost;
        const newPosition = portfolio.position - action.quantity;
        const newTrade: Trade = {
          id: String(trades.length + 1),
          timestamp: state.allData[state.currentIndex].timestamp,
          type: 'SELL',
          symbol: action.symbol, // Use the symbol from the action.symbol, // Use the symbol from the action
          quantity: action.quantity,
          price: currentPrice,
          pnl: pnl,
        };
        return {
          ...state,
          portfolio: { ...portfolio, balance: newBalance, position: newPosition, totalPnL: portfolio.totalPnL + pnl },
          trades: [...trades, newTrade],
        };
      }

      return state; // Return state if trade is not possible
    }

    case 'RESET': {
      return { ...initialState, portfolioHistory: [] }; // Ensure history is cleared on reset
    }

    default:
      return state;
  }
}