import { useState } from 'react';

/**
 * Hook to manage batch data fetching and expansion state
 * Handles expandedBatches, batchData, and loading states
 */
export function useSubmissionData({ fetchDataUrl }) {
    const [expandedBatches, setExpandedBatches] = useState({});
    const [batchData, setBatchData] = useState({});
    const [loadingBatch, setLoadingBatch] = useState(null);

    const toggleBatch = async (batchId, annex) => {
        const key = `${annex}-${batchId}`;

        if (expandedBatches[key]) {
            // Collapse the batch
            setExpandedBatches(prev => ({ ...prev, [key]: false }));
        } else {
            // Expand the batch
            setExpandedBatches(prev => ({ ...prev, [key]: true }));

            // Fetch data if not already cached
            if (!batchData[key]) {
                setLoadingBatch(key);
                try {
                    const url = fetchDataUrl.replace(':annex', annex).replace(':batchId', batchId);
                    const response = await fetch(url);
                    const data = await response.json();
                    setBatchData(prev => ({ ...prev, [key]: data }));
                } catch (error) {
                    console.error('Failed to fetch batch data:', error);
                } finally {
                    setLoadingBatch(null);
                }
            }
        }
    };

    return {
        expandedBatches,
        batchData,
        loadingBatch,
        toggleBatch
    };
}
