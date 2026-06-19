import React, { useState, useEffect } from 'react';
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
        <div className="flex flex-col gap-0.5 mt-1.5 text-[10px] font-semibold">
          <span className="text-primary">Revenue: {formatCurrency(data.revenue)}</span>
          <span className="text-emerald-400">Qty Sold: {data.quantity}</span>
        </div>
      </div>
    );
  }
  return null;
};

// SVG word wrapping utility
const wrapText = (text, maxLength) => {
  if (text.length <= maxLength) return [text];
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  for (const word of words) {
    if ((currentLine + ' ' + word).length <= maxLength) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
};

export const ProductChart = ({ data }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatXAxis = (value) => {
    if (value >= 1.0e6) return `$${(value / 1.0e6).toFixed(1)}M`;
    if (value >= 1.0e3) return `$${(value / 1.0e3).toFixed(0)}k`;
    return `$${value}`;
  };

  // Custom tick component for responsive Y-axis labels
  const CustomYAxisTick = ({ x, y, payload }) => {
    const text = payload.value;
    let lines = [text];

    if (windowWidth < 640) {
      // Mobile: truncate with ellipses to fit narrow layout
      const truncateLimit = 15;
      lines = [text.length > truncateLimit ? `${text.slice(0, truncateLimit)}...` : text];
    } else if (windowWidth < 1024) {
      // Tablet: wrap words into multiple lines
      lines = wrapText(text, 14);
    } else {
      // Desktop: show full names (or max 28 characters to prevent layout breaking)
      lines = wrapText(text, 28);
    }

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={-10}
          y={-(lines.length - 1) * 4}
          textAnchor="end"
          className="text-[9px] font-bold fill-text-lightSecondary dark:fill-text-darkSecondary"
        >
          {lines.map((line, idx) => (
            <tspan key={idx} x={-10} dy={idx === 0 ? 3 : 10}>
              {line}
            </tspan>
          ))}
        </text>
      </g>
    );
  };

  if (!isMounted || !data || data.length === 0) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col justify-between p-5 rounded-2xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white/80 dark:bg-surface-darkCard/40 shadow-sm animate-pulse">
        <div>
          <div className="h-3.5 w-32 bg-zinc-100 dark:bg-zinc-800/60 rounded" />
          <div className="h-2.5 w-48 bg-zinc-100 dark:bg-zinc-800/60 rounded mt-2" />
        </div>
        <div className="w-full h-[450px] sm:h-[550px] mt-4 flex justify-center items-center">
          <div className="h-6 w-6 rounded-full border-2 border-zinc-200 dark:border-zinc-800 border-t-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px] flex flex-col justify-between p-5 rounded-2xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white/80 dark:bg-surface-darkCard/40 shadow-sm">
      <div>
        <h3 className="text-xs font-bold text-text-lightSecondary dark:text-text-darkSecondary uppercase tracking-wider">
          Top Selling Products
        </h3>
        <p className="text-[10px] text-text-lightSecondary dark:text-text-darkSecondary mt-0.5">
          Top 10 menu items by gross revenue
        </p>
      </div>

      {/* Increased height to 450px on mobile and 550px on tablet/desktop to offer rows ample vertical height */}
      <div className="w-full h-[450px] sm:h-[550px] mt-4 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            // Expanded left margin to 120px to prevent Y-axis labels from overlapping into the chart body
            margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              horizontal={false} 
              className="stroke-zinc-100 dark:stroke-zinc-800/80" 
            />
            <XAxis 
              type="number"
              tickFormatter={formatXAxis}
              tickLine={false}
              axisLine={false}
              className="text-[9px] font-semibold fill-text-lightSecondary dark:fill-text-darkSecondary"
            />
            <YAxis 
              type="category"
              dataKey="name" 
              tick={<CustomYAxisTick />}
              tickLine={false}
              axisLine={false}
              className="text-[9px] font-semibold fill-text-lightSecondary dark:fill-text-darkSecondary"
              width={110}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
            <Bar 
              dataKey="revenue" 
              fill="#34D399" 
              radius={[0, 4, 4, 0]}
              maxBarSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default React.memo(ProductChart);
