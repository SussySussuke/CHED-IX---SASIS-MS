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

registerAllModules();

const Create = ({ availableYears = [], existingBatches = {}, defaultYear, isEditing = false }) => {
  const currentYear = new Date().getFullYear();
  const currentAcademicYear = defaultYear || `${currentYear}-${currentYear + 1}`;
  const [selectedYear, setSelectedYear] = useState(currentAcademicYear);
  const [academicYear, setAcademicYear] = useState(currentAcademicYear);

  const existingBatch = existingBatches[selectedYear];
  const editorialBoards = existingBatch?.editorialBoards || [];
  const otherPublications = existingBatch?.otherPublications || [];
  const programs = existingBatch?.programs || [];
  const editorialBoardRef = useRef(null);
  const otherPublicationsRef = useRef(null);
  const programsRef = useRef(null);
  const isDark = useDarkMode();
  const [processing, setProcessing] = useState(false);
  const [requestNotes, setRequestNotes] = useState('');

  // Form fields - data is stored directly on the batch for Annex G
  const [officialSchoolName, setOfficialSchoolName] = useState(existingBatch?.official_school_name || '');
  const [studentPublicationName, setStudentPublicationName] = useState(existingBatch?.student_publication_name || '');
  const [publicationFee, setPublicationFee] = useState(existingBatch?.publication_fee_per_student || '');

  // Frequency checkboxes
  const [freqMonthly, setFreqMonthly] = useState(existingBatch?.frequency_monthly || false);
  const [freqQuarterly, setFreqQuarterly] = useState(existingBatch?.frequency_quarterly || false);
  const [freqAnnual, setFreqAnnual] = useState(existingBatch?.frequency_annual || false);
  const [freqPerSemester, setFreqPerSemester] = useState(existingBatch?.frequency_per_semester || false);
  const [freqOthers, setFreqOthers] = useState(existingBatch?.frequency_others || false);
  const [freqOthersSpecify, setFreqOthersSpecify] = useState(existingBatch?.frequency_others_specify || '');

  // Publication type checkboxes
  const [pubTypeNewsletter, setPubTypeNewsletter] = useState(existingBatch?.publication_type_newsletter || false);
  const [pubTypeGazette, setPubTypeGazette] = useState(existingBatch?.publication_type_gazette || false);
  const [pubTypeMagazine, setPubTypeMagazine] = useState(existingBatch?.publication_type_magazine || false);
  const [pubTypeOthers, setPubTypeOthers] = useState(existingBatch?.publication_type_others || false);
  const [pubTypeOthersSpecify, setPubTypeOthersSpecify] = useState(existingBatch?.publication_type_others_specify || '');

  const [adviserName, setAdviserName] = useState(existingBatch?.adviser_name || '');
  const [adviserPosition, setAdviserPosition] = useState(existingBatch?.adviser_position_designation || '');

  // Initialize table data
  const initialEditorialBoards = editorialBoards && editorialBoards.length > 0
    ? editorialBoards.map(b => ({
        name: b.name,
        position_in_editorial_board: b.position_in_editorial_board,
        degree_program_year_level: b.degree_program_year_level
      }))
    : [];

  const initialOtherPublications = otherPublications && otherPublications.length > 0
    ? otherPublications.map(p => ({
        name_of_publication: p.name_of_publication,
        department_unit_in_charge: p.department_unit_in_charge,
        type_of_publication: p.type_of_publication
      }))
    : [];

  const initialPrograms = programs && programs.length > 0
    ? programs.map(p => ({
        title_of_program: p.title_of_program,
        implementation_date: p.implementation_date ? p.implementation_date.split('T')[0] : '',
        implementation_venue: p.implementation_venue,
        target_group_of_participants: p.target_group_of_participants
      }))
    : [];

  const [editorialBoardData, setEditorialBoardData] = useState(initialEditorialBoards);
  const [otherPublicationsData, setOtherPublicationsData] = useState(initialOtherPublications);
  const [programsData, setProgramsData] = useState(initialPrograms);

  // Update form fields when selected year changes
  useEffect(() => {
    const batch = existingBatches[selectedYear];
    const boards = batch?.editorialBoards || [];
    const pubs = batch?.otherPublications || [];
    const progs = batch?.programs || [];

    // For Annex G, form data is stored directly on the batch object, not in a formData property
    setOfficialSchoolName(batch?.official_school_name || '');
    setStudentPublicationName(batch?.student_publication_name || '');
    setPublicationFee(batch?.publication_fee_per_student || '');
    setFreqMonthly(batch?.frequency_monthly || false);
    setFreqQuarterly(batch?.frequency_quarterly || false);
    setFreqAnnual(batch?.frequency_annual || false);
    setFreqPerSemester(batch?.frequency_per_semester || false);
    setFreqOthers(batch?.frequency_others || false);
    setFreqOthersSpecify(batch?.frequency_others_specify || '');
    setPubTypeNewsletter(batch?.publication_type_newsletter || false);
    setPubTypeGazette(batch?.publication_type_gazette || false);
    setPubTypeMagazine(batch?.publication_type_magazine || false);
    setPubTypeOthers(batch?.publication_type_others || false);
    setPubTypeOthersSpecify(batch?.publication_type_others_specify || '');
    setAdviserName(batch?.adviser_name || '');
    setAdviserPosition(batch?.adviser_position_designation || '');

    setEditorialBoardData(boards.length > 0 ? boards.map(b => ({
      name: b.name,
      position_in_editorial_board: b.position_in_editorial_board,
      degree_program_year_level: b.degree_program_year_level
    })) : []);

    setOtherPublicationsData(pubs.length > 0 ? pubs.map(p => ({
      name_of_publication: p.name_of_publication,
      department_unit_in_charge: p.department_unit_in_charge,
      type_of_publication: p.type_of_publication
    })) : []);

    setProgramsData(progs.length > 0 ? progs.map(p => ({
      title_of_program: p.title_of_program,
      implementation_date: p.implementation_date ? p.implementation_date.split('T')[0] : '',
      implementation_venue: p.implementation_venue,
      target_group_of_participants: p.target_group_of_participants
    })) : []);
  }, [selectedYear, existingBatches]);

  const editorialBoardColumns = [
    {
      data: 'name',
      title: 'Name',
      type: 'text',
      width: 200,
      placeholder: 'Full name'
    },
    {
      data: 'position_in_editorial_board',
      title: 'Position in Editorial Board',
      type: 'text',
      width: 200,
      placeholder: 'Position'
    },
    {
      data: 'degree_program_year_level',
      title: 'Degree Program and Year Level',
      type: 'text',
      width: 250,
      placeholder: 'e.g., BS Computer Science - 3rd Year'
    },
    {
      data: 'actions',
      title: 'Actions',
      type: 'text',
      readOnly: true,
      width: 60,
      renderer: function(instance, td, row) {
        td.innerHTML = '<button class="delete-row-btn text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" data-row="' + row + '" data-table="editorial" title="Delete this row" style="padding:0;margin:0;border:none;background:none;cursor:pointer;line-height:1;display:flex;align-items:center;justify-content:center;width:100%;height:100%;"><svg style="width:16px;height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>';
        td.className = 'htCenter htMiddle';
        td.style.cssText = 'padding:0;vertical-align:middle;overflow:hidden;';
        return td;
      }
    }
  ];

  const otherPublicationsColumns = [
    {
      data: 'name_of_publication',
      title: 'Name of Publication',
      type: 'text',
      width: 200,
      placeholder: 'Publication name'
    },
    {
      data: 'department_unit_in_charge',
      title: 'Department/Unit in Charge',
      type: 'text',
      width: 200,
      placeholder: 'Department/Unit'
    },
    {
      data: 'type_of_publication',
      title: 'Type of Publication',
      type: 'text',
      width: 150,
      placeholder: 'Type'
    },
    {
      data: 'actions',
      title: 'Actions',
      type: 'text',
      readOnly: true,
      width: 60,
      renderer: function(instance, td, row) {
        td.innerHTML = '<button class="delete-row-btn text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" data-row="' + row + '" data-table="publications" title="Delete this row" style="padding:0;margin:0;border:none;background:none;cursor:pointer;line-height:1;display:flex;align-items:center;justify-content:center;width:100%;height:100%;"><svg style="width:16px;height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>';
        td.className = 'htCenter htMiddle';
        td.style.cssText = 'padding:0;vertical-align:middle;overflow:hidden;';
        return td;
      }
    }
  ];

  const programsColumns = [
    {
      data: 'title_of_program',
      title: 'Title of Program',
      type: 'text',
      width: 250,
      placeholder: 'Program title'
    },
    {
      data: 'implementation_date',
      title: 'Implementation Date',
      type: 'date',
      dateFormat: 'YYYY-MM-DD',
      correctFormat: true,
      width: 150,
      placeholder: 'YYYY-MM-DD'
    },
    {
      data: 'implementation_venue',
      title: 'Implementation Venue',
      type: 'text',
      width: 200,
      placeholder: 'Venue'
    },
    {
      data: 'target_group_of_participants',
      title: 'Target Group of Participants',
      type: 'text',
      width: 200,
      placeholder: 'Target group'
    },
    {
      data: 'actions',
      title: 'Actions',
      type: 'text',
      readOnly: true,
      width: 60,
      renderer: function(instance, td, row) {
        td.innerHTML = '<button class="delete-row-btn text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" data-row="' + row + '" data-table="programs" title="Delete this row" style="padding:0;margin:0;border:none;background:none;cursor:pointer;line-height:1;display:flex;align-items:center;justify-content:center;width:100%;height:100%;"><svg style="width:16px;height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>';
        td.className = 'htCenter htMiddle';
        td.style.cssText = 'padding:0;vertical-align:middle;overflow:hidden;';
        return td;
      }
    }
  ];

  const handleAddRow = (tableType) => {
    let hot;
    if (tableType === 'editorial') hot = editorialBoardRef.current?.hotInstance;
    else if (tableType === 'publications') hot = otherPublicationsRef.current?.hotInstance;
    else if (tableType === 'programs') hot = programsRef.current?.hotInstance;

    if (hot) {
      hot.alter('insert_row_below', hot.countRows());
    }
  };

  const handleRemoveRow = (tableType, rowIndex) => {
    if (confirm('Are you sure you want to delete this row?')) {
      let hot;
      if (tableType === 'editorial') hot = editorialBoardRef.current?.hotInstance;
      else if (tableType === 'publications') hot = otherPublicationsRef.current?.hotInstance;
      else if (tableType === 'programs') hot = programsRef.current?.hotInstance;

      if (hot) {
        hot.alter('remove_row', rowIndex);
      }
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

    const editorialElement = editorialBoardRef.current?.hotInstance?.rootElement;
    const publicationsElement = otherPublicationsRef.current?.hotInstance?.rootElement;
    const programsElement = programsRef.current?.hotInstance?.rootElement;

    if (editorialElement) editorialElement.addEventListener('click', handleClick);
    if (publicationsElement) publicationsElement.addEventListener('click', handleClick);
    if (programsElement) programsElement.addEventListener('click', handleClick);

    return () => {
      if (editorialElement) editorialElement.removeEventListener('click', handleClick);
      if (publicationsElement) publicationsElement.removeEventListener('click', handleClick);
      if (programsElement) programsElement.removeEventListener('click', handleClick);
    };
  }, [editorialBoardData, otherPublicationsData, programsData]);

  const handleSubmit = () => {
    const editorialHot = editorialBoardRef.current?.hotInstance;
    const publicationsHot = otherPublicationsRef.current?.hotInstance;
    const programsHot = programsRef.current?.hotInstance;

    const editorialBoardsArray = [];
    const otherPublicationsArray = [];
    const programsArray = [];

    // Process editorial boards
    if (editorialHot) {
      const tableData = editorialHot.getData();
      for (let i = 0; i < tableData.length; i++) {
        const row = tableData[i];
        const [name, position, degreeProgram] = row;
        if (name || position || degreeProgram) {
          if (!name || !position || !degreeProgram) {
            alert(`Editorial Board Row ${i + 1}: Please fill in all fields`);
            return;
          }
          editorialBoardsArray.push({
            name,
            position_in_editorial_board: position,
            degree_program_year_level: degreeProgram
          });
        }
      }
    }

    // Process other publications
    if (publicationsHot) {
      const tableData = publicationsHot.getData();
      for (let i = 0; i < tableData.length; i++) {
        const row = tableData[i];
        const [name, department, type] = row;
        if (name || department || type) {
          if (!name || !department || !type) {
            alert(`Other Publications Row ${i + 1}: Please fill in all fields`);
            return;
          }
          otherPublicationsArray.push({
            name_of_publication: name,
            department_unit_in_charge: department,
            type_of_publication: type
          });
        }
      }
    }

    // Process programs
    if (programsHot) {
      const tableData = programsHot.getData();
      for (let i = 0; i < tableData.length; i++) {
        const row = tableData[i];
        const [title, date, venue, targetGroup] = row;
        if (title || date || venue || targetGroup) {
          if (!title || !date || !venue || !targetGroup) {
            alert(`Programs Row ${i + 1}: Please fill in all fields`);
            return;
          }
          programsArray.push({
            title_of_program: title,
            implementation_date: date,
            implementation_venue: venue,
            target_group_of_participants: targetGroup
          });
        }
      }
    }

    setProcessing(true);

    router.post('/hei/annex-g', {
      academic_year: academicYear,
      official_school_name: officialSchoolName,
      student_publication_name: studentPublicationName,
      publication_fee_per_student: publicationFee,
      frequency_monthly: freqMonthly,
      frequency_quarterly: freqQuarterly,
      frequency_annual: freqAnnual,
      frequency_per_semester: freqPerSemester,
      frequency_others: freqOthers,
      frequency_others_specify: freqOthersSpecify,
      publication_type_newsletter: pubTypeNewsletter,
      publication_type_gazette: pubTypeGazette,
      publication_type_magazine: pubTypeMagazine,
      publication_type_others: pubTypeOthers,
      publication_type_others_specify: pubTypeOthersSpecify,
      adviser_name: adviserName,
      adviser_position_designation: adviserPosition,
      editorial_boards: editorialBoardsArray,
      other_publications: otherPublicationsArray,
      programs: programsArray,
      request_notes: requestNotes
    }, {
      onFinish: () => setProcessing(false)
    });
  };

  return (
    <HEILayout title="Submit Annex G">
      <style>{HOT_TABLE_DARK_MODE_STYLES}</style>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              CAMPUS JOURNALISM ACT (RA 7079)
            </h1>
            <span className="text-xl font-semibold text-gray-500 dark:text-gray-400">
              Annex G
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

        <div className="relative space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Official School Name
                  </label>
                  <input
                    type="text"
                    value={officialSchoolName}
                    onChange={(e) => setOfficialSchoolName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter official school name"
                    maxLength={255}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Student Publication Name
                  </label>
                  <input
                    type="text"
                    value={studentPublicationName}
                    onChange={(e) => setStudentPublicationName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter publication name"
                    maxLength={255}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Publication Fee per Student
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={publicationFee}
                    onChange={(e) => setPublicationFee(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Frequency of Publication
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={freqMonthly}
                      onChange={(e) => setFreqMonthly(e.target.checked)}
                      className="mr-2 rounded"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Monthly</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={freqQuarterly}
                      onChange={(e) => setFreqQuarterly(e.target.checked)}
                      className="mr-2 rounded"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Quarterly</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={freqAnnual}
                      onChange={(e) => setFreqAnnual(e.target.checked)}
                      className="mr-2 rounded"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Annual</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={freqPerSemester}
                      onChange={(e) => setFreqPerSemester(e.target.checked)}
                      className="mr-2 rounded"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Per Semester</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={freqOthers}
                      onChange={(e) => setFreqOthers(e.target.checked)}
                      className="mr-2 rounded"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Others (please specify)</span>
                  </label>
                  {freqOthers && (
                    <input
                      type="text"
                      value={freqOthersSpecify}
                      onChange={(e) => setFreqOthersSpecify(e.target.value)}
                      className="ml-6 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Specify frequency"
                      maxLength={255}
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type of Publication
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={pubTypeNewsletter}
                      onChange={(e) => setPubTypeNewsletter(e.target.checked)}
                      className="mr-2 rounded"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Newsletter</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={pubTypeGazette}
                      onChange={(e) => setPubTypeGazette(e.target.checked)}
                      className="mr-2 rounded"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Gazette</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={pubTypeMagazine}
                      onChange={(e) => setPubTypeMagazine(e.target.checked)}
                      className="mr-2 rounded"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Magazine</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={pubTypeOthers}
                      onChange={(e) => setPubTypeOthers(e.target.checked)}
                      className="mr-2 rounded"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Others (please specify)</span>
                  </label>
                  {pubTypeOthers && (
                    <input
                      type="text"
                      value={pubTypeOthersSpecify}
                      onChange={(e) => setPubTypeOthersSpecify(e.target.value)}
                      className="ml-6 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Specify type"
                      maxLength={255}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Adviser Name
                  </label>
                  <input
                    type="text"
                    value={adviserName}
                    onChange={(e) => setAdviserName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter adviser name"
                    maxLength={255}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Adviser Position/Designation
                  </label>
                  <input
                    type="text"
                    value={adviserPosition}
                    onChange={(e) => setAdviserPosition(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter position/designation"
                    maxLength={255}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Editorial Board Members
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Add members of the editorial board
            </p>
          </div>

          <div className="overflow-x-auto mb-4">
            <HotTable
              ref={editorialBoardRef}
              data={editorialBoardData}
              colHeaders={true}
              rowHeaders={true}
              columns={editorialBoardColumns}
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
            onClick={() => handleAddRow('editorial')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <IoAddCircle className="text-lg" />
            Add Editorial Board Member
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Other Publications
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              List other publications in the institution
            </p>
          </div>

          <div className="overflow-x-auto mb-4">
            <HotTable
              ref={otherPublicationsRef}
              data={otherPublicationsData}
              colHeaders={true}
              rowHeaders={true}
              columns={otherPublicationsColumns}
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
            onClick={() => handleAddRow('publications')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <IoAddCircle className="text-lg" />
            Add Publication
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Training Programs
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              List training programs and seminars conducted
            </p>
          </div>

          <div className="overflow-x-auto mb-4">
            <HotTable
              ref={programsRef}
              data={programsData}
              colHeaders={true}
              rowHeaders={true}
              columns={programsColumns}
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
            onClick={() => handleAddRow('programs')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <IoAddCircle className="text-lg" />
            Add Program
          </button>
        </div>

        <AdditionalNotesSection
          value={requestNotes}
          onChange={setRequestNotes}
        />

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.visit('/hei/annex-g/history')}
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
            {processing ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </HEILayout>
  );
};

export default Create;