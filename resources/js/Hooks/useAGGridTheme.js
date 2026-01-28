import { useMemo, useEffect } from 'react';
import { themeQuartz } from 'ag-grid-community';

/**
 * Shared AG Grid theme hook with smooth transitions
 * 
 * This hook creates a STABLE theme object that references CSS variables.
 * When the theme changes (light/dark), only the CSS variable VALUES change,
 * not the theme object itself. This allows your existing global CSS transitions
 * to smoothly animate AG Grid's colors instead of causing a hard re-render.
 * 
 * The CSS variables are defined in resources/css/theme.css under .light and .dark classes.
 *
 * @param {Object} options - Theme options
 * @param {boolean} options.isEditor - Whether this is for an editor (adds cellHighlightColor)
 * @returns {Object} AG Grid theme object (stable reference)
 */
export const useAGGridTheme = ({ isEditor = false } = {}) => {
  // Create a STABLE theme object that uses CSS variables
  // This object reference never changes, so AG Grid won't re-render
  const theme = useMemo(() => {
    const params = {
      // Use CSS variables that change with theme toggle
      // The values update automatically via CSS, not React re-renders
      backgroundColor: 'var(--ag-background-color)',
      foregroundColor: 'var(--ag-foreground-color)',
      chromeBackgroundColor: 'var(--ag-chrome-background-color)',
      oddRowBackgroundColor: 'var(--ag-odd-row-background-color)',
      borderColor: 'var(--ag-border-color)',
      headerBackgroundColor: 'var(--ag-header-background-color)',
      headerTextColor: 'var(--ag-header-text-color)',
      
      // Hover color with slight transparency for better UX
      rowHoverColor: 'color-mix(in srgb, var(--ag-foreground-color) 8%, var(--ag-background-color))',
      
      // Static values that don't change with theme
      headerFontSize: 14,
      fontSize: 13,
      
      // Browser color scheme is handled by the .light/.dark class on <html>
      // No need to set it here
    };

    // Add editor-specific styling (only if editor)
    if (isEditor) {
      params.cellHighlightColor = 'var(--ag-cell-highlight-color)';
    }

    return themeQuartz.withParams(params);
  }, [isEditor]); // Only recreate if isEditor changes, NOT when theme changes

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

export default useAGGridTheme;
