import React from 'react';
import { IoCalendar } from 'react-icons/io5';

const AcademicYearSelect = ({
  value,
  onChange,
  error,
  availableYears = [],
  required = true,
  label = "Academic Year",
  disabled = false,
  mode = 'submit' // 'submit' for HEI submission, 'view' for admin viewing
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <IoCalendar className="text-xl text-blue-500" />
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      <select
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full px-4 py-2 border-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 border-blue-300 dark:border-blue-600 ${
          error ? 'border-red-500 dark:border-red-500' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <option value="">Select Academic Year</option>
        {availableYears.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {mode === 'submit' && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          You can only submit for years where no published submission exists, or overwrite the current year if not yet published.
        </p>
      )}
      {mode === 'view' && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Filter data by academic year
        </p>
      )}
    </div>
  );
};

export default AcademicYearSelect;
