/**
 * Shared HotTable dark mode styles for Annex pages
 * Import and use in a <style> tag for consistent table styling
 */
export const HOT_TABLE_DARK_MODE_STYLES = `
  .dark .handsontable td, .dark .handsontable th {
    background-color: #374151 !important;
    color: #f9fafb !important;
    border-color: #4b5563 !important;
  }
  .dark .handsontable thead th {
    background-color: #1f2937 !important;
    color: #f9fafb !important;
  }
  .dark .handsontable .htDimmed {
    color: #9ca3af !important;
  }
  .handsontable td, .handsontable th {
    border-color: #e5e7eb !important;
  }
  .handsontable td {
    height: 32px !important;
    line-height: 32px !important;
    padding: 0 4px !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    vertical-align: middle !important;
  }
  .handsontable th {
    height: 32px !important;
    line-height: 32px !important;
    vertical-align: middle !important;
  }
  /* Force table headers below lock overlay */
  .handsontable .ht_clone_top,
  .handsontable .ht_clone_left,
  .handsontable .ht_clone_top_left_corner {
    z-index: 1 !important;
  }
`;
