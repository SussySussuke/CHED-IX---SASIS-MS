import React from 'react';

const ReasonTextarea = ({
  label = 'Reason',
  name = 'reason',
  value,
  onChange,
  error = null,
  placeholder = 'Please provide a reason for this action...',
  required = true,
  disabled = false,
  rows = 4,
  className = '',
  minLength = 10
}) => {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        minLength={minLength}
        className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
          error
            ? 'border-red-500 dark:border-red-500'
            : 'border-gray-300 dark:border-gray-600'
        } ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {minLength && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Minimum {minLength} characters required
        </p>
      )}
    </div>
  );
};

export default ReasonTextarea;
