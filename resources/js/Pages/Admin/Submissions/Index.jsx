import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Link } from '@inertiajs/react';
import AGGridViewer from '../../../Components/Common/AGGridViewer';
import InfoBox from '../../../Components/Widgets/InfoBox';

export default function Index({ heis, totalPending }) {
    const columnDefs = [
        {
            field: 'code',
            headerName: 'HEI Code',
            width: 150,
            cellRenderer: (params) => (
                <span className="font-medium text-gray-900 dark:text-white">{params.value}</span>
            )
        },
        {
            field: 'name',
            headerName: 'Institution Name',
            flex: 1,
            minWidth: 300,
            cellRenderer: (params) => (
                <span className="text-gray-900 dark:text-white">{params.value}</span>
            )
        },
        {
            field: 'pending_requests',
            headerName: 'Pending Requests',
            width: 180,
            cellClass: 'text-center',
            cellRenderer: (params) => {
                const count = params.value;
                return count > 0 ? (
                    <div className="flex justify-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300">
                            {count}
                        </span>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <span className="text-gray-400 dark:text-gray-500">0</span>
                    </div>
                );
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 180,
            sortable: false,
            filter: false,
            cellClass: 'text-center',
            cellRenderer: (params) => (
                <div className="flex justify-center">
                    <Link
                        href={`/admin/submissions/${params.data.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm"
                    >
                        View Submissions
                    </Link>
                </div>
            )
        }
    ];

    return (
        <AdminLayout title="HEI Submissions" pendingCount={totalPending}>
            <div>
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">HEI Submissions</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">View and manage all HEI submissions and requests</p>
                </div>

                {totalPending > 0 && (
                    <InfoBox type="warning" className="mb-6">
                        <p>
                            You have <strong>{totalPending}</strong> pending request{totalPending > 1 ? 's' : ''} to review.
                        </p>
                    </InfoBox>
                )}

                <AGGridViewer
                    rowData={heis}
                    columnDefs={columnDefs}
                    height="600px"
                    quickFilterPlaceholder="Search by HEI name or code..."
                    paginationPageSize={25}
                    paginationPageSizeSelector={[25, 50, 100]}
                />
            </div>
        </AdminLayout>
    );
}
