import React from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import DataTable from '../../../Components/Widgets/DataTable';
import StatusBadge from '../../../Components/Widgets/StatusBadge';
import { formatDateTime } from '../../../Utils/formatters';

const Index = ({ heis }) => {
  const columns = [
    { header: 'HEI Name', accessor: 'name' },
    { header: 'Type', accessor: 'type' },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.is_active ? 'active' : 'inactive'} />
    },
    {
      header: 'Created At',
      render: (row) => formatDateTime(row.created_at)
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Link
            href={`/admin/hei-accounts/${row.id}/edit`}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            Edit
          </Link>
          <button
            onClick={() => handleToggleStatus(row.id)}
            className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400"
          >
            {row.is_active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      )
    }
  ];

  const handleToggleStatus = (id) => {
    if (confirm('Are you sure you want to change this HEI\'s status?')) {
      router.post(`/admin/hei-accounts/${id}/toggle-status`);
    }
  };

  return (
    <AdminLayout title="HEI Accounts">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            HEI Accounts
          </h1>
          <Link
            href="/admin/hei-accounts/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create HEI Account
          </Link>
        </div>

        <DataTable
          columns={columns}
          data={heis?.data || []}
          emptyMessage="No HEI accounts found"
        />
      </div>
    </AdminLayout>
  );
};

export default Index;
