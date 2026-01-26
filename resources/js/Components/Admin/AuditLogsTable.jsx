import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AGGridViewer from '@/Components/Common/AGGridViewer';
import IconButton from '@/Components/Common/IconButton';
import StatusBadge from '@/Components/Widgets/StatusBadge';
import { IoEyeOutline, IoClose } from 'react-icons/io5';

/**
 * Shared Audit Logs Table Component
 * Used by both Admin and SuperAdmin audit log pages
 */
export default function AuditLogsTable({
  Layout,
  pageTitle,
  headerTitle,
  headerDescription,
  logs,
}) {
  const [modalLog, setModalLog] = useState(null);

  // Map action colors to badge colors
  const getActionColor = (actionColor) => {
    const colorMap = {
      green: 'green',
      blue: 'blue',
      red: 'red',
      orange: 'orange',
      gray: 'gray',
    };
    return colorMap[actionColor] || 'gray';
  };

  // Map entity type colors to badge colors
  const getEntityTypeColor = (entityColor) => {
    const colorMap = {
      purple: 'purple',
      blue: 'blue',
      indigo: 'indigo',
      gray: 'gray',
    };
    return colorMap[entityColor] || 'gray';
  };

  // AG Grid column definitions
  const columnDefs = [
    {
      field: 'created_at',
      headerName: 'Date & Time',
      width: 200,
      cellRenderer: (params) => {
        const log = params.data;
        return (
          <div>
            <div className="text-gray-900 dark:text-white font-medium">{log.created_at}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{log.created_at_relative}</div>
          </div>
        );
      },
    },
    {
      field: 'user_name',
      headerName: 'User',
      width: 200,
      cellRenderer: (params) => {
        const log = params.data;
        return (
          <div>
            <div className="text-gray-900 dark:text-white font-medium">{log.user_name}</div>
            <div className="mt-1">
              <StatusBadge
                color={log.user_role === 'superadmin' ? 'purple' : 'blue'}
                label={log.user_role.charAt(0).toUpperCase() + log.user_role.slice(1)}
              />
            </div>
          </div>
        );
      },
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 140,
      cellRenderer: (params) => {
        const log = params.data;
        return (
          <StatusBadge
            color={getActionColor(log.action_color)}
            label={log.action.charAt(0).toUpperCase() + log.action.slice(1)}
          />
        );
      },
    },
    {
      field: 'entity_type',
      headerName: 'Entity Type',
      width: 160,
      cellRenderer: (params) => {
        const log = params.data;
        return (
          <StatusBadge
            color={getEntityTypeColor(log.entity_type_color)}
            label={log.entity_type}
          />
        );
      },
    },
    {
      field: 'entity_name',
      headerName: 'Entity',
      width: 200,
      cellRenderer: (params) => {
        const log = params.data;
        return (
          <div className="text-gray-900 dark:text-white">{log.entity_name || 'N/A'}</div>
        );
      },
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 300,
      cellRenderer: (params) => {
        const log = params.data;
        return (
          <div className="text-gray-900 dark:text-white">{log.description}</div>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Details',
      width: 100,
      sortable: false,
      filter: false,
      cellRenderer: (params) => {
        const log = params.data;
        return (
          <div className="flex justify-center">
            <IconButton
              variant="blue"
              onClick={() => setModalLog(log)}
              title="View details"
            >
              <IoEyeOutline size={18} />
            </IconButton>
          </div>
        );
      },
    },
  ];

  return (
    <Layout>
      <Head title={pageTitle} />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {headerTitle}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {headerDescription}
          </p>
        </div>

        {/* AG Grid Table */}
        <AGGridViewer
            rowData={logs.data}
            columnDefs={columnDefs}
            height="700px"
            quickFilterPlaceholder="Search by user, entity, or description..."
            paginationPageSize={50}
            paginationPageSizeSelector={[25, 50, 100, 200]}
          />
      </div>

      {/* Audit Log Details Modal */}
      {modalLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
              onClick={() => setModalLog(null)}
            ></div>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Audit Log Details
                  </h3>
                  <IconButton
                    variant="gray"
                    onClick={() => setModalLog(null)}
                    title="Close"
                  >
                    <IoClose size={20} />
                  </IconButton>
                </div>

                <div className="space-y-4">
                  {/* Basic Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">User</p>
                      <p className="text-gray-900 dark:text-white font-medium">{modalLog.user_name}</p>
                      <div className="mt-1">
                        <StatusBadge
                          color={modalLog.user_role === 'superadmin' ? 'purple' : 'blue'}
                          label={modalLog.user_role.charAt(0).toUpperCase() + modalLog.user_role.slice(1)}
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">IP Address</p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {modalLog.ip_address || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Action</p>
                      <div className="mt-1">
                        <StatusBadge
                          color={getActionColor(modalLog.action_color)}
                          label={modalLog.action.charAt(0).toUpperCase() + modalLog.action.slice(1)}
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Entity Type</p>
                      <div className="mt-1">
                        <StatusBadge
                          color={getEntityTypeColor(modalLog.entity_type_color)}
                          label={modalLog.entity_type}
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Entity Name</p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {modalLog.entity_name || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Date & Time</p>
                      <p className="text-gray-900 dark:text-white font-medium">{modalLog.created_at}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{modalLog.created_at_relative}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Description</p>
                    <p className="text-gray-900 dark:text-white">{modalLog.description}</p>
                  </div>

                  {/* Old Values */}
                  {modalLog.old_values && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                        Old Values
                      </h4>
                      <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-xs overflow-x-auto max-h-64">
                        {JSON.stringify(modalLog.old_values, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* New Values */}
                  {modalLog.new_values && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                        New Values
                      </h4>
                      <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-xs overflow-x-auto max-h-64">
                        {JSON.stringify(modalLog.new_values, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setModalLog(null)}
                  className="w-full inline-flex justify-center rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
