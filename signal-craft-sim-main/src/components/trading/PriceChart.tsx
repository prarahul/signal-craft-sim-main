import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TradingData } from '@/types/trading';

// The data now includes optional SMA values
type ChartData = TradingData & {
  shortSMA?: number | null;
  longSMA?: number | null;
};

interface PriceChartProps {
  data: ChartData[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    // Create a new Date object from the timestamp
    const date = new Date(dataPoint.timestamp);

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Date
            </span>
            <span className="font-bold text-muted-foreground">
              {date.toLocaleDateString()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Close Price
            </span>
            <span className="font-bold">
              ${dataPoint.close.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const PriceChart = ({ data }: PriceChartProps) => {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis
            dataKey="timestamp"
            tickFormatter={(time) => new Date(time).toLocaleDateString('en-US', { month: 'short' })}
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="monotone" dataKey="close" name="Price" stroke="#8884d8" dot={false} />
          <Line type="monotone" dataKey="shortSMA" name="50-Day SMA" stroke="#f59e0b" dot={false} />
          <Line type="monotone" dataKey="longSMA" name="100-Day SMA" stroke="#10b981" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;