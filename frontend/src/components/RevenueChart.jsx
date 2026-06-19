import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatDate } from '../utils/helpers';

/**
 * Custom Tooltip for dark/light themes.
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white/95 dark:bg-zinc-950/95 p-3 shadow-xl backdrop-blur-md">
        <p className="text-[10px] font-bold text-text-lightSecondary dark:text-text-darkSecondary uppercase tracking-wider">
          {formatDate(payload[0].payload.date)}
        </p>
        <p className="text-sm font-extrabold text-primary mt-1">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

/**
 * Premium area chart displaying sales trends over time.
 */
export const RevenueChart = ({ data }) => {
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Format Y Axis labels
  const formatYAxis = (value) => {
    if (value >= 1.0e6) return `$${(value / 1.0e6).toFixed(1)}M`;
    if (value >= 1.0e3) return `$${(value / 1.0e3).toFixed(0)}k`;
    return `$${value}`;
  };

  // Format X Axis date
  const formatXAxis = (tickItem) => {
    if (!tickItem) return '';
    try {
      const parts = tickItem.split('-');
      if (parts.length < 3) return tickItem;
      // return "Jun 12" format
      const date = new Date(tickItem.replace(/-/g, '/'));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return tickItem;
    }
  };

  if (!isMounted || !data || data.length === 0) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col justify-between p-5 rounded-2xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white/80 dark:bg-surface-darkCard/40 shadow-sm animate-pulse">
        <div>
          <div className="h-3.5 w-32 bg-zinc-100 dark:bg-zinc-800/60 rounded" />
          <div className="h-2.5 w-48 bg-zinc-100 dark:bg-zinc-800/60 rounded mt-2" />
        </div>
        <div className="w-full h-[300px] sm:h-[350px] mt-4 flex justify-center items-center">
          <div className="h-6 w-6 rounded-full border-2 border-zinc-200 dark:border-zinc-800 border-t-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px] flex flex-col justify-between p-5 rounded-2xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white/80 dark:bg-surface-darkCard/40 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xs font-bold text-text-lightSecondary dark:text-text-darkSecondary uppercase tracking-wider">
            Revenue Trend
          </h3>
          <p className="text-[10px] text-text-lightSecondary dark:text-text-darkSecondary mt-0.5">
            Daily net sales performance
          </p>
        </div>
      </div>
      
      <div className="w-full h-[300px] sm:h-[350px] mt-4 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9DFF3D" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#9DFF3D" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              className="stroke-zinc-100 dark:stroke-zinc-800/80" 
            />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
              tickLine={false}
              axisLine={false}
              dy={10}
              className="text-[9px] font-semibold fill-text-lightSecondary dark:fill-text-darkSecondary"
            />
            <YAxis 
              tickFormatter={formatYAxis}
              tickLine={false}
              axisLine={false}
              dx={-5}
              className="text-[9px] font-semibold fill-text-lightSecondary dark:fill-text-darkSecondary"
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 1 }} />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#9DFF3D" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#revenueGrad)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default React.memo(RevenueChart);
