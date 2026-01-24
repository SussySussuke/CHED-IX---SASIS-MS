import React from 'react';
import { renderBatchContent } from './renderers';

/**
 * Modal for comparing published and requested submission data
 * Shows side-by-side comparison of old (published) vs new (request) data
 */
export default function CompareModal({
    compareModal,
    isDark,
    onClose,
    onApprove
}) {
    if (!compareModal) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black bg-opacity-50"
                    onClick={onClose}
                ></div>

                {/* Modal Content */}
                <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
                    {compareModal.loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading comparison...</p>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Compare: Annex {compareModal.newBatch.annex} - {compareModal.newBatch.academic_year}
                                </h2>
                            </div>

                            {/* Comparison Content */}
                            <div className="p-6 overflow-y-auto max-h-[70vh]">
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Published (Old) Version */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
                                                Published
                                            </span> Current
                                        </h3>
                                        {renderBatchContent(
                                            compareModal.oldBatch.annex,
                                            compareModal.oldBatch.data,
                                            isDark
                                        )}
                                    </div>

                                    {/* Request (New) Version */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300">
                                                Request
                                            </span> New
                                        </h3>
                                        {renderBatchContent(
                                            compareModal.newBatch.annex,
                                            compareModal.newBatch.data,
                                            isDark
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded hover:bg-gray-400"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        onClose();
                                        onApprove(compareModal.newBatch.id, compareModal.newBatch.annex);
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Approve Request
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
