import React, { useState, useRef, useEffect } from 'react';
import HEILayout from '../../../Layouts/HEILayout';
import { router } from '@inertiajs/react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import InfoBox from '../../../Components/Widgets/InfoBox';
import { CURRENT_YEAR } from '../../../Utils/constants';
import { getSubmissionStatusMessage } from '../../../Utils/submissionStatus';
import { getAcademicYearFromUrl } from '../../../Utils/urlHelpers';
import { IoAddCircle, IoSave } from 'react-icons/io5';
import { useDarkMode } from '../../../Hooks/useDarkMode';
import AdditionalNotesSection from '../../../Components/Annex/AdditionalNotesSection';
import { HOT_TABLE_DARK_MODE_STYLES } from '../../../Utils/hotTableStyles';
import AcademicYearSelect from '../../../Components/Forms/AcademicYearSelect';
import FormSelector from '../../../Components/Forms/FormSelector';

registerAllModules();

const Create = ({ availableYears = [], existingBatches = {}, defaultYear, isEditing = false }) => {
  const currentAcademicYear = getAcademicYearFromUrl(defaultYear);
  const [selectedYear, setSelectedYear] = useState(currentAcademicYear);
  const [academicYear, setAcademicYear] = useState(currentAcademicYear);

  const existingBatch = existingBatches[selectedYear];
  const admissionServices = existingBatch?.admission_services || [];
  const admissionStatistics = existingBatch?.admission_statistics || [];
  const servicesRef = useRef(null);
  const statisticsRef = useRef(null);
  const isDark = useDarkMode();
  const [processing, setProcessing] = useState(false);
  const [requestNotes, setRequestNotes] = useState('');

  // Predefined service types for Annex H
  const PREDEFINED_SERVICES = [
    'General admission guidelines',
    'Admission guidelines including accepting persons with disabilities',
    'Admission guidelines accepting foreign students (if applicable)',
    'Drug testing',
    'Medical Certificate',
    'Online enrolment and payment system',
    'Entrance examination',
    'Assessment'
  ];

  const initialServices = admissionServices && admissionServices.length > 0
    ? admissionServices.map(s => ({
        service_type: s.service_type,
        with: s.with || false,
        supporting_documents: s.supporting_documents || '',
        remarks: s.remarks || ''
      }))
    : PREDEFINED_SERVICES.map(serviceType => ({
        service_type: serviceType,
        with: false,
        supporting_documents: '',
        remarks: ''
      }));

  const initialStatistics = admissionStatistics && admissionStatistics.length > 0
    ? admissionStatistics.map(s => ({
        program: s.program,
        applicants: s.applicants,
        admitted: s.admitted,
        enrolled: s.enrolled
      }))
    : [];

  const [servicesData, setServicesData] = useState(initialServices);
  const [statisticsData, setStatisticsData] = useState(initialStatistics);

  // Update table data when selected year changes
  useEffect(() => {
    const batch = existingBatches[selectedYear];
    const services = batch?.admission_services || [];
    const statistics = batch?.admission_statistics || [];

    if (services.length > 0) {
      setServicesData(services.map(s => ({
        service_type: s.service_type,
        with: s.with || false,
        supporting_documents: s.supporting_documents || '',
        remarks: s.remarks || ''
      })));
    } else {
      setServicesData(PREDEFINED_SERVICES.map(serviceType => ({
        service_type: serviceType,
        with: false,
        supporting_documents: '',
        remarks: ''
      })));
    }

    setStatisticsData(statistics.length > 0 ? statistics.map(s => ({
      program: s.program,
      applicants: s.applicants,
      admitted: s.admitted,
      enrolled: s.enrolled
    })) : []);
  }, [selectedYear, existingBatches]);

  const servicesColumns = [
    {
      data: 'service_type',
      title: 'Service Type',
      type: 'text',
      readOnly: true,
      width: 350,
      className: 'htLeft'
    },
    {
      data: 'with',
      title: 'With',
      type: 'checkbox',
      width: 80,
      className: 'htCenter'
    },
    {
      data: 'supporting_documents',
      title: 'Supporting Documents',
      type: 'text',
      width: 250,
      placeholder: 'Document details'
    },
    {
      data: 'remarks',
      title: 'Remarks',
      type: 'text',
      width: 250,
      placeholder: 'Additional notes'
    }
  ];

  const statisticsColumns = [
    { data: 'program', title: 'Program', type: 'text', width: 300, placeholder: 'Program name' },
    { data: 'applicants', title: 'Applicants', type: 'numeric', width: 120, placeholder: '0' },
    { data: 'admitted', title: 'Admitted', type: 'numeric', width: 120, placeholder: '0' },
    { data: 'enrolled', title: 'Enrolled', type: 'numeric', width: 120, placeholder: '0' },
    {
      data: 'actions',
      title: 'Actions',
      type: 'text',
      readOnly: true,
      width: 60,
      renderer: function(instance, td, row) {
        td.innerHTML = '<button class="delete-row-btn text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" data-row="' + row + '" data-table="statistics" title="Delete this row" style="padding:0;margin:0;border:none;background:none;cursor:pointer;line-height:1;display:flex;align-items:center;justify-content:center;width:100%;height:100%;"><svg style="width:16px;height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>';
        td.className = 'htCenter htMiddle';
        td.style.cssText = 'padding:0;vertical-align:middle;overflow:hidden;';
        return td;
      }
    }
  ];

  const handleAddRow = (tableType) => {
    const hot = tableType === 'services' ? servicesRef.current?.hotInstance : statisticsRef.current?.hotInstance;
    if (hot) hot.alter('insert_row_below', hot.countRows());
  };

  const handleRemoveRow = (tableType, rowIndex) => {
    if (confirm('Are you sure you want to delete this row?')) {
      const hot = tableType === 'services' ? servicesRef.current?.hotInstance : statisticsRef.current?.hotInstance;
      if (hot) hot.alter('remove_row', rowIndex);
    }
  };

  useEffect(() => {
    const handleClick = (e) => {
      const deleteBtn = e.target.closest('.delete-row-btn');
      if (deleteBtn) {
        const row = parseInt(deleteBtn.dataset.row);
        const table = deleteBtn.dataset.table;
        handleRemoveRow(table, row);
      }
    };

    const servicesElement = servicesRef.current?.hotInstance?.rootElement;
    const statisticsElement = statisticsRef.current?.hotInstance?.rootElement;

    if (servicesElement) servicesElement.addEventListener('click', handleClick);
    if (statisticsElement) statisticsElement.addEventListener('click', handleClick);

    return () => {
      if (servicesElement) servicesElement.removeEventListener('click', handleClick);
      if (statisticsElement) statisticsElement.removeEventListener('click', handleClick);
    };
  }, [servicesData, statisticsData]);

  const handleSubmit = () => {
    const servicesHot = servicesRef.current?.hotInstance;
    const statisticsHot = statisticsRef.current?.hotInstance;

    const servicesArray = [];
    const statisticsArray = [];

    if (servicesHot) {
      const tableData = servicesHot.getData();

      // Must have exactly 8 rows
      if (tableData.length !== 8) {
        alert('Error: Must have exactly 8 predefined service types.');
        return;
      }

      for (let i = 0; i < tableData.length; i++) {
        const row = tableData[i];
        const [serviceType, withChecked, supportingDocs, remarks] = row;

        servicesArray.push({
          service_type: serviceType,
          with: withChecked === true,
          supporting_documents: supportingDocs || null,
          remarks: remarks || null
        });
      }
    }

    if (statisticsHot) {
      const tableData = statisticsHot.getData();
      for (let i = 0; i < tableData.length; i++) {
        const row = tableData[i];
        const [program, applicants, admitted, enrolled] = row;
        if (program || applicants || admitted || enrolled) {
          if (!program || applicants === null || admitted === null || enrolled === null) {
            alert(`Statistics Row ${i + 1}: All fields are required`);
            return;
          }
          statisticsArray.push({
            program,
            applicants: parseInt(applicants) || 0,
            admitted: parseInt(admitted) || 0,
            enrolled: parseInt(enrolled) || 0
          });
        }
      }
    }

    setProcessing(true);

    router.post('/hei/annex-h', {
      academic_year: academicYear,
      admission_services: servicesArray,
      admission_statistics: statisticsArray,
      request_notes: requestNotes
    }, {
      onFinish: () => setProcessing(false)
    });
  };

  return (
    <HEILayout title="Submit Annex H">
      <style>{HOT_TABLE_DARK_MODE_STYLES}</style>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              ADMISSION SERVICES
            </h1>
            <span className="text-xl font-semibold text-gray-500 dark:text-gray-400">
              Annex H
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
                setSelectedYear(year);
              }}
              availableYears={availableYears}
              required
            />
            <FormSelector currentForm="H" />
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

        <div className="relative space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Admission Services/Requirements
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Check the box if your institution provides the service/requirement
              </p>
            </div>

            <div className="overflow-x-auto mb-4">
              <HotTable
                ref={servicesRef}
                data={servicesData}
                colHeaders={true}
                rowHeaders={true}
                columns={servicesColumns}
                height="auto"
                minRows={8}
                maxRows={8}
                licenseKey="non-commercial-and-evaluation"
                stretchH="all"
                autoWrapRow={true}
                autoWrapCol={true}
                manualColumnResize={true}
                contextMenu={false}
                className={isDark ? 'dark-table' : ''}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Admission Statistics
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Provide admission statistics per program
              </p>
            </div>

            <div className="overflow-x-auto mb-4">
              <HotTable
                ref={statisticsRef}
                data={statisticsData}
                colHeaders={true}
                rowHeaders={true}
                columns={statisticsColumns}
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
              onClick={() => handleAddRow('statistics')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <IoAddCircle className="text-lg" />
              Add Program Statistics
            </button>
          </div>

          <AdditionalNotesSection
            value={requestNotes}
            onChange={setRequestNotes}
          />

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.visit('/hei/annex-h/history')}
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

export default Create;
