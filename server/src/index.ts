// A new comment to force a save.
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

console.log("--- Server starting up... ---");
console.log(`[DEBUG] Current NODE_ENV: ${process.env.NODE_ENV}`);

// Only load .env file in development
if (process.env.NODE_ENV !== 'production') {
    console.log("[INFO] Not in production, loading .env file.");
    dotenv.config();
}

const app = express();
const port = process.env.PORT || 3001;

// No API key needed for Yahoo Finance
console.log("[INFO] Using Yahoo Finance API - no API key required");

app.use(cors());

// Helper function to fetch data from Yahoo Finance
async function fetchYahooFinanceData(symbol: string) {
    // Yahoo Finance unofficial API endpoint
    const period1 = Math.floor(new Date('2023-01-01').getTime() / 1000); // Start of 2023
    const period2 = Math.floor(Date.now() / 1000); // Current time
    
    const url = `https://query1.finance.yahoo.com/v7/finance/download/${symbol}?period1=${period1}&period2=${period2}&interval=1d&events=history`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`Yahoo Finance API error: ${response.status}`);
    }
    
    const csvData = await response.text();
    return csvData;
}

// Helper function to parse CSV data
function parseCSVToJSON(csvData: string) {
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
        const values = line.split(',');
        return {
            date: values[0],
            open: parseFloat(values[1]),
            high: parseFloat(values[2]),
            low: parseFloat(values[3]),
            close: parseFloat(values[4]),
            // Adj Close is at index 5, Volume at index 6
            volume: parseInt(values[6], 10)
        };
    }).filter(item => !isNaN(item.open)); // Filter out invalid data
}

app.get('/api/historical-data/:symbol', async (req, res) => {
    const { symbol } = req.params;

    if (!symbol) {
        return res.status(400).json({ error: 'Stock symbol is required' });
    }

    try {
        console.log(`[INFO] Fetching data for symbol: ${symbol}`);
        
        const csvData = await fetchYahooFinanceData(symbol);
        const jsonData = parseCSVToJSON(csvData);
        
        if (jsonData.length === 0) {
            return res.status(404).json({ error: 'No data found for this symbol.' });
        }

        // Filter for last year's data
        const lastYear = new Date().getFullYear() - 1;
        const filteredData = jsonData
            .filter(item => new Date(item.date).getFullYear() === lastYear)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        console.log(`[INFO] Returning ${filteredData.length} data points for ${symbol}`);
        res.json(filteredData);
        
    } catch (error) {
        console.error('Yahoo Finance API error:', error);
        res.status(500).json({ error: 'Failed to fetch data from Yahoo Finance.' });
    }
});

app.listen(port, () => {
    if (process.env.NODE_ENV === 'production') {
        console.log(`Server is listening on port ${port}`);
    } else {
        console.log(`Server is running on http://localhost:${port}`);
    }
});
