import { useMemo, useEffect } from 'react';
import { themeQuartz } from 'ag-grid-community';
import { useDarkMode } from '@/Hooks/useDarkMode';

/**
 * Shared AG Grid theme hook
 * Creates a consistent theme for both AGGridViewer and AGGridEditor
 *
 * @param {Object} options - Theme options
 * @param {boolean} options.isEditor - Whether this is for an editor (adds cellHighlightColor)
 * @returns {Object} AG Grid theme object
 */
export const useAGGridTheme = ({ isEditor = false } = {}) => {
  const isDark = useDarkMode();

  const theme = useMemo(() => {
    const params = {
      backgroundColor: isDark ? '#1f2836' : '#ffffff',
      browserColorScheme: isDark ? 'dark' : 'light',
      chromeBackgroundColor: isDark
        ? { ref: 'foregroundColor', mix: 0.07, onto: 'backgroundColor' }
        : '#f3f4f6',
      foregroundColor: isDark ? '#ffffff' : '#000000',
      headerFontSize: 14,
      fontSize: 13,
      oddRowBackgroundColor: isDark ? '#1a222e' : '#f9fafb',
      rowHoverColor: isDark
        ? { ref: 'foregroundColor', mix: 0.1, onto: 'backgroundColor' }
        : { ref: 'foregroundColor', mix: 0.05, onto: 'backgroundColor' },
      borderColor: isDark ? '#374151' : '#e5e7eb',
      headerBackgroundColor: isDark ? '#111827' : '#f3f4f6',
      headerTextColor: isDark ? '#e5e7eb' : '#374151',
    };

    // Add editor-specific styling
    if (isEditor) {
      params.cellHighlightColor = isDark ? '#3b82f6' : '#60a5fa';
    }

    return themeQuartz.withParams(params);
  }, [isDark, isEditor]);

  return theme;
};

/**
 * Hook to inject CSS that removes AG Grid's 150px minimum height
 * Use this in components that need auto-height functionality
 * 
 * @param {string} componentType - 'viewer' or 'editor' to generate unique style IDs
 */
export const useAGGridMinHeightRemoval = (componentType = 'grid') => {
  useEffect(() => {
    const styleId = `ag-grid-${componentType}-remove-min-height-style`;
    const className = `ag-grid-${componentType}-auto-height`;
    
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .${className} .ag-center-cols-viewport,
        .${className} .ag-center-cols-clipper {
          min-height: 0 !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Cleanup on unmount
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [componentType]);
};

/**
 * Get the CSS class name for min-height removal based on component type
 * 
 * @param {string} componentType - 'viewer' or 'editor'
 * @returns {string} The class name to apply
 */
export const getAGGridAutoHeightClass = (componentType = 'grid') => {
  return `ag-grid-${componentType}-auto-height`;
};

/**
 * CSS to remove AG Grid's default 150px minimum height
 * Apply this when using autoHeight or when you want the grid to shrink
 * @deprecated Use useAGGridMinHeightRemoval hook instead
 */
export const AG_GRID_MIN_HEIGHT_RESET_CSS = `
  .ag-grid-auto-height .ag-center-cols-viewport {
    min-height: unset !important;
  }

  .ag-grid-auto-height .ag-center-cols-clipper {
    min-height: unset !important;
  }
`;

export default useAGGridTheme;
