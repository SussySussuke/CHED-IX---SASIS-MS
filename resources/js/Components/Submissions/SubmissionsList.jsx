import React from 'react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import { useDarkMode } from '../../Hooks/useDarkMode';
import { useSubmissionFilters } from '../../Hooks/useSubmissionFilters';
import { useSubmissionData } from '../../Hooks/useSubmissionData';
import { useCompareModal } from '../../Hooks/useCompareModal';
import { HOT_TABLE_DARK_MODE_STYLES } from '../../Utils/hotTableStyles';
import EmptyState from '../Common/EmptyState';
import SubmissionFilters from './SubmissionFilters';
import SubmissionExpand from './SubmissionExpand';
import CompareModal from './CompareModal';

registerAllModules();

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
    createButtonUrl
}) {
    const isDark = useDarkMode();

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

    // Check if we have any data
    const hasAnyData = submissions.length > 0;
    const hasFilteredData = filteredSubmissions.length > 0;

    return (
        <>
            <style>{HOT_TABLE_DARK_MODE_STYLES}</style>

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
                    filteredSubmissions.map((submission) => {
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
