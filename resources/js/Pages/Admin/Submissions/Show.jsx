import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import SubmissionsList from '../../../Components/Submissions/SubmissionsList';

export default function Show({ hei, submissions, academicYears }) {
    const handleApprove = (id, annexType) => {
        if (confirm('Approve this request? The current published batch will be overwritten and its remarks will be archived.')) {
            router.post(`/admin/submissions/${id}/approve`, { annex_type: annexType });
        }
    };

    const handleReject = (id, annexType) => {
        const reason = prompt('Reason for rejection (optional):');
        if (reason !== null) {
            router.post(`/admin/submissions/${id}/reject`, {
                annex_type: annexType,
                rejection_reason: reason
            });
        }
    };

    const pendingCount = submissions.filter(s => s.status === 'request').length;

    return (
        <AdminLayout title={`Submissions - ${hei.name}`} pendingCount={pendingCount}>
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Link
                        href="/admin/submissions"
                        className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
                    >
                        ← Back to HEI List
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{hei.name}</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Code: {hei.code}</p>
                </div>

                <SubmissionsList
                    mode="admin"
                    submissions={submissions}
                    academicYears={academicYears}
                    fetchDataUrl="/admin/submissions/:annex/:batchId/data"
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            </div>
        </AdminLayout>
    );
}
