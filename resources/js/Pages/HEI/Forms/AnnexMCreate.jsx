import React, { useState, useEffect } from 'react';
import HEILayout from '../../../Layouts/HEILayout';
import { router } from '@inertiajs/react';
import InfoBox from '../../../Components/Widgets/InfoBox';
import { CURRENT_YEAR } from '../../../Utils/constants';
import { getSubmissionStatusMessage } from '../../../Utils/submissionStatus';
import { getAcademicYearFromUrl } from '../../../Utils/urlHelpers';
import { IoAddCircle, IoSave, IoTrash } from 'react-icons/io5';
import AdditionalNotesSection from '../../../Components/Annex/AdditionalNotesSection';
import AcademicYearSelect from '../../../Components/Forms/AcademicYearSelect';
import FormSelector from '../../../Components/Forms/FormSelector';
import { buildFormOptionsGrouped } from '../../../Config/formConfig';
import { getFormRoute } from '../../../Config/nonAnnexForms';


const SECTIONS = [
  'A. Persons with Disabilities',
  'B. Indigenous People',
  'C. Dependents of Solo Parents / Solo Parents',
  'D. Other students with special needs',
];

const CATEGORY_A_SUBCATEGORIES = [
  'Psychosocial',
  'Disability due to chronic illness',
  'Learning',
  'Visual / Hearing',
  'Orthopedic',
  'Communication',
  'Medical',
];

const CATEGORY_C_SUBCATEGORIES = [
  'Living with Mother/Father only',
  'Young Parent',
];

const Create = ({ availableYears = [], existingBatches = {}, defaultYear, isEditing = false }) => {
  const currentAcademicYear = getAcademicYearFromUrl(defaultYear);
  const formOptions = buildFormOptionsGrouped();
  const [selectedYear, setSelectedYear] = useState(currentAcademicYear);
  const [academicYear, setAcademicYear] = useState(currentAcademicYear);

  const existingBatch = existingBatches[selectedYear];
  const statistics = existingBatch?.statistics || [];
  const services = existingBatch?.services || {};
  const academicYears = availableYears;

  const [processing, setProcessing] = useState(false);
  const [requestNotes, setRequestNotes] = useState('');
  const [statisticsData, setStatisticsData] = useState([]);
  const [servicesData, setServicesData] = useState({});

  // Current year is the selected AY (only this is editable).
  // Previous two years are derived from prior submitted batches — read-only.
  const getCurrentYear = (baseYear) => baseYear;
  const getPreviousYears = (baseYear) => {
    const startYear = parseInt(baseYear.split('-')[0]);
    return [
      `${startYear - 2}-${startYear - 1}`,
      `${startYear - 1}-${startYear}`,
    ];
  };
  const getAllYears = (baseYear) => [
    ...getPreviousYears(baseYear),
    getCurrentYear(baseYear),
  ];

  const [years, setYears] = useState(getAllYears(selectedYear));

  // Update years when selected year changes
  useEffect(() => {
    setYears(getAllYears(selectedYear));
  }, [selectedYear]);

  // Build a map of year → statistics rows from existing batches (for read-only prior years)
  const getPriorYearData = (baseYear) => {
    const priorYears = getPreviousYears(baseYear);
    const result = {};
    priorYears.forEach(yr => {
      const batch = existingBatches[yr];
      const stats = batch?.statistics || [];
      result[yr] = stats;
    });
    return result;
  };

  // Merge DB rows with the full fixed structure so all 4 categories always render.
  // DB may only have subtotal rows for B (or nothing for D) after a save where those
  // categories had no user-added rows — this ensures the category headers + add buttons
  // are always visible even when the DB returned an incomplete set.
  const mergeStatisticsWithStructure = (dbRows) => {
    const merged = [];
    const emptyYearData = { [selectedYear]: { enrollment: 0, graduates: 0 } };
    let order = 0;

    // Category A — fixed subcategories
    CATEGORY_A_SUBCATEGORIES.forEach(sub => {
      const existing = dbRows.find(r => r.category === 'A. Persons with Disabilities' && r.subcategory === sub && !r.is_subtotal);
      merged.push(existing
        ? { ...existing, display_order: order++ }
        : { category: 'A. Persons with Disabilities', subcategory: sub, year_data: { ...emptyYearData }, is_subtotal: false, display_order: order++ }
      );
    });
    const aSubtotal = dbRows.find(r => r.category === 'A. Persons with Disabilities' && r.is_subtotal);
    merged.push(aSubtotal ? { ...aSubtotal, display_order: order++ } : { category: 'A. Persons with Disabilities', subcategory: 'Sub-Total', year_data: { ...emptyYearData }, is_subtotal: true, display_order: order++ });

    // Category B — user-addable; preserve any DB rows the user had added
    const bUserRows = dbRows.filter(r => r.category === 'B. Indigenous People' && !r.is_subtotal);
    bUserRows.forEach(r => merged.push({ ...r, display_order: order++ }));
    const bSubtotal = dbRows.find(r => r.category === 'B. Indigenous People' && r.is_subtotal);
    merged.push(bSubtotal ? { ...bSubtotal, display_order: order++ } : { category: 'B. Indigenous People', subcategory: 'Sub-Total', year_data: { ...emptyYearData }, is_subtotal: true, display_order: order++ });

    // Category C — fixed subcategories
    CATEGORY_C_SUBCATEGORIES.forEach(sub => {
      const existing = dbRows.find(r => r.category === 'C. Dependents of Solo Parents / Solo Parents' && r.subcategory === sub && !r.is_subtotal);
      merged.push(existing
        ? { ...existing, display_order: order++ }
        : { category: 'C. Dependents of Solo Parents / Solo Parents', subcategory: sub, year_data: { ...emptyYearData }, is_subtotal: false, display_order: order++ }
      );
    });
    const cSubtotal = dbRows.find(r => r.category === 'C. Dependents of Solo Parents / Solo Parents' && r.is_subtotal);
    merged.push(cSubtotal ? { ...cSubtotal, display_order: order++ } : { category: 'C. Dependents of Solo Parents / Solo Parents', subcategory: 'Sub-Total', year_data: { ...emptyYearData }, is_subtotal: true, display_order: order++ });

    // Category D — user-addable with Sub-Total. Preserve any DB rows the user added.
    const dUserRows = dbRows.filter(r => r.category === 'D. Other students with special needs' && !r.is_subtotal);
    dUserRows.forEach(r => merged.push({ ...r, display_order: order++ }));
    const dSubtotal = dbRows.find(r => r.category === 'D. Other students with special needs' && r.is_subtotal);
    merged.push(dSubtotal ? { ...dSubtotal, display_order: order++ } : { category: 'D. Other students with special needs', subcategory: 'Sub-Total', year_data: { ...emptyYearData }, is_subtotal: true, display_order: order++ });

    // TOTAL row
    const totalRow = dbRows.find(r => r.category === 'TOTAL');
    merged.push(totalRow ? { ...totalRow, display_order: 999 } : { category: 'TOTAL', subcategory: null, year_data: { ...emptyYearData }, is_subtotal: true, display_order: 999 });

    return recalculateStatistics(merged);
  };

  useEffect(() => {
    if (statistics && statistics.length > 0) {
      setStatisticsData(mergeStatisticsWithStructure(statistics));
    } else {
      initializeStatistics();
    }
  }, [selectedYear]); // Only re-initialize when year changes

  useEffect(() => {
    if (services && services.length > 0) {
      const grouped = {};
      SECTIONS.forEach(section => {
        grouped[section] = services.filter(s => s.section === section);
      });
      setServicesData(grouped);
    } else {
      const grouped = {};
      SECTIONS.forEach(section => {
        grouped[section] = [];
      });
      setServicesData(grouped);
    }
  }, [selectedYear]); // Only re-initialize when year changes

  const initializeStatistics = () => {
    const rows = [];
    let displayOrder = 0;

    // Only current year gets an editable slot — prior years are read-only overlays from prior batches
    const emptyYearData = { [selectedYear]: { enrollment: 0, graduates: 0 } };

    // Category A: Persons with Disabilities (FIXED)
    CATEGORY_A_SUBCATEGORIES.forEach(subcategory => {
      rows.push({
        category: 'A. Persons with Disabilities',
        subcategory,
        year_data: { ...emptyYearData },
        is_subtotal: false,
        display_order: displayOrder++,
      });
    });
    rows.push(createSubtotalRow('A. Persons with Disabilities', displayOrder++));

    // Category B: Indigenous People (USER-ADDABLE)
    rows.push(createSubtotalRow('B. Indigenous People', displayOrder++));

    // Category C: Dependents of Solo Parents (FIXED)
    CATEGORY_C_SUBCATEGORIES.forEach(subcategory => {
      rows.push({
        category: 'C. Dependents of Solo Parents / Solo Parents',
        subcategory,
        year_data: { ...emptyYearData },
        is_subtotal: false,
        display_order: displayOrder++,
      });
    });
    rows.push(createSubtotalRow('C. Dependents of Solo Parents / Solo Parents', displayOrder++));

    // Category D: Other students (USER-ADDABLE, with Sub-Total)
    rows.push(createSubtotalRow('D. Other students with special needs', displayOrder++));

    // TOTAL row
    rows.push({
      category: 'TOTAL',
      subcategory: null,
      year_data: { ...emptyYearData },
      is_subtotal: true,
      display_order: 999,
    });

    setStatisticsData(rows);
  };

  const createSubtotalRow = (category, order) => {
    return {
      category,
      subcategory: 'Sub-Total',
      year_data: { [selectedYear]: { enrollment: 0, graduates: 0 } },
      is_subtotal: true,
      display_order: order,
    };
  };

  // Look up a value from a prior year's batch statistics for a given subcategory.
  // Returns 0 if no prior batch exists for that year.
  const getPriorValue = (priorYearData, year, category, subcategory, field) => {
    const rows = priorYearData[year] || [];
    const match = rows.find(r => r.category === category && r.subcategory === subcategory);
    return match?.year_data?.[year]?.[field] ?? 0;
  };

  const recalculateStatistics = (updatedData) => {
    const newData = [...updatedData];
    // Only the current year lives in year_data on each row — recalculate subtotals for it only.
    const yr = selectedYear;

    ['A. Persons with Disabilities', 'B. Indigenous People', 'C. Dependents of Solo Parents / Solo Parents', 'D. Other students with special needs'].forEach(category => {
      const subtotalIndex = newData.findIndex(row => row.category === category && row.is_subtotal);
      if (subtotalIndex !== -1) {
        const categoryRows = newData.filter(row => row.category === category && !row.is_subtotal);
        newData[subtotalIndex] = {
          ...newData[subtotalIndex],
          year_data: {
            [yr]: {
              enrollment: categoryRows.reduce((s, r) => s + (parseInt(r.year_data?.[yr]?.enrollment) || 0), 0),
              graduates:  categoryRows.reduce((s, r) => s + (parseInt(r.year_data?.[yr]?.graduates)  || 0), 0),
            },
          },
        };
      }
    });

    const totalIndex = newData.findIndex(row => row.category === 'TOTAL');
    if (totalIndex !== -1) {
      const subtotalRows = newData.filter(row => row.is_subtotal && row.category !== 'TOTAL');
      newData[totalIndex] = {
        ...newData[totalIndex],
        year_data: {
          [yr]: {
            enrollment: subtotalRows.reduce((s, r) => s + (parseInt(r.year_data?.[yr]?.enrollment) || 0), 0),
            graduates:  subtotalRows.reduce((s, r) => s + (parseInt(r.year_data?.[yr]?.graduates)  || 0), 0),
          },
        },
      };
    }

    return newData;
  };

  const handleStatisticChange = (index, field, value) => {
    const newData = [...statisticsData];
    newData[index] = { ...newData[index], [field]: value };
    setStatisticsData(recalculateStatistics(newData));
  };

  const handleAddSubcategory = (category) => {
    let newData = [...statisticsData];

    // Both B and D: insert before their Sub-Total row
    const insertIndex = newData.findIndex(row => row.category === category && row.is_subtotal);
    const newRow = {
      category,
      subcategory: '',
      year_data: { [selectedYear]: { enrollment: 0, graduates: 0 } },
      is_subtotal: false,
      display_order: insertIndex,
    };
    newData.splice(insertIndex, 0, newRow);

    newData.forEach((row, idx) => { row.display_order = idx; });
    setStatisticsData(recalculateStatistics(newData));
  };

  const handleRemoveSubcategory = (index) => {
    if (confirm('Are you sure you want to remove this subcategory?')) {
      const newData = statisticsData.filter((_, idx) => idx !== index);
      newData.forEach((row, idx) => { row.display_order = idx; });
      setStatisticsData(recalculateStatistics(newData));
    }
  };

  const handleAddService = (section) => {
    setServicesData({
      ...servicesData,
      [section]: [
        ...(servicesData[section] || []),
        {
          section,
          category: '',
          institutional_services_programs_activities: '',
          number_of_beneficiaries_participants: 0,
          remarks: '',
          display_order: (servicesData[section] || []).length,
        },
      ],
    });
  };

  const handleRemoveService = (section, index) => {
    if (confirm('Are you sure you want to remove this service?')) {
      const newServices = servicesData[section].filter((_, idx) => idx !== index);
      newServices.forEach((service, idx) => {
        service.display_order = idx;
      });
      setServicesData({
        ...servicesData,
        [section]: newServices,
      });
    }
  };

  const handleServiceChange = (section, index, field, value) => {
    const newServices = [...servicesData[section]];
    newServices[index] = { ...newServices[index], [field]: value };
    setServicesData({
      ...servicesData,
      [section]: newServices,
    });
  };

  const handleSubmit = () => {
    // Validate statistics
    for (let i = 0; i < statisticsData.length; i++) {
      const row = statisticsData[i];
      if (!row.is_subtotal && row.category !== 'TOTAL') {
        if (!row.subcategory || row.subcategory.trim() === '') {
          alert(`Statistics Row ${i + 1}: Subcategory is required`);
          return;
        }
      }
    }

    // Validate services
    for (const section of SECTIONS) {
      const sectionServices = servicesData[section] || [];
      for (let i = 0; i < sectionServices.length; i++) {
        const service = sectionServices[i];
        if (!service.institutional_services_programs_activities || service.institutional_services_programs_activities.trim() === '') {
          alert(`${section} - Service Row ${i + 1}: Institutional Services/Programs/Activities is required`);
          return;
        }
        if (service.number_of_beneficiaries_participants === null || service.number_of_beneficiaries_participants === '') {
          alert(`${section} - Service Row ${i + 1}: Number of Beneficiaries/Participants is required`);
          return;
        }
      }
    }

    // Flatten services
    const allServices = [];
    SECTIONS.forEach(section => {
      if (servicesData[section]) {
        allServices.push(...servicesData[section]);
      }
    });

    setProcessing(true);
    router.post('/hei/annex-m', {
      academic_year: academicYear,
      statistics: statisticsData,
      services: allServices,
      request_notes: requestNotes
    }, {
      onFinish: () => setProcessing(false)
    });
  };

  // Totals now only cover the current year (prior years are read-only, not summed here)
  const getTotalEnrollment = (row) => parseInt(row.year_data?.[selectedYear]?.enrollment) || 0;
  const getTotalGraduates = (row)  => parseInt(row.year_data?.[selectedYear]?.graduates)  || 0;

  const canAddSubcategory = (category) => {
    return category === 'B. Indigenous People' || category === 'D. Other students with special needs';
  };

  const canRemoveSubcategory = (row) => {
    if (row.is_subtotal || row.category === 'TOTAL') return false;
    return canAddSubcategory(row.category);
  };

  const renderStatisticsTable = () => {
    const priorYears = getPreviousYears(selectedYear);
    const priorYearData = getPriorYearData(selectedYear);
    let currentCategory = null;
    let categoryRowCount = 0;
    const categoryStartIndices = {};

    statisticsData.forEach((row, index) => {
      if (row.category !== currentCategory) {
        if (currentCategory !== null) {
          categoryStartIndices[currentCategory] = { start: index - categoryRowCount, count: categoryRowCount };
        }
        currentCategory = row.category;
        categoryRowCount = 1;
      } else {
        categoryRowCount++;
      }
    });
    if (currentCategory !== null) {
      categoryStartIndices[currentCategory] = { start: statisticsData.length - categoryRowCount, count: categoryRowCount };
    }

    const thBase = 'px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-b border-gray-200 dark:border-gray-600';
    const tdRO   = 'px-2 py-2 text-sm text-center border-r border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 italic';

    return (
      <div className="overflow-x-auto">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 italic">
          Prior years (grayed) are auto-filled from previously submitted data and cannot be edited.
          Only <strong>AY {selectedYear}</strong> is editable.
        </p>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th rowSpan="2" className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-b border-gray-200 dark:border-gray-600">Category</th>
              <th rowSpan="2" className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-b border-gray-200 dark:border-gray-600">Subcategory</th>
              {/* Prior years — read-only, grayed */}
              {priorYears.map(year => (
                <th key={year} colSpan="2" className={`${thBase} opacity-60`}>AY {year} (view only)</th>
              ))}
              {/* Current year — editable */}
              <th colSpan="2" className={`${thBase} bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300`}>AY {selectedYear} (current)</th>
              <th rowSpan="2" className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Actions</th>
            </tr>
            <tr>
              {priorYears.map(year => (
                <React.Fragment key={year}>
                  <th className={`${thBase} opacity-60 font-normal`}>Enroll</th>
                  <th className={`${thBase} opacity-60 font-normal`}>Grad</th>
                </React.Fragment>
              ))}
              <th className={`${thBase} bg-green-50 dark:bg-green-900/20`}>Enroll</th>
              <th className={`${thBase} bg-green-50 dark:bg-green-900/20`}>Grad</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {statisticsData.map((row, index) => {
              const isFirstInCategory = index === 0 || statisticsData[index - 1].category !== row.category;
              const categoryInfo = categoryStartIndices[row.category];
              const rowspan = isFirstInCategory ? categoryInfo?.count ?? 1 : 0;
              const isReadOnly = row.is_subtotal || row.category === 'TOTAL';
              const bgClass = isReadOnly ? 'bg-gray-100 dark:bg-gray-700 font-semibold' : 'bg-white dark:bg-gray-800';

              return (
                <tr key={index} className={`${bgClass} hover:bg-gray-50 dark:hover:bg-gray-750`}>
                  {isFirstInCategory && (
                    <td rowSpan={rowspan} className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-600 align-top">
                      {row.category}
                      {canAddSubcategory(row.category) && (
                        <button type="button" onClick={() => handleAddSubcategory(row.category)}
                          className="ml-2 text-green-600 hover:text-green-800 dark:text-green-400" title="Add subcategory">
                          <IoAddCircle className="inline text-lg" />
                        </button>
                      )}
                    </td>
                  )}
                  <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600">
                    {isReadOnly ? (
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{row.subcategory || 'TOTAL'}</span>
                    ) : (
                      <input type="text" value={row.subcategory || ''}
                        onChange={(e) => handleStatisticChange(index, 'subcategory', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Enter subcategory" readOnly={!canAddSubcategory(row.category)} />
                    )}
                  </td>

                  {/* Prior years — read-only, pull from prior batch data */}
                  {priorYears.map(year => (
                    <React.Fragment key={year}>
                      <td className={tdRO}>{getPriorValue(priorYearData, year, row.category, row.subcategory, 'enrollment')}</td>
                      <td className={tdRO}>{getPriorValue(priorYearData, year, row.category, row.subcategory, 'graduates')}</td>
                    </React.Fragment>
                  ))}

                  {/* Current year — editable (or read-only for subtotals) */}
                  <td className="px-2 py-2 text-sm text-center border-r border-gray-200 dark:border-gray-600 bg-green-50/30 dark:bg-green-900/10">
                    <input type="number"
                      value={row.year_data?.[selectedYear]?.enrollment ?? ''}
                      onChange={(e) => {
                        if (isReadOnly) return;
                        const v = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        const newData = statisticsData.map((r, i) => i !== index ? r : {
                          ...r, year_data: { ...r.year_data, [selectedYear]: { ...r.year_data?.[selectedYear], enrollment: v } }
                        });
                        setStatisticsData(recalculateStatistics(newData));
                      }}
                      className={`w-full px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 rounded ${
                        isReadOnly ? 'bg-gray-100 dark:bg-gray-700 font-semibold cursor-not-allowed' : 'bg-white dark:bg-gray-800'
                      } text-gray-900 dark:text-gray-100`}
                      min="0" placeholder="0" readOnly={isReadOnly} />
                  </td>
                  <td className="px-2 py-2 text-sm text-center border-r border-gray-200 dark:border-gray-600 bg-green-50/30 dark:bg-green-900/10">
                    <input type="number"
                      value={row.year_data?.[selectedYear]?.graduates ?? ''}
                      onChange={(e) => {
                        if (isReadOnly) return;
                        const v = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        const newData = statisticsData.map((r, i) => i !== index ? r : {
                          ...r, year_data: { ...r.year_data, [selectedYear]: { ...r.year_data?.[selectedYear], graduates: v } }
                        });
                        setStatisticsData(recalculateStatistics(newData));
                      }}
                      className={`w-full px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 rounded ${
                        isReadOnly ? 'bg-gray-100 dark:bg-gray-700 font-semibold cursor-not-allowed' : 'bg-white dark:bg-gray-800'
                      } text-gray-900 dark:text-gray-100`}
                      min="0" placeholder="0" readOnly={isReadOnly} />
                  </td>

                  <td className="px-2 py-2 text-sm text-center">
                    {canRemoveSubcategory(row) && (
                      <button type="button" onClick={() => handleRemoveSubcategory(index)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400" title="Remove this row">
                        <IoTrash className="inline text-lg" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderServicesTable = (section) => {
    const sectionServices = servicesData[section] || [];

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{section}</h3>
          <button
            type="button"
            onClick={() => handleAddService(section)}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <IoAddCircle className="text-base" /> Add Service
          </button>
        </div>
        {sectionServices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">Institutional Services/Programs/Activities</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">No. of Beneficiaries/Participants</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">Remarks</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sectionServices.map((service, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600">
                      <input
                        type="text"
                        value={service.institutional_services_programs_activities || ''}
                        onChange={(e) => handleServiceChange(section, index, 'institutional_services_programs_activities', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Services/Programs/Activities"
                      />
                    </td>
                    <td className="px-3 py-2 text-sm text-center border-r border-gray-200 dark:border-gray-600">
                      <input
                        type="number"
                        value={service.number_of_beneficiaries_participants || ''}
                        onChange={(e) => handleServiceChange(section, index, 'number_of_beneficiaries_participants', e.target.value)}
                        className="w-full px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        min="0"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600">
                      <input
                        type="text"
                        value={service.remarks || ''}
                        onChange={(e) => handleServiceChange(section, index, 'remarks', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Remarks"
                      />
                    </td>
                    <td className="px-3 py-2 text-sm text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveService(section, index)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Remove this service"
                      >
                        <IoTrash className="inline text-lg" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">No services added yet. Click "Add Service" to add one.</p>
        )}
      </div>
    );
  };

  return (
    <HEILayout title="Submit Annex M">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">STUDENTS WITH SPECIAL NEEDS/PWD</h1>
            <span className="text-xl font-semibold text-gray-500 dark:text-gray-400">Annex M</span>
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
            <FormSelector 
              currentForm="M"
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

        <div className="relative space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Table 1: Statistics</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Enrollment and graduate statistics across the last three academic years (including current). Categories A and C have fixed subcategories. Categories B and D allow adding custom subcategories.
              </p>
            </div>
            {renderStatisticsTable()}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Table 2: Services</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Institutional services, programs, and activities for each category of students with special needs.
              </p>
            </div>
            {SECTIONS.map(section => (
              <div key={section}>
                {renderServicesTable(section)}
              </div>
            ))}
          </div>

          <AdditionalNotesSection value={requestNotes} onChange={setRequestNotes} />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={processing}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
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

export default Create;
