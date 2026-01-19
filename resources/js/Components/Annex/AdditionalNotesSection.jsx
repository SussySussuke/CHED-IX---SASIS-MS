import React from 'react';

/**
 * Reusable Additional Notes section for Annex submissions
 * @param {string} value - Current notes value
 * @param {function} onChange - Handler for value changes
 * @param {number} maxLength - Maximum character length (default: 1000)
 */
const AdditionalNotesSection = ({ value, onChange, maxLength = 1000 }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Additional Notes (Optional)
      </h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes for this submission
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          maxLength={maxLength}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder={`Optional: Any notes for this batch submission (max ${maxLength} characters)`}
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {value.length}/{maxLength} characters
        </p>
      </div>
    </div>
  );
};

export default AdditionalNotesSection;
