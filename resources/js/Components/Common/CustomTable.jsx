import React, { useState } from 'react';
import { useTheme } from '../../Context/ThemeContext';
import { IoCloudUpload, IoDocument, IoTrash, IoCheckmark } from 'react-icons/io5';

/**
 * CustomTable Component - Future-proof table for fixed-row forms
 * 
 * Designed for MER4 and similar forms where:
 * - Rows are FIXED (no add/remove)
 * - Each column can have different input types
 * - Supports: static text, text input, textarea, file upload, checkbox, number, date, select
 * - Matches AGGridEditor's visual style
 * - Full dark mode support
 * 
 * @param {Object} props
 * @param {string} props.title - Table title/section header
 * @param {string} props.subtitle - Optional subtitle/description
 * @param {Array} props.rows - Fixed row data (id + field values)
 * @param {Array} props.columns - Column definitions with types
 * @param {Function} props.onChange - Callback when data changes (receives updated rows)
 * @param {string} props.className - Additional CSS classes
 * 
 * Column Definition Format:
 * {
 *   field: 'field_name',           // Field key in row data
 *   headerName: 'Column Header',   // Display name
 *   type: 'text',                  // Column type (see SUPPORTED_TYPES)
 *   width: '200px',                // Optional: custom width
 *   minWidth: '150px',             // Optional: minimum width
 *   accept: '.pdf',                // For file type: accepted file types
 *   placeholder: 'Enter...',       // Placeholder text
 *   options: [{value, label}],     // For select type: dropdown options
 *   rows: 3,                       // For textarea type: number of rows
 *   readOnly: false,               // Make field read-only
 * }
 * 
 * Supported Column Types:
 * - 'static': Non-editable text display
 * - 'text': Single-line text input
 * - 'textarea': Multi-line text input
 * - 'number': Number input
 * - 'date': Date picker
 * - 'file': File upload (stores base64 + filename)
 * - 'checkbox': Boolean checkbox
 * - 'select': Dropdown selection
 */
const CustomTable = ({
  title,
  subtitle,
  rows = [],
  columns = [],
  onChange,
  className = ''
}) => {
  const { isDark } = useTheme();

  // Handle cell value change
  const handleCellChange = (rowId, field, value) => {
    const updatedRows = rows.map(row => {
      if (row.id === rowId) {
        return { ...row, [field]: value };
      }
      return row;
    });
    onChange(updatedRows);
  };

  // Handle file upload
  const handleFileUpload = (rowId, field, event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const fileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        data: reader.result, // base64
      };
      handleCellChange(rowId, field, fileData);
    };
    reader.readAsDataURL(file);
  };

  // Handle file removal
  const handleFileRemove = (rowId, field) => {
    handleCellChange(rowId, field, null);
  };

  // Render cell based on column type
  const renderCell = (row, column) => {
    const value = row[column.field];
    const cellId = `${row.id}-${column.field}`;

    // Common input classes
    const inputClasses = `
      w-full px-3 py-2 text-sm rounded border
      focus:outline-none focus:ring-2 focus:ring-blue-500
      ${isDark 
        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
      }
      ${column.readOnly ? 'opacity-60 cursor-not-allowed' : ''}
    `;

    const textareaClasses = `
      w-full px-3 py-2 text-sm rounded border resize-none
      focus:outline-none focus:ring-2 focus:ring-blue-500
      ${isDark 
        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
      }
      ${column.readOnly ? 'opacity-60 cursor-not-allowed' : ''}
    `;

    switch (column.type) {
      case 'static':
        return (
          <div className={`px-3 py-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {value || '—'}
          </div>
        );

      case 'text':
        return (
          <input
            type="text"
            id={cellId}
            value={value || ''}
            onChange={(e) => handleCellChange(row.id, column.field, e.target.value)}
            placeholder={column.placeholder || ''}
            disabled={column.readOnly}
            className={inputClasses}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={cellId}
            value={value || ''}
            onChange={(e) => handleCellChange(row.id, column.field, e.target.value)}
            placeholder={column.placeholder || ''}
            disabled={column.readOnly}
            rows={column.rows || 3}
            className={textareaClasses}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            id={cellId}
            value={value || ''}
            onChange={(e) => handleCellChange(row.id, column.field, e.target.value)}
            placeholder={column.placeholder || ''}
            disabled={column.readOnly}
            className={inputClasses}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            id={cellId}
            value={value || ''}
            onChange={(e) => handleCellChange(row.id, column.field, e.target.value)}
            disabled={column.readOnly}
            className={inputClasses}
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center justify-center h-full">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id={cellId}
                checked={value || false}
                onChange={(e) => handleCellChange(row.id, column.field, e.target.checked)}
                disabled={column.readOnly}
                className="sr-only peer"
              />
              <div className={`
                w-11 h-6 rounded-full peer
                peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800
                ${value 
                  ? 'bg-blue-600' 
                  : isDark ? 'bg-gray-600' : 'bg-gray-200'
                }
                peer-checked:after:translate-x-full
                after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                after:bg-white after:rounded-full after:h-5 after:w-5
                after:transition-all
                ${column.readOnly ? 'opacity-60 cursor-not-allowed' : ''}
              `}></div>
            </label>
          </div>
        );

      case 'file':
        return (
          <div className="px-2 py-1">
            {value ? (
              // File uploaded - show file info
              <div className={`
                flex items-center justify-between gap-2 px-3 py-2 rounded
                ${isDark ? 'bg-gray-600' : 'bg-gray-100'}
              `}>
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <IoDocument 
                    size={20} 
                    className={isDark ? 'text-blue-400' : 'text-blue-600'} 
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {value.name}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {(value.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                {!column.readOnly && (
                  <button
                    type="button"
                    onClick={() => handleFileRemove(row.id, column.field)}
                    className={`
                      p-1 rounded hover:bg-red-500/10 transition-colors
                      ${isDark ? 'text-red-400' : 'text-red-600'}
                    `}
                    title="Remove file"
                  >
                    <IoTrash size={16} />
                  </button>
                )}
              </div>
            ) : (
              // No file - show upload button
              <label
                htmlFor={cellId}
                className={`
                  flex items-center justify-center gap-2 px-3 py-2 rounded border-2 border-dashed
                  cursor-pointer transition-colors
                  ${isDark 
                    ? 'border-gray-600 hover:border-blue-500 hover:bg-gray-700' 
                    : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                  }
                  ${column.readOnly ? 'opacity-60 cursor-not-allowed' : ''}
                `}
              >
                <IoCloudUpload 
                  size={20} 
                  className={isDark ? 'text-gray-400' : 'text-gray-500'} 
                />
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Upload File
                </span>
                <input
                  type="file"
                  id={cellId}
                  accept={column.accept || '*'}
                  onChange={(e) => handleFileUpload(row.id, column.field, e)}
                  disabled={column.readOnly}
                  className="hidden"
                />
              </label>
            )}
          </div>
        );

      case 'select':
        return (
          <select
            id={cellId}
            value={value || ''}
            onChange={(e) => handleCellChange(row.id, column.field, e.target.value)}
            disabled={column.readOnly}
            className={inputClasses}
          >
            <option value="">{column.placeholder || 'Select...'}</option>
            {(column.options || []).map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <div className="px-3 py-2 text-sm text-gray-400">
            Unsupported type: {column.type}
          </div>
        );
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Title Section */}
      {(title || subtitle) && (
        <div className="space-y-1">
          {title && (
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Table */}
      <div className={`
        rounded-lg overflow-hidden border
        ${isDark ? 'border-gray-700' : 'border-gray-200'}
      `}>
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead className={`
              ${isDark ? 'bg-gray-800' : 'bg-gray-50'}
            `}>
              <tr>
                {columns.map((column, idx) => (
                  <th
                    key={column.field}
                    style={{
                      width: column.width,
                      minWidth: column.minWidth || '100px'
                    }}
                    className={`
                      px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider
                      ${isDark ? 'text-gray-300' : 'text-gray-700'}
                      ${idx !== columns.length - 1 ? `border-r ${isDark ? 'border-gray-700' : 'border-gray-200'}` : ''}
                    `}
                  >
                    {column.headerName}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody className={`
              divide-y
              ${isDark ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}
            `}>
              {rows.map((row, rowIdx) => (
                <tr
                  key={row.id}
                  className={`
                    transition-colors
                    ${isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}
                  `}
                >
                  {columns.map((column, colIdx) => (
                    <td
                      key={`${row.id}-${column.field}`}
                      className={`
                        ${colIdx !== columns.length - 1 ? `border-r ${isDark ? 'border-gray-700' : 'border-gray-200'}` : ''}
                      `}
                      style={{
                        width: column.width,
                        minWidth: column.minWidth || '100px'
                      }}
                    >
                      {renderCell(row, column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row count indicator */}
      <div className="flex justify-end">
        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {rows.length} {rows.length === 1 ? 'row' : 'rows'}
        </span>
      </div>
    </div>
  );
};

export default CustomTable;
