import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import alphavantage from 'alphavantage';

console.log("--- Server starting up... ---");
console.log(`[DEBUG] Current NODE_ENV: ${process.env.NODE_ENV}`);

// Only load .env file in development
if (process.env.NODE_ENV !== 'production') {
    console.log("[INFO] Not in production, loading .env file.");
    dotenv.config();
}

const app = express();
const port = process.env.PORT || 3001; // Use Render's port, or 3001 for local

// Check for the API key and throw an error if it's missing
const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

console.log(`[DEBUG] API Key is present: ${!!apiKey}`);

if (!apiKey) {
    console.error("[FATAL] ALPHA_VANTAGE_API_KEY is not defined. Shutting down.");
    throw new Error("ALPHA_VANTAGE_API_KEY is not defined in the environment.");
}

// Initialize alphavantage with the validated key
const alpha = alphavantage({ key: apiKey });

app.use(cors());

app.get('/api/historical-data/:symbol', async (req, res) => {
    const { symbol } = req.params;

    if (!symbol) {
        return res.status(400).json({ error: 'Stock symbol is required' });
    }

    try {
        const data = await alpha.data.daily(symbol, 'full', 'json');
        const timeSeries = data['Time Series (Daily)'];

        if (!timeSeries) {
            return res.status(404).json({ error: 'No data found for this symbol.' });
        }

        const lastYear = new Date().getFullYear() - 1;

        const filteredData = Object.entries(timeSeries)
            .map(([date, values]: [string, any]) => ({
                date,
                open: parseFloat(values['1. open']),
                high: parseFloat(values['2. high']),
                low: parseFloat(values['3. low']),
                close: parseFloat(values['4. close']),
                volume: parseInt(values['5. volume'], 10),
            }))
            .filter(item => new Date(item.date).getFullYear() == lastYear)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        res.json(filteredData);
    } catch (error) {
        console.error('Alpha Vantage API error:', error);
        res.status(500).json({ error: 'Failed to fetch data from Alpha Vantage.' });
    }
});

app.listen(port, () => {
    if (process.env.NODE_ENV === 'production') {
        console.log(`Server is listening on port ${port}`);
    } else {
        console.log(`Server is running on http://localhost:${port}`);
    }
});
