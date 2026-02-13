import React, { useMemo } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import AGGridViewer from '../../Components/Common/AGGridViewer';
import EmptyState from '../../Components/Common/EmptyState';
import FormSelector from '../../Components/Forms/FormSelector';
import AcademicYearSelect from '../../Components/Forms/AcademicYearSelect';
import StatusBadge from '../../Components/Widgets/StatusBadge';
import { IoDocumentText, IoInformationCircle } from 'react-icons/io5';

const SummaryView = ({ summaries = [], availableYears = [], selectedYear = null }) => {
  const handleYearChange = (e) => {
    const year = e.target.value;
    router.get('/admin/summary', { year }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const columnDefs = useMemo(() => [
    {
      headerName: 'HEI Code',
      field: 'hei_code',
      width: 130,
      filter: 'agTextColumnFilter',
      cellStyle: { fontWeight: '500' },
      pinned: 'left',
    },
    {
      headerName: 'Institution Name',
      field: 'hei_name',
      flex: 1,
      minWidth: 300,
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Type',
      field: 'hei_type',
      width: 100,
      filter: 'agTextColumnFilter',
      cellStyle: { textAlign: 'center' },
    },
    {
      headerName: 'Male',
      field: 'population_male',
      width: 100,
      filter: 'agNumberColumnFilter',
      cellStyle: { textAlign: 'right' },
      cellRenderer: (params) => {
        if (params.value === null || params.value === undefined) {
          return <span className="text-gray-400">—</span>;
        }
        return params.value.toLocaleString();
      },
    },
    {
      headerName: 'Female',
      field: 'population_female',
      width: 100,
      filter: 'agNumberColumnFilter',
      cellStyle: { textAlign: 'right' },
      cellRenderer: (params) => {
        if (params.value === null || params.value === undefined) {
          return <span className="text-gray-400">—</span>;
        }
        return params.value.toLocaleString();
      },
    },
    {
      headerName: 'Intersex',
      field: 'population_intersex',
      width: 110,
      filter: 'agNumberColumnFilter',
      cellStyle: { textAlign: 'right' },
      cellRenderer: (params) => {
        if (params.value === null || params.value === undefined) {
          return <span className="text-gray-400">—</span>;
        }
        return params.value.toLocaleString();
      },
    },
    {
      headerName: 'Total',
      field: 'population_total',
      width: 120,
      filter: 'agNumberColumnFilter',
      cellStyle: { textAlign: 'right', fontWeight: '600' },
      cellRenderer: (params) => {
        if (params.value === null || params.value === undefined) {
          return <span className="text-gray-400">—</span>;
        }
        return params.value.toLocaleString();
      },
    },
    {
      headerName: 'Org Chart',
      field: 'submitted_org_chart',
      width: 130,
      filter: 'agTextColumnFilter',
      cellStyle: { textAlign: 'center' },
      cellRenderer: (params) => {
        if (!params.value) return <span className="text-gray-400">—</span>;
        return params.value.toUpperCase();
      },
    },
    {
      headerName: 'HEI Website',
      field: 'hei_website',
      width: 200,
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => {
        if (!params.value) return <span className="text-gray-400">—</span>;
        return (
          <a 
            href={params.value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {params.value.length > 30 ? params.value.substring(0, 30) + '...' : params.value}
          </a>
        );
      },
    },
    {
      headerName: 'SAS Website',
      field: 'sas_website',
      width: 200,
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => {
        if (!params.value) return <span className="text-gray-400">—</span>;
        return (
          <a 
            href={params.value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {params.value.length > 30 ? params.value.substring(0, 30) + '...' : params.value}
          </a>
        );
      },
    },
    {
      headerName: 'Social Media',
      field: 'social_media_contacts',
      width: 250,
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => {
        if (!params.value) return <span className="text-gray-400">—</span>;
        const text = params.value;
        return (
          <span className="text-sm" title={text}>
            {text.length > 40 ? text.substring(0, 40) + '...' : text}
          </span>
        );
      },
    },
    {
      headerName: 'Student Handbook',
      field: 'student_handbook',
      width: 180,
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => {
        if (!params.value) return <span className="text-gray-400">—</span>;
        return <span className="text-sm">{params.value}</span>;
      },
    },
    {
      headerName: 'Student Publication',
      field: 'student_publication',
      width: 200,
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => {
        if (!params.value) return <span className="text-gray-400">—</span>;
        return <span className="text-sm">{params.value}</span>;
      },
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 140,
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => {
        return (
          <div className="flex justify-center">
            <StatusBadge status={params.value} />
          </div>
        );
      },
      cellStyle: { textAlign: 'center' },
    },
    {
      headerName: 'Submitted At',
      field: 'submitted_at',
      width: 180,
      filter: 'agDateColumnFilter',
      cellRenderer: (params) => {
        if (!params.value) return <span className="text-gray-400">—</span>;
        return new Date(params.value).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
    },
  ], []);

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

        {/* Filters Section - Using Blessed Components! */}
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
              height="calc(100vh - 350px)"
              paginationPageSize={50}
              paginationPageSizeSelector={[25, 50, 100, 200]}
              enableQuickFilter={true}
              quickFilterPlaceholder="Search by HEI name, code, type, websites..."
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default SummaryView;
