import React, { useState, useRef, useEffect } from 'react';
import HEILayout from '../../Layouts/HEILayout';
import { router } from '@inertiajs/react';
import AGGridEditor from '../Common/AGGridEditor';
import FormSection from '../Common/FormSection';
import TextInput from '../Forms/TextInput';
import IconButton from '../Common/IconButton';
import InfoBox from '../Widgets/InfoBox';
import { IoAddCircle, IoSave, IoTrash } from 'react-icons/io5';
import { useTheme } from '../../Context/ThemeContext';
import AdditionalNotesSection from '../Annex/AdditionalNotesSection';
import { getSubmissionStatusMessage } from '../../Utils/submissionStatus';
import { getAcademicYearFromUrl } from '../../Utils/urlHelpers';
import AcademicYearSelect from '../Forms/AcademicYearSelect';
import { MER1_CONFIG } from '../../Config/mer1Config';
import FormSelector from '../Forms/FormSelector';

/**
 * SharedFormCreate - Universal form component for MER1 and similar multi-section forms
 * 
 * Supports:
 * - Locked profile sections (autofilled, non-editable)
 * - Form fields (text, textarea)
 * - AG Grid tables with add/remove rows
 * - Year selection
 * - View/Edit modes
 * 
 * @param {string} formType - Form type identifier (e.g., 'MER1')
 * @param {object} config - Form configuration object (from mer1Config.js)
 * @param {array} availableYears - Available academic years
 * @param {object} existingData - Existing submission data by year
 * @param {string} defaultYear - Default academic year
 * @param {boolean} isEditing - Whether in edit mode
 * @param {object} auth - Auth user object with HEI data
 */
const SharedFormCreate = ({
  formType = 'MER1',
  config = MER1_CONFIG,
  availableYears = [],
  existingData = {},
  defaultYear,
  isEditing = false,
  auth
}) => {
  
  const currentAcademicYear = getAcademicYearFromUrl(defaultYear);
  const { isDark } = useTheme();
  
  const [academicYear, setAcademicYear] = useState(currentAcademicYear);
  const [requestNotes, setRequestNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // Form fields data (for text inputs, textareas)
  const [formData, setFormData] = useState({});
  
  // Table data (separate state for each table section)
  const [tableData, setTableData] = useState({});
  
  const existingSubmission = existingData[academicYear];

  // Helper function to create empty row for a table section
  const createEmptyRow = (columns) => {
    const row = {};
    columns.forEach(col => {
      row[col.field] = col.type === 'numeric' ? null : '';
    });
    return row;
  };

  // Initialize form and table data
  useEffect(() => {
    const newFormData = {};
    const newTableData = {};

    config.sections.forEach(section => {
      if (section.type === 'form_fields') {
        section.fields.forEach(field => {
          newFormData[field.key] = existingSubmission?.[field.key] || '';
        });
      }
      
      if (section.type === 'table') {
        const entities = existingSubmission?.[section.entityName] || [];
        if (entities.length > 0) {
          newTableData[section.entityName] = entities.map(section.dataMapper);
        } else {
          // Start with one empty row
          newTableData[section.entityName] = [createEmptyRow(section.columns)];
        }
      }
    });

    setFormData(newFormData);
    setTableData(newTableData);
  }, [academicYear, existingSubmission]);

  // Handle form field change
  const handleFormFieldChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle table data change
  const handleTableDataChange = (entityName, newData) => {
    setTableData(prev => ({
      ...prev,
      [entityName]: newData
    }));
  };

  // Add row to table
  const handleAddRow = (section) => {
    const currentData = tableData[section.entityName] || [];
    const newRow = createEmptyRow(section.columns);
    handleTableDataChange(section.entityName, [...currentData, newRow]);
  };

  // Remove row from table
  const handleRemoveRow = (section, rowIndex) => {
    const currentData = tableData[section.entityName] || [];
    if (currentData.length <= 1) {
      // Keep at least one row
      handleTableDataChange(section.entityName, [createEmptyRow(section.columns)]);
    } else {
      const newData = currentData.filter((_, idx) => idx !== rowIndex);
      handleTableDataChange(section.entityName, newData);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    setProcessing(true);

    const payload = config.buildPayload(
      { ...formData, academic_year: academicYear, request_notes: requestNotes },
      tableData
    );

    router.post(config.endpoint, payload, {
      onSuccess: () => {
        setProcessing(false);
        // Success message is handled by backend redirect with flash message
      },
      onError: (errors) => {
        console.error('MER1 Submission ERRORS:', errors);
        console.error('Error details:', JSON.stringify(errors, null, 2));
        setProcessing(false);
        
        // Show error alert to user
        const errorMessages = Object.values(errors).join('\n');
        alert(`Submission failed:\n\n${errorMessages}`);
      },
      onFinish: () => {
        setProcessing(false);
      }
    });
  };

  // Render locked profile section
  const renderLockedProfile = (section) => {
    return (
      <FormSection title={section.title} subtitle={section.description}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {section.fields.map(field => (
            <TextInput
              key={field.key}
              label={field.label}
              name={field.key}
              value={auth?.user?.hei?.[field.key] || ''}
              disabled={true}
              className="w-full"
            />
          ))}
        </div>
      </FormSection>
    );
  };

  // Render form fields section
  const renderFormFields = (section) => {
    return (
      <FormSection title={section.title} subtitle={section.subtitle}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {section.fields.map(field => {
            if (field.type === 'textarea') {
              return (
                <div key={field.key} className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <textarea
                    value={formData[field.key] || ''}
                    onChange={(e) => handleFormFieldChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={field.rows || 4}
                    disabled={false}
                    className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                  />
                  {field.helpText && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {field.helpText}
                    </p>
                  )}
                </div>
              );
            }
            
            // Determine column span
            const colSpanClass = (field.fullWidth || field.type === 'textarea') ? 'md:col-span-2' : '';
            
            return (
              <div key={field.key} className={colSpanClass}>
                <TextInput
                  label={field.label}
                  name={field.key}
                  type={field.type || 'text'}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleFormFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  disabled={false}
                  className="w-full"
                  helperText={field.helpText}
                />
              </div>
            );
          })}
        </div>
      </FormSection>
    );
  };

  // Render table section with AG Grid
  const renderTable = (section) => {
    const currentData = tableData[section.entityName] || [];
    
    // Convert config columns to AG Grid column definitions
    const columnDefs = section.columns.map(col => {
      const baseCol = {
        field: col.field,
        headerName: col.headerName,
        headerTooltip: col.placeholder || col.headerName,
        editable: true, // Always editable for MER1 REPORT sections
        minWidth: col.minWidth || 150,
      };

      if (col.type === 'numeric') {
        baseCol.valueParser = params => {
          let val = params.newValue;
          // If maxLength is specified in config, truncate the value
          if (col.maxLength && val !== '' && val !== null) {
            const strVal = String(val);
            if (strVal.length > col.maxLength) {
              val = strVal.substring(0, col.maxLength);
            }
          }
          return val === '' || val === null ? null : Number(val);
        };
        baseCol.cellEditor = 'agNumberCellEditor';
        baseCol.cellEditorParams = {
          placeholder: col.placeholder || '',
          // Add maxLength if specified
          ...(col.maxLength && { max: Math.pow(10, col.maxLength) - 1 })
        };
      } else if (col.type === 'date') {
        baseCol.cellEditor = 'agDateStringCellEditor';
        baseCol.valueFormatter = params => {
          if (!params.value) return '';
          return params.value;
        };
        baseCol.cellEditorParams = {
          placeholder: col.placeholder || 'YYYY-MM-DD'
        };
      } else {
        baseCol.cellEditorParams = {
          placeholder: col.placeholder || ''
        };
      }

      return baseCol;
    });

    // Delete button cell renderer component
    const DeleteButtonRenderer = (props) => {
      const handleDelete = () => {
        handleRemoveRow(section, props.node.rowIndex);
      };

      return (
        <div className="flex items-center justify-center h-full">
          <IconButton
            onClick={handleDelete}
            variant="red"
            title="Delete row"
          >
            <IoTrash size={16} />
          </IconButton>
        </div>
      );
    };

    // Add delete button column - always show for MER1 REPORT sections
    columnDefs.push({
      headerName: 'Actions',
      field: 'actions',
      width: 80,
      pinned: 'right',
      sortable: false,
      filter: false,
      editable: false,
      cellRenderer: DeleteButtonRenderer,
    });

    return (
      <FormSection title={section.title} subtitle={section.subtitle} type="table">
        <AGGridEditor
          rowData={currentData}
          columnDefs={columnDefs}
          onCellValueChanged={(event) => {
            const updatedData = [...currentData];
            updatedData[event.node.rowIndex] = event.data;
            handleTableDataChange(section.entityName, updatedData);
          }}
          height="300px"
          autoHeightForSmallData={true}
        />
        
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => handleAddRow(section)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium
              transition-colors
              ${isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
              }
            `}
          >
            <IoAddCircle size={20} />
            Add Row
          </button>
        </div>
      </FormSection>
    );
  };

  // Render section based on type
  const renderSection = (section) => {
    switch (section.type) {
      case 'locked_profile':
        return renderLockedProfile(section);
      case 'form_fields':
        return renderFormFields(section);
      case 'table':
        return renderTable(section);
      case 'divider':
        return <FormSection type="divider" title={section.text} />;
      default:
        return null;
    }
  };

  return (
    <HEILayout title={config.title}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {config.title}
            </h1>
            <span className="text-xl font-semibold text-gray-500 dark:text-gray-400">
              {formType}
            </span>
          </div>
        </div>

        {/* Year Selector and Form Selector - Only show when NOT editing */}
        {!isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AcademicYearSelect
              value={academicYear}
              onChange={(e) => {
                const year = e.target.value;
                setAcademicYear(year);
              }}
              availableYears={availableYears}
              required
            />
            <FormSelector currentForm={formType} />
          </div>
        )}
        
        {/* Locked Year Info Box - Only show when editing */}
        {isEditing && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Academic Year:</strong> {academicYear}
            </p>
          </div>
        )}

        {/* Status Info Box */}
        <InfoBox
          type={getSubmissionStatusMessage(existingSubmission).type}
          message={getSubmissionStatusMessage(existingSubmission).message}
        />

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className={`
            relative p-6 rounded-lg shadow border space-y-6
            ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
          `}>
            {/* Render all sections */}
            {config.sections.map((section, index) => (
              <div key={section.id || index}>
                {renderSection(section)}
              </div>
            ))}

            {/* Additional Notes Section */}
            <AdditionalNotesSection
              value={requestNotes}
              onChange={setRequestNotes}
            />

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={processing}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-medium
                  transition-colors
                  ${processing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : isDark
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }
                `}
              >
                <IoSave size={20} />
                {processing ? 'Saving...' : 'Save Submission'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </HEILayout>
  );
};

export default SharedFormCreate;
