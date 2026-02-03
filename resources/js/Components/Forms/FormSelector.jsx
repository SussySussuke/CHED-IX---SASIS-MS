import React from 'react';
import { router } from '@inertiajs/react';
import { IoDocumentText } from 'react-icons/io5';
import { buildFormOptionsGrouped } from '../../Config/formConfig';
import { getFormRoute } from '../../Config/nonAnnexForms';
import SearchableSelect from '../Form/SearchableSelect';

/**
 * FormSelector Component
 * Allows quick navigation between different forms (Annexes and MER forms)
 * Warns users before navigating away from unsaved work
 */
const FormSelector = ({ currentForm, disabled = false }) => {
  const handleFormChange = (newForm) => {
    if (newForm === currentForm) return;

    const confirmed = window.confirm(
      'Are you sure you want to switch forms? Any unsaved changes will be lost.'
    );

    if (!confirmed) {
      return;
    }

    // Get route
    const route = getFormRoute(newForm) || `/hei/annex-${newForm.toLowerCase()}/submit`;
    router.visit(route);
  };

  // Get grouped form options from centralized config
  const formOptions = buildFormOptionsGrouped();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <IoDocumentText className="text-xl text-blue-500" />
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Form Type
        </label>
      </div>
      
      <SearchableSelect
        value={currentForm}
        onChange={handleFormChange}
        options={formOptions}
        placeholder="Select form..."
        disabled={disabled}
      />
      
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Switch between different forms. Unsaved changes will be lost.
      </p>
    </div>
  );
};

export default FormSelector;
