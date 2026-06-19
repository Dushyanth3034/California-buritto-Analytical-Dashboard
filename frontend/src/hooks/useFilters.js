import { useState, useCallback } from 'react';

const DEFAULT_FILTERS = {
  brand: [],
  outlet: [],
  group: [],
  orderType: [],
  settlement: [],
  itemSearch: '',
  startDate: '',
  endDate: ''
};

/**
 * Custom hook for managing multi-select dashboard filter state.
 */
export const useFilters = () => {
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });

  const toggleFilter = useCallback((category, value) => {
    setFilters((prev) => {
      const currentList = prev[category] || [];
      const updatedList = currentList.includes(value)
        ? currentList.filter(item => item !== value)
        : [...currentList, value];
      return {
        ...prev,
        [category]: updatedList
      };
    });
  }, []);

  const setFilterList = useCallback((category, list) => {
    setFilters((prev) => ({
      ...prev,
      [category]: list
    }));
  }, []);

  const setItemSearch = useCallback((query) => {
    setFilters((prev) => ({
      ...prev,
      itemSearch: query
    }));
  }, []);

  const setDateRange = useCallback((start, end) => {
    setFilters((prev) => ({
      ...prev,
      startDate: start || '',
      endDate: end || ''
    }));
  }, []);

  const resetFilters = useCallback((defaultDates = {}) => {
    setFilters({
      ...DEFAULT_FILTERS,
      startDate: defaultDates.min || '',
      endDate: defaultDates.max || ''
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
  }, []);

  return {
    filters,
    toggleFilter,
    setFilterList,
    setItemSearch,
    setDateRange,
    resetFilters,
    clearAllFilters
  };
};
export default useFilters;
