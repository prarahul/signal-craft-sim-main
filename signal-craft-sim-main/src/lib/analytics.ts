/**
 * Calculates the mean of an array of numbers.
 * @param numbers - An array of numbers.
 * @returns The mean of the numbers.
 */
function mean(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, val) => acc + val, 0);
    return sum / numbers.length;
}

/**
 * Calculates the standard deviation of an array of numbers.
 * @param numbers - An array of numbers.
 * @returns The standard deviation.
 */
function standardDeviation(numbers: number[]): number {
    if (numbers.length < 2) return 0;
    const avg = mean(numbers);
    const squareDiffs = numbers.map(value => {
        const diff = value - avg;
        return diff * diff;
    });
    const avgSquareDiff = mean(squareDiffs);
    return Math.sqrt(avgSquareDiff);
}

/**
 * Calculates the annualized Sharpe Ratio for a series of returns.
 * We assume a risk-free rate of 0 for simplicity.
 * @param returns - An array of daily returns (e.g., 0.01 for 1%).
 * @param tradingDays - The number of trading days in a year (default is 252).
 * @returns The annualized Sharpe Ratio.
 */
export function calculateSharpeRatio(
    returns: number[],
    tradingDays: number = 252
): number {
    if (returns.length < 2) {
        return 0;
    }

    const meanReturn = mean(returns);
    const stdDev = standardDeviation(returns);

    if (stdDev === 0) {
        return 0; // Cannot divide by zero if returns are constant.
    }

    // Assuming a risk-free rate of 0.
    const sharpeRatio = meanReturn / stdDev;

    // Annualize the Sharpe Ratio
    const annualizedSharpeRatio = sharpeRatio * Math.sqrt(tradingDays);

    return annualizedSharpeRatio;
}

/**
 * Calculates the Simple Moving Average (SMA) for a given set of numbers.
 * @param data - An array of numbers (e.g., closing prices).
 * @param period - The window size for the moving average.
 * @returns An array of numbers representing the SMA. The initial values will be null.
 */
export function calculateSMA(data: number[], period: number): (number | null)[] {
    if (period <= 0 || data.length < period) {
        return new Array(data.length).fill(null);
    }

    const sma: (number | null)[] = new Array(period - 1).fill(null);
    let sum = 0;

    // Calculate the sum for the first period
    for (let i = 0; i < period; i++) {
        sum += data[i];
    }
    sma.push(sum / period);

    // Calculate the rest of the SMAs using a sliding window for efficiency
    for (let i = period; i < data.length; i++) {
        sum = sum - data[i - period] + data[i];
        sma.push(sum / period);
    }

    return sma;
}