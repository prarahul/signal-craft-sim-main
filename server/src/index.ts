import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import alphavantage from 'alphavantage';

// Only load .env file in development
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const app = express();
const port = process.env.PORT || 3001; // Use Render's port, or 3001 for local

// Check for the API key and throw an error if it's missing
const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
if (!apiKey) {
    throw new Error("ALPHA_VANTAGE_API_KEY is not defined in the .env file.");
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
    console.log(`Server is running on http://localhost:${port}`);
});
