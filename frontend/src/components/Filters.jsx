import React, { useState, useEffect, useRef } from 'react';
import { FiFilter, FiRefreshCw, FiSearch, FiCalendar, FiChevronDown, FiX, FiCheck, FiDownload, FiLoader } from 'react-icons/fi';

/**
 * Custom Popover Multi-Select Dropdown Component.
 * Supports filtering list options, toggling all, outside clicks, and count badges.
 */
const MultiSelectDropdown = React.memo(({ title, options, selectedValues, onToggle, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  // Close dropdown on clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const filteredOptions = options.filter(option =>
    String(option).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative text-left w-full md:w-auto" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 w-full md:w-auto rounded-xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard px-3 py-2 text-xs font-semibold text-text-lightPrimary dark:text-text-darkPrimary hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all cursor-pointer min-h-[44px] md:min-h-0 ${
          selectedValues.length > 0 ? 'border-primary ring-2 ring-primary/10' : ''
        }`}
      >
        <span className="truncate">
          {selectedValues.length === 0
            ? title
            : `${title} (${selectedValues.length})`}
        </span>
        <FiChevronDown className={`w-3.5 h-3.5 text-text-lightSecondary dark:text-text-darkSecondary transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-full md:w-60 z-30 rounded-xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white dark:bg-zinc-950 p-2.5 shadow-xl transition-all">
          {/* Internal search if options list is long */}
          {options.length > 5 && (
            <div className="relative mb-2">
              <FiSearch className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-text-lightSecondary dark:text-text-darkSecondary" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-surface-lightBorder dark:border-surface-darkBorder bg-zinc-50 dark:bg-surface-darkCard pl-8 pr-3 py-1.5 text-xs text-text-lightPrimary dark:text-text-darkPrimary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          )}

          {/* Action buttons (Clear) */}
          {selectedValues.length > 0 && (
            <div className="flex items-center justify-between border-b border-surface-lightBorder dark:border-surface-darkBorder pb-2 mb-2">
              <span className="text-[10px] text-text-lightSecondary dark:text-text-darkSecondary font-bold">
                {selectedValues.length} Selected
              </span>
              <button
                type="button"
                onClick={onClear}
                className="text-[10px] font-bold text-secondary hover:underline cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Scrollable checklist */}
          <div className="max-h-48 overflow-y-auto custom-scrollbar flex flex-col gap-0.5">
            {filteredOptions.length === 0 ? (
              <span className="text-center py-2 text-xs text-text-lightSecondary dark:text-text-darkSecondary">
                No items found
              </span>
            ) : (
              filteredOptions.map((opt) => {
                const isChecked = selectedValues.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onToggle(opt)}
                    className="flex items-center justify-between text-left w-full rounded-lg px-2 py-1.5 text-xs text-text-lightPrimary dark:text-text-darkPrimary hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer font-medium"
                  >
                    <span className="truncate">{opt}</span>
                    {isChecked ? (
                      <FiCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 border border-surface-lightBorder dark:border-surface-darkBorder rounded shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
});

/**
 * Filter panel wrapping all dimensions.
 * Three-tier responsive layout:
 *   Mobile  (<md):  stacked column, full-width controls, 44px touch targets, collapsible
 *   Tablet  (md):   wrapping flex row, 2-col feel via min-widths
 *   Desktop (lg+):  single horizontal row, compact, professional
 */
export const Filters = ({
  filters,
  filterDomains,
  toggleFilter,
  setFilterList,
  setItemSearch,
  setDateRange,
  resetFilters,
  clearAllFilters,
  onExportCSV,
  onExportExcel,
  isExporting
}) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.itemSearch);

  // Sync local search when filters.itemSearch is changed externally
  useEffect(() => {
    setLocalSearch(filters.itemSearch);
  }, [filters.itemSearch]);

  // Debounce the parent update to 400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== filters.itemSearch) {
        setItemSearch(localSearch);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [localSearch, setItemSearch, filters.itemSearch]);

  const hasActiveFilters =
    filters.brand.length > 0 ||
    filters.outlet.length > 0 ||
    filters.group.length > 0 ||
    filters.orderType.length > 0 ||
    filters.settlement.length > 0 ||
    filters.itemSearch !== '' ||
    filters.startDate !== filterDomains.dateRange.min ||
    filters.endDate !== filterDomains.dateRange.max;

  return (
    <div className="w-full">

      {/* ═══════════════════════════════════════════════════
          HEADER BAR
          Desktop/Tablet (md+): single horizontal row
          Mobile (<md):         stacked rows with collapsible toggle
      ═══════════════════════════════════════════════════ */}
      <div className="bg-white/80 dark:bg-surface-darkCard/50 border border-surface-lightBorder dark:border-surface-darkBorder rounded-2xl shadow-sm overflow-hidden">

        {/* ── Desktop & Tablet header (md+): one row ── */}
        <div className="hidden md:flex items-center justify-between gap-3 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <FiFilter className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-text-lightPrimary dark:text-text-darkPrimary">
              Smart Filters
            </h2>
            {hasActiveFilters && (
              <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
            )}
          </div>

          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={() => resetFilters(filterDomains.dateRange)}
                className="flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-secondary/80 transition cursor-pointer shrink-0"
              >
                <FiRefreshCw className="w-3 h-3" />
                Reset Filters
              </button>
            )}
            <button
              type="button"
              onClick={onExportCSV}
              disabled={isExporting}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:bg-zinc-100 dark:hover:bg-zinc-800/80 px-3 py-1.5 text-xs font-bold text-text-lightPrimary dark:text-text-darkPrimary transition cursor-pointer disabled:opacity-50 shrink-0"
              title="Export filtered records as CSV"
            >
              {isExporting ? <FiLoader className="w-3.5 h-3.5 text-primary animate-spin" /> : <FiDownload className="w-3.5 h-3.5 text-primary" />}
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={onExportExcel}
              disabled={isExporting}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:bg-zinc-100 dark:hover:bg-zinc-800/80 px-3 py-1.5 text-xs font-bold text-text-lightPrimary dark:text-text-darkPrimary transition cursor-pointer disabled:opacity-50 shrink-0"
              title="Export filtered records as Excel"
            >
              {isExporting ? <FiLoader className="w-3.5 h-3.5 text-secondary animate-spin" /> : <FiDownload className="w-3.5 h-3.5 text-secondary" />}
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* ── Mobile header (<md): compact stacked rows ── */}
        <div className="flex flex-col gap-2.5 md:hidden px-4 py-3.5">

          {/* Row 1: Title + Show/Hide toggle */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FiFilter className="w-4 h-4 text-primary shrink-0" />
              <h2 className="text-sm font-bold text-text-lightPrimary dark:text-text-darkPrimary truncate">
                Smart Filters
              </h2>
              {hasActiveFilters && (
                <span className="inline-flex h-2 w-2 rounded-full bg-primary shrink-0" />
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center justify-center rounded-xl border border-surface-lightBorder dark:border-surface-darkBorder px-3 py-2 text-xs font-bold text-text-lightPrimary dark:text-text-darkPrimary bg-white dark:bg-surface-darkCard cursor-pointer shrink-0 min-h-[44px]"
            >
              {showMobileFilters ? 'Hide' : 'Filters'}
            </button>
          </div>

          {/* Row 2: Action buttons — all in one row */}
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={() => resetFilters(filterDomains.dateRange)}
                className="flex items-center justify-center gap-1 text-[11px] font-bold text-secondary border border-surface-lightBorder dark:border-surface-darkBorder rounded-xl px-2 py-2 bg-white dark:bg-surface-darkCard hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition cursor-pointer flex-1 min-h-[44px] min-w-0"
              >
                <FiRefreshCw className="w-3 h-3 shrink-0" />
                <span className="truncate">Reset</span>
              </button>
            )}
            <button
              type="button"
              onClick={onExportCSV}
              disabled={isExporting}
              className="flex items-center justify-center gap-1 rounded-xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:bg-zinc-100 dark:hover:bg-zinc-800/80 px-2 py-2 text-[11px] font-bold text-text-lightPrimary dark:text-text-darkPrimary transition cursor-pointer disabled:opacity-50 flex-1 min-h-[44px] min-w-0"
              title="Export CSV"
            >
              {isExporting ? <FiLoader className="w-3.5 h-3.5 text-primary animate-spin shrink-0" /> : <FiDownload className="w-3.5 h-3.5 text-primary shrink-0" />}
              <span className="truncate">CSV</span>
            </button>
            <button
              type="button"
              onClick={onExportExcel}
              disabled={isExporting}
              className="flex items-center justify-center gap-1 rounded-xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:bg-zinc-100 dark:hover:bg-zinc-800/80 px-2 py-2 text-[11px] font-bold text-text-lightPrimary dark:text-text-darkPrimary transition cursor-pointer disabled:opacity-50 flex-1 min-h-[44px] min-w-0"
              title="Export Excel"
            >
              {isExporting ? <FiLoader className="w-3.5 h-3.5 text-secondary animate-spin shrink-0" /> : <FiDownload className="w-3.5 h-3.5 text-secondary shrink-0" />}
              <span className="truncate">Excel</span>
            </button>
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          FILTER CONTROLS PANEL
          Mobile (<md):  hidden until toggled, stacked column
          Desktop (md+): always visible, horizontal wrapping row
      ═══════════════════════════════════════════════════ */}
      <div className={`mt-3 ${showMobileFilters ? 'block' : 'hidden'} md:block`}>
        <div className="bg-white/80 dark:bg-surface-darkCard/30 border border-surface-lightBorder dark:border-surface-darkBorder rounded-2xl p-4 shadow-sm">

          {/*
            Filter controls row:
              Mobile  (<md): flex-col, each control full-width, stacked
              Tablet  (md):  flex-wrap, controls auto-size (min-w via content)
              Desktop (lg+): flex-row flex-wrap, all controls inline
          */}
          <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-3">

            {/* Search Input */}
            <div className="relative w-full md:flex-1 md:min-w-[180px] md:max-w-[260px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-lightSecondary dark:text-text-darkSecondary" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full rounded-xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard pl-9 pr-8 py-2 text-xs text-text-lightPrimary dark:text-text-darkPrimary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-text-lightSecondary min-h-[44px] md:min-h-0"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-lightSecondary dark:text-text-darkSecondary hover:text-text-lightPrimary"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Date Range Picker */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 border border-surface-lightBorder dark:border-surface-darkBorder rounded-xl bg-white dark:bg-surface-darkCard p-2.5 md:px-3 md:py-1.5 w-full md:w-auto md:shrink-0">
              <div className="flex items-center gap-2">
                <FiCalendar className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-[10px] text-text-lightSecondary dark:text-text-darkSecondary font-bold md:hidden uppercase tracking-wider">Start:</span>
                <input
                  type="date"
                  value={filters.startDate}
                  min={filterDomains.dateRange.min}
                  max={filterDomains.dateRange.max}
                  onChange={(e) => setDateRange(e.target.value, filters.endDate)}
                  className="bg-transparent border-0 text-xs font-semibold focus:outline-none text-text-lightPrimary dark:text-text-darkPrimary cursor-pointer flex-1 md:flex-initial"
                  title="Start Date"
                />
              </div>
              <span className="hidden md:inline text-text-lightSecondary dark:text-text-darkSecondary text-xs font-bold">to</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-text-lightSecondary dark:text-text-darkSecondary font-bold md:hidden uppercase tracking-wider">End:</span>
                <input
                  type="date"
                  value={filters.endDate}
                  min={filterDomains.dateRange.min}
                  max={filterDomains.dateRange.max}
                  onChange={(e) => setDateRange(filters.startDate, e.target.value)}
                  className="bg-transparent border-0 text-xs font-semibold focus:outline-none text-text-lightPrimary dark:text-text-darkPrimary cursor-pointer flex-1 md:flex-initial"
                  title="End Date"
                />
              </div>
            </div>

            {/* Multi-Select Dropdowns */}
            <MultiSelectDropdown
              title="Brand"
              options={filterDomains.brands}
              selectedValues={filters.brand}
              onToggle={(val) => toggleFilter('brand', val)}
              onClear={() => setFilterList('brand', [])}
            />

            <MultiSelectDropdown
              title="Outlet"
              options={filterDomains.outlets}
              selectedValues={filters.outlet}
              onToggle={(val) => toggleFilter('outlet', val)}
              onClear={() => setFilterList('outlet', [])}
            />

            <MultiSelectDropdown
              title="Category"
              options={filterDomains.groups}
              selectedValues={filters.group}
              onToggle={(val) => toggleFilter('group', val)}
              onClear={() => setFilterList('group', [])}
            />

            <MultiSelectDropdown
              title="Order Type"
              options={filterDomains.orderTypes}
              selectedValues={filters.orderType}
              onToggle={(val) => toggleFilter('orderType', val)}
              onClear={() => setFilterList('orderType', [])}
            />

            <MultiSelectDropdown
              title="Settlement"
              options={filterDomains.settlements}
              selectedValues={filters.settlement}
              onToggle={(val) => toggleFilter('settlement', val)}
              onClear={() => setFilterList('settlement', [])}
            />

          </div>
        </div>
      </div>

    </div>
  );
};

export default React.memo(Filters);
