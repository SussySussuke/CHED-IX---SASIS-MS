import React from 'react';
import { router } from '@inertiajs/react';
import { IoDocumentText } from 'react-icons/io5';
import { ANNEX_NAMES } from '../../Config/formConfig';

/**
 * FormSelector Component
 * Allows quick navigation between different forms
 * Warns users before navigating away from unsaved work
 */
const FormSelector = ({ currentForm, disabled = false }) => {
  const handleFormChange = (e) => {
    const newForm = e.target.value;
    
    if (newForm === currentForm) return;

    // Simple warning - can be upgraded to modal later
    const confirmed = window.confirm(
      'Are you sure you want to switch forms? Any unsaved changes will be lost.'
    );

    if (!confirmed) {
      // Reset select to current value
      e.target.value = currentForm;
      return;
    }

    // Navigate to the new form's create page
    if (newForm === 'SUMMARY') {
      router.visit('/hei/summary/create');
    } else {
      router.visit(`/hei/annex-${newForm.toLowerCase()}/submit`);
    }
  };

  // Build options array
  const formOptions = [
    { value: 'SUMMARY', label: 'Summary - School Details' },
    ...Object.keys(ANNEX_NAMES)
      .sort()
      .map(annex => ({
        value: annex,
        label: `Annex ${annex} - ${ANNEX_NAMES[annex]}`
      }))
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <IoDocumentText className="text-xl text-blue-500" />
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Form Type
        </label>
      </div>
      <select
        value={currentForm}
        onChange={handleFormChange}
        disabled={disabled}
        className={`w-full px-4 py-2 border-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 border-blue-300 dark:border-blue-600 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {formOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Switch between different forms. Unsaved changes will be lost.
      </p>
    </div>
  );
};

export default FormSelector;
