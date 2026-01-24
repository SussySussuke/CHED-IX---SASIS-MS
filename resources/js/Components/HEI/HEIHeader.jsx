import React from 'react';
import { router } from '@inertiajs/react';

const HEIHeader = ({ hei, academicYears, selectedYear, onYearChange }) => {
    const handleYearChange = (e) => {
        const newYear = e.target.value;
        if (onYearChange) {
            onYearChange(newYear);
        } else {
            // Default behavior: reload page with new year parameter
            router.get(window.location.pathname, { year: newYear }, {
                preserveState: false,
                preserveScroll: true,
            });
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-white">UII:</span>
                    <span>{hei.uii}</span>
                    <span className="text-gray-400 dark:text-gray-600">•</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{hei.type}</span>
                    <span className="text-gray-400 dark:text-gray-600">•</span>
                    <span className="font-semibold text-gray-900 dark:text-white">AY</span>
                    <select
                        value={selectedYear}
                        onChange={handleYearChange}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {academicYears.map(year => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default HEIHeader;
