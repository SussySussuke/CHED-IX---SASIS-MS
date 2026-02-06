import { useState } from 'react';

/**
 * Hook to manage batch data fetching and expansion state
 * Handles expandedBatches, batchData, and loading states
 * 
 * ACCORDION BEHAVIOR: Only ONE batch can be expanded at a time.
 * Opening a new batch automatically closes any previously opened batch.
 * This prevents AG Grid autoHeight row corruption bugs when multiple grids exist.
 */
export function useSubmissionData({ fetchDataUrl }) {
    const [expandedBatch, setExpandedBatch] = useState(null);  // Single expanded batch key (or null)
    const [batchData, setBatchData] = useState({});
    const [loadingBatch, setLoadingBatch] = useState(null);

    // For backwards compatibility, derive expandedBatches object from expandedBatch
    const expandedBatches = expandedBatch ? { [expandedBatch]: true } : {};

    const toggleBatch = async (batchId, annex) => {
        const key = `${annex}-${batchId}`;

        if (expandedBatch === key) {
            // Collapse the currently expanded batch
            setExpandedBatch(null);
        } else {
            // Close any open batch and expand the new one (accordion behavior)
            setExpandedBatch(key);

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
