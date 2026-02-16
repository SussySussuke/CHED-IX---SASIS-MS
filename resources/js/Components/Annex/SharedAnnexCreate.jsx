import React, { useState, useRef, useEffect } from 'react';
import HEILayout from '../../Layouts/HEILayout';
import { router } from '@inertiajs/react';
import AGGridEditor from '../Common/AGGridEditor';
import IconButton from '../Common/IconButton';
import InfoBox from '../Widgets/InfoBox';
import { IoAddCircle, IoSave, IoTrash } from 'react-icons/io5';
import { useTheme } from '../../Context/ThemeContext';
import AdditionalNotesSection from './AdditionalNotesSection';
import { getSubmissionStatusMessage } from '../../Utils/submissionStatus';
import { getAcademicYearFromUrl } from '../../Utils/urlHelpers';
import AcademicYearSelect from '../Forms/AcademicYearSelect';
import FormSelector from '../Forms/FormSelector';
import { getAnnexConfig, buildFormOptionsGrouped } from '../../Config/formConfig';
import { getFormRoute } from '../../Config/nonAnnexForms';

/**
 * Shared component for Annex A-F, I-L, N-O Create pages
 * @param {string} annexLetter - The annex letter (A, B, C, E, F, I, J, K, L, N, O)
 * @param {array} availableYears - Available academic years
 * @param {object} existingBatches - Existing batch submissions by year
 * @param {string} defaultYear - Default academic year
 * @param {boolean} isEditing - Whether in edit mode
 */
const SharedAnnexCreate = ({
  annexLetter,
  availableYears = [],
  existingBatches = {},
  defaultYear,
  isEditing = false
}) => {
  const config = getAnnexConfig(annexLetter);
  const currentAcademicYear = getAcademicYearFromUrl(defaultYear);
  const formOptions = buildFormOptionsGrouped();

  const gridRef = useRef(null);
  const { isDark } = useTheme();
  const [requestNotes, setRequestNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [academicYear, setAcademicYear] = useState(currentAcademicYear);

  // Form fields state (for Annex F)
  const [formFieldsData, setFormFieldsData] = useState({});

  const existingBatch = existingBatches[academicYear];

  // Pre-fill with existing data if available
  const entities = existingBatch?.[config.entityName] || [];
  const initialData = entities && entities.length > 0
    ? entities.map(config.dataMapper)
    : [];

  // Helper function to create an empty row
  const createEmptyRow = () => {
    const newRow = {};
    config.columns.forEach(col => {
      newRow[col.data] = col.type === 'checkbox' ? false : '';
    });
    return newRow;
  };

  const [data, setData] = useState(initialData.length > 0 ? initialData : [createEmptyRow()]);

  // Initialize form fields (for Annex F)
  useEffect(() => {
    if (config.hasFormFields && config.formFields) {
      const formData = existingBatch?.formData || {};
      const initialFormData = {};
      config.formFields.forEach(field => {
        initialFormData[field.key] = formData[field.key] || '';
      });
      setFormFieldsData(initialFormData);
    }
  }, [existingBatch, config.hasFormFields]);

  // Update data when academic year changes
  useEffect(() => {
    const batch = existingBatches[academicYear];
    const batchEntities = batch?.[config.entityName] || [];

    // Update form fields if applicable
    if (config.hasFormFields && config.formFields) {
      const formData = batch?.formData || {};
      const updatedFormData = {};
      config.formFields.forEach(field => {
        updatedFormData[field.key] = formData[field.key] || '';
      });
      setFormFieldsData(updatedFormData);
    }

    // Update table data - always ensure at least one empty row
    if (batchEntities.length > 0) {
      const newData = batchEntities.map(config.dataMapper);
      setData(newData);
    } else {
      setData([createEmptyRow()]);
    }
  }, [academicYear, existingBatches]);

  // Convert config columns to AG Grid column definitions
  const columnDefs = config.columns.map(col => {
    const baseCol = {
      field: col.data,
      headerName: col.title,
      headerTooltip: col.placeholder || col.title,
      editable: true,
      minWidth: col.width || 150,
    };

    // Handle different column types
    if (col.type === 'numeric') {
      baseCol.valueParser = params => {
        const val = params.newValue;
        return val === '' || val === null ? null : Number(val);
      };
      baseCol.cellEditor = 'agNumberCellEditor';
      baseCol.cellEditorParams = {
        placeholder: col.placeholder || ''
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
    } else if (col.type === 'checkbox') {
      baseCol.cellEditor = 'agCheckboxCellEditor';
      baseCol.cellRenderer = params => {
        return params.value ? '✓' : '';
      };
    } else if (col.type === 'dropdown') {
      baseCol.cellEditor = 'agSelectCellEditor';
      baseCol.cellEditorParams = {
        values: col.source || []
      };
    } else {
      // Default text editor with placeholder
      baseCol.cellEditorParams = {
        placeholder: col.placeholder || ''
      };
    }

    return baseCol;
  });

  // Delete button cell renderer component
  const DeleteButtonRenderer = (props) => {
    const handleDelete = () => {
      handleRemoveRow(props.node.rowIndex);
    };

    return (
      <IconButton
        onClick={handleDelete}
        variant="red"
        title="Delete this row"
      >
        <IoTrash className="w-4 h-4" />
      </IconButton>
    );
  };

  // Add delete action column
  columnDefs.push({
    field: 'actions',
    headerName: 'Actions',
    editable: false,
    width: 80,
    pinned: 'right',
    cellRenderer: DeleteButtonRenderer,
  });

  const handleAddRow = () => {
    setData([...data, createEmptyRow()]);
  };

  const handleRemoveRow = (rowIndex) => {
    if (confirm('Are you sure you want to delete this row?')) {
      const newData = data.filter((_, idx) => idx !== rowIndex);
      // Always ensure at least one empty row exists after deletion
      setData(newData.length === 0 ? [createEmptyRow()] : newData);
    }
  };



  // Handle cell value changes for Annex L special logic
  const handleCellValueChanged = (params) => {
    if (annexLetter === 'L') {
      const { data: rowData, colDef } = params;
      const field = colDef.field;

      // Special logic for Annex L: checkbox mutual exclusivity
      if ((field === 'male' || field === 'female' || field === 'coed') && params.newValue === true) {
        const updatedData = data.map((row, idx) => {
          if (idx === params.node.rowIndex) {
            return {
              ...row,
              male: field === 'male' ? true : false,
              female: field === 'female' ? true : false,
              coed: field === 'coed' ? true : false,
              others: ''
            };
          }
          return row;
        });
        setData(updatedData);
      }

      // If "Others" is filled, uncheck all checkboxes
      if (field === 'others' && params.newValue) {
        const updatedData = data.map((row, idx) => {
          if (idx === params.node.rowIndex) {
            return {
              ...row,
              male: false,
              female: false,
              coed: false
            };
          }
          return row;
        });
        setData(updatedData);
      }
    }

    // Update the data state
    const updatedData = [...data];
    updatedData[params.node.rowIndex] = params.data;
    setData(updatedData);
  };

  const handleSubmit = () => {
    const entities = [];

    // Filter out empty rows and validate
    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      // Check if row is completely empty
      const isEmptyRow = config.columns.every(col => {
        const value = row[col.data];
        return !value || value === '';
      });

      if (isEmptyRow) {
        continue;
      }

      // Validate required fields
      const missingFields = config.requiredFields.filter(fieldKey => {
        const value = row[fieldKey];
        return !value || value === '';
      });

      if (missingFields.length > 0) {
        const fieldLabels = missingFields.map(fieldKey => {
          const column = config.columns.find(col => col.data === fieldKey);
          return column ? column.title : fieldKey;
        });
        alert(`Row ${i + 1}: Please fill in all required fields (${fieldLabels.join(', ')})`);
        return;
      }

      // Custom validation (for Annex L special logic)
      if (config.customValidation) {
        const rowArray = config.columns.map(col => row[col.data]);
        const validationError = config.customValidation(rowArray, i);
        if (validationError) {
          alert(validationError);
          return;
        }
      }

      const rowArray = config.columns.map(col => row[col.data]);
      entities.push(config.submitMapper(rowArray));
    }

    if (entities.length === 0) {
      alert(`Please add at least one ${config.entityLabel.toLowerCase()} to submit.`);
      return;
    }

    setProcessing(true);

    const submitData = {
      academic_year: academicYear,
      [config.entityName]: entities,
      request_notes: requestNotes
    };

    // Add form fields if applicable (for Annex F)
    if (config.hasFormFields) {
      Object.keys(formFieldsData).forEach(key => {
        submitData[key] = formFieldsData[key];
      });
    }

    router.post(config.endpoint, submitData, {
      onFinish: () => setProcessing(false)
    });
  };

  return (
    <HEILayout title={`Submit Annex ${annexLetter}`}>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {config.title}
            </h1>
            <span className="text-xl font-semibold text-gray-500 dark:text-gray-400">
              Annex {annexLetter}
            </span>
          </div>
        </div>

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
            <FormSelector 
              currentForm={annexLetter}
              options={formOptions}
              mode="navigate"
              getRoute={getFormRoute}
              confirmBeforeChange={true}
              label="Form Type"
            />
          </div>
        )}
        {isEditing && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Academic Year:</strong> {academicYear}
            </p>
          </div>
        )}

        <InfoBox
          type={getSubmissionStatusMessage(existingBatch).type}
          message={getSubmissionStatusMessage(existingBatch).message}
        />

        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 space-y-6">
          <div>
            {/* Form fields (for Annex F) */}
            {config.hasFormFields && config.formFields && (
              <div className="space-y-4 mb-6">
                {config.formFields.map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={formFieldsData[field.key] || ''}
                      onChange={(e) => setFormFieldsData({
                        ...formFieldsData,
                        [field.key]: e.target.value
                      })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder={field.placeholder}
                      maxLength={field.maxLength}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {config.entityLabel}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Add multiple {config.entityLabel.toLowerCase()} below. Each row represents one {config.entityLabel.toLowerCase().replace(/s$/, '')}.
              </p>
            </div>

            <div className="mb-4">
              <AGGridEditor
                ref={gridRef}
                rowData={data}
                columnDefs={columnDefs}
                onCellValueChanged={handleCellValueChanged}
                height="500px"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddRow}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                  transition-colors
                  ${
                    isDark
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }
                `}
              >
                <IoAddCircle size={20} />
                {config.addButtonText}
              </button>
            </div>
          </div>

          <AdditionalNotesSection
            value={requestNotes}
            onChange={setRequestNotes}
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={processing}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-lg font-medium
                transition-colors
                ${
                  processing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : isDark
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                }
              `}
            >
              <IoSave size={20} />
              {processing ? 'Submitting...' : 'Submit Batch'}
            </button>
          </div>
        </div>
      </div>
    </HEILayout>
  );
};

export default SharedAnnexCreate;
