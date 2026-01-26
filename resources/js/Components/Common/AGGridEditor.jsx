import React, { useMemo, useCallback, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { useAGGridTheme, useAGGridMinHeightRemoval, getAGGridAutoHeightClass } from '@/Hooks/useAGGridTheme';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * Universal AG Grid Editor Component
 * Editable table optimized for data entry and form input
 *
 * Features:
 * - Full cell editing capabilities
 * - Cell Selection with header highlight
 * - Column Hover highlighting
 * - Column Resizing
 * - Undo/Redo support
 * - Row/Cell change callbacks
 * - Auto-height support for small datasets
 * - Removes AG Grid's 150px minimum height restriction
 *
 * @param {Object} props
 * @param {Array} props.rowData - Array of data objects
 * @param {Array} props.columnDefs - AG Grid column definitions
 * @param {Function} props.onCellValueChanged - Callback when cell value changes
 * @param {Function} props.onRowValueChanged - Callback when row is updated
 * @param {boolean} props.enableUndo - Enable undo/redo (default: true)
 * @param {boolean} props.singleClickEdit - Edit on single click (default: false)
 * @param {Object} props.gridOptions - Additional AG Grid options
 * @param {string} props.height - Grid height for normal mode (default: '400px')
 * @param {string} props.minHeight - Minimum grid height (default: '200px')
 * @param {boolean} props.autoHeightForSmallData - Auto switch to autoHeight when rows < threshold (default: true)
 * @param {number} props.autoHeightThreshold - Row count threshold for auto-height (default: 10)
 */
const AGGridEditor = ({
  rowData = [],
  columnDefs = [],
  onCellValueChanged = null,
  onRowValueChanged = null,
  enableUndo = true,
  singleClickEdit = false,
  gridOptions = {},
  height = '400px',
  minHeight = '200px',
  autoHeightForSmallData = true,
  autoHeightThreshold = 10,
}) => {
  const gridRef = useRef(null);
  
  // Use shared theme hook
  const theme = useAGGridTheme({ isEditor: true });
  
  // Inject CSS to remove min-height
  useAGGridMinHeightRemoval('editor');

  // Determine if we should use auto-height
  const shouldUseAutoHeight = useMemo(() => {
    // Manual override via gridOptions takes precedence
    if (gridOptions.domLayout === 'autoHeight') {
      return true;
    }
    
    // Auto-detection based on row count
    if (autoHeightForSmallData && rowData.length > 0 && rowData.length <= autoHeightThreshold) {
      return true;
    }
    
    return false;
  }, [rowData.length, autoHeightForSmallData, autoHeightThreshold, gridOptions.domLayout]);

  // Default grid options for editor
  const defaultGridOptions = useMemo(() => ({
    theme,

    // Selection
    cellSelection: true,

    // Editing
    editType: 'fullRow',

    // Column hover highlight
    columnHoverHighlight: true,

    // DOM Layout for auto-height
    domLayout: shouldUseAutoHeight ? 'autoHeight' : 'normal',

    // Undo/Redo
    ...(enableUndo && {
      undoRedoCellEditing: true,
      undoRedoCellEditingLimit: 20,
    }),

    // Performance
    animateRows: true,

    // Row height
    rowHeight: 40,
    headerHeight: 44,

    // Single click edit
    ...(singleClickEdit && {
      singleClickEdit: true,
    }),

    // Stop editing when rows lose focus
    stopEditingWhenCellsLoseFocus: true,

    // Default column definitions
    defaultColDef: {
      flex: 1,
      minWidth: 100,
      resizable: true,
      sortable: false,
      filter: false,
      editable: true,
      cellDataType: false,
    },

    // Callbacks
    ...(onCellValueChanged && {
      onCellValueChanged: (params) => {
        onCellValueChanged(params);
      },
    }),
    ...(onRowValueChanged && {
      onRowValueChanged: (params) => {
        onRowValueChanged(params);
      },
    }),

    ...gridOptions,
  }), [
    theme,
    enableUndo,
    singleClickEdit,
    onCellValueChanged,
    onRowValueChanged,
    gridOptions,
    shouldUseAutoHeight,
  ]);

  // Expose useful methods
  const getRowData = useCallback(() => {
    const data = [];
    if (gridRef.current) {
      gridRef.current.api.forEachNode(node => data.push(node.data));
    }
    return data;
  }, []);

  const addRow = useCallback((newRow) => {
    if (gridRef.current) {
      gridRef.current.api.applyTransaction({ add: [newRow] });
    }
  }, []);

  const deleteSelectedRows = useCallback(() => {
    if (gridRef.current) {
      const selectedRows = gridRef.current.api.getSelectedRows();
      gridRef.current.api.applyTransaction({ remove: selectedRows });
    }
  }, []);

  // Attach methods to ref for parent access
  React.useImperativeHandle(gridRef, () => ({
    getRowData,
    addRow,
    deleteSelectedRows,
    api: gridRef.current?.api,
  }));

  // Dynamic container style
  const containerStyle = useMemo(() => {
    if (shouldUseAutoHeight) {
      // Auto-height mode: NO height restrictions at all, let it flow naturally
      return {};
    }
    
    // Normal mode: use height prop with optional minHeight
    const style = { height };
    if (minHeight) {
      style.minHeight = minHeight;
    }
    return style;
  }, [shouldUseAutoHeight, height, minHeight]);

  // Dynamic class name - only apply min-height removal when in auto-height mode
  const containerClassName = useMemo(() => {
    const baseClasses = "ag-theme-quartz rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700";
    const autoHeightClass = getAGGridAutoHeightClass('editor');
    return shouldUseAutoHeight 
      ? `${baseClasses} ${autoHeightClass}`
      : baseClasses;
  }, [shouldUseAutoHeight]);

  return (
    <div className="space-y-3">
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

export default AGGridEditor;
