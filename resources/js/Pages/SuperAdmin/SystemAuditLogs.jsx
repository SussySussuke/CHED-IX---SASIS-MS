import React from 'react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import AuditLogsTable from '@/Components/Admin/AuditLogsTable';

export default function SystemAuditLogs({ logs, filters, queryParams }) {
  return (
    <AuditLogsTable
      Layout={SuperAdminLayout}
      pageTitle="System Audit Logs"
      headerTitle="System Audit Logs"
      headerDescription="Comprehensive view of all administrative actions across the system."
      logs={logs}
      filters={filters}
      queryParams={queryParams}
      routeName="superadmin.system-audit-logs"
      showUserRoleFilter={true}
    />
  );
}
