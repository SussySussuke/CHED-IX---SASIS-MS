import { useState } from 'react';

/**
 * Hook to manage compare modal state and data fetching
 * Handles modal state, loading, and fetching comparison data
 */
export function useCompareModal({ submissions, fetchDataUrl }) {
    const [compareModal, setCompareModal] = useState(null);

    const openCompareModal = async (submission) => {
        const publishedBatch = submissions.find(
            s => s.annex === submission.annex &&
                 s.academic_year === submission.academic_year &&
                 s.status === 'published'
        );

        if (!publishedBatch) {
            alert('No published batch found to compare with.');
            return;
        }

        setCompareModal({ loading: true });
        try {
            const url1 = fetchDataUrl.replace(':annex', submission.annex).replace(':batchId', submission.batch_id);
            const url2 = fetchDataUrl.replace(':annex', publishedBatch.annex).replace(':batchId', publishedBatch.batch_id);

            const [newResponse, oldResponse] = await Promise.all([
                fetch(url1),
                fetch(url2)
            ]);

            const newData = await newResponse.json();
            const oldData = await oldResponse.json();

            setCompareModal({
                loading: false,
                newBatch: { ...submission, data: newData },
                oldBatch: { ...publishedBatch, data: oldData }
            });
        } catch (error) {
            console.error('Failed to fetch comparison data:', error);
            setCompareModal(null);
        }
    };

    const closeCompareModal = () => {
        setCompareModal(null);
    };

    return {
        compareModal,
        openCompareModal,
        closeCompareModal
    };
}
