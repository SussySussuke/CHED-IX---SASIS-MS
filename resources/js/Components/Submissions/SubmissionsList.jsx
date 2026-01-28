import React, { useState, useMemo } from 'react';
import { useTheme } from '../../Context/ThemeContext';
import { useSubmissionFilters } from '../../Hooks/useSubmissionFilters';
import { useSubmissionData } from '../../Hooks/useSubmissionData';
import { useCompareModal } from '../../Hooks/useCompareModal';
import EmptyState from '../Common/EmptyState';
import SubmissionFilters from './SubmissionFilters';
import SubmissionExpand from './SubmissionExpand';
import CompareModal from './CompareModal';
import Pagination from '../Common/Pagination';

/**
 * Main component for displaying and managing submissions list
 * Supports both HEI and Admin modes with filtering, expansion, and comparison features
 */
export default function SubmissionsList({
    mode = 'hei', // 'hei' or 'admin'
    submissions,
    academicYears,
    selectedAnnex,
    fetchDataUrl, // URL pattern for fetching batch data
    onApprove, // Admin only
    onReject, // Admin only
    onCancel, // HEI only
    showCreateButton = false,
    createButtonUrl,
    selectedYear // Add selectedYear prop
}) {
    const { isDark } = useTheme();

    // Use custom hooks for state management
    const {
        filterStatus,
        setFilterStatus,
        filterYear,
        setFilterYear,
        filterAnnex,
        handleAnnexChange,
        annexOptions,
        filteredSubmissions
    } = useSubmissionFilters({ mode, submissions, selectedAnnex });

    const {
        expandedBatches,
        batchData,
        loadingBatch,
        toggleBatch
    } = useSubmissionData({ fetchDataUrl });

    const {
        compareModal,
        openCompareModal,
        closeCompareModal
    } = useCompareModal({ submissions, fetchDataUrl });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Calculate pagination
    const totalItems = filteredSubmissions.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Get current page items
    const paginatedSubmissions = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredSubmissions.slice(startIndex, endIndex);
    }, [filteredSubmissions, currentPage, itemsPerPage]);

    // Reset to page 1 when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, filterYear, filterAnnex]);

    // Check if we have any data
    const hasAnyData = submissions.length > 0;
    const hasFilteredData = filteredSubmissions.length > 0;

    return (
        <>
            {/* Filters Section */}
            <SubmissionFilters
                mode={mode}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                filterYear={filterYear}
                setFilterYear={setFilterYear}
                filterAnnex={filterAnnex}
                handleAnnexChange={handleAnnexChange}
                annexOptions={annexOptions}
                academicYears={academicYears}
                showCreateButton={showCreateButton}
                createButtonUrl={createButtonUrl}
                selectedYear={selectedYear}
            />

            {/* Submissions List */}
            <div className="space-y-2">
                {!hasAnyData ? (
                    <EmptyState
                        title="No Submissions Yet"
                        message="You haven't created any submissions yet. Get started by creating your first submission."
                        buttonText={showCreateButton ? "Create Your First Submission" : undefined}
                        buttonHref={showCreateButton ? `/hei/annex-${filterAnnex.toLowerCase()}/submit` : undefined}
                    />
                ) : !hasFilteredData ? (
                    <EmptyState
                        title="No Matching Submissions"
                        message="No submissions match your current filters. Try adjusting the filters above."
                    />
                ) : (
                    paginatedSubmissions.map((submission) => {
                        const key = `${submission.annex}-${submission.batch_id}`;
                        const isExpanded = expandedBatches[key];
                        const isLoading = loadingBatch === key;

                        return (
                            <SubmissionExpand
                                key={key}
                                submission={submission}
                                mode={mode}
                                isExpanded={isExpanded}
                                batchData={batchData}
                                isLoading={isLoading}
                                isDark={isDark}
                                onToggle={toggleBatch}
                                onApprove={onApprove}
                                onReject={onReject}
                                onCompare={openCompareModal}
                            />
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {hasFilteredData && totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalItems}
                />
            )}

            {/* Compare Modal (Admin only) */}
            {mode === 'admin' && (
                <CompareModal
                    compareModal={compareModal}
                    isDark={isDark}
                    onClose={closeCompareModal}
                    onApprove={onApprove}
                />
            )}
        </>
    );
}
