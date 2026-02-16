import React, { useState, useMemo, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import AGGridViewer from '../../Components/Common/AGGridViewer';
import EmptyState from '../../Components/Common/EmptyState';
import AcademicYearSelect from '../../Components/Forms/AcademicYearSelect';
import FormSelector from '../../Components/Forms/FormSelector';
import { IoDocumentText, IoInformationCircle, IoGridOutline } from 'react-icons/io5';
import { summaryConfig } from '../../Config/summaryView/summaryConfig';

const SummaryView = ({ 
  summaries = [], 
  availableYears = [], 
  selectedYear = null,
}) => {
  const [activeSection, setActiveSection] = useState('1A-Profile');
  const [sectionData, setSectionData] = useState(summaries);
  const [loading, setLoading] = useState(false);

  const handleYearChange = (e) => {
    const year = e.target.value;
    router.get('/admin/summary', { year }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  // Get list of available sections from summaryConfig
  const sections = summaryConfig.getSectionList();

  // Format sections for FormSelector (needs grouped format)
  const sectionOptions = [
    {
      group: 'Summary Sections',
      options: sections.map(section => ({
        value: section.id,
        label: section.title
      }))
    }
  ];

  // Handle section change
  const handleSectionChange = async (sectionId) => {
    setActiveSection(sectionId);
    
    // If switching to Info-Orientation, fetch data from API
    if (sectionId === '2-Info-Orientation' && selectedYear) {
      setLoading(true);
      try {
        const response = await fetch(`/admin/summary/info-orientation?year=${selectedYear}`);
        const result = await response.json();
        setSectionData(result.data || []);
      } catch (error) {
        console.error('Error fetching info-orientation data:', error);
        setSectionData([]);
      } finally {
        setLoading(false);
      }
    } else {
      // For Profile and Personnel sections, use the summaries data from props
      setSectionData(summaries);
    }
  };

  // Update section data when summaries prop changes
  useEffect(() => {
    if (activeSection !== '2-Info-Orientation') {
      setSectionData(summaries);
    }
  }, [summaries, activeSection]);

  // Load Info-Orientation data when year changes
  useEffect(() => {
    if (activeSection === '2-Info-Orientation' && selectedYear) {
      handleSectionChange('2-Info-Orientation');
    }
  }, [selectedYear]);

  // Dynamic column definitions based on activeSection
  const columnDefs = useMemo(() => {
    return summaryConfig.getSectionColumns(activeSection);
  }, [activeSection]);

  // Get grid configuration
  const gridConfig = summaryConfig.gridDefaults;

  return (
    <AdminLayout title="Summary View">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Summary Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View all HEI summary submissions by academic year
            </p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Section Selector using FormSelector */}
          <FormSelector
            currentForm={activeSection}
            options={sectionOptions}
            mode="custom"
            onCustomChange={handleSectionChange}
            label="Section"
            icon={IoGridOutline}
            disabled={loading}
          />
          
          {/* Academic Year Filter */}
          <AcademicYearSelect
            value={selectedYear || ''}
            onChange={handleYearChange}
            availableYears={availableYears}
            required={false}
            mode="view"
          />
        </div>

        {/* Data Display */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-gray-700 dark:text-gray-300">
                Loading data...
              </span>
            </div>
          </div>
        ) : !selectedYear ? (
          <EmptyState
            icon={<IoInformationCircle className="mx-auto h-12 w-12 text-gray-400" />}
            title="No Academic Year Selected"
            message="Please select an academic year to view summary data"
          />
        ) : sectionData.length === 0 ? (
          <EmptyState
            icon={<IoDocumentText className="mx-auto h-12 w-12 text-gray-400" />}
            title="No Data Available"
            message={`No HEIs found for academic year ${selectedYear}`}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <AGGridViewer
              rowData={sectionData}
              columnDefs={columnDefs}
              height={gridConfig.height}
              paginationPageSize={gridConfig.paginationPageSize}
              paginationPageSizeSelector={gridConfig.paginationPageSizeSelector}
              enableQuickFilter={gridConfig.enableQuickFilter}
              quickFilterPlaceholder={gridConfig.quickFilterPlaceholder}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default SummaryView;
