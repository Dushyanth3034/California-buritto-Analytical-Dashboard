import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/helpers';

const COLORS = ['#9DFF3D', '#818CF8', '#2DD4BF', '#FF4D4D', '#F59E0B', '#EC4899'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percentage = payload[0].percent * 100;
    return (
      <div className="rounded-xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white/95 dark:bg-zinc-950/95 p-3 shadow-xl backdrop-blur-md">
        <p className="text-xs font-bold text-text-lightPrimary dark:text-text-darkPrimary">
          {data.name}
        </p>
        <div className="flex flex-col gap-0.5 mt-1.5 text-[10px] font-semibold">
          <span className="text-primary">Revenue: {formatCurrency(data.value)}</span>
          <span className="text-indigo-400">Share: {percentage.toFixed(1)}%</span>
          <span className="text-text-lightSecondary dark:text-text-darkSecondary">Transactions: {data.count}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const SettlementChart = ({ data }) => {
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

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
    <div className="w-full h-full min-h-[300px] flex flex-col justify-between p-5 rounded-2xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white/80 dark:bg-surface-darkCard/40 shadow-sm overflow-hidden">
      <div>
        <h3 className="text-xs font-bold text-text-lightSecondary dark:text-text-darkSecondary uppercase tracking-wider">
          Revenue by Settlement
        </h3>
        <p className="text-[10px] text-text-lightSecondary dark:text-text-darkSecondary mt-0.5">
          Payment method share of sales
        </p>
      </div>

      <div className="w-full h-[300px] sm:h-[350px] mt-4 flex justify-center items-center min-w-0 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'none' }} />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span className="text-[10px] font-semibold text-text-lightSecondary dark:text-text-darkSecondary">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default React.memo(SettlementChart);
