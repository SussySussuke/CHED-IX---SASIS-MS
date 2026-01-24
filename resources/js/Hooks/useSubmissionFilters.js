import { useState, useMemo, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { ANNEX_NAMES } from '../Config/formConfig';

/**
 * Hook to manage submission filtering logic
 * Handles filter state, annex options, and filtered submissions
 */
export function useSubmissionFilters({ mode, submissions, selectedAnnex }) {
    const { url } = usePage();
    
    // Parse URL parameters
    const getUrlParams = () => {
        const params = new URLSearchParams(window.location.search);
        return {
            annex: params.get('annex'),
            year: params.get('year'),
            status: params.get('status')
        };
    };

    // Get persisted annex from URL, sessionStorage, or use selectedAnnex prop
    const getPersistedAnnex = () => {
        const urlParams = getUrlParams();
        if (urlParams.annex) {
            return urlParams.annex;
        }
        if (mode === 'hei') {
            const stored = sessionStorage.getItem('selectedAnnex');
            // Default to 'all' for HEI instead of 'A'
            return stored || selectedAnnex || 'all';
        }
        return selectedAnnex || 'all';
    };

    const urlParams = getUrlParams();
    const [filterStatus, setFilterStatus] = useState(urlParams.status || 'all');
    const [filterYear, setFilterYear] = useState(urlParams.year || '');
    const [filterAnnex, setFilterAnnex] = useState(getPersistedAnnex());

    // Update filters when URL changes
    useEffect(() => {
        const params = getUrlParams();
        if (params.status) setFilterStatus(params.status);
        if (params.year) setFilterYear(params.year);
        if (params.annex) setFilterAnnex(params.annex);
    }, [url]);

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
            
            // Build URL with existing filters
            const params = new URLSearchParams();
            params.append('annex', newAnnex);
            if (filterYear) params.append('year', filterYear);
            if (filterStatus !== 'all') params.append('status', filterStatus);
            
            router.get('/hei/submissions/history', Object.fromEntries(params), {
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
