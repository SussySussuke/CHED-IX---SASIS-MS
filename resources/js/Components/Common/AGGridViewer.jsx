import React, { useMemo, useCallback, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useAGGridTheme, useAGGridMinHeightRemoval, getAGGridAutoHeightClass } from '@/Hooks/useAGGridTheme';
import { IoSearch, IoClose } from 'react-icons/io5';

/**
 * Universal AG Grid Viewer Component
 * Read-only table optimized for viewing and displaying data
 * 
 * Features:
 * - Quick Filter (general search across all columns)
 * - Cell Selection with header highlight
 * - Column Hover highlighting
 * - Column Resizing
 * - Pagination
 * - Column Menu with filters
 * - Auto-height for small datasets
 * - Removes AG Grid's 150px minimum height restriction
 * 
 * @param {Object} props
 * @param {Array} props.rowData - Array of data objects
 * @param {Array} props.columnDefs - AG Grid column definitions
 * @param {number} props.paginationPageSize - Rows per page (default: 25)
 * @param {Array} props.paginationPageSizeSelector - Page size options (default: [25, 50, 100, 500])
 * @param {boolean} props.enableQuickFilter - Show search bar (default: true)
 * @param {string} props.quickFilterPlaceholder - Search placeholder (default: 'Search...')
 * @param {Object} props.gridOptions - Additional AG Grid options
 * @param {string} props.height - Grid height for normal mode (default: '600px')
 * @param {boolean} props.autoHeightForSmallData - Auto-switch to domLayout: 'autoHeight' for small datasets (default: true)
 * @param {number} props.autoHeightThreshold - Row count threshold for auto-height (default: 10)
 */
const AGGridViewer = ({
  rowData = [],
  columnDefs = [],
  paginationPageSize = 25,
  paginationPageSizeSelector = [25, 50, 100, 500],
  enableQuickFilter = true,
  quickFilterPlaceholder = 'Search...',
  gridOptions = {},
  height = '600px',
  autoHeightForSmallData = true,
  autoHeightThreshold = 10,
}) => {
  const gridRef = useRef(null);
  const [quickFilterText, setQuickFilterText] = React.useState('');
  
  // Use shared theme hook
  const theme = useAGGridTheme({ isEditor: false });
  
  // Inject CSS to remove min-height
  useAGGridMinHeightRemoval('viewer');

  // Determine if we should use auto-height
  const shouldUseAutoHeight = useMemo(() => {
    // Manual override via gridOptions takes precedence
    if (gridOptions.domLayout === 'autoHeight') {
      return true;
    }
    
    // Auto-detection based on row count
    if (autoHeightForSmallData && rowData.length <= autoHeightThreshold) {
      return true;
    }
    
    return false;
  }, [rowData.length, autoHeightForSmallData, autoHeightThreshold, gridOptions.domLayout]);

  // Default grid options for viewer
  const defaultGridOptions = useMemo(() => {
    const options = {
      theme,
      enableCellTextSelection: true,
      ensureDomOrder: true,
      columnHoverHighlight: true,
      enableRangeSelection: false,
      readOnlyEdit: true,
      suppressClickEdit: true,
      animateRows: true,
      rowHeight: 40,
      headerHeight: 44,
      defaultColDef: {
        flex: 1,
        minWidth: 100,
        resizable: true,
        sortable: true,
        filter: true,
        floatingFilter: false,
      },
      // Conditionally add pagination and domLayout
      ...(shouldUseAutoHeight 
        ? {
            domLayout: 'autoHeight',
            pagination: false,
          }
        : {
            pagination: true,
            paginationPageSize,
            paginationPageSizeSelector,
          }
      ),
      ...gridOptions,
    };
    
    return options;
  }, [theme, paginationPageSize, paginationPageSizeSelector, shouldUseAutoHeight, gridOptions]);

  // Quick filter handler
  const onQuickFilterChanged = useCallback((event) => {
    const value = event.target.value;
    setQuickFilterText(value);
    if (gridRef.current) {
      gridRef.current.api.setGridOption('quickFilterText', value);
    }
  }, []);

  // Clear quick filter
  const clearQuickFilter = useCallback(() => {
    setQuickFilterText('');
    if (gridRef.current) {
      gridRef.current.api.setGridOption('quickFilterText', '');
    }
  }, []);

  // Dynamic container style
  const containerStyle = useMemo(() => {
    if (shouldUseAutoHeight) {
      // Auto-height mode: no fixed height, let it grow naturally
      return {};
    }
    // Normal mode: use the height prop
    return { height };
  }, [shouldUseAutoHeight, height]);

  // Dynamic class name - apply auto-height class when needed
  const containerClassName = useMemo(() => {
    const baseClasses = "ag-theme-quartz rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700";
    const autoHeightClass = getAGGridAutoHeightClass('viewer');
    return shouldUseAutoHeight 
      ? `${baseClasses} ${autoHeightClass}`
      : baseClasses;
  }, [shouldUseAutoHeight]);

  return (
    <div className="space-y-2">
      {/* Quick Filter Search Bar */}
      {enableQuickFilter && (
        <div className="px-3 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="relative w-full">
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={quickFilterText}
              onChange={onQuickFilterChanged}
              placeholder={quickFilterPlaceholder}
              className="w-full pl-9 pr-8 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500"
            />
            {quickFilterText && (
              <button
                onClick={clearQuickFilter}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <IoClose className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* AG Grid */}
      <div 
        className={containerClassName}
        style={containerStyle}
      >
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          {...defaultGridOptions}
        />
      </div>
    </div>
  );
};

export default AGGridViewer;
