import React, { useState, useEffect } from 'react';
import AGGridViewer from '../Common/AGGridViewer';

/**
 * Modal to display detailed program evidence for Info-Orientation categories
 * Shows a table of programs that match the selected category
 */
const InfoOrientationEvidenceModal = ({ isOpen, onClose, heiId, heiName, category, categoryLabel, academicYear }) => {
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [error, setError] = useState(null);

  // Fetch programs when modal opens
  useEffect(() => {
    if (!isOpen || !heiId || !category || !academicYear) {
      return;
    }

    const fetchPrograms = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `/admin/summary/info-orientation/${heiId}/${category}/evidence?year=${academicYear}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch program details');
        }
        
        const data = await response.json();
        setPrograms(data.programs || []);
      } catch (err) {
        console.error('Error fetching evidence:', err);
        setError(err.message);
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [isOpen, heiId, category, academicYear]);

  if (!isOpen) return null;

  // Column definitions for the programs table
  const columnDefs = [
    {
      headerName: 'Title',
      field: 'title',
      flex: 2,
      minWidth: 250,
      wrapText: true,
      autoHeight: true,
    },
    {
      headerName: 'Venue',
      field: 'venue',
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: 'Date',
      field: 'implementation_date',
      width: 120,
      valueFormatter: params => {
        if (!params.value) return '—';
        return new Date(params.value).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      },
    },
    {
      headerName: 'Target Group',
      field: 'target_group',
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: 'Face-to-Face',
      field: 'participants_face_to_face',
      width: 120,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: params => params.value?.toLocaleString() || '0',
    },
    {
      headerName: 'Online',
      field: 'participants_online',
      width: 100,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: params => params.value?.toLocaleString() || '0',
    },
    {
      headerName: 'Total',
      field: 'total_participants',
      width: 100,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right', fontWeight: 'bold' },
      valueFormatter: params => params.value?.toLocaleString() || '0',
    },
    {
      headerName: 'Organizer',
      field: 'organizer',
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: 'Remarks',
      field: 'remarks',
      flex: 1,
      minWidth: 200,
      wrapText: true,
      autoHeight: true,
      cellRenderer: params => {
        if (!params.value) return <span className="text-gray-400">—</span>;
        return <span className="text-sm">{params.value}</span>;
      },
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-7xl w-full border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {categoryLabel} Programs - Evidence
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {heiName} • Academic Year {academicYear}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="text-gray-700 dark:text-gray-300">
                      Loading program details...
                    </span>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-700 dark:text-red-400">
                    Error: {error}
                  </p>
                </div>
              ) : programs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    No programs found for this category.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing <span className="font-semibold text-gray-900 dark:text-white">{programs.length}</span> program(s)
                  </div>
                  
                  <AGGridViewer
                    rowData={programs}
                    columnDefs={columnDefs}
                    height="500px"
                    paginationPageSize={25}
                    enableQuickFilter={true}
                    quickFilterPlaceholder="Search programs..."
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InfoOrientationEvidenceModal;
