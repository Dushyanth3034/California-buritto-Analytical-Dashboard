import React from 'react';
import { 
  FiDollarSign, 
  FiShoppingBag, 
  FiBox, 
  FiAward, 
  FiMapPin, 
  FiTag, 
  FiCreditCard, 
  FiStar, 
  FiGrid 
} from 'react-icons/fi';
import { formatCurrency, formatLargeNumber, formatNumber } from '../utils/helpers';

/**
 * KPI Grid component containing 9 metric highlights.
 * Incorporates subtle hover effects and glassmorphism.
 */
export const KPICards = ({ kpis }) => {
  const cards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(kpis.totalRevenue),
      subtitle: 'Net sales generated',
      icon: <FiDollarSign className="w-4 h-4 text-primary" />,
      accent: 'border-b-primary'
    },
    {
      title: 'Total Orders',
      value: formatNumber(kpis.totalOrders),
      subtitle: 'Unique transactions',
      icon: <FiShoppingBag className="w-4 h-4 text-indigo-400" />,
      accent: 'border-b-indigo-400'
    },
    {
      title: 'Qty Sold',
      value: formatLargeNumber(kpis.totalQuantitySold),
      subtitle: 'Total items purchased',
      icon: <FiBox className="w-4 h-4 text-emerald-400" />,
      accent: 'border-b-emerald-400'
    },
    {
      title: 'Active Brands',
      value: kpis.totalBrands,
      subtitle: 'Operating franchises',
      icon: <FiAward className="w-4 h-4 text-amber-400" />,
      accent: 'border-b-amber-400'
    },
    {
      title: 'Active Outlets',
      value: kpis.totalOutlets,
      subtitle: 'Sales locations',
      icon: <FiMapPin className="w-4 h-4 text-cyan-400" />,
      accent: 'border-b-cyan-400'
    },
    {
      title: 'Avg Order Value',
      value: formatCurrency(kpis.avgOrderValue),
      subtitle: 'Per-order average',
      icon: <FiTag className="w-4 h-4 text-rose-400" />,
      accent: 'border-b-rose-400'
    },
    {
      title: 'Settlement Method',
      value: kpis.mostUsedSettlement,
      subtitle: 'Most frequent payment',
      icon: <FiCreditCard className="w-4 h-4 text-purple-400" />,
      accent: 'border-b-purple-400'
    },
    {
      title: 'Top Brand',
      value: kpis.bestPerformingBrand,
      subtitle: 'Highest revenue creator',
      icon: <FiStar className="w-4 h-4 text-yellow-400" />,
      accent: 'border-b-yellow-400'
    },
    {
      title: 'Top Category',
      value: kpis.topSellingCategory,
      subtitle: 'Highest demand group',
      icon: <FiGrid className="w-4 h-4 text-teal-400" />,
      accent: 'border-b-teal-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 w-full">
      {cards.map((card, idx) => (
        <div 
          key={idx}
          className="relative flex flex-col justify-between p-3 sm:p-4 rounded-2xl glass-card border border-surface-lightBorder dark:border-surface-darkBorder bg-white/80 dark:bg-surface-darkCard/60 hover:shadow-lg dark:hover:shadow-glass hover:-translate-y-0.5 transition-all duration-200 min-w-0"
        >
          {/* Top Row: Title and Icon */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-text-lightSecondary dark:text-text-darkSecondary uppercase tracking-wider truncate">
              {card.title}
            </span>
            <div className="flex items-center justify-center p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 shrink-0">
              {card.icon}
            </div>
          </div>

          {/* Value Section */}
          <div className="mt-2.5">
            <h3 className="text-md sm:text-lg font-extrabold tracking-tight text-text-lightPrimary dark:text-text-darkPrimary truncate" title={card.value}>
              {card.value}
            </h3>
            <p className="text-[9px] text-text-lightSecondary dark:text-text-darkSecondary font-medium truncate mt-0.5">
              {card.subtitle}
            </p>
          </div>
          
          {/* Small accent base line for premium touch */}
          <div className={`absolute bottom-0 left-4 right-4 h-[2px] rounded-t-full border-b ${card.accent}`} />
        </div>
      ))}
    </div>
  );
};

export default React.memo(KPICards);
