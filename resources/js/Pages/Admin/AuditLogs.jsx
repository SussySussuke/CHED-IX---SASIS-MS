import React from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import DataTable from '../../Components/Widgets/DataTable';
import StatusBadge from '../../Components/Widgets/StatusBadge';
import { formatDateTime } from '../../Utils/formatters';
import { exportToExcel } from '../../Services/export';

const AuditLogs = ({ logs }) => {
  const columns = [
    {
      header: 'Action',
      render: (row) => <StatusBadge status={row.action} label={row.action} />
    },
    { header: 'User', accessor: 'user.name' },
    { header: 'Model', accessor: 'model' },
    {
      header: 'Reason',
      render: (row) => row.reason || 'N/A'
    },
    {
      header: 'Timestamp',
      render: (row) => formatDateTime(row.created_at)
    }
  ];

  const handleExport = () => {
    exportToExcel('/admin/audit-logs/export', 'audit-logs.xlsx');
  };

  return (
    <AdminLayout title="Audit Logs">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Audit Logs
          </h1>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Export to Excel
          </button>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Audit logs are immutable and can only be modified via direct database access.
          </p>
        </div>

        <DataTable
          columns={columns}
          data={logs?.data || []}
          emptyMessage="No audit logs found"
        />
      </div>
    </AdminLayout>
  );
};

export default AuditLogs;
