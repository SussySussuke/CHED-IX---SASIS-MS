import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IoClose, IoSearch, IoCheckmarkCircle, IoCloseCircle, IoChevronForward } from 'react-icons/io5';
import { router } from '@inertiajs/react';

// ─── Shimmer skeleton while breakdown is loading ──────────────────────────────
const BreakdownSkeleton = () => (
    <div className="space-y-2 animate-pulse">
        {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-1 py-1.5">
                <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                <div
                    className="flex-1 h-3 rounded bg-gray-200 dark:bg-gray-700"
                    style={{ width: `${50 + (i % 5) * 10}%` }}
                />
                <div className="w-10 h-3 rounded bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
            </div>
        ))}
    </div>
);

// ─── Single form row in the breakdown list ────────────────────────────────────
const FormRow = ({ form, heiId, selectedYear }) => (
    <button
        onClick={() => router.visit(`/admin/submissions/${heiId}?year=${selectedYear}`)}
        className="w-full flex items-center gap-3 px-1 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
    >
        {form.completed ? (
            <IoCheckmarkCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        ) : (
            <IoCloseCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
        )}
        <span className={`flex-1 text-xs leading-snug truncate ${
            form.completed
                ? 'text-gray-700 dark:text-gray-300'
                : 'text-gray-500 dark:text-gray-400'
        }`}>
            {form.name}
        </span>
        <span className={`text-xs font-medium flex-shrink-0 ${
            form.completed
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-500 dark:text-red-400'
        }`}>
            {form.completed ? 'Done' : 'Missing'}
        </span>
    </button>
);

// ─── Breakdown panel (used in both mini-modal and split-panel) ────────────────
const BreakdownPanel = ({ hei, selectedYear, onClose }) => {
    const [state, setState] = useState({ loading: true, data: null, error: null });

    useEffect(() => {
        if (!hei) return;
        setState({ loading: true, data: null, error: null });

        const controller = new AbortController();

        fetch(`/admin/submissions/${hei.id}/form-breakdown?year=${selectedYear}`, {
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then(data => setState({ loading: false, data, error: null }))
            .catch(err => {
                if (err.name === 'AbortError') return;
                setState({ loading: false, data: null, error: 'Failed to load form data.' });
            });

        return () => controller.abort();
    }, [hei?.id, selectedYear]);

    const completedCount = state.data?.breakdown?.filter(f => f.completed).length ?? 0;
    const totalCount     = state.data?.breakdown?.length ?? 0;
    const pct            = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* Panel header */}
            <div className="flex-shrink-0 px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                            {hei?.name ?? '—'}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {hei?.code} · AY {selectedYear}
                        </p>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            <IoClose className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Progress summary */}
                {!state.loading && state.data && (
                    <div className="mt-3">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {completedCount} / {totalCount} forms submitted
                            </span>
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                {pct}%
                            </span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Form list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
                {state.loading && <BreakdownSkeleton />}

                {state.error && (
                    <p className="text-xs text-red-500 text-center py-6">{state.error}</p>
                )}

                {!state.loading && state.data && (
                    <div className="space-y-0.5">
                        {state.data.breakdown.map(form => (
                            <FormRow
                                key={form.code}
                                form={form}
                                heiId={hei.id}
                                selectedYear={selectedYear}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer — link to full submissions page */}
            {!state.loading && state.data && (
                <div className="flex-shrink-0 px-5 py-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => router.visit(`/admin/submissions/${hei.id}`)}
                        className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                        View full submission history
                        <IoChevronForward className="w-3 h-3" />
                    </button>
                </div>
            )}
        </div>
    );
};

// ─── Mini-modal (widget click, no "View All" modal open) ──────────────────────
const MiniModal = ({ hei, selectedYear, onClose }) => {
    const overlayRef = useRef(null);

    const handleOverlayClick = useCallback(
        (e) => { if (e.target === overlayRef.current) onClose(); },
        [onClose]
    );

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
        >
            <div
                className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm flex flex-col overflow-hidden"
                style={{ maxHeight: '80vh' }}
            >
                <BreakdownPanel hei={hei} selectedYear={selectedYear} onClose={onClose} />
            </div>
        </div>
    );
};

// ─── Shared helpers ───────────────────────────────────────────────────────────
const getTypeColor = (type) => {
    switch (type) {
        case 'SUC':     return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
        case 'LUC':     return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
        case 'Private': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
        default:        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
    }
};

const getMedalColor = (index) => {
    if (index === 0) return 'text-yellow-500';
    if (index === 1) return 'text-gray-400';
    if (index === 2) return 'text-orange-600';
    return 'text-gray-300';
};

const getMedalEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
};

// ─── HEI card ─────────────────────────────────────────────────────────────────
const HEICard = ({ hei, index, showRank = true, onClick, isActive = false }) => (
    <div
        onClick={() => onClick(hei)}
        className={`group relative bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800 rounded-lg p-3 border transition-all cursor-pointer ${
            isActive
                ? 'border-blue-400 dark:border-blue-500 shadow-md ring-1 ring-blue-300/60 dark:ring-blue-600/60'
                : 'border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600'
        }`}
    >
        {showRank && (
            <div className="absolute -left-2 -top-2 w-7 h-7 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                <span className={`text-xs font-bold ${getMedalColor(index)}`}>
                    {index < 3 ? getMedalEmoji(index) : `#${index + 1}`}
                </span>
            </div>
        )}

        <div className={showRank ? 'ml-3' : ''}>
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {hei.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{hei.code}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${getTypeColor(hei.type)}`}>
                    {hei.type}
                </span>
            </div>

            <div className="flex items-center justify-between mt-2">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {hei.completedForms}/{hei.totalForms} forms
                        </span>
                        {hei.missingForms > 0 && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                {hei.missingForms} missing
                            </span>
                        )}
                    </div>
                    <div className="relative bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 rounded-full ${
                                hei.completionRate === 100
                                    ? 'bg-gradient-to-r from-green-400 to-green-600'
                                    : hei.completionRate >= 80
                                    ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                                    : 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                            }`}
                            style={{ width: `${hei.completionRate}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </div>
                    </div>
                </div>
                <span className="ml-3 text-base font-bold text-gray-900 dark:text-white">
                    {hei.completionRate}%
                </span>
            </div>
        </div>
    </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const TopPerformingHEIs = ({ heis, allHEIs = [], selectedYear }) => {
    const [showModal, setShowModal]       = useState(false);
    const [searchTerm, setSearchTerm]     = useState('');
    const [activeHei, setActiveHei]       = useState(null);  // split-panel target
    const [miniModalHei, setMiniModalHei] = useState(null);  // widget-click target
    const [panelVisible, setPanelVisible] = useState(false); // drives CSS transition

    // Delay visibility flag by one frame so the CSS transition actually fires
    useEffect(() => {
        if (activeHei) {
            requestAnimationFrame(() => setPanelVisible(true));
        } else {
            setPanelVisible(false);
        }
    }, [activeHei]);

    const filteredHEIs = (allHEIs.length > 0 ? allHEIs : heis).filter(hei =>
        hei.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hei.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleWidgetCardClick = (hei) => setMiniModalHei(hei);

    const handleModalCardClick = (hei) => {
        // Toggle: clicking same card again collapses the panel
        setActiveHei(prev => (prev?.id === hei.id ? null : hei));
    };

    const handleCloseModal = () => {
        setActiveHei(null);
        setPanelVisible(false);
        setShowModal(false);
    };

    return (
        <>
            {/* ── Widget ──────────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Top Performing HEIs</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Highest completion rates</p>
                </div>

                <div className="p-6 space-y-3 overflow-y-auto flex-1">
                    {heis.map((hei, index) => (
                        <HEICard key={hei.id} hei={hei} index={index} onClick={handleWidgetCardClick} />
                    ))}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 flex-shrink-0">
                    <button
                        onClick={() => setShowModal(true)}
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                        View all HEIs →
                    </button>
                </div>
            </div>

            {/* ── Mini-modal (widget card click) ───────────────────────────── */}
            {miniModalHei && (
                <MiniModal
                    hei={miniModalHei}
                    selectedYear={selectedYear}
                    onClose={() => setMiniModalHei(null)}
                />
            )}

            {/* ── Full modal (View All HEIs) ───────────────────────────────── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-gray-900/60 dark:bg-gray-900/75"
                        onClick={handleCloseModal}
                    />

                    {/*
                        Split-panel shell.
                        max-width CSS transition: ~42rem (list only) → ~72rem (list + panel).
                        The right pane slides in via width + opacity — pure CSS transitions,
                        no animation library, GPU-composited.
                    */}
                    <div
                        className="relative flex overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full transition-all duration-300 ease-in-out"
                        style={{
                            maxWidth: activeHei ? '64rem' : '42rem',
                            maxHeight: '85vh',
                        }}
                    >
                        {/* ── Left pane: HEI list ──────────────────────── */}
                        <div
                            className="flex flex-col overflow-hidden flex-1 min-w-0 transition-all duration-300 ease-in-out"
                        >
                            {/* Header */}
                            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        All HEIs Performance
                                    </h3>
                                    <button
                                        onClick={handleCloseModal}
                                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                                    >
                                        <IoClose className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="mt-4 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <IoSearch className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search by HEI name or code..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Scrollable list */}
                            <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
                                {filteredHEIs.length > 0 ? (
                                    <div className="space-y-3">
                                        {filteredHEIs.map((hei, index) => (
                                            <HEICard
                                                key={hei.id}
                                                hei={hei}
                                                index={index}
                                                onClick={handleModalCardClick}
                                                isActive={activeHei?.id === hei.id}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            No HEIs found matching "{searchTerm}"
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-700/30 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>
                                        Showing {filteredHEIs.length} of {(allHEIs.length > 0 ? allHEIs : heis).length} HEIs
                                    </span>
                                    <button
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium text-sm"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── Vertical divider ──────────────────────────── */}
                        <div
                            className="flex-shrink-0 w-px bg-gray-200 dark:bg-gray-700 self-stretch transition-all duration-300"
                            style={{
                                opacity: panelVisible ? 1 : 0,
                                transform: `scaleY(${panelVisible ? 1 : 0.5})`,
                                transformOrigin: 'center',
                            }}
                        />

                        {/* ── Right pane: breakdown ─────────────────────── */}
                        <div
                            className="flex-shrink-0 flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
                            style={{
                                width: panelVisible ? '320px' : '0px',
                                opacity: panelVisible ? 1 : 0,
                            }}
                        >
                            {/* Kept mounted while activeHei exists so the fetch
                                doesn't restart; visibility is width/opacity only */}
                            {activeHei && (
                                <BreakdownPanel
                                    hei={activeHei}
                                    selectedYear={selectedYear}
                                    onClose={() => setActiveHei(null)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TopPerformingHEIs;
