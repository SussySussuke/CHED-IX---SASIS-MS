import React, { useState, useRef, useEffect } from 'react';
import HEILayout from '../../Layouts/HEILayout';
import { router } from '@inertiajs/react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import InfoBox from '../Widgets/InfoBox';
import { IoAddCircle, IoSave } from 'react-icons/io5';
import { useDarkMode } from '../../Hooks/useDarkMode';
import AdditionalNotesSection from './AdditionalNotesSection';
import { HOT_TABLE_DARK_MODE_STYLES } from '../../Utils/hotTableStyles';
import { getSubmissionStatusMessage } from '../../Utils/submissionStatus';
import { getAcademicYearFromUrl } from '../../Utils/urlHelpers';
import AcademicYearSelect from '../Forms/AcademicYearSelect';
import FormSelector from '../Forms/FormSelector';
import { getAnnexConfig } from '../../Config/formConfig';

registerAllModules();

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

  const hotTableRef = useRef(null);
  const isDark = useDarkMode();
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

  const [data, setData] = useState(initialData);

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

    // Update table data
    if (batchEntities.length > 0) {
      const newData = batchEntities.map(config.dataMapper);
      setData(newData);
    } else {
      setData([]);
    }
  }, [academicYear, existingBatches]);

  // Add actions column to columns config
  const columns = [
    ...config.columns,
    {
      data: 'actions',
      title: 'Actions',
      type: 'text',
      readOnly: true,
      width: 60,
      renderer: function(instance, td, row) {
        td.innerHTML = '<button class="delete-row-btn text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" data-row="' + row + '" title="Delete this row" style="padding:0;margin:0;border:none;background:none;cursor:pointer;line-height:1;display:flex;align-items:center;justify-content:center;width:100%;height:100%;"><svg style="width:16px;height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>';
        td.className = 'htCenter htMiddle';
        td.style.cssText = 'padding:0;vertical-align:middle;overflow:hidden;';
        return td;
      }
    }
  ];

  const handleAddRow = () => {
    const hot = hotTableRef.current?.hotInstance;
    if (hot) {
      hot.alter('insert_row_below', hot.countRows());
    }
  };

  const handleRemoveRow = (rowIndex) => {
    if (confirm('Are you sure you want to delete this row?')) {
      const hot = hotTableRef.current?.hotInstance;
      if (hot) {
        hot.alter('remove_row', rowIndex);
      }
    }
  };

  // Add click handler for delete buttons
  useEffect(() => {
    const handleClick = (e) => {
      const deleteBtn = e.target.closest('.delete-row-btn');
      if (deleteBtn) {
        const row = parseInt(deleteBtn.dataset.row);
        handleRemoveRow(row);
      }
    };

    const tableElement = hotTableRef.current?.hotInstance?.rootElement;
    if (tableElement) {
      tableElement.addEventListener('click', handleClick);
      return () => tableElement.removeEventListener('click', handleClick);
    }
  }, [data]);

  const handleSubmit = () => {
    const hot = hotTableRef.current?.hotInstance;
    if (!hot) return;

    const tableData = hot.getData();
    const entities = [];

    // Filter out empty rows and validate
    for (let i = 0; i < tableData.length; i++) {
      const row = tableData[i];

      // Check if row is completely empty
      const isEmptyRow = row.every((cell, index) => {
        // Skip the actions column (last column)
        if (index === row.length - 1) return true;
        return !cell || cell === '';
      });

      if (isEmptyRow) {
        continue;
      }

      // Validate required fields
      const missingFields = config.requiredFields.filter((fieldKey, fieldIndex) => {
        const columnIndex = config.columns.findIndex(col => col.data === fieldKey);
        return !row[columnIndex] || row[columnIndex] === '';
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
        const validationError = config.customValidation(row, i);
        if (validationError) {
          alert(validationError);
          return;
        }
      }

      entities.push(config.submitMapper(row));
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
      <style>{HOT_TABLE_DARK_MODE_STYLES}</style>

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
            <FormSelector currentForm={annexLetter} />
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

            <div className="overflow-x-auto mb-4">
              <HotTable
                ref={hotTableRef}
                data={data}
                colHeaders={true}
                rowHeaders={true}
                columns={columns}
                height="auto"
                minRows={1}
                licenseKey="non-commercial-and-evaluation"
                stretchH="all"
                autoWrapRow={true}
                autoWrapCol={true}
                manualColumnResize={true}
                contextMenu={['row_above', 'row_below', 'undo', 'redo', 'copy', 'cut']}
                className={isDark ? 'dark-table' : ''}
                afterChange={annexLetter === 'L' ? (changes, source) => {
                  // Special logic for Annex L: checkbox mutual exclusivity
                  if (!changes || source === 'loadData') return;

                  const hot = hotTableRef.current?.hotInstance;
                  if (!hot) return;

                  changes.forEach(([row, prop, oldValue, newValue]) => {
                    // If a checkbox is checked, uncheck the other checkboxes and clear "Others"
                    if ((prop === 'male' || prop === 'female' || prop === 'coed') && newValue === true) {
                      if (prop !== 'male') hot.setDataAtRowProp(row, 'male', false, 'internal');
                      if (prop !== 'female') hot.setDataAtRowProp(row, 'female', false, 'internal');
                      if (prop !== 'coed') hot.setDataAtRowProp(row, 'coed', false, 'internal');
                      hot.setDataAtRowProp(row, 'others', '', 'internal');
                    }

                    // If "Others" is filled, uncheck all checkboxes
                    if (prop === 'others' && newValue) {
                      hot.setDataAtRowProp(row, 'male', false, 'internal');
                      hot.setDataAtRowProp(row, 'female', false, 'internal');
                      hot.setDataAtRowProp(row, 'coed', false, 'internal');
                    }
                  });

                  hot.render();
                } : undefined}
              />
            </div>

            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <IoAddCircle className="text-lg" />
              {config.addButtonText}
            </button>
          </div>

          <AdditionalNotesSection
            value={requestNotes}
            onChange={setRequestNotes}
          />

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.visit(`${config.endpoint}/history`)}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={processing}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <IoSave className="text-lg" />
              {processing ? 'Submitting...' : 'Submit Batch'}
            </button>
          </div>
        </div>
      </div>
    </HEILayout>
  );
};

export default SharedAnnexCreate;
