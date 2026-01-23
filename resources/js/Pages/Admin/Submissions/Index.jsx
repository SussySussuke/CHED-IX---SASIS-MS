import React, { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Link } from '@inertiajs/react';
import DataTable from '../../../Components/Common/DataTable';

export default function Index({ heis, totalPending }) {
    const [search, setSearch] = useState('');

    const filteredHeis = heis.filter(hei =>
        hei.name.toLowerCase().includes(search.toLowerCase()) ||
        hei.code.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        {
            key: 'code',
            label: 'HEI Code',
            render: (row) => (
                <span className="font-medium text-gray-900 dark:text-white">{row.code}</span>
            )
        },
        {
            key: 'name',
            label: 'Institution Name',
            render: (row) => (
                <span className="text-gray-900 dark:text-white">{row.name}</span>
            )
        },
        {
            key: 'pending_requests',
            label: 'Pending Requests',
            align: 'center',
            render: (row) => row.pending_requests > 0 ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300">
                    {row.pending_requests}
                </span>
            ) : (
                <span className="text-gray-400 dark:text-gray-500">0</span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            align: 'center',
            render: (row) => (
                <Link
                    href={`/admin/submissions/${row.id}`}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                >
                    View Submissions
                </Link>
            )
        }
    ];

    return (
        <AdminLayout title="HEI Submissions" pendingCount={totalPending}>
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">HEI Submissions</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">View and manage all HEI submissions and requests</p>
                </div>

                {totalPending > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4 mb-6">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    You have <strong>{totalPending}</strong> pending request{totalPending > 1 ? 's' : ''} to review.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <DataTable
                    columns={columns}
                    data={filteredHeis}
                    searchValue={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search by HEI name or code..."
                    emptyMessage="No HEIs found."
                />
            </div>
        </AdminLayout>
    );
}
