import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import DataTable from '@/Components/Common/DataTable';
import IconButton from '@/Components/Common/IconButton';
import StatusBadge from '@/Components/Widgets/StatusBadge';
import { IoEyeOutline, IoClose } from 'react-icons/io5';

/**
 * Shared Audit Logs Table Component
 * Used by both Admin and SuperAdmin audit log pages
 * 
 * @param {Object} Layout - Layout component to wrap the page
 * @param {string} pageTitle - Page title for Head component
 * @param {string} headerTitle - Main header title
 * @param {string} headerDescription - Header description text
 * @param {Object} logs - Paginated logs data with data array and links
 * @param {Object} filters - Available filter options
 * @param {Object} queryParams - Current query parameters
 * @param {string} routeName - Route name for applying filters
 * @param {boolean} showUserRoleFilter - Whether to show user role filter (SuperAdmin only)
 */
export default function AuditLogsTable({
  Layout,
  pageTitle,
  headerTitle,
  headerDescription,
  logs,
  filters,
  queryParams,
  routeName,
  showUserRoleFilter = false,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserRole, setSelectedUserRole] = useState(queryParams?.user_role || '');
  const [selectedAction, setSelectedAction] = useState(queryParams?.action || '');
  const [selectedEntityType, setSelectedEntityType] = useState(queryParams?.entity_type || '');
  const [modalLog, setModalLog] = useState(null);

  // Auto-apply filters when they change
  useEffect(() => {
    const params = {};
    if (showUserRoleFilter && selectedUserRole) params.user_role = selectedUserRole;
    if (selectedAction) params.action = selectedAction;
    if (selectedEntityType) params.entity_type = selectedEntityType;
    
    // Only navigate if filters have actually changed from query params
    const hasChanges = 
      (showUserRoleFilter && selectedUserRole !== (queryParams?.user_role || '')) ||
      selectedAction !== (queryParams?.action || '') ||
      selectedEntityType !== (queryParams?.entity_type || '');
    
    if (hasChanges) {
      router.get(window.location.pathname, params, { preserveState: true, preserveScroll: true });
    }
  }, [selectedUserRole, selectedAction, selectedEntityType]);

  // Filter logs based on search term
  const filteredLogs = logs.data.filter((log) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      log.user_name.toLowerCase().includes(searchLower) ||
      log.entity_name?.toLowerCase().includes(searchLower) ||
      log.description.toLowerCase().includes(searchLower)
    );
  });

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

  const columns = [
    {
      key: 'created_at',
      label: 'Date & Time',
      render: (log) => (
        <div>
          <div className="text-gray-900 dark:text-white font-medium">{log.created_at}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{log.created_at_relative}</div>
        </div>
      ),
    },
    {
      key: 'user_name',
      label: 'User',
      render: (log) => (
        <div>
          <div className="text-gray-900 dark:text-white font-medium">{log.user_name}</div>
          <div className="text-xs mt-1">
            <StatusBadge
              color={log.user_role === 'superadmin' ? 'purple' : 'blue'}
              label={log.user_role.charAt(0).toUpperCase() + log.user_role.slice(1)}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (log) => (
        <StatusBadge
          color={getActionColor(log.action_color)}
          label={log.action.charAt(0).toUpperCase() + log.action.slice(1)}
        />
      ),
    },
    {
      key: 'entity_type',
      label: 'Entity Type',
      render: (log) => (
        <StatusBadge
          color={getEntityTypeColor(log.entity_type_color)}
          label={log.entity_type}
        />
      ),
    },
    {
      key: 'entity_name',
      label: 'Entity',
      render: (log) => (
        <div className="text-gray-900 dark:text-white">{log.entity_name || 'N/A'}</div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (log) => (
        <div className="max-w-md">
          <div className="text-gray-900 dark:text-white">{log.description}</div>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Details',
      align: 'center',
      render: (log) => (
        <IconButton
          variant="blue"
          onClick={() => setModalLog(log)}
          title="View details"
        >
          <IoEyeOutline size={18} />
        </IconButton>
      ),
    },
  ];

  return (
    <Layout>
      <Head title={pageTitle} />

      <div className="py-8">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {headerTitle}
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {headerDescription}
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 border border-gray-200 dark:border-gray-700">
            <div className={`grid grid-cols-1 ${showUserRoleFilter ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
              {showUserRoleFilter && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    User Role
                  </label>
                  <select
                    value={selectedUserRole}
                    onChange={(e) => setSelectedUserRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All Roles</option>
                    {filters.user_roles?.map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Action
                </label>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Actions</option>
                  {filters.actions.map((action) => (
                    <option key={action} value={action}>
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Entity Type
                </label>
                <select
                  value={selectedEntityType}
                  onChange={(e) => setSelectedEntityType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Types</option>
                  {filters.entity_types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            data={filteredLogs}
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search by user, entity, or description..."
            emptyMessage="No audit logs found"
          />

          {/* Pagination */}
          {logs.links && logs.links.length > 3 && (
            <div className="mt-6 flex justify-center">
              <nav className="inline-flex rounded-md shadow-sm -space-x-px">
                {logs.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url || '#'}
                    className={`px-3 py-2 text-sm font-medium ${
                      link.active
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } ${
                      index === 0 ? 'rounded-l-md' : ''
                    } ${
                      index === logs.links.length - 1 ? 'rounded-r-md' : ''
                    } border border-gray-300 dark:border-gray-600`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </nav>
            </div>
          )}
        </div>
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
