import { useState, useMemo, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { FORM_NAMES, getAllAnnexCodes } from '../Config/formConfig';
import { MER_FORMS, SUMMARY_FORM } from '../Config/nonAnnexForms';

/**
 * Hook to manage submission filtering logic
 * Handles filter state, annex options (including MER forms), and filtered submissions
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

    // Custom sort function for annex keys that handles insertion notation (e.g., C-1, I-1)
    const sortAnnexKeys = (keys) => {
        return keys.sort((a, b) => {
            // Extract base letter and suffix (if any)
            const parseAnnex = (key) => {
                const match = key.match(/^([A-Z])(-\d+)?$/);
                if (!match) return { base: key, suffix: 0 };
                return {
                    base: match[1],
                    suffix: match[2] ? parseInt(match[2].substring(1)) : 0
                };
            };
            
            const aParsed = parseAnnex(a);
            const bParsed = parseAnnex(b);
            
            // Compare base letters first
            if (aParsed.base !== bParsed.base) {
                return aParsed.base.localeCompare(bParsed.base);
            }
            
            // If base letters are the same, compare suffixes
            // Suffix 0 (no suffix) comes before any numbered suffix
            return aParsed.suffix - bParsed.suffix;
        });
    };

    // Build annex options from available data
    const annexOptions = useMemo(() => {
        if (mode === 'admin') {
            // Admin: Extract unique form codes from submissions
            const uniqueForms = [...new Set(submissions.map(s => s.annex))];
            
            // Separate and sort
            const summary = uniqueForms.includes('SUMMARY') ? ['SUMMARY'] : [];
            const merForms = uniqueForms.filter(f => MER_FORMS[f]);
            const annexes = sortAnnexKeys(
                uniqueForms.filter(f => f !== 'SUMMARY' && !MER_FORMS[f])
            );
            
            return [...summary, ...merForms, ...annexes];
        } else {
            // HEI: Show all possible forms
            const allForms = ['SUMMARY'];
            
            // Add MER forms
            Object.keys(MER_FORMS).forEach(code => allForms.push(code));
            
            // Add annexes
            const standardAnnexes = sortAnnexKeys(getAllAnnexCodes());
            allForms.push(...standardAnnexes);
            
            return allForms;
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
