import React from 'react';
import { 
    IoPlaySkipBack, 
    IoPlaySkipForward, 
    IoChevronBack, 
    IoChevronForward 
} from 'react-icons/io5';

/**
 * AG Grid-style Pagination Component
 * Compact, minimal design matching AG Grid's pagination UI
 * 
 * @param {number} currentPage - Current page number (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Callback when page changes
 * @param {number} itemsPerPage - Items shown per page
 * @param {number} totalItems - Total number of items
 * @param {Array} pageSizeOptions - Available page size options (optional)
 * @param {function} onPageSizeChange - Callback when page size changes (optional)
 */
export default function Pagination({ 
    currentPage, 
    totalPages, 
    onPageChange,
    itemsPerPage,
    totalItems,
    pageSizeOptions = [],
    onPageSizeChange
}) {
    if (totalPages <= 1 && !pageSizeOptions.length) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const handlePageSizeChange = (e) => {
        if (onPageSizeChange) {
            onPageSizeChange(parseInt(e.target.value));
        }
    };

    return (
        <div className="flex items-center justify-between gap-4 px-4 py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            {/* Left: Page Size Selector */}
            <div className="flex items-center gap-2">
                {pageSizeOptions.length > 0 && onPageSizeChange && (
                    <>
                        <label className="text-sm text-gray-600 dark:text-gray-400">
                            Page Size:
                        </label>
                        <select
                            value={itemsPerPage}
                            onChange={handlePageSizeChange}
                            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            {pageSizeOptions.map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </>
                )}
            </div>

            {/* Right: Pagination Controls */}
            <div className="flex items-center gap-4">
                {/* Page Info */}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page <span className="font-medium text-gray-900 dark:text-gray-100">{currentPage}</span> of{' '}
                    <span className="font-medium text-gray-900 dark:text-gray-100">{totalPages}</span>
                </span>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-1">
                    {/* First Page */}
                    <button
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                        title="First Page"
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                    >
                        <IoPlaySkipBack className="w-4 h-4" />
                    </button>

                    {/* Previous Page */}
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        title="Previous Page"
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                    >
                        <IoChevronBack className="w-4 h-4" />
                    </button>

                    {/* Next Page */}
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        title="Next Page"
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                    >
                        <IoChevronForward className="w-4 h-4" />
                    </button>

                    {/* Last Page */}
                    <button
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        title="Last Page"
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                    >
                        <IoPlaySkipForward className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
