import React from 'react';
import { router } from '@inertiajs/react';
import { IoDocumentText } from 'react-icons/io5';
import SearchableSelect from '../Form/SearchableSelect';

/**
 * FormSelector Component - GENERIC SELECTOR
 * Can be used for ANY dropdown selection (forms, sections, etc.)
 * 
 * @param {string} currentForm - Currently selected value
 * @param {boolean} disabled - Whether the selector is disabled
 * @param {string} mode - 'navigate' (navigates on change) or 'view' (read-only) or 'custom' (uses onCustomChange)
 * @param {array} options - Grouped options array: [{ group: 'Group Name', options: [{ value, label }] }]
 * @param {function} onCustomChange - Custom change handler (for mode='custom')
 * @param {string} label - Label text (default: 'Form Type')
 * @param {component} icon - Icon component (default: IoDocumentText)
 * @param {string} placeholder - Placeholder text (default: 'Select...')
 * @param {function} getRoute - Function to get route from value (for mode='navigate')
 * @param {boolean} confirmBeforeChange - Show confirmation dialog before changing (for mode='navigate')
 * @param {string} helperText - Helper text below the selector
 */
const FormSelector = ({ 
  currentForm, 
  disabled = false, 
  mode = 'navigate',
  options = [],
  onCustomChange = null,
  label = 'Form Type',
  icon = null,
  placeholder = 'Select...',
  getRoute = null,
  confirmBeforeChange = true,
  helperText = null
}) => {
  const IconComponent = icon || IoDocumentText;
  
  const handleFormChange = (newValue) => {
    // Custom mode: use provided handler
    if (mode === 'custom' && onCustomChange) {
      onCustomChange(newValue);
      return;
    }

    // View mode: no action
    if (mode === 'view') return;
    
    // Same value: no action
    if (newValue === currentForm) return;

    // Navigate mode: route to new form
    if (mode === 'navigate') {
      if (confirmBeforeChange) {
        const confirmed = window.confirm(
          'Are you sure you want to switch? Any unsaved changes will be lost.'
        );
        if (!confirmed) return;
      }

      // Get route
      if (getRoute) {
        const route = getRoute(newValue);
        if (route) {
          router.visit(route);
        }
      }
    }
  };

  // Auto-detect helper text
  const displayHelperText = helperText || (() => {
    if (mode === 'navigate') return 'Switch between options. Unsaved changes will be lost.';
    if (mode === 'view') return 'Currently viewing this option';
    if (mode === 'custom') return 'Select an option to view different data';
    return null;
  })();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <IconComponent className="text-xl text-blue-500" />
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      </div>
      
      <SearchableSelect
        value={currentForm}
        onChange={handleFormChange}
        options={options}
        placeholder={placeholder}
        disabled={disabled || mode === 'view'}
      />
      
      {displayHelperText && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {displayHelperText}
        </p>
      )}
    </div>
  );
};

export default FormSelector;
