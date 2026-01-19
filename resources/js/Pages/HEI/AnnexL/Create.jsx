import React, { useState, useRef, useEffect } from 'react';
import HEILayout from '../../../Layouts/HEILayout';
import { router } from '@inertiajs/react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import InfoBox from '../../../Components/Widgets/InfoBox';
import { CURRENT_YEAR } from '../../../Utils/constants';
import { IoAddCircle, IoSave } from 'react-icons/io5';
import { useDarkMode } from '../../../Hooks/useDarkMode';
import AdditionalNotesSection from '../../../Components/Annex/AdditionalNotesSection';
import { HOT_TABLE_DARK_MODE_STYLES } from '../../../Utils/hotTableStyles';
import AcademicYearSelect from '../../../Components/Forms/AcademicYearSelect';
import SubmissionLock from '../../../Components/Widgets/SubmissionLock';

registerAllModules();

const Create = ({ availableYears = [], existingBatches = {}, defaultYear, isEditing = false }) => {
  const currentYear = new Date().getFullYear();
  const currentAcademicYear = defaultYear || `${currentYear}-${currentYear + 1}`;
  const [selectedYear, setSelectedYear] = useState(currentAcademicYear);
  const [academicYear, setAcademicYear] = useState(currentAcademicYear);

  const existingBatch = existingBatches[selectedYear];
  const isPublished = existingBatch?.status === 'published';
  // Show lock only in create mode when a published batch exists
  const shouldLock = isPublished && !isEditing;
  const housing = existingBatch?.housing || [];
  const hotTableRef = useRef(null);
  const isDark = useDarkMode();
  const [requestNotes, setRequestNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const initialData = housing && housing.length > 0
    ? housing.map(h => ({
        housing_name: h.housing_name,
        complete_address: h.complete_address,
        house_manager_name: h.house_manager_name,
        male: h.male || false,
        female: h.female || false,
        coed: h.coed || false,
        others: h.others || '',
        remarks: h.remarks
      }))
    : [];

  const [data, setData] = useState(initialData);

  const columns = [
    { data: 'housing_name', title: 'Housing Name', type: 'text', width: 250, placeholder: 'Housing name' },
    { data: 'complete_address', title: 'Complete Address', type: 'text', width: 300, placeholder: 'Address' },
    { data: 'house_manager_name', title: 'House Manager Name', type: 'text', width: 200, placeholder: 'Manager name' },
    { data: 'male', title: 'Male', type: 'checkbox', width: 80, className: 'htCenter htMiddle' },
    { data: 'female', title: 'Female', type: 'checkbox', width: 80, className: 'htCenter htMiddle' },
    { data: 'coed', title: 'Co-ed', type: 'checkbox', width: 80, className: 'htCenter htMiddle' },
    {
      data: 'others',
      title: 'Others (Specify)',
      type: 'text',
      width: 180,
      placeholder: 'Only if no checkbox selected',
      renderer: function(instance, td, row, col, prop, value, cellProperties) {
        const rowData = instance.getDataAtRow(row);
        const male = rowData[3];
        const female = rowData[4];
        const coed = rowData[5];

        if (male || female || coed) {
          td.style.backgroundColor = '#f3f4f6';
          td.style.color = '#9ca3af';
          cellProperties.readOnly = true;
        } else {
          td.style.backgroundColor = '';
          td.style.color = '';
          cellProperties.readOnly = false;
        }
        td.innerHTML = value || '';
        return td;
      }
    },
    { data: 'remarks', title: 'Remarks', type: 'text', width: 200, placeholder: 'Remarks' },
    {
      data: null,
      title: 'Actions',
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
    if (hot) hot.alter('insert_row_below', hot.countRows());
  };

  const handleRemoveRow = (rowIndex) => {
    if (confirm('Are you sure you want to delete this row?')) {
      const hot = hotTableRef.current?.hotInstance;
      if (hot) hot.alter('remove_row', rowIndex);
    }
  };

  useEffect(() => {
    const handleClick = (e) => {
      const deleteBtn = e.target.closest('.delete-row-btn');
      if (deleteBtn) handleRemoveRow(parseInt(deleteBtn.dataset.row));
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
    const housing = [];

    for (let i = 0; i < tableData.length; i++) {
      const [housingName, completeAddress, houseManagerName, male, female, coed, others, remarks] = tableData[i];

      if (!housingName && !completeAddress && !houseManagerName && !male && !female && !coed && !others && !remarks) continue;

      if (!housingName || !completeAddress || !houseManagerName) {
        alert(`Row ${i + 1}: Please fill in all required fields (Housing Name, Complete Address, House Manager Name)`);
        return;
      }

      if (!male && !female && !coed && !others) {
        alert(`Row ${i + 1}: Please select at least one type (Male, Female, Co-ed, or specify Others)`);
        return;
      }

      housing.push({
        housing_name: housingName,
        complete_address: completeAddress,
        house_manager_name: houseManagerName,
        male: !!male,
        female: !!female,
        coed: !!coed,
        others: others || null,
        remarks: remarks || null
      });
    }

    if (housing.length === 0) {
      alert('Please add at least one housing to submit.');
      return;
    }

    setProcessing(true);
    router.post('/hei/annex-l', { academic_year: academicYear, housing, request_notes: requestNotes }, { onFinish: () => setProcessing(false) });
  };

  return (
    <HEILayout title="Submit Annex L">
      <style>{HOT_TABLE_DARK_MODE_STYLES}</style>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">STUDENT HOUSING</h1>
            <span className="text-xl font-semibold text-gray-500 dark:text-gray-400">Annex L</span>
          </div>
        </div>
        {!isEditing && (
          <AcademicYearSelect
            value={academicYear}
            onChange={(e) => {
              const year = e.target.value;
              setAcademicYear(year);
              setSelectedYear(year);
            }}
            availableYears={availableYears}
            required
          />
        )}
        {isEditing && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Academic Year:</strong> {academicYear}
            </p>
          </div>
        )}

        <InfoBox type="info" message="Add multiple housing facilities in the table below. You can submit them all at once as a batch." />

        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 space-y-6">
          {shouldLock && (
            <SubmissionLock
              message={existingBatch?.batch_id ? "This academic year has published data. You can edit it to submit an update request." : "You have already submitted and published data for this academic year."}
              editUrl={existingBatch?.batch_id ? `/hei/annex-l/edit/${existingBatch.batch_id}` : null}
              historyUrl="/hei/annex-l/history"
            />
          )}

        <div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Housing Facilities</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Add multiple housing facilities below. Each row represents one facility.</p>
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
              autoWrapRow={true}
              autoWrapCol={true}
              manualColumnResize={true}
              contextMenu={['row_above', 'row_below', 'undo', 'redo', 'copy', 'cut']}
              className={isDark ? 'dark-table' : ''}
              afterChange={(changes, source) => {
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
              }}
            />
          </div>

          <button type="button" onClick={handleAddRow} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <IoAddCircle className="text-lg" />Add Another Housing
          </button>
        </div>

          <AdditionalNotesSection value={requestNotes} onChange={setRequestNotes} />

          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => router.visit('/hei/annex-l/history')} className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
            <button type="button" onClick={handleSubmit} disabled={processing || shouldLock} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <IoSave className="text-lg" />{processing ? 'Submitting...' : 'Submit Batch'}
            </button>
          </div>
        </div>
      </div>
    </HEILayout>
  );
};

export default Create;
