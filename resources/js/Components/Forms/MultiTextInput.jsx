import React from 'react';
import { IoAdd, IoClose } from 'react-icons/io5';

const MultiTextInput = ({
  label,
  name,
  values = [],
  onChange,
  error = null,
  placeholder = '',
  required = false,
  disabled = false,
  className = '',
  type = 'text'
}) => {
  const handleAdd = () => {
    onChange([...values, '']);
  };

  const handleRemove = (index) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues);
  };

  const handleChange = (index, value) => {
    const newValues = [...values];
    newValues[index] = value;
    onChange(newValues);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex gap-2">
            <input
              type={type}
              name={`${name}[${index}]`}
              value={value}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className={`flex-1 px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              disabled={disabled}
              className="px-3 py-2 h-full border border-red-300 dark:border-red-600 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Remove"
            >
              <IoClose size={20} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <IoAdd size={20} />
          <span>Add {label}</span>
        </button>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default MultiTextInput;
