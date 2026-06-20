import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const API_BASE = `${import.meta.env.VITE_API_URL || 'https://california-dashboard-api.onrender.com'}/api`;

/**
 * Custom hook to load and manage dashboard aggregations, KPIs, and charts.
 * Automatically handles API calls to the Node.js/Express/MySQL backend server.
 */
export const useDashboardData = (filters) => {
  const [filterDomains, setFilterDomains] = useState({
    brands: [],
    outlets: [],
    groups: [],
    orderTypes: [],
    settlements: [],
    dateRange: { min: '', max: '' }
  });

  const [kpis, setKpis] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalQuantitySold: 0,
    totalBrands: 0,
    totalOutlets: 0,
    avgOrderValue: 0,
    mostUsedSettlement: 'N/A',
    bestPerformingBrand: 'N/A',
    topSellingCategory: 'N/A'
  });

  const [chartData, setChartData] = useState({
    trendData: [],
    brandRevenueData: [],
    outletRevenueData: [],
    categoryRevenueData: [],
    productData: [],
    settlementData: [],
    orderTypeData: []
  });

  const [aiInsights, setAiInsights] = useState([]);
  const hasLoadedAiRef = useRef(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  const [backgroundStatus, setBackgroundStatus] = useState('');

  // 1. Fetch filter domains once on mount
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await axios.get(`${API_BASE}/filter-options`);
        const data = response.data;
        setFilterDomains({
          brands: data.brands || [],
          outlets: data.outlets || [],
          groups: data.groups || [],
          orderTypes: data.orderTypes || [],
          settlements: data.settlements || [],
          dateRange: data.dateRange || { min: '2024-11-01', max: '2024-11-30' }
        });
      } catch (err) {
        console.error('Failed to load filter options:', err);
        setError('Failed to connect to backend server. Make sure node server is running.');
      }
    };
    fetchDomains();
  }, []);

  const fetchAiInsights = useCallback(async () => {
    if (!filters) return;
    setIsAiLoading(true);
    try {
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        search: filters.itemSearch,
        brand: filters.brand.join(','),
        outlet: filters.outlet.join(','),
        group: filters.group.join(','),
        settlement: filters.settlement.join(','),
        orderType: filters.orderType.join(',')
      };
      const response = await axios.get(`${API_BASE}/ai-insights`, { params });
      if (response && response.data) {
        setAiInsights(response.data.insights || []);
      }
    } catch (err) {
      console.error('Failed to fetch AI insights manually:', err);
    } finally {
      setIsAiLoading(false);
    }
  }, [filters]);

  // 2. Fetch KPIs and Chart data whenever filters change
  useEffect(() => {
    if (!filters) return;

    const fetchSummary = async () => {
      setIsBackgroundLoading(true);
      setBackgroundStatus('Updating dashboard charts...');
      try {
        const params = {
          startDate: filters.startDate,
          endDate: filters.endDate,
          search: filters.itemSearch,
          brand: filters.brand.join(','),
          outlet: filters.outlet.join(','),
          group: filters.group.join(','),
          settlement: filters.settlement.join(','),
          orderType: filters.orderType.join(',')
        };

        if (!hasLoadedAiRef.current && filters.startDate) {
          hasLoadedAiRef.current = true;
          setIsAiLoading(true);
          axios.get(`${API_BASE}/ai-insights`, { params })
            .then(res => {
              if (res && res.data) {
                setAiInsights(res.data.insights || []);
              }
            })
            .catch(err => {
              console.error('Failed to fetch AI insights on initial load:', err);
            })
            .finally(() => {
              setIsAiLoading(false);
            });
        }

        const summaryRes = await axios.get(`${API_BASE}/dashboard-summary`, { params });

        if (summaryRes && summaryRes.data) {
          console.log("Revenue Trend API Response:", summaryRes.data.charts.trendData);
          setKpis(summaryRes.data.kpis);
          setChartData(summaryRes.data.charts);
        }

        setError(null);
        setBackgroundStatus('Connected to Database');
      } catch (err) {
        console.error('Failed to fetch dashboard summary:', err);
        setError('Failed to update dashboard data. Please try again.');
        setBackgroundStatus('Error syncing data');
      } finally {
        setIsBackgroundLoading(false);
        setIsLoading(false);
      }
    };

    // Debounce filter changes slightly to prevent excessive queries while user types search or selects multiple options
    const timer = setTimeout(() => {
      fetchSummary();
    }, 150);

    return () => clearTimeout(timer);
  }, [filters]);

  return {
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
  };
};

export default useDashboardData;
