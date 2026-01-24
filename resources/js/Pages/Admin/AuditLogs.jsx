import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import AuditLogsTable from '@/Components/Admin/AuditLogsTable';

export default function AuditLogs({ logs, filters, queryParams }) {
  return (
    <AuditLogsTable
      Layout={AdminLayout}
      pageTitle="Audit Logs"
      headerTitle="Audit Logs"
      headerDescription="View all administrative actions performed in the system."
      logs={logs}
      filters={filters}
      queryParams={queryParams}
      routeName="admin.audit-logs"
      showUserRoleFilter={false}
    />
  );
}
