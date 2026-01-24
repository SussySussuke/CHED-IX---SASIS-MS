import { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { ANNEX_NAMES } from '../Config/formConfig';

/**
 * Hook to manage submission filtering logic
 * Handles filter state, annex options, and filtered submissions
 */
export function useSubmissionFilters({ mode, submissions, selectedAnnex }) {
    // Get persisted annex from sessionStorage or use selectedAnnex prop
    const getPersistedAnnex = () => {
        if (mode === 'hei') {
            const stored = sessionStorage.getItem('selectedAnnex');
            return stored || selectedAnnex || 'A';
        }
        return selectedAnnex || 'all';
    };

    const [filterStatus, setFilterStatus] = useState('all');
    const [filterYear, setFilterYear] = useState('');
    const [filterAnnex, setFilterAnnex] = useState(getPersistedAnnex());

    // Build annex options from available data
    const annexOptions = useMemo(() => {
        if (mode === 'admin') {
            // Admin: Extract unique annexes from submissions
            const uniqueAnnexes = [...new Set(submissions.map(s => s.annex))];
            // Separate SUMMARY from other annexes
            const hasSummary = uniqueAnnexes.includes('SUMMARY');
            const otherAnnexes = uniqueAnnexes.filter(a => a !== 'SUMMARY').sort();
            // Return SUMMARY first (if it exists), then others alphabetically
            return hasSummary ? ['SUMMARY', ...otherAnnexes] : otherAnnexes;
        } else {
            // HEI: Build from ANNEX_NAMES (which has ALL annexes A-O)
            const standardAnnexes = Object.keys(ANNEX_NAMES).sort();
            return ['SUMMARY', ...standardAnnexes];  // Always include SUMMARY first
        }
    }, [mode, submissions]);

    // Filter submissions based on current filters
    const filteredSubmissions = useMemo(() => {
        return submissions.filter(sub => {
            if (filterStatus !== 'all' && sub.status !== filterStatus) return false;
            if (filterYear && !sub.academic_year.includes(filterYear)) return false;
            if (filterAnnex !== 'all' && sub.annex !== filterAnnex) return false;
            return true;
        });
    }, [submissions, filterStatus, filterYear, filterAnnex]);

    // Handle annex change with session persistence for HEI mode
    const handleAnnexChange = (newAnnex) => {
        if (mode === 'hei') {
            setFilterAnnex(newAnnex);
            sessionStorage.setItem('selectedAnnex', newAnnex);
            router.get('/hei/submissions/history', { annex: newAnnex }, {
                preserveState: true,
                preserveScroll: true
            });
        } else {
            setFilterAnnex(newAnnex);
        }
    };

    return {
        filterStatus,
        setFilterStatus,
        filterYear,
        setFilterYear,
        filterAnnex,
        handleAnnexChange,
        annexOptions,
        filteredSubmissions
    };
}
