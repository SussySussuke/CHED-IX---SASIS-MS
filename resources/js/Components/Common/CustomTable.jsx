import React, { useState } from 'react';
import { useTheme } from '../../Context/ThemeContext';
import { IoCloudUpload, IoDocument, IoTrash, IoCheckmark, IoWarning } from 'react-icons/io5';

/**
 * CustomTable Component - Future-proof table for fixed-row forms
 * 
 * Designed for MER4 and similar forms where:
 * - Rows are FIXED (no add/remove)
 * - Each column can have different input types
 * - Supports: static text, text input, textarea, file upload, checkbox, number, date, select
 * - Matches AGGridEditor's visual style
 * - Full dark mode support
 * - NOW supports VIEW MODE for read-only display in submissions
 * 
 * @param {Object} props
 * @param {string} props.title - Table title/section header
 * @param {string} props.subtitle - Optional subtitle/description
 * @param {Array} props.rows - Fixed row data (id + field values)
 * @param {Array} props.columns - Column definitions with types
 * @param {Function} props.onChange - Callback when data changes (receives updated rows)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.viewMode - If true, display as read-only (no editing)
 * 
 * Column Definition Format:
 * {
 *   field: 'field_name',           // Field key in row data
 *   headerName: 'Column Header',   // Display name
 *   type: 'text',                  // Column type (see SUPPORTED_TYPES)
 *   width: '200px',                // Optional: custom width
 *   minWidth: '150px',             // Optional: minimum width
 *   accept: '.pdf',                // For file type: accepted file types
 *   maxFileSize: 100,              // For file type: max file size in MB (default: 100MB)
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
  className = '',
  viewMode = false // New prop for read-only view
}) => {
  const { isDark } = useTheme();
  const [fileErrors, setFileErrors] = useState({}); // Track file upload errors per cell

  // Handle cell value change
  const handleCellChange = (rowId, field, value) => {
    if (viewMode || !onChange) return; // Don't allow changes in view mode
    
    const updatedRows = rows.map(row => {
      if (row.id === rowId) {
        return { ...row, [field]: value };
      }
      return row;
    });
    onChange(updatedRows);
  };

  // Handle file upload with size validation
  const handleFileUpload = (rowId, field, event, column) => {
    const file = event.target.files[0];
    if (!file) return;

    // Get max file size (default 100MB if not specified)
    const maxSizeMB = column.maxFileSize || 100;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const cellKey = `${rowId}-${field}`;

    // Validate file size
    if (file.size > maxSizeBytes) {
      setFileErrors(prev => ({
        ...prev,
        [cellKey]: `File size exceeds ${maxSizeMB}MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`
      }));
      // Clear the input
      event.target.value = '';
      return;
    }

    // Clear any previous errors
    setFileErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[cellKey];
      return newErrors;
    });

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
    const cellKey = `${rowId}-${field}`;
    // Clear any errors for this cell
    setFileErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[cellKey];
      return newErrors;
    });
    handleCellChange(rowId, field, null);
  };

  // Render cell in view mode (read-only)
  const renderViewCell = (row, column, value) => {
    const cellClasses = `px-3 py-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

    switch (column.type) {
      case 'static':
      case 'text':
      case 'textarea':
      case 'number':
      case 'select':
        return (
          <div className={cellClasses}>
            {value || <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>—</span>}
          </div>
        );

      case 'date':
        return (
          <div className={cellClasses}>
            {value ? new Date(value).toLocaleDateString() : <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>—</span>}
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center justify-center h-full">
            {value ? (
              <IoCheckmark size={20} className="text-green-500" />
            ) : (
              <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>—</span>
            )}
          </div>
        );

      case 'file':
        // Handler to open file in new tab (view mode only)
        const handleViewFile = () => {
          if (!value || !value.data) return;
          
          try {
            // Create blob from base64 data
            const base64Data = value.data.split(',')[1] || value.data;
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: value.type || 'application/pdf' });
            
            // Create temporary URL and open in new tab
            const blobUrl = URL.createObjectURL(blob);
            const newWindow = window.open(blobUrl, '_blank');
            
            // Cleanup blob URL after window opens
            if (newWindow) {
              newWindow.onload = () => {
                URL.revokeObjectURL(blobUrl);
              };
            }
          } catch (error) {
            console.error('Error opening file:', error);
            alert('Failed to open file. The file may be corrupted.');
          }
        };
        
        return (
          <div className="px-2 py-1">
            {value && value.name ? (
              <button
                type="button"
                onClick={handleViewFile}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded w-full
                  transition-all duration-200
                  ${isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 hover:shadow-lg' 
                    : 'bg-gray-100 hover:bg-blue-50 hover:shadow-md'
                  }
                  cursor-pointer group
                `}
                title="Click to view file"
              >
                <IoDocument 
                  size={20} 
                  className={`
                    transition-colors
                    ${isDark 
                      ? 'text-blue-400 group-hover:text-blue-300' 
                      : 'text-blue-600 group-hover:text-blue-700'
                    }
                  `}
                />
                <div className="min-w-0 flex-1 text-left">
                  <p className={`
                    text-sm font-medium truncate
                    ${isDark 
                      ? 'text-white group-hover:text-blue-300' 
                      : 'text-gray-900 group-hover:text-blue-700'
                    }
                  `}>
                    {value.name}
                  </p>
                  {value.size && (
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {(value.size / 1024).toFixed(1)} KB • Click to view
                    </p>
                  )}
                </div>
              </button>
            ) : (
              <div className={cellClasses}>
                <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>No file</span>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className={cellClasses}>
            {value || <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>—</span>}
          </div>
        );
    }
  };

  // Render cell based on column type
  const renderCell = (row, column) => {
    const value = row[column.field];
    const cellId = `${row.id}-${column.field}`;

    // If in view mode, render all cells as read-only
    if (viewMode) {
      return renderViewCell(row, column, value);
    }

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
        const cellKey = `${row.id}-${column.field}`;
        const hasError = fileErrors[cellKey];
        const maxSizeMB = column.maxFileSize || 100;
        
        // Handler to open file in new tab (works in both view and edit mode)
        const handleViewFile = () => {
          if (!value || !value.data) return;
          
          try {
            // Create blob from base64 data
            const base64Data = value.data.split(',')[1] || value.data;
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: value.type || 'application/pdf' });
            
            // Create temporary URL and open in new tab
            const blobUrl = URL.createObjectURL(blob);
            const newWindow = window.open(blobUrl, '_blank');
            
            // Cleanup blob URL after window opens
            if (newWindow) {
              newWindow.onload = () => {
                URL.revokeObjectURL(blobUrl);
              };
            }
          } catch (error) {
            console.error('Error opening file:', error);
            alert('Failed to open file. The file may be corrupted.');
          }
        };
        
        return (
          <div className="px-2 py-1 space-y-2">
            {value ? (
              // File uploaded - show clickable file info with delete button
              <div className={`
                flex items-center justify-between gap-2 px-3 py-2 rounded
                ${isDark ? 'bg-gray-600' : 'bg-gray-100'}
              `}>
                <button
                  type="button"
                  onClick={handleViewFile}
                  className={`
                    flex items-center gap-2 min-w-0 flex-1
                    hover:opacity-80 transition-opacity
                    cursor-pointer group
                  `}
                  title="Click to view file"
                >
                  <IoDocument 
                    size={20} 
                    className={`
                      transition-colors
                      ${isDark 
                        ? 'text-blue-400 group-hover:text-blue-300' 
                        : 'text-blue-600 group-hover:text-blue-700'
                      }
                    `}
                  />
                  <div className="min-w-0 flex-1 text-left">
                    <p className={`
                      text-sm font-medium truncate
                      ${isDark 
                        ? 'text-white group-hover:text-blue-300' 
                        : 'text-gray-900 group-hover:text-blue-700'
                      }
                    `}>
                      {value.name}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {(value.size / 1024).toFixed(1)} KB • Click to view
                    </p>
                  </div>
                </button>
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
              <>
                <label
                  htmlFor={cellId}
                  className={`
                    flex items-center justify-center gap-2 px-3 py-2 rounded border-2 border-dashed
                    cursor-pointer transition-colors
                    ${hasError
                      ? isDark 
                        ? 'border-red-500 bg-red-500/10' 
                        : 'border-red-500 bg-red-50'
                      : isDark 
                        ? 'border-gray-600 hover:border-blue-500 hover:bg-gray-700' 
                        : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                    }
                    ${column.readOnly ? 'opacity-60 cursor-not-allowed' : ''}
                  `}
                >
                  <IoCloudUpload 
                    size={20} 
                    className={hasError 
                      ? isDark ? 'text-red-400' : 'text-red-500'
                      : isDark ? 'text-gray-400' : 'text-gray-500'
                    } 
                  />
                  <span className={`text-sm font-medium ${
                    hasError
                      ? isDark ? 'text-red-400' : 'text-red-600'
                      : isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Upload File
                  </span>
                  <input
                    type="file"
                    id={cellId}
                    accept={column.accept || '*'}
                    onChange={(e) => handleFileUpload(row.id, column.field, e, column)}
                    disabled={column.readOnly}
                    className="hidden"
                  />
                </label>
                {/* File size limit info */}
                {!hasError && (
                  <p className={`text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Max: {maxSizeMB}MB
                  </p>
                )}
              </>
            )}
            
            {/* Error message */}
            {hasError && (
              <div className={`
                flex items-start gap-2 px-3 py-2 rounded text-sm
                ${isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-700'}
              `}>
                <IoWarning size={16} className="flex-shrink-0 mt-0.5" />
                <span>{hasError}</span>
              </div>
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