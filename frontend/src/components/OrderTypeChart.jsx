import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/helpers';

const COLORS = ['#818CF8', '#2DD4BF', '#FF4D4D', '#9DFF3D', '#F59E0B', '#34D399'];

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
          <span className="text-indigo-400">Percentage: {percentage.toFixed(1)}%</span>
          <span className="text-text-lightSecondary dark:text-text-darkSecondary">Total Orders: {data.count.toLocaleString()}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const OrderTypeChart = ({ data }) => {
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !data || data.length === 0) {
    return (
      <div className="w-full h-full flex flex-col justify-between p-5 rounded-2xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white/80 dark:bg-surface-darkCard/40 shadow-sm animate-pulse">
        <div>
          <div className="h-3.5 w-32 bg-zinc-100 dark:bg-zinc-800/60 rounded" />
          <div className="h-2.5 w-48 bg-zinc-100 dark:bg-zinc-800/60 rounded mt-2" />
        </div>
        <div className="w-full h-[240px] mt-2 flex justify-center items-center">
          <div className="h-6 w-6 rounded-full border-2 border-zinc-200 dark:border-zinc-800 border-t-primary animate-spin" />
        </div>
        <div className="border-t border-surface-lightBorder dark:border-surface-darkBorder py-3 my-2" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-1">
          <div className="h-14 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-surface-lightBorder dark:border-surface-darkBorder" />
          <div className="h-14 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-surface-lightBorder dark:border-surface-darkBorder" />
          <div className="h-14 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-surface-lightBorder dark:border-surface-darkBorder" />
        </div>
      </div>
    );
  }

  // Calculate total values for calculations
  const totalOrders = data.reduce((acc, curr) => acc + (curr.count || 0), 0);
  const totalRevenue = data.reduce((acc, curr) => acc + (curr.value || 0), 0);

  // Format Legend items with calculated percentages and custom colors
  const legendItems = data.map((item, idx) => {
    const percentage = totalRevenue > 0 ? (item.value / totalRevenue) * 100 : 0;
    const color = COLORS[idx % COLORS.length];
    const formattedRevenue = item.value >= 1.0e6
      ? `$${(item.value / 1.0e6).toFixed(2)}M`
      : item.value >= 1.0e3
      ? `$${(item.value / 1.0e3).toFixed(0)}k`
      : `$${item.value.toFixed(2)}`;

    return {
      ...item,
      percentage,
      color,
      formattedRevenue
    };
  });

  const formattedTotalOrders = totalOrders >= 1000 
    ? `${(totalOrders / 1000).toFixed(0)}K` 
    : totalOrders;

  return (
    <div className="w-full h-full flex flex-col justify-between p-5 rounded-2xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white/80 dark:bg-surface-darkCard/40 shadow-sm">
      
      {/* Title Header */}
      <div>
        <h3 className="text-xs font-bold text-text-lightSecondary dark:text-text-darkSecondary uppercase tracking-wider">
          Order Type Distribution
        </h3>
        <p className="text-[10px] text-text-lightSecondary dark:text-text-darkSecondary mt-0.5">
          Revenue Channel Analysis
        </p>
      </div>

      {/* Donut Chart Container (Focal Point) */}
      <div className="w-full h-[240px] mt-2 flex justify-center items-center relative min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              // Increased radii to make chart the focal point
              innerRadius={70}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            
            {/* Center KPI Labels (Total Orders) */}
            <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle">
              <tspan className="text-[22px] font-extrabold fill-text-lightPrimary dark:fill-text-darkPrimary">
                {formattedTotalOrders}
              </tspan>
            </text>
            <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle">
              <tspan className="text-[10px] font-bold fill-text-lightSecondary dark:fill-text-darkSecondary uppercase tracking-wider">
                Orders
              </tspan>
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Horizontal Percentage Breakdown Row */}
      <div className="flex justify-between border-t border-b border-surface-lightBorder dark:border-surface-darkBorder py-3 my-2 text-xs font-semibold text-text-lightSecondary dark:text-text-darkSecondary select-none">
        {legendItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="truncate max-w-[70px] sm:max-w-none">{item.name}</span>
            <strong className="text-text-lightPrimary dark:text-text-darkPrimary">{item.percentage.toFixed(0)}%</strong>
          </div>
        ))}
      </div>

      {/* Premium Legend Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-1 text-left select-none">
        {legendItems.map((item, idx) => (
          <div 
            key={idx} 
            className="flex flex-col justify-between p-2.5 rounded-xl border border-surface-lightBorder dark:border-surface-darkBorder bg-zinc-50/50 dark:bg-zinc-900/30 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-[9px] font-extrabold text-text-lightSecondary dark:text-text-darkSecondary uppercase tracking-wider truncate">
                {item.name}
              </span>
            </div>
            <div className="mt-2">
              <p className="text-[11px] font-extrabold text-text-lightPrimary dark:text-text-darkPrimary leading-tight">
                {item.formattedRevenue}
              </p>
              <p className="text-[9px] text-text-lightSecondary dark:text-text-darkSecondary font-semibold mt-0.5 opacity-80">
                {item.count.toLocaleString()} orders
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default React.memo(OrderTypeChart);
