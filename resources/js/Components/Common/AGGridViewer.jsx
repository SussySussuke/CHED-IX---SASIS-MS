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
 * - Grand Total pinned bottom row (pass pinnedBottomRowData to enable)
 *
 * Grand Total row behaviour:
 *   - Cells in the pinned-bottom row that have a cellRenderer (buttons, badges,
 *     links) are intercepted: the guard renders plain formatted numbers / "—"
 *     instead of the interactive widget. This prevents false affordances on the
 *     totals row (e.g. drilldown buttons that have no HEI to drill into).
 *   - Columns that have NO cellRenderer are left completely untouched. AG Grid's
 *     default rendering handles them fine — and installing a renderer on those
 *     columns (even one that returns undefined) wipes their output for all rows,
 *     which is what caused the blank hei_name regression.
 *   - The guard is applied transparently inside this component; no section
 *     config or SummaryView column-def changes are required.
 *
 * @param {Object}  props
 * @param {Array}   props.rowData
 * @param {Array}   props.columnDefs
 * @param {Array}   [props.pinnedBottomRowData]      - Grand total row(s); [] or omit to disable
 * @param {number}  props.paginationPageSize
 * @param {Array}   props.paginationPageSizeSelector
 * @param {boolean} props.enableQuickFilter
 * @param {string}  props.quickFilterPlaceholder
 * @param {Object}  props.gridOptions
 * @param {string}  props.height
 * @param {boolean} props.autoHeightForSmallData
 * @param {number}  props.autoHeightThreshold
 */
const AGGridViewer = ({
  rowData = [],
  columnDefs = [],
  pinnedBottomRowData = [],
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

  const theme = useAGGridTheme({ isEditor: false });
  useAGGridMinHeightRemoval('viewer');

  const shouldUseAutoHeight = useMemo(() => {
    if (gridOptions.domLayout === 'autoHeight') return true;
    if (autoHeightForSmallData && rowData.length <= autoHeightThreshold) return true;
    return false;
  }, [rowData.length, autoHeightForSmallData, autoHeightThreshold, gridOptions.domLayout]);

  // ─── Pinned-row cell renderer guard ────────────────────────────────────────
  //
  // Only wraps leaf columns that ALREADY have a cellRenderer. Columns without
  // one are left completely alone — installing a renderer on them (even a
  // pass-through) breaks AG Grid's default text rendering for all rows.
  //
  // The guard runs the original renderer for normal rows and substitutes a
  // plain-text formatter for the pinned-bottom totals row.
  const guardedColumnDefs = useMemo(() => {
    if (pinnedBottomRowData.length === 0) return columnDefs;
    return applyPinnedRowGuard(columnDefs);
  }, [columnDefs, pinnedBottomRowData.length]);

  // ─── Pinned row styling ─────────────────────────────────────────────────────
  const getRowStyle = useCallback((params) => {
    if (params.node.rowPinned === 'bottom') {
      return {
        fontWeight: '700',
        borderTop: '2px solid #3b82f6',
        background: 'var(--ag-header-background-color, #f8fafc)',
      };
    }
    return undefined;
  }, []);

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
      getRowStyle,
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
  }, [theme, paginationPageSize, paginationPageSizeSelector, shouldUseAutoHeight, gridOptions, getRowStyle]);

  const onQuickFilterChanged = useCallback((event) => {
    const value = event.target.value;
    setQuickFilterText(value);
    if (gridRef.current) {
      gridRef.current.api.setGridOption('quickFilterText', value);
    }
  }, []);

  const clearQuickFilter = useCallback(() => {
    setQuickFilterText('');
    if (gridRef.current) {
      gridRef.current.api.setGridOption('quickFilterText', '');
    }
  }, []);

  const containerStyle = useMemo(() => {
    if (shouldUseAutoHeight) return {};
    return { height };
  }, [shouldUseAutoHeight, height]);

  const containerClassName = useMemo(() => {
    const baseClasses = "ag-theme-quartz rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700";
    const autoHeightClass = getAGGridAutoHeightClass('viewer');
    return shouldUseAutoHeight
      ? `${baseClasses} ${autoHeightClass}`
      : baseClasses;
  }, [shouldUseAutoHeight]);

  return (
    <div className="space-y-2">
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

      <div
        className={containerClassName}
        style={containerStyle}
      >
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={guardedColumnDefs}
          pinnedBottomRowData={pinnedBottomRowData}
          {...defaultGridOptions}
        />
      </div>
    </div>
  );
};

// ─── Pinned-row guard utility ─────────────────────────────────────────────────

/**
 * Recursively walks columnDefs and wraps each leaf column's cellRenderer,
 * but ONLY if the column already has one. Columns without a cellRenderer
 * are returned unchanged — AG Grid's default rendering must not be disturbed.
 *
 * For pinned-bottom rows, the guard replaces the original renderer with a
 * plain-text formatter (number → toLocaleString, null → "—", string → as-is).
 * For all other rows, the original renderer is called normally.
 */
function applyPinnedRowGuard(defs) {
  if (!Array.isArray(defs)) return defs;

  return defs.map((def) => {
    // Column group — recurse into children, leave the group itself untouched
    if (def.children) {
      return { ...def, children: applyPinnedRowGuard(def.children) };
    }

    // Leaf column WITH a renderer — wrap it
    if (typeof def.cellRenderer === 'function') {
      const originalRenderer = def.cellRenderer;
      return {
        ...def,
        cellRenderer: (params) => {
          if (params.node.rowPinned === 'bottom') {
            return renderPinnedCell(params.value);
          }
          return originalRenderer(params);
        },
      };
    }

    // Leaf column WITHOUT a renderer — return as-is, do NOT install anything.
    // Installing even a pass-through renderer here breaks AG Grid's built-in
    // text rendering for ALL rows in that column (not just the pinned one).
    return def;
  });
}

/**
 * Renders a value for the grand-total pinned row.
 * Plain text only — no buttons, no badges, no links.
 */
function renderPinnedCell(value) {
  if (value === null || value === undefined) {
    return <span style={{ color: '#9ca3af' }}>—</span>;
  }
  if (typeof value === 'number') {
    return <span style={{ fontWeight: 700 }}>{value.toLocaleString()}</span>;
  }
  return <span style={{ fontWeight: 700 }}>{String(value)}</span>;
}

export default AGGridViewer;
