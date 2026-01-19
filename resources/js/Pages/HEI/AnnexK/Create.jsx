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
  const committees = existingBatch?.committees || [];
  const hotTableRef = useRef(null);
  const isDark = useDarkMode();
  const [requestNotes, setRequestNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const initialData = committees && committees.length > 0
    ? committees.map(c => ({
        committee_name: c.committee_name,
        committee_head_name: c.committee_head_name,
        members_composition: c.members_composition,
        programs_projects_activities_trainings: c.programs_projects_activities_trainings,
        remarks: c.remarks
      }))
    : [];

  const [data, setData] = useState(initialData);

  const columns = [
    { data: 'committee_name', title: 'Committee Name', type: 'text', width: 250, placeholder: 'Committee name' },
    { data: 'committee_head_name', title: 'Committee Head Name', type: 'text', width: 200, placeholder: 'Head name' },
    { data: 'members_composition', title: 'Members Composition', type: 'text', width: 200, placeholder: 'Members' },
    { data: 'programs_projects_activities_trainings', title: 'Programs/Projects/Activities/Trainings', type: 'text', width: 300, placeholder: 'Activities' },
    { data: 'remarks', title: 'Remarks', type: 'text', width: 200, placeholder: 'Remarks' },
    {
      data: 'actions', title: 'Actions', type: 'text', readOnly: true, width: 60,
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
    const committees = [];

    for (let i = 0; i < tableData.length; i++) {
      const [committeeName, committeeHeadName, membersComposition, programsProjectsActivitiesTrainings, remarks] = tableData[i];
      if (!committeeName && !committeeHeadName && !membersComposition && !programsProjectsActivitiesTrainings && !remarks) continue;
      if (!committeeName || !committeeHeadName || !membersComposition) {
        alert(`Row ${i + 1}: Please fill in all required fields (Committee Name, Committee Head Name, Members Composition)`);
        return;
      }
      committees.push({
        committee_name: committeeName,
        committee_head_name: committeeHeadName,
        members_composition: membersComposition,
        programs_projects_activities_trainings: programsProjectsActivitiesTrainings || null,
        remarks: remarks || null
      });
    }

    if (committees.length === 0) {
      alert('Please add at least one committee to submit.');
      return;
    }

    setProcessing(true);
    router.post('/hei/annex-k', { academic_year: academicYear, committees, request_notes: requestNotes }, { onFinish: () => setProcessing(false) });
  };

  return (
    <HEILayout title="Submit Annex K">
      <style>{HOT_TABLE_DARK_MODE_STYLES}</style>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SAFETY AND SECURITY COMMITTEES</h1>
            <span className="text-xl font-semibold text-gray-500 dark:text-gray-400">Annex K</span>
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

        <InfoBox type="info" message="Add multiple committees in the table below. You can submit them all at once as a batch." />

        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 space-y-6">
          {shouldLock && (
            <SubmissionLock
              message={existingBatch?.batch_id ? "This academic year has published data. You can edit it to submit an update request." : "You have already submitted and published data for this academic year."}
              editUrl={existingBatch?.batch_id ? `/hei/annex-k/edit/${existingBatch.batch_id}` : null}
              historyUrl="/hei/annex-k/history"
            />
          )}

        <div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Committees</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Add multiple committees below. Each row represents one committee.</p>
          </div>

          <div className="overflow-x-auto mb-4">
            <HotTable ref={hotTableRef} data={data} colHeaders={true} rowHeaders={true} columns={columns} height="auto" minRows={1} licenseKey="non-commercial-and-evaluation" stretchH="all" autoWrapRow={true} autoWrapCol={true} manualColumnResize={true} contextMenu={['row_above', 'row_below', 'undo', 'redo', 'copy', 'cut']} className={isDark ? 'dark-table' : ''} />
          </div>

          <button type="button" onClick={handleAddRow} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <IoAddCircle className="text-lg" />Add Another Committee
          </button>
        </div>

          <AdditionalNotesSection value={requestNotes} onChange={setRequestNotes} />

          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => router.visit('/hei/annex-k/history')} className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
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
