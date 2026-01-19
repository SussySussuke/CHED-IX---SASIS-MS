import React, { useState, useRef, useEffect } from 'react';
import HEILayout from '../../../Layouts/HEILayout';
import { router } from '@inertiajs/react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import InfoBox from '../../../Components/Widgets/InfoBox';
import { CURRENT_YEAR } from '../../../Utils/constants';
import { IoAddCircle, IoTrash, IoSave } from 'react-icons/io5';
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

  const hotTableRef = useRef(null);
  const isDark = useDarkMode();
  const [requestNotes, setRequestNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [academicYear, setAcademicYear] = useState(currentAcademicYear);

  const existingBatch = existingBatches[selectedYear];
  const isPublished = existingBatch?.status === 'published';
  // Show lock only in create mode when a published batch exists
  const shouldLock = isPublished && !isEditing;

  // Pre-fill with existing data if available
  const programs = existingBatch?.programs || [];
  const initialData = programs && programs.length > 0
    ? programs.map(p => ({
        title: p.title,
        venue: p.venue,
        implementation_date: p.implementation_date ? p.implementation_date.split('T')[0] : '',
        participants_online: p.participants_online,
        participants_face_to_face: p.participants_face_to_face,
        organizer: p.organizer,
        remarks: p.remarks || ''
      }))
    : [];

  const [data, setData] = useState(initialData);

  // Update data when selected year changes
  useEffect(() => {
    const batch = existingBatches[selectedYear];
    const batchPrograms = batch?.programs || [];
    if (batchPrograms.length > 0) {
      const newData = batchPrograms.map(p => ({
        title: p.title,
        venue: p.venue,
        implementation_date: p.implementation_date ? p.implementation_date.split('T')[0] : '',
        participants_online: p.participants_online,
        participants_face_to_face: p.participants_face_to_face,
        organizer: p.organizer,
        remarks: p.remarks || ''
      }));
      setData(newData);
    } else {
      setData([]);
    }
  }, [selectedYear, existingBatches]);

  const columns = [
    {
      data: 'title',
      title: 'Title of Programs/Projects/Activities',
      type: 'text',
      width: 250,
      placeholder: 'e.g., Job Fair 2025'
    },
    {
      data: 'venue',
      title: 'Venue',
      type: 'text',
      width: 150,
      placeholder: 'e.g., University Auditorium'
    },
    {
      data: 'implementation_date',
      title: 'Date of Implementation',
      type: 'date',
      dateFormat: 'YYYY-MM-DD',
      correctFormat: true,
      width: 150,
      placeholder: 'YYYY-MM-DD'
    },
    {
      data: 'participants_online',
      title: 'Participants (Online)',
      type: 'numeric',
      numericFormat: { pattern: '0,0' },
      width: 130,
      placeholder: '0'
    },
    {
      data: 'participants_face_to_face',
      title: 'Participants (Face-to-Face)',
      type: 'numeric',
      numericFormat: { pattern: '0,0' },
      width: 150,
      placeholder: '0'
    },
    {
      data: 'organizer',
      title: 'Organizer',
      type: 'text',
      width: 150,
      placeholder: 'e.g., Career Center'
    },
    {
      data: 'remarks',
      title: 'Remarks (Optional)',
      type: 'text',
      width: 200,
      placeholder: 'Optional notes'
    },
    {
      data: 'actions',
      title: 'Actions',
      type: 'text',
      readOnly: true,
      width: 60,
      renderer: function(instance, td, row, col, prop, value) {
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
    const programs = [];

    // Filter out empty rows and validate
    for (let i = 0; i < tableData.length; i++) {
      const row = tableData[i];
      const [title, venue, implementation_date, participants_online, participants_face_to_face, organizer, remarks] = row;

      // Skip completely empty rows
      if (!title && !venue && !implementation_date && !organizer) {
        continue;
      }

      // Validate required fields
      if (!title || !venue || !implementation_date || !organizer) {
        alert(`Row ${i + 1}: Please fill in all required fields (Title, Venue, Date, Organizer)`);
        return;
      }

      programs.push({
        title,
        venue,
        implementation_date,
        participants_online: parseInt(participants_online) || 0,
        participants_face_to_face: parseInt(participants_face_to_face) || 0,
        organizer,
        remarks: remarks || ''
      });
    }

    if (programs.length === 0) {
      alert('Please add at least one program to submit.');
      return;
    }

    setProcessing(true);

    router.post('/hei/annex-c', {
      academic_year: academicYear,
      programs,
      request_notes: requestNotes
    }, {
      onFinish: () => setProcessing(false)
    });
  };

  return (
    <HEILayout title="Submit Annex C">
      <style>{HOT_TABLE_DARK_MODE_STYLES}</style>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              LIST OF PROGRAMS/ PROJECTS/ ACTIVITIES CAREER AND JOB PLACEMENT SERVICES
            </h1>
            <span className="text-xl font-semibold text-gray-500 dark:text-gray-400">
              Annex C
            </span>
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

        <InfoBox
          type="info"
          message="Add multiple programs/projects/activities in the table below. You can submit them all at once as a batch. Submitting will replace any previous submission for this year."
        />

        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 space-y-6">
          {shouldLock && (
            <SubmissionLock
              message={existingBatch?.batch_id ? "This academic year has published data. You can edit it to submit an update request." : "You have already submitted and published data for this academic year."}
              editUrl={existingBatch?.batch_id ? `/hei/annex-c/edit/${existingBatch.batch_id}` : null}
              historyUrl="/hei/annex-c/history"
            />
          )}

        <div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Programs/Projects/Activities
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Add multiple programs below. Each row represents one program/project/activity.
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
            />
          </div>

          <button
            type="button"
            onClick={handleAddRow}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <IoAddCircle className="text-lg" />
            Add Another Program
          </button>
        </div>

          <AdditionalNotesSection
            value={requestNotes}
            onChange={setRequestNotes}
          />

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.visit('/hei/annex-c/history')}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={processing || shouldLock}
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

export default Create;
