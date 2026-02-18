import React, { useState, useEffect, useCallback } from 'react';
import { IoClose, IoArrowForward, IoRefresh } from 'react-icons/io5';
import AGGridViewer from '../Common/AGGridViewer';

/**
 * RecordsModal — generic reusable modal for viewing and optionally recategorizing records.
 *
 * USE CASES:
 *   - View-only: pass fetchUrl + columnDefs, leave recategorizeUrl null
 *   - View + recategorize: also pass recategorizeUrl + categoryOptions
 *
 * Props:
 *   isOpen            {boolean}   visibility
 *   onClose           {function}  close handler
 *   onRecategorized   {function}  called after a successful recategorize (parent refreshes grid)
 *
 *   title             {string}    modal heading
 *   subtitle          {string}    secondary heading
 *   categoryLabel     {string}    badge label shown next to the title
 *   isMiscellaneous   {boolean}   yellow accent + hint text (uncategorized mode)
 *   isTotal           {boolean}   "all records" mode — hides recategorize column
 *
 *   fetchUrl          {string}    GET endpoint → { records: [...] }
 *   recategorizeUrl   {string}    PATCH endpoint → { record_type, record_id, category }
 *                                 Pass null to disable recategorization entirely.
 *
 *   columnDefs        {Array}     AG Grid column definitions for the records table
 *   categoryOptions   {Array}     [{ value, label }] used in the move-to dropdown
 *
 *   recordTypeField   {string}    field in each record holding its source type (default: 'record_type')
 *   recordIdField     {string}    field in each record holding its id (default: 'id')
 */
const RecordsModal = ({
  isOpen,
  onClose,
  onRecategorized,

  title = '',
  subtitle = '',
  categoryLabel = '',
  isMiscellaneous = false,
  isTotal = false,

  fetchUrl,
  recategorizeUrl = null,

  columnDefs = [],
  categoryOptions = [],

  recordTypeField = 'record_type',
  recordIdField = 'id',
}) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Per-row state: { [rowKey]: { saving, selected, saved, error } }
  const [rowStates, setRowStates] = useState({});

  const canRecategorize = !!recategorizeUrl;

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchRecords = useCallback(async () => {
    if (!fetchUrl) return;
    setLoading(true);
    setError(null);
    setRowStates({});

    try {
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setRecords(data.records ?? data.programs ?? []);
    } catch (err) {
      setError(err.message);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [fetchUrl]);

  useEffect(() => {
    if (isOpen) fetchRecords();
    else {
      setRecords([]);
      setError(null);
      setRowStates({});
    }
  }, [isOpen, fetchRecords]);

  // ── Recategorize ─────────────────────────────────────────────────────────

  const handleRecategorize = async (record, newCategory) => {
    const rowKey = `${record[recordTypeField]}_${record[recordIdField]}`;

    setRowStates(prev => ({
      ...prev,
      [rowKey]: { ...prev[rowKey], saving: true, selected: newCategory, error: null },
    }));

    try {
      const res = await fetch(recategorizeUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
        },
        body: JSON.stringify({
          record_type: record[recordTypeField],
          record_id:   record[recordIdField],
          category:    newCategory,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `Server error: ${res.status}`);
      }

      setRowStates(prev => ({
        ...prev,
        [rowKey]: { saving: false, selected: newCategory, saved: true, error: null },
      }));

      onRecategorized?.();

      // Refresh list immediately when in misc mode so moved rows disappear
      if (isMiscellaneous) await fetchRecords();

    } catch (err) {
      setRowStates(prev => ({
        ...prev,
        [rowKey]: { ...prev[rowKey], saving: false, error: err.message },
      }));
    }
  };

  // ── Column defs (append action column when recategorize is on) ────────────

  const gridColumns = React.useMemo(() => {
    if (!canRecategorize || categoryOptions.length === 0) return columnDefs;

    const actionCol = {
      headerName: 'Move to Category',
      field:      '__action',
      width:      230,
      sortable:   false,
      filter:     false,
      resizable:  false,
      pinned:     'right',
      cellRenderer: (params) => {
        const record = params.data;
        const rowKey = `${record[recordTypeField]}_${record[recordIdField]}`;
        const state  = rowStates[rowKey] ?? {};

        if (state.saved) {
          return (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
              <IoArrowForward className="w-3 h-3" />
              Moved to {categoryOptions.find(o => o.value === state.selected)?.label ?? state.selected}
            </span>
          );
        }

        return (
          <div className="flex items-center gap-2 h-full">
            <select
              disabled={state.saving}
              defaultValue=""
              onChange={(e) => { if (e.target.value) handleRecategorize(record, e.target.value); }}
              className="flex-1 text-xs border border-gray-300 dark:border-gray-600 rounded
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500
                         disabled:opacity-50"
            >
              <option value="" disabled>Select category…</option>
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {state.saving && (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            )}
          </div>
        );
      },
    };

    return [...columnDefs, actionCol];
  // rowStates triggers re-render of saved/saving cells
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnDefs, canRecategorize, categoryOptions, rowStates]);

  // ── Accent colours ────────────────────────────────────────────────────────

  const accentBg    = isMiscellaneous
    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
  const accentText  = isMiscellaneous
    ? 'text-yellow-800 dark:text-yellow-200'
    : 'text-blue-800 dark:text-blue-200';
  const accentBadge = isMiscellaneous
    ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700'
    : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700';

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl
                          max-w-7xl w-full border border-gray-200 dark:border-gray-700">

            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h3>
                  {categoryLabel && (
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${accentBadge}`}>
                      {categoryLabel}
                    </span>
                  )}
                </div>
                {subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                <button
                  onClick={fetchRecords}
                  title="Refresh"
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                             rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <IoRefresh className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                             rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <IoClose className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Info banner */}
            {canRecategorize && (
              <div className={`px-5 py-3 border-b ${accentBg}`}>
                <p className={`text-sm ${accentText}`}>
                  {isMiscellaneous
                    ? 'These activities did not match any keyword category. Use the "Move to Category" column to manually assign them.'
                    : 'Use the "Move to Category" column to manually override keyword-matched categories.'}
                </p>
              </div>
            )}

            {/* Content */}
            <div className="p-5">
              {loading ? (
                <div className="flex items-center justify-center py-16 gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  <span className="text-gray-600 dark:text-gray-400">Loading records…</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                                rounded-lg p-4 text-red-700 dark:text-red-400 text-sm">
                  Error: {error}
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                  No records found.
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">{records.length}</span>
                    {' '}record{records.length !== 1 ? 's' : ''}
                  </p>
                  <AGGridViewer
                    rowData={records}
                    columnDefs={gridColumns}
                    height="500px"
                    paginationPageSize={25}
                    enableQuickFilter={true}
                    quickFilterPlaceholder="Search records…"
                    gridOptions={{
                      // Override fixed rowHeight so category tags can wrap per-row.
                      // Each tag is ~28px; base row is 40px. Falls back to 40 for rows
                      // with 0-1 categories (single tag fits in default height).
                      rowHeight: undefined,
                      getRowHeight: (params) => {
                        const cats = params.data?.assigned_categories;
                        if (!cats || cats.length <= 1) return 40;
                        return cats.length * 28 + 12; // 28px per tag + padding
                      },
                    }}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end px-5 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm
                           rounded-lg transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RecordsModal;
