import React, { useMemo, useEffect, useState, Suspense, useCallback } from 'react';
import axios from 'axios';
import { useDashboardData } from '../hooks/useDashboardData';
import { useFilters } from '../hooks/useFilters';

// Static components
import Navbar from '../components/Navbar';
import Filters from '../components/Filters';
import LoadingSkeleton from '../components/LoadingSkeleton';

import { FiAlertTriangle, FiCpu, FiLoader } from 'react-icons/fi';

// Lazy loaded components for progressive loading
const KPICards = React.lazy(() => import('../components/KPICards'));
const InsightsPanel = React.lazy(() => import('../components/InsightsPanel'));
const RevenueChart = React.lazy(() => import('../components/RevenueChart'));
const BrandChart = React.lazy(() => import('../components/BrandChart'));
const OutletChart = React.lazy(() => import('../components/OutletChart'));
const CategoryChart = React.lazy(() => import('../components/CategoryChart'));
const ProductChart = React.lazy(() => import('../components/ProductChart'));
const SettlementChart = React.lazy(() => import('../components/SettlementChart'));
const OrderTypeChart = React.lazy(() => import('../components/OrderTypeChart'));
const DataTable = React.lazy(() => import('../components/DataTable'));

/**
 * Optimized Dashboard controller.
 * Binds active filters to server-side dynamic queries and updates 
 * the UI layout stages progressively.
 */
export const Dashboard = () => {
  const {
    filters,
    toggleFilter,
    setFilterList,
    setItemSearch,
    setDateRange,
    resetFilters,
    clearAllFilters
  } = useFilters();

  const {
    filterDomains,
    kpis,
    chartData,
    aiInsights,
    isLoading,
    error,
    isBackgroundLoading,
    backgroundStatus,
    fetchAiInsights,
    isAiLoading
  } = useDashboardData(filters);

  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = useCallback(async () => {
    setIsExporting(true);
    try {
      const params = {
        page: 1,
        limit: 1000000,
        startDate: filters?.startDate || '',
        endDate: filters?.endDate || '',
        itemSearch: filters?.itemSearch || '',
        brand: filters?.brand?.join(',') || '',
        outlet: filters?.outlet?.join(',') || '',
        group: filters?.group?.join(',') || '',
        settlement: filters?.settlement?.join(',') || '',
        orderType: filters?.orderType?.join(',') || ''
      };
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'https://california-dashboard-api.onrender.com'}/api/sales`, { params });
      const { exportToCSV } = await import('../utils/exportUtils');
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      exportToCSV(response.data.data, `sales_export_${yyyy}_${mm}_${dd}.csv`);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    } finally {
      setIsExporting(false);
    }
  }, [filters]);

  const handleExportExcel = useCallback(async () => {
    setIsExporting(true);
    try {
      const params = {
        page: 1,
        limit: 1000000,
        startDate: filters?.startDate || '',
        endDate: filters?.endDate || '',
        itemSearch: filters?.itemSearch || '',
        brand: filters?.brand?.join(',') || '',
        outlet: filters?.outlet?.join(',') || '',
        group: filters?.group?.join(',') || '',
        settlement: filters?.settlement?.join(',') || '',
        orderType: filters?.orderType?.join(',') || ''
      };
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'https://california-dashboard-api.onrender.com'}/api/sales`, { params });
      const { exportToExcel } = await import('../utils/exportUtils');
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      exportToExcel(response.data.data, `sales_export_${yyyy}_${mm}_${dd}.xlsx`);
    } catch (err) {
      console.error('Failed to export Excel:', err);
    } finally {
      setIsExporting(false);
    }
  }, [filters]);

  const [renderStage, setRenderStage] = useState(0);

  // Configure default date range bounds on initial workbook load
  useEffect(() => {
    if (filterDomains.dateRange.min && filterDomains.dateRange.max) {
      setDateRange(filterDomains.dateRange.min, filterDomains.dateRange.max);
    }
  }, [filterDomains.dateRange, setDateRange]);

  // Stage compiler for progressive layout loading
  useEffect(() => {
    if (filterDomains.brands.length > 0) {
      setRenderStage(1);
      // Load charts after 100ms
      const timer1 = setTimeout(() => {
        setRenderStage(2);
      }, 100);
      // Load table after 350ms
      const timer2 = setTimeout(() => {
        setRenderStage(3);
      }, 350);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setRenderStage(0);
    }
  }, [filterDomains.brands.length]);

  const hasData = filterDomains.brands.length > 0;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-lightPrimary dark:text-text-darkPrimary transition-colors duration-200">
      <Navbar
        datasetSize={300000}
        scaleDataset={() => {}}
        uploadExcelData={() => {}}
        isLoading={isLoading}
        isBackgroundLoading={isBackgroundLoading}
        backgroundStatus={backgroundStatus}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Error Alert Display */}
        {error && (
          <div className="flex items-center gap-3 p-4 border border-red-500/20 bg-red-500/5 text-red-500 dark:text-red-400 rounded-2xl text-xs font-semibold">
            <FiAlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold">Data pipeline error</p>
              <p className="text-[10px] mt-0.5 opacity-80">{error}</p>
            </div>
          </div>
        )}

        {/* 1. Static Filters Block */}
        <Filters
          filters={filters}
          filterDomains={filterDomains}
          toggleFilter={toggleFilter}
          setFilterList={setFilterList}
          setItemSearch={setItemSearch}
          setDateRange={setDateRange}
          resetFilters={resetFilters}
          clearAllFilters={clearAllFilters}
          onExportCSV={handleExportCSV}
          onExportExcel={handleExportExcel}
          isExporting={isExporting}
        />

        {/* Initial Workbook Processing State (Progressive loading blocker) */}
        {!hasData && isLoading && (
          <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white/80 dark:bg-surface-darkCard/20 shadow-sm gap-4">
            <div className="relative flex items-center justify-center">
              <FiLoader className="w-10 h-10 text-primary animate-spin" />
              <FiCpu className="absolute w-4 h-4 text-secondary animate-pulse" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-bold text-text-lightPrimary dark:text-text-darkPrimary">
                Preparing Analytics Database
              </h3>
              <p className="text-xs text-text-lightSecondary dark:text-text-darkSecondary mt-1.5 font-medium animate-pulse">
                Preparing database schema...
              </p>
            </div>
          </div>
        )}

        {/* No Data Fallback */}
        {!hasData && !isLoading && (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-surface-lightBorder dark:border-surface-darkBorder rounded-2xl bg-white/40 dark:bg-surface-darkCard/10">
            <FiAlertTriangle className="w-12 h-12 text-secondary animate-bounce" />
            <h3 className="text-sm font-bold mt-4 text-text-lightPrimary dark:text-text-darkPrimary">
              No Data Registry Available
            </h3>
            <p className="text-xs text-text-lightSecondary dark:text-text-darkSecondary mt-1">
              Check that the MySQL server is running and sales database is populated.
            </p>
          </div>
        )}

        {/* Presentation panels */}
        {hasData && (
          <div className="flex flex-col gap-6">
            
            {/* STAGE 1: Render KPIs immediately */}
            {renderStage >= 1 ? (
              <Suspense fallback={<LoadingSkeleton type="kpi" count={9} />}>
                <KPICards kpis={kpis} />
              </Suspense>
            ) : (
              <LoadingSkeleton type="kpi" count={9} />
            )}

            {/* STAGE 2: Render Advisory and Charts */}
            {renderStage >= 2 ? (
              <div className="flex flex-col gap-6">
                <Suspense fallback={<div className="h-64 rounded-2xl bg-zinc-800 animate-pulse" />}>
                  <InsightsPanel
                    kpis={kpis}
                    charts={chartData}
                    aiInsights={aiInsights}
                    onGenerateInsights={fetchAiInsights}
                    isAiLoading={isAiLoading}
                  />
                </Suspense>

                {/* Trend line and Settlement share */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 h-full">
                    <Suspense fallback={<LoadingSkeleton type="chart" count={1} />}>
                      <RevenueChart data={chartData.trendData} />
                    </Suspense>
                  </div>
                  <div className="lg:col-span-1 h-full">
                    <Suspense fallback={<LoadingSkeleton type="chart" count={1} />}>
                      <SettlementChart data={chartData.settlementData} />
                    </Suspense>
                  </div>
                </div>

                {/* Brand, Location, Menu Category */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Suspense fallback={<LoadingSkeleton type="chart" count={3} />}>
                    <BrandChart data={chartData.brandRevenueData} />
                    <OutletChart data={chartData.outletRevenueData} />
                    <CategoryChart data={chartData.categoryRevenueData} />
                  </Suspense>
                </div>

                {/* Products and Order Channel shares */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 h-full">
                    <Suspense fallback={<LoadingSkeleton type="chart" count={1} />}>
                      <ProductChart data={chartData.productData} />
                    </Suspense>
                  </div>
                  <div className="lg:col-span-1 h-full">
                    <Suspense fallback={<LoadingSkeleton type="chart" count={1} />}>
                      <OrderTypeChart data={chartData.orderTypeData} />
                    </Suspense>
                  </div>
                </div>
              </div>
            ) : (
              <LoadingSkeleton type="chart" count={3} />
            )}

            {/* STAGE 3: Render Large Virtualized Data Table last */}
            {renderStage >= 3 ? (
              <Suspense fallback={<LoadingSkeleton type="table" />}>
                <DataTable filters={filters} />
              </Suspense>
            ) : (
              <LoadingSkeleton type="table" />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
