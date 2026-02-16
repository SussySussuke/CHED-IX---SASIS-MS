import React, { useMemo } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import AGGridViewer from '../../Components/Common/AGGridViewer';
import EmptyState from '../../Components/Common/EmptyState';
import FormSelector from '../../Components/Forms/FormSelector';
import AcademicYearSelect from '../../Components/Forms/AcademicYearSelect';
import { IoDocumentText, IoInformationCircle } from 'react-icons/io5';
import { summaryConfig } from '../../Config/summaryView/summaryConfig';

const SummaryView = ({ 
  summaries = [], 
  availableYears = [], 
  selectedYear = null,
  activeSection = null, // Optional: specify which section to display
}) => {
  const handleYearChange = (e) => {
    const year = e.target.value;
    router.get('/admin/summary', { year }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  // Dynamic column definitions based on activeSection
  const columnDefs = useMemo(() => {
    if (activeSection) {
      // Display specific section
      return summaryConfig.getSectionColumns(activeSection);
    }
    // Default: display all columns (combined view)
    return summaryConfig.getAllColumns();
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
          <FormSelector 
            currentForm="SUMMARY" 
            mode="view"
          />
          
          <AcademicYearSelect
            value={selectedYear || ''}
            onChange={handleYearChange}
            availableYears={availableYears}
            required={false}
            mode="view"
          />
        </div>

        {/* Data Display */}
        {!selectedYear ? (
          <EmptyState
            icon={<IoInformationCircle className="mx-auto h-12 w-12 text-gray-400" />}
            title="No Academic Year Selected"
            message="Please select an academic year to view summary data"
          />
        ) : summaries.length === 0 ? (
          <EmptyState
            icon={<IoDocumentText className="mx-auto h-12 w-12 text-gray-400" />}
            title="No Data Available"
            message={`No HEIs found for academic year ${selectedYear}`}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <AGGridViewer
              rowData={summaries}
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
