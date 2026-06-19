import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { FiChevronLeft, FiChevronRight, FiSearch, FiDownload, FiArrowUp, FiArrowDown, FiLoader } from 'react-icons/fi';
import { exportToCSV, exportToExcel } from '../utils/exportUtils';
import { formatCurrency } from '../utils/helpers';

const ROW_HEIGHT = 44; // px
const VISIBLE_HEIGHT = 400; // px (height of table body viewport)

export const DataTable = ({ filters }) => {
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('Order_Datetime');
  const [sortDirection, setSortDirection] = useState('desc');
  const [localSearch, setLocalSearch] = useState('');

  // Sync local search when searchQuery is changed externally (e.g. reset/cleared)
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounce input to 450ms
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== searchQuery) {
        setSearchQuery(localSearch);
      }
    }, 450);
    return () => clearTimeout(handler);
  }, [localSearch, searchQuery]);

  const viewportRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Reset pagination when filters or searchQuery changes
  useEffect(() => {
    setCurrentPage(1);
    if (viewportRef.current) {
      viewportRef.current.scrollTop = 0;
    }
  }, [filters, searchQuery]);

  // Reset scroll top when page changes
  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = 0;
    }
  }, [currentPage, pageSize]);

  // Fetch paginated sales from backend
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: pageSize === 'All' ? 5000 : pageSize,
          search: searchQuery,
          sortBy: sortField,
          sortOrder: sortDirection,
          startDate: filters?.startDate || '',
          endDate: filters?.endDate || '',
          itemSearch: filters?.itemSearch || '',
          brand: filters?.brand?.join(',') || '',
          outlet: filters?.outlet?.join(',') || '',
          group: filters?.group?.join(',') || '',
          settlement: filters?.settlement?.join(',') || '',
          orderType: filters?.orderType?.join(',') || ''
        };

        const response = await axios.get('http://localhost:5000/api/sales', { params });
        if (isMounted) {
          setData(response.data.data);
          setTotalCount(response.data.total);
        }
      } catch (err) {
        console.error('Failed to fetch sales data:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [filters, currentPage, pageSize, searchQuery, sortField, sortDirection]);

  // Sort Toggle handler
  const handleSort = useCallback((field) => {
    setSortField((currentField) => {
      if (currentField === field) {
        setSortDirection((prevDir) => (prevDir === 'asc' ? 'desc' : 'asc'));
        return field;
      } else {
        setSortDirection('desc');
        return field;
      }
    });
  }, []);

  // Viewport scroll listener for custom virtualization
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  // Compute Virtual Indexes
  const totalRowsCount = data.length;
  const totalScrollHeight = totalRowsCount * ROW_HEIGHT;
  
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 5);
  const endIndex = Math.min(totalRowsCount, Math.ceil((scrollTop + VISIBLE_HEIGHT) / ROW_HEIGHT) + 5);

  const visibleRows = useMemo(() => {
    const rows = [];
    for (let i = startIndex; i < endIndex; i++) {
      const row = data[i];
      if (row) {
        rows.push({
          data: row,
          index: i,
          top: i * ROW_HEIGHT
        });
      }
    }
    return rows;
  }, [data, startIndex, endIndex]);

  const pageCount = useMemo(() => {
    if (pageSize === 'All') return 1;
    return Math.ceil(totalCount / pageSize) || 1;
  }, [totalCount, pageSize]);

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const params = {
        page: 1,
        limit: 1000000,
        search: searchQuery,
        sortBy: sortField,
        sortOrder: sortDirection,
        startDate: filters?.startDate || '',
        endDate: filters?.endDate || '',
        itemSearch: filters?.itemSearch || '',
        brand: filters?.brand?.join(',') || '',
        outlet: filters?.outlet?.join(',') || '',
        group: filters?.group?.join(',') || '',
        settlement: filters?.settlement?.join(',') || '',
        orderType: filters?.orderType?.join(',') || ''
      };
      
      const response = await axios.get('http://localhost:5000/api/sales', { params });
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
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const params = {
        page: 1,
        limit: 1000000,
        search: searchQuery,
        sortBy: sortField,
        sortOrder: sortDirection,
        startDate: filters?.startDate || '',
        endDate: filters?.endDate || '',
        itemSearch: filters?.itemSearch || '',
        brand: filters?.brand?.join(',') || '',
        outlet: filters?.outlet?.join(',') || '',
        group: filters?.group?.join(',') || '',
        settlement: filters?.settlement?.join(',') || '',
        orderType: filters?.orderType?.join(',') || ''
      };
      
      const response = await axios.get('http://localhost:5000/api/sales', { params });
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
  };

  return (
    <div className="w-full flex flex-col gap-4 p-5 rounded-2xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white/80 dark:bg-surface-darkCard/40 shadow-sm">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-xs font-bold text-text-lightSecondary dark:text-text-darkSecondary uppercase tracking-wider">
            Transaction Registry
          </h3>
          <p className="text-[10px] text-text-lightSecondary dark:text-text-darkSecondary mt-0.5">
            Audit-ready records matching active filters
          </p>
        </div>

        {/* Table Search & Export Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          {/* Inner Search - full width on mobile */}
          <div className="relative w-full sm:w-auto">
            <FiSearch className="absolute left-2.5 top-3 h-3.5 w-3.5 text-text-lightSecondary dark:text-text-darkSecondary" />
            <input
              type="text"
              placeholder="Search table..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full sm:w-48 rounded-xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard pl-8 pr-3 py-2.5 sm:py-1.5 text-xs text-text-lightPrimary dark:text-text-darkPrimary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-text-lightSecondary min-h-[44px] sm:min-h-0"
            />
          </div>

          {/* Export buttons row - side by side, full width on mobile */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:bg-zinc-100 dark:hover:bg-zinc-800/80 px-3 py-2.5 sm:py-1.5 text-xs font-bold text-text-lightPrimary dark:text-text-darkPrimary transition cursor-pointer disabled:opacity-50 flex-1 sm:flex-initial min-h-[44px] sm:min-h-0"
              title="Download CSV file of sorted dataset"
            >
              {isExporting ? <FiLoader className="w-3.5 h-3.5 text-primary animate-spin" /> : <FiDownload className="w-3.5 h-3.5 text-primary" />}
              <span>CSV</span>
            </button>

            {/* Export Excel */}
            <button
              onClick={handleExportExcel}
              disabled={isExporting}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:bg-zinc-100 dark:hover:bg-zinc-800/80 px-3 py-2.5 sm:py-1.5 text-xs font-bold text-text-lightPrimary dark:text-text-darkPrimary transition cursor-pointer disabled:opacity-50 flex-1 sm:flex-initial min-h-[44px] sm:min-h-0"
              title="Download formatted Excel worksheet"
            >
              {isExporting ? <FiLoader className="w-3.5 h-3.5 text-secondary animate-spin" /> : <FiDownload className="w-3.5 h-3.5 text-secondary" />}
              <span>Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Virtualized Table Scroll Area */}
      <div className="w-full overflow-x-auto custom-scrollbar border border-surface-lightBorder dark:border-surface-darkBorder rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20">
        <div className="min-w-[1000px] flex flex-col">
          {/* Header Row */}
          <div className="flex border-b border-surface-lightBorder dark:border-surface-darkBorder bg-zinc-100/50 dark:bg-zinc-900/30 py-3 text-left font-semibold text-[10px] text-text-lightSecondary dark:text-text-darkSecondary uppercase tracking-wider select-none">
            <div className="w-24 px-4 flex items-center gap-1 cursor-pointer hover:text-text-lightPrimary dark:hover:text-text-darkPrimary" onClick={() => handleSort('BillNo')}>
              Bill No {sortField === 'BillNo' && (sortDirection === 'asc' ? <FiArrowUp className="w-3 h-3 text-primary" /> : <FiArrowDown className="w-3 h-3 text-primary" />)}
            </div>
            <div className="w-36 px-4 flex items-center gap-1 cursor-pointer hover:text-text-lightPrimary dark:hover:text-text-darkPrimary" onClick={() => handleSort('Order_Datetime')}>
              Order Time {sortField === 'Order_Datetime' && (sortDirection === 'asc' ? <FiArrowUp className="w-3 h-3 text-primary" /> : <FiArrowDown className="w-3 h-3 text-primary" />)}
            </div>
            <div className="w-28 px-4 flex items-center gap-1 cursor-pointer hover:text-text-lightPrimary dark:hover:text-text-darkPrimary" onClick={() => handleSort('Brand')}>
              Brand {sortField === 'Brand' && (sortDirection === 'asc' ? <FiArrowUp className="w-3 h-3 text-primary" /> : <FiArrowDown className="w-3 h-3 text-primary" />)}
            </div>
            <div className="w-32 px-4 flex items-center gap-1 cursor-pointer hover:text-text-lightPrimary dark:hover:text-text-darkPrimary" onClick={() => handleSort('Outlet_Name')}>
              Outlet {sortField === 'Outlet_Name' && (sortDirection === 'asc' ? <FiArrowUp className="w-3 h-3 text-primary" /> : <FiArrowDown className="w-3 h-3 text-primary" />)}
            </div>
            <div className="w-28 px-4 flex items-center gap-1 cursor-pointer hover:text-text-lightPrimary dark:hover:text-text-darkPrimary" onClick={() => handleSort('Group_Name')}>
              Category {sortField === 'Group_Name' && (sortDirection === 'asc' ? <FiArrowUp className="w-3 h-3 text-primary" /> : <FiArrowDown className="w-3 h-3 text-primary" />)}
            </div>
            <div className="flex-1 px-4 flex items-center gap-1 cursor-pointer hover:text-text-lightPrimary dark:hover:text-text-darkPrimary" onClick={() => handleSort('Item')}>
              Menu Item {sortField === 'Item' && (sortDirection === 'asc' ? <FiArrowUp className="w-3 h-3 text-primary" /> : <FiArrowDown className="w-3 h-3 text-primary" />)}
            </div>
            <div className="w-20 px-4 flex items-center gap-1 cursor-pointer hover:text-text-lightPrimary dark:hover:text-text-darkPrimary" onClick={() => handleSort('Price')}>
              Price {sortField === 'Price' && (sortDirection === 'asc' ? <FiArrowUp className="w-3 h-3 text-primary" /> : <FiArrowDown className="w-3 h-3 text-primary" />)}
            </div>
            <div className="w-16 px-4 flex items-center gap-1 cursor-pointer hover:text-text-lightPrimary dark:hover:text-text-darkPrimary" onClick={() => handleSort('Quantity')}>
              Qty {sortField === 'Quantity' && (sortDirection === 'asc' ? <FiArrowUp className="w-3 h-3 text-primary" /> : <FiArrowDown className="w-3 h-3 text-primary" />)}
            </div>
            <div className="w-24 px-4 flex items-center gap-1 cursor-pointer hover:text-text-lightPrimary dark:hover:text-text-darkPrimary" onClick={() => handleSort('Revenue')}>
              Revenue {sortField === 'Revenue' && (sortDirection === 'asc' ? <FiArrowUp className="w-3 h-3 text-primary" /> : <FiArrowDown className="w-3 h-3 text-primary" />)}
            </div>
            <div className="w-24 px-4 flex items-center gap-1 cursor-pointer hover:text-text-lightPrimary dark:hover:text-text-darkPrimary" onClick={() => handleSort('Settlement')}>
              Settlement {sortField === 'Settlement' && (sortDirection === 'asc' ? <FiArrowUp className="w-3 h-3 text-primary" /> : <FiArrowDown className="w-3 h-3 text-primary" />)}
            </div>
            <div className="w-28 px-4 flex items-center gap-1 cursor-pointer hover:text-text-lightPrimary dark:hover:text-text-darkPrimary" onClick={() => handleSort('Order_Type')}>
              Channel {sortField === 'Order_Type' && (sortDirection === 'asc' ? <FiArrowUp className="w-3 h-3 text-primary" /> : <FiArrowDown className="w-3 h-3 text-primary" />)}
            </div>
          </div>

          {/* Virtual Body Area */}
          <div
            ref={viewportRef}
            onScroll={handleScroll}
            className="w-full overflow-y-auto custom-scrollbar relative"
            style={{ height: VISIBLE_HEIGHT }}
          >
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-zinc-950/50 flex items-center justify-center z-10 transition-opacity">
                <FiLoader className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}
            
            {totalRowsCount === 0 && !isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-text-lightSecondary dark:text-text-darkSecondary font-semibold">
                No matching transactional records found.
              </div>
            ) : (
              <div className="w-full relative" style={{ height: totalScrollHeight }}>
                {visibleRows.map(({ data: row, index: idx, top }) => {
                  const revVal = (row.Price || 0) * (row.Quantity || 0);
                  const isEven = idx % 2 === 0;
                  const orderDateFormatted = row.Order_Datetime ? row.Order_Datetime.replace('T', ' ').slice(0, 19) : '';

                  return (
                    <div
                      key={idx}
                      className={`absolute left-0 right-0 flex items-center text-xs text-text-lightPrimary dark:text-text-darkPrimary border-b border-surface-lightBorder/50 dark:border-surface-darkBorder/40 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 select-none ${
                        isEven ? 'bg-transparent' : 'bg-zinc-100/10 dark:bg-zinc-900/10'
                      }`}
                      style={{ top, height: ROW_HEIGHT }}
                    >
                      <div className="w-24 px-4 font-bold text-primary tracking-tight truncate">{row.BillNo}</div>
                      <div className="w-36 px-4 text-text-lightSecondary dark:text-text-darkSecondary font-medium truncate">{orderDateFormatted}</div>
                      <div className="w-28 px-4 font-semibold truncate">{row.Brand}</div>
                      <div className="w-32 px-4 font-medium truncate">{row.Outlet_Name}</div>
                      <div className="w-28 px-4 font-medium truncate">{row.Group}</div>
                      <div className="flex-1 px-4 font-semibold truncate">{row.Item}</div>
                      <div className="w-20 px-4 font-medium truncate">{formatCurrency(row.Price)}</div>
                      <div className="w-16 px-4 font-bold text-indigo-400 truncate">{row.Quantity}</div>
                      <div className="w-24 px-4 font-extrabold text-emerald-400 truncate">{formatCurrency(revVal)}</div>
                      <div className="w-24 px-4 font-semibold truncate">{row.Settlement}</div>
                      <div className="w-28 px-4 font-bold text-teal-400 truncate">{row.Order_Type}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 text-xs font-semibold text-text-lightSecondary dark:text-text-darkSecondary">
        
        {/* Statistics info */}
        <div className="text-center sm:text-left">
          Showing{' '}
          <span className="text-text-lightPrimary dark:text-text-darkPrimary">
            {totalCount === 0 ? 0 : (currentPage - 1) * (pageSize === 'All' ? totalCount : pageSize) + 1}
          </span>{' '}
          to{' '}
          <span className="text-text-lightPrimary dark:text-text-darkPrimary">
            {pageSize === 'All' ? totalCount : Math.min(currentPage * pageSize, totalCount)}
          </span>{' '}
          of{' '}
          <span className="text-text-lightPrimary dark:text-text-darkPrimary">
            {new Intl.NumberFormat().format(totalCount)}
          </span>{' '}
          records
        </div>

        {/* Action Pages */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          
          {/* Page size dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px]">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const val = e.target.value;
                setPageSize(val === 'All' ? 'All' : Number(val));
                setCurrentPage(1);
              }}
              className="rounded-xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-text-lightPrimary dark:text-text-darkPrimary text-xs"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={500}>500</option>
              <option value={1000}>1,000</option>
              <option value="All">All (Max 5,000)</option>
            </select>
          </div>

          {pageSize !== 'All' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
                title="Previous Page"
              >
                <FiChevronLeft className="w-3.5 h-3.5" />
              </button>
              
              <span>
                Page <span className="text-text-lightPrimary dark:text-text-darkPrimary">{currentPage}</span> of{' '}
                <span className="text-text-lightPrimary dark:text-text-darkPrimary">{pageCount}</span>
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(pageCount, prev + 1))}
                disabled={currentPage === pageCount}
                className="p-2 rounded-xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
                title="Next Page"
              >
                <FiChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default React.memo(DataTable);
