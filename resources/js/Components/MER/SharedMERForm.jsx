import React, { useState, useEffect, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import MERTableComponent from './MERTableComponent';
import { getMERFormConfig } from '../../Config/merFormConfig';
import { getMERFilters, saveMERFilters } from '../../Utils/merSessionStorage';
import EmptyState from '../Common/EmptyState';

/**
 * Shared component for MER Forms 1, 2, and 3
 * Handles HEI/Year selection and delegates table rendering to MERTableComponent
 */
const SharedMERForm = ({ formNumber, heis, academicYears, initialHeiId, initialAcademicYear, formData }) => {
  const config = getMERFormConfig(formNumber);
  const { flash } = usePage().props;

  // Calculate default academic year based on deadline (September 1st)
  const getDefaultAcademicYear = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const startYear = currentMonth < 8 ? currentYear - 1 : currentYear;
    return `${startYear}-${startYear + 1}`;
  };

  // Determine initial values - URL params take priority over sessionStorage
  const getInitialValues = () => {
    // If URL has params (we're on /form1/{heiId}/{year}), use those
    if (initialHeiId && initialAcademicYear) {
      return {
        heiId: String(initialHeiId),
        year: String(initialAcademicYear),
        isFromUrl: true
      };
    }

    // Otherwise check sessionStorage (for persistence across form pages)
    const savedFilters = getMERFilters();
    if (savedFilters.heiId && savedFilters.academicYear) {
      return {
        heiId: savedFilters.heiId,
        year: savedFilters.academicYear,
        isFromUrl: false
      };
    }

    // Default: no HEI selected, use default year
    return {
      heiId: '',
      year: initialAcademicYear || getDefaultAcademicYear(),
      isFromUrl: false
    };
  };

  const initialValues = getInitialValues();
  const [selectedHEI, setSelectedHEI] = useState(initialValues.heiId);
  const [selectedYear, setSelectedYear] = useState(initialValues.year);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Track what's already loaded to prevent duplicate fetches
  // If data came from URL, mark it as already loaded
  const lastLoadedRef = useRef(
    initialValues.isFromUrl
      ? { heiId: initialValues.heiId, year: initialValues.year }
      : { heiId: null, year: null }
  );

  // Filter HEIs based on search
  const filteredHEIs = heis?.filter(hei =>
    hei.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hei.code?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const selectedHEIName = heis?.find(h => String(h.id) === String(selectedHEI))?.name || 'Select HEI';

  // Save filters to session storage whenever they change
  useEffect(() => {
    if (selectedHEI && selectedYear) {
      saveMERFilters(selectedHEI, selectedYear);
    }
  }, [selectedHEI, selectedYear]);

  // Load form data when HEI or year changes (user selection only)
  useEffect(() => {
    if (selectedHEI && selectedYear) {
      const currentHei = String(selectedHEI);
      const currentYear = String(selectedYear);
      const alreadyLoaded = lastLoadedRef.current.heiId === currentHei &&
                           lastLoadedRef.current.year === currentYear;

      if (!alreadyLoaded) {
        lastLoadedRef.current = { heiId: currentHei, year: currentYear };
        setLoading(true);
        router.get(`${config.endpoint}/${currentHei}/${currentYear}`, {}, {
          preserveScroll: true,
          only: ['formData', 'initialHeiId', 'initialAcademicYear'],
          replace: true,
          onFinish: () => setLoading(false),
        });
      }
    }
  }, [selectedHEI, selectedYear, config.endpoint]);

  return (
    <AdminLayout title={`M&E ${config.title}`}>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {config.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {config.subtitle}
          </p>
        </div>

        {/* Flash Messages */}
        {flash?.error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  {flash.error}
                </p>
              </div>
            </div>
          </div>
        )}

        {flash?.success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  {flash.success}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* HEI and Year Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            {/* HEI Selection - Searchable */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Higher Education Institution
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  disabled={loading}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 flex items-center justify-between"
                >
                  <span className={!selectedHEI ? 'text-gray-400' : ''}>{selectedHEIName}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-[9999] w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-hidden">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                      <input
                        type="text"
                        placeholder="Search HEI..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredHEIs.length > 0 ? (
                        filteredHEIs.map((hei) => (
                          <button
                            key={hei.id}
                            type="button"
                            onClick={() => {
                              setSelectedHEI(hei.id);
                              setIsDropdownOpen(false);
                              setSearchTerm('');
                            }}
                            className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-600 ${
                              String(selectedHEI) === String(hei.id) ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {hei.name}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                          No HEI found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Academic Year Selection */}
            <div>
              <label htmlFor="year" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Academic Year
              </label>
              <select
                id="year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              >
                {academicYears && academicYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading form data...
            </div>
          )}
        </div>

        {/* Empty state if no HEI selected */}
        {!selectedHEI && (
          <EmptyState
            title="No HEI Selected"
            message="Please select a Higher Education Institution to view the form"
          />
        )}

        {/* Show table if data is available */}
        {selectedHEI && formData && (
          <MERTableComponent formData={formData} config={config} />
        )}
      </div>
    </AdminLayout>
  );
};

export default SharedMERForm;
