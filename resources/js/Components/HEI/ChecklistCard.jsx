import React from 'react';
import { Link } from '@inertiajs/react';
import { IoCheckmarkCircle, IoTime, IoRemoveCircle } from 'react-icons/io5';

const ChecklistCard = ({ annex, name, status, lastUpdated, selectedYear }) => {
    const statusConfig = {
        completed: {
            badge: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300',
            icon: <IoCheckmarkCircle className="w-5 h-5" />,
            text: 'Completed',
        },
        pending: {
            badge: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300',
            icon: <IoTime className="w-5 h-5" />,
            text: 'Under Review',
        },
        not_started: {
            badge: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
            icon: <IoRemoveCircle className="w-5 h-5" />,
            text: 'Not Started',
        },
    };

    const config = statusConfig[status] || statusConfig.not_started;

    // Determine filter URL based on status
    const getFilterUrl = () => {
        const baseUrl = '/hei/submissions/history';
        const params = new URLSearchParams();

        params.append('annex', annex);
        params.append('year', selectedYear);

        // Map status to filter value
        if (status === 'completed') {
            // Don't add status filter for completed - shows all published/submitted
        } else if (status === 'pending') {
            params.append('status', 'request');
        } else {
            params.append('status', 'draft');
        }

        return `${baseUrl}?${params.toString()}`;
    };

    return (
        <Link
            href={getFilterUrl()}
            className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        {annex === 'SUMMARY' ? 'SUMMARY' : `ANNEX ${annex}`}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {name}
                    </h3>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.badge}`}>
                    {config.icon}
                    {config.text}
                </span>

                {lastUpdated && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(lastUpdated).toLocaleDateString()}
                    </span>
                )}
            </div>
        </Link>
    );
};

export default ChecklistCard;
