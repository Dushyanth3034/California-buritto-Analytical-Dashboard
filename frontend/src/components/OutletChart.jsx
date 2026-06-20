import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/helpers';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white/95 dark:bg-zinc-950/95 p-3 shadow-xl backdrop-blur-md">
        <p className="text-xs font-bold text-text-lightPrimary dark:text-text-darkPrimary">
          {data.name}
        </p>
        <p className="text-xs font-extrabold text-secondary mt-1">
          Revenue: {formatCurrency(data.revenue)}
        </p>
      </div>
    );
  }
  return null;
};

export const OutletChart = ({ data }) => {
  const [isMounted, setIsMounted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const formatYAxis = (value) => {
    if (value >= 1.0e6) return `$${(value / 1.0e6).toFixed(1)}M`;
    if (value >= 1.0e3) return `$${(value / 1.0e3).toFixed(0)}k`;
    return `$${value}`;
  };

  if (!isMounted || !data || data.length === 0) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col justify-between p-5 rounded-2xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white/80 dark:bg-surface-darkCard/40 shadow-sm animate-pulse overflow-hidden">
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
    <div className="w-full h-full min-h-[300px] flex flex-col justify-between p-5 rounded-2xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white/80 dark:bg-surface-darkCard/40 shadow-sm overflow-hidden">
      <div>
        <h3 className="text-xs font-bold text-text-lightSecondary dark:text-text-darkSecondary uppercase tracking-wider">
          Revenue by Outlet
        </h3>
        <p className="text-[10px] text-text-lightSecondary dark:text-text-darkSecondary mt-0.5">
          Sales breakdown across active locations
        </p>
      </div>

      <div className="w-full h-[300px] sm:h-[350px] mt-4 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={isMobile ? { top: 10, right: 10, left: 0, bottom: 40 } : { top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              className="stroke-zinc-100 dark:stroke-zinc-800/80" 
            />
            <XAxis 
              dataKey="name" 
              tickLine={false}
              axisLine={false}
              className={isMobile ? "text-[8px] font-semibold fill-text-lightSecondary dark:fill-text-darkSecondary" : "text-[9px] font-semibold fill-text-lightSecondary dark:fill-text-darkSecondary"}
              interval={0}
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? "end" : "middle"}
              height={isMobile ? 55 : 30}
            />
            <YAxis 
              tickFormatter={formatYAxis}
              tickLine={false}
              axisLine={false}
              className="text-[9px] font-semibold fill-text-lightSecondary dark:fill-text-darkSecondary"
              width={isMobile ? 40 : 55}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} wrapperStyle={{ pointerEvents: 'none' }} />
            <Bar 
              dataKey="revenue" 
              fill="#FF4D4D" 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default React.memo(OutletChart);
