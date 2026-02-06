/**
 * Grid Refresh Event System
 * 
 * Provides a simple pub/sub system for notifying all AG Grid instances
 * when they need to recalculate their heights due to layout changes.
 * 
 * This solves the issue where expanding/collapsing one batch causes
 * row height issues in other opened batches.
 */

// Custom event name
const GRID_REFRESH_EVENT = 'agGridRefreshAll';

/**
 * Dispatch a grid refresh event
 * Call this whenever a layout change occurs that might affect grid heights
 * (e.g., when a batch expands or collapses)
 */
export function triggerGridRefresh() {
  const event = new CustomEvent(GRID_REFRESH_EVENT);
  window.dispatchEvent(event);
}

/**
 * Subscribe to grid refresh events
 * Returns an unsubscribe function
 * 
 * @param {Function} callback - Function to call when refresh is triggered
 * @returns {Function} Unsubscribe function
 */
export function onGridRefresh(callback) {
  window.addEventListener(GRID_REFRESH_EVENT, callback);
  
  // Return cleanup function
  return () => {
    window.removeEventListener(GRID_REFRESH_EVENT, callback);
  };
}
