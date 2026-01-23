import React, { useState, useEffect } from 'react';
import HEILayout from '../../../Layouts/HEILayout';
import { router } from '@inertiajs/react';
import InfoBox from '../../../Components/Widgets/InfoBox';
import { CURRENT_YEAR } from '../../../Utils/constants';
import { IoAddCircle, IoSave, IoTrash } from 'react-icons/io5';
import AdditionalNotesSection from '../../../Components/Annex/AdditionalNotesSection';
import AcademicYearSelect from '../../../Components/Forms/AcademicYearSelect';


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
  const currentYear = new Date().getFullYear();
  const currentAcademicYear = defaultYear || `${currentYear}-${currentYear + 1}`;
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
  
  // Get last 3 years based on selected academic year
  const getLastThreeYears = (baseYear) => {
    const startYear = parseInt(baseYear.split('-')[0]);
    return [
      `${startYear - 2}-${startYear - 1}`,
      `${startYear - 1}-${startYear}`,
      `${startYear}-${startYear + 1}`,
    ];
  };
  
  const [years, setYears] = useState(getLastThreeYears(selectedYear));

  // Update years when selected year changes
  useEffect(() => {
    setYears(getLastThreeYears(selectedYear));
  }, [selectedYear]);

  useEffect(() => {
    if (statistics && statistics.length > 0) {
      setStatisticsData(statistics);
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

    // Create empty year data structure
    const emptyYearData = {};
    years.forEach(year => {
      emptyYearData[year] = { enrollment: 0, graduates: 0 };
    });

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

    // Category D: Other students (USER-ADDABLE, NO SUBTOTAL)
    // No initial rows

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
    const emptyYearData = {};
    years.forEach(year => {
      emptyYearData[year] = { enrollment: 0, graduates: 0 };
    });

    return {
      category,
      subcategory: 'Sub-Total',
      year_data: emptyYearData,
      is_subtotal: true,
      display_order: order,
    };
  };

  const recalculateStatistics = (updatedData) => {
    const newData = [...updatedData];

    // Recalculate subtotals for categories that have them (A, B, C)
    ['A. Persons with Disabilities', 'B. Indigenous People', 'C. Dependents of Solo Parents / Solo Parents'].forEach(category => {
      const subtotalIndex = newData.findIndex(row => row.category === category && row.is_subtotal);
      if (subtotalIndex !== -1) {
        const categoryRows = newData.filter(row => row.category === category && !row.is_subtotal);
        const newYearData = {};

        years.forEach(year => {
          const enrollmentSum = categoryRows.reduce((sum, row) =>
            sum + (parseInt(row.year_data?.[year]?.enrollment) || 0), 0);
          const graduatesSum = categoryRows.reduce((sum, row) =>
            sum + (parseInt(row.year_data?.[year]?.graduates) || 0), 0);

          newYearData[year] = {
            enrollment: enrollmentSum,
            graduates: graduatesSum,
          };
        });

        newData[subtotalIndex] = {
          ...newData[subtotalIndex],
          year_data: newYearData,
        };
      }
    });

    // Recalculate TOTAL (sum of all subtotals + Category D rows)
    const totalIndex = newData.findIndex(row => row.category === 'TOTAL');
    if (totalIndex !== -1) {
      const subtotalRows = newData.filter(row => row.is_subtotal && row.category !== 'TOTAL');
      const categoryDRows = newData.filter(row => row.category === 'D. Other students with special needs' && !row.is_subtotal);

      const totalYearData = {};
      years.forEach(year => {
        const enrollmentSum =
          subtotalRows.reduce((sum, row) => sum + (parseInt(row.year_data?.[year]?.enrollment) || 0), 0) +
          categoryDRows.reduce((sum, row) => sum + (parseInt(row.year_data?.[year]?.enrollment) || 0), 0);

        const graduatesSum =
          subtotalRows.reduce((sum, row) => sum + (parseInt(row.year_data?.[year]?.graduates) || 0), 0) +
          categoryDRows.reduce((sum, row) => sum + (parseInt(row.year_data?.[year]?.graduates) || 0), 0);

        totalYearData[year] = {
          enrollment: enrollmentSum,
          graduates: graduatesSum,
        };
      });

      newData[totalIndex] = {
        ...newData[totalIndex],
        year_data: totalYearData,
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
    const newData = [...statisticsData];

    // For Category D (no subtotal), insert before TOTAL
    // For Categories B (has subtotal), insert before subtotal
    let insertIndex;
    if (category === 'D. Other students with special needs') {
      insertIndex = newData.findIndex(row => row.category === 'TOTAL');
    } else {
      insertIndex = newData.findIndex(row => row.category === category && row.is_subtotal);
    }

    const emptyYearData = {};
    years.forEach(year => {
      emptyYearData[year] = { enrollment: 0, graduates: 0 };
    });

    const newRow = {
      category,
      subcategory: '',
      year_data: emptyYearData,
      is_subtotal: false,
      display_order: insertIndex,
    };

    newData.splice(insertIndex, 0, newRow);

    // Update display orders
    newData.forEach((row, idx) => {
      row.display_order = idx;
    });

    setStatisticsData(recalculateStatistics(newData));
  };

  const handleRemoveSubcategory = (index) => {
    if (confirm('Are you sure you want to remove this subcategory?')) {
      const newData = statisticsData.filter((_, idx) => idx !== index);

      // Update display orders
      newData.forEach((row, idx) => {
        row.display_order = idx;
      });

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

  const getTotalEnrollment = (row) => {
    if (!row.year_data) return 0;
    return years.reduce((sum, year) =>
      sum + (parseInt(row.year_data[year]?.enrollment) || 0), 0);
  };

  const getTotalGraduates = (row) => {
    if (!row.year_data) return 0;
    return years.reduce((sum, year) =>
      sum + (parseInt(row.year_data[year]?.graduates) || 0), 0);
  };

  const canAddSubcategory = (category) => {
    return category === 'B. Indigenous People' || category === 'D. Other students with special needs';
  };

  const canRemoveSubcategory = (row) => {
    if (row.is_subtotal || row.category === 'TOTAL') return false;
    return canAddSubcategory(row.category);
  };

  const renderStatisticsTable = () => {
    let currentCategory = null;
    let categoryRowCount = 0;
    const categoryStartIndices = {};

    // Calculate category row counts
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

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            {/* First header row - Academic Years */}
            <tr>
              <th rowSpan="2" className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-b border-gray-200 dark:border-gray-600">Category</th>
              <th rowSpan="2" className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-b border-gray-200 dark:border-gray-600">Subcategory</th>
              {years.map(year => (
                <th key={year} colSpan="2" className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-b border-gray-200 dark:border-gray-600">
                  AY {year}
                </th>
              ))}
              <th colSpan="2" className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-b border-gray-200 dark:border-gray-600">Total</th>
              <th rowSpan="2" className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Actions</th>
            </tr>
            {/* Second header row - Enrollment/Graduates */}
            <tr>
              {years.map(year => (
                <React.Fragment key={year}>
                  <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">Enroll</th>
                  <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">Grad</th>
                </React.Fragment>
              ))}
              <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">Enroll</th>
              <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">Grad</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {statisticsData.map((row, index) => {
              const isFirstInCategory = index === 0 || statisticsData[index - 1].category !== row.category;
              const categoryInfo = categoryStartIndices[row.category];
              const rowspan = isFirstInCategory ? categoryInfo.count : 0;
              const isReadOnly = row.is_subtotal || row.category === 'TOTAL';
              const bgClass = isReadOnly ? 'bg-gray-100 dark:bg-gray-700 font-semibold' : 'bg-white dark:bg-gray-800';

              return (
                <tr key={index} className={`${bgClass} hover:bg-gray-50 dark:hover:bg-gray-750`}>
                  {isFirstInCategory && (
                    <td rowSpan={rowspan} className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-600 align-top">
                      {row.category}
                      {canAddSubcategory(row.category) && (
                        <button
                          type="button"
                          onClick={() => handleAddSubcategory(row.category)}
                          className="ml-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                          title="Add subcategory"
                        >
                          <IoAddCircle className="inline text-lg" />
                        </button>
                      )}
                    </td>
                  )}
                  <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600">
                    {isReadOnly ? (
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{row.subcategory || 'TOTAL'}</span>
                    ) : (
                      <input
                        type="text"
                        value={row.subcategory || ''}
                        onChange={(e) => handleStatisticChange(index, 'subcategory', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Enter subcategory"
                        readOnly={!canAddSubcategory(row.category)}
                      />
                    )}
                  </td>
                  {years.map(year => (
                    <React.Fragment key={year}>
                      <td className="px-2 py-2 text-sm text-center border-r border-gray-200 dark:border-gray-600">
                        <input
                          type="number"
                          value={row.year_data?.[year]?.enrollment ?? ''}
                          onChange={(e) => {
                            if (isReadOnly) return;
                            const newValue = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                            const newData = statisticsData.map((r, i) => {
                              if (i !== index) return r;
                              return {
                                ...r,
                                year_data: {
                                  ...r.year_data,
                                  [year]: {
                                    ...r.year_data?.[year],
                                    enrollment: newValue
                                  }
                                }
                              };
                            });
                            setStatisticsData(recalculateStatistics(newData));
                          }}
                          className={`w-full px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 rounded ${isReadOnly ? 'bg-gray-100 dark:bg-gray-700 font-semibold cursor-not-allowed' : 'bg-white dark:bg-gray-800'} text-gray-900 dark:text-gray-100`}
                          min="0"
                          placeholder="0"
                          readOnly={isReadOnly}
                        />
                      </td>
                      <td className="px-2 py-2 text-sm text-center border-r border-gray-200 dark:border-gray-600">
                        <input
                          type="number"
                          value={row.year_data?.[year]?.graduates ?? ''}
                          onChange={(e) => {
                            if (isReadOnly) return;
                            const newValue = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                            const newData = statisticsData.map((r, i) => {
                              if (i !== index) return r;
                              return {
                                ...r,
                                year_data: {
                                  ...r.year_data,
                                  [year]: {
                                    ...r.year_data?.[year],
                                    graduates: newValue
                                  }
                                }
                              };
                            });
                            setStatisticsData(recalculateStatistics(newData));
                          }}
                          className={`w-full px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 rounded ${isReadOnly ? 'bg-gray-100 dark:bg-gray-700 font-semibold cursor-not-allowed' : 'bg-white dark:bg-gray-800'} text-gray-900 dark:text-gray-100`}
                          min="0"
                          placeholder="0"
                          readOnly={isReadOnly}
                        />
                      </td>
                    </React.Fragment>
                  ))}
                  <td className="px-2 py-2 text-sm text-center font-semibold border-r border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    {getTotalEnrollment(row)}
                  </td>
                  <td className="px-2 py-2 text-sm text-center font-semibold border-r border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    {getTotalGraduates(row)}
                  </td>
                  <td className="px-2 py-2 text-sm text-center">
                    {canRemoveSubcategory(row) && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSubcategory(index)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Remove this row"
                      >
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
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">Category</th>
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
                        value={service.category || ''}
                        onChange={(e) => handleServiceChange(section, index, 'category', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Category"
                      />
                    </td>
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

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.visit('/hei/annex-m/history')}
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
