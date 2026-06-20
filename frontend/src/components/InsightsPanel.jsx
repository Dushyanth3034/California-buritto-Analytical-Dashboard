import React from 'react';
import { FiTrendingUp, FiAlertCircle, FiZap, FiCheckSquare, FiInfo, FiLoader } from 'react-icons/fi';
import { formatCurrency, formatLargeNumber } from '../utils/helpers';

// Helper to convert backend insight string to styled object
const getInsightDetails = (text) => {
  const lowercase = text.toLowerCase();
  
  let title = "Business Recommendation";
  let icon = <FiZap className="w-4 h-4 text-primary" />;

  if (lowercase.includes("recommendation")) {
    title = "Strategic Recommendation";
    icon = <FiCheckSquare className="w-4 h-4 text-primary" />;
  } else if (lowercase.includes("brand")) {
    title = "Brand Performance";
    icon = <FiZap className="w-4 h-4 text-indigo-400" />;
  } else if (lowercase.includes("order channel") || lowercase.includes("channel") || lowercase.includes("order type")) {
    title = "Channel Analytics";
    icon = <FiCheckSquare className="w-4 h-4 text-primary" />;
  } else if (lowercase.includes("product") || lowercase.includes("selling")) {
    title = "Product Insights";
    icon = <FiTrendingUp className="w-4 h-4 text-emerald-400" />;
  } else if (lowercase.includes("outlet")) {
    title = "Outlet Analytics";
    icon = <FiAlertCircle className="w-4 h-4 text-amber-400" />;
  } else if (lowercase.includes("category") || lowercase.includes("group")) {
    title = "Category Performance";
    icon = <FiTrendingUp className="w-4 h-4 text-emerald-400" />;
  } else if (lowercase.includes("payment") || lowercase.includes("settlement") || lowercase.includes("upi") || lowercase.includes("cash")) {
    title = "Settlement Insights";
    icon = <FiInfo className="w-4 h-4 text-sky-400" />;
  }

  return { title, icon, text };
};

/**
 * Premium Business Insights Engine.
 * Dynamically generates text summaries, metrics alerts, and strategic business recommendations.
 */
export const InsightsPanel = ({ kpis, charts, aiInsights = [], onGenerateInsights, isAiLoading }) => {
  const { brandRevenueData, outletRevenueData, productData, categoryRevenueData, orderTypeData, settlementData } = charts;

  // Compute leaders and percentages dynamically
  const topBrand = brandRevenueData[0] || { name: 'N/A', revenue: 0 };
  const topOutlet = outletRevenueData[0] || { name: 'N/A', revenue: 0 };
  const topCategory = categoryRevenueData[0] || { name: 'N/A', revenue: 0 };
  const topProduct = productData[0] || { name: 'N/A', revenue: 0, quantity: 0 };
  const topOrderType = orderTypeData[0] || { name: 'N/A', value: 0 };
  const topSettlement = settlementData[0] || { name: 'N/A', value: 0 };

  // Calculate percentages
  const topBrandShare = kpis.totalRevenue > 0 ? (topBrand.revenue / kpis.totalRevenue) * 100 : 0;
  const topOutletShare = kpis.totalRevenue > 0 ? (topOutlet.revenue / kpis.totalRevenue) * 100 : 0;
  const topCategoryShare = kpis.totalRevenue > 0 ? (topCategory.revenue / kpis.totalRevenue) * 100 : 0;
  const topOrderTypeShare = kpis.totalRevenue > 0 ? (topOrderType.value / kpis.totalRevenue) * 100 : 0;

  // Dynamic recommendations
  const insights = [
    {
      icon: <FiCheckSquare className="w-4 h-4 text-primary" />,
      title: `Optimize ${topOrderType.name} Operations`,
      text: `${topOrderType.name} represents ${topOrderTypeShare.toFixed(1)}% of your sales volume ($${formatLargeNumber(topOrderType.value)}). Review kitchen queueing and staffing allocations to optimize speed-to-table during peak hours.`
    },
    {
      icon: <FiZap className="w-4 h-4 text-indigo-400" />,
      title: `Brand Cross-Promotion`,
      text: `Your brand "${topBrand.name}" dominates with ${topBrandShare.toFixed(1)}% of net revenue. Consider bundle offers or cross-promoting lesser-performing brands under its umbrella to drive traffic.`
    },
    {
      icon: <FiTrendingUp className="w-4 h-4 text-emerald-400" />,
      title: `Menu Engineering in ${topCategory.name}`,
      text: `Category "${topCategory.name}" is the primary revenue engine ($${formatLargeNumber(topCategory.revenue)}). Introduce limited-time premium offerings in this menu group to increase average order values.`
    },
    {
      icon: <FiAlertCircle className="w-4 h-4 text-amber-400" />,
      title: `Payment Cost Management`,
      text: `Customers rely heavily on "${topSettlement.name}" for settlement. Renegotiate merchant processing rates for this specific provider to boost bottom-line margins.`
    }
  ];

  const displayInsights = React.useMemo(() => {
    if (aiInsights && aiInsights.length > 0) {
      return aiInsights.map(text => getInsightDetails(text));
    }
    return insights;
  }, [aiInsights, insights]);

  return (
    <div className="w-full h-full flex flex-col gap-5 p-5 rounded-2xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white/80 dark:bg-surface-darkCard/40 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-surface-lightBorder dark:border-surface-darkBorder pb-4">
        <div className="flex items-center gap-2">
          <FiZap className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-xs font-bold text-text-lightSecondary dark:text-text-darkSecondary uppercase tracking-wider">
              AI Business Insights
            </h3>
            <p className="text-[10px] text-text-lightSecondary dark:text-text-darkSecondary mt-0.5">
              Automated recommendations & operational highlights
            </p>
          </div>
        </div>
        {onGenerateInsights && (
          <button
            onClick={onGenerateInsights}
            disabled={isAiLoading}
            className="flex items-center gap-1.5 rounded-xl border border-primary/20 hover:border-primary/40 bg-zinc-50 dark:bg-surface-darkCard text-[10px] font-bold text-primary px-2.5 py-1.5 disabled:opacity-50 transition-colors"
          >
            {isAiLoading ? (
              <>
                <FiLoader className="w-3.5 h-3.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FiZap className="w-3.5 h-3.5" />
                Generate Insights
              </>
            )}
          </button>
        )}
      </div>

      {/* Grid: Stats Summary + Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Metric Summaries (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <h4 className="text-xs font-bold text-text-lightPrimary dark:text-text-darkPrimary flex items-center gap-1.5 mb-1">
            <FiInfo className="w-3.5 h-3.5 text-text-lightSecondary" />
            Performance Summary
          </h4>

          <div className="flex flex-col gap-2 text-xs">
            {/* Brand Leader */}
            <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/60 border border-surface-lightBorder dark:border-surface-darkBorder rounded-xl p-2.5 px-3">
              <span className="text-text-lightSecondary dark:text-text-darkSecondary font-semibold">Highest Brand</span>
              <span className="font-bold text-text-lightPrimary dark:text-text-darkPrimary">
                {topBrand.name} <span className="text-[10px] text-primary">({topBrandShare.toFixed(0)}%)</span>
              </span>
            </div>

            {/* Outlet Leader */}
            <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/60 border border-surface-lightBorder dark:border-surface-darkBorder rounded-xl p-2.5 px-3">
              <span className="text-text-lightSecondary dark:text-text-darkSecondary font-semibold">Top Outlet</span>
              <span className="font-bold text-text-lightPrimary dark:text-text-darkPrimary">
                {topOutlet.name} <span className="text-[10px] text-secondary">({topOutletShare.toFixed(0)}%)</span>
              </span>
            </div>

            {/* Category Leader */}
            <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/60 border border-surface-lightBorder dark:border-surface-darkBorder rounded-xl p-2.5 px-3">
              <span className="text-text-lightSecondary dark:text-text-darkSecondary font-semibold">Top Group</span>
              <span className="font-bold text-text-lightPrimary dark:text-text-darkPrimary">
                {topCategory.name} <span className="text-[10px] text-indigo-400">({topCategoryShare.toFixed(0)}%)</span>
              </span>
            </div>

            {/* Best Seller */}
            <div className="flex flex-col gap-1 bg-zinc-50 dark:bg-zinc-900/60 border border-surface-lightBorder dark:border-surface-darkBorder rounded-xl p-2.5 px-3">
              <div className="flex justify-between items-center">
                <span className="text-text-lightSecondary dark:text-text-darkSecondary font-semibold">Best Selling Product</span>
                <span className="font-bold text-text-lightPrimary dark:text-text-darkPrimary truncate max-w-[150px]">{topProduct.name}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-text-lightSecondary dark:text-text-darkSecondary font-semibold mt-1">
                <span>Revenue: {formatCurrency(topProduct.revenue)}</span>
                <span>Sold: {topProduct.quantity} units</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations list (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <h4 className="text-xs font-bold text-text-lightPrimary dark:text-text-darkPrimary flex items-center gap-1.5 mb-1">
            <FiZap className="w-3.5 h-3.5 text-primary" />
            Operational Recommendations
          </h4>

          <div className="flex flex-col gap-3 max-h-56 overflow-y-auto custom-scrollbar pr-1">
            {displayInsights.map((rec, idx) => (
              <div 
                key={idx}
                className="flex gap-3 bg-zinc-50 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 border border-surface-lightBorder dark:border-surface-darkBorder rounded-xl p-3 transition-colors"
              >
                <div className="flex items-center justify-center p-1.5 h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0">
                  {rec.icon}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-text-lightPrimary dark:text-text-darkPrimary leading-tight">
                    {rec.title}
                  </h5>
                  <p className="text-[10px] text-text-lightSecondary dark:text-text-darkSecondary font-medium mt-1 leading-relaxed">
                    {rec.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default React.memo(InsightsPanel);
